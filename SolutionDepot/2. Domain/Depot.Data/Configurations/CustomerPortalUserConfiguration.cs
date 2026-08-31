using Depot.Data.Entities.Master;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Depot.Data.Configurations;

public sealed class CustomerPortalUserConfiguration : IEntityTypeConfiguration<CustomerPortalUser>
{
    public void Configure(EntityTypeBuilder<CustomerPortalUser> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.CustomerCode).IsRequired().HasMaxLength(40);
        builder.Property(x => x.Username).IsRequired().HasMaxLength(80);
        builder.Property(x => x.FullName).IsRequired().HasMaxLength(150);
        builder.Property(x => x.Role).IsRequired().HasMaxLength(30);
        builder.Property(x => x.Status).IsRequired().HasMaxLength(20);
        builder.HasIndex(x => new { x.CustomerCode, x.Username }).IsUnique();
    }
}
