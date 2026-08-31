using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Depot.Data.Entities.Master;

namespace Depot.Data.Configurations
{
    public sealed class ServiceTariffConfiguration : IEntityTypeConfiguration<ServiceTariff>
    {
        public void Configure(EntityTypeBuilder<ServiceTariff> builder)
        {
            builder.Property(x => x.Code).IsRequired().HasMaxLength(40);
            builder.HasIndex(x => x.Code).IsUnique();
            builder.Property(x => x.ServiceCategory).IsRequired().HasMaxLength(30);
            builder.Property(x => x.NameVi).IsRequired().HasMaxLength(200);
            builder.Property(x => x.NameEn).HasMaxLength(200);
            builder.Property(x => x.Unit).IsRequired().HasMaxLength(30);
            builder.Property(x => x.Currency).IsRequired().HasMaxLength(10);
            builder.Property(x => x.ApplicableShift).IsRequired().HasMaxLength(30);

            builder.Property(x => x.Price20GP).HasPrecision(18, 2);
            builder.Property(x => x.Price40HC).HasPrecision(18, 2);
            builder.Property(x => x.Price45HC).HasPrecision(18, 2);
            builder.Property(x => x.Price20RF).HasPrecision(18, 2);
            builder.Property(x => x.Price40RH).HasPrecision(18, 2);
            builder.Property(x => x.PriceSpecial).HasPrecision(18, 2);
            builder.Property(x => x.VatPercent).HasPrecision(5, 2);

            builder.HasIndex(x => x.ServiceCategory);
        }
    }
}
