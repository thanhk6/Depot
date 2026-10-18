using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Depot.Data.Entities.Depot;
using Depot.ViewModels;

namespace Depot.Application.Services
{
    /// <summary>
    /// Use-cases cho vòng đời container: Gate-In, EMR, QC, Yard, Payment và Gate-Out.
    /// Controller chỉ validate request và gọi các method ở đây.
    /// </summary>
    public interface IDepotJobService
    {
        Task<List<DepotJobDto>> GetAllJobsAsync(DepotJobFilterRequest? filter = null);
        Task<DepotJobDto?> GetJobByIdAsync(long id);
        Task<DepotJobDto?> GetJobByContainerNoAsync(string containerNo);
        Task<List<DepotJobHistoryDto>?> GetHistoryAsync(long jobId);
        Task<bool> DeleteJobAsync(long jobId, string deletedBy);
        Task<bool> UpdateJobStatusAsync(long jobId, UpdateJobStatusRequest request, string? actor = null);
        Task<DepotJob> CreateGateInJobAsync(CreateDepotJobRequest request);
        Task<bool> SubmitSurveyAsync(long jobId, SurveyRecordViewModel surveyVm);
        Task<DepotJob> ClaimSurveyAsync(long jobId, long staffId);
        Task<bool> ReleaseSurveyClaimAsync(long jobId, long staffId);
        Task<bool> CreateOrUpdateEstimateAsync(long jobId, EstimateViewModel estimateVm);
        /// <summary>Ghi nhận lệnh duyệt của hãng tàu (nhập tay). enteredBy = nhân viên depot đang đăng nhập.</summary>
        Task<bool> ApproveEstimateAsync(long jobId, ApproveEstimateRequest request, string enteredBy);
        /// <summary>Người báo giá xác nhận báo giá trên hệ thống (dùng khi chưa có API hãng tàu).</summary>
        Task ConfirmEstimateAsync(long jobId, string confirmedBy);
        Task<bool> RejectEstimateAsync(long jobId, RejectEstimateRequest request, string recordedBy);
        Task<bool> ProcessBankWebhookPaymentAsync(BankWebhookPaymentRequest webhook);
        Task<ProcessPaymentResult> ProcessPaymentAsync(long jobId, ProcessPaymentRequest request, string? cashierName);
        Task<List<PaymentLogItem>> GetPaymentLogsAsync(PaymentLogFilter filter);
        Task<object?> CreateServiceOrderAsync(CreateServiceOrderRequest request);
        Task<List<Depot.Data.Entities.Finance.ServiceOrder>> GetServiceOrdersAsync(string? jobNo = null);
        Task<Depot.Data.Entities.Finance.ServiceOrder?> UpdateServiceOrderAsync(long orderId, UpdateServiceOrderRequest request);
        Task<bool> CancelServiceOrderAsync(long orderId);
        Task<bool> CompleteForkliftMoveAsync(long jobId, ForkliftMoveRequest request);
        Task<DepotJob> ClaimForkliftJobAsync(long jobId, string operatorId, string operatorName, string vehicleCode);
        Task<bool> StartForkliftExecutionAsync(long jobId, string operatorId);
        Task<bool> CancelForkliftClaimAsync(long jobId, string operatorId);
        Task<bool> StartRepairAsync(long jobId, string technicianId, string technicianName);
        Task<bool> AssignRepairAsync(long jobId, RepairAssignRequest request);
        Task<bool> CompleteRepairAsync(long jobId, RepairCompleteRequest request);
        /// <summary>Id RepairOrder của job (null nếu chưa có); requireRepairing = chỉ trả khi job đang REPAIRING.</summary>
        Task<long?> GetRepairOrderIdAsync(long jobId, bool requireRepairing);
        Task<bool> CompleteQcInspectionAsync(long jobId, QcInspectionRequest qcReq, string inspector);
        Task<bool> DispatchForkliftMoveAsync(ForkliftMoveOrderRequest moveReq);
        Task GateOutAsync(long jobId, GateOutRequest request, string actor);
        Task<GateOutBookingCheckResult> CheckGateOutBookingAsync(long jobId, string? bookingNo);
        Task<int> GetBookingValidityHoursAsync();
        Task<DepotStatisticsSummaryDto> GetDashboardStatsAsync();
        Task<KpiSummaryDto> GetKpiSummaryAsync();
    }
}
