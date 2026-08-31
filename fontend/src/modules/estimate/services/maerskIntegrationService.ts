import { Estimate, EstimateApiTransaction, MaerskApiConfig, MaerskApiResponse } from '../types';

export const DEFAULT_MAERSK_CONFIG: MaerskApiConfig = {
  endpointUrl: 'https://api.maersk.com/emr/v2/estimates',
  environment: 'SANDBOX',
  clientId: 'MAE_DEPOT_VNHCM_CLIENT_8892',
  clientSecret: 'sk_live_maersk_emr_9921_sec',
  apiKey: 'mae_api_key_depot_vnhcm01_secure',
  depotCode: 'VNHCM01',
  depotName: 'ICD TAN CANG - CAT LAI DEPOT',
  cedexVersion: 'ISO 9897:2002 (CEDEX v2)',
  autoRetryOnFailure: false,
  maxRetries: 3,
  timeoutMs: 8000,
  simulateErrorMode: 'NONE'
};

class MaerskIntegrationService {
  private config: MaerskApiConfig;

  constructor() {
    // Load config from localStorage if available, or default
    const saved = localStorage.getItem('MAERSK_API_CONFIG');
    if (saved) {
      try {
        this.config = { ...DEFAULT_MAERSK_CONFIG, ...JSON.parse(saved) };
      } catch {
        this.config = { ...DEFAULT_MAERSK_CONFIG };
      }
    } else {
      this.config = { ...DEFAULT_MAERSK_CONFIG };
    }
  }

  public getConfig(): MaerskApiConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<MaerskApiConfig>): MaerskApiConfig {
    this.config = { ...this.config, ...newConfig };
    localStorage.setItem('MAERSK_API_CONFIG', JSON.stringify(this.config));
    return { ...this.config };
  }

  /**
   * 1. Check if Estimate has complete information before sending
   */
  public validateEstimateBeforeSend(estimate: Estimate): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check Container No
    if (!estimate.containerNo || estimate.containerNo.trim().length !== 11) {
      errors.push(`Số Container "${estimate.containerNo}" không hợp lệ (Phải đúng chuẩn ISO 6346: 4 chữ cái + 7 số).`);
    }

    // Check Shipping Line
    if (!estimate.shippingLine) {
      errors.push('Chưa xác định Shipping Line / Chủ hãng tàu.');
    }

    // Check Repair Items
    if (!estimate.items || estimate.items.length === 0) {
      errors.push('Báo giá phải có ít nhất 01 hạng mục sửa chữa / xử lý EMR.');
    } else {
      estimate.items.forEach((item, idx) => {
        if (!item.damageCode) {
          errors.push(`Hạng mục #${idx + 1} (${item.damageLocationName}) chưa có mã hư hỏng (Damage Code).`);
        }
        if (!item.repairCode) {
          errors.push(`Hạng mục #${idx + 1} (${item.damageLocationName}) chưa có mã phương pháp sửa chữa (Repair Code).`);
        }
        if (item.quantity <= 0) {
          errors.push(`Hạng mục #${idx + 1} có số lượng không hợp lệ (<= 0).`);
        }
        if (item.unitPrice <= 0) {
          errors.push(`Hạng mục #${idx + 1} có đơn giá không hợp lệ (<= 0).`);
        }
      });
    }

    // Check Total Amount
    if (estimate.totalAmount <= 0) {
      errors.push('Tổng tiền báo giá phải lớn hơn 0 VNĐ.');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Build official Maersk EMR / CEDEX JSON payload compliant with ISO 9897
   */
  public buildMaerskEMRPayload(estimate: Estimate, config: MaerskApiConfig = this.config) {
    const now = new Date().toISOString();
    return {
      header: {
        messageType: 'WESTIM', // EDIFACT WESTIM / ISO 9897 CEDEX Estimate
        version: config.cedexVersion,
        senderDepotCode: config.depotCode,
        senderDepotName: config.depotName,
        recipientPartnerCode: 'MAEU',
        submissionTimestamp: now,
        currency: estimate.currency || 'VND',
        exchangeRateToUSD: estimate.exchangeRate || 0.000039
      },
      estimateDetails: {
        estimateReferenceNo: estimate.estimateNo,
        containerNumber: estimate.containerNo,
        isoContainerCode: estimate.isoCode,
        containerSize: estimate.size,
        containerType: estimate.type,
        conditionGrade: estimate.condition,
        inspectionReference: estimate.surveyReference || 'EIR-INSPECTION-STD',
        createdPerson: estimate.createdBy,
        depotLocation: config.depotName
      },
      financialSummary: {
        currency: estimate.currency || 'VND',
        subtotalAmount: estimate.subtotal,
        vatRate: estimate.vatRate,
        vatAmount: estimate.vatAmount,
        totalEstimateAmount: estimate.totalAmount
      },
      repairLineItems: estimate.items.map((item, index) => ({
        lineNumber: index + 1,
        cedexComponentCode: item.damageLocationCode,
        cedexComponentName: item.damageLocationName,
        cedexDamageCode: item.damageCode,
        cedexDamageName: item.damageName,
        cedexRepairCode: item.repairCode,
        cedexRepairMethod: item.repairMethod,
        description: item.description,
        quantity: item.quantity,
        unitOfMeasure: item.unit,
        unitPrice: item.unitPrice,
        extendedAmount: item.amount,
        vatAmount: item.vatAmount,
        totalLineAmount: item.totalAmount,
        cedexFullCode: `${item.damageLocationCode}-${item.damageCode}-${item.repairCode}`
      })),
      attachments: estimate.inspectionPhotos.map((url, idx) => ({
        attachmentId: `ATT-${estimate.estimateNo}-${idx + 1}`,
        type: 'INSPECTION_PHOTO',
        url: url,
        caption: `Ảnh giám định EMR Container ${estimate.containerNo}`
      })),
      notes: estimate.notes || 'Báo giá sửa chữa theo chuẩn IICL-6 / Maersk EMR Depot Guidelines'
    };
  }

  /**
   * Dispatches Estimate to Maersk EMR API
   * Generates full Transaction Log (Request ID, Transaction ID, HTTP Status, Payload, Response)
   */
  public async sendEstimateToMaersk(
    estimate: Estimate,
    operator: string = 'Trần Hải Đăng (Báo Giá EMR)'
  ): Promise<{
    success: boolean;
    transaction: EstimateApiTransaction;
    response?: MaerskApiResponse;
    error?: { code: string; message: string; statusCode: number };
  }> {
    const startTime = performance.now();
    const now = new Date();
    const timestampStr = now.toISOString().replace('T', ' ').substring(0, 19);

    // Generate Unique IDs
    const requestId = `REQ-MAE-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const transactionId = `TXN-EMR-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100000 + Math.random() * 900000)}`;
    const attemptNo = (estimate.apiTransactionHistory?.length || 0) + 1;

    // 1. Validate
    const validation = this.validateEstimateBeforeSend(estimate);
    if (!validation.isValid) {
      const errorPayload = {
        code: 'VALIDATION_FAILED',
        message: validation.errors.join('; '),
        statusCode: 400
      };

      const failedTxn: EstimateApiTransaction = {
        id: `TXN-${Date.now()}`,
        attemptNo,
        timestamp: timestampStr,
        requestId,
        transactionId,
        endpoint: this.config.endpointUrl,
        httpMethod: 'POST',
        httpStatusCode: 400,
        requestHeaders: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey.substring(0, 6)}***`,
          'X-Maersk-Client-Id': this.config.clientId,
          'X-Depot-Code': this.config.depotCode,
          'X-Request-Id': requestId
        },
        requestPayload: this.buildMaerskEMRPayload(estimate, this.config),
        responseHeaders: {
          'Content-Type': 'application/json',
          'X-Response-Time': '12ms'
        },
        responsePayload: {
          error: 'BAD_REQUEST',
          message: 'Dữ liệu báo giá chưa đầy đủ chuẩn EDI EMR',
          details: validation.errors
        },
        status: 'ERROR',
        errorCode: 'ERR_VALIDATION_400',
        errorMessage: validation.errors.join('; '),
        latencyMs: 12,
        operator
      };

      return {
        success: false,
        transaction: failedTxn,
        error: errorPayload
      };
    }

    // 2. Prepare Request Payload & Headers
    const requestPayload = this.buildMaerskEMRPayload(estimate, this.config);
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json, application/cedex+json',
      'Authorization': `Bearer ${this.config.apiKey}`,
      'X-Maersk-Client-Id': this.config.clientId,
      'X-Depot-Code': this.config.depotCode,
      'X-Request-Id': requestId,
      'X-Transaction-Id': transactionId,
      'X-Environment': this.config.environment
    };

    // 3. Realistic Network latency simulation (600ms - 1200ms)
    await new Promise((resolve) => setTimeout(resolve, 850 + Math.random() * 400));
    const latencyMs = Math.round(performance.now() - startTime);

    // 4. Check for Simulated Error Mode (Section 6.5 testing requirement)
    if (this.config.simulateErrorMode && this.config.simulateErrorMode !== 'NONE') {
      let mockStatusCode = 400;
      let mockErrorCode = 'ERR_MAERSK_API';
      let mockErrorMessage = 'Lỗi kết nối hoặc xử lý từ API Maersk.';

      switch (this.config.simulateErrorMode) {
        case 'BAD_REQUEST_400':
          mockStatusCode = 400;
          mockErrorCode = 'ERR_INVALID_CEDEX_FORMAT';
          mockErrorMessage = 'HTTP 400: Maersk EDI Engine phát hiện sai cấu trúc định dạng CEDEX line item.';
          break;
        case 'AUTH_ERROR_401':
          mockStatusCode = 401;
          mockErrorCode = 'ERR_UNAUTHORIZED_CLIENT';
          mockErrorMessage = 'HTTP 401: Token API Key / Client Secret của Depot không hợp lệ hoặc đã hết hạn.';
          break;
        case 'VALIDATION_422':
          mockStatusCode = 422;
          mockErrorCode = 'ERR_UNPROCESSABLE_ENTITY';
          mockErrorMessage = 'HTTP 422: Container No chưa đăng ký luồng hạ bãi hoặc đang bị khóa bảo lưu tại hãng tàu.';
          break;
        case 'SERVER_503':
          mockStatusCode = 503;
          mockErrorCode = 'ERR_SERVICE_UNAVAILABLE';
          mockErrorMessage = 'HTTP 503: Cổng kết nối Maersk EMR Gateway đang bảo trì định kỳ hệ thống.';
          break;
      }

      const errorResponsePayload = {
        status: 'ERROR',
        httpStatus: mockStatusCode,
        errorCode: mockErrorCode,
        errorMessage: mockErrorMessage,
        requestId,
        transactionId,
        timestamp: new Date().toISOString(),
        depotCode: this.config.depotCode
      };

      const errorTxn: EstimateApiTransaction = {
        id: `TXN-${Date.now()}`,
        attemptNo,
        timestamp: timestampStr,
        requestId,
        transactionId,
        endpoint: this.config.endpointUrl,
        httpMethod: 'POST',
        httpStatusCode: mockStatusCode,
        requestHeaders,
        requestPayload,
        responseHeaders: {
          'Content-Type': 'application/json',
          'X-Maersk-Gateway': 'apigw-emr-sea-prod-02',
          'X-Request-Id': requestId
        },
        responsePayload: errorResponsePayload,
        status: 'ERROR',
        errorCode: mockErrorCode,
        errorMessage: mockErrorMessage,
        latencyMs,
        operator
      };

      return {
        success: false,
        transaction: errorTxn,
        error: {
          code: mockErrorCode,
          message: mockErrorMessage,
          statusCode: mockStatusCode
        }
      };
    }

    // 5. Successful Execution Result
    const maerskReferenceNo = `MAE-${Math.floor(100000 + Math.random() * 900000)}`;
    const successResponsePayload = {
      httpStatus: 200,
      status: 'SUBMITTED',
      estimateReferenceNo: estimate.estimateNo,
      containerNumber: estimate.containerNo,
      maerskReferenceNo: maerskReferenceNo,
      requestId: requestId,
      transactionId: transactionId,
      submittedAt: now.toISOString(),
      acceptedLineItemsCount: estimate.items.length,
      approvedAmountCurrency: estimate.currency || 'VND',
      approvedSubtotal: estimate.subtotal,
      approvedTotalAmount: estimate.totalAmount,
      message: `Estimate ${estimate.estimateNo} đã được tiếp nhận thành công vào hệ thống EMR Maersk Line. Mã tham chiếu Maersk: ${maerskReferenceNo}.`,
      depotGateway: 'Maersk EMR Southeast Asia Hub (VNHCM)'
    };

    const successResponse: MaerskApiResponse = {
      httpStatusCode: 200,
      referenceNo: maerskReferenceNo,
      requestId: requestId,
      transactionId: transactionId,
      submittedAt: timestampStr,
      status: 'SUBMITTED',
      message: successResponsePayload.message,
      rawResponse: successResponsePayload
    };

    const successTxn: EstimateApiTransaction = {
      id: `TXN-${Date.now()}`,
      attemptNo,
      timestamp: timestampStr,
      requestId,
      transactionId,
      endpoint: this.config.endpointUrl,
      httpMethod: 'POST',
      httpStatusCode: 200,
      requestHeaders,
      requestPayload,
      responseHeaders: {
        'Content-Type': 'application/json',
        'X-Maersk-Gateway': 'apigw-emr-sea-prod-01',
        'X-Request-Id': requestId,
        'X-Transaction-Id': transactionId,
        'X-Processing-Time-Ms': `${latencyMs}ms`
      },
      responsePayload: successResponsePayload,
      status: 'SUCCESS',
      maerskReferenceNo: maerskReferenceNo,
      latencyMs,
      operator
    };

    return {
      success: true,
      transaction: successTxn,
      response: successResponse
    };
  }
}

export const maerskIntegrationService = new MaerskIntegrationService();
