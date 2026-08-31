using Depot.Data.Entities.Master;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Depot.Data.Configurations;

public sealed class CustomerVehicleConfiguration : IEntityTypeConfiguration<CustomerVehicle>
{
    public void Configure(EntityTypeBuilder<CustomerVehicle> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.CustomerCode).IsRequired().HasMaxLength(40);
        builder.Property(x => x.PlateNumber).IsRequired().HasMaxLength(30);
        builder.Property(x => x.VehicleType).IsRequired().HasMaxLength(20);
        builder.Property(x => x.Status).IsRequired().HasMaxLength(20);
        builder.Property(x => x.PayloadTon).HasPrecision(10, 2);
        builder.HasIndex(x => new { x.CustomerCode, x.PlateNumber }).IsUnique();
    }
}
