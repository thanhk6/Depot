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
        Task<List<DepotJob>> GetAllJobsAsync(DepotJobFilterRequest? filter = null);
        Task<DepotJob?> GetJobByIdAsync(long id);
        Task<DepotJob?> GetJobByContainerNoAsync(string containerNo);
        Task<List<DepotJobHistoryDto>> GetHistoryAsync(long jobId);
        Task<bool> DeleteJobAsync(long jobId, string deletedBy);
        Task<bool> UpdateJobStatusAsync(long jobId, UpdateJobStatusRequest request);
        Task<DepotJob> CreateGateInJobAsync(CreateDepotJobRequest request);
        Task<bool> SubmitSurveyAsync(long jobId, SurveyRecordViewModel surveyVm);
        Task<DepotJob> ClaimSurveyAsync(long jobId, long staffId);
        Task<bool> ReleaseSurveyClaimAsync(long jobId, long staffId);
        Task<bool> CreateOrUpdateEstimateAsync(long jobId, EstimateViewModel estimateVm);
        Task<bool> ApproveEstimateAsync(long jobId, string approverName);
        Task<bool> RejectEstimateAsync(long jobId, RejectEstimateRequest request);
        Task<bool> ProcessBankWebhookPaymentAsync(BankWebhookPaymentRequest webhook);
        Task<bool> ProcessPaymentAsync(long jobId, ProcessPaymentRequest request);
        Task<object?> CreateServiceOrderAsync(CreateServiceOrderRequest request);
        Task<List<Depot.Data.Entities.Finance.ServiceOrder>> GetServiceOrdersAsync(string? jobNo = null);
        Task<Depot.Data.Entities.Finance.ServiceOrder?> UpdateServiceOrderAsync(long orderId, UpdateServiceOrderRequest request);
        Task<bool> CancelServiceOrderAsync(long orderId);
        Task<bool> CompleteForkliftMoveAsync(long jobId, ForkliftMoveRequest request);
        Task<bool> StartRepairAsync(long jobId, string technicianId, string technicianName);
        Task<bool> AssignRepairAsync(long jobId, RepairAssignRequest request);
        Task<bool> CompleteRepairAsync(long jobId, RepairCompleteRequest request);
        Task<bool> CompleteQcInspectionAsync(QcInspectionRequest qcReq);
        Task<bool> DispatchForkliftMoveAsync(ForkliftMoveOrderRequest moveReq);
        Task<bool> GateOutAsync(long jobId, GateOutRequest request);
        Task<DepotStatisticsSummaryDto> GetDashboardStatsAsync();
        Task<KpiSummaryDto> GetKpiSummaryAsync();
    }
}
