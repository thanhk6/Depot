using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Depot.Data.Entities.Master;

namespace Depot.Data.Configurations
{
    /// <summary>ShippingLine.Code là business key bất biến của hãng tàu.</summary>
    public sealed class ShippingLineConfiguration : IEntityTypeConfiguration<ShippingLine>
    {
        public void Configure(EntityTypeBuilder<ShippingLine> builder)
        {
            builder.Property(x => x.Code).IsRequired().HasMaxLength(20);
            builder.HasIndex(x => x.Code).IsUnique();
        }
    }
}
