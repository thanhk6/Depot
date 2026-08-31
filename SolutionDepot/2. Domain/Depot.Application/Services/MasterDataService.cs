using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Depot.Data.EF;
using Depot.Data.Entities.Master;
using Depot.Data.Entities.Inventory;
using Depot.ViewModels;

namespace Depot.Application.Services
{
    public class MasterDataService : IMasterDataService
    {
        private readonly DepotDbContext _db;

        public MasterDataService(DepotDbContext db)
        {
            _db = db;
        }

        public async Task<List<ShippingLine>> GetAllShippingLinesAsync()
        {
            return await _db.ShippingLines.Where(x => !x.IsDeleted).ToListAsync();
        }

        public async Task<ShippingLine> AddShippingLineAsync(ShippingLineViewModel model)
        {
            if (string.IsNullOrWhiteSpace(model.Code) || string.IsNullOrWhiteSpace(model.Name))
                throw new ArgumentException("Mã và tên hãng tàu là bắt buộc.");
            var code = model.Code.Trim().ToUpperInvariant();
            if (await _db.ShippingLines.AnyAsync(x => x.Code == code))
                throw new InvalidOperationException("Mã hãng tàu đã tồn tại.");
            var entity = new ShippingLine
            {
                Code = code,
                Name = model.Name.Trim(),
                ContactEmail = model.ContactEmail,
                Phone = model.Phone
            };
            _db.ShippingLines.Add(entity);
            await _db.SaveChangesAsync();
            return entity;
        }

        // Code là business key bất biến (xem doc comment trên entity ShippingLine) — không cho sửa qua Update,
        // giống nguyên tắc đã áp dụng cho CustomerCompany.
        public async Task<ShippingLine?> UpdateShippingLineAsync(long id, ShippingLineViewModel model)
        {
            var entity = await _db.ShippingLines.FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
            if (entity == null) return null;
            if (string.IsNullOrWhiteSpace(model.Name)) throw new ArgumentException("Tên hãng tàu là bắt buộc.");
            entity.Name = model.Name.Trim();
            entity.ContactEmail = model.ContactEmail;
            entity.Phone = model.Phone;
            await _db.SaveChangesAsync();
            return entity;
        }

        // Soft-delete (IsDeleted) chứ không xoá vật lý — DepotJob/Container đang tham chiếu ShippingLineId
        // cho các job đã tạo trước đó, xoá cứng sẽ vỡ FK/mất dữ liệu lịch sử.
        public async Task<bool> DeactivateShippingLineAsync(long id)
        {
            var entity = await _db.ShippingLines.FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
            if (entity == null) return false;
            entity.IsDeleted = true;
            entity.DeletedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<List<Material>> GetAllMaterialsAsync()
        {
            return await _db.Materials.ToListAsync();
        }

        public async Task<Material> AddMaterialAsync(MaterialViewModel model)
        {
            var entity = new Material { Code = model.Code };
            ApplyMaterialFields(entity, model);
            _db.Materials.Add(entity);
            await _db.SaveChangesAsync();
            return entity;
        }

        public async Task<Material?> UpdateMaterialAsync(long id, MaterialViewModel model)
        {
            var entity = await _db.Materials.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null) return null;
            ApplyMaterialFields(entity, model);
            await _db.SaveChangesAsync();
            return entity;
        }

        private static void ApplyMaterialFields(Material entity, MaterialViewModel model)
        {
            entity.Name = model.Name;
            entity.Unit = model.Unit;
            entity.UnitPrice = model.UnitPrice;
            entity.StockQuantity = model.StockQuantity;
            entity.MaterialGroupCode = model.MaterialGroupCode;
            entity.MaterialType = model.MaterialType;
            entity.Specification = model.Specification;
            entity.Brand = model.Brand;
            entity.Manufacturer = model.Manufacturer;
            entity.Barcode = model.Barcode;
            entity.MinimumStock = model.MinimumStock;
            entity.MaximumStock = model.MaximumStock;
            entity.ReorderLevel = model.ReorderLevel;
            entity.AverageCost = model.AverageCost;
            entity.LastPurchaseCost = model.LastPurchaseCost;
            entity.IsActive = model.IsActive;
        }

        public async Task<List<MasterCatalogItem>> GetCatalogAsync(string catalogType)
        {
            return await _db.MasterCatalogItems
                .Where(x => x.CatalogType == catalogType && x.IsActive)
                .OrderBy(x => x.SortOrder).ThenBy(x => x.Code)
                .ToListAsync();
        }

        public async Task<MasterCatalogItem> CreateCatalogItemAsync(MasterCatalogItemRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.CatalogType) || string.IsNullOrWhiteSpace(request.Code) || string.IsNullOrWhiteSpace(request.Name))
                throw new ArgumentException("CatalogType, Code và Name là bắt buộc.");
            var exists = await _db.MasterCatalogItems.AnyAsync(x => x.CatalogType == request.CatalogType && x.Code == request.Code);
            if (exists) throw new InvalidOperationException("Mã catalog đã tồn tại trong loại danh mục này.");
            var item = new MasterCatalogItem
            {
                CatalogType = request.CatalogType.Trim().ToUpperInvariant(), Code = request.Code.Trim().ToUpperInvariant(),
                Name = request.Name.Trim(), NameVi = request.NameVi?.Trim(), Description = request.Description?.Trim(),
                JsonData = string.IsNullOrWhiteSpace(request.JsonData) ? "{}" : request.JsonData, IsActive = request.IsActive, SortOrder = request.SortOrder
            };
            _db.MasterCatalogItems.Add(item);
            await _db.SaveChangesAsync();
            return item;
        }

        public async Task<MasterCatalogItem?> UpdateCatalogItemAsync(long id, MasterCatalogItemRequest request)
        {
            var item = await _db.MasterCatalogItems.FirstOrDefaultAsync(x => x.Id == id);
            if (item == null) return null;
            item.Code = request.Code.Trim().ToUpperInvariant(); item.Name = request.Name.Trim(); item.NameVi = request.NameVi?.Trim();
            item.Description = request.Description?.Trim(); item.JsonData = string.IsNullOrWhiteSpace(request.JsonData) ? "{}" : request.JsonData;
            item.IsActive = request.IsActive; item.SortOrder = request.SortOrder;
            await _db.SaveChangesAsync();
            return item;
        }

        public async Task<bool> DeactivateCatalogItemAsync(long id)
        {
            var item = await _db.MasterCatalogItems.FirstOrDefaultAsync(x => x.Id == id);
            if (item == null) return false;
            item.IsActive = false;
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<List<ServiceTariff>> GetServiceTariffsAsync()
        {
            return await _db.ServiceTariffs
                .Where(x => x.IsActive)
                .OrderBy(x => x.SortOrder).ThenBy(x => x.Code)
                .ToListAsync();
        }

        public async Task<ServiceTariff> CreateServiceTariffAsync(ServiceTariffRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Code) || string.IsNullOrWhiteSpace(request.NameVi))
                throw new ArgumentException("Mã biểu cước và tên dịch vụ là bắt buộc.");
            var code = request.Code.Trim().ToUpperInvariant();
            var exists = await _db.ServiceTariffs.AnyAsync(x => x.Code == code);
            if (exists) throw new InvalidOperationException("Mã biểu cước nâng hạ đã tồn tại.");
            var item = new ServiceTariff
            {
                Code = code, ServiceCategory = request.ServiceCategory, NameVi = request.NameVi.Trim(), NameEn = request.NameEn?.Trim(),
                Unit = request.Unit, Price20GP = request.Price20GP, Price40HC = request.Price40HC, Price45HC = request.Price45HC,
                Price20RF = request.Price20RF, Price40RH = request.Price40RH, PriceSpecial = request.PriceSpecial,
                VatPercent = request.VatPercent, Currency = request.Currency, ApplicableShift = request.ApplicableShift,
                Description = request.Description?.Trim(), IsActive = request.IsActive, SortOrder = request.SortOrder
            };
            _db.ServiceTariffs.Add(item);
            await _db.SaveChangesAsync();
            return item;
        }

        public async Task<ServiceTariff?> UpdateServiceTariffAsync(long id, ServiceTariffRequest request)
        {
            var item = await _db.ServiceTariffs.FirstOrDefaultAsync(x => x.Id == id);
            if (item == null) return null;
            item.Code = request.Code.Trim().ToUpperInvariant(); item.ServiceCategory = request.ServiceCategory;
            item.NameVi = request.NameVi.Trim(); item.NameEn = request.NameEn?.Trim(); item.Unit = request.Unit;
            item.Price20GP = request.Price20GP; item.Price40HC = request.Price40HC; item.Price45HC = request.Price45HC;
            item.Price20RF = request.Price20RF; item.Price40RH = request.Price40RH; item.PriceSpecial = request.PriceSpecial;
            item.VatPercent = request.VatPercent; item.Currency = request.Currency; item.ApplicableShift = request.ApplicableShift;
            item.Description = request.Description?.Trim(); item.IsActive = request.IsActive; item.SortOrder = request.SortOrder;
            await _db.SaveChangesAsync();
            return item;
        }

        public async Task<bool> DeactivateServiceTariffAsync(long id)
        {
            var item = await _db.ServiceTariffs.FirstOrDefaultAsync(x => x.Id == id);
            if (item == null) return false;
            item.IsActive = false;
            await _db.SaveChangesAsync();
            return true;
        }

        private static StorageTariffTier MapTier(StorageTariffTierViewModel t, int fallbackSortOrder) => new()
        {
            TierName = t.TierName, FromDay = t.FromDay, ToDay = t.ToDay,
            Price20Dry = t.Price20Dry, Price40Dry = t.Price40Dry, Price45Dry = t.Price45Dry,
            Price20Reefer = t.Price20Reefer, Price40Reefer = t.Price40Reefer, PriceSpecial = t.PriceSpecial,
            SortOrder = t.SortOrder == 0 ? fallbackSortOrder : t.SortOrder
        };

        public async Task<List<StorageTariffRule>> GetStorageTariffsAsync()
        {
            return await _db.StorageTariffRules
                .Include(x => x.Tiers.OrderBy(t => t.SortOrder))
                .Where(x => x.IsActive)
                .OrderBy(x => x.SortOrder).ThenBy(x => x.Code)
                .ToListAsync();
        }

        public async Task<StorageTariffRule> CreateStorageTariffAsync(StorageTariffRuleRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Code) || string.IsNullOrWhiteSpace(request.ShippingLineName))
                throw new ArgumentException("Mã quy tắc và tên hãng tàu/nhóm áp dụng là bắt buộc.");
            var code = request.Code.Trim().ToUpperInvariant();
            var exists = await _db.StorageTariffRules.AnyAsync(x => x.Code == code);
            if (exists) throw new InvalidOperationException("Mã quy tắc lưu bãi đã tồn tại.");
            var item = new StorageTariffRule
            {
                Code = code, ShippingLineCode = request.ShippingLineCode, ShippingLineName = request.ShippingLineName.Trim(),
                ContainerTypeCategory = request.ContainerTypeCategory, DefaultFreeDays = request.DefaultFreeDays,
                CalculationUnit = request.CalculationUnit, VatPercent = request.VatPercent, Notes = request.Notes?.Trim(),
                IsActive = request.IsActive, SortOrder = request.SortOrder
            };
            for (var i = 0; i < request.Tiers.Count; i++) item.Tiers.Add(MapTier(request.Tiers[i], i + 1));
            _db.StorageTariffRules.Add(item);
            await _db.SaveChangesAsync();
            return item;
        }

        public async Task<StorageTariffRule?> UpdateStorageTariffAsync(long id, StorageTariffRuleRequest request)
        {
            // Không Include(x => x.Tiers) — ExecuteDeleteAsync bên dưới xoá thẳng dưới DB, không qua
            // ChangeTracker, nên nếu Include trước sẽ để lại entity con "ma" (đã xoá ở DB nhưng vẫn nằm
            // trong tracker) — cùng lý do đã áp dụng cho DamageItem ở SubmitSurveyAsync.
            var item = await _db.StorageTariffRules.FirstOrDefaultAsync(x => x.Id == id);
            if (item == null) return null;
            item.Code = request.Code.Trim().ToUpperInvariant(); item.ShippingLineCode = request.ShippingLineCode;
            item.ShippingLineName = request.ShippingLineName.Trim(); item.ContainerTypeCategory = request.ContainerTypeCategory;
            item.DefaultFreeDays = request.DefaultFreeDays; item.CalculationUnit = request.CalculationUnit;
            item.VatPercent = request.VatPercent; item.Notes = request.Notes?.Trim();
            item.IsActive = request.IsActive; item.SortOrder = request.SortOrder;

            await _db.Set<StorageTariffTier>().Where(t => t.StorageTariffRuleId == id).ExecuteDeleteAsync();
            for (var i = 0; i < request.Tiers.Count; i++)
            {
                var tier = MapTier(request.Tiers[i], i + 1);
                tier.StorageTariffRuleId = id;
                _db.Set<StorageTariffTier>().Add(tier);
            }

            await _db.SaveChangesAsync();
            return item;
        }

        public async Task<bool> DeactivateStorageTariffAsync(long id)
        {
            var item = await _db.StorageTariffRules.FirstOrDefaultAsync(x => x.Id == id);
            if (item == null) return false;
            item.IsActive = false;
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<List<CustomerCompany>> GetCustomersAsync()
        {
            return await _db.CustomerCompanies.Where(x => x.Status != "DELETED").OrderBy(x => x.Code).ToListAsync();
        }

        public async Task<CustomerCompany> CreateCustomerAsync(CustomerCompanyRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Code) || string.IsNullOrWhiteSpace(request.Name)) throw new ArgumentException("Mã và tên khách hàng là bắt buộc.");
            if (await _db.CustomerCompanies.AnyAsync(x => x.Code == request.Code)) throw new InvalidOperationException("Mã khách hàng đã tồn tại.");
            var customer = new CustomerCompany
            {
                Code = request.Code.Trim().ToUpperInvariant(), Name = request.Name.Trim(), ShortName = request.ShortName,
                TaxCode = request.TaxCode, Phone = request.Phone, Email = request.Email, Address = request.Address,
                ContactPerson = request.ContactPerson, ContactPhone = request.ContactPhone, ContactEmail = request.ContactEmail,
                CustomerType = request.CustomerType, Status = request.Status, CreditLimit = request.CreditLimit,
                PaymentTermDays = request.PaymentTermDays, Notes = request.Notes
            };
            _db.CustomerCompanies.Add(customer);
            await _db.SaveChangesAsync();
            return customer;
        }

        public async Task<CustomerCompany?> UpdateCustomerAsync(long id, CustomerCompanyRequest request)
        {
            var customer = await _db.CustomerCompanies.FirstOrDefaultAsync(x => x.Id == id);
            if (customer == null) return null;
            customer.Name = request.Name.Trim(); customer.ShortName = request.ShortName; customer.TaxCode = request.TaxCode;
            customer.Phone = request.Phone; customer.Email = request.Email; customer.Address = request.Address;
            customer.ContactPerson = request.ContactPerson; customer.ContactPhone = request.ContactPhone; customer.ContactEmail = request.ContactEmail;
            customer.CustomerType = request.CustomerType; customer.Status = request.Status; customer.CreditLimit = request.CreditLimit;
            customer.PaymentTermDays = request.PaymentTermDays; customer.Notes = request.Notes;
            await _db.SaveChangesAsync();
            return customer;
        }

        public async Task<bool> DeactivateCustomerAsync(long id)
        {
            var customer = await _db.CustomerCompanies.FirstOrDefaultAsync(x => x.Id == id);
            if (customer == null) return false;
            customer.Status = "DELETED";
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<List<CustomerDriver>> GetDriversAsync(string customerCode)
        {
            return await _db.CustomerDrivers.Where(x => x.CustomerCode == customerCode && x.Status != "DELETED").OrderBy(x => x.DriverCode).ToListAsync();
        }

        public async Task<CustomerDriver> CreateDriverAsync(CustomerDriverRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.CustomerCode) || string.IsNullOrWhiteSpace(request.DriverCode) || string.IsNullOrWhiteSpace(request.FullName)) throw new ArgumentException("CustomerCode, DriverCode và FullName là bắt buộc.");
            if (await _db.CustomerDrivers.AnyAsync(x => x.CustomerCode == request.CustomerCode && x.DriverCode == request.DriverCode)) throw new InvalidOperationException("Mã tài xế đã tồn tại.");
            var driver = new CustomerDriver { CustomerCode = request.CustomerCode.Trim().ToUpperInvariant(), DriverCode = request.DriverCode.Trim().ToUpperInvariant(), FullName = request.FullName.Trim(), Phone = request.Phone, Email = request.Email, CitizenId = request.CitizenId, LicenseNumber = request.LicenseNumber, LicenseGrade = request.LicenseGrade, LicenseExpiryDate = request.LicenseExpiryDate, Address = request.Address, Status = request.Status };
            _db.CustomerDrivers.Add(driver); await _db.SaveChangesAsync(); return driver;
        }

        public async Task<CustomerDriver?> UpdateDriverAsync(long id, CustomerDriverRequest request)
        {
            var driver = await _db.CustomerDrivers.FirstOrDefaultAsync(x => x.Id == id); if (driver == null) return null;
            driver.FullName = request.FullName.Trim(); driver.Phone = request.Phone; driver.Email = request.Email; driver.CitizenId = request.CitizenId; driver.LicenseNumber = request.LicenseNumber; driver.LicenseGrade = request.LicenseGrade; driver.LicenseExpiryDate = request.LicenseExpiryDate; driver.Address = request.Address; driver.Status = request.Status;
            await _db.SaveChangesAsync(); return driver;
        }

        public async Task<bool> DeactivateDriverAsync(long id)
        {
            var driver = await _db.CustomerDrivers.FirstOrDefaultAsync(x => x.Id == id); if (driver == null) return false;
            driver.Status = "DELETED"; await _db.SaveChangesAsync(); return true;
        }

        public async Task<List<CustomerVehicle>> GetVehiclesAsync(string customerCode)
        {
            return await _db.CustomerVehicles.Where(x => x.CustomerCode == customerCode && x.Status != "DELETED").OrderBy(x => x.PlateNumber).ToListAsync();
        }

        public async Task<CustomerVehicle> CreateVehicleAsync(CustomerVehicleRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.CustomerCode) || string.IsNullOrWhiteSpace(request.PlateNumber)) throw new ArgumentException("CustomerCode và biển số là bắt buộc.");
            if (await _db.CustomerVehicles.AnyAsync(x => x.CustomerCode == request.CustomerCode && x.PlateNumber == request.PlateNumber)) throw new InvalidOperationException("Phương tiện đã tồn tại.");
            var vehicle = new CustomerVehicle { CustomerCode = request.CustomerCode.Trim().ToUpperInvariant(), PlateNumber = request.PlateNumber.Trim().ToUpperInvariant(), VehicleType = request.VehicleType, Brand = request.Brand, PayloadTon = request.PayloadTon, OwnerName = request.OwnerName, DefaultDriverCode = request.DefaultDriverCode, InspectionExpiry = request.InspectionExpiry, Status = request.Status };
            _db.CustomerVehicles.Add(vehicle); await _db.SaveChangesAsync(); return vehicle;
        }

        public async Task<CustomerVehicle?> UpdateVehicleAsync(long id, CustomerVehicleRequest request)
        {
            var vehicle = await _db.CustomerVehicles.FirstOrDefaultAsync(x => x.Id == id); if (vehicle == null) return null;
            vehicle.VehicleType = request.VehicleType; vehicle.Brand = request.Brand; vehicle.PayloadTon = request.PayloadTon; vehicle.OwnerName = request.OwnerName; vehicle.DefaultDriverCode = request.DefaultDriverCode; vehicle.InspectionExpiry = request.InspectionExpiry; vehicle.Status = request.Status;
            await _db.SaveChangesAsync(); return vehicle;
        }

        public async Task<bool> DeactivateVehicleAsync(long id)
        {
            var vehicle = await _db.CustomerVehicles.FirstOrDefaultAsync(x => x.Id == id); if (vehicle == null) return false;
            vehicle.Status = "DELETED"; await _db.SaveChangesAsync(); return true;
        }

        public async Task<List<CustomerPortalUser>> GetPortalUsersAsync(string customerCode)
        {
            return await _db.CustomerPortalUsers.Where(x => x.CustomerCode == customerCode && x.Status != "DELETED").OrderBy(x => x.Username).ToListAsync();
        }

        public async Task<CustomerPortalUser> CreatePortalUserAsync(CustomerPortalUserRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.CustomerCode) || string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.FullName)) throw new ArgumentException("CustomerCode, Username và FullName là bắt buộc.");
            if (await _db.CustomerPortalUsers.AnyAsync(x => x.CustomerCode == request.CustomerCode && x.Username == request.Username)) throw new InvalidOperationException("Username đã tồn tại.");
            var user = new CustomerPortalUser { CustomerCode = request.CustomerCode.Trim().ToUpperInvariant(), Username = request.Username.Trim().ToLowerInvariant(), FullName = request.FullName.Trim(), Email = request.Email, Phone = request.Phone, Role = request.Role, AccountType = request.AccountType, Status = request.Status };
            _db.CustomerPortalUsers.Add(user); await _db.SaveChangesAsync(); return user;
        }

        public async Task<CustomerPortalUser?> UpdatePortalUserAsync(long id, CustomerPortalUserRequest request)
        {
            var user = await _db.CustomerPortalUsers.FirstOrDefaultAsync(x => x.Id == id); if (user == null) return null;
            user.FullName = request.FullName.Trim(); user.Email = request.Email; user.Phone = request.Phone; user.Role = request.Role; user.AccountType = request.AccountType; user.Status = request.Status;
            await _db.SaveChangesAsync(); return user;
        }

        public async Task<bool> DeactivatePortalUserAsync(long id)
        {
            var user = await _db.CustomerPortalUsers.FirstOrDefaultAsync(x => x.Id == id); if (user == null) return false;
            user.Status = "DELETED"; await _db.SaveChangesAsync(); return true;
        }

        public async Task<List<CustomerBooking>> GetBookingsAsync(string customerCode)
        {
            return await _db.CustomerBookings.Where(x => x.CustomerCode == customerCode && x.Status != "DELETED").OrderByDescending(x => x.IssueDate).ToListAsync();
        }

        public async Task<CustomerBooking> CreateBookingAsync(CustomerBookingRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.BookingNo) || string.IsNullOrWhiteSpace(request.CustomerCode)) throw new ArgumentException("BookingNo và CustomerCode là bắt buộc.");
            if (request.ContainerCount < 0 || request.UsedCount < 0 || request.UsedCount > request.ContainerCount) throw new ArgumentException("Số lượng container booking không hợp lệ.");
            if (await _db.CustomerBookings.AnyAsync(x => x.BookingNo == request.BookingNo)) throw new InvalidOperationException("BookingNo đã tồn tại.");
            var shippingLineCode = request.ShippingLineCode.Trim().ToUpperInvariant();
            var shippingLine = await _db.ShippingLines.FirstOrDefaultAsync(x => x.Code == shippingLineCode && !x.IsDeleted);
            if (shippingLine == null) throw new ArgumentException($"Mã hãng tàu {shippingLineCode} không tồn tại trong danh mục ShippingLine.Code.");
            var booking = new CustomerBooking { BookingNo = request.BookingNo.Trim().ToUpperInvariant(), CustomerCode = request.CustomerCode.Trim().ToUpperInvariant(), ShippingLineId = shippingLine.Id, DepotCode = request.DepotCode, ContainerCount = request.ContainerCount, UsedCount = request.UsedCount, ContainerSize = request.ContainerSize, ContainerType = request.ContainerType, IssueDate = request.IssueDate, ValidUntil = request.ValidUntil, Status = request.Status, SpecialInstructions = request.SpecialInstructions };
            _db.CustomerBookings.Add(booking); await _db.SaveChangesAsync(); return booking;
        }

        public async Task<CustomerBooking?> UpdateBookingAsync(long id, CustomerBookingRequest request)
        {
            var booking = await _db.CustomerBookings.FirstOrDefaultAsync(x => x.Id == id); if (booking == null) return null;
            if (request.UsedCount < 0 || request.UsedCount > request.ContainerCount) throw new ArgumentException("Số lượng đã dùng không hợp lệ.");
            var shippingLineCode = request.ShippingLineCode.Trim().ToUpperInvariant();
            var shippingLine = await _db.ShippingLines.FirstOrDefaultAsync(x => x.Code == shippingLineCode && !x.IsDeleted);
            if (shippingLine == null) throw new ArgumentException($"Mã hãng tàu {shippingLineCode} không tồn tại trong danh mục ShippingLine.Code.");
            booking.ShippingLineId = shippingLine.Id; booking.ContainerCount = request.ContainerCount; booking.UsedCount = request.UsedCount; booking.ContainerSize = request.ContainerSize; booking.ContainerType = request.ContainerType; booking.ValidUntil = request.ValidUntil; booking.Status = request.Status; booking.SpecialInstructions = request.SpecialInstructions;
            await _db.SaveChangesAsync(); return booking;
        }

        public async Task<bool> DeactivateBookingAsync(long id)
        {
            var booking = await _db.CustomerBookings.FirstOrDefaultAsync(x => x.Id == id); if (booking == null) return false;
            booking.Status = "DELETED"; await _db.SaveChangesAsync(); return true;
        }
    }
}
