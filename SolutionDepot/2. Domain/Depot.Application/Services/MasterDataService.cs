using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Depot.Data.EF;
using Depot.Data.Entities.Depot;
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
            ValidateEmail(model.ContactEmail, "Email liên hệ hãng tàu");
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
            ValidateEmail(model.ContactEmail, "Email liên hệ hãng tàu");
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
            var code = model.Code.Trim();
            ValidateStockLevels(model);
            // Trước đây thêm thẳng không kiểm tra trùng: 2 vật tư cùng mã làm tồn kho tách 2 dòng, giao dịch
            // nhập/xuất chỉ rơi vào 1 dòng (BUG-007). Unique index UX_Materials_Code_Active là chốt chặn cuối.
            var codeUpper = code.ToUpper();
            if (await _db.Materials.AnyAsync(x => !x.IsDeleted && x.Code.ToUpper() == codeUpper))
                throw new ArgumentException($"Mã vật tư '{code}' đã tồn tại.");

            var entity = new Material { Code = code };
            ApplyMaterialFields(entity, model);
            _db.Materials.Add(entity);
            try
            {
                await _db.SaveChangesAsync();
            }
            catch (DbUpdateException ex) when (ex.InnerException?.Message.Contains("UX_Materials_Code_Active") == true)
            {
                _db.Entry(entity).State = EntityState.Detached;
                throw new ArgumentException($"Mã vật tư '{code}' đã tồn tại.");
            }
            return entity;
        }

        public async Task<Material?> UpdateMaterialAsync(long id, MaterialViewModel model)
        {
            var entity = await _db.Materials.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null) return null;
            ValidateStockLevels(model);
            ApplyMaterialFields(entity, model);
            await _db.SaveChangesAsync();
            return entity;
        }

        // BUG-026: tồn tối thiểu > tối đa làm cảnh báo đặt hàng lại không bao giờ đúng. MaximumStock = 0 nghĩa là
        // không đặt mức tối đa nên bỏ qua so sánh đó.
        private static void ValidateStockLevels(MaterialViewModel model)
        {
            if (model.MinimumStock < 0 || model.MaximumStock < 0 || model.ReorderLevel < 0)
                throw new ArgumentException("Tồn tối thiểu, tồn tối đa và mức đặt hàng lại không được âm.");
            if (model.MaximumStock > 0 && model.MinimumStock > model.MaximumStock)
                throw new ArgumentException($"Tồn tối thiểu ({model.MinimumStock}) không được lớn hơn tồn tối đa ({model.MaximumStock}).");
            if (model.MaximumStock > 0 && model.ReorderLevel > model.MaximumStock)
                throw new ArgumentException($"Mức đặt hàng lại ({model.ReorderLevel}) không được lớn hơn tồn tối đa ({model.MaximumStock}).");
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

        // `IsActive=false` nghĩa là "Tạm ngưng" (vẫn phải hiện ở màn quản trị Master Data để bật lại),
        // còn "Xóa" là `IsDeleted=true` — trước đây cả 2 cùng ghi IsActive=false và API chỉ trả dòng
        // active, nên bấm "Tạm ngưng" 1 dòng thì F5 xong dòng đó biến mất khỏi màn quản trị luôn.
        // Mặc định (không truyền includeInactive) vẫn chỉ trả dòng đang áp dụng cho các màn nghiệp vụ.
        public async Task<List<MasterCatalogItem>> GetCatalogAsync(string catalogType, bool includeInactive = false)
        {
            return await _db.MasterCatalogItems
                .Where(x => x.CatalogType == catalogType && !x.IsDeleted && (includeInactive || x.IsActive))
                .OrderBy(x => x.SortOrder).ThenBy(x => x.Code)
                .ToListAsync();
        }

        public async Task<MasterCatalogItem> CreateCatalogItemAsync(MasterCatalogItemRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.CatalogType) || string.IsNullOrWhiteSpace(request.Code) || string.IsNullOrWhiteSpace(request.Name))
                throw new ArgumentException("CatalogType, Code và Name là bắt buộc.");
            var catalogType = request.CatalogType.Trim().ToUpperInvariant();
            var code = request.Code.Trim().ToUpperInvariant();
            ValidateGateOutSetting(catalogType, code, request.JsonData);
            await ValidateSurveyChecklistAsync(catalogType, null, code, request.IsActive, request.JsonData);
            // So sánh trùng phải dùng đúng giá trị đã chuẩn hoá (Trim+Upper) — trước đây so trực tiếp
            // request.Code thô nên Code khác hoa/thường hoặc dư khoảng trắng lọt qua bước tiền-kiểm này,
            // rơi xuống bắt lỗi bằng unique index DB (trả message Postgres thô, không thân thiện).
            var existing = await _db.MasterCatalogItems.FirstOrDefaultAsync(x => x.CatalogType == catalogType && x.Code == code);
            if (existing != null && !existing.IsDeleted) throw new InvalidOperationException("Mã catalog đã tồn tại trong loại danh mục này.");
            if (existing != null)
            {
                // Mã từng bị xóa mềm vẫn chiếm unique index (CatalogType, Code) — tạo lại cùng mã thì hồi
                // sinh đúng dòng cũ với dữ liệu mới thay vì báo "đã tồn tại" mà người dùng không nhìn thấy.
                existing.IsDeleted = false; existing.DeletedAt = null; existing.DeletedBy = null;
                existing.Name = request.Name.Trim(); existing.NameVi = request.NameVi?.Trim(); existing.Description = request.Description?.Trim();
                existing.JsonData = string.IsNullOrWhiteSpace(request.JsonData) ? "{}" : request.JsonData;
                existing.IsActive = request.IsActive; existing.SortOrder = request.SortOrder;
                await _db.SaveChangesAsync();
                return existing;
            }
            var item = new MasterCatalogItem
            {
                CatalogType = catalogType, Code = code,
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
            var code = request.Code.Trim().ToUpperInvariant();
            ValidateGateOutSetting(item.CatalogType, code, request.JsonData);
            await ValidateSurveyChecklistAsync(item.CatalogType, item, code, request.IsActive, request.JsonData);
            // Kiểm tra trùng Code TRƯỚC khi gán — trước đây gán thẳng rồi để unique index DB bắt lỗi,
            // nhưng controller không try/catch nên exception bay thẳng ra ngoài thành lỗi 500 thô thay vì
            // 400 theo đúng envelope {statusCode,message,data} của app.
            var duplicate = await _db.MasterCatalogItems.FirstOrDefaultAsync(x => x.Id != id && x.CatalogType == item.CatalogType && x.Code == code);
            if (duplicate != null && !duplicate.IsDeleted) throw new InvalidOperationException("Mã catalog đã tồn tại trong loại danh mục này.");
            // Đổi sang mã của 1 dòng đã xóa mềm: giải phóng mã cũ đó (unique index không phân biệt IsDeleted).
            // Lưu riêng trước để Postgres không vướng unique index khi 2 dòng cùng được UPDATE trong 1 lượt.
            if (duplicate != null)
            {
                var releasedCode = $"#DEL{duplicate.Id}:{duplicate.Code}";
                duplicate.Code = releasedCode.Length <= 50 ? releasedCode : releasedCode[..50];
                await _db.SaveChangesAsync();
            }
            item.Code = code; item.Name = request.Name.Trim(); item.NameVi = request.NameVi?.Trim();
            item.Description = request.Description?.Trim(); item.JsonData = string.IsNullOrWhiteSpace(request.JsonData) ? "{}" : request.JsonData;
            item.IsActive = request.IsActive; item.SortOrder = request.SortOrder;
            await _db.SaveChangesAsync();
            return item;
        }

        /// <summary>Cấu hình cấp vỏ (GATE_OUT_SETTING) chỉ có đúng 1 mã BOOKING_VALIDITY_HOURS (unique theo CatalogType+Code)
        /// và "hours" phải là số nguyên 1–8760 — giá trị sai trước đây sẽ âm thầm rơi về mặc định 24 giờ.</summary>
        private static void ValidateGateOutSetting(string catalogType, string code, string? jsonData)
        {
            if (!string.Equals(catalogType, DepotJobService.GateOutSettingCatalog, StringComparison.OrdinalIgnoreCase)) return;
            if (code != DepotJobService.BookingValidityHoursCode)
                throw new ArgumentException($"Cấu hình cấp vỏ chỉ có mã {DepotJobService.BookingValidityHoursCode}.");
            if (!DepotJobService.TryReadBookingValidityHours(jsonData, out _))
                throw new ArgumentException($"Số giờ hiệu lực booking phải là số nguyên từ 1 đến {DepotJobService.MaxBookingValidityHours} giờ.");
        }

        public const string SurveyChecklistCatalog = "SURVEY_CHECKLIST";
        private static readonly System.Text.RegularExpressions.Regex ChecklistZoneCodePattern = new("^[A-Z0-9_]{1,40}$");

        /// <summary>Danh mục khu vực Checklist giám định (depot-fullstack-survey-checklist-catalog): mã chữ in hoa/số/gạch
        /// dưới và KHÔNG đổi sau khi tạo (vị trí hư hỏng + phiếu tham chiếu theo mã); mặc định chỉ PASS/NA; tạm ngưng bị
        /// chặn khi còn vị trí gắn (DAMAGE_LOCATION.checklistZone) hoặc là khu vực đang dùng cuối cùng.</summary>
        private async Task ValidateSurveyChecklistAsync(string catalogType, MasterCatalogItem? existing, string code, bool isActive, string? jsonData)
        {
            if (!string.Equals(catalogType, SurveyChecklistCatalog, StringComparison.OrdinalIgnoreCase)) return;
            if (existing != null && existing.Code != code)
                throw new ArgumentException($"Không đổi mã khu vực '{existing.Code}' — vị trí hư hỏng và phiếu giám định tham chiếu theo mã. Chỉ sửa tên / thứ tự / mặc định.");
            if (existing == null && !ChecklistZoneCodePattern.IsMatch(code))
                throw new ArgumentException("Mã khu vực chỉ gồm chữ in hoa, số và dấu gạch dưới (tối đa 40 ký tự).");
            var defaultStatus = ReadJsonString(jsonData, "defaultStatus") ?? "PASS";
            if (defaultStatus is not ("PASS" or "NA"))
                throw new ArgumentException("Trạng thái mặc định của khu vực chỉ nhận Đạt (PASS) hoặc N/A (NA).");
            if (existing != null && existing.IsActive && !isActive)
                await EnsureChecklistZoneRemovableAsync(existing, "tạm ngưng");
        }

        private async Task ValidateSurveyChecklistDeleteAsync(MasterCatalogItem item)
        {
            if (!string.Equals(item.CatalogType, SurveyChecklistCatalog, StringComparison.OrdinalIgnoreCase)) return;
            if (item.IsActive) await EnsureChecklistZoneRemovableAsync(item, "xoá");
            if (await _db.Set<SurveyChecklistItem>().AnyAsync(c => c.ZoneKey == item.Code))
                throw new ArgumentException($"Khu vực '{item.Code}' đã có trong phiếu giám định nên không xoá được — hãy Tạm ngưng thay vì xoá.");
        }

        private async Task EnsureChecklistZoneRemovableAsync(MasterCatalogItem zone, string action)
        {
            var locations = await _db.MasterCatalogItems.AsNoTracking()
                .Where(x => x.CatalogType == "DAMAGE_LOCATION" && !x.IsDeleted).ToListAsync();
            var linked = locations.Where(l => ReadJsonString(l.JsonData, "checklistZone") == zone.Code).Select(l => l.Code).OrderBy(c => c).ToList();
            if (linked.Count > 0)
                throw new ArgumentException($"Không {action} được khu vực '{zone.Code}': còn {linked.Count} vị trí hư hỏng gắn vào ({string.Join(", ", linked)}). Gắn các vị trí này sang khu vực khác ở DM Vị Trí Cấu Kiện trước.");
            var activeCount = await _db.MasterCatalogItems.CountAsync(x => x.CatalogType == SurveyChecklistCatalog && !x.IsDeleted && x.IsActive);
            if (activeCount <= 1)
                throw new ArgumentException($"Không {action} được khu vực đang dùng cuối cùng — checklist giám định phải còn ít nhất 1 khu vực.");
        }

        private static string? ReadJsonString(string? jsonData, string key)
        {
            if (string.IsNullOrWhiteSpace(jsonData)) return null;
            try
            {
                using var doc = System.Text.Json.JsonDocument.Parse(jsonData);
                return doc.RootElement.ValueKind == System.Text.Json.JsonValueKind.Object
                    && doc.RootElement.TryGetProperty(key, out var v) && v.ValueKind == System.Text.Json.JsonValueKind.String ? v.GetString() : null;
            }
            catch (System.Text.Json.JsonException) { throw new ArgumentException("JsonData không phải JSON hợp lệ."); }
        }

        public async Task<bool> DeactivateCatalogItemAsync(long id)
        {
            var item = await _db.MasterCatalogItems.FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
            if (item == null) return false;
            await ValidateSurveyChecklistDeleteAsync(item);
            // Xóa = xóa mềm (IsDeleted), KHÔNG dùng IsActive — IsActive=false là trạng thái "Tạm ngưng".
            item.IsDeleted = true; item.DeletedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return true;
        }

        // Giống GetCatalogAsync: IsActive=false = "Tạm ngưng" (màn quản trị vẫn phải thấy để bật lại),
        // "Xóa" = IsDeleted. Trước đây cả 2 cùng IsActive=false + API chỉ trả dòng active → chọn "Tạm Ngưng"
        // trong form rồi F5 là hạng mục biến mất. Mặc định vẫn chỉ trả dòng đang áp dụng (Calculator, Operation).
        public async Task<List<ServiceTariff>> GetServiceTariffsAsync(bool includeInactive = false)
        {
            return await _db.ServiceTariffs
                .Include(x => x.Prices.Where(p => !p.IsDeleted))
                .Where(x => !x.IsDeleted && (includeInactive || x.IsActive))
                .OrderBy(x => x.SortOrder).ThenBy(x => x.Code)
                .ToListAsync();
        }

        public async Task<ServiceTariff> CreateServiceTariffAsync(ServiceTariffRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Code) || string.IsNullOrWhiteSpace(request.NameVi))
                throw new ArgumentException("Mã biểu cước và tên dịch vụ là bắt buộc.");
            ValidateServiceTariff(request);
            var prices = await NormalizeServiceTariffPricesAsync(request.Prices);
            var code = request.Code.Trim().ToUpperInvariant();
            var existing = await _db.ServiceTariffs.FirstOrDefaultAsync(x => x.Code == code);
            if (existing != null && !existing.IsDeleted) throw new InvalidOperationException("Mã biểu cước nâng hạ đã tồn tại.");
            await using var tx = await _db.Database.BeginTransactionAsync();
            ServiceTariff item;
            if (existing != null)
            {
                // Mã đã xóa mềm vẫn chiếm unique index Code — tạo lại cùng mã thì hồi sinh đúng dòng cũ (giá cũ bỏ hẳn).
                existing.IsDeleted = false; existing.DeletedAt = null; existing.DeletedBy = null;
                ApplyServiceTariffRequest(existing, request, code);
                await _db.Set<ServiceTariffPrice>().Where(p => p.ServiceTariffId == existing.Id).ExecuteDeleteAsync();
                item = existing;
            }
            else
            {
                item = new ServiceTariff { Code = code };
                ApplyServiceTariffRequest(item, request, code);
                _db.ServiceTariffs.Add(item);
                await _db.SaveChangesAsync();
            }
            foreach (var p in prices) _db.Set<ServiceTariffPrice>().Add(new ServiceTariffPrice { ServiceTariffId = item.Id, ContainerTypeCode = p.Code, Price = p.Price });
            await _db.SaveChangesAsync();
            await tx.CommitAsync();
            return await ReloadServiceTariffAsync(item.Id);
        }

        public async Task<ServiceTariff?> UpdateServiceTariffAsync(long id, ServiceTariffRequest request)
        {
            // Không Include(Prices) — ExecuteDeleteAsync xoá thẳng dưới DB (giống UpdateStorageTariffAsync).
            var item = await _db.ServiceTariffs.FirstOrDefaultAsync(x => x.Id == id);
            if (item == null) return null;
            if (string.IsNullOrWhiteSpace(request.Code) || string.IsNullOrWhiteSpace(request.NameVi))
                throw new ArgumentException("Mã biểu cước và tên dịch vụ là bắt buộc.");
            ValidateServiceTariff(request);
            var prices = await NormalizeServiceTariffPricesAsync(request.Prices);
            var code = request.Code.Trim().ToUpperInvariant();
            // Phiếu dịch vụ lưu mã biểu cước dạng chữ (ServiceOrderItem.ServiceCode) — đổi mã làm phiếu cũ mất liên kết
            // tra cứu, và server tra giá theo mã (depot-fullstack-lolo-tariff-pricing).
            if (code != item.Code)
                throw new ArgumentException($"Không đổi mã biểu cước '{item.Code}' — phiếu dịch vụ tham chiếu theo mã. Chỉ sửa tên / giá / phân loại.");
            await using var tx = await _db.Database.BeginTransactionAsync();
            ApplyServiceTariffRequest(item, request, code);
            // Lưu = thay toàn bộ danh sách giá theo loại container (xoá cứng dòng cũ để không vướng unique (biểu cước, loại)).
            await _db.Set<ServiceTariffPrice>().Where(p => p.ServiceTariffId == id).ExecuteDeleteAsync();
            foreach (var p in prices) _db.Set<ServiceTariffPrice>().Add(new ServiceTariffPrice { ServiceTariffId = id, ContainerTypeCode = p.Code, Price = p.Price });
            await _db.SaveChangesAsync();
            await tx.CommitAsync();
            return await ReloadServiceTariffAsync(id);
        }

        private async Task<ServiceTariff> ReloadServiceTariffAsync(long id)
        {
            _db.ChangeTracker.Clear();
            return await _db.ServiceTariffs.AsNoTracking().Include(x => x.Prices.Where(p => !p.IsDeleted)).FirstAsync(x => x.Id == id);
        }

        /// <summary>Giá theo loại container: mã loại phải thuộc DM Loại Container (CONTAINER_TYPE.Name, chưa xoá), không trùng,
        /// giá ≥ 0. Giá 0 / trống = chưa có giá → không lưu dòng (depot-fullstack-lolo-tariff-pricing).</summary>
        private async Task<List<(string Code, decimal Price)>> NormalizeServiceTariffPricesAsync(List<ServiceTariffPriceViewModel>? prices)
        {
            var list = (prices ?? new()).Select(p => (Code: (p.ContainerTypeCode ?? string.Empty).Trim().ToUpperInvariant(), p.Price)).ToList();
            if (list.Any(p => p.Price < 0)) throw new ArgumentException("Đơn giá cước không được âm.");
            var duplicated = list.GroupBy(p => p.Code).Where(g => g.Count() > 1).Select(g => g.Key).ToList();
            if (duplicated.Count > 0) throw new ArgumentException($"Trùng loại container trong biểu cước: {string.Join(", ", duplicated)}.");
            var typeCodes = (await _db.MasterCatalogItems.AsNoTracking()
                .Where(x => x.CatalogType == "CONTAINER_TYPE" && !x.IsDeleted).Select(x => x.Name).ToListAsync())
                .Select(n => (n ?? string.Empty).Trim().ToUpperInvariant()).ToHashSet();
            var unknown = list.Where(p => !typeCodes.Contains(p.Code)).Select(p => p.Code).Distinct().ToList();
            if (unknown.Count > 0) throw new ArgumentException($"Loại container không có trong DM Loại Container: {string.Join(", ", unknown.Select(c => $"'{c}'"))}.");
            return list.Where(p => p.Price > 0).ToList();
        }

        private static void ValidateServiceTariff(ServiceTariffRequest r)
        {
            if (r.VatPercent < 0 || r.VatPercent > 100)
                throw new ArgumentException("VAT phải trong khoảng 0–100%.");
            if (!ServiceTariffCategories.Contains(r.ServiceCategory ?? ""))
                throw new ArgumentException($"Phân loại '{r.ServiceCategory}' không hợp lệ — chỉ nhận {string.Join(", ", ServiceTariffCategories)}.");
            if (!ServiceTariffShifts.Contains(r.ApplicableShift ?? ""))
                throw new ArgumentException($"Ca áp dụng '{r.ApplicableShift}' không hợp lệ — chỉ nhận {string.Join(", ", ServiceTariffShifts)}.");
            // Phiếu dịch vụ cộng tiền như VND, chưa quy đổi ngoại tệ.
            if (r.Currency != "VND")
                throw new ArgumentException("Biểu cước nâng hạ chỉ dùng tiền VND.");
            if (string.IsNullOrWhiteSpace(r.Unit))
                throw new ArgumentException("Đơn vị tính là bắt buộc.");
        }

        // ===== Biểu phí vệ sinh (depot-fullstack-cleaning-tariff-pricing) — cùng khuôn Service Tariff =====
        public static readonly string[] CleaningTariffCategories =
        {
            "GENERAL_SWEEP", "WATER_PRESSURE", "HOT_WATER_WASH", "CHEMICAL_WASH", "DEODORIZATION", "OIL_REMOVAL", "STICKER_REMOVAL",
            "REEFER_SANITATION", "FLOOR_TREATMENT", "SPECIAL_TREATMENT", "FOOD_GRADE", "ODOR_REMOVAL", "FUMIGATION"
        };
        // Giữ nguyên các giá trị bên chịu phí đang có trong dữ liệu (quyết định giữ cách tính bên chịu phí hiện tại).
        private static readonly string[] CleaningResponsibleParties = { "O", "U", "T", "C" };

        public async Task<List<CleaningTariff>> GetCleaningTariffsAsync(bool includeInactive = false)
        {
            return await _db.CleaningTariffs
                .Include(x => x.Prices.Where(p => !p.IsDeleted))
                .Where(x => !x.IsDeleted && (includeInactive || x.IsActive))
                .OrderBy(x => x.SortOrder).ThenBy(x => x.Code)
                .ToListAsync();
        }

        public async Task<CleaningTariff> CreateCleaningTariffAsync(CleaningTariffRequest request)
        {
            ValidateCleaningTariff(request);
            var prices = await NormalizeServiceTariffPricesAsync(request.Prices);
            var code = request.Code.Trim().ToUpperInvariant();
            var existing = await _db.CleaningTariffs.FirstOrDefaultAsync(x => x.Code == code);
            if (existing != null && !existing.IsDeleted) throw new InvalidOperationException("Mã biểu phí vệ sinh đã tồn tại.");
            await using var tx = await _db.Database.BeginTransactionAsync();
            CleaningTariff item;
            if (existing != null)
            {
                // Mã đã xoá mềm vẫn chiếm unique index Code — tạo lại cùng mã thì hồi sinh dòng cũ (giá cũ bỏ hẳn).
                existing.IsDeleted = false; existing.DeletedAt = null; existing.DeletedBy = null;
                ApplyCleaningTariffRequest(existing, request);
                await _db.Set<CleaningTariffPrice>().Where(p => p.CleaningTariffId == existing.Id).ExecuteDeleteAsync();
                item = existing;
            }
            else
            {
                item = new CleaningTariff { Code = code };
                ApplyCleaningTariffRequest(item, request);
                _db.CleaningTariffs.Add(item);
                await _db.SaveChangesAsync();
            }
            foreach (var p in prices) _db.Set<CleaningTariffPrice>().Add(new CleaningTariffPrice { CleaningTariffId = item.Id, ContainerTypeCode = p.Code, Price = p.Price });
            await _db.SaveChangesAsync();
            await tx.CommitAsync();
            return await ReloadCleaningTariffAsync(item.Id);
        }

        public async Task<CleaningTariff?> UpdateCleaningTariffAsync(long id, CleaningTariffRequest request)
        {
            var item = await _db.CleaningTariffs.FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
            if (item == null) return null;
            ValidateCleaningTariff(request);
            var prices = await NormalizeServiceTariffPricesAsync(request.Prices);
            var code = request.Code.Trim().ToUpperInvariant();
            if (code != item.Code)
                throw new ArgumentException($"Không đổi mã biểu phí vệ sinh '{item.Code}' — phiếu giám định / lệnh vệ sinh / phiếu dịch vụ tham chiếu theo mã.");
            await using var tx = await _db.Database.BeginTransactionAsync();
            ApplyCleaningTariffRequest(item, request);
            await _db.Set<CleaningTariffPrice>().Where(p => p.CleaningTariffId == id).ExecuteDeleteAsync();
            foreach (var p in prices) _db.Set<CleaningTariffPrice>().Add(new CleaningTariffPrice { CleaningTariffId = id, ContainerTypeCode = p.Code, Price = p.Price });
            await _db.SaveChangesAsync();
            await tx.CommitAsync();
            return await ReloadCleaningTariffAsync(id);
        }

        public async Task<bool> DeactivateCleaningTariffAsync(long id)
        {
            var item = await _db.CleaningTariffs.FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
            if (item == null) return false;
            item.IsDeleted = true; item.DeletedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return true;
        }

        private async Task<CleaningTariff> ReloadCleaningTariffAsync(long id)
        {
            _db.ChangeTracker.Clear();
            return await _db.CleaningTariffs.AsNoTracking().Include(x => x.Prices.Where(p => !p.IsDeleted)).FirstAsync(x => x.Id == id);
        }

        private static void ValidateCleaningTariff(CleaningTariffRequest r)
        {
            if (string.IsNullOrWhiteSpace(r.Code) || string.IsNullOrWhiteSpace(r.NameVi))
                throw new ArgumentException("Mã biểu phí và tên tiếng Việt là bắt buộc.");
            if (r.VatPercent < 0 || r.VatPercent > 100)
                throw new ArgumentException("VAT phải trong khoảng 0–100%.");
            if (r.Currency != "VND")
                throw new ArgumentException("Biểu phí vệ sinh chỉ dùng tiền VND.");
            if (!CleaningTariffCategories.Contains(r.Category ?? ""))
                throw new ArgumentException($"Nhóm dịch vụ '{r.Category}' không hợp lệ — chỉ nhận {string.Join(", ", CleaningTariffCategories)}.");
            if (!CleaningResponsibleParties.Contains(r.ResponsiblePartyDefault ?? ""))
                throw new ArgumentException($"Bên chịu phí '{r.ResponsiblePartyDefault}' không hợp lệ — chỉ nhận {string.Join(", ", CleaningResponsibleParties)}.");
            if (r.EstimatedDurationMin < 0 || r.WaterUsageLiters < 0)
                throw new ArgumentException("Thời gian thực hiện và lượng nước không được âm.");
        }

        private static void ApplyCleaningTariffRequest(CleaningTariff item, CleaningTariffRequest r)
        {
            item.NameVi = r.NameVi.Trim(); item.NameEn = r.NameEn?.Trim(); item.Category = r.Category;
            item.CedexCode = string.IsNullOrWhiteSpace(r.CedexCode) ? null : r.CedexCode.Trim().ToUpperInvariant();
            item.Description = r.Description?.Trim(); item.VatPercent = r.VatPercent; item.Currency = r.Currency;
            item.ResponsiblePartyDefault = r.ResponsiblePartyDefault; item.EstimatedDurationMin = r.EstimatedDurationMin;
            item.WaterUsageLiters = r.WaterUsageLiters; item.ChemicalRequired = r.ChemicalRequired?.Trim();
            item.EquipmentUsed = r.EquipmentUsed?.Trim(); item.IsActive = r.IsActive; item.SortOrder = r.SortOrder;
        }

        public static readonly string[] ServiceTariffCategories = { "LIFT_EMPTY", "LIFT_LADEN", "SHIFTING", "NIGHT_SURCHARGE", "PTI", "CUSTOMS", "WEIGHING" };
        private static readonly string[] ServiceTariffShifts = { "ALL", "DAY_ONLY", "NIGHT_SURCHARGE" };

        public const string StorageCalculationUnit = "VND/Cont/Ngày";

        // BUG-018 + depot-fullstack-storage-tariff-pricing: ngày miễn phí chỉ khai ở DefaultFreeDays; bậc đầu bắt đầu đúng
        // ngày (miễn phí + 1), các bậc liền nhau không hở / chồng, chỉ bậc cuối không giới hạn và bắt buộc có.
        private static void ValidateStorageTariff(StorageTariffRuleRequest r)
        {
            if (string.IsNullOrWhiteSpace(r.Code)) throw new ArgumentException("Mã quy tắc lưu bãi là bắt buộc.");
            if (r.DefaultFreeDays < 0) throw new ArgumentException("Số ngày miễn phí không được âm.");
            if (r.VatPercent < 0 || r.VatPercent > 100) throw new ArgumentException("VAT phải trong khoảng 0–100%.");
            if (r.Tiers.Count == 0) throw new ArgumentException("Quy tắc lưu bãi phải có ít nhất 1 bậc giá.");
            var tiers = r.Tiers.OrderBy(t => t.FromDay).ToList();
            for (var i = 0; i < tiers.Count; i++)
            {
                var t = tiers[i];
                var name = string.IsNullOrWhiteSpace(t.TierName) ? $"Bậc {i + 1}" : t.TierName.Trim();
                var expectedFrom = i == 0 ? r.DefaultFreeDays + 1 : (tiers[i - 1].ToDay ?? 0) + 1;
                if (t.FromDay != expectedFrom)
                    throw new ArgumentException(i == 0
                        ? $"{name}: bậc đầu phải bắt đầu ngày {expectedFrom} (ngay sau {r.DefaultFreeDays} ngày miễn phí), đang là ngày {t.FromDay}."
                        : $"{name}: phải bắt đầu ngày {expectedFrom} (liền sau bậc trước), đang là ngày {t.FromDay}.");
                if (t.ToDay.HasValue && t.ToDay < t.FromDay) throw new ArgumentException($"{name}: đến ngày ({t.ToDay}) nhỏ hơn từ ngày ({t.FromDay}).");
                if (!t.ToDay.HasValue && i < tiers.Count - 1) throw new ArgumentException($"{name}: bậc không giới hạn đến ngày phải là bậc cuối cùng.");
                if (t.ToDay.HasValue && i == tiers.Count - 1) throw new ArgumentException($"{name}: bậc cuối phải để trống \"đến ngày\" (từ ngày {t.FromDay} trở đi).");
            }
        }

        private static void ApplyServiceTariffRequest(ServiceTariff item, ServiceTariffRequest request, string code)
        {
            item.Code = code; item.ServiceCategory = request.ServiceCategory;
            item.NameVi = request.NameVi.Trim(); item.NameEn = request.NameEn?.Trim(); item.Unit = request.Unit;
            item.VatPercent = request.VatPercent; item.Currency = request.Currency; item.ApplicableShift = request.ApplicableShift;
            item.Description = request.Description?.Trim(); item.IsActive = request.IsActive; item.SortOrder = request.SortOrder;
        }

        public async Task<bool> DeactivateServiceTariffAsync(long id)
        {
            var item = await _db.ServiceTariffs.FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
            if (item == null) return false;
            // Xóa = xóa mềm (IsDeleted); IsActive=false là "Tạm ngưng", do form tự đặt.
            item.IsDeleted = true; item.DeletedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<List<StorageTariffRule>> GetStorageTariffsAsync(bool includeInactive = false)
        {
            return await _db.StorageTariffRules
                .Include(x => x.Tiers.Where(t => !t.IsDeleted).OrderBy(t => t.SortOrder))
                .ThenInclude(t => t.Prices.Where(p => !p.IsDeleted))
                .Where(x => !x.IsDeleted && (includeInactive || x.IsActive))
                .OrderBy(x => x.SortOrder).ThenBy(x => x.Code)
                .ToListAsync();
        }

        /// <summary>Kiểm tra request + chuẩn hoá: hãng tàu (ALL / DM Hãng Tàu, tên lấy từ DM), một quy tắc đang dùng mỗi hãng,
        /// bậc liền nhau sau ngày miễn phí, giá theo loại container của DM. Trả tên hãng và danh sách bậc kèm giá đã chuẩn hoá.</summary>
        private async Task<(string LineCode, string LineName, List<(StorageTariffTierViewModel Tier, List<(string Code, decimal Price)> Prices)> Tiers)>
            PrepareStorageTariffAsync(StorageTariffRuleRequest request, long? selfId)
        {
            ValidateStorageTariff(request);
            var lineCode = string.IsNullOrWhiteSpace(request.ShippingLineCode) ? "ALL" : request.ShippingLineCode.Trim().ToUpperInvariant();
            string lineName;
            if (lineCode == "ALL") lineName = "Mọi hãng tàu";
            else
            {
                var line = await _db.ShippingLines.AsNoTracking().FirstOrDefaultAsync(l => l.Code == lineCode && !l.IsDeleted)
                    ?? throw new ArgumentException($"Hãng tàu '{lineCode}' không có trong DM Hãng Tàu.");
                lineName = line.Name;
            }
            if (request.IsActive)
            {
                var other = await _db.StorageTariffRules.AsNoTracking()
                    .Where(x => !x.IsDeleted && x.IsActive && x.ShippingLineCode == lineCode && (selfId == null || x.Id != selfId))
                    .Select(x => x.Code).FirstOrDefaultAsync();
                if (other != null)
                    throw new ArgumentException($"Hãng tàu {lineCode} đã có quy tắc lưu bãi đang dùng ({other}) — tạm ngưng quy tắc đó trước, mỗi hãng chỉ một quy tắc đang dùng.");
            }
            var tiers = new List<(StorageTariffTierViewModel, List<(string, decimal)>)>();
            foreach (var t in request.Tiers.OrderBy(t => t.FromDay))
                tiers.Add((t, await NormalizeServiceTariffPricesAsync(t.Prices)));
            return (lineCode, lineName, tiers);
        }

        private static void ApplyStorageTariffRequest(StorageTariffRule item, StorageTariffRuleRequest request, string lineCode, string lineName)
        {
            item.ShippingLineCode = lineCode; item.ShippingLineName = lineName;
            item.DefaultFreeDays = request.DefaultFreeDays; item.CalculationUnit = StorageCalculationUnit;
            item.VatPercent = request.VatPercent; item.Notes = request.Notes?.Trim();
            item.IsActive = request.IsActive; item.SortOrder = request.SortOrder;
        }

        private void AddStorageTiers(long ruleId, List<(StorageTariffTierViewModel Tier, List<(string Code, decimal Price)> Prices)> tiers)
        {
            var order = 0;
            foreach (var (t, prices) in tiers)
            {
                order++;
                var tier = new StorageTariffTier
                {
                    StorageTariffRuleId = ruleId,
                    TierName = string.IsNullOrWhiteSpace(t.TierName) ? $"Bậc {order}" : t.TierName.Trim(),
                    FromDay = t.FromDay, ToDay = t.ToDay, SortOrder = order
                };
                foreach (var p in prices) tier.Prices.Add(new StorageTariffTierPrice { ContainerTypeCode = p.Code, Price = p.Price });
                _db.Set<StorageTariffTier>().Add(tier);
            }
        }

        public async Task<StorageTariffRule> CreateStorageTariffAsync(StorageTariffRuleRequest request)
        {
            var code = (request.Code ?? string.Empty).Trim().ToUpperInvariant();
            var existing = await _db.StorageTariffRules.FirstOrDefaultAsync(x => x.Code == code);
            if (existing != null && !existing.IsDeleted) throw new InvalidOperationException("Mã quy tắc lưu bãi đã tồn tại.");
            var (lineCode, lineName, tiers) = await PrepareStorageTariffAsync(request, existing?.Id);

            await using var tx = await _db.Database.BeginTransactionAsync();
            StorageTariffRule item;
            if (existing != null)
            {
                // Mã từng bị xoá (xoá mềm) — dùng lại dòng cũ vì Code là unique index.
                item = existing;
                item.IsDeleted = false; item.DeletedAt = null; item.DeletedBy = null;
                await _db.Set<StorageTariffTier>().Where(t => t.StorageTariffRuleId == item.Id).ExecuteDeleteAsync();
            }
            else
            {
                item = new StorageTariffRule { Code = code };
                _db.StorageTariffRules.Add(item);
            }
            ApplyStorageTariffRequest(item, request, lineCode, lineName);
            await _db.SaveChangesAsync();
            AddStorageTiers(item.Id, tiers);
            await _db.SaveChangesAsync();
            await tx.CommitAsync();
            return (await GetStorageTariffByIdAsync(item.Id))!;
        }

        public async Task<StorageTariffRule?> UpdateStorageTariffAsync(long id, StorageTariffRuleRequest request)
        {
            // Không Include(Tiers) — ExecuteDeleteAsync xoá thẳng dưới DB, Include trước sẽ để lại entity con "ma" trong tracker.
            var item = await _db.StorageTariffRules.FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
            if (item == null) return null;
            var code = (request.Code ?? string.Empty).Trim().ToUpperInvariant();
            if (code != item.Code)
                throw new ArgumentException($"Không đổi mã quy tắc lưu bãi '{item.Code}'.");
            var (lineCode, lineName, tiers) = await PrepareStorageTariffAsync(request, id);

            // ExecuteDelete chạy thẳng xuống DB, không tự gộp transaction với SaveChanges — bọc 1 transaction để không mất bậc giá.
            await using var tx = await _db.Database.BeginTransactionAsync();
            ApplyStorageTariffRequest(item, request, lineCode, lineName);
            await _db.Set<StorageTariffTier>().Where(t => t.StorageTariffRuleId == id).ExecuteDeleteAsync();
            AddStorageTiers(id, tiers);
            await _db.SaveChangesAsync();
            await tx.CommitAsync();
            return await GetStorageTariffByIdAsync(id);
        }

        private async Task<StorageTariffRule?> GetStorageTariffByIdAsync(long id)
        {
            _db.ChangeTracker.Clear();
            return await _db.StorageTariffRules.AsNoTracking()
                .Include(x => x.Tiers.Where(t => !t.IsDeleted).OrderBy(t => t.SortOrder))
                .ThenInclude(t => t.Prices.Where(p => !p.IsDeleted))
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<bool> DeactivateStorageTariffAsync(long id)
        {
            var item = await _db.StorageTariffRules.FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
            if (item == null) return false;
            // Xóa = xóa mềm (IsDeleted); IsActive=false là "Tạm ngưng", do form tự đặt.
            item.IsDeleted = true; item.DeletedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return true;
        }

        // BUG-024: email trước đây không kiểm tra định dạng (lưu được "abc"), làm hỏng gửi thông báo/hoá đơn.
        private static void ValidateEmail(string? email, string label)
        {
            if (string.IsNullOrWhiteSpace(email)) return;
            if (!System.Net.Mail.MailAddress.TryCreate(email.Trim(), out var parsed) || parsed.Address != email.Trim() || !parsed.Host.Contains('.'))
                throw new ArgumentException($"{label} '{email}' không đúng định dạng.");
        }

        private static void ValidateCustomerFields(CustomerCompanyRequest request)
        {
            if (request.CreditLimit < 0) throw new ArgumentException("Hạn mức công nợ không được âm.");
            if (request.PaymentTermDays < 0) throw new ArgumentException("Số ngày thanh toán không được âm.");
            ValidateEmail(request.Email, "Email khách hàng");
            ValidateEmail(request.ContactEmail, "Email người liên hệ");
        }

        // BUG-020: trước đây tạo được tài xế/xe/tài khoản/booking gắn vào mã khách hàng không tồn tại.
        private async Task EnsureCustomerExistsAsync(string customerCode)
        {
            var code = customerCode.Trim().ToUpperInvariant();
            if (!await _db.CustomerCompanies.AnyAsync(x => x.Code == code && x.Status != "DELETED"))
                throw new ArgumentException($"Khách hàng '{customerCode.Trim()}' không tồn tại hoặc đã bị khoá.");
        }

        public async Task<List<CustomerCompany>> GetCustomersAsync()
        {
            return await _db.CustomerCompanies.Where(x => x.Status != "DELETED").OrderBy(x => x.Code).ToListAsync();
        }

        /// <summary>Nhà xe đã có (trùng tên chuẩn hoá hoặc MST) — trả về để màn Gate-In chọn luôn thay vì tạo trùng.</summary>
        public sealed class DuplicateTruckingCompanyException : Exception
        {
            public CustomerCompany Existing { get; }
            public DuplicateTruckingCompanyException(string message, CustomerCompany existing) : base(message) { Existing = existing; }
        }

        private static string NormalizeCompanyName(string? name) =>
            System.Text.RegularExpressions.Regex.Replace(name ?? string.Empty, @"\s+", " ").Trim();

        /// <summary>
        /// Thêm nhanh nhà xe tại cổng: tên bắt buộc, chống trùng tên (không phân biệt hoa thường, gộp khoảng trắng) / MST với
        /// khách hàng ACTIVE, mã tự sinh NX-0001 tăng dần (trùng unique Code khi 2 người thêm cùng lúc thì sinh lại, tối đa 3 lần).
        /// </summary>
        public async Task<CustomerCompany> QuickCreateTruckingCompanyAsync(TruckingQuickCreateRequest request, string actor)
        {
            var name = NormalizeCompanyName(request?.Name);
            if (name.Length == 0) throw new ArgumentException("Chưa nhập tên nhà xe.");
            if (name.Length > 200) throw new ArgumentException("Tên nhà xe tối đa 200 ký tự.");
            var taxCode = string.IsNullOrWhiteSpace(request!.TaxCode) ? null : new string(request.TaxCode.Where(c => !char.IsWhiteSpace(c)).ToArray());
            var phone = string.IsNullOrWhiteSpace(request.Phone) ? null : request.Phone.Trim();

            var active = await _db.CustomerCompanies.AsNoTracking().Where(x => x.Status == "ACTIVE").ToListAsync();
            var key = name.ToLowerInvariant();
            var sameName = active.FirstOrDefault(x => NormalizeCompanyName(x.Name).ToLowerInvariant() == key);
            if (sameName != null)
                throw new DuplicateTruckingCompanyException($"Đã có nhà xe {sameName.Code} - {sameName.Name}, chọn nhà xe này thay vì tạo mới.", sameName);
            if (taxCode != null)
            {
                var sameTax = active.FirstOrDefault(x => !string.IsNullOrWhiteSpace(x.TaxCode)
                    && new string(x.TaxCode.Where(c => !char.IsWhiteSpace(c)).ToArray()) == taxCode);
                if (sameTax != null)
                    throw new DuplicateTruckingCompanyException($"Mã số thuế {taxCode} trùng với nhà xe {sameTax.Code} - {sameTax.Name}.", sameTax);
            }

            var note = $"Tạo tại cổng Gate-In bởi {(string.IsNullOrWhiteSpace(actor) ? "nhân viên cổng" : actor.Trim())} lúc {DateTime.UtcNow.AddHours(7):dd/MM/yyyy HH:mm}";
            for (var attempt = 1; ; attempt++)
            {
                var codes = await _db.CustomerCompanies.AsNoTracking().Where(x => x.Code.StartsWith("NX-")).Select(x => x.Code).ToListAsync();
                var next = codes.Select(c => int.TryParse(c[3..], out var n) ? n : 0).DefaultIfEmpty(0).Max() + 1;
                var customer = new CustomerCompany
                {
                    Code = $"NX-{next:D4}", Name = name, Phone = phone, TaxCode = taxCode,
                    CustomerType = "TRUCKING", Status = "ACTIVE", CreditLimit = 0, PaymentTermDays = 0, Notes = note
                };
                _db.CustomerCompanies.Add(customer);
                try
                {
                    await _db.SaveChangesAsync();
                    return customer;
                }
                catch (DbUpdateException) when (attempt < 3)
                {
                    // 2 yêu cầu cùng lúc sinh cùng số NX → unique Code chặn; bỏ entity hỏng rồi sinh số mới.
                    _db.Entry(customer).State = EntityState.Detached;
                }
            }
        }

        public async Task<CustomerCompany> CreateCustomerAsync(CustomerCompanyRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Code) || string.IsNullOrWhiteSpace(request.Name)) throw new ArgumentException("Mã và tên khách hàng là bắt buộc.");
            ValidateCustomerFields(request);
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
            if (string.IsNullOrWhiteSpace(request.Name)) throw new ArgumentException("Tên khách hàng là bắt buộc.");
            ValidateCustomerFields(request);
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
            await EnsureCustomerExistsAsync(request.CustomerCode);
            ValidateEmail(request.Email, "Email tài xế");
            if (await _db.CustomerDrivers.AnyAsync(x => x.CustomerCode == request.CustomerCode && x.DriverCode == request.DriverCode)) throw new InvalidOperationException("Mã tài xế đã tồn tại.");
            var driver = new CustomerDriver { CustomerCode = request.CustomerCode.Trim().ToUpperInvariant(), DriverCode = request.DriverCode.Trim().ToUpperInvariant(), FullName = request.FullName.Trim(), Phone = request.Phone, Email = request.Email, CitizenId = request.CitizenId, LicenseNumber = request.LicenseNumber, LicenseGrade = request.LicenseGrade, LicenseExpiryDate = request.LicenseExpiryDate, Address = request.Address, Status = request.Status };
            _db.CustomerDrivers.Add(driver); await _db.SaveChangesAsync(); return driver;
        }

        public async Task<CustomerDriver?> UpdateDriverAsync(long id, CustomerDriverRequest request)
        {
            var driver = await _db.CustomerDrivers.FirstOrDefaultAsync(x => x.Id == id); if (driver == null) return null;
            ValidateEmail(request.Email, "Email tài xế");
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
            await EnsureCustomerExistsAsync(request.CustomerCode);
            if (request.PayloadTon < 0) throw new ArgumentException("Tải trọng phương tiện không được âm.");
            if (await _db.CustomerVehicles.AnyAsync(x => x.CustomerCode == request.CustomerCode && x.PlateNumber == request.PlateNumber)) throw new InvalidOperationException("Phương tiện đã tồn tại.");
            var vehicle = new CustomerVehicle { CustomerCode = request.CustomerCode.Trim().ToUpperInvariant(), PlateNumber = request.PlateNumber.Trim().ToUpperInvariant(), VehicleType = request.VehicleType, Brand = request.Brand, PayloadTon = request.PayloadTon, OwnerName = request.OwnerName, DefaultDriverCode = request.DefaultDriverCode, InspectionExpiry = request.InspectionExpiry, Status = request.Status };
            _db.CustomerVehicles.Add(vehicle); await _db.SaveChangesAsync(); return vehicle;
        }

        public async Task<CustomerVehicle?> UpdateVehicleAsync(long id, CustomerVehicleRequest request)
        {
            var vehicle = await _db.CustomerVehicles.FirstOrDefaultAsync(x => x.Id == id); if (vehicle == null) return null;
            if (request.PayloadTon < 0) throw new ArgumentException("Tải trọng phương tiện không được âm.");
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
            await EnsureCustomerExistsAsync(request.CustomerCode);
            ValidateEmail(request.Email, "Email tài khoản");
            if (await _db.CustomerPortalUsers.AnyAsync(x => x.CustomerCode == request.CustomerCode && x.Username == request.Username)) throw new InvalidOperationException("Username đã tồn tại.");
            var user = new CustomerPortalUser { CustomerCode = request.CustomerCode.Trim().ToUpperInvariant(), Username = request.Username.Trim().ToLowerInvariant(), FullName = request.FullName.Trim(), Email = request.Email, Phone = request.Phone, Role = request.Role, AccountType = request.AccountType, Status = request.Status };
            _db.CustomerPortalUsers.Add(user); await _db.SaveChangesAsync(); return user;
        }

        public async Task<CustomerPortalUser?> UpdatePortalUserAsync(long id, CustomerPortalUserRequest request)
        {
            var user = await _db.CustomerPortalUsers.FirstOrDefaultAsync(x => x.Id == id); if (user == null) return null;
            ValidateEmail(request.Email, "Email tài khoản");
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
            await EnsureCustomerExistsAsync(request.CustomerCode);
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
