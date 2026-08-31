namespace Depot.ViewModels;

public sealed class CreateCleaningWorkItemRequest
{
    public string CleaningCode { get; set; } = string.Empty;
    public string CleaningName { get; set; } = string.Empty;
    public bool ChemicalRequired { get; set; }
    public string? ChemicalName { get; set; }
    public int EstimatedDurationMin { get; set; } = 25;
    public decimal UnitPrice { get; set; }
    public string ResponsibleParty { get; set; } = "U";
    public string? Notes { get; set; }
}

public sealed class CreateCleaningRecordRequest
{
    public string ContainerNo { get; set; } = string.Empty;
    public string? JobNo { get; set; }
    public string? IsoCode { get; set; }
    public string? SizeType { get; set; }
    public string? TypeName { get; set; }
    public string? ShippingLine { get; set; }
    public string? EeirNo { get; set; }
    public string? CleaningBay { get; set; }
    public string? CleaningStaff { get; set; }
    public string TargetQualityGrade { get; set; } = "GRADE_A";
    public string? Notes { get; set; }
    public List<CreateCleaningWorkItemRequest> Items { get; set; } = new();
}

public sealed class ToggleCleaningItemRequest
{
    public bool IsCompleted { get; set; }
    public string? PerformedBy { get; set; }
}

public sealed class CompleteAllCleaningItemsRequest
{
    public string? PerformedBy { get; set; }
}

public sealed class UpdateCleaningExecutionRequest
{
    public string? CleaningStaff { get; set; }
    public int? WaterPressureBar { get; set; }
    public string? ChemicalUsed { get; set; }
    public decimal? ChemicalVolumeLiters { get; set; }
    public decimal? TemperatureCelsius { get; set; }
    public string? TargetQualityGrade { get; set; }
    public string? CleaningNotes { get; set; }
    public string? AfterCleaningPhotoUrl { get; set; }
}

public sealed class HandoverCleaningRequest
{
    public string HandoverActor { get; set; } = string.Empty;
}
