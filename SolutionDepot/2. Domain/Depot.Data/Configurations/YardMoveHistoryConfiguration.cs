using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Depot.Data.Entities.Yard;

namespace Depot.Data.Configurations
{
    public sealed class YardMoveHistoryConfiguration : IEntityTypeConfiguration<YardMoveHistory>
    {
        public void Configure(EntityTypeBuilder<YardMoveHistory> builder)
        {
            builder.Property(x => x.Code).IsRequired().HasMaxLength(40);
            builder.HasIndex(x => x.Code).IsUnique();
            builder.Property(x => x.ContainerNo).IsRequired().HasMaxLength(15);
            builder.HasIndex(x => x.ContainerNo);
            builder.Property(x => x.FromLocation).IsRequired().HasMaxLength(50);
            builder.Property(x => x.ToLocation).IsRequired().HasMaxLength(50);
            builder.HasIndex(x => x.MoveDate);
        }
    }
}
