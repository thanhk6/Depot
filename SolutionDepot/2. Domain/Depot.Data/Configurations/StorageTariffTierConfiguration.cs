using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Depot.Data.Entities.Master;

namespace Depot.Data.Configurations
{
    public sealed class StorageTariffTierConfiguration : IEntityTypeConfiguration<StorageTariffTier>
    {
        public void Configure(EntityTypeBuilder<StorageTariffTier> builder)
        {
            builder.Property(x => x.TierName).IsRequired().HasMaxLength(100);
            builder.HasIndex(x => x.StorageTariffRuleId);

            // Giá theo loại container là dòng con thuần tuý của bậc — xoá bậc thì xoá luôn giá.
            builder.HasMany(x => x.Prices)
                .WithOne()
                .HasForeignKey(x => x.StorageTariffTierId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }

    public sealed class StorageTariffTierPriceConfiguration : IEntityTypeConfiguration<StorageTariffTierPrice>
    {
        public void Configure(EntityTypeBuilder<StorageTariffTierPrice> builder)
        {
            builder.ToTable("StorageTariffTierPrices");
            builder.Property(x => x.ContainerTypeCode).IsRequired().HasMaxLength(20);
            builder.Property(x => x.Price).HasPrecision(18, 2);
            builder.HasIndex(x => new { x.StorageTariffTierId, x.ContainerTypeCode }).IsUnique();
        }
    }
}
