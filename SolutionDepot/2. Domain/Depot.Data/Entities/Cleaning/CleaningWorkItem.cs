using System;
using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.Cleaning;

/// <summary>
/// Một hạng mục dịch vụ vệ sinh cụ thể thuộc 1 lệnh vệ sinh (CleaningRecord).
/// </summary>
public class CleaningWorkItem : FullAuditedEntity<long>
{
    /// <summary>Mã lệnh vệ sinh cha (CleaningRecord.Code) mà hạng mục này thuộc về.</summary>
    public string CleaningRecordCode { get; set; } = string.Empty;
    /// <summary>Mã dịch vụ vệ sinh (vd SW, WW, CW, DO, WF, SR).</summary>
    public string CleaningCode { get; set; } = string.Empty;
    /// <summary>Tên hạng mục dịch vụ.</summary>
    public string CleaningName { get; set; } = string.Empty;
    /// <summary>Có cần dùng hóa chất hay không.</summary>
    public bool ChemicalRequired { get; set; }
    /// <summary>Tên hóa chất sử dụng nếu có.</summary>
    public string? ChemicalName { get; set; }
    /// <summary>Thời gian định mức thi công (phút).</summary>
    public int EstimatedDurationMin { get; set; }
    /// <summary>Đơn giá dịch vụ (VNĐ).</summary>
    public decimal UnitPrice { get; set; }
    /// <summary>Thành tiền dịch vụ (VNĐ).</summary>
    public decimal TotalPrice { get; set; }
    /// <summary>Bên chịu trách nhiệm chi phí: O (Owner) / U (User) / T (Truck) / I (Insurance).</summary>
    public string ResponsibleParty { get; set; } = "U";
    /// <summary>Ghi chú kỹ thuật cho hạng mục.</summary>
    public string? Notes { get; set; }
    /// <summary>Đã hoàn thành hạng mục hay chưa.</summary>
    public bool IsCompleted { get; set; }
    /// <summary>Thời điểm hoàn thành hạng mục.</summary>
    public DateTime? CompletedAt { get; set; }
    /// <summary>Người thực hiện hoàn thành hạng mục.</summary>
    public string? CompletedBy { get; set; }

    /// <summary>Điều hướng tới lệnh vệ sinh cha.</summary>
    public virtual CleaningRecord? CleaningRecord { get; set; }
}
