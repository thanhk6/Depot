using System.Collections.Generic;
using System.Threading.Tasks;
using Depot.Data.Entities.Master;
using Depot.Data.Entities.Inventory;
using Depot.ViewModels;

namespace Depot.Application.Services
{
    public interface IMasterDataService
    {
        Task<List<ShippingLine>> GetAllShippingLinesAsync();
        Task<ShippingLine> AddShippingLineAsync(ShippingLineViewModel model);
        Task<ShippingLine?> UpdateShippingLineAsync(long id, ShippingLineViewModel model);
        Task<bool> DeactivateShippingLineAsync(long id);
        Task<List<Material>> GetAllMaterialsAsync();
        Task<Material> AddMaterialAsync(MaterialViewModel model);
        Task<Material?> UpdateMaterialAsync(long id, MaterialViewModel model);
        Task<List<MasterCatalogItem>> GetCatalogAsync(string catalogType, bool includeInactive = false);
        Task<MasterCatalogItem> CreateCatalogItemAsync(MasterCatalogItemRequest request);
        Task<MasterCatalogItem?> UpdateCatalogItemAsync(long id, MasterCatalogItemRequest request);
        Task<bool> DeactivateCatalogItemAsync(long id);
        // Cước Nâng Hạ (LoLo) — bảng riêng ServiceTariff, tách khỏi catalog "SERVICE_TARIFF" dùng chung
        // cũ (xem docs/frontend-tariff-catalog-split.md).
        Task<List<ServiceTariff>> GetServiceTariffsAsync(bool includeInactive = false);
        Task<ServiceTariff> CreateServiceTariffAsync(ServiceTariffRequest request);
        Task<ServiceTariff?> UpdateServiceTariffAsync(long id, ServiceTariffRequest request);
        Task<bool> DeactivateServiceTariffAsync(long id);
        // Cước Lưu Bãi (Storage) — bảng riêng StorageTariffRule + StorageTariffTier, tách khỏi catalog
        // "STORAGE_TARIFF" dùng chung cũ (xem docs/frontend-tariff-catalog-split.md).
        Task<List<StorageTariffRule>> GetStorageTariffsAsync();
        Task<StorageTariffRule> CreateStorageTariffAsync(StorageTariffRuleRequest request);
        Task<StorageTariffRule?> UpdateStorageTariffAsync(long id, StorageTariffRuleRequest request);
        Task<bool> DeactivateStorageTariffAsync(long id);
        Task<List<CustomerCompany>> GetCustomersAsync();
        Task<CustomerCompany> CreateCustomerAsync(CustomerCompanyRequest request);
        Task<CustomerCompany?> UpdateCustomerAsync(long id, CustomerCompanyRequest request);
        Task<bool> DeactivateCustomerAsync(long id);
        Task<List<CustomerDriver>> GetDriversAsync(string customerCode);
        Task<CustomerDriver> CreateDriverAsync(CustomerDriverRequest request);
        Task<CustomerDriver?> UpdateDriverAsync(long id, CustomerDriverRequest request);
        Task<bool> DeactivateDriverAsync(long id);
        Task<List<CustomerVehicle>> GetVehiclesAsync(string customerCode);
        Task<CustomerVehicle> CreateVehicleAsync(CustomerVehicleRequest request);
        Task<CustomerVehicle?> UpdateVehicleAsync(long id, CustomerVehicleRequest request);
        Task<bool> DeactivateVehicleAsync(long id);
        Task<List<CustomerPortalUser>> GetPortalUsersAsync(string customerCode);
        Task<CustomerPortalUser> CreatePortalUserAsync(CustomerPortalUserRequest request);
        Task<CustomerPortalUser?> UpdatePortalUserAsync(long id, CustomerPortalUserRequest request);
        Task<bool> DeactivatePortalUserAsync(long id);
        Task<List<CustomerBooking>> GetBookingsAsync(string customerCode);
        Task<CustomerBooking> CreateBookingAsync(CustomerBookingRequest request);
        Task<CustomerBooking?> UpdateBookingAsync(long id, CustomerBookingRequest request);
        Task<bool> DeactivateBookingAsync(long id);
    }
}
