using System;
using System.Collections.Generic;
using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.Cleaning;

/// <summary>
/// Lệnh vệ sinh container tại Tổ Vệ Sinh (Cleaning Bay), phát sinh từ e-EIR có kết luận CL.
/// </summary>
public class CleaningRecord : FullAuditedEntity<long>
{
    /// <summary>Mã nghiệp vụ duy nhất của lệnh vệ sinh (business key).</summary>
    public string Code { get; set; } = string.Empty;
    /// <summary>Mã Job depot liên kết (DepotJob.JobNo) nếu container đã có job trong hệ thống.</summary>
    public string? JobNo { get; set; }
    /// <summary>Số container được vệ sinh.</summary>
    public string ContainerNo { get; set; } = string.Empty;
    /// <summary>Mã ISO loại container (vd 45G1).</summary>
    public string? IsoCode { get; set; }
    /// <summary>Cỡ/loại container (vd 40HC).</summary>
    public string? SizeType { get; set; }
    /// <summary>Tên loại container tiếng Việt hiển thị.</summary>
    public string? TypeName { get; set; }
    /// <summary>Hãng tàu sở hữu container.</summary>
    public string? ShippingLine { get; set; }
    /// <summary>Số phiếu e-EIR liên quan.</summary>
    public string? EeirNo { get; set; }
    /// <summary>Bệ rửa được chỉ định thực hiện.</summary>
    public string? CleaningBay { get; set; }
    /// <summary>Trạng thái lệnh vệ sinh: PENDING_CLEANING, IN_CLEANING, CLEANED, HANDOVER_TO_OPERATION.</summary>
    public string Status { get; set; } = "PENDING_CLEANING";
    /// <summary>Kỹ thuật viên phụ trách vệ sinh.</summary>
    public string? CleaningStaff { get; set; }
    /// <summary>Áp lực nước xịt rửa thực tế (Bar).</summary>
    public int WaterPressureBar { get; set; }
    /// <summary>Hóa chất đã sử dụng.</summary>
    public string? ChemicalUsed { get; set; }
    /// <summary>Lượng hóa chất sử dụng (lít).</summary>
    public decimal? ChemicalVolumeLiters { get; set; }
    /// <summary>Nhiệt độ xử lý/sấy (độ C).</summary>
    public decimal? TemperatureCelsius { get; set; }
    /// <summary>Phân hạng chất lượng mục tiêu/đã đạt sau vệ sinh.</summary>
    public string TargetQualityGrade { get; set; } = "GRADE_A";
    /// <summary>Ảnh minh chứng trước khi vệ sinh.</summary>
    public string? BeforeCleaningPhotoUrl { get; set; }
    /// <summary>Thời điểm chụp ảnh trước vệ sinh.</summary>
    public DateTime? BeforePhotoTimestamp { get; set; }
    /// <summary>Ảnh minh chứng sau khi vệ sinh.</summary>
    public string? AfterCleaningPhotoUrl { get; set; }
    /// <summary>Thời điểm chụp ảnh sau vệ sinh.</summary>
    public DateTime? AfterPhotoTimestamp { get; set; }
    /// <summary>Tổng cước vệ sinh (VNĐ), tính từ tổng các hạng mục dịch vụ.</summary>
    public decimal TotalCostVnd { get; set; }
    /// <summary>Ghi chú nghiệm thu của nhân viên vệ sinh.</summary>
    public string? CleaningNotes { get; set; }
    /// <summary>Thời điểm bắt đầu thi công.</summary>
    public DateTime? StartedAt { get; set; }
    /// <summary>Thời điểm hoàn tất vệ sinh.</summary>
    public DateTime? CompletedAt { get; set; }
    /// <summary>Thời điểm bàn giao sang Khai Thác (AV).</summary>
    public DateTime? HandoverToOperationDate { get; set; }
    /// <summary>Người thực hiện bàn giao.</summary>
    public string? HandoverActor { get; set; }

    /// <summary>Danh mục hạng mục dịch vụ vệ sinh của lệnh này.</summary>
    public virtual ICollection<CleaningWorkItem> Items { get; set; } = new List<CleaningWorkItem>();
}
