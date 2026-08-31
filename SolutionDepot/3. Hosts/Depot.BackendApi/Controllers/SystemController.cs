using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Depot.Application.Services;
using Depot.ViewModels;

namespace Depot.BackendApi.Controllers
{
    [ApiController]
    [Route("api/system")]
    public class SystemController : BaseController
    {
        private readonly IUserService _service;
        public SystemController(IUserService service) => _service = service;

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers() => Ok(new ResponseSingleContentModel<dynamic> { StatusCode = 200, Message = "Lấy danh sách người dùng thành công", Data = await _service.GetUsersAsync() });

        [HttpPost("users")]
        public async Task<IActionResult> CreateUser([FromBody] CreateSystemUserRequest request)
        {
            var user = await _service.CreateUserAsync(request);
            return user == null
                ? BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = "Không thể tạo người dùng", Data = "Username hoặc RoleCode không hợp lệ" })
                : Ok(new ResponseSingleContentModel<UserDto> { StatusCode = 200, Message = "Tạo người dùng thành công", Data = user });
        }

        [HttpPut("users/{id:long}")]
        public async Task<IActionResult> UpdateUser(long id, [FromBody] UpdateSystemUserRequest request)
        {
            var user = await _service.UpdateUserAsync(id, request);
            return user == null
                ? NotFound(new ResponseSingleContentModel<string> { StatusCode = 404, Message = "Không tìm thấy người dùng", Data = id.ToString() })
                : Ok(new ResponseSingleContentModel<UserDto> { StatusCode = 200, Message = "Cập nhật người dùng thành công", Data = user });
        }

        [HttpDelete("users/{id:long}")]
        public async Task<IActionResult> DeleteUser(long id)
        {
            var ok = await _service.DeleteUserAsync(id);
            return ok
                ? Ok(new ResponseSingleContentModel<string> { StatusCode = 200, Message = "Xóa người dùng thành công", Data = id.ToString() })
                : NotFound(new ResponseSingleContentModel<string> { StatusCode = 404, Message = "Không tìm thấy người dùng", Data = id.ToString() });
        }

        [HttpPost("users/{id:long}/reset-password")]
        public async Task<IActionResult> ResetPassword(long id, [FromBody] ResetPasswordRequest request)
        {
            var ok = await _service.ResetPasswordAsync(id, request);
            return ok
                ? Ok(new ResponseSingleContentModel<string> { StatusCode = 200, Message = "Đặt lại mật khẩu thành công", Data = id.ToString() })
                : BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = "Không thể đặt lại mật khẩu", Data = "Không tìm thấy người dùng hoặc mật khẩu mới không hợp lệ" });
        }

        [HttpGet("roles")]
        public async Task<IActionResult> GetRoles() => Ok(new ResponseSingleContentModel<dynamic> { StatusCode = 200, Message = "Lấy danh sách role thành công", Data = await _service.GetRolesAsync() });

        [HttpPut("roles/{roleCode}/permissions")]
        public async Task<IActionResult> UpdateRolePermissions(string roleCode, [FromBody] UpdateRolePermissionsRequest request)
        {
            var ok = await _service.UpdateRolePermissionsAsync(roleCode, request);
            return ok
                ? Ok(new ResponseSingleContentModel<string> { StatusCode = 200, Message = "Cập nhật quyền cho vai trò thành công", Data = roleCode })
                : NotFound(new ResponseSingleContentModel<string> { StatusCode = 404, Message = "Không tìm thấy vai trò", Data = roleCode });
        }

        [HttpGet("security-policy")]
        public async Task<IActionResult> GetSecurityPolicy() => Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Lấy chính sách bảo mật thành công", Data = await _service.GetSecurityPolicyAsync() });

        [HttpPut("security-policy")]
        public async Task<IActionResult> SaveSecurityPolicy([FromBody] SaveSecurityPolicyRequest request)
            => Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Lưu chính sách bảo mật thành công", Data = await _service.SaveSecurityPolicyAsync(request) });

        [HttpGet("audit-logs")]
        public async Task<IActionResult> GetAuditLogs([FromQuery] int take = 200)
            => Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Lấy nhật ký hoạt động thành công", Data = await _service.GetAuditLogsAsync(take) });

        [HttpPost("audit-logs")]
        public async Task<IActionResult> CreateAuditLog([FromBody] CreateSystemAuditLogRequest request)
            => Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Ghi nhật ký hoạt động thành công", Data = await _service.CreateAuditLogAsync(request) });

        [HttpGet("permissions")]
        public IActionResult GetPermissions()
        {
            var permissions = new object[]
            {
                new { code = "container.view", name = "Xem Container", group = "Container" },
                new { code = "container.create", name = "Tạo Container", group = "Container" },
                new { code = "container.edit", name = "Sửa Container", group = "Container" },
                new { code = "container.delete", name = "Xóa Container", group = "Container" },
                new { code = "gate.in", name = "Gate-In", group = "Gate" },
                new { code = "gate.out", name = "Gate-Out", group = "Gate" },
                new { code = "gate.edi_sync", name = "Đồng bộ EDI", group = "Gate" },
                new { code = "survey.view", name = "Xem Survey", group = "Survey" },
                new { code = "survey.create", name = "Tạo Survey", group = "Survey" },
                new { code = "survey.edit", name = "Sửa Survey", group = "Survey" },
                new { code = "survey.approve", name = "Duyệt Survey", group = "Survey" },
                new { code = "operation.view", name = "Xem Operation", group = "Operation" },
                new { code = "operation.create", name = "Tạo Operation", group = "Operation" },
                new { code = "payment.view", name = "Xem Payment", group = "Payment" },
                new { code = "payment.create", name = "Tạo Payment", group = "Payment" },
                new { code = "payment.confirm", name = "Xác nhận Payment", group = "Payment" },
                new { code = "yard.view", name = "Xem Yard", group = "Yard" },
                new { code = "yard.manage", name = "Quản lý Yard", group = "Yard" },
                new { code = "forklift.view", name = "Xem Forklift", group = "Forklift" },
                new { code = "forklift.dispatch", name = "Điều xe nâng", group = "Forklift" },
                new { code = "forklift.complete", name = "Hoàn tất điều xe", group = "Forklift" },
                new { code = "estimate.view", name = "Xem Báo Giá", group = "Estimate" },
                new { code = "estimate.create", name = "Tạo Báo Giá", group = "Estimate" },
                new { code = "estimate.submit", name = "Gửi Báo Giá", group = "Estimate" },
                new { code = "approval.view", name = "Xem Phê Duyệt", group = "Approval" },
                new { code = "approval.approve", name = "Duyệt Báo Giá", group = "Approval" },
                new { code = "approval.reject", name = "Từ chối Báo Giá", group = "Approval" },
                new { code = "approval.revise", name = "Yêu cầu chỉnh sửa", group = "Approval" },
                new { code = "repair.view", name = "Xem Sửa Chữa", group = "Repair" },
                new { code = "repair.create", name = "Tạo Sửa Chữa", group = "Repair" },
                new { code = "repair.assign", name = "Phân công Sửa Chữa", group = "Repair" },
                new { code = "repair.complete", name = "Hoàn tất Sửa Chữa", group = "Repair" },
                new { code = "qc.view", name = "Xem QC", group = "QC" },
                new { code = "qc.inspect", name = "Kiểm tra QC", group = "QC" },
                new { code = "qc.approve", name = "QC Đạt", group = "QC" },
                new { code = "qc.reject", name = "QC Không đạt", group = "QC" },
                new { code = "cleaning.view", name = "Xem Cleaning", group = "Cleaning" },
                new { code = "cleaning.execute", name = "Thực hiện Cleaning", group = "Cleaning" },
                new { code = "cleaning.handover", name = "Bàn giao Cleaning", group = "Cleaning" },
                new { code = "warehouse.view", name = "Xem Kho", group = "Warehouse" },
                new { code = "warehouse.import", name = "Nhập Kho", group = "Warehouse" },
                new { code = "warehouse.export", name = "Xuất Kho", group = "Warehouse" },
                new { code = "billing.view", name = "Xem Billing", group = "Billing" },
                new { code = "billing.create", name = "Tạo Billing", group = "Billing" },
                new { code = "billing.approve", name = "Duyệt Billing", group = "Billing" },
                new { code = "customer.view", name = "Xem Khách Hàng", group = "Customer" },
                new { code = "customer.manage", name = "Quản lý Khách Hàng", group = "Customer" },
                new { code = "report.view", name = "Xem Báo Cáo", group = "Report" },
                new { code = "report.export", name = "Xuất Báo Cáo", group = "Report" },
                new { code = "system.manage", name = "Quản trị Hệ thống", group = "System" }
            };

            return Ok(new ResponseSingleContentModel<object[]> { StatusCode = 200, Message = "Lấy danh sách permissions thành công", Data = permissions });
        }

        [HttpGet("menus")]
        public IActionResult GetMenus()
        {
            var menus = new object[]
            {
                new { id = "dashboard", label = "Dashboard ERP", path = "/dashboard", group = "TỔNG QUAN" },
                new { id = "gate", label = "Gate-In", path = "/gate-in", group = "KHAI THÁC" },
                new { id = "survey", label = "Survey", path = "/survey", group = "KHAI THÁC" },
                new { id = "payment", label = "Payment", path = "/payment", group = "KHAI THÁC" },
                new { id = "estimate", label = "Estimate", path = "/estimate", group = "BÁO GIÁ" },
                new { id = "approval", label = "Approval", path = "/approval", group = "BÁO GIÁ" },
                new { id = "repair", label = "Repair", path = "/repair", group = "SỬA CHỮA" },
                new { id = "qc", label = "QC", path = "/qc", group = "SỬA CHỮA" },
                new { id = "yard", label = "Yard", path = "/yard", group = "BÃI" },
                new { id = "forklift", label = "Forklift", path = "/forklift", group = "BÃI" },
                new { id = "report", label = "Report", path = "/report", group = "BÁO CÁO" },
                new { id = "system", label = "System", path = "/system", group = "HỆ THỐNG" }
            };

            return Ok(new ResponseSingleContentModel<object[]> { StatusCode = 200, Message = "Lấy danh sách menu thành công", Data = menus });
        }
    }
}
