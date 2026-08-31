using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Depot.Data.Entities.Cleaning;

namespace Depot.Data.Configurations
{
    public sealed class CleaningWorkItemConfiguration : IEntityTypeConfiguration<CleaningWorkItem>
    {
        public void Configure(EntityTypeBuilder<CleaningWorkItem> builder)
        {
            builder.Property(x => x.CleaningRecordCode).IsRequired().HasMaxLength(40);
            builder.HasIndex(x => x.CleaningRecordCode);
            builder.Property(x => x.CleaningCode).IsRequired().HasMaxLength(20);
            builder.Property(x => x.CleaningName).IsRequired().HasMaxLength(200);
            builder.Property(x => x.ResponsibleParty).IsRequired().HasMaxLength(5);
            builder.Property(x => x.UnitPrice).HasPrecision(18, 2);
            builder.Property(x => x.TotalPrice).HasPrecision(18, 2);
        }
    }
}
