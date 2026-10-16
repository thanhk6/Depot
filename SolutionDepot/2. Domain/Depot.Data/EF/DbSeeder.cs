using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Depot.Data.Entities.Depot;
using Depot.Data.Entities.Finance;
using Depot.Data.Entities.Master;
using Depot.Data.Entities.System;
using Depot.Data.Entities.Inventory;
using Depot.Data.Entities.Yard;
using Depot.Data.Security;

namespace Depot.Data.EF
{
    /// <summary>
    /// Nạp dữ liệu khởi tạo ban đầu cho hệ thống (Administrator, Roles, Permissions, Company).
    /// </summary>
    public static class DbSeeder
    {
        /// <summary>
        /// Seed development idempotent. Mỗi lần startup chỉ bổ sung record còn thiếu
        /// theo Business Code/JobNo, không xóa hoặc nhân bản dữ liệu người dùng.
        /// </summary>
        public static async Task SeedAsync(DepotDbContext context, string defaultUserPassword = "123456")
        {
            await SeedCompanyAsync(context);
            await SeedRolesAsync(context);
            await SeedShippingLinesAsync(context);
            await SeedMaterialGroupsAsync(context);
            await SeedSuppliersAsync(context);
            await SeedMaterialsAsync(context);
            await SeedCustomersAsync(context);
            await SeedCustomerDriversAsync(context);
            await SeedCustomerVehiclesAsync(context);
            await SeedCustomerPortalUsersAsync(context);
            // CustomerBookings đọc lại ShippingLines.Id trực tiếp từ DB (FirstAsync), nên phải
            // flush trước — nếu không, trên DB rỗng hoàn toàn (ShippingLines chưa từng có dòng nào),
            // dòng "MAEU" vừa Add ở SeedShippingLinesAsync vẫn chỉ nằm trong ChangeTracker, chưa
            // xuống DB, khiến SeedCustomerBookingsAsync crash "Sequence contains no elements".
            await context.SaveChangesAsync();
            await SeedCustomerBookingsAsync(context);
            await SeedCatalogsAsync(context);
            await SeedUsersAsync(context, defaultUserPassword);
            await SeedYardAsync(context);
            await SeedYardOverviewAsync(context);
            await SeedNotificationTemplatesAsync(context);
            await context.SaveChangesAsync();
            // Cước Nâng Hạ (LoLo) đã có bảng riêng `ServiceTariff` (xem
            // docs/frontend-tariff-catalog-split.md) — backfill dữ liệu cũ từ catalog dùng chung
            // "SERVICE_TARIFF" (MasterCatalogItem) sang bảng mới, chạy SAU dòng SaveChangesAsync ở trên
            // để chắc chắn đọc được cả những dòng catalog vừa Add ở SeedCatalogsAsync trong lần chạy đầu
            // tiên trên DB rỗng (chưa flush thì query LINQ không thấy).
            await SeedServiceTariffsFromLegacyCatalogAsync(context);
            await SeedStorageTariffsFromLegacyCatalogAsync(context);
            await SeedEstimateCatalogsAsync(context);
            // Không seed hồ sơ container mẫu (JOB-SEED-0001) nữa — mọi container phải đi từ Gate-In thật
            // (yêu cầu 2026-10-07: xoá sạch dữ liệu mẫu để làm lại từ đầu).
        }

        private static async Task SeedCompanyAsync(DepotDbContext context)
        {
            if (!await context.Companies.AnyAsync(x => x.Code == "DEPOT-HCM"))
            {
                context.Companies.Add(new Company { Code = "DEPOT-HCM", Name = "Depot ICD Tan Cang - Ho Chi Minh", TaxCode = "0301234567" });
            }
        }

        /// <summary>
        /// 10 RoleCode chuẩn khớp đúng <c>fontend/src/constants/permissions.ts</c> (ROLES) — nguồn sự
        /// thật duy nhất cho vai trò hiển thị trên UI (màn System #53, ma trận phân quyền, AuthProvider).
        /// Trước đây bảng Roles seed 11 mã riêng của backend (DEPOT_MANAGER, OPERATOR, ACCOUNTANT,
        /// REPAIR_TECH, QC_INSPECTOR, FORKLIFT_DRIVER, SHIPPING_LINE, CLEANING_STAFF) lệch hoàn toàn với
        /// frontend, khiến UserService.CreateUserAsync/UpdateUserAsync luôn BadRequest với 7/10 vai trò
        /// hiển thị trong dropdown Tạo/Sửa User (xem docs/backend-progress/53-system.md).
        /// </summary>
        private static async Task SeedRolesAsync(DepotDbContext context)
        {
            var roles = new[]
            {
                new Role { RoleCode = "ADMIN", RoleName = "Quan Ly Tong Depot", Description = "Toan quyen van hanh, phan quyen, cau hinh tariff va bao cao KPI toan he thong" },
                new Role { RoleCode = "SURVEYOR", RoleName = "Giam Dinh Vien", Description = "Kiem tra vo cont tai cong, nhap ma hu hong IICL, chup anh e-EIR, phan loai AV/CL/DM" },
                new Role { RoleCode = "GATE_OP", RoleName = "Khai Thac Cong", Description = "Tiep nhan xe dau keo, quet so container, in phieu dich vu cong, Gate-In/Gate-Out" },
                new Role { RoleCode = "CASHIER", RoleName = "Thu Ngan / Ke Toan", Description = "Quan ly gach no VietQR, thu tien mat/chuyen khoan, doi soat cuoc luu bai va hoa don" },
                new Role { RoleCode = "ESTIMATOR", RoleName = "Chuyen Vien Bao Gia", Description = "Tinh gio cong tho va vat tu dinh muc MNR/IICL, lap bao gia EMR gui hang tau" },
                new Role { RoleCode = "CARRIER", RoleName = "Dai Dien Hang Tau", Description = "Truy cap Portal hang tau, tra cuu lich su container, phe duyet bao gia" },
                new Role { RoleCode = "TECHNICIAN", RoleName = "Tho Sua Chua", Description = "Nhan lenh sua chua Work Order, xuat kho vat tu va cap nhat tien do sua chua" },
                new Role { RoleCode = "QC_ENG", RoleName = "Ky Su QC", Description = "Nghiem thu kiem tra kin sang/nuoc, do min moi han, chuyen trang thai vo sang AV" },
                new Role { RoleCode = "FORKLIFT", RoleName = "Tai Xe Xe Nang", Description = "Man hinh tablet dieu bai: nhan vi tri Gate-In, di chuyen va ha bai Block A/B/C" },
                new Role { RoleCode = "CLEANING", RoleName = "To Ve Sinh Bai", Description = "Nhan danh sach vo can lam (CL), xit rua ap luc/hoa chat va ban giao sang Khai Thac (AV)" }
            };

            // Đổi tên tại chỗ cho RoleCode cũ đã có sẵn trong DB (giữ nguyên Id để không phá FK
            // SystemUser.RoleId đã gán trước đó) — chỉ áp dụng cho các cặp đổi tên 1-1 (không trùng đích).
            var renameMap = new (string OldCode, string NewCode)[]
            {
                ("OPERATOR", "GATE_OP"),
                ("ACCOUNTANT", "CASHIER"),
                ("REPAIR_TECH", "TECHNICIAN"),
                ("QC_INSPECTOR", "QC_ENG"),
                ("FORKLIFT_DRIVER", "FORKLIFT"),
                ("SHIPPING_LINE", "CARRIER"),
                ("CLEANING_STAFF", "CLEANING")
            };

            var existingRoles = await context.Roles.ToListAsync();
            foreach (var (oldCode, newCode) in renameMap)
            {
                var oldRole = existingRoles.FirstOrDefault(x => x.RoleCode == oldCode);
                if (oldRole != null && !existingRoles.Any(x => x.RoleCode == newCode))
                {
                    var target = roles.First(x => x.RoleCode == newCode);
                    oldRole.RoleCode = target.RoleCode;
                    oldRole.RoleName = target.RoleName;
                    oldRole.Description = target.Description;
                }
            }

            // DEPOT_MANAGER gộp vào ADMIN (frontend không có role riêng cho Depot Manager) — nếu cả 2
            // đã tồn tại thì chuyển toàn bộ SystemUser đang gán DEPOT_MANAGER sang ADMIN rồi xoá role cũ.
            var depotManagerRole = existingRoles.FirstOrDefault(x => x.RoleCode == "DEPOT_MANAGER");
            if (depotManagerRole != null)
            {
                var adminRole = existingRoles.FirstOrDefault(x => x.RoleCode == "ADMIN");
                if (adminRole == null)
                {
                    depotManagerRole.RoleCode = "ADMIN";
                    depotManagerRole.RoleName = roles.First(x => x.RoleCode == "ADMIN").RoleName;
                    depotManagerRole.Description = roles.First(x => x.RoleCode == "ADMIN").Description;
                }
                else
                {
                    var usersToReassign = await context.Users.Where(u => u.RoleId == depotManagerRole.Id).ToListAsync();
                    foreach (var user in usersToReassign)
                    {
                        user.RoleId = adminRole.Id;
                        user.Role = adminRole;
                    }
                    context.Roles.Remove(depotManagerRole);
                }
            }

            // Dùng lại danh sách `existingRoles` đã sửa tại chỗ ở trên (không query lại DB) — một query
            // Select mới sẽ đọc thẳng SQL, bỏ qua các thay đổi RoleCode chưa SaveChanges, gây thêm nhầm
            // bản ghi trùng RoleCode khi save.
            var existingCodesAfterRename = existingRoles
                .Where(x => context.Entry(x).State != EntityState.Deleted)
                .Select(x => x.RoleCode)
                .ToHashSet();
            context.Roles.AddRange(roles.Where(x => !existingCodesAfterRename.Contains(x.RoleCode)));
        }

        private static async Task SeedShippingLinesAsync(DepotDbContext context)
        {
            var lines = new[]
            {
                new ShippingLine { Code = "MAEU", Name = "Maersk Line", ContactEmail = "ops@maersk.local" },
                new ShippingLine { Code = "MSCU", Name = "MSC", ContactEmail = "ops@msc.local" },
                new ShippingLine { Code = "ONEY", Name = "Ocean Network Express" },
                new ShippingLine { Code = "CMAC", Name = "CMA CGM" },
                new ShippingLine { Code = "COSU", Name = "COSCO Shipping" }
            };
            var existing = await context.ShippingLines.Select(x => x.Code).ToListAsync();
            context.ShippingLines.AddRange(lines.Where(x => !existing.Contains(x.Code)));
        }

        private static async Task SeedMaterialGroupsAsync(DepotDbContext context)
        {
            var groups = new[]
            {
                new MaterialGroup { Code = "DOOR", Name = "Cua Container", SortOrder = 1 },
                new MaterialGroup { Code = "FLOOR", Name = "San Container", SortOrder = 2 },
                new MaterialGroup { Code = "SIDE_PANEL", Name = "Vach Container", SortOrder = 3 },
                new MaterialGroup { Code = "ROOF", Name = "Noc Container", SortOrder = 4 },
                new MaterialGroup { Code = "LOCK", Name = "Khoa - Ban Le", SortOrder = 5 },
                new MaterialGroup { Code = "RUBBER", Name = "Cao Su - Gioang", SortOrder = 6 },
                new MaterialGroup { Code = "PAINT", Name = "Son - Chong Ri", SortOrder = 7 },
                new MaterialGroup { Code = "WELDING", Name = "Vat Tu Han", SortOrder = 8 },
                new MaterialGroup { Code = "ELECTRICAL", Name = "Dien - Reefer", SortOrder = 9 },
                new MaterialGroup { Code = "CONSUMABLE", Name = "Vat Tu Tieu Hao", SortOrder = 10 },
                new MaterialGroup { Code = "OTHER", Name = "Khac", SortOrder = 11 }
            };
            var existing = await context.MaterialGroups.Select(x => x.Code).ToListAsync();
            context.MaterialGroups.AddRange(groups.Where(x => !existing.Contains(x.Code)));
        }

        private static async Task SeedSuppliersAsync(DepotDbContext context)
        {
            var suppliers = new[]
            {
                new Supplier { Code = "SUP-THEP-VN", Name = "Cong ty Thep Tam VN", TaxCode = "0301112233", Phone = "028.3822.1122", Email = "sales@thepvn.local", ContactPerson = "Nguyen Van An", Rating = 5 },
                new Supplier { Code = "SUP-GO-APITONG", Name = "Go Cong Nghiep Apitong", TaxCode = "0302223344", Phone = "028.3833.2233", Email = "order@goapitong.local", ContactPerson = "Tran Thi Binh", Rating = 4 },
                new Supplier { Code = "SUP-SON-EPOXY", Name = "Son Cong Nghiep Epoxy Corp", TaxCode = "0303334455", Phone = "028.3844.3344", Email = "cs@sonepoxy.local", ContactPerson = "Le Van Cuong", Rating = 4 }
            };
            var existing = await context.Suppliers.Select(x => x.Code).ToListAsync();
            context.Suppliers.AddRange(suppliers.Where(x => !existing.Contains(x.Code)));
        }

        private static async Task SeedMaterialsAsync(DepotDbContext context)
        {
            var materials = new[]
            {
                new Material { Code = "MAT-CORTEN-16", Name = "Ton Corten 1.6mm", Unit = "tam", UnitPrice = 850000, StockQuantity = 50, MaterialGroupCode = "SIDE_PANEL", MaterialType = "MATERIAL", MinimumStock = 10, MaximumStock = 100, ReorderLevel = 15, AverageCost = 850000, LastPurchaseCost = 850000, IsActive = true },
                new Material { Code = "MAT-WOOD-28", Name = "Van san Apitong 28mm", Unit = "tam", UnitPrice = 1250000, StockQuantity = 30, MaterialGroupCode = "FLOOR", MaterialType = "MATERIAL", MinimumStock = 5, MaximumStock = 60, ReorderLevel = 10, AverageCost = 1250000, LastPurchaseCost = 1250000, IsActive = true },
                new Material { Code = "MAT-PAINT-EPOXY", Name = "Son lot Epoxy", Unit = "lit", UnitPrice = 180000, StockQuantity = 100, MaterialGroupCode = "PAINT", MaterialType = "CONSUMABLE", MinimumStock = 20, MaximumStock = 200, ReorderLevel = 30, AverageCost = 180000, LastPurchaseCost = 180000, IsActive = true },
                new Material { Code = "MAT-GASKET-J", Name = "Gioang cua chu J", Unit = "bo", UnitPrice = 420000, StockQuantity = 25, MaterialGroupCode = "RUBBER", MaterialType = "PART", MinimumStock = 5, MaximumStock = 50, ReorderLevel = 8, AverageCost = 420000, LastPurchaseCost = 420000, IsActive = true }
            };
            var existing = await context.Materials.ToListAsync();
            var existingCodes = existing.Select(x => x.Code).ToHashSet();
            context.Materials.AddRange(materials.Where(x => !existingCodes.Contains(x.Code)));

            // Backfill các bản ghi Material đã seed từ trước migration mở rộng field (12 cột mới) —
            // chỉ set khi còn giá trị mặc định rỗng, không ghi đè dữ liệu người dùng đã chỉnh sửa qua UI.
            foreach (var seed in materials)
            {
                var existingRow = existing.FirstOrDefault(x => x.Code == seed.Code);
                if (existingRow != null && string.IsNullOrWhiteSpace(existingRow.MaterialGroupCode))
                {
                    existingRow.MaterialGroupCode = seed.MaterialGroupCode;
                    existingRow.MaterialType = seed.MaterialType;
                    existingRow.MinimumStock = seed.MinimumStock;
                    existingRow.MaximumStock = seed.MaximumStock;
                    existingRow.ReorderLevel = seed.ReorderLevel;
                    if (existingRow.AverageCost == 0) existingRow.AverageCost = seed.AverageCost;
                    if (existingRow.LastPurchaseCost == 0) existingRow.LastPurchaseCost = seed.LastPurchaseCost;
                    existingRow.IsActive = true;
                }
            }
        }

        private static async Task SeedCustomersAsync(DepotDbContext context)
        {
            var customers = new[]
            {
                new CustomerCompany { Code = "CUST-ABC01", Name = "ABC Logistics", ShortName = "ABC", CustomerType = "LOGISTICS", TaxCode = "0312345678", Email = "ops@abclogistics.local", CreditLimit = 500000000, PaymentTermDays = 30 },
                new CustomerCompany { Code = "CUST-XYZ02", Name = "XYZ Transport", ShortName = "XYZ", CustomerType = "TRUCKING", TaxCode = "0318765432", Email = "dispatch@xyz.local", CreditLimit = 750000000, PaymentTermDays = 45 }
            };
            var existing = await context.CustomerCompanies.Select(x => x.Code).ToListAsync();
            context.CustomerCompanies.AddRange(customers.Where(x => !existing.Contains(x.Code)));
        }

        private static async Task SeedCustomerDriversAsync(DepotDbContext context)
        {
            if (await context.CustomerDrivers.AnyAsync()) return;
            context.CustomerDrivers.AddRange(
                new CustomerDriver { CustomerCode = "CUST-ABC01", DriverCode = "DRV-ABC-01", FullName = "Nguyễn Văn Hùng", Phone = "0912345678", LicenseNumber = "79A123456", LicenseGrade = "FC" },
                new CustomerDriver { CustomerCode = "CUST-XYZ02", DriverCode = "DRV-XYZ-01", FullName = "Phạm Văn Thành", Phone = "0919222333", LicenseNumber = "79B654321", LicenseGrade = "FC" });
        }

            private static async Task SeedCustomerVehiclesAsync(DepotDbContext context)
            {
                if (await context.CustomerVehicles.AnyAsync()) return;
                context.CustomerVehicles.AddRange(
                new CustomerVehicle { CustomerCode = "CUST-ABC01", PlateNumber = "51C-12345", VehicleType = "TRACTOR", Brand = "Hyundai", PayloadTon = 30, OwnerName = "ABC Logistics" },
                new CustomerVehicle { CustomerCode = "CUST-XYZ02", PlateNumber = "51C-67890", VehicleType = "TRACTOR", Brand = "Howo", PayloadTon = 30, OwnerName = "XYZ Transport" });
            }

            private static async Task SeedCustomerPortalUsersAsync(DepotDbContext context)
            {
                if (await context.CustomerPortalUsers.AnyAsync()) return;
                context.CustomerPortalUsers.AddRange(
                new CustomerPortalUser { CustomerCode = "CUST-ABC01", Username = "abc.admin", FullName = "Trần Minh Tuấn", Email = "ops@abclogistics.local", Role = "CUSTOMER_ADMIN" },
                new CustomerPortalUser { CustomerCode = "CUST-XYZ02", Username = "xyz.manager", FullName = "Nguyễn Thị Linh", Email = "dispatch@xyz.local", Role = "CUSTOMER_ADMIN" });
            }

            private static async Task SeedCustomerBookingsAsync(DepotDbContext context)
            {
                if (await context.CustomerBookings.AnyAsync()) return;
                var maeuId = await context.ShippingLines.Where(x => x.Code == "MAEU").Select(x => x.Id).FirstAsync();
                context.CustomerBookings.AddRange(
                    new CustomerBooking { BookingNo = "BK-ABC-0001", CustomerCode = "CUST-ABC01", ShippingLineId = maeuId, ContainerCount = 10, ContainerSize = "40HC" },
                    new CustomerBooking { BookingNo = "BK-XYZ-0001", CustomerCode = "CUST-XYZ02", ShippingLineId = maeuId, ContainerCount = 5, ContainerSize = "20GP" });
            }

        private static async Task SeedUsersAsync(DepotDbContext context, string defaultUserPassword)
        {
            // Chỉ seed tài khoản quản trị "admin" khi CHƯA có (yêu cầu 2026-10-08: xoá hết nhân viên mẫu, chỉ giữ admin;
            // nhân viên thật do admin tạo ở màn Quản trị người dùng). Trước đây seed lại 10 tài khoản mẫu mỗi lần
            // khởi động và ghi đè họ tên / vai trò / bật lại tài khoản đã khoá — xoá đi là tự sống lại.
            // Mật khẩu ban đầu lấy từ cấu hình Seed:DefaultPassword (Program.cs), chỉ dùng khi tạo mới.
            var adminRole = await context.Roles.FirstOrDefaultAsync(x => x.RoleCode == "ADMIN");
            if (adminRole == null) return;
            var admin = await context.Users.FirstOrDefaultAsync(x => x.Username == "admin");
            if (admin == null)
            {
                context.Users.Add(new SystemUser
                {
                    Username = "admin",
                    FullName = "Quản trị hệ thống",
                    PasswordHash = PasswordHashHelper.HashPassword(defaultUserPassword),
                    IsActive = true,
                    RoleId = adminRole.Id,
                    Role = adminRole
                });
            }
            else if (admin.RoleId == 0)
            {
                admin.RoleId = adminRole.Id;
            }
        }

        /// <summary>
        /// Danh mục báo giá (cấu trúc Maersk AEMS) — chỉ seed 2 bảng mã CHUẨN trước đây gõ cứng trong form báo giá:
        /// TPI (O/U/T/W) và Cause. Damage/Repair code, Rep. loc, đơn giá giờ công, Mode để trống cho người dùng nhập.
        /// Mã đã có (kể cả đã xoá) thì không seed lại để tôn trọng thao tác xoá của người dùng.
        /// </summary>
        private static async Task SeedEstimateCatalogsAsync(DepotDbContext context)
        {
            var seeds = new[]
            {
                new MasterCatalogItem { CatalogType = "EST_TPI", Code = "O", Name = "Owner", NameVi = "Chủ vỏ chịu", SortOrder = 1 },
                new MasterCatalogItem { CatalogType = "EST_TPI", Code = "U", Name = "User", NameVi = "Người sử dụng chịu", SortOrder = 2 },
                new MasterCatalogItem { CatalogType = "EST_TPI", Code = "T", Name = "Third Party", NameVi = "Bên thứ ba chịu", SortOrder = 3 },
                new MasterCatalogItem { CatalogType = "EST_TPI", Code = "W", Name = "Wear and Tear", NameVi = "Hao mòn tự nhiên", SortOrder = 4 },
                new MasterCatalogItem { CatalogType = "EST_CAUSE", Code = "WEAR_TEAR", Name = "Wear and Tear", NameVi = "Hao mòn tự nhiên", SortOrder = 1 },
                new MasterCatalogItem { CatalogType = "EST_CAUSE", Code = "THIRD_PARTY", Name = "Third Party", NameVi = "Bên thứ ba gây ra", SortOrder = 2 },
                new MasterCatalogItem { CatalogType = "EST_CAUSE", Code = "OWNER", Name = "Owner", NameVi = "Chủ vỏ", SortOrder = 3 },
                new MasterCatalogItem { CatalogType = "EST_CAUSE", Code = "USER", Name = "User", NameVi = "Người sử dụng", SortOrder = 4 }
            };
            var existing = await context.MasterCatalogItems.IgnoreQueryFilters()
                .Where(x => x.CatalogType == "EST_TPI" || x.CatalogType == "EST_CAUSE")
                .Select(x => x.CatalogType + "|" + x.Code).ToListAsync();
            var toAdd = seeds.Where(x => !existing.Contains(x.CatalogType + "|" + x.Code)).ToList();
            if (toAdd.Count == 0) return;
            foreach (var item in toAdd) { item.IsActive = true; item.JsonData = "{}"; }
            context.MasterCatalogItems.AddRange(toAdd);
            await context.SaveChangesAsync();
        }

        /// <summary>
        /// Danh mục Master Data (màn "DM Loại Container", "DM Vị Trí/Mã Hư Hỏng", "DM Phương Án Sửa
        /// Chữa", "DM Phân Hạng Vỏ", "DM Tiêu Chuẩn Giám Định", "Cước Nâng Hạ & Lưu Bãi", "Biểu Phí Vệ
        /// Sinh", "DM Phòng Ban", "DM Phân Loại Khách Hàng") — trước đây mỗi loại chỉ có 1-2 dòng seed
        /// tối thiểu để test wiring, khiến các màn Master Data nhìn "trống". Bổ sung dữ liệu mẫu đầy đủ,
        /// thực tế theo tiêu chuẩn ISO 6346 / IICL-6 phổ biến trong ngành depot container.
        /// Field JsonData của từng loại phải khớp đúng tên field mà frontend đọc — xem
        /// fontend/src/modules/masterdata/pages/MasterDataPage.tsx (readJson(...).xxx) và
        /// fontend/src/modules/masterdata/components/LiftOnLiftOffAndStorageMaster.tsx.
        /// </summary>
        private static async Task SeedCatalogsAsync(DepotDbContext context)
        {
            var catalogs = new List<MasterCatalogItem>();

            // ===== CONTAINER_TYPE — 2 dòng seed cũ (22G1/45G1) giữ nguyên, không đổi để không phá dữ
            // liệu đã có; bổ sung 18 quy cách ISO 6346 phổ biến còn thiếu (Reefer, Open Top, Flat Rack,
            // Tank, Bulk, Ventilated, Double Door, Insulated, 40ft/45ft) khớp đúng preset kỹ thuật đã có
            // sẵn ở ContainerTypeMaster.tsx (PRESETS_20FT) để số liệu kích thước/trọng lượng nhất quán.
            catalogs.AddRange(new[]
            {
                new MasterCatalogItem { CatalogType = "CONTAINER_TYPE", Code = "25G1", Name = "20HC", NameVi = "Container Khô 20 Feet Cao (20HC / 20HQ)", Description = "Phiên bản 20ft tăng chiều cao lên 2.896m (9ft 6in), tăng dung tích chứa hàng thêm 13%.", JsonData = "{\"size\":\"20\",\"category\":\"DRY\",\"isReefer\":false,\"lengthMm\":6058,\"widthMm\":2438,\"heightMm\":2896,\"internalLengthMm\":5898,\"internalWidthMm\":2352,\"internalHeightMm\":2698,\"doorWidthMm\":2340,\"doorHeightMm\":2585,\"cbm\":37.4,\"tareWeightKg\":2380,\"maxPayloadKg\":28100,\"maxGrossWeightKg\":30480,\"teuRatio\":1.0,\"material\":\"CORTEN_STEEL\",\"floorType\":\"WOOD_PLYWOOD\",\"isoCode\":\"25G1\"}", SortOrder = 3 },
                new MasterCatalogItem { CatalogType = "CONTAINER_TYPE", Code = "22R1", Name = "20RF", NameVi = "Container Lạnh 20 Feet (20RF)", Description = "Trang bị máy nén lạnh Thermo King / Carrier, vách foam cách nhiệt, sàn chữ T luân chuyển khí lạnh.", JsonData = "{\"size\":\"20\",\"category\":\"REEFER\",\"isReefer\":true,\"lengthMm\":6058,\"widthMm\":2438,\"heightMm\":2591,\"internalLengthMm\":5444,\"internalWidthMm\":2294,\"internalHeightMm\":2276,\"doorWidthMm\":2290,\"doorHeightMm\":2264,\"cbm\":28.3,\"tareWeightKg\":2950,\"maxPayloadKg\":27530,\"maxGrossWeightKg\":30480,\"teuRatio\":1.0,\"material\":\"STAINLESS_STEEL\",\"floorType\":\"ALUMINUM_T_FLOOR\",\"isoCode\":\"22R1\"}", SortOrder = 4 },
                new MasterCatalogItem { CatalogType = "CONTAINER_TYPE", Code = "25R1", Name = "20HR", NameVi = "Container Lạnh 20 Feet Cao (20HR / 20RH)", Description = "Container bảo ôn lạnh 20ft chiều cao 2.896m, bảo quản hàng đông lạnh mật độ cao, kem, thịt bò, dược phẩm.", JsonData = "{\"size\":\"20\",\"category\":\"REEFER\",\"isReefer\":true,\"lengthMm\":6058,\"widthMm\":2438,\"heightMm\":2896,\"internalLengthMm\":5444,\"internalWidthMm\":2294,\"internalHeightMm\":2560,\"doorWidthMm\":2290,\"doorHeightMm\":2540,\"cbm\":32.5,\"tareWeightKg\":3100,\"maxPayloadKg\":27380,\"maxGrossWeightKg\":30480,\"teuRatio\":1.0,\"material\":\"STAINLESS_STEEL\",\"floorType\":\"ALUMINUM_T_FLOOR\",\"isoCode\":\"25R1\"}", SortOrder = 5 },
                new MasterCatalogItem { CatalogType = "CONTAINER_TYPE", Code = "22U1", Name = "20OT", NameVi = "Container Mở Nóc 20 Feet (20OT)", Description = "Nóc hở phủ bạt Tarpaulin kéo rút, đà ngang xà nóc tháo lắp được, phục vụ cẩu tải hàng máy móc quá khổ.", JsonData = "{\"size\":\"20\",\"category\":\"OPEN_TOP\",\"isReefer\":false,\"lengthMm\":6058,\"widthMm\":2438,\"heightMm\":2591,\"internalLengthMm\":5898,\"internalWidthMm\":2352,\"internalHeightMm\":2348,\"doorWidthMm\":2340,\"doorHeightMm\":2280,\"cbm\":32.0,\"tareWeightKg\":2350,\"maxPayloadKg\":28130,\"maxGrossWeightKg\":30480,\"teuRatio\":1.0,\"material\":\"CORTEN_STEEL\",\"floorType\":\"WOOD_PLYWOOD\",\"isoCode\":\"22U1\"}", SortOrder = 6 },
                new MasterCatalogItem { CatalogType = "CONTAINER_TYPE", Code = "22U6", Name = "20HT", NameVi = "Container Mở Nóc Cứng 20 Feet (20HT / Hard Top)", Description = "Nắp nóc bằng tôn thép dập sóng tháo rời được bằng cẩu bốc xếp, an toàn và kín nước như cont khô.", JsonData = "{\"size\":\"20\",\"category\":\"OPEN_TOP\",\"isReefer\":false,\"lengthMm\":6058,\"widthMm\":2438,\"heightMm\":2591,\"internalLengthMm\":5898,\"internalWidthMm\":2352,\"internalHeightMm\":2348,\"doorWidthMm\":2340,\"doorHeightMm\":2280,\"cbm\":32.2,\"tareWeightKg\":2680,\"maxPayloadKg\":27800,\"maxGrossWeightKg\":30480,\"teuRatio\":1.0,\"material\":\"CORTEN_STEEL\",\"floorType\":\"WOOD_PLYWOOD\",\"isoCode\":\"22U6\"}", SortOrder = 7 },
                new MasterCatalogItem { CatalogType = "CONTAINER_TYPE", Code = "22P1", Name = "20FR", NameVi = "Container Mặt Bằng 20 Feet (20FR)", Description = "Không vách bên và nóc, 2 đầu thành gập phẳng xếp chồng, sàn chịu tải cực cao cho xe cơ giới, máy xúc.", JsonData = "{\"size\":\"20\",\"category\":\"FLAT_RACK\",\"isReefer\":false,\"lengthMm\":6058,\"widthMm\":2438,\"heightMm\":2591,\"internalLengthMm\":5940,\"internalWidthMm\":2380,\"internalHeightMm\":2233,\"doorWidthMm\":0,\"doorHeightMm\":0,\"cbm\":31.0,\"tareWeightKg\":2750,\"maxPayloadKg\":32250,\"maxGrossWeightKg\":35000,\"teuRatio\":1.0,\"material\":\"CORTEN_STEEL\",\"floorType\":\"WOOD_PLYWOOD\",\"isoCode\":\"22P1\"}", SortOrder = 8 },
                new MasterCatalogItem { CatalogType = "CONTAINER_TYPE", Code = "22T1", Name = "20TK", NameVi = "Container Bồn Xitec 20 Feet (20TK / ISO Tank)", Description = "Bồn thép không gỉ 316L, có lớp cách nhiệt và ống gia nhiệt hơi nước Steam Coil, vận chuyển hóa chất lỏng, dầu nhớt.", JsonData = "{\"size\":\"20\",\"category\":\"TANK\",\"isReefer\":false,\"lengthMm\":6058,\"widthMm\":2438,\"heightMm\":2591,\"internalLengthMm\":5850,\"internalWidthMm\":2300,\"internalHeightMm\":2300,\"doorWidthMm\":0,\"doorHeightMm\":0,\"cbm\":26.0,\"tareWeightKg\":3420,\"maxPayloadKg\":32580,\"maxGrossWeightKg\":36000,\"teuRatio\":1.0,\"material\":\"STAINLESS_STEEL\",\"floorType\":\"STEEL\",\"isoCode\":\"22T1\"}", SortOrder = 9 },
                new MasterCatalogItem { CatalogType = "CONTAINER_TYPE", Code = "22V0", Name = "20VH", NameVi = "Container Thông Gió 20 Feet (20VH / Coffee Cont)", Description = "Có hệ thống khe thoát ẩm thông gió tự nhiên dọc xà trên và xà dưới, chống ngưng tụ mồ hôi cho hạt cà phê, ca cao.", JsonData = "{\"size\":\"20\",\"category\":\"VENTILATED\",\"isReefer\":false,\"lengthMm\":6058,\"widthMm\":2438,\"heightMm\":2591,\"internalLengthMm\":5898,\"internalWidthMm\":2352,\"internalHeightMm\":2393,\"doorWidthMm\":2340,\"doorHeightMm\":2280,\"cbm\":33.0,\"tareWeightKg\":2320,\"maxPayloadKg\":28160,\"maxGrossWeightKg\":30480,\"teuRatio\":1.0,\"material\":\"CORTEN_STEEL\",\"floorType\":\"WOOD_PLYWOOD\",\"isoCode\":\"22V0\"}", SortOrder = 10 },
                new MasterCatalogItem { CatalogType = "CONTAINER_TYPE", Code = "22B0", Name = "20BK", NameVi = "Container Chở Hàng Rời 20 Feet (20BK / Bulk)", Description = "Có cửa nạp liệu trên nóc (Manholes) và cửa xả góc dưới cửa sau, dùng vận chuyển ngũ cốc, hạt nhựa, xi măng.", JsonData = "{\"size\":\"20\",\"category\":\"BULK\",\"isReefer\":false,\"lengthMm\":6058,\"widthMm\":2438,\"heightMm\":2591,\"internalLengthMm\":5898,\"internalWidthMm\":2352,\"internalHeightMm\":2393,\"doorWidthMm\":2340,\"doorHeightMm\":2280,\"cbm\":32.8,\"tareWeightKg\":2450,\"maxPayloadKg\":28030,\"maxGrossWeightKg\":30480,\"teuRatio\":1.0,\"material\":\"CORTEN_STEEL\",\"floorType\":\"STEEL\",\"isoCode\":\"22B0\"}", SortOrder = 11 },
                new MasterCatalogItem { CatalogType = "CONTAINER_TYPE", Code = "22S1", Name = "20OS", NameVi = "Container Mở Vách Hông 20 Feet (20OS / Side Door)", Description = "Toàn bộ một bên vách hông mở 4 cánh cửa dạng xếp, cho phép xe nâng bốc dỡ pallet trực tiếp từ cạnh bên.", JsonData = "{\"size\":\"20\",\"category\":\"SPECIAL\",\"isReefer\":false,\"lengthMm\":6058,\"widthMm\":2438,\"heightMm\":2591,\"internalLengthMm\":5898,\"internalWidthMm\":2280,\"internalHeightMm\":2300,\"doorWidthMm\":5700,\"doorHeightMm\":2180,\"cbm\":31.0,\"tareWeightKg\":3180,\"maxPayloadKg\":27300,\"maxGrossWeightKg\":30480,\"teuRatio\":1.0,\"material\":\"CORTEN_STEEL\",\"floorType\":\"WOOD_PLYWOOD\",\"isoCode\":\"22S1\"}", SortOrder = 12 },
                new MasterCatalogItem { CatalogType = "CONTAINER_TYPE", Code = "22G9", Name = "20DD", NameVi = "Container Mở 2 Đầu Cửa 20 Feet (20DD / Tunnel)", Description = "Thiết kế 2 bộ cửa mở ở cả hai đầu container, thuận tiện bốc dỡ hàng theo nguyên tắc FIFO hoặc ngăn vách đôi.", JsonData = "{\"size\":\"20\",\"category\":\"SPECIAL\",\"isReefer\":false,\"lengthMm\":6058,\"widthMm\":2438,\"heightMm\":2591,\"internalLengthMm\":5840,\"internalWidthMm\":2352,\"internalHeightMm\":2393,\"doorWidthMm\":2340,\"doorHeightMm\":2280,\"cbm\":32.8,\"tareWeightKg\":2400,\"maxPayloadKg\":28080,\"maxGrossWeightKg\":30480,\"teuRatio\":1.0,\"material\":\"CORTEN_STEEL\",\"floorType\":\"WOOD_PLYWOOD\",\"isoCode\":\"22G9\"}", SortOrder = 13 },
                new MasterCatalogItem { CatalogType = "CONTAINER_TYPE", Code = "22H0", Name = "20IC", NameVi = "Container Cách Nhiệt Bảo Ôn 20 Feet (20IC / Insulated)", Description = "Vách cách nhiệt Polyurethane bảo vệ hàng hóa nhạy cảm với sốc nhiệt mà không cần máy lạnh cơ học.", JsonData = "{\"size\":\"20\",\"category\":\"SPECIAL\",\"isReefer\":false,\"lengthMm\":6058,\"widthMm\":2438,\"heightMm\":2591,\"internalLengthMm\":5740,\"internalWidthMm\":2270,\"internalHeightMm\":2270,\"doorWidthMm\":2260,\"doorHeightMm\":2210,\"cbm\":29.5,\"tareWeightKg\":2550,\"maxPayloadKg\":27930,\"maxGrossWeightKg\":30480,\"teuRatio\":1.0,\"material\":\"STAINLESS_STEEL\",\"floorType\":\"WOOD_PLYWOOD\",\"isoCode\":\"22H0\"}", SortOrder = 14 },
                new MasterCatalogItem { CatalogType = "CONTAINER_TYPE", Code = "42G1", Name = "40GP", NameVi = "Container Khô 40 Feet Thường (40DC / 40GP)", Description = "Quy cách 40ft tiêu chuẩn, phổ biến thứ 2 sau 40HC, đóng hàng bách hóa tổng hợp và vật liệu xây dựng.", JsonData = "{\"size\":\"40\",\"category\":\"DRY\",\"isReefer\":false,\"lengthMm\":12192,\"widthMm\":2438,\"heightMm\":2591,\"internalLengthMm\":12032,\"internalWidthMm\":2352,\"internalHeightMm\":2393,\"doorWidthMm\":2340,\"doorHeightMm\":2280,\"cbm\":67.7,\"tareWeightKg\":3740,\"maxPayloadKg\":26740,\"maxGrossWeightKg\":30480,\"teuRatio\":2.0,\"material\":\"CORTEN_STEEL\",\"floorType\":\"WOOD_PLYWOOD\",\"isoCode\":\"42G1\"}", SortOrder = 15 },
                new MasterCatalogItem { CatalogType = "CONTAINER_TYPE", Code = "42R1", Name = "40RF", NameVi = "Container Lạnh 40 Feet (40RF)", Description = "Máy nén lạnh công suất lớn, vận chuyển hàng đông lạnh/mát khối lượng lớn đường biển dài ngày.", JsonData = "{\"size\":\"40\",\"category\":\"REEFER\",\"isReefer\":true,\"lengthMm\":12192,\"widthMm\":2438,\"heightMm\":2591,\"internalLengthMm\":11570,\"internalWidthMm\":2286,\"internalHeightMm\":2240,\"doorWidthMm\":2280,\"doorHeightMm\":2220,\"cbm\":59.3,\"tareWeightKg\":4800,\"maxPayloadKg\":25680,\"maxGrossWeightKg\":30480,\"teuRatio\":2.0,\"material\":\"STAINLESS_STEEL\",\"floorType\":\"ALUMINUM_T_FLOOR\",\"isoCode\":\"42R1\"}", SortOrder = 16 },
                new MasterCatalogItem { CatalogType = "CONTAINER_TYPE", Code = "45R1", Name = "40RH", NameVi = "Container Lạnh Cao 40 Feet (40RH / 40 Reefer High Cube)", Description = "Reefer cao 9ft6in, phổ biến nhất cho chuỗi lạnh xuất khẩu nông sản, thủy sản.", JsonData = "{\"size\":\"40\",\"category\":\"REEFER\",\"isReefer\":true,\"lengthMm\":12192,\"widthMm\":2438,\"heightMm\":2896,\"internalLengthMm\":11570,\"internalWidthMm\":2286,\"internalHeightMm\":2545,\"doorWidthMm\":2280,\"doorHeightMm\":2520,\"cbm\":67.0,\"tareWeightKg\":5000,\"maxPayloadKg\":29480,\"maxGrossWeightKg\":34480,\"teuRatio\":2.0,\"material\":\"STAINLESS_STEEL\",\"floorType\":\"ALUMINUM_T_FLOOR\",\"isoCode\":\"45R1\"}", SortOrder = 17 },
                new MasterCatalogItem { CatalogType = "CONTAINER_TYPE", Code = "42U1", Name = "40OT", NameVi = "Container Mở Nóc 40 Feet (40OT)", Description = "Phiên bản 40ft của Open Top, chở hàng máy móc/thép cuộn quá khổ chiều cao.", JsonData = "{\"size\":\"40\",\"category\":\"OPEN_TOP\",\"isReefer\":false,\"lengthMm\":12192,\"widthMm\":2438,\"heightMm\":2591,\"internalLengthMm\":12032,\"internalWidthMm\":2352,\"internalHeightMm\":2348,\"doorWidthMm\":2340,\"doorHeightMm\":2280,\"cbm\":65.9,\"tareWeightKg\":3820,\"maxPayloadKg\":26660,\"maxGrossWeightKg\":30480,\"teuRatio\":2.0,\"material\":\"CORTEN_STEEL\",\"floorType\":\"WOOD_PLYWOOD\",\"isoCode\":\"42U1\"}", SortOrder = 18 },
                new MasterCatalogItem { CatalogType = "CONTAINER_TYPE", Code = "42P1", Name = "40FR", NameVi = "Container Mặt Bằng 40 Feet (40FR)", Description = "Sàn dài chịu tải cực cao, thành gập, chở máy móc công nghiệp, kết cấu thép siêu trường siêu trọng.", JsonData = "{\"size\":\"40\",\"category\":\"FLAT_RACK\",\"isReefer\":false,\"lengthMm\":12192,\"widthMm\":2438,\"heightMm\":2591,\"internalLengthMm\":12056,\"internalWidthMm\":2400,\"internalHeightMm\":2233,\"doorWidthMm\":0,\"doorHeightMm\":0,\"cbm\":63.5,\"tareWeightKg\":5200,\"maxPayloadKg\":40200,\"maxGrossWeightKg\":45000,\"teuRatio\":2.0,\"material\":\"CORTEN_STEEL\",\"floorType\":\"WOOD_PLYWOOD\",\"isoCode\":\"42P1\"}", SortOrder = 19 },
                new MasterCatalogItem { CatalogType = "CONTAINER_TYPE", Code = "L5G1", Name = "45HC", NameVi = "Container Khô 45 Feet Cao (45HC)", Description = "Dài nhất trong nhóm cont khô thương mại, phổ biến tuyến Á-Âu/xuyên Thái Bình Dương, đóng hàng dung tích cao nhẹ cân.", JsonData = "{\"size\":\"45\",\"category\":\"DRY\",\"isReefer\":false,\"lengthMm\":13716,\"widthMm\":2438,\"heightMm\":2896,\"internalLengthMm\":13556,\"internalWidthMm\":2352,\"internalHeightMm\":2698,\"doorWidthMm\":2340,\"doorHeightMm\":2585,\"cbm\":86.1,\"tareWeightKg\":4800,\"maxPayloadKg\":27700,\"maxGrossWeightKg\":32500,\"teuRatio\":2.25,\"material\":\"CORTEN_STEEL\",\"floorType\":\"WOOD_PLYWOOD\",\"isoCode\":\"L5G1\"}", SortOrder = 20 }
            });

            // ===== DAMAGE_LOCATION — vị trí/cấu kiện container theo IICL-6 (DR1 giữ nguyên seed cũ) =====
            catalogs.AddRange(new[]
            {
                new MasterCatalogItem { CatalogType = "DAMAGE_LOCATION", Code = "FL1", Name = "Floor", NameVi = "Sàn container", JsonData = "{\"category\":\"FLOOR\"}", SortOrder = 2 },
                new MasterCatalogItem { CatalogType = "DAMAGE_LOCATION", Code = "RF1", Name = "Roof", NameVi = "Nóc container", JsonData = "{\"category\":\"ROOF\"}", SortOrder = 3 },
                new MasterCatalogItem { CatalogType = "DAMAGE_LOCATION", Code = "SW1", Name = "Side Wall (Left)", NameVi = "Vách hông trái", JsonData = "{\"category\":\"STRUCTURE\"}", SortOrder = 4 },
                new MasterCatalogItem { CatalogType = "DAMAGE_LOCATION", Code = "SW2", Name = "Side Wall (Right)", NameVi = "Vách hông phải", JsonData = "{\"category\":\"STRUCTURE\"}", SortOrder = 5 },
                new MasterCatalogItem { CatalogType = "DAMAGE_LOCATION", Code = "FW1", Name = "Front Wall", NameVi = "Vách trước (đối diện cửa)", JsonData = "{\"category\":\"STRUCTURE\"}", SortOrder = 6 },
                new MasterCatalogItem { CatalogType = "DAMAGE_LOCATION", Code = "CP1", Name = "Corner Post", NameVi = "Trụ góc", JsonData = "{\"category\":\"FRAME\"}", SortOrder = 7 },
                new MasterCatalogItem { CatalogType = "DAMAGE_LOCATION", Code = "CC1", Name = "Corner Casting", NameVi = "Góc khóa cẩu", JsonData = "{\"category\":\"FRAME\"}", SortOrder = 8 },
                new MasterCatalogItem { CatalogType = "DAMAGE_LOCATION", Code = "CR1", Name = "Cross Member", NameVi = "Xà ngang gầm sàn", JsonData = "{\"category\":\"FRAME\"}", SortOrder = 9 },
                new MasterCatalogItem { CatalogType = "DAMAGE_LOCATION", Code = "TR1", Name = "Top Rail", NameVi = "Xà dọc nóc", JsonData = "{\"category\":\"FRAME\"}", SortOrder = 10 },
                new MasterCatalogItem { CatalogType = "DAMAGE_LOCATION", Code = "BR1", Name = "Bottom Rail", NameVi = "Xà dọc đáy", JsonData = "{\"category\":\"FRAME\"}", SortOrder = 11 },
                new MasterCatalogItem { CatalogType = "DAMAGE_LOCATION", Code = "DS1", Name = "Door Sill", NameVi = "Ngưỡng cửa", JsonData = "{\"category\":\"DOOR\"}", SortOrder = 12 },
                new MasterCatalogItem { CatalogType = "DAMAGE_LOCATION", Code = "DH1", Name = "Door Header", NameVi = "Đà ngang trên cửa", JsonData = "{\"category\":\"DOOR\"}", SortOrder = 13 },
                new MasterCatalogItem { CatalogType = "DAMAGE_LOCATION", Code = "LG1", Name = "Locking Gear", NameVi = "Cơ cấu khóa cửa (tay khóa/chốt)", JsonData = "{\"category\":\"DOOR\"}", SortOrder = 14 },
                new MasterCatalogItem { CatalogType = "DAMAGE_LOCATION", Code = "FP1", Name = "Forklift Pocket", NameVi = "Lỗ càng xe nâng", JsonData = "{\"category\":\"FLOOR\"}", SortOrder = 15 }
            });

            // ===== DAMAGE_CODE — mã hư hỏng phổ biến theo IICL-6 (DENT giữ nguyên seed cũ) =====
            catalogs.AddRange(new[]
            {
                new MasterCatalogItem { CatalogType = "DAMAGE_CODE", Code = "HOLE", Name = "Hole", NameVi = "Thủng", JsonData = "{\"damageType\":\"HOLE\",\"severity\":\"HIGH\",\"standard\":\"IICL-6\"}", SortOrder = 2 },
                new MasterCatalogItem { CatalogType = "DAMAGE_CODE", Code = "CRACK", Name = "Crack", NameVi = "Nứt / rạn", JsonData = "{\"damageType\":\"CRACK\",\"severity\":\"HIGH\",\"standard\":\"IICL-6\"}", SortOrder = 3 },
                new MasterCatalogItem { CatalogType = "DAMAGE_CODE", Code = "BROKEN", Name = "Broken", NameVi = "Gãy / vỡ", JsonData = "{\"damageType\":\"BROKEN\",\"severity\":\"HIGH\",\"standard\":\"IICL-6\"}", SortOrder = 4 },
                new MasterCatalogItem { CatalogType = "DAMAGE_CODE", Code = "BENT", Name = "Bent", NameVi = "Cong vênh", JsonData = "{\"damageType\":\"BENT\",\"severity\":\"MEDIUM\",\"standard\":\"IICL-6\"}", SortOrder = 5 },
                new MasterCatalogItem { CatalogType = "DAMAGE_CODE", Code = "CORRODED", Name = "Corroded", NameVi = "Rỉ sét / ăn mòn", JsonData = "{\"damageType\":\"CORRODED\",\"severity\":\"MEDIUM\",\"standard\":\"IICL-6\"}", SortOrder = 6 },
                new MasterCatalogItem { CatalogType = "DAMAGE_CODE", Code = "MISSING", Name = "Missing", NameVi = "Thiếu / mất bộ phận", JsonData = "{\"damageType\":\"MISSING\",\"severity\":\"HIGH\",\"standard\":\"IICL-6\"}", SortOrder = 7 },
                new MasterCatalogItem { CatalogType = "DAMAGE_CODE", Code = "CONTAMINATED", Name = "Contaminated", NameVi = "Nhiễm bẩn / dính hóa chất", JsonData = "{\"damageType\":\"CONTAMINATED\",\"severity\":\"MEDIUM\",\"standard\":\"IICL-6\"}", SortOrder = 8 },
                new MasterCatalogItem { CatalogType = "DAMAGE_CODE", Code = "DELAMINATED", Name = "Delaminated", NameVi = "Bong tróc lớp ván sàn", JsonData = "{\"damageType\":\"DELAMINATED\",\"severity\":\"MEDIUM\",\"standard\":\"IICL-6\"}", SortOrder = 9 },
                new MasterCatalogItem { CatalogType = "DAMAGE_CODE", Code = "WORN", Name = "Worn", NameVi = "Mòn", JsonData = "{\"damageType\":\"WORN\",\"severity\":\"LOW\",\"standard\":\"IICL-6\"}", SortOrder = 10 },
                new MasterCatalogItem { CatalogType = "DAMAGE_CODE", Code = "LOOSE", Name = "Loose", NameVi = "Lỏng / xộc xệch", JsonData = "{\"damageType\":\"LOOSE\",\"severity\":\"LOW\",\"standard\":\"IICL-6\"}", SortOrder = 11 },
                new MasterCatalogItem { CatalogType = "DAMAGE_CODE", Code = "SCRATCHED", Name = "Scratched", NameVi = "Trầy xước", JsonData = "{\"damageType\":\"SCRATCHED\",\"severity\":\"LOW\",\"standard\":\"IICL-6\"}", SortOrder = 12 },
                new MasterCatalogItem { CatalogType = "DAMAGE_CODE", Code = "PUNCTURED", Name = "Punctured", NameVi = "Đâm thủng cục bộ", JsonData = "{\"damageType\":\"PUNCTURED\",\"severity\":\"HIGH\",\"standard\":\"IICL-6\"}", SortOrder = 13 }
            });

            // ===== REPAIR_CODE — phương án sửa chữa IICL-6 (STRAIGHTEN giữ nguyên seed cũ) =====
            catalogs.AddRange(new[]
            {
                new MasterCatalogItem { CatalogType = "REPAIR_CODE", Code = "WELD", Name = "Weld", NameVi = "Hàn", JsonData = "{\"stsCode\":\"WLD\",\"repairType\":\"WELD\",\"labourRate\":150000,\"labourHours\":1.5,\"materialEstimatedCost\":50000}", SortOrder = 2 },
                new MasterCatalogItem { CatalogType = "REPAIR_CODE", Code = "REPLACE", Name = "Replace", NameVi = "Thay thế mới", JsonData = "{\"stsCode\":\"RPL\",\"repairType\":\"REPLACE\",\"labourRate\":150000,\"labourHours\":3.0,\"materialEstimatedCost\":650000}", SortOrder = 3 },
                new MasterCatalogItem { CatalogType = "REPAIR_CODE", Code = "PATCH", Name = "Patch", NameVi = "Vá / dặm", JsonData = "{\"stsCode\":\"PTCH\",\"repairType\":\"PATCH\",\"labourRate\":150000,\"labourHours\":1.0,\"materialEstimatedCost\":120000}", SortOrder = 4 },
                new MasterCatalogItem { CatalogType = "REPAIR_CODE", Code = "REINFORCE", Name = "Reinforce", NameVi = "Gia cố", JsonData = "{\"stsCode\":\"RFC\",\"repairType\":\"REINFORCE\",\"labourRate\":150000,\"labourHours\":2.0,\"materialEstimatedCost\":280000}", SortOrder = 5 },
                new MasterCatalogItem { CatalogType = "REPAIR_CODE", Code = "SANDBLAST_PAINT", Name = "Sandblast & Paint", NameVi = "Phun cát & sơn lại", JsonData = "{\"stsCode\":\"SBP\",\"repairType\":\"PAINT\",\"labourRate\":150000,\"labourHours\":1.5,\"materialEstimatedCost\":180000}", SortOrder = 6 },
                new MasterCatalogItem { CatalogType = "REPAIR_CODE", Code = "CLEAN", Name = "Clean", NameVi = "Vệ sinh cục bộ", JsonData = "{\"stsCode\":\"CLN\",\"repairType\":\"CLEAN\",\"labourRate\":150000,\"labourHours\":0.5,\"materialEstimatedCost\":30000}", SortOrder = 7 },
                new MasterCatalogItem { CatalogType = "REPAIR_CODE", Code = "RIVET", Name = "Rivet", NameVi = "Tán đinh rive", JsonData = "{\"stsCode\":\"RVT\",\"repairType\":\"RIVET\",\"labourRate\":150000,\"labourHours\":0.8,\"materialEstimatedCost\":40000}", SortOrder = 8 },
                new MasterCatalogItem { CatalogType = "REPAIR_CODE", Code = "OVERLAY", Name = "Overlay", NameVi = "Ốp thêm lớp ván sàn", JsonData = "{\"stsCode\":\"OVL\",\"repairType\":\"OVERLAY\",\"labourRate\":150000,\"labourHours\":2.5,\"materialEstimatedCost\":420000}", SortOrder = 9 },
                new MasterCatalogItem { CatalogType = "REPAIR_CODE", Code = "TIGHTEN", Name = "Tighten", NameVi = "Siết chặt bu-lông/bản lề", JsonData = "{\"stsCode\":\"TGT\",\"repairType\":\"TIGHTEN\",\"labourRate\":150000,\"labourHours\":0.3,\"materialEstimatedCost\":0}", SortOrder = 10 },
                new MasterCatalogItem { CatalogType = "REPAIR_CODE", Code = "RECOAT", Name = "Recoat Rubber Seal", NameVi = "Thay/phủ lại gioăng cao su", JsonData = "{\"stsCode\":\"RCT\",\"repairType\":\"RECOAT\",\"labourRate\":150000,\"labourHours\":1.0,\"materialEstimatedCost\":150000}", SortOrder = 11 }
            });

            // ===== GRADE — phân hạng vỏ sau nghiệm thu (GRADE_A giữ nguyên seed cũ) =====
            catalogs.AddRange(new[]
            {
                new MasterCatalogItem { CatalogType = "GRADE", Code = "GRADE_B", Name = "Grade B", NameVi = "Đạt chuẩn nội địa / cargo worthy", Description = "Cont đạt tiêu chuẩn Cargo Worthy, dùng vận chuyển nội địa hoặc tuyến ngắn.", JsonData = "{\"shippingLine\":\"ALL\",\"customer\":\"ALL\"}", SortOrder = 2 },
                new MasterCatalogItem { CatalogType = "GRADE", Code = "GRADE_C", Name = "Grade C", NameVi = "Cần sửa chữa trước khi dùng lại", Description = "Có hư hỏng kết cấu nhẹ, phải qua Estimate/Repair trước khi cấp trả.", JsonData = "{\"shippingLine\":\"ALL\",\"customer\":\"ALL\"}", SortOrder = 3 },
                new MasterCatalogItem { CatalogType = "GRADE", Code = "GRADE_D", Name = "Grade D", NameVi = "Thanh lý / không còn giá trị sử dụng", Description = "Hư hỏng nặng vượt ngưỡng kinh tế sửa chữa, đề xuất thanh lý bán phế liệu.", JsonData = "{\"shippingLine\":\"ALL\",\"customer\":\"ALL\"}", SortOrder = 4 }
            });

            // ===== INSPECTION_STANDARD — tiêu chuẩn giám định (IICL-6 giữ nguyên seed cũ) =====
            catalogs.AddRange(new[]
            {
                new MasterCatalogItem { CatalogType = "INSPECTION_STANDARD", Code = "CW", Name = "Cargo Worthy (CW)", NameVi = "Tiêu chuẩn Cargo Worthy", Description = "Tiêu chuẩn tối thiểu để container đủ điều kiện chở hàng, kín nước và không hư hỏng kết cấu.", JsonData = "{\"shippingLine\":\"ALL\",\"containerType\":\"ALL\",\"containerSize\":\"ALL\",\"version\":\"2024\",\"effectiveDate\":\"2024-01-01\"}", SortOrder = 2 },
                new MasterCatalogItem { CatalogType = "INSPECTION_STANDARD", Code = "WWS", Name = "Wind and Water Tight (WWS)", NameVi = "Tiêu chuẩn kín gió kín nước", Description = "Chỉ yêu cầu kín gió/kín nước, không cần đạt Cargo Worthy đầy đủ, dùng cho lưu kho tạm.", JsonData = "{\"shippingLine\":\"ALL\",\"containerType\":\"ALL\",\"containerSize\":\"ALL\",\"version\":\"2024\",\"effectiveDate\":\"2024-01-01\"}", SortOrder = 3 },
                new MasterCatalogItem { CatalogType = "INSPECTION_STANDARD", Code = "AS_IS", Name = "As Is", NameVi = "Bàn giao nguyên trạng", Description = "Bàn giao nguyên trạng không cam kết tiêu chuẩn kỹ thuật, thường dùng khi bán thanh lý.", JsonData = "{\"shippingLine\":\"ALL\",\"containerType\":\"ALL\",\"containerSize\":\"ALL\",\"version\":\"2024\",\"effectiveDate\":\"2024-01-01\"}", SortOrder = 4 }
            });

            // ===== CLEANING_TARIFF — biểu phí vệ sinh (CLN_GENERAL giữ nguyên seed cũ) =====
            catalogs.AddRange(new[]
            {
                new MasterCatalogItem { CatalogType = "CLEANING_TARIFF", Code = "CLN_CHEMICAL", Name = "Chemical wash", NameVi = "Vệ sinh hóa chất", JsonData = "{\"cedexCode\":\"CW\",\"category\":\"CHEMICAL_WASH\",\"applicableSizes\":[\"20\",\"40\",\"45\"],\"price20DC\":280000,\"price40DC\":420000,\"price40HC\":450000,\"price45HC\":480000,\"price20RF\":350000,\"price40HR\":520000,\"currency\":\"VND\",\"estimatedDurationMin\":45,\"waterUsageLiters\":300,\"chemicalRequired\":\"Xut/tay rua chuyen dung\",\"equipmentUsed\":\"May xit ap luc + hoa chat\",\"responsiblePartyDefault\":\"U\",\"vatPercent\":8}", SortOrder = 2 },
                new MasterCatalogItem { CatalogType = "CLEANING_TARIFF", Code = "CLN_FOOD_GRADE", Name = "Food grade wash", NameVi = "Vệ sinh chuẩn thực phẩm", JsonData = "{\"cedexCode\":\"FG\",\"category\":\"FOOD_GRADE\",\"applicableSizes\":[\"20\",\"40\",\"45\"],\"price20DC\":450000,\"price40DC\":650000,\"price40HC\":700000,\"price45HC\":750000,\"price20RF\":550000,\"price40HR\":800000,\"currency\":\"VND\",\"estimatedDurationMin\":90,\"waterUsageLiters\":500,\"chemicalRequired\":\"Hoa chat khu khuan an toan thuc pham\",\"equipmentUsed\":\"May xit hoi nuoc + kiem tra CEDEX\",\"responsiblePartyDefault\":\"C\",\"vatPercent\":8}", SortOrder = 3 },
                new MasterCatalogItem { CatalogType = "CLEANING_TARIFF", Code = "CLN_ODOR_REMOVAL", Name = "Odor removal deep clean", NameVi = "Khử mùi chuyên sâu", JsonData = "{\"cedexCode\":\"OD\",\"category\":\"ODOR_REMOVAL\",\"applicableSizes\":[\"20\",\"40\",\"45\"],\"price20DC\":350000,\"price40DC\":500000,\"price40HC\":530000,\"price45HC\":560000,\"price20RF\":400000,\"price40HR\":600000,\"currency\":\"VND\",\"estimatedDurationMin\":60,\"waterUsageLiters\":200,\"chemicalRequired\":\"Dung dich khu mui Ozone/than hoat tinh\",\"equipmentUsed\":\"May sinh Ozone + quat hut mui\",\"responsiblePartyDefault\":\"U\",\"vatPercent\":8}", SortOrder = 4 },
                new MasterCatalogItem { CatalogType = "CLEANING_TARIFF", Code = "CLN_FUMIGATION", Name = "Fumigation", NameVi = "Hun trùng kiểm dịch", JsonData = "{\"cedexCode\":\"FM\",\"category\":\"FUMIGATION\",\"applicableSizes\":[\"20\",\"40\",\"45\"],\"price20DC\":600000,\"price40DC\":900000,\"price40HC\":950000,\"price45HC\":1000000,\"price20RF\":700000,\"price40HR\":1050000,\"currency\":\"VND\",\"estimatedDurationMin\":180,\"waterUsageLiters\":0,\"chemicalRequired\":\"Methyl Bromide / Phosphine theo quy dinh kiem dich\",\"equipmentUsed\":\"Bat phu kin khi + may bom khi\",\"responsiblePartyDefault\":\"C\",\"vatPercent\":8}", SortOrder = 5 }
            });

            // ===== SERVICE_TARIFF — cước nâng hạ (LOLO_EMPTY giữ nguyên seed cũ, không đổi).
            // LOLO_MT_NORMAL/LOLO_YARD_SHIFT/LOLO_NIGHT_EXTRA lấy đúng theo dữ liệu tham chiếu đã có sẵn
            // ở `fontend/src/modules/masterdata/mockTariffData.ts` (INITIAL_LOLO_TARIFFS) — đây là các mã
            // mà nhiều nơi khác trong frontend đã hardcode kỳ vọng sẵn (KPI card + Calculator mặc định ở
            // LiftOnLiftOffAndStorageMaster.tsx, và cả `operation/mockData.ts`/`ServiceOrderFormModal.tsx`
            // dùng `LOLO_MT_NORMAL` làm dịch vụ nâng hạ chuẩn khi lập phiếu dịch vụ) — seed cũ trước đây
            // dùng mã `YARD_SHIFT` không khớp quy ước này nên bỏ, thay bằng đúng `LOLO_YARD_SHIFT`. Thiếu
            // `LOLO_NIGHT_EXTRA` (applicableShift=NIGHT_SURCHARGE) khiến Calculator luôn phải tự suy đoán
            // phụ phí ca đêm bằng +25% cứng thay vì đọc biểu giá thật — seed thêm để dùng đúng giá cấu hình.
            catalogs.AddRange(new[]
            {
                new MasterCatalogItem { CatalogType = "SERVICE_TARIFF", Code = "LOLO_MT_NORMAL", Name = "Empty Container Lift-On / Lift-Off standard depot operation", NameVi = "Cước nâng / hạ vỏ container rỗng tại cổng Gate-In & Gate-Out", Description = "Áp dụng cho xe đầu kéo hạ bãi vỏ rỗng trả hoặc nhận cấp vỏ rỗng đóng hàng theo lệnh cấp của hãng tàu.", JsonData = "{\"serviceCategory\":\"LIFT_EMPTY\",\"unit\":\"Lần / Cont\",\"price20GP\":280000,\"price40HC\":420000,\"price45HC\":500000,\"price20RF\":350000,\"price40RH\":520000,\"priceSpecial\":600000,\"vatPercent\":8,\"currency\":\"VND\",\"applicableShift\":\"ALL\"}", SortOrder = 2 },
                new MasterCatalogItem { CatalogType = "SERVICE_TARIFF", Code = "LOLO_YARD_SHIFT", Name = "Internal Empty Yard Shifting / Cleaning Platform & EMR Workshop Move", NameVi = "Phí đảo chuyển vị trí vỏ rỗng nội bộ bãi / Đưa bệ vệ sinh & sửa chữa", Description = "Đảo chuyển vỏ rỗng để lấy cont bên dưới, đưa vào bệ rửa nước/hóa chất, đưa vào xưởng EMR.", JsonData = "{\"serviceCategory\":\"SHIFTING\",\"unit\":\"Lần / Cont\",\"price20GP\":180000,\"price40HC\":260000,\"price45HC\":320000,\"price20RF\":220000,\"price40RH\":320000,\"priceSpecial\":450000,\"vatPercent\":8,\"currency\":\"VND\",\"applicableShift\":\"ALL\"}", SortOrder = 3 },
                new MasterCatalogItem { CatalogType = "SERVICE_TARIFF", Code = "LOLO_NIGHT_EXTRA", Name = "Empty Lifting Night Shift & Holiday Overtime Surcharge", NameVi = "Phụ phí nâng hạ vỏ rỗng ca đêm (22h00 - 06h00) & Ngày Lễ / Tết", Description = "Phụ thu ca đêm và ngày lễ khi nâng hạ vỏ rỗng tại bãi depot.", JsonData = "{\"serviceCategory\":\"NIGHT_SURCHARGE\",\"unit\":\"Lần / Cont\",\"price20GP\":80000,\"price40HC\":120000,\"price45HC\":150000,\"price20RF\":100000,\"price40RH\":150000,\"priceSpecial\":200000,\"vatPercent\":8,\"currency\":\"VND\",\"applicableShift\":\"NIGHT_SURCHARGE\"}", SortOrder = 4 },
                new MasterCatalogItem { CatalogType = "SERVICE_TARIFF", Code = "LOLO_LADEN", Name = "Lift on/off laden", NameVi = "Nâng hạ container có hàng", JsonData = "{\"serviceCategory\":\"LIFT_LADEN\",\"unit\":\"Lần / Cont\",\"price20GP\":350000,\"price40HC\":520000,\"price45HC\":560000,\"price20RF\":420000,\"price40RH\":600000,\"priceSpecial\":750000,\"vatPercent\":8,\"currency\":\"VND\",\"applicableShift\":\"ALL\"}", SortOrder = 5 },
                new MasterCatalogItem { CatalogType = "SERVICE_TARIFF", Code = "PTI_REEFER", Name = "Pre-Trip Inspection (PTI)", NameVi = "Kiểm tra máy lạnh trước chuyến (PTI)", JsonData = "{\"serviceCategory\":\"PTI\",\"unit\":\"Lần / Cont\",\"price20GP\":0,\"price40HC\":0,\"price45HC\":0,\"price20RF\":450000,\"price40RH\":550000,\"priceSpecial\":0,\"vatPercent\":8,\"currency\":\"VND\",\"applicableShift\":\"ALL\"}", SortOrder = 6 },
                new MasterCatalogItem { CatalogType = "SERVICE_TARIFF", Code = "CUSTOMS_SUPERVISION", Name = "Customs supervision", NameVi = "Giám sát hải quan", JsonData = "{\"serviceCategory\":\"CUSTOMS\",\"unit\":\"Lần / Cont\",\"price20GP\":200000,\"price40HC\":200000,\"price45HC\":200000,\"price20RF\":200000,\"price40RH\":200000,\"priceSpecial\":200000,\"vatPercent\":8,\"currency\":\"VND\",\"applicableShift\":\"ALL\"}", SortOrder = 7 },
                new MasterCatalogItem { CatalogType = "SERVICE_TARIFF", Code = "WEIGHING", Name = "Weighing (VGM)", NameVi = "Cân điện tử xác nhận khối lượng (VGM)", JsonData = "{\"serviceCategory\":\"WEIGHING\",\"unit\":\"Lần / Cont\",\"price20GP\":80000,\"price40HC\":80000,\"price45HC\":80000,\"price20RF\":80000,\"price40RH\":80000,\"priceSpecial\":80000,\"vatPercent\":8,\"currency\":\"VND\",\"applicableShift\":\"ALL\"}", SortOrder = 8 }
            });

            // ===== STORAGE_TARIFF — cước lưu bãi (STOR_DRY_STANDARD giữ nguyên seed cũ, không đổi).
            // STOR_MAERSK_SPECIAL/STOR_OOG_DG lấy đúng theo `mockTariffData.ts` (INITIAL_STORAGE_TARIFFS),
            // có cấu trúc `tiers` lũy tiến nhiều bậc đúng chuẩn thay vì 1 mức giá phẳng.
            catalogs.AddRange(new[]
            {
                new MasterCatalogItem { CatalogType = "STORAGE_TARIFF", Code = "STOR_MAERSK_SPECIAL", Name = "Maersk Line (A.P. Moller - Maersk Policy)", NameVi = "Maersk Line (A.P. Moller - Maersk Policy)", Description = "Hợp đồng liên minh hãng tàu Maersk - Cấp Free time 7 ngày cho vỏ rỗng.", JsonData = "{\"shippingLineCode\":\"MSK\",\"shippingLineName\":\"Maersk Line (A.P. Moller - Maersk Policy)\",\"containerTypeCategory\":\"DRY_STANDARD\",\"freeDays\":7,\"calculationUnit\":\"VND/Cont/Day\",\"vatPercent\":8,\"tiers\":[{\"tierName\":\"Bậc 1 (Free time hợp đồng Maersk 7 ngày)\",\"fromDay\":1,\"toDay\":7,\"price20Dry\":0,\"price40Dry\":0,\"price45Dry\":0,\"price20Reefer\":0,\"price40Reefer\":0,\"priceSpecial\":0},{\"tierName\":\"Bậc 2 (Từ ngày 8 đến 20)\",\"fromDay\":8,\"toDay\":20,\"price20Dry\":32000,\"price40Dry\":55000,\"price45Dry\":70000,\"price20Reefer\":65000,\"price40Reefer\":110000,\"priceSpecial\":100000},{\"tierName\":\"Bậc 3 (Từ ngày 21 trở đi)\",\"fromDay\":21,\"toDay\":null,\"price20Dry\":60000,\"price40Dry\":105000,\"price45Dry\":135000,\"price20Reefer\":120000,\"price40Reefer\":210000,\"priceSpecial\":180000}]}", SortOrder = 2 },
                new MasterCatalogItem { CatalogType = "STORAGE_TARIFF", Code = "STOR_OOG_DG", Name = "Hazardous (IMO/DG) & Oversized (Flat Rack / Open Top)", NameVi = "Hàng Nguy Hiểm (IMO/DG) & Quá Khổ (Flat Rack / Open Top)", Description = "Khu vực bãi cách ly an toàn PCCC cho hàng hóa chất và thiết bị OOG.", JsonData = "{\"shippingLineCode\":\"ALL\",\"shippingLineName\":\"Hàng Nguy Hiểm (IMO/DG) & Quá Khổ (Flat Rack / Open Top)\",\"containerTypeCategory\":\"IMO_HAZARDOUS\",\"freeDays\":3,\"calculationUnit\":\"VND/Cont/Day\",\"vatPercent\":8,\"tiers\":[{\"tierName\":\"Bậc 1 (Miễn phí 3 ngày)\",\"fromDay\":1,\"toDay\":3,\"price20Dry\":0,\"price40Dry\":0,\"price45Dry\":0,\"price20Reefer\":0,\"price40Reefer\":0,\"priceSpecial\":0},{\"tierName\":\"Bậc 2 (Từ ngày 4 đến 10)\",\"fromDay\":4,\"toDay\":10,\"price20Dry\":60000,\"price40Dry\":110000,\"price45Dry\":140000,\"price20Reefer\":120000,\"price40Reefer\":210000,\"priceSpecial\":190000},{\"tierName\":\"Bậc 3 (Từ ngày 11 trở đi)\",\"fromDay\":11,\"toDay\":null,\"price20Dry\":110000,\"price40Dry\":195000,\"price45Dry\":240000,\"price20Reefer\":220000,\"price40Reefer\":370000,\"priceSpecial\":330000}]}", SortOrder = 3 },
                new MasterCatalogItem { CatalogType = "STORAGE_TARIFF", Code = "STOR_REEFER", Name = "Reefer storage (có điện PTI)", NameVi = "Lưu bãi container lạnh", JsonData = "{\"shippingLineCode\":\"ALL\",\"shippingLineName\":\"Reefer storage (có điện PTI)\",\"containerTypeCategory\":\"REEFER\",\"freeDays\":3,\"calculationUnit\":\"VND/Cont/Day\",\"vatPercent\":8,\"price20Reefer\":120000,\"price40Reefer\":180000}", SortOrder = 4 },
                new MasterCatalogItem { CatalogType = "STORAGE_TARIFF", Code = "STOR_45HC", Name = "45HC / High cube storage", NameVi = "Lưu bãi container 40/45HC", JsonData = "{\"shippingLineCode\":\"ALL\",\"shippingLineName\":\"45HC / High cube storage\",\"containerTypeCategory\":\"DRY_HIGH_CUBE\",\"freeDays\":5,\"calculationUnit\":\"VND/Cont/Day\",\"vatPercent\":8,\"price40Dry\":65000,\"price45Dry\":75000}", SortOrder = 5 },
                new MasterCatalogItem { CatalogType = "STORAGE_TARIFF", Code = "STOR_SPECIAL_EQUIP", Name = "Special equipment storage (Tank/FR/OT)", NameVi = "Lưu bãi thiết bị đặc chủng", JsonData = "{\"shippingLineCode\":\"ALL\",\"shippingLineName\":\"Special equipment storage (Tank/FR/OT)\",\"containerTypeCategory\":\"SPECIAL\",\"freeDays\":2,\"calculationUnit\":\"VND/Cont/Day\",\"vatPercent\":8,\"priceSpecial\":95000}", SortOrder = 6 }
            });

            // ===== DEPARTMENT — phòng ban Depot (GATE giữ nguyên seed cũ) =====
            catalogs.AddRange(new[]
            {
                new MasterCatalogItem { CatalogType = "DEPARTMENT", Code = "SURVEY", Name = "Survey / Inspection", NameVi = "Giám Định Container", JsonData = "{\"shortName\":\"GĐ\",\"managerName\":\"Trần Văn Bình\",\"managerPhone\":\"0908.111.222\",\"managerEmail\":\"survey.mgr@depotcontainer.vn\",\"location\":\"Bệ Giám Định 01-04\",\"headcount\":8,\"primaryRole\":\"Giám Định Viên\",\"primaryRoleCode\":\"SURVEYOR\",\"operatingHours\":\"07:00 - 19:00\",\"costCenter\":\"CC-SVY\",\"division\":\"OPERATIONS\",\"divisionName\":\"Khối Khai Thác\",\"tags\":[\"IICL-6\",\"e-EIR\"]}", SortOrder = 2 },
                new MasterCatalogItem { CatalogType = "DEPARTMENT", Code = "REPAIR", Name = "Repair Workshop (EMR)", NameVi = "Xưởng Sửa Chữa EMR", JsonData = "{\"shortName\":\"SC\",\"managerName\":\"Vũ Quốc Việt\",\"managerPhone\":\"0908.222.333\",\"managerEmail\":\"repair.mgr@depotcontainer.vn\",\"location\":\"Xưởng EMR\",\"headcount\":15,\"primaryRole\":\"Thợ Sửa Chữa\",\"primaryRoleCode\":\"TECHNICIAN\",\"operatingHours\":\"07:00 - 17:00\",\"costCenter\":\"CC-EMR\",\"division\":\"OPERATIONS\",\"divisionName\":\"Khối Khai Thác\",\"tags\":[\"M&R\",\"IICL\"]}", SortOrder = 3 },
                new MasterCatalogItem { CatalogType = "DEPARTMENT", Code = "QC", Name = "Quality Control", NameVi = "Nghiệm Thu QC", JsonData = "{\"shortName\":\"QC\",\"managerName\":\"Nguyễn Văn Hải\",\"managerPhone\":\"0908.333.444\",\"managerEmail\":\"qc.mgr@depotcontainer.vn\",\"location\":\"Trạm QC Bãi Q\",\"headcount\":5,\"primaryRole\":\"Kỹ Sư QC\",\"primaryRoleCode\":\"QC_ENG\",\"operatingHours\":\"07:00 - 17:00\",\"costCenter\":\"CC-QC\",\"division\":\"OPERATIONS\",\"divisionName\":\"Khối Khai Thác\",\"tags\":[\"AV Grade\"]}", SortOrder = 4 },
                new MasterCatalogItem { CatalogType = "DEPARTMENT", Code = "WAREHOUSE", Name = "Warehouse / Material", NameVi = "Kho Vật Tư", JsonData = "{\"shortName\":\"KVT\",\"managerName\":\"Lê Thị Hạnh\",\"managerPhone\":\"0908.444.555\",\"managerEmail\":\"warehouse.mgr@depotcontainer.vn\",\"location\":\"Kho Vật Tư Trung Tâm\",\"headcount\":4,\"primaryRole\":\"Thủ Kho\",\"primaryRoleCode\":\"WAREHOUSE_STAFF\",\"operatingHours\":\"07:30 - 16:30\",\"costCenter\":\"CC-WH\",\"division\":\"SUPPLY_CHAIN\",\"divisionName\":\"Khối Chuỗi Cung Ứng\",\"tags\":[\"Tồn kho\",\"EMR\"]}", SortOrder = 5 },
                new MasterCatalogItem { CatalogType = "DEPARTMENT", Code = "YARD_OPS", Name = "Yard Operations", NameVi = "Điều Độ Bãi & Xe Nâng", JsonData = "{\"shortName\":\"ĐĐB\",\"managerName\":\"Nguyễn Đức Tâm\",\"managerPhone\":\"0908.555.666\",\"managerEmail\":\"yard.mgr@depotcontainer.vn\",\"location\":\"Trạm Điều Độ Bãi\",\"headcount\":10,\"primaryRole\":\"Tài Xế Xe Nâng\",\"primaryRoleCode\":\"FORKLIFT\",\"operatingHours\":\"06:00 - 22:00\",\"costCenter\":\"CC-YARD\",\"division\":\"OPERATIONS\",\"divisionName\":\"Khối Khai Thác\",\"tags\":[\"Yard 2D\",\"Forklift\"]}", SortOrder = 6 },
                new MasterCatalogItem { CatalogType = "DEPARTMENT", Code = "ACCOUNTING", Name = "Accounting / Billing", NameVi = "Kế Toán & Công Nợ", JsonData = "{\"shortName\":\"KT\",\"managerName\":\"Phạm Thị Thu\",\"managerPhone\":\"0908.666.777\",\"managerEmail\":\"accounting.mgr@depotcontainer.vn\",\"location\":\"Văn Phòng Kế Toán\",\"headcount\":6,\"primaryRole\":\"Thu Ngân / Kế Toán\",\"primaryRoleCode\":\"CASHIER\",\"operatingHours\":\"08:00 - 17:00\",\"costCenter\":\"CC-ACC\",\"division\":\"FINANCE\",\"divisionName\":\"Khối Tài Chính\",\"tags\":[\"VietQR\",\"Công nợ AR\"]}", SortOrder = 7 },
                new MasterCatalogItem { CatalogType = "DEPARTMENT", Code = "ADMIN", Name = "Administration / HR", NameVi = "Hành Chính - Nhân Sự", JsonData = "{\"shortName\":\"HCNS\",\"managerName\":\"Nguyễn Văn Hùng\",\"managerPhone\":\"0908.777.888\",\"managerEmail\":\"admin.mgr@depotcontainer.vn\",\"location\":\"Văn Phòng Điều Hành\",\"headcount\":3,\"primaryRole\":\"Quản Lý Tổng Depot\",\"primaryRoleCode\":\"ADMIN\",\"operatingHours\":\"08:00 - 17:00\",\"costCenter\":\"CC-ADM\",\"division\":\"ADMIN\",\"divisionName\":\"Khối Hành Chính\",\"tags\":[\"RBAC\",\"Nhân sự\"]}", SortOrder = 8 }
            });

            // ===== SURVEY_CHECKLIST / QC_CHECKLIST — vùng giám định IICL-6 và hạng mục nghiệm thu QC. Trước đây nằm
            // cứng ở frontend (survey/mockData.ts, qc/data/defaultQCChecklist.ts); nay là danh mục DB, frontend đọc qua
            // GET /api/MasterData/catalog/{type} (fontend/src/modules/masterdata/utils/checklistCatalog.ts).
            catalogs.AddRange(new[]
            {
                new MasterCatalogItem { CatalogType = "SURVEY_CHECKLIST", Code = "ROOF", Name = "1. Nóc Container (Roof Panel & Bows)", NameVi = "1. Nóc Container (Roof Panel & Bows)", JsonData = "{\"defaultStatus\":\"PASS\"}", SortOrder = 1 },
                new MasterCatalogItem { CatalogType = "SURVEY_CHECKLIST", Code = "FRONT_WALL", Name = "2. Vách Trước (Front Wall Panel)", NameVi = "2. Vách Trước (Front Wall Panel)", JsonData = "{\"defaultStatus\":\"PASS\"}", SortOrder = 2 },
                new MasterCatalogItem { CatalogType = "SURVEY_CHECKLIST", Code = "LEFT_WALL", Name = "3. Vách Trái (Left Side Panel)", NameVi = "3. Vách Trái (Left Side Panel)", JsonData = "{\"defaultStatus\":\"PASS\"}", SortOrder = 3 },
                new MasterCatalogItem { CatalogType = "SURVEY_CHECKLIST", Code = "RIGHT_WALL", Name = "4. Vách Phải (Right Side Panel)", NameVi = "4. Vách Phải (Right Side Panel)", JsonData = "{\"defaultStatus\":\"PASS\"}", SortOrder = 4 },
                new MasterCatalogItem { CatalogType = "SURVEY_CHECKLIST", Code = "DOOR", Name = "5. Cửa & Khóa (Door, Gasket & Lock Rod)", NameVi = "5. Cửa & Khóa (Door, Gasket & Lock Rod)", JsonData = "{\"defaultStatus\":\"PASS\"}", SortOrder = 5 },
                new MasterCatalogItem { CatalogType = "SURVEY_CHECKLIST", Code = "FLOOR", Name = "6. Sàn Gỗ (Wooden Floorboard)", NameVi = "6. Sàn Gỗ (Wooden Floorboard)", JsonData = "{\"defaultStatus\":\"PASS\"}", SortOrder = 6 },
                new MasterCatalogItem { CatalogType = "SURVEY_CHECKLIST", Code = "FRAME", Name = "7. Khung Đỡ (Side Rails & Crossmembers)", NameVi = "7. Khung Đỡ (Side Rails & Crossmembers)", JsonData = "{\"defaultStatus\":\"PASS\"}", SortOrder = 7 },
                new MasterCatalogItem { CatalogType = "SURVEY_CHECKLIST", Code = "CORNER_CASTING", Name = "8. Gù Góc & Trụ (Corner Castings & Posts)", NameVi = "8. Gù Góc & Trụ (Corner Castings & Posts)", JsonData = "{\"defaultStatus\":\"PASS\"}", SortOrder = 8 },
                new MasterCatalogItem { CatalogType = "SURVEY_CHECKLIST", Code = "UNDERSTRUCTURE", Name = "9. Gầm Container (Understructure / Fork Pockets)", NameVi = "9. Gầm Container (Understructure / Fork Pockets)", JsonData = "{\"defaultStatus\":\"PASS\"}", SortOrder = 9 },
                new MasterCatalogItem { CatalogType = "SURVEY_CHECKLIST", Code = "REEFER_UNIT", Name = "10. Thiết Bị Lạnh (Reefer Machinery & PTI)", NameVi = "10. Thiết Bị Lạnh (Reefer Machinery & PTI)", JsonData = "{\"defaultStatus\":\"NA\"}", SortOrder = 10 },
                new MasterCatalogItem { CatalogType = "SURVEY_CHECKLIST", Code = "CLEANING", Name = "11. Tình Trạng Vệ Sinh (Cleaning Condition)", NameVi = "11. Tình Trạng Vệ Sinh (Cleaning Condition)", JsonData = "{\"defaultStatus\":\"PASS\"}", SortOrder = 11 },
                new MasterCatalogItem { CatalogType = "QC_CHECKLIST", Code = "QC-01", Name = "1. Thử Kín Sáng Buồng Tối (Light Test In Closed Container)", NameVi = "1. Thử Kín Sáng Buồng Tối (Light Test In Closed Container)", Description = "Đóng kín 2 cánh cửa từ bên trong, không có bất kỳ tia sáng nào lọt qua nóc, vách, góc gù hay gioăng cửa.", JsonData = "{\"category\":\"LIGHT\"}", SortOrder = 1 },
                new MasterCatalogItem { CatalogType = "QC_CHECKLIST", Code = "QC-02", Name = "2. Thử Kín Nước & Mối Hàn (Water Tightness & Weld Integrity)", NameVi = "2. Thử Kín Nước & Mối Hàn (Water Tightness & Weld Integrity)", Description = "Phun nước áp lực cao vào các mối hàn chắp vá và gioăng cửa. Không rò rỉ hoặc đọng nước vào khoang trong.", JsonData = "{\"category\":\"WATER\"}", SortOrder = 2 },
                new MasterCatalogItem { CatalogType = "QC_CHECKLIST", Code = "QC-03", Name = "3. Kết Cấu Cơ Khí & Khung Gầm (Structural Geometry & Side Rails)", NameVi = "3. Kết Cấu Cơ Khí & Khung Gầm (Structural Geometry & Side Rails)", Description = "Xà dọc đáy, xà nóc, dầm ngang số 1-5 và góc gù đúc thẳng hàng theo dung sai IICL-6 (độ võng < 15mm).", JsonData = "{\"category\":\"STRUCTURE\"}", SortOrder = 3 },
                new MasterCatalogItem { CatalogType = "QC_CHECKLIST", Code = "QC-04", Name = "4. Mặt Sàn Gỗ & Bắt Vít (Plywood Floor Flatness & Screws)", NameVi = "4. Mặt Sàn Gỗ & Bắt Vít (Plywood Floor Flatness & Screws)", Description = "Sàn gỗ Apitong 28mm phẳng nhẵn, vít bắt chìm dưới mặt sàn 2-3mm, trám keo polyurethane kín khít mép.", JsonData = "{\"category\":\"FLOOR\"}", SortOrder = 4 },
                new MasterCatalogItem { CatalogType = "QC_CHECKLIST", Code = "QC-05", Name = "5. Xử Lý Bề Mặt & Độ Dày Màng Sơn (Surface Prep & Paint DFT)", NameVi = "5. Xử Lý Bề Mặt & Độ Dày Màng Sơn (Surface Prep & Paint DFT)", Description = "Mối hàn được mài nhẵn bavia, tẩy gỉ chuẩn Sa 2.5, sơn lót epoxy + sơn phủ đồng màu vỏ, DFT ≥ 80 µm.", JsonData = "{\"category\":\"PAINT\"}", SortOrder = 5 },
                new MasterCatalogItem { CatalogType = "QC_CHECKLIST", Code = "QC-06", Name = "6. Cánh Cửa, Tay Khóa & Ron Đệm (Door Hardware & Rubber Gaskets)", NameVi = "6. Cánh Cửa, Tay Khóa & Ron Đệm (Door Hardware & Rubber Gaskets)", Description = "Bản lề trơn tru, tay khóa đóng mở nhẹ nhàng, chốt niêm phong hải quan nguyên vẹn, ron cao su đàn hồi tốt.", JsonData = "{\"category\":\"DOOR\"}", SortOrder = 6 },
                new MasterCatalogItem { CatalogType = "QC_CHECKLIST", Code = "QC-07", Name = "7. Vệ Sinh & Khử Mùi Hóa Chất (Cleanliness & Odor-Free)", NameVi = "7. Vệ Sinh & Khử Mùi Hóa Chất (Cleanliness & Odor-Free)", Description = "Khoang trong khô ráo, quét sạch phoi sắt xỉ hàn, không có mùi dầu mỡ hóa chất độc hại, đạt chuẩn cấp hàng.", JsonData = "{\"category\":\"CLEANLINESS\"}", SortOrder = 7 },
            });

            // ===== CUSTOMER_CLASSIFICATION — 5 dòng seed cũ đã đủ, không cần bổ sung. =====

            var existing = await context.MasterCatalogItems.Select(x => new { x.CatalogType, x.Code }).ToListAsync();
            context.MasterCatalogItems.AddRange(catalogs.Where(item => !existing.Any(x => x.CatalogType == item.CatalogType && x.Code == item.Code)));
        }

        private static async Task SeedYardAsync(DepotDbContext context)
        {
            var positions = await context.YardPositions.CountAsync();
            if (positions > 0) return;

            var slots = new List<YardPosition>();
            foreach (var block in new[] { "BLOCK_A", "BLOCK_B", "BLOCK_Q", "BLOCK_R" })
            {
                for (var bay = 1; bay <= 3; bay++)
                for (var row = 1; row <= 3; row++)
                for (var tier = 1; tier <= 2; tier++)
                    slots.Add(new YardPosition { BlockCode = block, Bay = bay, Row = row, Tier = tier });
            }
            context.YardPositions.AddRange(slots);
        }

        /// <summary>
        /// Seed layout cho Sơ Đồ Bãi 2D (mục #9-10 INDEX.md) — Zone/Block/Forklift/GateLane. Occupancy
        /// (container/vị trí) KHÔNG seed ở đây, luôn tính trực tiếp từ DepotJob thật lúc gọi API overview.
        /// Block dùng đúng BlockCode thật đang seed ở SeedYardAsync (BLOCK_A/B/Q/R) để join đúng dữ liệu.
        /// </summary>
        private static async Task SeedNotificationTemplatesAsync(DepotDbContext context)
        {
            var templates = new (string Code, string Name, string Audience, string Title, string Content)[]
            {
                ("GATE_IN_COMPLETED", "Tiep nhan Gate-In thanh cong", "CUSTOMER", "Container {{containerNo}} da vao bai", "Container {{containerNo}} da tiep nhan Gate-In thanh cong luc {{time}}."),
                ("INSPECTION_COMPLETED", "Hoan tat giam dinh", "CUSTOMER", "Da co ket qua giam dinh {{containerNo}}", "Container {{containerNo}} da giam dinh xong, ket luan: {{condition}}."),
                ("ESTIMATE_CREATED", "Bao gia moi", "CUSTOMER", "Bao gia moi cho container {{containerNo}}", "Da lap bao gia {{quotationNo}} cho container {{containerNo}}, tong tien {{amount}}."),
                ("ESTIMATE_APPROVED", "Bao gia da duyet", "EMPLOYEE", "Bao gia {{quotationNo}} da duoc duyet", "Hang tau da duyet bao gia {{quotationNo}} cho container {{containerNo}}."),
                ("ESTIMATE_REJECTED", "Bao gia bi tu choi", "EMPLOYEE", "Bao gia {{quotationNo}} bi tu choi", "Hang tau tu choi bao gia {{quotationNo}}, ly do: {{reason}}."),
                ("WORK_ORDER_CREATED", "Lenh sua chua moi", "EMPLOYEE", "Lenh sua chua {{workOrderNo}} da tao", "Lenh sua chua {{workOrderNo}} cho container {{containerNo}} da duoc tao."),
                ("MATERIAL_REQUESTED", "Yeu cau vat tu", "EMPLOYEE", "Yeu cau xuat vat tu cho {{workOrderNo}}", "Lenh sua chua {{workOrderNo}} yeu cau xuat vat tu."),
                ("MATERIAL_ISSUED", "Da xuat vat tu", "EMPLOYEE", "Da xuat vat tu cho {{workOrderNo}}", "Kho da xuat vat tu cho lenh sua chua {{workOrderNo}}."),
                ("REPAIR_COMPLETED", "Hoan tat sua chua", "CUSTOMER", "Container {{containerNo}} da sua chua xong", "Container {{containerNo}} da hoan tat sua chua, cho QC nghiem thu."),
                ("QC_PASSED", "QC dat", "CUSTOMER", "Container {{containerNo}} da QC dat", "Container {{containerNo}} da nghiem thu QC dat, san sang cap tra."),
                ("QC_FAILED", "QC khong dat", "EMPLOYEE", "Container {{containerNo}} QC khong dat", "Container {{containerNo}} QC khong dat, can sua chua lai."),
                ("GATE_OUT_READY", "San sang cap tra", "CUSTOMER", "Container {{containerNo}} san sang cap tra", "Container {{containerNo}} da san sang cap tra tai cong Gate-Out."),
                ("INVOICE_CREATED", "Hoa don moi", "CUSTOMER", "Hoa don {{invoiceNo}} da phat hanh", "Hoa don VAT {{invoiceNo}} cho container {{containerNo}} da duoc phat hanh."),
                ("PAYMENT_RECEIVED", "Da nhan thanh toan", "CUSTOMER", "Da nhan thanh toan {{amount}}", "Depot da nhan thanh toan {{amount}} tu {{shippingLine}}."),
                ("PAYMENT_OVERDUE", "Cong no qua han", "CUSTOMER", "Cong no qua han thanh toan", "Hang tau {{shippingLine}} co khoan cong no qua han {{amount}}."),
                ("DEBT_REMINDER", "Nhac nho cong no", "CUSTOMER", "Nhac nho thanh toan cong no", "Vui long thanh toan cong no {{amount}} truoc ngay {{dueDate}}.")
            };

            var existing = await context.NotificationTemplates.Select(x => x.Code).ToListAsync();
            foreach (var t in templates.Where(t => !existing.Contains(t.Code)))
            {
                context.NotificationTemplates.Add(new Depot.Data.Entities.Integration.NotificationTemplate
                {
                    Code = t.Code,
                    Name = t.Name,
                    EventType = t.Code,
                    TargetAudience = t.Audience,
                    Channel = "ZALO_ZNS",
                    TitleTemplate = t.Title,
                    ContentTemplate = t.Content,
                    VariablesJson = "[]",
                    IsActive = true
                });
            }
        }

        private static async Task SeedYardOverviewAsync(DepotDbContext context)
        {
            if (await context.YardZones.AnyAsync()) return;

            context.YardZones.AddRange(new[]
            {
                new YardZone { Code = "GATE_IN", ZoneName = "Cổng Vào Container (Gate-In)", ZoneType = "GATE_IN", PositionX = 40, PositionY = 40, Width = 300, Height = 160, Description = "Làn OCR/RFID - Cân điện tử - Camera giám sát", SortOrder = 1 },
                new YardZone { Code = "INSPECTION", ZoneName = "Khu Giám Định (IICL Survey)", ZoneType = "INSPECTION", PositionX = 380, PositionY = 40, Width = 340, Height = 160, Description = "Bệ giám định gầm, vách, nóc & máy lạnh PTI", SortOrder = 2 },
                new YardZone { Code = "GATE_OUT", ZoneName = "Cổng Xuất Container (Gate-Out)", ZoneType = "GATE_OUT", PositionX = 1460, PositionY = 40, Width = 300, Height = 160, Description = "Đối soát EDO & Seal Hải quan", SortOrder = 3 },
                new YardZone { Code = "STORAGE_BLOCK_A", ZoneName = "Khu Bãi Block A", ZoneType = "STORAGE", PositionX = 40, PositionY = 260, Width = 480, Height = 340, Description = "Container khô tiêu chuẩn", SortOrder = 4 },
                new YardZone { Code = "STORAGE_BLOCK_B", ZoneName = "Khu Bãi Block B", ZoneType = "STORAGE", PositionX = 560, PositionY = 260, Width = 480, Height = 340, Description = "Container lạnh Reefer", SortOrder = 5 },
                new YardZone { Code = "STORAGE_BLOCK_Q", ZoneName = "Khu Bãi Block Q", ZoneType = "STORAGE", PositionX = 1080, PositionY = 260, Width = 480, Height = 340, Description = "Vỏ sạch xuất khẩu", SortOrder = 6 },
                new YardZone { Code = "STORAGE_BLOCK_R", ZoneName = "Khu Bãi Block R", ZoneType = "STORAGE", PositionX = 1600, PositionY = 260, Width = 480, Height = 340, Description = "Container 45HC & đặc chủng", SortOrder = 7 },
                new YardZone { Code = "REPAIR", ZoneName = "Xưởng Sửa Chữa EMR", ZoneType = "REPAIR", PositionX = 40, PositionY = 640, Width = 380, Height = 220, Description = "Hàn cắt, nắn xà, thay vách, sơn", SortOrder = 8 },
                new YardZone { Code = "CLEANING", ZoneName = "Bãi Rửa & Vệ Sinh Container", ZoneType = "CLEANING", PositionX = 440, PositionY = 640, Width = 380, Height = 220, Description = "Trạm rửa áp lực cao, xịt hóa chất & sấy khô", SortOrder = 9 },
                new YardZone { Code = "HOLD", ZoneName = "Khu Vực Tạm Giữ (Hold)", ZoneType = "HOLD", PositionX = 840, PositionY = 640, Width = 380, Height = 220, Description = "Cách ly: hải quan niêm phong, thiếu chứng từ, tranh chấp", SortOrder = 10 },
                new YardZone { Code = "STAGING", ZoneName = "Khu Vực Chờ Cấp Vỏ (Staging)", ZoneType = "STAGING", PositionX = 1240, PositionY = 640, Width = 380, Height = 220, Description = "Container AV sẵn sàng nâng lên xe", SortOrder = 11 },
                new YardZone { Code = "FORKLIFT_AREA", ZoneName = "Bãi Đậu & Bảo Trì Xe Nâng", ZoneType = "FORKLIFT_AREA", PositionX = 1640, PositionY = 640, Width = 380, Height = 220, Description = "Trạm bảo dưỡng & sạc điện xe nâng", SortOrder = 12 }
            });

            context.YardBlockLayouts.AddRange(new[]
            {
                new YardBlockLayout { Code = "BLOCK_A", ZoneCode = "STORAGE_BLOCK_A", BlockName = "Block A - Dry Standard", BayCount = 8, RowCount = 4, MaxTier = 4, PositionX = 55, PositionY = 295, Width = 440, Height = 280, Status = "ACTIVE", Description = "Vỏ Dry 20GP/40HC hãng tàu MSK & MSC" },
                new YardBlockLayout { Code = "BLOCK_B", ZoneCode = "STORAGE_BLOCK_B", BlockName = "Block B - Reefer Cold Chain", BayCount = 8, RowCount = 4, MaxTier = 4, PositionX = 575, PositionY = 295, Width = 440, Height = 280, Status = "ACTIVE", Description = "Container lạnh, ổ cắm PTI & giám sát nhiệt độ" },
                new YardBlockLayout { Code = "BLOCK_Q", ZoneCode = "STORAGE_BLOCK_Q", BlockName = "Block Q - Export Empty", BayCount = 8, RowCount = 4, MaxTier = 4, PositionX = 1095, PositionY = 295, Width = 440, Height = 280, Status = "ACTIVE", Description = "Vỏ sạch xuất khẩu cho hãng ONE, CMA CGM, COSCO" },
                new YardBlockLayout { Code = "BLOCK_R", ZoneCode = "STORAGE_BLOCK_R", BlockName = "Block R - 45HC & Specials", BayCount = 8, RowCount = 4, MaxTier = 4, PositionX = 1615, PositionY = 295, Width = 440, Height = 280, Status = "ACTIVE", Description = "Container 45HC, Open Top và Flat Rack" }
            });

            context.Forklifts.AddRange(new[]
            {
                new Forklift { Code = "FL-001", Name = "Xe Nâng Kalmar 45T (#01)", Status = "AVAILABLE", CurrentLocation = "BLOCK_A", PositionX = 380, PositionY = 340, DriverName = "Nguyễn Văn Hùng", DriverPhone = "0912.345.678", BatteryPercent = 88, MaxCapacityTons = 45, CurrentTask = "Sẵn sàng điều độ bốc hạ vỏ" },
                new Forklift { Code = "FL-002", Name = "Xe Nâng Konecranes 42T (#02)", Status = "AVAILABLE", CurrentLocation = "BLOCK_B", PositionX = 950, PositionY = 340, DriverName = "Trần Đình Nam", DriverPhone = "0988.765.432", BatteryPercent = 72, MaxCapacityTons = 42, CurrentTask = "Sẵn sàng điều độ bốc hạ vỏ" },
                new Forklift { Code = "FL-003", Name = "Xe Nâng Chụp Rỗng Hyster 10T (#03)", Status = "AVAILABLE", CurrentLocation = "FORKLIFT_AREA", PositionX = 1750, PositionY = 750, DriverName = "Lê Hoàng Anh", DriverPhone = "0903.112.233", BatteryPercent = 95, MaxCapacityTons = 10, CurrentTask = "Đậu tại xưởng bảo trì xe nâng" }
            });

            context.YardGateLanes.AddRange(new[]
            {
                new YardGateLane { Code = "LANE-IN-01", LaneNo = 1, GateType = "IN", LaneName = "Làn Vào 01 (Xe Tải Nặng / Cân Điện Tử)", HasOcr = true, HasRfid = true, HasWeighbridge = true, Status = "OPEN" },
                new YardGateLane { Code = "LANE-IN-02", LaneNo = 2, GateType = "IN", LaneName = "Làn Vào 02 (Tự Động Smart OCR)", HasOcr = true, HasRfid = true, HasWeighbridge = false, Status = "OPEN" },
                new YardGateLane { Code = "LANE-IN-03", LaneNo = 3, GateType = "IN", LaneName = "Làn Vào 03 (Ưu Tiên Cont Rỗng)", HasOcr = true, HasRfid = true, HasWeighbridge = false, Status = "OPEN" },
                new YardGateLane { Code = "LANE-OUT-01", LaneNo = 1, GateType = "OUT", LaneName = "Làn Xuất 01 (Kiểm Soát Seal & EDO)", HasOcr = true, HasRfid = true, HasWeighbridge = true, Status = "OPEN" },
                new YardGateLane { Code = "LANE-OUT-02", LaneNo = 2, GateType = "OUT", LaneName = "Làn Xuất 02 (Cấp Vỏ Nhanh)", HasOcr = true, HasRfid = true, HasWeighbridge = false, Status = "OPEN" }
            });
        }

        /// <summary>
        /// Backfill 1 lần: copy dữ liệu Cước Nâng Hạ đã có sẵn trong catalog dùng chung
        /// "SERVICE_TARIFF" (bảng <c>MasterCatalogItems</c>) sang bảng riêng <c>ServiceTariffs</c> mới
        /// (xem docs/frontend-tariff-catalog-split.md). Idempotent theo <c>Code</c> — chỉ thêm dòng nào
        /// bên bảng mới còn thiếu, không đụng/xoá dữ liệu cũ ở MasterCatalogItems (giữ nguyên để không
        /// phá dữ liệu, phòng khi có chỗ nào khác còn đọc catalog cũ).
        /// </summary>
        private static async Task SeedServiceTariffsFromLegacyCatalogAsync(DepotDbContext context)
        {
            var legacyItems = await context.MasterCatalogItems
                .Where(x => x.CatalogType == "SERVICE_TARIFF" && x.IsActive)
                .ToListAsync();
            if (legacyItems.Count == 0) return;

            var existingCodes = await context.ServiceTariffs.Select(x => x.Code).ToListAsync();

            foreach (var legacy in legacyItems)
            {
                if (existingCodes.Contains(legacy.Code)) continue;

                Dictionary<string, System.Text.Json.JsonElement> data;
                try
                {
                    data = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, System.Text.Json.JsonElement>>(legacy.JsonData) ?? new();
                }
                catch
                {
                    data = new();
                }

                decimal ReadDecimal(string key) => data.TryGetValue(key, out var v) && v.TryGetDecimal(out var d) ? d : 0m;
                string ReadString(string key, string fallback) => data.TryGetValue(key, out var v) && v.ValueKind == System.Text.Json.JsonValueKind.String ? (v.GetString() ?? fallback) : fallback;

                context.ServiceTariffs.Add(new ServiceTariff
                {
                    Code = legacy.Code,
                    ServiceCategory = ReadString("serviceCategory", "LIFT_EMPTY"),
                    NameVi = legacy.NameVi ?? legacy.Name,
                    NameEn = legacy.Name,
                    Unit = ReadString("unit", "Lần / Cont"),
                    Price20GP = ReadDecimal("price20GP"),
                    Price40HC = ReadDecimal("price40HC"),
                    Price45HC = ReadDecimal("price45HC"),
                    Price20RF = ReadDecimal("price20RF"),
                    Price40RH = ReadDecimal("price40RH"),
                    PriceSpecial = ReadDecimal("priceSpecial"),
                    VatPercent = ReadDecimal("vatPercent") == 0 ? 8 : ReadDecimal("vatPercent"),
                    Currency = ReadString("currency", "VND"),
                    ApplicableShift = ReadString("applicableShift", "ALL"),
                    Description = legacy.Description,
                    IsActive = true,
                    SortOrder = legacy.SortOrder
                });
            }

            await context.SaveChangesAsync();
        }

        /// <summary>
        /// Backfill 1 lần: copy dữ liệu Cước Lưu Bãi đã có sẵn trong catalog dùng chung "STORAGE_TARIFF"
        /// (bảng <c>MasterCatalogItems</c>) sang bảng riêng <c>StorageTariffRule</c> +
        /// <c>StorageTariffTier</c> mới (xem docs/frontend-tariff-catalog-split.md). Idempotent theo
        /// <c>Code</c> — chỉ thêm dòng nào bên bảng mới còn thiếu, không đụng/xoá dữ liệu cũ ở
        /// MasterCatalogItems.
        /// </summary>
        private static async Task SeedStorageTariffsFromLegacyCatalogAsync(DepotDbContext context)
        {
            var legacyItems = await context.MasterCatalogItems
                .Where(x => x.CatalogType == "STORAGE_TARIFF" && x.IsActive)
                .ToListAsync();
            if (legacyItems.Count == 0) return;

            var existingCodes = await context.StorageTariffRules.Select(x => x.Code).ToListAsync();

            foreach (var legacy in legacyItems)
            {
                if (existingCodes.Contains(legacy.Code)) continue;

                System.Text.Json.JsonElement root;
                try
                {
                    root = System.Text.Json.JsonDocument.Parse(legacy.JsonData).RootElement;
                }
                catch
                {
                    root = default;
                }
                var hasRoot = root.ValueKind == System.Text.Json.JsonValueKind.Object;

                decimal ReadDecimal(System.Text.Json.JsonElement obj, string key) =>
                    obj.ValueKind == System.Text.Json.JsonValueKind.Object && obj.TryGetProperty(key, out var v) && v.TryGetDecimal(out var d) ? d : 0m;
                string ReadString(System.Text.Json.JsonElement obj, string key, string fallback) =>
                    obj.ValueKind == System.Text.Json.JsonValueKind.Object && obj.TryGetProperty(key, out var v) && v.ValueKind == System.Text.Json.JsonValueKind.String ? (v.GetString() ?? fallback) : fallback;
                int ReadInt(System.Text.Json.JsonElement obj, string key, int fallback) =>
                    obj.ValueKind == System.Text.Json.JsonValueKind.Object && obj.TryGetProperty(key, out var v) && v.TryGetInt32(out var i) ? i : fallback;

                var rule = new StorageTariffRule
                {
                    Code = legacy.Code,
                    ShippingLineCode = hasRoot ? ReadString(root, "shippingLineCode", "ALL") : "ALL",
                    ShippingLineName = hasRoot ? ReadString(root, "shippingLineName", legacy.Name) : legacy.Name,
                    ContainerTypeCategory = hasRoot ? ReadString(root, "containerTypeCategory", "DRY_STANDARD") : "DRY_STANDARD",
                    DefaultFreeDays = hasRoot ? ReadInt(root, "freeDays", 0) : 0,
                    CalculationUnit = hasRoot ? ReadString(root, "calculationUnit", "VND/Cont/Day") : "VND/Cont/Day",
                    VatPercent = hasRoot && ReadDecimal(root, "vatPercent") != 0 ? ReadDecimal(root, "vatPercent") : 8,
                    Notes = legacy.Description,
                    IsActive = true,
                    SortOrder = legacy.SortOrder
                };

                if (hasRoot && root.TryGetProperty("tiers", out var tiersElement) && tiersElement.ValueKind == System.Text.Json.JsonValueKind.Array)
                {
                    var sortOrder = 0;
                    foreach (var tierEl in tiersElement.EnumerateArray())
                    {
                        sortOrder++;
                        int? toDay = tierEl.TryGetProperty("toDay", out var toDayEl) && toDayEl.ValueKind == System.Text.Json.JsonValueKind.Number ? toDayEl.GetInt32() : null;
                        rule.Tiers.Add(new StorageTariffTier
                        {
                            TierName = ReadString(tierEl, "tierName", $"Bậc {sortOrder}"),
                            FromDay = ReadInt(tierEl, "fromDay", 1),
                            ToDay = toDay,
                            Price20Dry = ReadDecimal(tierEl, "price20Dry"),
                            Price40Dry = ReadDecimal(tierEl, "price40Dry"),
                            Price45Dry = ReadDecimal(tierEl, "price45Dry"),
                            Price20Reefer = ReadDecimal(tierEl, "price20Reefer"),
                            Price40Reefer = ReadDecimal(tierEl, "price40Reefer"),
                            PriceSpecial = ReadDecimal(tierEl, "priceSpecial"),
                            SortOrder = sortOrder
                        });
                    }
                }
                // Không có mảng `tiers` trong JsonData (vd 3 quy tắc seed cũ chỉ có giá phẳng, không có
                // cấu trúc bậc — xem docs/backend-progress/23-master-data.md) → tạo đúng 1 bậc duy nhất
                // từ các field giá phẳng, khớp fallback mà `StorageTariffMaster.tsx` cũ đã dùng.
                else if (hasRoot)
                {
                    rule.Tiers.Add(new StorageTariffTier
                    {
                        TierName = "Biểu giá", FromDay = 1, ToDay = null,
                        Price20Dry = ReadDecimal(root, "price20Dry"), Price40Dry = ReadDecimal(root, "price40Dry"), Price45Dry = ReadDecimal(root, "price45Dry"),
                        Price20Reefer = ReadDecimal(root, "price20Reefer"), Price40Reefer = ReadDecimal(root, "price40Reefer"), PriceSpecial = ReadDecimal(root, "priceSpecial"),
                        SortOrder = 1
                    });
                }

                context.StorageTariffRules.Add(rule);
            }

            await context.SaveChangesAsync();
        }
    }
}
