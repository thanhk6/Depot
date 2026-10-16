using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Depot.Data.Entities.Finance;

namespace Depot.Data.Configurations
{
    public sealed class PaymentConfiguration : IEntityTypeConfiguration<Payment>
    {
        public void Configure(EntityTypeBuilder<Payment> builder)
        {
            builder.Property(x => x.DepotJobId).IsRequired();
            builder.HasIndex(x => x.DepotJobId).IsUnique();
            builder.Property(x => x.TransactionRef).HasMaxLength(100);
        }
    }

    public sealed class ServiceOrderConfiguration : IEntityTypeConfiguration<ServiceOrder>
    {
        public void Configure(EntityTypeBuilder<ServiceOrder> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.OrderNo).IsRequired().HasMaxLength(40);
            builder.Property(x => x.ContainerNo).IsRequired().HasMaxLength(15);
            builder.Property(x => x.PaymentMethod).HasMaxLength(30);
            builder.Property(x => x.TransactionId).HasMaxLength(100);
            builder.HasIndex(x => x.OrderNo).IsUnique();
            builder.HasIndex(x => x.DepotJobId).IsUnique();
            // ServiceOrder mang GrandTotal/PaymentStatus — cùng lý do với Payment/JobAuditLog ở
            // DepotJobConfiguration.cs, không được cascade-xoá hồ sơ tài chính theo DepotJob.
            builder.HasOne(x => x.DepotJob)
                .WithMany()
                .HasForeignKey(x => x.DepotJobId)
                .OnDelete(DeleteBehavior.Restrict);
            builder.HasMany(x => x.Items).WithOne(x => x.ServiceOrder).HasForeignKey(x => x.ServiceOrderId).OnDelete(DeleteBehavior.Cascade);
            builder.Property(x => x.Subtotal).HasPrecision(18, 2);
            builder.Property(x => x.TotalVat).HasPrecision(18, 2);
            builder.Property(x => x.GrandTotal).HasPrecision(18, 2);
        }
    }

    public sealed class ServiceOrderItemConfiguration : IEntityTypeConfiguration<ServiceOrderItem>
    {
        public void Configure(EntityTypeBuilder<ServiceOrderItem> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.ServiceCode).IsRequired().HasMaxLength(50);
            builder.Property(x => x.ServiceName).IsRequired().HasMaxLength(200);
            builder.Property(x => x.Quantity).HasPrecision(18, 2);
            builder.Property(x => x.UnitPrice).HasPrecision(18, 2);
            builder.Property(x => x.VatPercent).HasPrecision(18, 2);
            builder.Property(x => x.Amount).HasPrecision(18, 2);
            builder.Property(x => x.VatAmount).HasPrecision(18, 2);
            builder.Property(x => x.Total).HasPrecision(18, 2);
        }
    }
}
