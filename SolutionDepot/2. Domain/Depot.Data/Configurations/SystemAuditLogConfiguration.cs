using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Depot.Data.Entities.System;

namespace Depot.Data.Configurations
{
    public sealed class SystemAuditLogConfiguration : IEntityTypeConfiguration<SystemAuditLog>
    {
        public void Configure(EntityTypeBuilder<SystemAuditLog> builder)
        {
            builder.Property(x => x.Code).IsRequired().HasMaxLength(40);
            builder.HasIndex(x => x.Code).IsUnique();
            builder.Property(x => x.Action).IsRequired().HasMaxLength(50);
            builder.HasIndex(x => x.Action);
            builder.Property(x => x.ActionLabel).IsRequired().HasMaxLength(200);
            builder.Property(x => x.TargetResource).IsRequired().HasMaxLength(200);
            builder.Property(x => x.PerformedByName).IsRequired().HasMaxLength(150);
            builder.Property(x => x.PerformedByRole).HasMaxLength(50);
            builder.Property(x => x.IpAddress).HasMaxLength(64);
            builder.Property(x => x.Status).IsRequired().HasMaxLength(20);
            builder.HasIndex(x => x.OccurredAt);
        }
    }
}
