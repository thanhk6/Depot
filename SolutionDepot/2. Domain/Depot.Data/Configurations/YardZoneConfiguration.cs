using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Depot.Data.Entities.Yard;

namespace Depot.Data.Configurations
{
    public sealed class YardZoneConfiguration : IEntityTypeConfiguration<YardZone>
    {
        public void Configure(EntityTypeBuilder<YardZone> builder)
        {
            builder.Property(x => x.Code).IsRequired().HasMaxLength(40);
            builder.HasIndex(x => x.Code).IsUnique();
            builder.Property(x => x.ZoneName).IsRequired().HasMaxLength(200);
            builder.Property(x => x.ZoneType).IsRequired().HasMaxLength(30);
        }
    }
}
