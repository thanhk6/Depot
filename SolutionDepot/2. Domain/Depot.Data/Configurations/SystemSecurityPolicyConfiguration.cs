using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Depot.Data.Entities.System;

namespace Depot.Data.Configurations
{
    public sealed class SystemSecurityPolicyConfiguration : IEntityTypeConfiguration<SystemSecurityPolicy>
    {
        public void Configure(EntityTypeBuilder<SystemSecurityPolicy> builder)
        {
            builder.Property(x => x.Code).IsRequired().HasMaxLength(20);
            builder.HasIndex(x => x.Code).IsUnique();
        }
    }
}
