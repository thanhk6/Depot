import { CleaningRecordDto, CleaningWorkItemDto, toPublicFileUrl } from '../../../api';
import { CleaningExecutionRecord, CleaningWorkItem } from '../types';

export function mapCleaningWorkItemDto(dto: CleaningWorkItemDto): CleaningWorkItem {
  return {
    id: String(dto.id),
    backendId: dto.id,
    cleaningCode: dto.cleaningCode,
    cleaningName: dto.cleaningName,
    chemicalRequired: dto.chemicalRequired,
    chemicalName: dto.chemicalName || undefined,
    estimatedDurationMin: dto.estimatedDurationMin,
    unitPrice: dto.unitPrice,
    totalPrice: dto.totalPrice,
    responsibleParty: (dto.responsibleParty as CleaningWorkItem['responsibleParty']) || 'U',
    notes: dto.notes || undefined,
    isCompleted: dto.isCompleted,
    completedAt: dto.completedAt || undefined,
    completedBy: dto.completedBy || undefined
  };
}

export function mapCleaningRecordDto(dto: CleaningRecordDto): CleaningExecutionRecord {
  return {
    id: String(dto.id),
    backendId: dto.id,
    containerId: dto.containerNo,
    containerNo: dto.containerNo,
    isoCode: dto.isoCode || '',
    size: dto.sizeType || '',
    type: dto.typeName || '',
    shippingLine: dto.shippingLine || '',
    owner: dto.shippingLine || '',
    surveyNo: '',
    eeirNo: dto.eeirNo || '',
    cleaningBay: dto.cleaningBay || '',
    status: dto.status as CleaningExecutionRecord['status'],
    surveyCondition: 'CL',
    startedAt: dto.startedAt || undefined,
    completedAt: dto.completedAt || undefined,
    cleaningStaff: dto.cleaningStaff || '',
    waterPressureBar: dto.waterPressureBar,
    chemicalUsed: dto.chemicalUsed || undefined,
    chemicalVolumeLiters: dto.chemicalVolumeLiters || undefined,
    temperatureCelsius: dto.temperatureCelsius || undefined,
    targetQualityGrade: dto.targetQualityGrade as CleaningExecutionRecord['targetQualityGrade'],
    beforeCleaningPhoto: toPublicFileUrl(dto.beforeCleaningPhotoUrl),
    beforePhotoTimestamp: dto.beforePhotoTimestamp || '',
    afterCleaningPhoto: toPublicFileUrl(dto.afterCleaningPhotoUrl),
    afterPhotoTimestamp: dto.afterPhotoTimestamp || '',
    items: dto.items.map(mapCleaningWorkItemDto),
    totalCost: dto.totalCostVnd,
    cleaningNotes: dto.cleaningNotes || undefined,
    handoverToOperationDate: dto.handoverToOperationDate || undefined,
    handoverActor: dto.handoverActor || undefined
  };
}
