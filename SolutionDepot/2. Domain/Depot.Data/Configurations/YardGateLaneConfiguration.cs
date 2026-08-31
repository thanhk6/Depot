using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Depot.Data.Entities.Yard;

namespace Depot.Data.Configurations
{
    public sealed class YardGateLaneConfiguration : IEntityTypeConfiguration<YardGateLane>
    {
        public void Configure(EntityTypeBuilder<YardGateLane> builder)
        {
            builder.Property(x => x.Code).IsRequired().HasMaxLength(30);
            builder.HasIndex(x => x.Code).IsUnique();
            builder.Property(x => x.GateType).IsRequired().HasMaxLength(10);
            builder.Property(x => x.LaneName).IsRequired().HasMaxLength(150);
            builder.Property(x => x.Status).IsRequired().HasMaxLength(20);
        }
    }
}
