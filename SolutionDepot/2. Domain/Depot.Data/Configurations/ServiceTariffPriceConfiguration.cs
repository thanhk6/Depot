using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Depot.Data.Entities.Master;

namespace Depot.Data.Configurations
{
    public sealed class ServiceTariffPriceConfiguration : IEntityTypeConfiguration<ServiceTariffPrice>
    {
        public void Configure(EntityTypeBuilder<ServiceTariffPrice> builder)
        {
            builder.ToTable("ServiceTariffPrices");
            builder.Property(x => x.ContainerTypeCode).IsRequired().HasMaxLength(20);
            builder.Property(x => x.Price).HasPrecision(18, 2);
            builder.HasIndex(x => new { x.ServiceTariffId, x.ContainerTypeCode }).IsUnique();
        }
    }
}
