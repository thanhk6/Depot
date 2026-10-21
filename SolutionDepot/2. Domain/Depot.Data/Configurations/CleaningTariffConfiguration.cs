using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Depot.Data.Entities.Master;

namespace Depot.Data.Configurations
{
    public sealed class CleaningTariffConfiguration : IEntityTypeConfiguration<CleaningTariff>
    {
        public void Configure(EntityTypeBuilder<CleaningTariff> builder)
        {
            builder.ToTable("CleaningTariffs");
            builder.Property(x => x.Code).IsRequired().HasMaxLength(40);
            builder.HasIndex(x => x.Code).IsUnique();
            builder.Property(x => x.NameVi).IsRequired().HasMaxLength(200);
            builder.Property(x => x.NameEn).HasMaxLength(200);
            builder.Property(x => x.Category).IsRequired().HasMaxLength(40);
            builder.Property(x => x.CedexCode).HasMaxLength(20);
            builder.Property(x => x.Currency).IsRequired().HasMaxLength(10);
            builder.Property(x => x.ResponsiblePartyDefault).IsRequired().HasMaxLength(5);
            builder.Property(x => x.VatPercent).HasPrecision(5, 2);

            // Giá theo loại container là dòng con thuần tuý — xoá biểu phí thì xoá luôn giá.
            builder.HasMany(x => x.Prices)
                .WithOne()
                .HasForeignKey(x => x.CleaningTariffId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }

    public sealed class CleaningTariffPriceConfiguration : IEntityTypeConfiguration<CleaningTariffPrice>
    {
        public void Configure(EntityTypeBuilder<CleaningTariffPrice> builder)
        {
            builder.ToTable("CleaningTariffPrices");
            builder.Property(x => x.ContainerTypeCode).IsRequired().HasMaxLength(20);
            builder.Property(x => x.Price).HasPrecision(18, 2);
            builder.HasIndex(x => new { x.CleaningTariffId, x.ContainerTypeCode }).IsUnique();
        }
    }
}
