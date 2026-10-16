using Depot.Data.Entities.Integration;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Depot.Data.Configurations
{
    public sealed class ShippingSyncLogConfiguration : IEntityTypeConfiguration<ShippingSyncLog>
    {
        public void Configure(EntityTypeBuilder<ShippingSyncLog> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.ContainerNo).IsRequired().HasMaxLength(15);
            builder.Property(x => x.CarrierCode).IsRequired().HasMaxLength(30);
            builder.Property(x => x.EventType).IsRequired().HasMaxLength(60);
            builder.Property(x => x.Status).IsRequired().HasMaxLength(30);
            builder.Property(x => x.AckToken).IsRequired().HasMaxLength(150);
            builder.Property(x => x.EndpointUrl).HasMaxLength(500);
            builder.Property(x => x.TriggeredBy).HasMaxLength(150);
            builder.HasIndex(x => new { x.DepotJobId, x.CarrierCode, x.EventType, x.SyncedAt });
        }
    }
}
