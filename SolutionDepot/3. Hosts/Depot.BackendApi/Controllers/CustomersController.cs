using Depot.Application.Services;
using Depot.BackendApi.Security;
using Depot.ViewModels;
using Microsoft.AspNetCore.Mvc;

namespace Depot.BackendApi.Controllers;

[ApiController]
[Route("api/customers")]
public sealed class CustomersController : ControllerBase
{
    private readonly IMasterDataService service;
    public CustomersController(IMasterDataService service) => this.service = service;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Lấy danh sách khách hàng thành công", Data = await service.GetCustomersAsync() });
    }

    /// <summary>
    /// Thêm nhanh nhà xe ngay tại cổng Gate-In — cùng quyền với Gate-In (Operation / Survey), không cần quyền danh mục.
    /// Trùng tên / MST với khách hàng đang hoạt động thì 409 kèm nhà xe đã có để màn hình chọn luôn.
    /// </summary>
    [RequirePermission(RolePermissions.Operation, RolePermissions.Survey)]
    [HttpPost("trucking-quick")]
    public async Task<IActionResult> QuickCreateTrucking([FromBody] TruckingQuickCreateRequest request)
    {
        try
        {
            var customer = await service.QuickCreateTruckingCompanyAsync(request, User.GetFullName() ?? User.GetUsername() ?? string.Empty);
            return Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = $"Đã thêm nhà xe {customer.Code} - {customer.Name}", Data = new { customer.Code, customer.Name, customer.TaxCode, customer.Phone, customer.Status } });
        }
        catch (MasterDataService.DuplicateTruckingCompanyException ex)
        {
            return Conflict(new ResponseSingleContentModel<object> { StatusCode = 409, Message = ex.Message, Data = new { ex.Existing.Code, ex.Existing.Name, ex.Existing.TaxCode, ex.Existing.Phone, ex.Existing.Status } });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = ex.Message, Data = null });
        }
    }

    [RequirePermission(RolePermissions.MasterData)]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CustomerCompanyRequest request)
    {
        try { return Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Tạo khách hàng thành công", Data = await service.CreateCustomerAsync(request) }); }
        catch (Exception ex) { return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = ex.Message, Data = "Dữ liệu khách hàng không hợp lệ" }); }
    }

    [RequirePermission(RolePermissions.MasterData)]
    [HttpPut("{id:long}")]
    public async Task<IActionResult> Update(long id, [FromBody] CustomerCompanyRequest request)
    {
        try
        {
            var customer = await service.UpdateCustomerAsync(id, request);
            return customer == null ? NotFound() : Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Cập nhật khách hàng thành công", Data = customer });
        }
        catch (Exception ex) { return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = ex.Message, Data = "Dữ liệu khách hàng không hợp lệ" }); }
    }

    [RequirePermission(RolePermissions.MasterData)]
    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Delete(long id)
    {
        try
        {
            var deleted = await service.DeactivateCustomerAsync(id);
            return deleted ? Ok(new ResponseSingleContentModel<string> { StatusCode = 200, Message = "Đã khóa khách hàng", Data = "DELETED" }) : NotFound();
        }
        catch (Exception ex) { return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = ex.Message, Data = "Không thể khóa khách hàng" }); }
    }

    [HttpGet("{customerCode}/drivers")]
    public async Task<IActionResult> GetDrivers(string customerCode)
    {
        return Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Lấy danh sách tài xế thành công", Data = await service.GetDriversAsync(customerCode) });
    }

    [RequirePermission(RolePermissions.MasterData)]
    [HttpPost("drivers")]
    public async Task<IActionResult> CreateDriver([FromBody] CustomerDriverRequest request)
    {
        try { return Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Tạo tài xế thành công", Data = await service.CreateDriverAsync(request) }); }
        catch (Exception ex) { return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = ex.Message, Data = "Dữ liệu tài xế không hợp lệ" }); }
    }

    [RequirePermission(RolePermissions.MasterData)]
    [HttpPut("drivers/{id:long}")]
    public async Task<IActionResult> UpdateDriver(long id, [FromBody] CustomerDriverRequest request)
    {
        try
        {
            var driver = await service.UpdateDriverAsync(id, request); return driver == null ? NotFound() : Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Cập nhật tài xế thành công", Data = driver });
        }
        catch (Exception ex) { return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = ex.Message, Data = "Dữ liệu tài xế không hợp lệ" }); }
    }

    [RequirePermission(RolePermissions.MasterData)]
    [HttpDelete("drivers/{id:long}")]
    public async Task<IActionResult> DeleteDriver(long id)
    {
        try
        {
            var deleted = await service.DeactivateDriverAsync(id); return deleted ? Ok(new ResponseSingleContentModel<string> { StatusCode = 200, Message = "Đã khóa tài xế", Data = "DELETED" }) : NotFound();
        }
        catch (Exception ex) { return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = ex.Message, Data = "Không thể khóa tài xế" }); }
    }

    [HttpGet("{customerCode}/vehicles")]
    public async Task<IActionResult> GetVehicles(string customerCode)
    {
        return Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Lấy danh sách phương tiện thành công", Data = await service.GetVehiclesAsync(customerCode) });
    }

    [RequirePermission(RolePermissions.MasterData)]
    [HttpPost("vehicles")]
    public async Task<IActionResult> CreateVehicle([FromBody] CustomerVehicleRequest request)
    {
        try { return Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Tạo phương tiện thành công", Data = await service.CreateVehicleAsync(request) }); }
        catch (Exception ex) { return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = ex.Message, Data = "Dữ liệu phương tiện không hợp lệ" }); }
    }

    [RequirePermission(RolePermissions.MasterData)]
    [HttpPut("vehicles/{id:long}")]
    public async Task<IActionResult> UpdateVehicle(long id, [FromBody] CustomerVehicleRequest request)
    {
        try
        {
            var vehicle = await service.UpdateVehicleAsync(id, request); return vehicle == null ? NotFound() : Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Cập nhật phương tiện thành công", Data = vehicle });
        }
        catch (Exception ex) { return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = ex.Message, Data = "Dữ liệu phương tiện không hợp lệ" }); }
    }

    [RequirePermission(RolePermissions.MasterData)]
    [HttpDelete("vehicles/{id:long}")]
    public async Task<IActionResult> DeleteVehicle(long id)
    {
        try
        {
            var deleted = await service.DeactivateVehicleAsync(id); return deleted ? Ok(new ResponseSingleContentModel<string> { StatusCode = 200, Message = "Đã khóa phương tiện", Data = "DELETED" }) : NotFound();
        }
        catch (Exception ex) { return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = ex.Message, Data = "Không thể khóa phương tiện" }); }
    }

    [HttpGet("{customerCode}/users")]
    public async Task<IActionResult> GetUsers(string customerCode)
    {
        return Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Lấy danh sách tài khoản khách hàng thành công", Data = await service.GetPortalUsersAsync(customerCode) });
    }

    [RequirePermission(RolePermissions.MasterData)]
    [HttpPost("users")]
    public async Task<IActionResult> CreateUser([FromBody] CustomerPortalUserRequest request)
    {
        try { return Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Tạo tài khoản khách hàng thành công", Data = await service.CreatePortalUserAsync(request) }); }
        catch (Exception ex) { return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = ex.Message, Data = "Dữ liệu tài khoản không hợp lệ" }); }
    }

    [RequirePermission(RolePermissions.MasterData)]
    [HttpPut("users/{id:long}")]
    public async Task<IActionResult> UpdateUser(long id, [FromBody] CustomerPortalUserRequest request)
    {
        try
        {
            var user = await service.UpdatePortalUserAsync(id, request); return user == null ? NotFound() : Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Cập nhật tài khoản thành công", Data = user });
        }
        catch (Exception ex) { return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = ex.Message, Data = "Dữ liệu tài khoản không hợp lệ" }); }
    }

    [RequirePermission(RolePermissions.MasterData)]
    [HttpDelete("users/{id:long}")]
    public async Task<IActionResult> DeleteUser(long id)
    {
        try
        {
            var deleted = await service.DeactivatePortalUserAsync(id); return deleted ? Ok(new ResponseSingleContentModel<string> { StatusCode = 200, Message = "Đã khóa tài khoản", Data = "DELETED" }) : NotFound();
        }
        catch (Exception ex) { return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = ex.Message, Data = "Không thể khóa tài khoản" }); }
    }

    [HttpGet("{customerCode}/bookings")]
    public async Task<IActionResult> GetBookings(string customerCode)
    {
        return Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Lấy danh sách booking thành công", Data = await service.GetBookingsAsync(customerCode) });
    }

    [RequirePermission(RolePermissions.MasterData)]
    [HttpPost("bookings")]
    public async Task<IActionResult> CreateBooking([FromBody] CustomerBookingRequest request)
    {
        try { return Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Tạo booking thành công", Data = await service.CreateBookingAsync(request) }); }
        catch (Exception ex) { return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = ex.Message, Data = "Dữ liệu booking không hợp lệ" }); }
    }

    [RequirePermission(RolePermissions.MasterData)]
    [HttpPut("bookings/{id:long}")]
    public async Task<IActionResult> UpdateBooking(long id, [FromBody] CustomerBookingRequest request)
    {
        try
        {
            var booking = await service.UpdateBookingAsync(id, request); return booking == null ? NotFound() : Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Cập nhật booking thành công", Data = booking });
        }
        catch (Exception ex) { return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = ex.Message, Data = "Dữ liệu booking không hợp lệ" }); }
    }

    [RequirePermission(RolePermissions.MasterData)]
    [HttpDelete("bookings/{id:long}")]
    public async Task<IActionResult> DeleteBooking(long id)
    {
        try
        {
            var deleted = await service.DeactivateBookingAsync(id); return deleted ? Ok(new ResponseSingleContentModel<string> { StatusCode = 200, Message = "Đã hủy booking", Data = "DELETED" }) : NotFound();
        }
        catch (Exception ex) { return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = ex.Message, Data = "Không thể hủy booking" }); }
    }
}