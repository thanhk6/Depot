using System;
using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.Depot
{
    /// <summary>
    /// Một ảnh hiện trường (toàn cảnh/chi tiết/gioăng cửa/sàn...) đính kèm phiếu giám định.
    /// Bảng con thuộc Survey, ghi lại toàn bộ mỗi lần lưu — không tự đứng riêng.
    /// </summary>
    public class SurveyPhotoItem : FullAuditedEntity<long>
    {
        public long SurveyId { get; set; }
        public virtual Survey? Survey { get; set; }

        public string Url { get; set; } = string.Empty;
        /// <summary>OVERVIEW / DETAIL / DOOR_SEAL / INTERIOR_FLOOR / REEFER_PANEL / OTHER.</summary>
        public string Type { get; set; } = "OVERVIEW";
        public string? Caption { get; set; }
        public string? SurveyorName { get; set; }
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
        public int? FileSizeKb { get; set; }
    }
}
