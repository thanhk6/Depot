using Depot.Data.Entities.Master;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Depot.Data.Configurations;

public sealed class CustomerDriverConfiguration : IEntityTypeConfiguration<CustomerDriver>
{
    public void Configure(EntityTypeBuilder<CustomerDriver> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.CustomerCode).IsRequired().HasMaxLength(40);
        builder.Property(x => x.DriverCode).IsRequired().HasMaxLength(40);
        builder.Property(x => x.FullName).IsRequired().HasMaxLength(150);
        builder.Property(x => x.Status).IsRequired().HasMaxLength(20);
        builder.HasIndex(x => new { x.CustomerCode, x.DriverCode }).IsUnique();
    }
}
