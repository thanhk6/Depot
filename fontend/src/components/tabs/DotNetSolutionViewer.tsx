import React, { useState } from 'react';
import {
  Folder,
  FileCode,
  CheckCircle2,
  Server,
  Layers,
  Database,
  Code2,
  Copy,
  Terminal,
  Cpu,
  ShieldCheck,
  Box,
  Sliders,
  Search,
  BookOpen,
  FileText,
  AlertCircle
} from 'lucide-react';

interface FileNode {
  path: string;
  name: string;
  type: 'file' | 'folder';
  category: 'EF' | 'Configurations' | 'Entities' | 'Migrations' | 'Depot.Data.csproj';
  subcategory: 'EF' | 'Configurations' | 'Base' | 'System' | 'Master' | 'Depot' | 'Finance' | 'Inventory' | 'Yard' | 'Report' | 'Migrations' | 'Project';
  description: string;
  content: string;
}

export const DotNetSolutionViewer: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [selectedSubcategoryFilter, setSelectedSubcategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const depotDataFiles: FileNode[] = [
    // 0. Project File
    {
      path: 'Depot.Data/Depot.Data.csproj',
      name: 'Depot.Data.csproj',
      type: 'file',
      category: 'Depot.Data.csproj',
      subcategory: 'Project',
      description: 'Tập tin Project .NET 8.0 chỉ chứa EF Core 8 & SQL Server Provider. Không tham chiếu API, Service hay Web library.',
      content: `<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <GenerateDocumentationFile>true</GenerateDocumentationFile>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.EntityFrameworkCore" Version="8.0.2" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="8.0.2" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Tools" Version="8.0.2">
      <PrivateAssets>all</PrivateAssets>
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
    </PackageReference>
    <PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="8.0.2">
      <PrivateAssets>all</PrivateAssets>
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
    </PackageReference>
  </ItemGroup>

</Project>`
    },

    // ==========================================
    // 1. EF THƯ MỤC (EF/...)
    // ==========================================
    {
      path: 'Depot.Data/EF/DepotDbContext.cs',
      name: 'DepotDbContext.cs',
      type: 'file',
      category: 'EF',
      subcategory: 'EF',
      description: '1. EF/DepotDbContext.cs - Lớp DbContext chính khai báo DbSet cho 100+ Entity và ApplyConfigurationsFromAssembly(). Không chứa Business Logic.',
      content: `using Microsoft.EntityFrameworkCore;
using Depot.Data.Entities.System;
using Depot.Data.Entities.Master;
using Depot.Data.Entities.Depot;
using Depot.Data.Entities.Finance;
using Depot.Data.Entities.Inventory;
using Depot.Data.Entities.Yard;

namespace Depot.Data.EF
{
    /// <summary>
    /// DbContext chính quản lý kết nối SQL Server và các DbSet Entity trong Depot ERP.
    /// Không chứa Business Logic, API hay Service.
    /// </summary>
    public class DepotDbContext : DbContext
    {
        public DepotDbContext(DbContextOptions<DepotDbContext> options) : base(options) { }

        #region System DbSets
        public DbSet<Company> Companies => Set<Company>();
        public DbSet<SystemUser> SystemUsers => Set<SystemUser>();
        public DbSet<Role> Roles => Set<Role>();
        public DbSet<Permission> Permissions => Set<Permission>();
        public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
        #endregion

        #region Master DbSets
        public DbSet<ShippingLine> ShippingLines => Set<ShippingLine>();
        public DbSet<Customer> Customers => Set<Customer>();
        public DbSet<Container> Containers => Set<Container>();
        public DbSet<DamageCode> DamageCodes => Set<DamageCode>();
        public DbSet<RepairCode> RepairCodes => Set<RepairCode>();
        #endregion

        #region Depot Operations DbSets
        public DbSet<DepotJob> DepotJobs => Set<DepotJob>();
        public DbSet<Survey> Surveys => Set<Survey>();
        public DbSet<Estimate> Estimates => Set<Estimate>();
        public DbSet<RepairOrder> RepairOrders => Set<RepairOrder>();
        public DbSet<RepairQC> RepairQCs => Set<RepairQC>();
        #endregion

        #region Finance, Inventory & Yard DbSets
        public DbSet<Payment> Payments => Set<Payment>();
        public DbSet<Material> Materials => Set<Material>();
        public DbSet<YardPosition> YardPositions => Set<YardPosition>();
        #endregion

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Tự động load và áp dụng tất cả IEntityTypeConfiguration trong Assembly
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(DepotDbContext).Assembly);
        }
    }
}`
    },
    {
      path: 'Depot.Data/EF/DepotDbContextFactory.cs',
      name: 'DepotDbContextFactory.cs',
      type: 'file',
      category: 'EF',
      subcategory: 'EF',
      description: '1. EF/DepotDbContextFactory.cs - Lớp IDesignTimeDbContextFactory tạo DbContext khi thực thi dotnet ef migrations.',
      content: `using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Depot.Data.EF
{
    /// <summary>
    /// Design-time Factory hỗ trợ EF Core Tools sinh mã Migrations cho SQL Server.
    /// </summary>
    public class DepotDbContextFactory : IDesignTimeDbContextFactory<DepotDbContext>
    {
        public DepotDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<DepotDbContext>();
            var connectionString = "Server=localhost,1433;Database=DepotErpDb;User Id=sa;Password=YourPassword123!;TrustServerCertificate=True;";

            optionsBuilder.UseSqlServer(connectionString, b => b.MigrationsAssembly("Depot.Data"));
            return new DepotDbContext(optionsBuilder.Options);
        }
    }
}`
    },
    {
      path: 'Depot.Data/EF/DbInitializer.cs',
      name: 'DbInitializer.cs',
      type: 'file',
      category: 'EF',
      subcategory: 'EF',
      description: '1. EF/DbInitializer.cs - Lớp kiểm tra và tự động thực thi Migration khi hệ thống khởi động.',
      content: `using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace Depot.Data.EF
{
    /// <summary>
    /// Khởi tạo và kiểm tra trạng thái CSDL SQL Server khi ứng dụng khởi chạy.
    /// </summary>
    public static class DbInitializer
    {
        public static async Task InitializeAsync(DepotDbContext context)
        {
            // Tự động tạo/cập nhật bảng theo Migration mới nhất
            await context.Database.MigrateAsync();

            // Seed dữ liệu danh mục mặc định
            await DbSeeder.SeedAsync(context);
        }
    }
}`
    },
    {
      path: 'Depot.Data/EF/DbSeeder.cs',
      name: 'DbSeeder.cs',
      type: 'file',
      category: 'EF',
      subcategory: 'EF',
      description: '1. EF/DbSeeder.cs - Seed dữ liệu mặc định: Administrator, Permission, Role, Menu, Setting, Company.',
      content: `using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Depot.Data.Entities.System;

namespace Depot.Data.EF
{
    /// <summary>
    /// Nạp dữ liệu khởi tạo ban đầu cho hệ thống (Administrator, Roles, Permissions, Company).
    /// </summary>
    public static class DbSeeder
    {
        public static async Task SeedAsync(DepotDbContext context)
        {
            if (!await context.Companies.AnyAsync())
            {
                await context.Companies.AddAsync(new Company
                {
                    Code = "DEPOT-HCM",
                    Name = "Depot ICD Tân Cảng - Hồ Chí Minh",
                    TaxCode = "0301234567"
                });
            }

            if (!await context.Roles.AnyAsync())
            {
                await context.Roles.AddRangeAsync(
                    new Role { Name = "DEPOT_MANAGER", Description = "Quản lý tổng Depot ERP" },
                    new Role { Name = "IICL_SURVEYOR", Description = "Giám định viên IICL" },
                    new Role { Name = "GATE_OPERATOR", Description = "Khai thác Cổng Gate-In/Out" },
                    new Role { Name = "REPAIR_TECHNICIAN", Description = "Kỹ thuật viên sửa chữa" }
                );
            }

            await context.SaveChangesAsync();
        }
    }
}`
    },

    // ==========================================
    // 2. CONFIGURATIONS THƯ MỤC (Configurations/...)
    // ==========================================
    {
      path: 'Depot.Data/Configurations/CompanyConfiguration.cs',
      name: 'CompanyConfiguration.cs',
      type: 'file',
      category: 'Configurations',
      subcategory: 'Configurations',
      description: '2. Configurations/CompanyConfiguration.cs - Cấu hình Fluent API cho Entity Company (snake_case table name, indexes, max length).',
      content: `using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Depot.Data.Entities.System;

namespace Depot.Data.Configurations
{
    /// <summary>
    /// Cấu hình Fluent API cho Entity Company mapping bảng system_companies.
    /// </summary>
    public class CompanyConfiguration : IEntityTypeConfiguration<Company>
    {
        public void Configure(EntityTypeBuilder<Company> builder)
        {
            builder.ToTable("system_companies");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Code).IsRequired().HasMaxLength(20);
            builder.Property(x => x.Name).IsRequired().HasMaxLength(150);
            builder.Property(x => x.TaxCode).HasMaxLength(30);

            builder.HasIndex(x => x.Code).IsUnique();
        }
    }
}`
    },
    {
      path: 'Depot.Data/Configurations/SystemUserConfiguration.cs',
      name: 'SystemUserConfiguration.cs',
      type: 'file',
      category: 'Configurations',
      subcategory: 'Configurations',
      description: '2. Configurations/SystemUserConfiguration.cs - Cấu hình Fluent API cho Entity SystemUser.',
      content: `using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Depot.Data.Entities.System;

namespace Depot.Data.Configurations
{
    /// <summary>
    /// Cấu hình Fluent API cho Entity SystemUser mapping bảng system_users.
    /// </summary>
    public class SystemUserConfiguration : IEntityTypeConfiguration<SystemUser>
    {
        public void Configure(EntityTypeBuilder<SystemUser> builder)
        {
            builder.ToTable("system_users");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Username).IsRequired().HasMaxLength(50);
            builder.Property(x => x.FullName).IsRequired().HasMaxLength(100);
            builder.Property(x => x.Email).HasMaxLength(100);

            builder.HasIndex(x => x.Username).IsUnique();
        }
    }
}`
    },
    {
      path: 'Depot.Data/Configurations/RoleConfiguration.cs',
      name: 'RoleConfiguration.cs',
      type: 'file',
      category: 'Configurations',
      subcategory: 'Configurations',
      description: '2. Configurations/RoleConfiguration.cs - Cấu hình Fluent API cho Entity Role.',
      content: `using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Depot.Data.Entities.System;

namespace Depot.Data.Configurations
{
    /// <summary>
    /// Cấu hình Fluent API cho Entity Role mapping bảng system_roles.
    /// </summary>
    public class RoleConfiguration : IEntityTypeConfiguration<Role>
    {
        public void Configure(EntityTypeBuilder<Role> builder)
        {
            builder.ToTable("system_roles");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Name).IsRequired().HasMaxLength(50);
            builder.Property(x => x.Description).HasMaxLength(250);

            builder.HasIndex(x => x.Name).IsUnique();
        }
    }
}`
    },
    {
      path: 'Depot.Data/Configurations/ContainerConfiguration.cs',
      name: 'ContainerConfiguration.cs',
      type: 'file',
      category: 'Configurations',
      subcategory: 'Configurations',
      description: '2. Configurations/ContainerConfiguration.cs - Cấu hình Fluent API cho Entity Container.',
      content: `using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Depot.Data.Entities.Master;

namespace Depot.Data.Configurations
{
    /// <summary>
    /// Cấu hình Fluent API cho Entity Container mapping bảng master_containers.
    /// </summary>
    public class ContainerConfiguration : IEntityTypeConfiguration<Container>
    {
        public void Configure(EntityTypeBuilder<Container> builder)
        {
            builder.ToTable("master_containers");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.ContainerNo).IsRequired().HasMaxLength(15);
            builder.Property(x => x.IsoSize).HasMaxLength(10).HasDefaultValue("40HC");

            builder.HasIndex(x => x.ContainerNo).IsUnique();
        }
    }
}`
    },
    {
      path: 'Depot.Data/Configurations/DepotJobConfiguration.cs',
      name: 'DepotJobConfiguration.cs',
      type: 'file',
      category: 'Configurations',
      subcategory: 'Configurations',
      description: '2. Configurations/DepotJobConfiguration.cs - Cấu hình Fluent API cho Entity DepotJob.',
      content: `using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Depot.Data.Entities.Depot;

namespace Depot.Data.Configurations
{
    /// <summary>
    /// Cấu hình Fluent API cho Entity DepotJob mapping bảng depot_jobs.
    /// </summary>
    public class DepotJobConfiguration : IEntityTypeConfiguration<DepotJob>
    {
        public void Configure(EntityTypeBuilder<DepotJob> builder)
        {
            builder.ToTable("depot_jobs");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.JobNo).IsRequired().HasMaxLength(30);
            builder.Property(x => x.ContainerNo).IsRequired().HasMaxLength(15);
            builder.Property(x => x.IsoSize).HasMaxLength(10).HasDefaultValue("40HC");
            builder.Property(x => x.ShippingLineCode).HasMaxLength(20);
            builder.Property(x => x.Status).HasMaxLength(50).IsRequired();

            builder.HasIndex(x => x.JobNo).IsUnique();
            builder.HasIndex(x => x.ContainerNo);
            builder.HasIndex(x => x.Status);
        }
    }
}`
    },
    {
      path: 'Depot.Data/Configurations/SurveyConfiguration.cs',
      name: 'SurveyConfiguration.cs',
      type: 'file',
      category: 'Configurations',
      subcategory: 'Configurations',
      description: '2. Configurations/SurveyConfiguration.cs - Cấu hình Fluent API cho Entity Survey.',
      content: `using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Depot.Data.Entities.Depot;

namespace Depot.Data.Configurations
{
    /// <summary>
    /// Cấu hình Fluent API cho Entity Survey mapping bảng depot_surveys.
    /// </summary>
    public class SurveyConfiguration : IEntityTypeConfiguration<Survey>
    {
        public void Configure(EntityTypeBuilder<Survey> builder)
        {
            builder.ToTable("depot_surveys");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.SurveyorName).HasMaxLength(100);
            builder.Property(x => x.ConditionGrade).HasMaxLength(10);
            builder.Property(x => x.Notes).HasMaxLength(500);

            builder.HasOne(x => x.DepotJob)
                   .WithOne(j => j.Survey)
                   .HasForeignKey<Survey>(x => x.DepotJobId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}`
    },
    {
      path: 'Depot.Data/Configurations/EstimateConfiguration.cs',
      name: 'EstimateConfiguration.cs',
      type: 'file',
      category: 'Configurations',
      subcategory: 'Configurations',
      description: '2. Configurations/EstimateConfiguration.cs - Cấu hình Fluent API cho Entity Estimate.',
      content: `using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Depot.Data.Entities.Depot;

namespace Depot.Data.Configurations
{
    /// <summary>
    /// Cấu hình Fluent API cho Entity Estimate mapping bảng depot_estimates.
    /// </summary>
    public class EstimateConfiguration : IEntityTypeConfiguration<Estimate>
    {
        public void Configure(EntityTypeBuilder<Estimate> builder)
        {
            builder.ToTable("depot_estimates");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.EstimateNo).IsRequired().HasMaxLength(30);
            builder.Property(x => x.TotalAmountUsd).HasPrecision(18, 2);
            builder.Property(x => x.TotalAmountVnd).HasPrecision(18, 2);

            builder.HasIndex(x => x.EstimateNo).IsUnique();
        }
    }
}`
    },
    {
      path: 'Depot.Data/Configurations/RepairOrderConfiguration.cs',
      name: 'RepairOrderConfiguration.cs',
      type: 'file',
      category: 'Configurations',
      subcategory: 'Configurations',
      description: '2. Configurations/RepairOrderConfiguration.cs - Cấu hình Fluent API cho Entity RepairOrder.',
      content: `using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Depot.Data.Entities.Depot;

namespace Depot.Data.Configurations
{
    /// <summary>
    /// Cấu hình Fluent API cho Entity RepairOrder mapping bảng depot_repair_orders.
    /// </summary>
    public class RepairOrderConfiguration : IEntityTypeConfiguration<RepairOrder>
    {
        public void Configure(EntityTypeBuilder<RepairOrder> builder)
        {
            builder.ToTable("depot_repair_orders");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.WorkOrderNo).IsRequired().HasMaxLength(30);
            builder.Property(x => x.TechnicianName).HasMaxLength(100);

            builder.HasIndex(x => x.WorkOrderNo).IsUnique();
        }
    }
}`
    },
    {
      path: 'Depot.Data/Configurations/PaymentConfiguration.cs',
      name: 'PaymentConfiguration.cs',
      type: 'file',
      category: 'Configurations',
      subcategory: 'Configurations',
      description: '2. Configurations/PaymentConfiguration.cs - Cấu hình Fluent API cho Entity Payment.',
      content: `using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Depot.Data.Entities.Finance;

namespace Depot.Data.Configurations
{
    /// <summary>
    /// Cấu hình Fluent API cho Entity Payment mapping bảng finance_payments.
    /// </summary>
    public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
    {
        public void Configure(EntityTypeBuilder<Payment> builder)
        {
            builder.ToTable("finance_payments");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.TransactionRef).IsRequired().HasMaxLength(50);
            builder.Property(x => x.AmountVnd).HasPrecision(18, 2);
            builder.Property(x => x.Method).HasMaxLength(20).HasDefaultValue("VIETQR");

            builder.HasIndex(x => x.TransactionRef).IsUnique();
        }
    }
}`
    },

    // ==========================================
    // 3. ENTITIES THƯ MỤC (Entities/...)
    // ==========================================
    // Entities/Base
    {
      path: 'Depot.Data/Entities/Base/FullAuditedEntity.cs',
      name: 'FullAuditedEntity.cs',
      type: 'file',
      category: 'Entities',
      subcategory: 'Base',
      description: '3. Entities/Base/FullAuditedEntity.cs - Lớp Base Entity hỗ trợ Audit đầy đủ (CreatedAt, CreatedBy, SoftDelete).',
      content: `using System;

namespace Depot.Data.Entities.Base
{
    /// <summary>
    /// Class Base trừu tượng lưu vết Audit và xóa mềm Soft Delete cho toàn bộ Entity CSDL.
    /// </summary>
    public abstract class FullAuditedEntity<TKey>
    {
        /// <summary>Khóa chính Primary Key</summary>
        public TKey Id { get; set; } = default!;

        /// <summary>Thời điểm khởi tạo record</summary>
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>Tài khoản khởi tạo</summary>
        public string? CreatedBy { get; set; }

        /// <summary>Thời điểm chỉnh sửa gần nhất</summary>
        public DateTime? LastModifiedAt { get; set; }

        /// <summary>Tài khoản chỉnh sửa gần nhất</summary>
        public string? LastModifiedBy { get; set; }

        /// <summary>Cờ Soft Delete đánh dấu đã xóa mềm</summary>
        public bool IsDeleted { get; set; } = false;

        /// <summary>Thời điểm xóa</summary>
        public DateTime? DeletedAt { get; set; }

        /// <summary>Tài khoản xóa</summary>
        public string? DeletedBy { get; set; }
    }
}`
    },

    // Entities/System
    {
      path: 'Depot.Data/Entities/System/Company.cs',
      name: 'Company.cs',
      type: 'file',
      category: 'Entities',
      subcategory: 'System',
      description: '3. Entities/System/Company.cs - POCO Entity Công ty / Chi nhánh Depot ERP.',
      content: `using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.System
{
    /// <summary>
    /// POCO Entity đại diện cho Công ty / Chi nhánh trong hệ thống Depot ERP.
    /// </summary>
    public class Company : FullAuditedEntity<int>
    {
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string TaxCode { get; set; } = string.Empty;
        public string? Address { get; set; }
        public string? Phone { get; set; }
    }
}`
    },
    {
      path: 'Depot.Data/Entities/System/SystemUser.cs',
      name: 'SystemUser.cs',
      type: 'file',
      category: 'Entities',
      subcategory: 'System',
      description: '3. Entities/System/SystemUser.cs - POCO Entity Tài khoản Người dùng Hệ thống.',
      content: `using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.System
{
    /// <summary>
    /// POCO Entity Tài khoản Người dùng nội bộ.
    /// </summary>
    public class SystemUser : FullAuditedEntity<Guid>
    {
        public string Username { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
    }
}`
    },

    // Entities/Master
    {
      path: 'Depot.Data/Entities/Master/ShippingLine.cs',
      name: 'ShippingLine.cs',
      type: 'file',
      category: 'Entities',
      subcategory: 'Master',
      description: '3. Entities/Master/ShippingLine.cs - POCO Entity Hãng tàu đối tác (Maersk, Cosco, MSC, Evergreen...).',
      content: `using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.Master
{
    /// <summary>
    /// POCO Entity Danh mục Hãng tàu.
    /// </summary>
    public class ShippingLine : FullAuditedEntity<int>
    {
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string TariffCode { get; set; } = "STANDARD_2026";
        public bool IsActive { get; set; } = true;
    }
}`
    },
    {
      path: 'Depot.Data/Entities/Master/Container.cs',
      name: 'Container.cs',
      type: 'file',
      category: 'Entities',
      subcategory: 'Master',
      description: '3. Entities/Master/Container.cs - POCO Entity Container.',
      content: `using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.Master
{
    /// <summary>
    /// POCO Entity Container thuộc danh mục Master Data.
    /// </summary>
    public class Container : FullAuditedEntity<Guid>
    {
        public string ContainerNo { get; set; } = string.Empty;
        public string IsoSize { get; set; } = "40HC";
        public string OwnerShippingLine { get; set; } = string.Empty;
    }
}`
    },

    // Entities/Depot
    {
      path: 'Depot.Data/Entities/Depot/DepotJob.cs',
      name: 'DepotJob.cs',
      type: 'file',
      category: 'Entities',
      subcategory: 'Depot',
      description: '3. Entities/Depot/DepotJob.cs - POCO Entity Lệnh Khai Thác Container (Gate-In, Giám định, Báo giá, Sửa chữa).',
      content: `using System;
using Depot.Data.Entities.Base;
using Depot.Data.Entities.Finance;

namespace Depot.Data.Entities.Depot
{
    /// <summary>
    /// POCO Entity Lệnh Khai thác Container (DepotJob) chính của quy trình Depot.
    /// </summary>
    public class DepotJob : FullAuditedEntity<Guid>
    {
        public string JobNo { get; set; } = string.Empty;
        public string ContainerNo { get; set; } = string.Empty;
        public string IsoSize { get; set; } = "40HC";
        public string ShippingLineCode { get; set; } = string.Empty;
        public string Status { get; set; } = "GATE_IN";
        public DateTime GateInDate { get; set; } = DateTime.UtcNow;

        // Vị trí đảo bãi
        public string? BlockCode { get; set; }
        public int Bay { get; set; } = 1;
        public int Row { get; set; } = 1;
        public int Tier { get; set; } = 1;

        // Navigation Properties
        public virtual Survey? Survey { get; set; }
        public virtual Estimate? Estimate { get; set; }
        public virtual RepairOrder? RepairOrder { get; set; }
        public virtual Payment? Payment { get; set; }
    }
}`
    },
    {
      path: 'Depot.Data/Entities/Depot/Survey.cs',
      name: 'Survey.cs',
      type: 'file',
      category: 'Entities',
      subcategory: 'Depot',
      description: '3. Entities/Depot/Survey.cs - POCO Entity Giám Định IICL Container.',
      content: `using System;
using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.Depot
{
    /// <summary>
    /// POCO Entity Kết quả Giám định IICL Container.
    /// </summary>
    public class Survey : FullAuditedEntity<Guid>
    {
        public Guid DepotJobId { get; set; }
        public string SurveyorName { get; set; } = string.Empty;
        public string ConditionGrade { get; set; } = "A";
        public bool NeedsRepair { get; set; } = false;
        public string? Notes { get; set; }

        public virtual DepotJob? DepotJob { get; set; }
    }
}`
    },
    {
      path: 'Depot.Data/Entities/Depot/Estimate.cs',
      name: 'Estimate.cs',
      type: 'file',
      category: 'Entities',
      subcategory: 'Depot',
      description: '3. Entities/Depot/Estimate.cs - POCO Entity Báo Giá Sửa Chữa Hãng Tàu.',
      content: `using System;
using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.Depot
{
    /// <summary>
    /// POCO Entity Báo giá Sửa chữa Container gửi Hãng tàu duyệt.
    /// </summary>
    public class Estimate : FullAuditedEntity<Guid>
    {
        public Guid DepotJobId { get; set; }
        public string EstimateNo { get; set; } = string.Empty;
        public decimal TotalAmountUsd { get; set; }
        public decimal TotalAmountVnd { get; set; }
        public string Status { get; set; } = "PENDING_APPROVAL";

        public virtual DepotJob? DepotJob { get; set; }
    }
}`
    },
    {
      path: 'Depot.Data/Entities/Depot/RepairOrder.cs',
      name: 'RepairOrder.cs',
      type: 'file',
      category: 'Entities',
      subcategory: 'Depot',
      description: '3. Entities/Depot/RepairOrder.cs - POCO Entity Lệnh Sửa Chữa Work Order.',
      content: `using System;
using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.Depot
{
    /// <summary>
    /// POCO Entity Lệnh thi công sửa chữa Work Order.
    /// </summary>
    public class RepairOrder : FullAuditedEntity<Guid>
    {
        public Guid DepotJobId { get; set; }
        public string WorkOrderNo { get; set; } = string.Empty;
        public string TechnicianName { get; set; } = string.Empty;
        public bool IsQcApproved { get; set; } = false;

        public virtual DepotJob? DepotJob { get; set; }
    }
}`
    },

    // Entities/Finance
    {
      path: 'Depot.Data/Entities/Finance/Payment.cs',
      name: 'Payment.cs',
      type: 'file',
      category: 'Entities',
      subcategory: 'Finance',
      description: '3. Entities/Finance/Payment.cs - POCO Entity Thanh Toán & Gạch Nợ VietQR.',
      content: `using System;
using Depot.Data.Entities.Base;
using Depot.Data.Entities.Depot;

namespace Depot.Data.Entities.Finance
{
    /// <summary>
    /// POCO Entity Giao dịch Thanh toán VietQR / Tiền mặt.
    /// </summary>
    public class Payment : FullAuditedEntity<Guid>
    {
        public Guid DepotJobId { get; set; }
        public string TransactionRef { get; set; } = string.Empty;
        public decimal AmountVnd { get; set; }
        public string Method { get; set; } = "VIETQR";
        public bool IsSuccess { get; set; } = true;

        public virtual DepotJob? DepotJob { get; set; }
    }
}`
    },

    // Entities/Inventory
    {
      path: 'Depot.Data/Entities/Inventory/Material.cs',
      name: 'Material.cs',
      type: 'file',
      category: 'Entities',
      subcategory: 'Inventory',
      description: '3. Entities/Inventory/Material.cs - POCO Entity Vật Tư Kho Depot.',
      content: `using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.Inventory
{
    /// <summary>
    /// POCO Entity Vật tư sửa chữa Container trong Kho.
    /// </summary>
    public class Material : FullAuditedEntity<int>
    {
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Unit { get; set; } = "Tấm";
        public decimal StockQuantity { get; set; }
    }
}`
    },

    // Entities/Yard
    {
      path: 'Depot.Data/Entities/Yard/YardPosition.cs',
      name: 'YardPosition.cs',
      type: 'file',
      category: 'Entities',
      subcategory: 'Yard',
      description: '3. Entities/Yard/YardPosition.cs - POCO Entity Tọa Độ Vị Trí Bãi Container.',
      content: `using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.Yard
{
    /// <summary>
    /// POCO Entity Tọa độ bãi (Block, Bay, Row, Tier).
    /// </summary>
    public class YardPosition : FullAuditedEntity<long>
    {
        public string BlockCode { get; set; } = "BLOCK_A";
        public int Bay { get; set; } = 1;
        public int Row { get; set; } = 1;
        public int Tier { get; set; } = 1;
        public bool IsOccupied { get; set; } = false;
        public string? CurrentContainerNo { get; set; }
    }
}`
    },

    // ==========================================
    // 4. MIGRATIONS THƯ MỤC (Migrations/...)
    // ==========================================
    {
      path: 'Depot.Data/Migrations/20260804000000_InitialCreate.cs',
      name: '20260804000000_InitialCreate.cs',
      type: 'file',
      category: 'Migrations',
      subcategory: 'Migrations',
      description: '4. Migrations/InitialCreate.cs - Migration sinh tự động tạo các bảng CSDL SQL Server.',
      content: `using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Depot.Data.Migrations
{
    /// <summary>
    /// File Migration khởi tạo CSDL SQL Server ban đầu.
    /// </summary>
    public partial class InitialCreate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "system_companies",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    code = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    tax_code = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_system_companies", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "depot_jobs",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    job_no = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    container_no = table.Column<string>(type: "nvarchar(15)", maxLength: 15, nullable: false),
                    iso_size = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false, defaultValue: "40HC"),
                    status = table.Column<string>(type: "nvarchar(50)", nullable: false),
                    gate_in_date = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_depot_jobs", x => x.id);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "depot_jobs");
            migrationBuilder.DropTable(name: "system_companies");
        }
    }
}`
    },
    {
      path: 'Depot.Data/Migrations/DepotDbContextModelSnapshot.cs',
      name: 'DepotDbContextModelSnapshot.cs',
      type: 'file',
      category: 'Migrations',
      subcategory: 'Migrations',
      description: '4. Migrations/DepotDbContextModelSnapshot.cs - EF Core Model Snapshot theo dõi cấu trúc CSDL.',
      content: `using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Depot.Data.EF;

#nullable disable

namespace Depot.Data.Migrations
{
    [DbContext(typeof(DepotDbContext))]
    partial class DepotDbContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "8.0.2")
                .HasAnnotation("Relational:MaxIdentifierLength", 128);

            SqlServerModelBuilderExtensions.UseIdentityColumns(modelBuilder);
#pragma warning restore 612, 618
        }
    }
}`
    }
  ];

  const [selectedFile, setSelectedFile] = useState<FileNode>(depotDataFiles[1]);

  const filteredFiles = depotDataFiles.filter((file) => {
    const matchesCategory =
      selectedCategoryFilter === 'ALL' || file.category === selectedCategoryFilter;
    const matchesSubcategory =
      selectedSubcategoryFilter === 'ALL' || file.subcategory === selectedSubcategoryFilter;
    const matchesSearch =
      searchQuery === '' ||
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSubcategory && matchesSearch;
  });

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderCodeWithLineNumbers = (code: string) => {
    const lines = code.split('\n');
    return (
      <div className="font-mono text-xs leading-relaxed select-text min-w-full">
        {lines.map((line, idx) => (
          <div key={idx} className="flex hover:bg-slate-800/50 px-2 py-0.5 rounded transition-colors group">
            <span className="w-10 shrink-0 text-right pr-4 text-slate-600 select-none font-mono text-[11px] group-hover:text-purple-400">
              {idx + 1}
            </span>
            <span className="whitespace-pre text-slate-200 font-mono flex-1">
              {line}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" /> .NET 8.0 ERP Architecture
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                Project Depot.Data
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                EF Core 8 + SQL Server
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Thiết Kế Chuẩn Project Depot.Data (.NET 8 Clean Architecture)
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Project <strong className="text-purple-300">Depot.Data</strong> được thiết kế theo đúng 4 thư mục chuẩn: <strong className="text-white">EF</strong>, <strong className="text-white">Configurations</strong>, <strong className="text-white">Entities</strong>, <strong className="text-white">Migrations</strong>. <span className="text-rose-400 font-bold">Tất cả Business Logic, API, Service hoàn toàn KHÔNG tồn tại trong Depot.Data.</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-rose-950/80 text-rose-300 border border-rose-800 rounded-xl text-xs font-bold flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" /> Zero Business Logic
            </span>
          </div>
        </div>

        {/* Four Standard Folders Requirement Display */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800">
          <div
            onClick={() => {
              setSelectedCategoryFilter('EF');
              setSelectedSubcategoryFilter('ALL');
            }}
            className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 hover:border-purple-500/50 transition cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-purple-400 group-hover:text-purple-300 flex items-center gap-1.5">
                <Database className="w-4 h-4" /> 1. EF
              </span>
              <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-800 px-1.5 py-0.5 rounded font-mono">
                4 Files
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              DepotDbContext, DepotDbContextFactory, DbInitializer, DbSeeder.
            </p>
          </div>

          <div
            onClick={() => {
              setSelectedCategoryFilter('Configurations');
              setSelectedSubcategoryFilter('ALL');
            }}
            className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-blue-400 group-hover:text-blue-300 flex items-center gap-1.5">
                <Sliders className="w-4 h-4" /> 2. Configurations
              </span>
              <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-800 px-1.5 py-0.5 rounded font-mono">
                Fluent API
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Chỉ chứa IEntityTypeConfiguration&lt;T&gt;. Mỗi Entity đúng 1 file Configuration riêng.
            </p>
          </div>

          <div
            onClick={() => {
              setSelectedCategoryFilter('Entities');
              setSelectedSubcategoryFilter('ALL');
            }}
            className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 hover:border-emerald-500/50 transition cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-emerald-400 group-hover:text-emerald-300 flex items-center gap-1.5">
                <Box className="w-4 h-4" /> 3. Entities
              </span>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded font-mono">
                POCO ONLY
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              8 Thư mục con: Base, System, Master, Depot, Finance, Inventory, Yard, Report.
            </p>
          </div>

          <div
            onClick={() => {
              setSelectedCategoryFilter('Migrations');
              setSelectedSubcategoryFilter('ALL');
            }}
            className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 hover:border-amber-500/50 transition cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-amber-400 group-hover:text-amber-300 flex items-center gap-1.5">
                <Layers className="w-4 h-4" /> 4. Migrations
              </span>
              <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800 px-1.5 py-0.5 rounded font-mono">
                SQL Server
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Chỉ chứa Migration files & ModelSnapshot của EF Core 8.
            </p>
          </div>
        </div>
      </div>

      {/* Explorer Split View */}
      <div id="solution-tree" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Tree Explorer */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 font-bold text-slate-200 text-sm">
              <Folder className="w-4 h-4 text-purple-400" /> Depot.Data Structure
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {filteredFiles.length} File(s)
            </span>
          </div>

          {/* Search Box */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Tìm file trong Depot.Data..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin">
              {['ALL', 'EF', 'Configurations', 'Entities', 'Migrations', 'Depot.Data.csproj'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategoryFilter(cat);
                    setSelectedSubcategoryFilter('ALL');
                  }}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition cursor-pointer ${
                    selectedCategoryFilter === cat
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {cat === 'ALL' ? 'Tất cả' : cat}
                </button>
              ))}
            </div>

            {/* Subcategory Pills for Entities */}
            {selectedCategoryFilter === 'Entities' && (
              <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin pt-1">
                {['ALL', 'Base', 'System', 'Master', 'Depot', 'Finance', 'Inventory', 'Yard'].map((subcat) => (
                  <button
                    key={subcat}
                    onClick={() => setSelectedSubcategoryFilter(subcat)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold whitespace-nowrap transition cursor-pointer ${
                      selectedSubcategoryFilter === subcat
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-950 text-emerald-400 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {subcat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* File Tree List */}
          <div className="space-y-1.5 font-mono text-xs max-h-[420px] overflow-y-auto scrollbar-thin pr-1">
            {filteredFiles.map((file) => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-3 py-2.5 rounded-2xl flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-purple-600/20 text-purple-200 border border-purple-500/40 font-bold'
                      : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode className={`w-4 h-4 shrink-0 ${isSelected ? 'text-purple-400' : 'text-slate-500'}`} />
                    <span className="truncate">{file.name}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-lg text-[10px] bg-slate-950 text-slate-400 border border-slate-800 shrink-0">
                    {file.subcategory}
                  </span>
                </button>
              );
            })}

            {filteredFiles.length === 0 && (
              <div className="text-center py-6 text-slate-500 text-xs">
                Không tìm thấy file khớp bộ lọc
              </div>
            )}
          </div>

          {/* EF Core CLI Box */}
          <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-400 space-y-2">
            <div className="flex items-center justify-between text-purple-300 font-semibold">
              <span className="flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5" /> Lệnh EF Core CLI</span>
              <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded font-mono">
                SQL Server
              </span>
            </div>
            <div className="bg-slate-900 p-2 rounded-xl font-mono text-[11px] text-emerald-400 select-all border border-slate-800">
              dotnet ef migrations add InitialCreate --project Depot.Data
            </div>
            <div className="bg-slate-900 p-2 rounded-xl font-mono text-[11px] text-emerald-400 select-all border border-slate-800">
              dotnet ef database update --project Depot.Data
            </div>
          </div>
        </div>

        {/* Right Code Viewer */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-purple-400">{selectedFile.path}</span>
                  <span className="px-2 py-0.5 bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-bold rounded-lg">
                    {selectedFile.category}
                  </span>
                </div>
                <div className="text-sm font-bold text-white mt-0.5">{selectedFile.name}</div>
              </div>

              <button
                onClick={() => copyCode(selectedFile.content)}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Đã chép' : 'Sao chép C#'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-300 bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80 mb-3 leading-relaxed">
              {selectedFile.description}
            </p>

            <div className="relative">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 max-h-[500px] overflow-x-auto overflow-y-auto scrollbar-thin">
                {renderCodeWithLineNumbers(selectedFile.content)}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Fluent API Mapping + Nullable Types Enabled
            </span>
            <span className="text-slate-500 font-mono">Depot.Data Namespace</span>
          </div>
        </div>
      </div>
    </div>
  );
};
