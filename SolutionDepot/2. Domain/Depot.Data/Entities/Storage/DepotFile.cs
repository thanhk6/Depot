using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.Storage
{
    /// <summary>
    /// Bảng lưu trữ tập trung mọi file đính kèm (ảnh, video, chứng chỉ...) của toàn hệ thống — 1 dòng ứng
    /// với 1 file vật lý, gắn vào bản ghi nghiệp vụ bất kỳ qua cặp (TableName, IdTable) thay vì FK cứng,
    /// để dùng chung được cho mọi entity (DamageItem, SurveyPhotoItem, CleaningRecord...) mà không phải
    /// thêm cột/bảng file riêng cho từng domain. Vì đích tham chiếu thay đổi tuỳ dòng nên KHÔNG khai báo
    /// quan hệ HasOne/WithMany trong EF — Service tự validate (TableName, IdTable) tồn tại khi cần.
    /// </summary>
    public class DepotFile : FullAuditedEntity<long>
    {
        /// <summary>Id của bản ghi nghiệp vụ mà file này đính kèm vào (vd DamageItem.Id, Survey.Id...).</summary>
        public long IdTable { get; set; }
        /// <summary>Tên bảng/entity chứa bản ghi ở trên (vd "DamageItem", "Survey") — dùng cùng IdTable để tra ngược.</summary>
        public string TableName { get; set; } = string.Empty;
        /// <summary>Tên file vật lý đã lưu trên storage (GUID hoá để tránh trùng tên/đụng ký tự đặc biệt).</summary>
        public string NameGuid { get; set; } = string.Empty;
        /// <summary>Tên file gốc do người dùng upload, hiển thị lại cho dễ nhận biết.</summary>
        public string Name { get; set; } = string.Empty;
        /// <summary>Địa chỉ server lưu file vật lý (phục vụ hạ tầng nhiều server/CDN sau này).</summary>
        public string IpServer { get; set; } = string.Empty;
        /// <summary>Loại file: 1 = ảnh mô tả, 2 = video, 3 = chứng chỉ/giấy tờ.</summary>
        public byte Type { get; set; }
        /// <summary>Đường dẫn tới file trên storage.</summary>
        public string Path { get; set; } = string.Empty;
        /// <summary>Phần mở rộng/loại file (vd "jpg", "mp4", "pdf").</summary>
        public string FileType { get; set; } = string.Empty;
    }
}
