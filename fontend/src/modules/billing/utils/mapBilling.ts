import { ShippingLineDebt, DebtPeriod, Payment, PaymentAllocation, DebtAgingBucket } from '../types';

export function mapDebtDto(dto: any): ShippingLineDebt {
  return {
    id: dto.code,
    shippingLineId: dto.shippingLineCode,
    shippingLineName: dto.shippingLineName,
    containerId: dto.containerNo,
    containerNo: dto.containerNo,
    quotationId: dto.quotationNo,
    quotationNo: dto.quotationNo,
    repairId: dto.repairNo,
    repairNo: dto.repairNo,
    invoiceId: dto.invoiceNo || undefined,
    invoiceNo: dto.invoiceNo || undefined,
    debtPeriodId: dto.debtPeriodCode,
    debtDate: (dto.debtDate || '').substring(0, 10),
    dueDate: (dto.dueDate || '').substring(0, 10),
    serviceType: dto.serviceType,
    description: dto.description,
    totalAmount: dto.totalAmountVnd,
    paidAmount: dto.paidAmountVnd,
    remainingAmount: dto.remainingAmountVnd,
    status: dto.status,
    currency: 'VND',
    createdAt: dto.createdAt || '',
    updatedAt: dto.lastModifiedAt || dto.createdAt || '',
    notes: dto.notes || undefined,
    approvalRef: dto.approvalRef || undefined
  };
}

export function mapPeriodDto(dto: any): DebtPeriod {
  return {
    id: dto.code,
    shippingLineId: dto.shippingLineCode,
    shippingLineName: dto.shippingLineName,
    periodCode: dto.periodCode,
    fromDate: (dto.fromDate || '').substring(0, 10),
    toDate: (dto.toDate || '').substring(0, 10),
    openingBalance: dto.openingBalanceVnd,
    periodDebit: dto.periodDebitVnd,
    periodCredit: dto.periodCreditVnd,
    closingBalance: dto.closingBalanceVnd,
    status: dto.status,
    createdAt: dto.createdAt || '',
    updatedAt: dto.lastModifiedAt || dto.createdAt || '',
    closedAt: dto.closedAt || undefined,
    closedBy: dto.closedBy || undefined,
    currency: 'VND'
  };
}

export function mapAllocationDto(dto: any): PaymentAllocation {
  return {
    id: dto.code,
    paymentId: dto.arPaymentCode,
    shippingLineDebtId: dto.shippingLineDebtCode,
    containerNo: dto.containerNo,
    quotationNo: dto.quotationNo,
    allocatedAmount: dto.allocatedAmountVnd,
    currency: 'VND',
    createdAt: dto.createdAt || ''
  };
}

export function mapPaymentDto(dto: any): Payment {
  return {
    id: dto.code,
    shippingLineId: dto.shippingLineCode,
    shippingLineName: dto.shippingLineName,
    paymentDate: (dto.paymentDate || '').substring(0, 10),
    paymentAmount: dto.paymentAmountVnd,
    currency: 'VND',
    paymentMethod: dto.paymentMethod,
    bankName: dto.bankName || '',
    referenceNo: dto.referenceNo || '',
    status: dto.status,
    notes: dto.notes || undefined,
    recordedBy: dto.recordedBy,
    createdAt: dto.createdAt || '',
    reversedBy: dto.reversedBy || undefined,
    reversedAt: dto.reversedAt || undefined,
    reversalReason: dto.reversalReason || undefined,
    allocations: (dto.allocations || []).map(mapAllocationDto)
  };
}

export function mapAgingDto(dto: any): DebtAgingBucket {
  return {
    shippingLineId: dto.shippingLineCode,
    shippingLineName: dto.shippingLineName,
    currency: 'VND',
    bucketNotDue: Number(dto.bucketNotDue) || 0,
    bucket0_30: dto.bucket0_30,
    bucket31_60: dto.bucket31_60,
    bucket61_90: dto.bucket61_90,
    bucketOver90: dto.bucketOver90,
    overdueTotal: Number(dto.overdueTotal) || 0,
    totalReceivable: dto.totalReceivable
  };
}
