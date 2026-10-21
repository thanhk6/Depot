using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Depot.Data.Entities.Master;

namespace Depot.Data.Configurations
{
    public sealed class StorageTariffRuleConfiguration : IEntityTypeConfiguration<StorageTariffRule>
    {
        public void Configure(EntityTypeBuilder<StorageTariffRule> builder)
        {
            builder.Property(x => x.Code).IsRequired().HasMaxLength(40);
            builder.HasIndex(x => x.Code).IsUnique();
            builder.Property(x => x.ShippingLineCode).IsRequired().HasMaxLength(20);
            builder.HasIndex(x => x.ShippingLineCode);
            builder.Property(x => x.ShippingLineName).IsRequired().HasMaxLength(150);
            builder.Property(x => x.CalculationUnit).IsRequired().HasMaxLength(30);
            builder.Property(x => x.VatPercent).HasPrecision(5, 2);

            // Bậc giá là dòng con thuần tuý của quy tắc — xoá quy tắc thì xoá luôn các bậc giá.
            builder.HasMany(x => x.Tiers)
                .WithOne(x => x.StorageTariffRule)
                .HasForeignKey(x => x.StorageTariffRuleId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
