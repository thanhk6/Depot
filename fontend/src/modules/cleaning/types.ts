export interface CleaningWorkItem {
  id: string;
  /** Id số nguyên thật của hạng mục trên backend (chỉ có khi lệnh vệ sinh đã được tạo qua API). */
  backendId?: number;
  cleaningCode: string;
  cleaningName: string;
  chemicalRequired: boolean;
  chemicalName?: string;
  estimatedDurationMin: number;
  unitPrice: number;
  totalPrice: number;
  responsibleParty: 'O' | 'U' | 'T' | 'I'; // Owner, User, Truck, Insurance
  notes?: string;
  isCompleted: boolean;
  completedAt?: string;
  completedBy?: string;
}

export interface CleaningExecutionRecord {
  id: string;
  /** Id số nguyên thật của lệnh vệ sinh trên backend (CleaningRecord.Id) — chỉ có khi đã tạo qua API. */
  backendId?: number;
  containerId: string;
  containerNo: string;
  isoCode: string;
  size: string;
  type: string;
  shippingLine: string;
  owner: string;
  surveyNo: string;
  eeirNo: string;
  cleaningBay: string;
  status: 'PENDING_CLEANING' | 'IN_CLEANING' | 'CLEANED' | 'HANDOVER_TO_OPERATION';
  surveyCondition: 'CL';
  surveyGrade?: string;
  cleaningStaff: string;
  assignedStaffPhone?: string;
  startedAt?: string;
  completedAt?: string;
  waterPressureBar: number;
  chemicalUsed?: string;
  chemicalVolumeLiters?: number;
  temperatureCelsius?: number;
  targetQualityGrade: 'GRADE_A' | 'FOOD_GRADE' | 'GENERAL_CARGO' | 'SCRAP_GRADE';
  beforeCleaningPhoto: string;
  beforePhotoTimestamp: string;
  afterCleaningPhoto: string;
  afterPhotoTimestamp: string;
  items: CleaningWorkItem[];
  totalCost: number;
  cleaningNotes?: string;
  handoverToOperationDate?: string;
  handoverActor?: string;
}
