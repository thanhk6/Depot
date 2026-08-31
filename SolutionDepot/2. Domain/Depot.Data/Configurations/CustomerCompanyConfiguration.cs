using Depot.Data.Entities.Master;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Depot.Data.Configurations;

public sealed class CustomerCompanyConfiguration : IEntityTypeConfiguration<CustomerCompany>
{
    public void Configure(EntityTypeBuilder<CustomerCompany> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Code).IsRequired().HasMaxLength(40);
        builder.Property(x => x.Name).IsRequired().HasMaxLength(250);
        builder.Property(x => x.CustomerType).IsRequired().HasMaxLength(30);
        builder.Property(x => x.Status).IsRequired().HasMaxLength(20);
        builder.HasIndex(x => x.Code).IsUnique();
        builder.Property(x => x.CreditLimit).HasPrecision(18, 2);
        builder.Property(x => x.CurrentDebt).HasPrecision(18, 2);
    }
}
