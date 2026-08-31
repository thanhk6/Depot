using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Depot.Data.Entities.Finance;

namespace Depot.Data.Configurations
{
    public sealed class DebtPeriodConfiguration : IEntityTypeConfiguration<DebtPeriod>
    {
        public void Configure(EntityTypeBuilder<DebtPeriod> builder)
        {
            builder.Property(x => x.Code).IsRequired().HasMaxLength(60);
            builder.HasIndex(x => x.Code).IsUnique();
            builder.Property(x => x.ShippingLineCode).IsRequired().HasMaxLength(20);
            builder.HasIndex(x => x.ShippingLineCode);
            builder.Property(x => x.PeriodCode).IsRequired().HasMaxLength(40);
            builder.Property(x => x.Status).IsRequired().HasMaxLength(20);
            builder.Property(x => x.OpeningBalanceVnd).HasPrecision(18, 2);
            builder.Property(x => x.PeriodDebitVnd).HasPrecision(18, 2);
            builder.Property(x => x.PeriodCreditVnd).HasPrecision(18, 2);
            builder.Property(x => x.ClosingBalanceVnd).HasPrecision(18, 2);
        }
    }
}
