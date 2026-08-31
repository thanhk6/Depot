using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Depot.Data.Entities.Yard;

namespace Depot.Data.Configurations
{
    public sealed class ForkliftConfiguration : IEntityTypeConfiguration<Forklift>
    {
        public void Configure(EntityTypeBuilder<Forklift> builder)
        {
            builder.Property(x => x.Code).IsRequired().HasMaxLength(20);
            builder.HasIndex(x => x.Code).IsUnique();
            builder.Property(x => x.Name).IsRequired().HasMaxLength(150);
            builder.Property(x => x.Status).IsRequired().HasMaxLength(20);
            builder.Property(x => x.MaxCapacityTons).HasPrecision(18, 2);
        }
    }
}
