using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Depot.Data.Entities.Yard;

namespace Depot.Data.Configurations
{
    public sealed class YardBlockLayoutConfiguration : IEntityTypeConfiguration<YardBlockLayout>
    {
        public void Configure(EntityTypeBuilder<YardBlockLayout> builder)
        {
            builder.Property(x => x.Code).IsRequired().HasMaxLength(40);
            builder.HasIndex(x => x.Code).IsUnique();
            builder.Property(x => x.ZoneCode).HasMaxLength(40);
            builder.HasIndex(x => x.ZoneCode);
            builder.Property(x => x.BlockName).IsRequired().HasMaxLength(200);
            builder.Property(x => x.Status).IsRequired().HasMaxLength(20);
        }
    }
}
