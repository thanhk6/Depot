import { GateOutContainerRecord, CarrierBookingOrder } from '../types/gateOut';

export const INITIAL_GATE_OUT_CONTAINERS: GateOutContainerRecord[] = [
  {
    id: 'GO-CONT-01',
    containerId: 'CONT-MSKU9082341',
    containerNo: 'MSKU9082341',
    isoCode: '45G1',
    size: '40HC',
    type: 'Dry High Cube',
    shippingLine: 'MAERSK',
    condition: 'AV',
    grade: 'FOOD_GRADE',
    yardLocation: {
      block: 'A',
      bay: '04',
      row: '02',
      tier: '2'
    },
    repairedAt: '2026-08-16 07:15',
    qcInspectedAt: '2026-08-16 08:00',
    qcInspector: 'Vũ Quốc Việt (IICL Certified)',
    qcCertificateNo: 'QC-CERT-MSKU9082341-2026',
    carrierTransmission: {
      status: 'SUCCESS_ACKNOWLEDGED',
      transmittedAt: '2026-08-16 08:14:22',
      transactionRef: 'TX-MAE-8829104',
      ackReferenceNo: 'MAE-ACK-2026-9812401',
      carrierReleaseToken: 'REL-AV-MSK-9901-01',
      carrierMessage: 'Hãng tàu Maersk xác nhận hoàn tất M&R. Trạng thái AV đã mở khóa trên GCSS toàn cầu. Cho phép cấp vỏ đóng hàng xuất khẩu.'
    }
  },
  {
    id: 'GO-CONT-02',
    containerId: 'CONT-ONEU7823419',
    containerNo: 'ONEU7823419',
    isoCode: '45G1',
    size: '40HC',
    type: 'Dry High Cube',
    shippingLine: 'ONE',
    condition: 'AV',
    grade: 'GRADE_A',
    yardLocation: {
      block: 'B',
      bay: '02',
      row: '01',
      tier: '1'
    },
    repairedAt: '2026-08-16 06:45',
    qcInspectedAt: '2026-08-16 07:30',
    qcInspector: 'Vũ Quốc Việt (IICL Certified)',
    qcCertificateNo: 'QC-CERT-ONEU7823419-2026',
    carrierTransmission: {
      status: 'SUCCESS_ACKNOWLEDGED',
      transmittedAt: '2026-08-16 07:30:45',
      transactionRef: 'TX-ONE-7729182',
      ackReferenceNo: 'ONE-ACK-8840192',
      carrierReleaseToken: 'ONE-GO-99184',
      carrierMessage: 'Ocean Network Express (ONE) đã cập nhật inventory AV. Work Order WO-3419 đã quyết toán.'
    }
  },
  {
    id: 'GO-CONT-03',
    containerId: 'CONT-MRKU4521098',
    containerNo: 'MRKU4521098',
    isoCode: '22G1',
    size: '20GP',
    type: 'Dry General',
    shippingLine: 'MAERSK',
    condition: 'AV',
    grade: 'GRADE_A',
    yardLocation: {
      block: 'A',
      bay: '01',
      row: '01',
      tier: '3'
    },
    repairedAt: '2026-08-16 07:00',
    qcInspectedAt: '2026-08-16 07:45',
    qcInspector: 'Phạm Thanh Tuấn (Surveyor Leader)',
    qcCertificateNo: 'QC-CERT-MRKU4521098-2026',
    carrierTransmission: {
      status: 'SUCCESS_ACKNOWLEDGED',
      transmittedAt: '2026-08-16 08:14:22',
      transactionRef: 'TX-MAE-8829104',
      ackReferenceNo: 'MAE-ACK-2026-9812401',
      carrierReleaseToken: 'REL-AV-MSK-9901-02',
      carrierMessage: 'Container condition updated to AV. Ready for customer assignment.'
    }
  },
  {
    id: 'GO-CONT-04',
    containerId: 'CONT-CMAU8812903',
    containerNo: 'CMAU8812903',
    isoCode: '45G1',
    size: '40HC',
    type: 'Dry High Cube',
    shippingLine: 'CMA CGM',
    condition: 'AV',
    grade: 'CARGO_WORTHY',
    yardLocation: {
      block: 'C',
      bay: '03',
      row: '02',
      tier: '1'
    },
    repairedAt: '2026-08-15 16:30',
    qcInspectedAt: '2026-08-15 17:15',
    qcInspector: 'Lê Hoàng Nam (IICL Inspector)',
    qcCertificateNo: 'QC-CERT-CMAU8812903-2026',
    carrierTransmission: {
      status: 'SUCCESS_ACKNOWLEDGED',
      transmittedAt: '2026-08-15 17:20:11',
      transactionRef: 'TX-CMA-9921401',
      ackReferenceNo: 'CMA-ACK-2026-773190',
      carrierReleaseToken: 'CMA-REL-AV-8812903',
      carrierMessage: 'CMA CGM Group phê duyệt trạng thái vỏ Sound / AV. Sẵn sàng cấp phát theo Booking xuất khẩu.'
    }
  },
  {
    id: 'GO-CONT-05',
    containerId: 'CONT-MSCU4412985',
    containerNo: 'MSCU4412985',
    isoCode: '22G1',
    size: '20GP',
    type: 'Dry General',
    shippingLine: 'MSC',
    condition: 'AV',
    grade: 'GRADE_A',
    yardLocation: {
      block: 'A',
      bay: '02',
      row: '03',
      tier: '2'
    },
    repairedAt: '2026-08-15 14:00',
    qcInspectedAt: '2026-08-15 15:00',
    qcInspector: 'Vũ Quốc Việt (IICL Certified)',
    qcCertificateNo: 'QC-CERT-MSCU4412985-2026',
    carrierTransmission: {
      status: 'SUCCESS_ACKNOWLEDGED',
      transmittedAt: '2026-08-15 15:05:30',
      transactionRef: 'TX-MSC-6612940',
      ackReferenceNo: 'MSC-ACK-4412985-OK',
      carrierReleaseToken: 'MSC-GATE-OUT-TOKEN-881',
      carrierMessage: 'Mediterranean Shipping Company (MSC) M&R acknowledged. Status updated to AV.'
    }
  },
  {
    id: 'GO-CONT-06',
    containerId: 'CONT-COSU6629104',
    containerNo: 'COSU6629104',
    isoCode: '45G1',
    size: '40HC',
    type: 'Dry High Cube',
    shippingLine: 'COSCO',
    condition: 'AV',
    grade: 'FOOD_GRADE',
    yardLocation: {
      block: 'B',
      bay: '04',
      row: '01',
      tier: '1'
    },
    repairedAt: '2026-08-15 11:20',
    qcInspectedAt: '2026-08-15 12:00',
    qcInspector: 'Phạm Thanh Tuấn (Surveyor Leader)',
    qcCertificateNo: 'QC-CERT-COSU6629104-2026',
    carrierTransmission: {
      status: 'SUCCESS_ACKNOWLEDGED',
      transmittedAt: '2026-08-15 12:08:44',
      transactionRef: 'TX-COS-1192834',
      ackReferenceNo: 'COS-ACK-992182-IRIS2',
      carrierReleaseToken: 'COS-REL-6629104',
      carrierMessage: 'COSCO IRIS-2 MNR Platform: Container AV condition approved and released.'
    },
    gateOutDetails: {
      eirOutNo: 'EIR-OUT-2026-0891',
      bookingNo: 'BKG-COS-991823',
      truckPlate: '51C-672.19',
      chassisPlate: '51R-098.32',
      driverName: 'Nguyễn Văn Mạnh',
      driverPhone: '0903.112.445',
      driverIdCard: '079088192831',
      truckingCompany: 'Công Ty CP Logistics Quốc Tế Tân Cảng',
      sealNo: 'COS-SEAL-882910',
      customsClearanceNo: 'TK-HQ-2026-99104',
      destinationPort: 'Cảng Cát Lái (VNSGN) - Xuất đi Rotterdam',
      forkliftOperator: 'Nguyễn Văn Ba (Xe nâng #02)',
      gateLane: 'LÀN 03 (CỔNG XUẤT)',
      gateOutTime: '2026-08-16 06:30:15',
      gateStaff: 'Đặng Quốc Huy (Cán bộ Cổng Xuất)',
      note: 'Tài xế đã kiểm tra vỏ ngoài, tình trạng vỏ sạch đẹp đạt Grade A đóng hàng nông sản.'
    }
  }
];

export const MOCK_CARRIER_BOOKINGS: CarrierBookingOrder[] = [
  {
    bookingNo: 'BKG-MAE-882190',
    shippingLine: 'MAERSK',
    customerName: 'Công Ty Cổ Phần Nông Sản Xuất Khẩu Đồng Nai',
    requiredSize: '40HC',
    requiredType: 'Dry High Cube',
    requiredGrade: 'FOOD_GRADE',
    totalQuantity: 5,
    releasedQuantity: 2,
    expiryDate: '2026-08-20',
    status: 'ACTIVE',
    vesselVoyage: 'MAERSK MC-KINNEY MOLLER / V.2608W',
    destinationPort: 'Cảng Los Angeles (USLAX), USA'
  },
  {
    bookingNo: 'BKG-ONE-771923',
    shippingLine: 'ONE',
    customerName: 'Công Ty TNHH May Mặc Quốc Tế Bình Dương',
    requiredSize: '40HC',
    requiredType: 'Dry High Cube',
    requiredGrade: 'GRADE_A',
    totalQuantity: 3,
    releasedQuantity: 1,
    expiryDate: '2026-08-22',
    status: 'ACTIVE',
    vesselVoyage: 'ONE APUS / V.019E',
    destinationPort: 'Cảng Tokyo (JPTYO), Japan'
  },
  {
    bookingNo: 'BKG-CMA-339102',
    shippingLine: 'CMA CGM',
    customerName: 'Tập Đoàn Thủy Sản Minh Phú',
    requiredSize: '20GP',
    requiredType: 'Dry General',
    requiredGrade: 'GRADE_A',
    totalQuantity: 4,
    releasedQuantity: 0,
    expiryDate: '2026-08-25',
    status: 'ACTIVE',
    vesselVoyage: 'CMA CGM JACQUES SAADE / V.9912W',
    destinationPort: 'Cảng Le Havre (FRLEH), France'
  },
  {
    bookingNo: 'BKG-MSC-551029',
    shippingLine: 'MSC',
    customerName: 'Công Ty Gỗ Mỹ Nghệ Hoàng Anh',
    requiredSize: '20GP',
    requiredType: 'Dry General',
    requiredGrade: 'CARGO_WORTHY',
    totalQuantity: 2,
    releasedQuantity: 0,
    expiryDate: '2026-08-19',
    status: 'ACTIVE',
    vesselVoyage: 'MSC GULSUN / V.2611N',
    destinationPort: 'Cảng Hamburg (DEHAM), Germany'
  }
];

export const POPULAR_TRUCKING_COMPANIES = [
  'Công Ty CP Vận Tải & Logistics Á Châu',
  'Công Ty TNHH Giao Nhận Vận Tải Tân Cảng SG',
  'Công Ty CP Dịch Vụ Hàng Hải Quốc Tế Đại Nam',
  'Công Ty TNHH Vận Tải Đa Phương Thức Sao Mai',
  'Công Ty CP Tiếp Vận Toàn Cầu Mekong Log'
];
