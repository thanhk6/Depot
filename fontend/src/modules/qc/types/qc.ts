export interface QCCheckItem {
  id: string;
  category: 'LIGHT' | 'WATER' | 'STRUCTURE' | 'FLOOR' | 'PAINT' | 'DOOR' | 'CLEANLINESS';
  titleVi: string;
  standardVi: string;
  isPassed: boolean;
  notes?: string;
  defectPhotoUrl?: string;
}

export interface ShippingLineDispatchInfo {
  status: 'PENDING_TRANSMISSION' | 'TRANSMITTED' | 'FAILED';
  transmittedAt?: string;
  transmittedMethod?: 'EDI_WESTIM' | 'EMAIL_REPORT' | 'API_WEBHOOK' | 'MANUAL_DISPATCH';
  transmissionRefNo?: string;
  recipientEmail?: string;
  notes?: string;
  approvedCostUSD?: number;
  approvedCostVND?: number;
  ediContent?: string;
}

export interface QCInspectionRecord {
  id: string;
  containerId: string;
  containerNo: string;
  isoCode: string;
  size: string;
  type: string;
  shippingLine: string;
  workOrderNo: string;
  estimateNo: string;
  technicianName: string;
  yardLocation: {
    block: string;
    bay: string;
    row: string;
    tier: string;
  };
  repairedAt: string;
  inspectedAt?: string;
  inspectorName: string;
  certificateNo?: string;
  checkItems: QCCheckItem[];
  beforePhotos: { url: string; label: string; location: string }[];
  afterPhotos: { url: string; label: string; location: string }[];
  failPhotos?: { url: string; label: string; location: string; timestamp?: string }[];
  requirePhotoRetake?: boolean;
  qcResult: 'PENDING' | 'PASS' | 'FAIL';
  reworkReason?: string;
  inspectorComments: string;
  releasedGrade?: 'GRADE_A' | 'GRADE_B' | 'GRADE_C' | 'CARGO_WORTHY';
  shippingDispatch?: ShippingLineDispatchInfo;
}
