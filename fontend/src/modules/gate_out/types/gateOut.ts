export type GateOutStatus = 'READY_IN_YARD' | 'PROCESSING_GATE_OUT' | 'GATE_OUT_COMPLETED' | 'HOLD';

export interface GateOutContainerRecord {
  id: string;
  containerId: string;
  containerNo: string;
  isoCode: string;
  size: string;
  type: string;
  shippingLine: string;
  condition: 'AV';
  grade: 'GRADE_A' | 'GRADE_B' | 'FOOD_GRADE' | 'CARGO_WORTHY';
  yardLocation: {
    block: string;
    bay: string;
    row: string;
    tier: string;
  };
  repairedAt: string;
  qcInspectedAt: string;
  qcInspector: string;
  qcCertificateNo: string;
  // Carrier API / EDI transmission status
  carrierTransmission: {
    status: 'SUCCESS_ACKNOWLEDGED' | 'MANUAL_RELEASE' | 'NOT_SENT';
    transmittedAt: string;
    transactionRef: string;
    ackReferenceNo: string;
    carrierReleaseToken: string;
    carrierMessage: string;
  };
  // Gate out completion details (when truck arrives and picks up)
  gateOutDetails?: {
    eirOutNo: string;
    bookingNo: string;
    truckPlate: string;
    chassisPlate: string;
    driverName: string;
    driverPhone: string;
    driverIdCard?: string;
    truckingCompany: string;
    sealNo?: string;
    customsClearanceNo?: string;
    destinationPort?: string;
    forkliftOperator: string;
    gateLane: string;
    gateOutTime: string;
    gateStaff: string;
    note?: string;
  };
}

export interface CarrierBookingOrder {
  bookingNo: string;
  shippingLine: string;
  customerName: string;
  requiredSize: string;
  requiredType: string;
  requiredGrade: string;
  totalQuantity: number;
  releasedQuantity: number;
  expiryDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'FULFILLED';
  vesselVoyage: string;
  destinationPort: string;
}
