using Depot.Data.Entities.Inventory;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Depot.Data.Configurations;

public sealed class MaterialStockTransactionConfiguration : IEntityTypeConfiguration<MaterialStockTransaction>
{
    public void Configure(EntityTypeBuilder<MaterialStockTransaction> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.MaterialCode).IsRequired().HasMaxLength(50);
        builder.Property(x => x.TransactionType).IsRequired().HasMaxLength(30);
        builder.Property(x => x.ReferenceType).IsRequired().HasMaxLength(30);
        builder.Property(x => x.ReferenceId).IsRequired().HasMaxLength(80);
        builder.Property(x => x.PerformedBy).IsRequired().HasMaxLength(150);
        builder.Property(x => x.Quantity).HasPrecision(18, 2);
        builder.Property(x => x.UnitCost).HasPrecision(18, 2);
        builder.Property(x => x.TotalCost).HasPrecision(18, 2);
        builder.Property(x => x.BeforeQuantity).HasPrecision(18, 2);
        builder.Property(x => x.AfterQuantity).HasPrecision(18, 2);
        builder.HasIndex(x => new { x.MaterialCode, x.PerformedAt });
    }
}
