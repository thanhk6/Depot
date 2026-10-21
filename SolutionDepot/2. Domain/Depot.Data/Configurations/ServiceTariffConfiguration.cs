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

            builder.Property(x => x.VatPercent).HasPrecision(5, 2);

            builder.HasIndex(x => x.ServiceCategory);

            // Giá theo loại container là dòng con thuần tuý của biểu cước — xoá biểu cước thì xoá luôn giá.
            builder.HasMany(x => x.Prices)
                .WithOne()
                .HasForeignKey(x => x.ServiceTariffId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
