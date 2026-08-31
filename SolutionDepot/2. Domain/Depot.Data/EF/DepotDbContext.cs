using Microsoft.EntityFrameworkCore;
using Depot.Data.Entities.System;
using Depot.Data.Entities.Master;
using Depot.Data.Entities.Depot;
using Depot.Data.Entities.Finance;
using Depot.Data.Entities.Inventory;
using Depot.Data.Entities.Yard;
using Depot.Data.Entities.Integration;
using Depot.Data.Entities.Cleaning;

namespace Depot.Data.EF
{
    /// <summary>
    /// DbContext chính quản lý kết nối cơ sở dữ liệu và các DbSet Entity trong Depot ERP.
    /// Không chứa Business Logic, API hay Service.
    /// </summary>
    public class DepotDbContext : DbContext
    {
        public DepotDbContext(DbContextOptions<DepotDbContext> options) : base(options) { }

        #region System DbSets
        public DbSet<Company> Companies => Set<Company>();
        public DbSet<SystemUser> SystemUsers => Set<SystemUser>();
        public DbSet<SystemUser> Users => Set<SystemUser>();
        public DbSet<Role> Roles => Set<Role>();
        public DbSet<JobAuditLog> AuditLogs => Set<JobAuditLog>();
        public DbSet<SystemAuditLog> SystemAuditLogs => Set<SystemAuditLog>();
        public DbSet<SystemSecurityPolicy> SystemSecurityPolicies => Set<SystemSecurityPolicy>();
        #endregion

        #region Master DbSets
        public DbSet<ShippingLine> ShippingLines => Set<ShippingLine>();
        public DbSet<CustomerCompany> CustomerCompanies => Set<CustomerCompany>();
        public DbSet<CustomerDriver> CustomerDrivers => Set<CustomerDriver>();
        public DbSet<CustomerVehicle> CustomerVehicles => Set<CustomerVehicle>();
        public DbSet<CustomerPortalUser> CustomerPortalUsers => Set<CustomerPortalUser>();
        public DbSet<CustomerBooking> CustomerBookings => Set<CustomerBooking>();
        public DbSet<MasterCatalogItem> MasterCatalogItems => Set<MasterCatalogItem>();
        public DbSet<ServiceTariff> ServiceTariffs => Set<ServiceTariff>();
        public DbSet<StorageTariffRule> StorageTariffRules => Set<StorageTariffRule>();
        public DbSet<Container> Containers => Set<Container>();
        #endregion

        #region Depot Operations DbSets
        public DbSet<DepotJob> DepotJobs => Set<DepotJob>();
        public DbSet<Survey> Surveys => Set<Survey>();
        public DbSet<Estimate> Estimates => Set<Estimate>();
        public DbSet<RepairOrder> RepairOrders => Set<RepairOrder>();
        #endregion

        #region Finance, Inventory & Yard DbSets
        public DbSet<Payment> Payments => Set<Payment>();
        public DbSet<ShippingLineDebt> ShippingLineDebts => Set<ShippingLineDebt>();
        public DbSet<DebtPeriod> DebtPeriods => Set<DebtPeriod>();
        public DbSet<ArPayment> ArPayments => Set<ArPayment>();
        public DbSet<PaymentAllocation> PaymentAllocations => Set<PaymentAllocation>();
        public DbSet<ServiceOrder> ServiceOrders => Set<ServiceOrder>();
        public DbSet<ServiceOrderItem> ServiceOrderItems => Set<ServiceOrderItem>();
        public DbSet<Material> Materials => Set<Material>();
        public DbSet<MaterialStockTransaction> MaterialStockTransactions => Set<MaterialStockTransaction>();
        public DbSet<MaterialGroup> MaterialGroups => Set<MaterialGroup>();
        public DbSet<Supplier> Suppliers => Set<Supplier>();
        public DbSet<YardPosition> YardPositions => Set<YardPosition>();
        public DbSet<YardZone> YardZones => Set<YardZone>();
        public DbSet<YardBlockLayout> YardBlockLayouts => Set<YardBlockLayout>();
        public DbSet<Forklift> Forklifts => Set<Forklift>();
        public DbSet<ForkliftDispatch> ForkliftDispatches => Set<ForkliftDispatch>();
        public DbSet<YardMoveHistory> YardMoveHistories => Set<YardMoveHistory>();
        public DbSet<YardGateLane> YardGateLanes => Set<YardGateLane>();
        public DbSet<ShippingSyncLog> ShippingSyncLogs => Set<ShippingSyncLog>();
        public DbSet<NotificationRecord> NotificationRecords => Set<NotificationRecord>();
        public DbSet<NotificationTemplate> NotificationTemplates => Set<NotificationTemplate>();
        public DbSet<EmployeeNotificationSubscription> EmployeeNotificationSubscriptions => Set<EmployeeNotificationSubscription>();
        public DbSet<CustomerNotificationPreference> CustomerNotificationPreferences => Set<CustomerNotificationPreference>();
        #endregion

        #region Cleaning DbSets
        public DbSet<CleaningRecord> CleaningRecords => Set<CleaningRecord>();
        #endregion

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(DepotDbContext).Assembly);

            // Explicit SQL precision prevents silent rounding of costs, rates and quantities.
            modelBuilder.Entity<DamageItem>().Property(x => x.Quantity).HasPrecision(18, 2);
            modelBuilder.Entity<DamageItem>().Property(x => x.LaborHours).HasPrecision(18, 2);
            modelBuilder.Entity<DamageItem>().Property(x => x.LaborRate).HasPrecision(18, 2);
            modelBuilder.Entity<DamageItem>().Property(x => x.MaterialCost).HasPrecision(18, 2);
            modelBuilder.Entity<DamageItem>().Property(x => x.TotalCost).HasPrecision(18, 2);
            modelBuilder.Entity<SurveyCleaningItem>().Property(x => x.Quantity).HasPrecision(18, 2);
            modelBuilder.Entity<SurveyCleaningItem>().Property(x => x.UnitPrice).HasPrecision(18, 2);
            modelBuilder.Entity<SurveyCleaningItem>().Property(x => x.TotalPrice).HasPrecision(18, 2);
            modelBuilder.Entity<Estimate>().Property(x => x.TotalLaborCost).HasPrecision(18, 2);
            modelBuilder.Entity<Estimate>().Property(x => x.TotalMaterialCost).HasPrecision(18, 2);
            modelBuilder.Entity<Estimate>().Property(x => x.TotalTax).HasPrecision(18, 2);
            modelBuilder.Entity<Estimate>().Property(x => x.GrandTotal).HasPrecision(18, 2);
            modelBuilder.Entity<EstimateItem>().Property(x => x.Quantity).HasPrecision(18, 2);
            modelBuilder.Entity<EstimateItem>().Property(x => x.UnitPrice).HasPrecision(18, 2);
            modelBuilder.Entity<EstimateItem>().Property(x => x.Amount).HasPrecision(18, 2);
            modelBuilder.Entity<Payment>().Property(x => x.Amount).HasPrecision(18, 2);
            modelBuilder.Entity<Payment>().Property(x => x.Tax).HasPrecision(18, 2);
            modelBuilder.Entity<Payment>().Property(x => x.TotalAmount).HasPrecision(18, 2);
            modelBuilder.Entity<Material>().Property(x => x.UnitPrice).HasPrecision(18, 2);
        }
    }
}
