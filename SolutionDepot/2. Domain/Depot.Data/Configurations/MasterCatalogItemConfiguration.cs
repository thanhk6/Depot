using Depot.Data.Entities.Master;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Depot.Data.Configurations;

public sealed class MasterCatalogItemConfiguration : IEntityTypeConfiguration<MasterCatalogItem>
{
    public void Configure(EntityTypeBuilder<MasterCatalogItem> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.CatalogType).IsRequired().HasMaxLength(50);
        builder.Property(x => x.Code).IsRequired().HasMaxLength(50);
        builder.Property(x => x.Name).IsRequired().HasMaxLength(200);
        builder.Property(x => x.NameVi).HasMaxLength(200);
        builder.Property(x => x.Description).HasMaxLength(1000);
        builder.Property(x => x.JsonData).IsRequired().HasColumnType("text");
        builder.HasIndex(x => new { x.CatalogType, x.Code }).IsUnique();
        builder.HasIndex(x => new { x.CatalogType, x.IsActive, x.SortOrder });
    }
}
