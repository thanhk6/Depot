using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.Depot
{
    /// <summary>
    /// Trạng thái Đạt/Không Đạt/N-A của 1 trong 11 khu vực khảo sát chuẩn IICL-6 (Nóc, Vách, Cửa,
    /// Sàn, Khung, Gù góc, Gầm, Thiết bị lạnh, Vệ sinh...). Bảng con thuộc Survey, ghi lại toàn bộ
    /// mỗi lần lưu — không tự đứng riêng.
    /// </summary>
    public class SurveyChecklistItem : FullAuditedEntity<long>
    {
        public long SurveyId { get; set; }
        public virtual Survey? Survey { get; set; }

        /// <summary>Mã khu vực, vd ROOF/FRONT_WALL/DOOR/FLOOR/CLEANING... (khớp InspectionZoneKey frontend).</summary>
        public string ZoneKey { get; set; } = string.Empty;
        public string ZoneName { get; set; } = string.Empty;
        /// <summary>PASS / FAIL / NA.</summary>
        public string Status { get; set; } = "PASS";
        public string? Notes { get; set; }
        public int DamageCount { get; set; }
    }
}
