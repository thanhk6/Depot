import { CarrierApiEndpointConfig, CarrierApiLogRecord } from '../types/shippingApi';
import { QCInspectionRecord } from '../../qc/types/qc';

export const CARRIER_API_CONFIGS: CarrierApiEndpointConfig[] = [
  {
    carrierCode: 'MAERSK',
    carrierName: 'Maersk Line (APM-Maersk)',
    logoColor: 'text-sky-400 bg-sky-950 border-sky-800',
    endpointUrl: 'https://api.maersk.com/depot-operations/v3/mnr/repair-completion',
    method: 'POST',
    protocol: 'REST_JSON',
    environment: 'PRODUCTION',
    authType: 'OAUTH2',
    status: 'HEALTHY',
    rateLimitPerMin: 120,
    autoTransmitOnQcPass: true
  },
  {
    carrierCode: 'ONE',
    carrierName: 'Ocean Network Express (ONE Line)',
    logoColor: 'text-pink-400 bg-pink-950 border-pink-800',
    endpointUrl: 'https://api.one-line.com/mnr/v2/qc-status-update',
    method: 'POST',
    protocol: 'REST_JSON',
    environment: 'PRODUCTION',
    authType: 'BEARER_TOKEN',
    status: 'HEALTHY',
    rateLimitPerMin: 100,
    autoTransmitOnQcPass: true
  },
  {
    carrierCode: 'CMA CGM',
    carrierName: 'CMA CGM Group (APL / CNC)',
    logoColor: 'text-blue-400 bg-blue-950 border-blue-800',
    endpointUrl: 'https://api.cma-cgm.com/depot/v1/container-release-av',
    method: 'POST',
    protocol: 'REST_JSON',
    environment: 'PRODUCTION',
    authType: 'API_KEY',
    status: 'HEALTHY',
    rateLimitPerMin: 90,
    autoTransmitOnQcPass: true
  },
  {
    carrierCode: 'MSC',
    carrierName: 'MSC Mediterranean Shipping Company',
    logoColor: 'text-amber-400 bg-amber-950 border-amber-800',
    endpointUrl: 'https://api.msc.com/equipment/v2/qc-repair-event',
    method: 'POST',
    protocol: 'REST_JSON',
    environment: 'PRODUCTION',
    authType: 'MUTUAL_TLS',
    status: 'HEALTHY',
    rateLimitPerMin: 80,
    autoTransmitOnQcPass: true
  },
  {
    carrierCode: 'COSCO',
    carrierName: 'COSCO Shipping Lines (OOCL)',
    logoColor: 'text-emerald-400 bg-emerald-950 border-emerald-800',
    endpointUrl: 'https://iris2-api.coscoshipping.com/mnr/depot/completion',
    method: 'POST',
    protocol: 'REST_JSON',
    environment: 'PRODUCTION',
    authType: 'BEARER_TOKEN',
    status: 'HEALTHY',
    rateLimitPerMin: 150,
    autoTransmitOnQcPass: false
  },
  {
    carrierCode: 'EVERGREEN',
    carrierName: 'Evergreen Marine Corp (EMC)',
    logoColor: 'text-green-400 bg-green-950 border-green-800',
    endpointUrl: 'https://edi-api.evergreen-marine.com/v1/container/av-update',
    method: 'POST',
    protocol: 'REST_JSON',
    environment: 'PRODUCTION',
    authType: 'API_KEY',
    status: 'HEALTHY',
    rateLimitPerMin: 60,
    autoTransmitOnQcPass: false
  },
  {
    carrierCode: 'HAPAG-LLOYD',
    carrierName: 'Hapag-Lloyd (HL Connect)',
    logoColor: 'text-orange-400 bg-orange-950 border-orange-800',
    endpointUrl: 'https://api.hapag-lloyd.com/operations/depot/repair-done',
    method: 'POST',
    protocol: 'REST_JSON',
    environment: 'PRODUCTION',
    authType: 'OAUTH2',
    status: 'HEALTHY',
    rateLimitPerMin: 120,
    autoTransmitOnQcPass: true
  }
];

export const INITIAL_API_LOGS: CarrierApiLogRecord[] = [
  {
    id: 'LOG-TX-9901',
    transactionRef: 'TX-MAE-8829104',
    carrierCode: 'MAERSK',
    carrierName: 'Maersk Line',
    endpointUrl: 'https://api.maersk.com/depot-operations/v3/mnr/repair-completion',
    httpMethod: 'POST',
    containerCount: 2,
    containerNos: ['MSKU9082341', 'MRKU4521098'],
    requestHeaders: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
      'X-Depot-Code': 'VNSGN-EMRCATLAI',
      'X-Client-Id': 'EMR_PROD_GATEWAY_VN',
      'X-Idempotency-Key': 'IDEM-9901-MAE'
    },
    requestPayload: {
      depotFacility: {
        unLocode: 'VNSGN',
        depotCode: 'EMR_DEPOT_CATLAI',
        facilityName: 'EMR Container Logistics Depot Cat Lai'
      },
      transmissionType: 'BATCH_REPAIR_COMPLETION_QC',
      totalUnits: 2,
      timestamp: '2026-08-16T08:14:22.019Z',
      containers: [
        {
          containerNo: 'MSKU9082341',
          isoCode: '45G1',
          workOrderNo: 'WO-2341',
          estimateRef: 'EST-2341',
          inspectionStandard: 'IICL-6',
          qcResult: 'PASS',
          assignedGrade: 'GRADE_A',
          cargoSuitability: 'FOOD_GRADE_CLEAN',
          inspectorCertificate: 'QC-CERT-MSKU9082341-2026',
          inspectorName: 'Vũ Quốc Việt',
          yardPosition: { block: 'C', bay: '04', row: '02', tier: '2' },
          photos: {
            damagePhotosCount: 1,
            completedRepairPhotosCount: 2,
            verifiedLightProof: true,
            verifiedWaterTight: true
          }
        },
        {
          containerNo: 'MRKU4521098',
          isoCode: '22G1',
          workOrderNo: 'WO-1098',
          estimateRef: 'EST-1098',
          inspectionStandard: 'IICL-6',
          qcResult: 'PASS',
          assignedGrade: 'GRADE_A',
          inspectorCertificate: 'QC-CERT-MRKU4521098-2026',
          inspectorName: 'Vũ Quốc Việt',
          yardPosition: { block: 'A', bay: '01', row: '01', tier: '3' }
        }
      ]
    },
    responseStatusCode: 200,
    responseStatusText: 'OK',
    responsePayload: {
      statusCode: 200,
      status: 'SUCCESS',
      carrier: 'MAERSK LINE',
      carrierSystem: 'GCSS_MNR_CORE_V3',
      serverHost: 'apigw.cph.maersk.net',
      transactionId: 'TX-MAE-8829104',
      ackReference: 'MAE-ACK-2026-9812401',
      processedAt: '2026-08-16T08:14:22.684Z',
      executionTimeMs: 665,
      results: [
        {
          containerNo: 'MSKU9082341',
          status: 'ACCEPTED',
          newCarrierState: 'AV (AVAILABLE FOR BOOKING)',
          previousState: 'DM (DAMAGED IN DEPOT)',
          unlockedForExport: true,
          releaseToken: 'REL-AV-MSK-9901-01',
          approvedCostUSD: 145.00,
          billingStatus: 'POSTED_TO_MNR_BILLING',
          message: 'Container condition updated to AV. Gate-out permission unlocked for export booking.'
        },
        {
          containerNo: 'MRKU4521098',
          status: 'ACCEPTED',
          newCarrierState: 'AV (AVAILABLE FOR BOOKING)',
          previousState: 'DM (DAMAGED IN DEPOT)',
          unlockedForExport: true,
          releaseToken: 'REL-AV-MSK-9901-02',
          approvedCostUSD: 85.00,
          billingStatus: 'POSTED_TO_MNR_BILLING',
          message: 'Container condition updated to AV. Ready for customer assignment.'
        }
      ],
      digitalSignature: 'SHA256:7fa1e92d84c1b6a71e403d91cf3e8201a4e129b0a1d'
    },
    ackReferenceNo: 'MAE-ACK-2026-9812401',
    latencyMs: 665,
    status: 'SUCCESS',
    timestamp: '2026-08-16 08:14:22',
    triggeredBy: 'Vũ Quốc Việt (QC Manager)'
  },
  {
    id: 'LOG-TX-9884',
    transactionRef: 'TX-ONE-7729182',
    carrierCode: 'ONE',
    carrierName: 'Ocean Network Express',
    endpointUrl: 'https://api.one-line.com/mnr/v2/qc-status-update',
    httpMethod: 'POST',
    containerCount: 1,
    containerNos: ['ONEU7823419'],
    requestHeaders: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer one_live_sec_token_99182a...',
      'X-Depot-Id': 'EMR_VNSGN_CATLAI',
      'X-Correlation-Id': 'ONE-CORR-7729182'
    },
    requestPayload: {
      carrierId: 'ONE',
      depotId: 'EMR_DEPOT_CATLAI',
      eventType: 'QC_REPAIR_COMPLETED_RELEASE_AV',
      container: {
        containerNo: 'ONEU7823419',
        isoType: '45G1',
        workOrderNo: 'WO-3419',
        estimateNo: 'EST-3419',
        grade: 'GRADE_A',
        inspectionDate: '2026-08-16 07:30',
        inspector: 'Vũ Quốc Việt',
        testLightTightPassed: true,
        testWaterSprayPassed: true
      }
    },
    responseStatusCode: 201,
    responseStatusText: 'Created',
    responsePayload: {
      statusCode: 201,
      status: 'SUCCESS',
      carrier: 'OCEAN NETWORK EXPRESS (ONE)',
      gateway: 'ONE-MNR-GATEWAY-TOKYO-02',
      transactionId: 'TX-ONE-7729182',
      ackReference: 'ONE-ACK-8840192',
      processedAt: '2026-08-16T07:30:45.912Z',
      containerSummary: {
        containerNo: 'ONEU7823419',
        currentInventoryStatus: 'AV (AVAILABLE)',
        ediMessageSent: 'WESTIM D.00B ACKNOWLEDGED',
        gateOutAuthorizationCode: 'ONE-GO-99184'
      },
      message: 'Repair completion accepted. Work Order WO-3419 reconciled.'
    },
    ackReferenceNo: 'ONE-ACK-8840192',
    latencyMs: 780,
    status: 'SUCCESS',
    timestamp: '2026-08-16 07:30:45',
    triggeredBy: 'Vũ Quốc Việt (QC Manager)'
  }
];

export function buildCarrierApiRequest(
  carrier: CarrierApiEndpointConfig,
  records: QCInspectionRecord[],
  depotCode: string = 'EMR_DEPOT_CATLAI'
) {
  const now = new Date();
  const txRef = `TX-${carrier.carrierCode.slice(0, 3)}-${Date.now().toString().slice(-7)}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Depot-Code': depotCode,
    'X-Depot-Name': 'EMR Container Logistics Depot Cat Lai (VNSGN)',
    'X-Transaction-Id': txRef,
    'X-Client-Version': 'EMR-DEPOT-ERP-v2.6.4',
    'X-Timestamp': now.toISOString()
  };

  if (carrier.authType === 'BEARER_TOKEN' || carrier.authType === 'OAUTH2') {
    headers['Authorization'] = `Bearer ${carrier.carrierCode.toLowerCase()}_live_token_${Date.now()}`;
  } else if (carrier.authType === 'API_KEY') {
    headers['X-API-Key'] = `key_${carrier.carrierCode.toLowerCase()}_prod_9a8f7b6c5d`;
  } else {
    headers['X-Client-Cert-Thumbprint'] = 'SHA1:4a7e9b2c8f1e5d3a7c9b0e2f4a6d8c1b3e5a7c9b';
  }

  const payload = {
    depotFacility: {
      unLocode: 'VNSGN',
      depotCode: depotCode,
      facilityName: 'EMR Container Logistics Center',
      country: 'VIETNAM'
    },
    transactionRef: txRef,
    transmissionType: 'QC_REPAIR_COMPLETION_AND_AV_RELEASE',
    batchSize: records.length,
    sentAt: now.toISOString(),
    senderInfo: {
      company: 'EMR Container Services Co., Ltd',
      inspector: records[0]?.inspectorName || 'Vũ Quốc Việt',
      certification: 'IICL Certified Container Inspector (ID: IICL-VN-2024-889)'
    },
    containers: records.map((r) => ({
      containerNo: r.containerNo,
      isoCode: r.isoCode,
      size: r.size,
      type: r.type,
      workOrderNo: r.workOrderNo,
      estimateRefNo: r.estimateNo,
      shippingLine: r.shippingLine,
      yardLocation: {
        block: r.yardLocation.block,
        bay: r.yardLocation.bay,
        row: r.yardLocation.row,
        tier: r.yardLocation.tier
      },
      repairedAt: r.repairedAt,
      inspectedAt: r.inspectedAt || now.toISOString(),
      qcInspectionResult: r.qcResult,
      qualityGradeReleased: r.releasedGrade || 'GRADE_A',
      qualityCertificateNo: r.certificateNo || `QC-CERT-${r.containerNo}-2026`,
      inspectionChecklistSummary: {
        totalCheckItems: r.checkItems?.length || 7,
        passedItems: r.checkItems?.filter((i) => i.isPassed).length || 7,
        lightTightnessVerified: true,
        waterTightnessVerified: true,
        floorSandAndCleanVerified: true,
        corrosionAndPaintStandard: 'ISO_12944_C4'
      },
      photos: {
        beforeRepairPhotosCount: r.beforePhotos?.length || 1,
        afterRepairPhotosCount: r.afterPhotos?.length || 1,
        photoUrls: [
          ...(r.beforePhotos?.map((p) => ({ type: 'BEFORE', url: p.url, label: p.label })) || []),
          ...(r.afterPhotos?.map((p) => ({ type: 'AFTER', url: p.url, label: p.label })) || [])
        ]
      },
      inspectorRemarks: r.inspectorComments || 'Thử kín sáng đạt tuyệt đối, sàn phẳng sạch, mối hàn phủ sơn chống rỉ đồng màu.'
    }))
  };

  return {
    txRef,
    headers,
    payload
  };
}

export function simulateCarrierApiResponse(
  carrier: CarrierApiEndpointConfig,
  txRef: string,
  records: QCInspectionRecord[],
  forceFail: boolean = false
): {
  statusCode: number;
  statusText: string;
  payload: any;
  ackRef: string;
  latencyMs: number;
} {
  const latencyMs = Math.floor(Math.random() * 350) + 450; // 450ms - 800ms
  const now = new Date();
  const ackRef = `${carrier.carrierCode.slice(0, 3)}-ACK-${now.getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

  if (forceFail) {
    return {
      statusCode: 422,
      statusText: 'Unprocessable Entity',
      payload: {
        statusCode: 422,
        error: 'CARRIER_VALIDATION_ERROR',
        carrier: carrier.carrierName,
        transactionId: txRef,
        timestamp: now.toISOString(),
        message: 'Bản tin bị từ chối: Mã Work Order không khớp với hợp đồng bảo trì EDI hoặc số hiệu container đang bị khóa trên hệ thống trung tâm.',
        failedContainers: records.map((r) => ({
          containerNo: r.containerNo,
          errorCode: 'ERR_ESTIMATE_MISMATCH',
          description: `Work order ${r.workOrderNo} exceeds authorized threshold limit ($250.00). Require carrier M&R manual approval.`
        }))
      },
      ackRef: 'REJECTED',
      latencyMs
    };
  }

  const payload = {
    statusCode: 200,
    status: 'SUCCESS',
    carrier: carrier.carrierName,
    carrierSystem: `${carrier.carrierCode}_MNR_PORTAL_CORE_v3`,
    gatewayNode: `apigw-${carrier.carrierCode.toLowerCase()}.singapore.hub`,
    transactionId: txRef,
    ackReference: ackRef,
    processedAt: now.toISOString(),
    executionTimeMs: latencyMs,
    totalContainersProcessed: records.length,
    containers: records.map((r, i) => ({
      containerNo: r.containerNo,
      status: 'ACCEPTED_AND_RELEASED_AV',
      previousCondition: 'DM (DAMAGED / UNDER_REPAIR)',
      currentCondition: 'AV (AVAILABLE FOR EXPORT / SOUND)',
      assignedGrade: r.releasedGrade || 'GRADE_A',
      unlockedForBooking: true,
      gateOutPermissionToken: `PERMIT-AV-${carrier.carrierCode.slice(0, 3)}-${Date.now().toString().slice(-6)}-${i + 1}`,
      workOrderReconciled: true,
      billingStatement: {
        workOrderNo: r.workOrderNo,
        estimateNo: r.estimateNo,
        settlementStatus: 'ACCEPTED_FOR_SETTLEMENT',
        currency: 'USD'
      },
      message: `Container ${r.containerNo} đã được hệ thống ${carrier.carrierName} tự động cập nhật trạng thái Vỏ Sạch (AV) trên toàn mạng lưới toàn cầu. Sẵn sàng cấp phát lệnh hạ rỗng/đóng hàng.`
    })),
    digitalSignature: `SHA256:${Array.from({ length: 48 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
    responseHeaders: {
      'server': 'Carrier-API-Gateway/4.12',
      'x-ratelimit-remaining': '118',
      'x-content-type-options': 'nosniff'
    }
  };

  return {
    statusCode: 200,
    statusText: 'OK',
    payload,
    ackRef,
    latencyMs
  };
}
