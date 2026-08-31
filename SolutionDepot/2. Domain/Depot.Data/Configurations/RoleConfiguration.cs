using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Depot.Data.Entities.System;

namespace Depot.Data.Configurations
{
    public sealed class RoleConfiguration : IEntityTypeConfiguration<Role>
    {
        public void Configure(EntityTypeBuilder<Role> builder)
        {
            builder.Property(x => x.RoleCode).IsRequired().HasMaxLength(50);
            builder.HasIndex(x => x.RoleCode).IsUnique();
        }
    }
}
