import { Estimate } from './types';

export interface DamageLocationOption {
  code: string;
  name: string;
  category: 'EXTERIOR' | 'INTERIOR' | 'UNDERFRAME' | 'DOORS' | 'ROOF' | 'REEFER';
}

export interface DamageCodeOption {
  code: string;
  name: string;
  description: string;
}

export interface RepairCodeOption {
  code: string;
  name: string;
  defaultUnit: 'M2' | 'M' | 'Tấm' | 'Cái' | 'Giờ' | 'Bộ' | 'Lần';
  defaultUnitPrice: number;
}

export const CEDEX_LOCATIONS: DamageLocationOption[] = [
  { code: 'PAN', name: 'Vách hông (Side Panel)', category: 'EXTERIOR' },
  { code: 'ROF', name: 'Nóc trần (Roof Panel)', category: 'ROOF' },
  { code: 'FLR', name: 'Sàn gỗ (Plywood Floor)', category: 'INTERIOR' },
  { code: 'DOR', name: 'Cánh cửa (Door Assembly)', category: 'DOORS' },
  { code: 'UFR', name: 'Xà gầm (Crossmember / Underframe)', category: 'UNDERFRAME' },
  { code: 'CRN', name: 'Gù góc (Corner Casting)', category: 'EXTERIOR' },
  { code: 'GKT', name: 'Gioăng cao su cửa (Door Gasket)', category: 'DOORS' },
  { code: 'HDL', name: 'Khóa gài tay nắm cửa (Door Handle / Locking Bar)', category: 'DOORS' },
  { code: 'RFU', name: 'Dàn máy lạnh Reefer Unit', category: 'REEFER' }
];

export const CEDEX_DAMAGES: DamageCodeOption[] = [
  { code: 'DT', name: 'Móp méo (Dent)', description: 'Biến dạng bề mặt tôn kim loại do va chạm' },
  { code: 'HO', name: 'Thủng rách (Hole / Puncture)', description: 'Thủng lọt ánh sáng, không đảm bảo kín nước (Water Tight)' },
  { code: 'CR', name: 'Nứt gãy (Crack / Split)', description: 'Nứt mối hàn, nứt thanh xà chịu lực' },
  { code: 'CO', name: 'Ăn mòn gỉ sét (Corroded / Rusty)', description: 'Gỉ sét ăn mòn sâu quá tiêu chuẩn IICL' },
  { code: 'BW', name: 'Cong vênh (Bowed / Bent)', description: 'Cong lệch xà dọc, xà ngang' },
  { code: 'BR', name: 'Gãy đứt (Broken)', description: 'Gãy rời linh kiện, thanh giằng' },
  { code: 'OD', name: 'Mùi lạ / Hôi bẩn (Odor / Contaminated)', description: 'Bám dính hóa chất, dầu mỡ động thực vật' }
];

export const CEDEX_REPAIRS: RepairCodeOption[] = [
  { code: 'P', name: 'Vá đắp kim loại (Patch / Insert)', defaultUnit: 'Tấm', defaultUnitPrice: 450000 },
  { code: 'SN', name: 'Nắn nguội định hình (Straighten)', defaultUnit: 'Giờ', defaultUnitPrice: 250000 },
  { code: 'R', name: 'Thay mới linh kiện (Replace)', defaultUnit: 'Cái', defaultUnitPrice: 1200000 },
  { code: 'W', name: 'Hàn đắp CO2 kín nước (Weld)', defaultUnit: 'M', defaultUnitPrice: 180000 },
  { code: 'CL', name: 'Tẩy rửa hóa chất khử mùi (Chemical Wash)', defaultUnit: 'Lần', defaultUnitPrice: 350000 },
  { code: 'SF', name: 'Chà nhám & Sơn phủ chống rỉ (Sand & Paint)', defaultUnit: 'M2', defaultUnitPrice: 220000 }
];

export const INITIAL_ESTIMATES: Estimate[] = [
  {
    id: 'EST-REC-001',
    estimateNo: 'EST-20260816-00001',
    containerId: 'CONT-001',
    containerNo: 'MSCU1234567',
    isoCode: '45G1',
    size: '40HC',
    type: 'Dry High Cube',
    shippingLine: 'MSC',
    condition: 'DM',
    createdBy: 'Trần Hải Đăng',
    createdById: 'EMP-EST-01',
    createdAt: '2026-08-16 08:30',
    updatedAt: '2026-08-16 09:15',
    repairSummary: 'Nắn vách hông trái (Panel) + Hàn vá thủng nóc trần (Roof)',
    subtotal: 1650000,
    vatRate: 0.08,
    vatAmount: 132000,
    totalAmount: 1782000,
    currency: 'VND',
    status: 'SUBMITTED',
    surveyReference: 'EIR-SURVEY-20260815-001',
    inspectionPhotos: [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&auto=format&fit=crop&q=80'
    ],
    notes: 'Hư hỏng do cẩu va quẹt tại cảng dỡ. Báo giá theo biểu phí chuẩn Depot - MSC.',
    items: [
      {
        id: 'ITEM-01',
        damageLocationCode: 'PAN',
        damageLocationName: 'Vách hông trái (Side Panel Left)',
        damageCode: 'DT',
        damageName: 'Móp méo sóng tôn (Dent)',
        repairCode: 'SN',
        repairMethod: 'Nắn nguội định hình sóng tôn',
        description: 'Móp sâu 45mm x 300mm tại sóng thứ 3 vách trái',
        quantity: 2.5,
        unit: 'Giờ',
        unitPrice: 250000,
        amount: 625000,
        vatRate: 0.08,
        vatAmount: 50000,
        totalAmount: 675000,
        cedexCode: 'PAN-DT-SN'
      },
      {
        id: 'ITEM-02',
        damageLocationCode: 'ROF',
        damageLocationName: 'Nóc trần (Roof Panel)',
        damageCode: 'HO',
        damageName: 'Thủng rách lọt sáng (Hole)',
        repairCode: 'P',
        repairMethod: 'Vá đắp tấm tôn Corten chống rỉ',
        description: 'Thủng rách kích thước 150mm x 100mm gây dột nước',
        quantity: 1,
        unit: 'Tấm',
        unitPrice: 1025000,
        amount: 1025000,
        vatRate: 0.08,
        vatAmount: 82000,
        totalAmount: 1107000,
        cedexCode: 'ROF-HO-P'
      }
    ],
    lastApiStatus: 'SUCCESS',
    lastApiResponse: {
      httpStatusCode: 200,
      referenceNo: 'MAE-987654',
      requestId: 'REQ-MAE-1787123912-1092',
      transactionId: 'TXN-EMR-20260816-891024',
      submittedAt: '2026-08-16 09:15:30',
      status: 'SUBMITTED',
      message: 'Estimate EST-20260816-00001 đã được tiếp nhận thành công vào hệ thống EMR Maersk Line. Mã tham chiếu: MAE-987654.',
      rawResponse: {
        httpStatus: 200,
        status: 'SUBMITTED',
        estimateReferenceNo: 'EST-20260816-00001',
        containerNumber: 'MSCU1234567',
        maerskReferenceNo: 'MAE-987654',
        requestId: 'REQ-MAE-1787123912-1092',
        transactionId: 'TXN-EMR-20260816-891024',
        submittedAt: '2026-08-16T09:15:30Z',
        acceptedLineItemsCount: 2,
        approvedTotalAmount: 1782000
      }
    },
    apiTransactionHistory: [
      {
        id: 'TXN-HIST-001',
        attemptNo: 1,
        timestamp: '2026-08-16 09:15:30',
        requestId: 'REQ-MAE-1787123912-1092',
        transactionId: 'TXN-EMR-20260816-891024',
        endpoint: 'https://api.maersk.com/emr/v2/estimates',
        httpMethod: 'POST',
        httpStatusCode: 200,
        requestHeaders: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mae_api_key_depot_vnhcm01_secure',
          'X-Depot-Code': 'VNHCM01',
          'X-Request-Id': 'REQ-MAE-1787123912-1092'
        },
        requestPayload: {
          messageType: 'WESTIM',
          estimateReferenceNo: 'EST-20260816-00001',
          containerNumber: 'MSCU1234567'
        },
        responseHeaders: {
          'Content-Type': 'application/json',
          'X-Maersk-Gateway': 'apigw-emr-sea-prod-01'
        },
        responsePayload: {
          httpStatus: 200,
          status: 'SUBMITTED',
          maerskReferenceNo: 'MAE-987654'
        },
        status: 'SUCCESS',
        maerskReferenceNo: 'MAE-987654',
        latencyMs: 742,
        operator: 'Trần Hải Đăng'
      }
    ]
  },
  {
    id: 'EST-REC-002',
    estimateNo: 'EST-20260816-00002',
    containerId: 'CONT-002',
    containerNo: 'MAEU9821304',
    isoCode: '22G1',
    size: '20GP',
    type: 'Dry Standard',
    shippingLine: 'MAERSK',
    condition: 'DM',
    createdBy: 'Nguyễn Bích Thủy',
    createdById: 'EMP-EST-02',
    createdAt: '2026-08-16 09:00',
    updatedAt: '2026-08-16 09:45',
    repairSummary: 'Thay mới gioăng cửa cao su + Nắn thanh khóa gài (Locking Bar)',
    subtotal: 2100000,
    vatRate: 0.08,
    vatAmount: 168000,
    totalAmount: 2268000,
    currency: 'VND',
    status: 'APPROVED',
    surveyReference: 'EIR-SURVEY-20260815-002',
    inspectionPhotos: [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80'
    ],
    notes: 'Đã được Maersk Line phê duyệt qua EDI tự động.',
    carrierApproval: {
      status: 'APPROVED',
      authCode: 'MAEU-AUTH-2026-982103',
      approvedAmount: 2268000,
      approvedAt: '2026-08-16 09:45',
      approvedBy: 'Maersk EMR Auto-Approval Engine (EDI)',
      comments: 'Phê duyệt 100% hạng mục thay gioăng cửa và nắn thanh khóa theo biểu giá Hợp đồng Depot 2026.'
    },
    items: [
      {
        id: 'ITEM-03',
        damageLocationCode: 'GKT',
        damageLocationName: 'Gioăng cao su cửa (Door Gasket)',
        damageCode: 'BR',
        damageName: 'Rách đứt mục nát (Broken)',
        repairCode: 'R',
        repairMethod: 'Thay mới nguyên bộ gioăng cao su chữ J',
        description: 'Rách gioăng cánh phải dài 1.8m',
        quantity: 1,
        unit: 'Bộ',
        unitPrice: 1500000,
        amount: 1500000,
        vatRate: 0.08,
        vatAmount: 120000,
        totalAmount: 1620000,
        cedexCode: 'GKT-BR-R'
      },
      {
        id: 'ITEM-04',
        damageLocationCode: 'HDL',
        damageLocationName: 'Khóa gài tay nắm cửa (Locking Bar)',
        damageCode: 'BW',
        damageName: 'Cong vênh kẹt cửa (Bowed)',
        repairCode: 'SN',
        repairMethod: 'Gia nhiệt nắn thẳng tay khóa',
        description: 'Cong vênh không đóng kín cửa được',
        quantity: 2.4,
        unit: 'Giờ',
        unitPrice: 250000,
        amount: 600000,
        vatRate: 0.08,
        vatAmount: 48000,
        totalAmount: 648000,
        cedexCode: 'HDL-BW-SN'
      }
    ],
    lastApiStatus: 'SUCCESS',
    lastApiResponse: {
      httpStatusCode: 200,
      referenceNo: 'MAE-982103',
      requestId: 'REQ-MAE-1787124100-2041',
      transactionId: 'TXN-EMR-20260816-902184',
      submittedAt: '2026-08-16 09:45:10',
      status: 'APPROVED',
      message: 'Maersk EMR Auto-Approval Engine đã phê duyệt toàn bộ hạng mục sửa chữa (Approval Reference: MAE-982103).',
      rawResponse: {
        httpStatus: 200,
        status: 'APPROVED',
        estimateReferenceNo: 'EST-20260816-00002',
        maerskReferenceNo: 'MAE-982103',
        approvedAmount: 2268000
      }
    },
    apiTransactionHistory: [
      {
        id: 'TXN-HIST-002',
        attemptNo: 1,
        timestamp: '2026-08-16 09:45:10',
        requestId: 'REQ-MAE-1787124100-2041',
        transactionId: 'TXN-EMR-20260816-902184',
        endpoint: 'https://api.maersk.com/emr/v2/estimates',
        httpMethod: 'POST',
        httpStatusCode: 200,
        requestHeaders: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mae_api_key_depot_vnhcm01_secure'
        },
        requestPayload: {
          estimateReferenceNo: 'EST-20260816-00002',
          containerNumber: 'MAEU9821304'
        },
        responseHeaders: { 'Content-Type': 'application/json' },
        responsePayload: { status: 'APPROVED', maerskReferenceNo: 'MAE-982103' },
        status: 'SUCCESS',
        maerskReferenceNo: 'MAE-982103',
        latencyMs: 680,
        operator: 'Nguyễn Bích Thủy'
      }
    ]
  },
  {
    id: 'EST-REC-003',
    estimateNo: 'EST-20260816-00003',
    containerId: 'CONT-003',
    containerNo: 'TCKU9021435',
    isoCode: '45G1',
    size: '40HC',
    type: 'Dry High Cube',
    shippingLine: 'ONE',
    condition: 'DM',
    createdBy: 'Trần Hải Đăng',
    createdById: 'EMP-EST-01',
    createdAt: '2026-08-16 10:00',
    updatedAt: '2026-08-16 10:15',
    repairSummary: 'Thay tấm sàn gỗ mục nát (Plywood Floor) + Sơn phủ chống ẩm',
    subtotal: 3200000,
    vatRate: 0.08,
    vatAmount: 256000,
    totalAmount: 3456000,
    currency: 'VND',
    status: 'ERROR',
    surveyReference: 'EIR-SURVEY-20260815-003',
    inspectionPhotos: [],
    notes: 'Lần gửi API thứ 1 bị từ chối do thiếu mã phụ kiện sàn gỗ chuẩn CEDEX ISO 9897. Cần bấm "Gửi lại".',
    items: [
      {
        id: 'ITEM-05',
        damageLocationCode: 'FLR',
        damageLocationName: 'Sàn gỗ (Plywood Floor)',
        damageCode: 'BR',
        damageName: 'Mục nát bong tróc lớp keo (Broken)',
        repairCode: 'R',
        repairMethod: 'Thay mới 02 tấm ván ép chuyên dụng 28mm',
        description: 'Ván sàn gãy nát do tải trọng xe nâng trong cont',
        quantity: 2,
        unit: 'Tấm',
        unitPrice: 1600000,
        amount: 3200000,
        vatRate: 0.08,
        vatAmount: 256000,
        totalAmount: 3456000,
        cedexCode: 'FLR-BR-R'
      }
    ],
    lastApiStatus: 'FAILED',
    apiTransactionHistory: [
      {
        id: 'TXN-HIST-003',
        attemptNo: 1,
        timestamp: '2026-08-16 10:15:22',
        requestId: 'REQ-MAE-1787125200-9901',
        transactionId: 'TXN-EMR-20260816-911002',
        endpoint: 'https://api.maersk.com/emr/v2/estimates',
        httpMethod: 'POST',
        httpStatusCode: 422,
        requestHeaders: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mae_api_key_depot_vnhcm01_secure'
        },
        requestPayload: {
          estimateReferenceNo: 'EST-20260816-00003',
          containerNumber: 'TCKU9021435'
        },
        responseHeaders: {
          'Content-Type': 'application/json',
          'X-Maersk-Gateway': 'apigw-emr-sea-prod-02'
        },
        responsePayload: {
          status: 'ERROR',
          httpStatus: 422,
          errorCode: 'ERR_UNPROCESSABLE_ENTITY',
          errorMessage: 'HTTP 422: Thông tin mã phụ kiện sàn gỗ (Plywood Spec) chưa khớp mã hợp đồng Depot Master Tariff.',
          requestId: 'REQ-MAE-1787125200-9901'
        },
        status: 'ERROR',
        errorCode: 'ERR_UNPROCESSABLE_ENTITY',
        errorMessage: 'HTTP 422: Thông tin mã phụ kiện sàn gỗ (Plywood Spec) chưa khớp mã hợp đồng Depot Master Tariff.',
        latencyMs: 910,
        operator: 'Trần Hải Đăng'
      }
    ]
  },
  {
    id: 'EST-REC-004',
    estimateNo: 'EST-20260816-00004',
    containerId: 'CONT-004',
    containerNo: 'CMAU7712390',
    isoCode: '45R1',
    size: '40RH',
    type: 'Reefer High Cube',
    shippingLine: 'CMA CGM',
    condition: 'CL',
    createdBy: 'Nguyễn Bích Thủy',
    createdById: 'EMP-EST-02',
    createdAt: '2026-08-16 10:20',
    updatedAt: '2026-08-16 10:20',
    repairSummary: 'Tẩy rửa hóa chất khử mùi hải sản + Kiểm tra cắm điện PTI dàn lạnh',
    subtotal: 1100000,
    vatRate: 0.08,
    vatAmount: 88000,
    totalAmount: 1188000,
    currency: 'VND',
    status: 'READY',
    surveyReference: 'EIR-SURVEY-20260815-004',
    inspectionPhotos: [],
    notes: 'Container đóng tôm đông lạnh có mùi nồng, cần xử lý khử mùi trước khi cấp rỗng tiếp.',
    items: [
      {
        id: 'ITEM-06',
        damageLocationCode: 'PAN',
        damageLocationName: 'Vách trong thùng lạnh (Interior Stainless Panel)',
        damageCode: 'OD',
        damageName: 'Mùi hôi bám dính (Odor / Contaminated)',
        repairCode: 'CL',
        repairMethod: 'Phun rửa hóa chất sinh học khử mùi tanh',
        description: 'Tẩy rửa khử mùi toàn bộ trần và vách trong',
        quantity: 1,
        unit: 'Lần',
        unitPrice: 500000,
        amount: 500000,
        vatRate: 0.08,
        vatAmount: 40000,
        totalAmount: 540000,
        cedexCode: 'PAN-OD-CL'
      },
      {
        id: 'ITEM-07',
        damageLocationCode: 'RFU',
        damageLocationName: 'Dàn máy lạnh Reefer Unit',
        damageCode: 'DT',
        damageName: 'Kiểm tra vận hành (Inspection / PTI)',
        repairCode: 'SF',
        repairMethod: 'Cắm điện PTI và đo nhiệt độ âm 20°C',
        description: 'PTI Test 4 giờ liên tục theo quy chuẩn Carrier',
        quantity: 1,
        unit: 'Lần',
        unitPrice: 600000,
        amount: 600000,
        vatRate: 0.08,
        vatAmount: 48000,
        totalAmount: 648000,
        cedexCode: 'RFU-DT-SF'
      }
    ],
    lastApiStatus: 'NOT_SENT',
    apiTransactionHistory: []
  },
  {
    id: 'EST-REC-005',
    estimateNo: 'EST-20260816-00005',
    containerId: 'CONT-005',
    containerNo: 'EGLU7829104',
    isoCode: '22G1',
    size: '20GP',
    type: 'Dry Standard',
    shippingLine: 'EVERGREEN',
    condition: 'DM',
    createdBy: 'Trần Hải Đăng',
    createdById: 'EMP-EST-01',
    createdAt: '2026-08-16 10:25',
    updatedAt: '2026-08-16 10:25',
    repairSummary: 'Hàn nứt xà ngang gầm (Crossmember)',
    subtotal: 850000,
    vatRate: 0.08,
    vatAmount: 68000,
    totalAmount: 918000,
    currency: 'VND',
    status: 'DRAFT',
    surveyReference: 'EIR-SURVEY-20260815-005',
    inspectionPhotos: [],
    notes: 'Đang dự thảo báo giá, chờ bổ sung ảnh đo đạc thực tế từ giám định viên.',
    items: [
      {
        id: 'ITEM-08',
        damageLocationCode: 'UFR',
        damageLocationName: 'Xà gầm chịu lực (Crossmember)',
        damageCode: 'CR',
        damageName: 'Nứt gãy mối hàn (Crack)',
        repairCode: 'W',
        repairMethod: 'Hàn CO2 đắp gia cường mối nứt',
        description: 'Nứt mối hàn xà gầm số 4 chiều dài 120mm',
        quantity: 1.2,
        unit: 'M',
        unitPrice: 708333,
        amount: 850000,
        vatRate: 0.08,
        vatAmount: 68000,
        totalAmount: 918000,
        cedexCode: 'UFR-CR-W'
      }
    ],
    lastApiStatus: 'NOT_SENT',
    apiTransactionHistory: []
  },
  {
    id: 'EST-REC-006',
    estimateNo: 'EST-20260816-00006',
    containerId: 'CONT-001',
    containerNo: 'MSCU1234567',
    isoCode: '45G1',
    size: '40HC',
    type: 'Dry High Cube',
    shippingLine: 'MSC',
    condition: 'DM',
    createdBy: 'Trần Hải Đăng',
    createdById: 'EMP-EST-01',
    createdAt: '2026-08-15 14:10',
    updatedAt: '2026-08-15 16:30',
    repairSummary: 'Thay mới tấm tôn vách trái (Panel Replace) + Sửa sàn gỗ',
    subtotal: 3850000,
    vatRate: 0.08,
    vatAmount: 308000,
    totalAmount: 4158000,
    currency: 'VND',
    status: 'REJECTED',
    surveyReference: 'EIR-SURVEY-20260815-001',
    inspectionPhotos: [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80'
    ],
    notes: 'Đại diện Hãng tàu MSC từ chối phê duyệt do chi phí thay nguyên tấm tôn quá cao. Đề nghị sửa bằng phương pháp nắn thẳng gia nhiệt và vá tấm lót.',
    carrierApproval: {
      status: 'REJECTED',
      rejectCode: 'CEDEX_PRICE_EXCEEDED',
      rejectReason: 'Đơn giá thay nguyên tấm tôn vách (4,158,000 VND) vượt hạn mức hợp đồng khung. Đề xuất chuyển sang phương pháp Nắn thẳng (SN) + Vá đắp tấm (P) tối đa 1,800,000 VND.',
      approvedAmount: 0,
      approvedAt: '2026-08-15 16:30',
      approvedBy: 'MSC EMR Regional Surveyor (Mr. Robert Klein)',
      comments: 'Yêu cầu lập lại báo giá điều chỉnh (Revision #2) theo hướng dẫn IICL-6 để phê duyệt lại.',
      suggestedAction: 'Điều chỉnh lại hạng mục số 1 từ Replace (R) sang Straighten & Patch (SN/P)'
    },
    items: [
      {
        id: 'ITEM-09',
        damageLocationCode: 'PAN',
        damageLocationName: 'Vách hông trái (Side Panel Left)',
        damageCode: 'CUT',
        damageName: 'Rách vách tôn rãnh dọc (Cut/Tear)',
        repairCode: 'R',
        repairMethod: 'Cắt bỏ thay nguyên tấm tôn mới',
        description: 'Vết rách 120mm x 40mm tại sóng vách',
        quantity: 1,
        unit: 'Tấm',
        unitPrice: 2800000,
        amount: 2800000,
        vatRate: 0.08,
        vatAmount: 224000,
        totalAmount: 3024000,
        cedexCode: 'PAN-CUT-R'
      },
      {
        id: 'ITEM-10',
        damageLocationCode: 'FLR',
        damageLocationName: 'Sàn gỗ (Floor Plywood)',
        damageCode: 'DL',
        damageName: 'Bong tróc nứt ván (Delamination)',
        repairCode: 'SN',
        repairMethod: 'Bắt vít gia cố và trám keo',
        description: 'Ván sàn nứt hở mạch 300mm',
        quantity: 1.5,
        unit: 'Giờ',
        unitPrice: 700000,
        amount: 1050000,
        vatRate: 0.08,
        vatAmount: 84000,
        totalAmount: 1134000,
        cedexCode: 'FLR-DL-SN'
      }
    ],
    lastApiStatus: 'SUCCESS',
    lastApiResponse: {
      httpStatusCode: 200,
      referenceNo: 'MSC-REJ-881902',
      requestId: 'REQ-MSC-17871299-011',
      transactionId: 'TXN-MSC-20260815-1630',
      submittedAt: '2026-08-15 16:30:00',
      status: 'REJECTED',
      message: 'Hãng tàu MSC đã từ chối phê duyệt báo giá: Đơn giá vượt biểu phí quy định.',
      rawResponse: {
        httpStatus: 200,
        status: 'REJECTED',
        estimateReferenceNo: 'EST-20260816-00006',
        rejectCode: 'CEDEX_PRICE_EXCEEDED',
        rejectReason: 'Chi phí thay mới không hợp lý, yêu cầu nắn vá.'
      }
    },
    apiTransactionHistory: [
      {
        id: 'TXN-HIST-006',
        attemptNo: 1,
        timestamp: '2026-08-15 16:30:00',
        requestId: 'REQ-MSC-17871299-011',
        transactionId: 'TXN-MSC-20260815-1630',
        endpoint: 'https://api.msc.com/emr/v1/estimates',
        httpMethod: 'POST',
        httpStatusCode: 200,
        requestHeaders: { 'Content-Type': 'application/json' },
        requestPayload: { estimateReferenceNo: 'EST-20260816-00006' },
        responseHeaders: { 'Content-Type': 'application/json' },
        responsePayload: { status: 'REJECTED', rejectCode: 'CEDEX_PRICE_EXCEEDED' },
        status: 'SUCCESS',
        maerskReferenceNo: 'MSC-REJ-881902',
        latencyMs: 820,
        operator: 'Trần Hải Đăng'
      }
    ]
  }
];
