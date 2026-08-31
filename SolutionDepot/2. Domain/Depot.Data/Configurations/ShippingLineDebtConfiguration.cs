using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Depot.Data.Entities.Finance;

namespace Depot.Data.Configurations
{
    public sealed class ShippingLineDebtConfiguration : IEntityTypeConfiguration<ShippingLineDebt>
    {
        public void Configure(EntityTypeBuilder<ShippingLineDebt> builder)
        {
            builder.Property(x => x.Code).IsRequired().HasMaxLength(40);
            builder.HasIndex(x => x.Code).IsUnique();
            builder.Property(x => x.ShippingLineCode).IsRequired().HasMaxLength(20);
            builder.HasIndex(x => x.ShippingLineCode);
            builder.Property(x => x.JobNo).IsRequired().HasMaxLength(30);
            builder.HasIndex(x => x.JobNo).IsUnique();
            builder.Property(x => x.ContainerNo).IsRequired().HasMaxLength(15);
            builder.HasIndex(x => x.ContainerNo);
            builder.Property(x => x.QuotationNo).IsRequired().HasMaxLength(40);
            builder.Property(x => x.DebtPeriodCode).IsRequired().HasMaxLength(60);
            builder.HasIndex(x => x.DebtPeriodCode);
            builder.Property(x => x.ServiceType).IsRequired().HasMaxLength(20);
            builder.Property(x => x.Status).IsRequired().HasMaxLength(20);
            builder.Property(x => x.TotalAmountVnd).HasPrecision(18, 2);
            builder.Property(x => x.PaidAmountVnd).HasPrecision(18, 2);
            builder.Property(x => x.RemainingAmountVnd).HasPrecision(18, 2);
        }
    }
}
