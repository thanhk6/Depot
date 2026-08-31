using System.Collections.Generic;

namespace Depot.ViewModels
{
    public class WorkflowStepDto
    {
        public string Id { get; set; } = string.Empty;
        public string Number { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string ModuleTarget { get; set; } = string.Empty;
        public string Summary { get; set; } = string.Empty;
        public List<string> Details { get; set; } = new();
        public List<string> NextSteps { get; set; } = new();
    }

    public class WorkflowSummaryDto
    {
        public int TotalJobs { get; set; }
        public int GateInCount { get; set; }
        public int SurveyingCount { get; set; }
        public int EstimatingCount { get; set; }
        public int AwaitingApprovalCount { get; set; }
        public int RepairingCount { get; set; }
        public int QcCount { get; set; }
        public int ReadyForOutCount { get; set; }
        public int GateOutCount { get; set; }
    }
}
