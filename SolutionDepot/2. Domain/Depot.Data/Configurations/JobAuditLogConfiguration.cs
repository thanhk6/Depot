using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Depot.Data.Entities.Depot;

namespace Depot.Data.Configurations
{
    public sealed class JobAuditLogConfiguration : IEntityTypeConfiguration<JobAuditLog>
    {
        public void Configure(EntityTypeBuilder<JobAuditLog> builder)
        {
            builder.Property(x => x.DepotJobId).IsRequired();
            builder.Property(x => x.JobNo).IsRequired().HasMaxLength(30);
            builder.HasIndex(x => x.DepotJobId);
            builder.HasIndex(x => x.JobNo);
        }
    }
}
