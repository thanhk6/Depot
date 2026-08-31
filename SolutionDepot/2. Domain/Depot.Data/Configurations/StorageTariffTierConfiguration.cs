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

            builder.Property(x => x.Price20Dry).HasPrecision(18, 2);
            builder.Property(x => x.Price40Dry).HasPrecision(18, 2);
            builder.Property(x => x.Price45Dry).HasPrecision(18, 2);
            builder.Property(x => x.Price20Reefer).HasPrecision(18, 2);
            builder.Property(x => x.Price40Reefer).HasPrecision(18, 2);
            builder.Property(x => x.PriceSpecial).HasPrecision(18, 2);
        }
    }
}
