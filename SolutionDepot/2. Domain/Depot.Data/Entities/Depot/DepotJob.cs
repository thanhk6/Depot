using System;
using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.Depot
{
    /// <summary>
    /// Aggregate root của một vòng đời container trong depot.
    /// Các bảng Survey/Estimate/Repair/Payment/Audit liên kết nghiệp vụ bằng JobNo.
    /// </summary>
    public class DepotJob : FullAuditedEntity<long>
    {
        /// <summary>Mã nghiệp vụ duy nhất của job trong depot.</summary>
        public string JobNo { get; set; } = string.Empty;
        /// <summary>Số container đang được xử lý.</summary>
        public string ContainerNo { get; set; } = string.Empty;
        /// <summary>Cỡ/loại container theo ISO.</summary>
        public string IsoSize { get; set; } = "40HC";
        /// <summary>Khóa ngoại trỏ tới ShippingLine.Id.</summary>
        public long ShippingLineId { get; set; }
        /// <summary>Trọng lượng vỏ container (kg).</summary>
        public int TareWeightKg { get; set; } = 3820;
        /// <summary>Khối lượng hàng tối đa cho phép (kg).</summary>
        public int MaxPayloadKg { get; set; } = 28680;
        /// <summary>Trạng thái nghiệp vụ hiện tại của job.</summary>
        public string Status { get; set; } = "GATE_IN";
        /// <summary>Thời điểm tiếp nhận Gate-In.</summary>
        public DateTime GateInDate { get; set; } = DateTime.UtcNow;
        /// <summary>Thời điểm Gate-Out nếu đã xuất cổng.</summary>
        public DateTime? GateOutDate { get; set; }
        /// <summary>Biển số xe đầu kéo khi Gate-Out.</summary>
        public string? GateOutTruckPlate { get; set; }
        /// <summary>Tên tài xế khi Gate-Out.</summary>
        public string? GateOutDriverName { get; set; }
        /// <summary>Biển số rơ-moóc khi Gate-Out.</summary>
        public string? GateOutTrailerPlate { get; set; }
        /// <summary>Số seal khi Gate-Out.</summary>
        public string? GateOutSealNo { get; set; }
        /// <summary>Số e-EIR khi Gate-In.</summary>
        public string? GateInEirNo { get; set; }
        /// <summary>Số e-EIR khi Gate-Out.</summary>
        public string? GateOutEirNo { get; set; }

        /// <summary>Biển số xe đầu kéo giao container vào lúc Gate-In.</summary>
        public string? GateInTruckPlate { get; set; }
        /// <summary>Biển số rơ-moóc lúc Gate-In.</summary>
        public string? GateInTrailerPlate { get; set; }
        /// <summary>Tên tài xế giao container lúc Gate-In.</summary>
        public string? GateInDriverName { get; set; }
        /// <summary>SĐT tài xế nhận e-EIR SMS lúc Gate-In.</summary>
        public string? GateInDriverPhone { get; set; }
        /// <summary>Số seal lúc hạ vỏ Gate-In.</summary>
        public string? GateInSealNo { get; set; }
        /// <summary>Số bằng lái xe của tài xế giao container lúc Gate-In — form Survey/Gate-In có thu thập
        /// nhưng trước đây không có cột nào lưu, mất trắng sau khi nộp phiếu.</summary>
        public string? GateInDriverLicense { get; set; }
        /// <summary>Số seal hải quan (khác với GateInSealNo là seal hãng tàu) kiểm tra lúc Gate-In.</summary>
        public string? GateInCustomsSealNo { get; set; }
        /// <summary>Số booking liên quan lúc Gate-In.</summary>
        public string? GateInBookingNo { get; set; }
        /// <summary>Đơn vị vận tải giao container lúc Gate-In.</summary>
        public string? GateInTruckingCompany { get; set; }
        /// <summary>Ghi chú tiếp nhận tại cổng lúc Gate-In.</summary>
        public string? GateInRemarks { get; set; }
        /// <summary>Khóa ngoại trỏ tới Users.Id — nhân viên đang đăng nhập thực hiện Gate-In, hệ thống tự lấy, không cho chọn tay.</summary>
        public long? GateInStaffId { get; set; }
        /// <summary>Họ tên nhân viên Gate-In tại thời điểm tiếp nhận (snapshot, không đổi dù tài khoản đó sau này đổi tên).</summary>
        public string? GateInStaffName { get; set; }

        /// <summary>Khóa ngoại trỏ tới Users.Id — giám định viên đang giữ khóa "nhận giám định" container này,
        /// null nếu chưa ai nhận. Dùng để chặn 2 người cùng mở 1 container đồng thời (xem ClaimSurveyAsync).</summary>
        public long? SurveyClaimedByStaffId { get; set; }
        /// <summary>Họ tên giám định viên đang giữ khóa (snapshot hiển thị nhanh, không cần join Users).</summary>
        public string? SurveyClaimedByName { get; set; }
        /// <summary>Thời điểm nhận khóa giám định; dùng để tự động hết hạn khóa nếu bỏ ngang quá lâu.</summary>
        public DateTime? SurveyClaimedAt { get; set; }

        /// <summary>Mã tài xế xe nâng đang giữ khóa "nhận lệnh" cho lần di chuyển đang chờ hiện tại (nếu
        /// job đang ở trạng thái cần xe nâng di chuyển), null nếu chưa ai nhận. Không phải FK tới Users.Id
        /// vì tài xế xe nâng hiện là hồ sơ ca trực giả lập ở frontend (FORKLIFT_OPERATORS), chưa có tài
        /// khoản đăng nhập thật — cùng lý do GateInStaffName/TechnicianName dùng string thay vì FK. Dùng để
        /// chặn 2 tài xế trên 2 tablet khác nhau cùng nhận 1 lần di chuyển (xem ClaimForkliftJobAsync) —
        /// trước đây việc nhận lệnh hoàn toàn cục bộ trên trình duyệt, không đồng bộ giữa các tablet.</summary>
        public string? ForkliftClaimedByOperatorId { get; set; }
        /// <summary>Họ tên tài xế xe nâng đang giữ khóa (snapshot hiển thị nhanh).</summary>
        public string? ForkliftClaimedByOperatorName { get; set; }
        /// <summary>Mã xe nâng được chọn khi nhận lệnh.</summary>
        public string? ForkliftAssignedVehicleCode { get; set; }
        /// <summary>Thời điểm nhận khóa lệnh xe nâng.</summary>
        public DateTime? ForkliftClaimedAt { get; set; }
        /// <summary>Thời điểm tài xế bấm "Bắt đầu thực hiện" (chuyển IN_PROGRESS).</summary>
        public DateTime? ForkliftStartedAt { get; set; }

        /// <summary>Mã block bãi hiện tại. Rỗng = chưa hạ bãi (container còn ở khu giám định / khu vệ sinh);
        /// chỉ được ghi khi xe nâng hạ bãi hoặc dời vị trí trên sơ đồ bãi. Trước đây Gate-In gán sẵn
        /// BLOCK_A/1/1/1 nên mọi container chưa vào bãi đều hiện vị trí giả này.</summary>
        public string BlockCode { get; set; } = string.Empty;
        /// <summary>Số bay bãi hiện tại (0 = chưa hạ bãi).</summary>
        public int Bay { get; set; }
        /// <summary>Số row bãi hiện tại (0 = chưa hạ bãi).</summary>
        public int Row { get; set; }
        /// <summary>Số tier bãi hiện tại (0 = chưa hạ bãi).</summary>
        public int Tier { get; set; }
    }
}
