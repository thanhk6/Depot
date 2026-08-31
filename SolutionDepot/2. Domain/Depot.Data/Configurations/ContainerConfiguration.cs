using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Depot.Data.Entities.Master;

namespace Depot.Data.Configurations
{
    public sealed class ContainerConfiguration : IEntityTypeConfiguration<Container>
    {
        public void Configure(EntityTypeBuilder<Container> builder)
        {
            builder.Property(x => x.ContainerNo).IsRequired().HasMaxLength(15);
            builder.Property(x => x.ShippingLineId).IsRequired();
            builder.HasIndex(x => x.ContainerNo).IsUnique();
            builder.HasIndex(x => x.ShippingLineId);
            builder.HasOne(x => x.ShippingLine)
                .WithMany(x => x.Containers)
                .HasForeignKey(x => x.ShippingLineId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
