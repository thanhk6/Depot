using Depot.Data.Entities.Master;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Depot.Data.Configurations;

public sealed class CustomerBookingConfiguration : IEntityTypeConfiguration<CustomerBooking>
{
    public void Configure(EntityTypeBuilder<CustomerBooking> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.BookingNo).IsRequired().HasMaxLength(50);
        builder.Property(x => x.CustomerCode).IsRequired().HasMaxLength(40);
        builder.Property(x => x.ShippingLineId).IsRequired();
        builder.Property(x => x.Status).IsRequired().HasMaxLength(20);
        builder.HasIndex(x => x.BookingNo).IsUnique();
        builder.HasIndex(x => x.ShippingLineId);
        builder.HasIndex(x => new { x.CustomerCode, x.Status });
        builder.HasOne(x => x.ShippingLine)
            .WithMany()
            .HasForeignKey(x => x.ShippingLineId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
