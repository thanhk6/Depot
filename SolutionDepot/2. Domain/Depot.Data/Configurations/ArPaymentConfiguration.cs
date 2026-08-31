using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Depot.Data.Entities.Finance;

namespace Depot.Data.Configurations
{
    public sealed class ArPaymentConfiguration : IEntityTypeConfiguration<ArPayment>
    {
        public void Configure(EntityTypeBuilder<ArPayment> builder)
        {
            builder.Property(x => x.Code).IsRequired().HasMaxLength(40);
            builder.HasIndex(x => x.Code).IsUnique();
            builder.Property(x => x.ShippingLineCode).IsRequired().HasMaxLength(20);
            builder.HasIndex(x => x.ShippingLineCode);
            builder.Property(x => x.PaymentMethod).IsRequired().HasMaxLength(20);
            builder.Property(x => x.Status).IsRequired().HasMaxLength(20);
            builder.Property(x => x.RecordedBy).IsRequired().HasMaxLength(150);
            builder.Property(x => x.PaymentAmountVnd).HasPrecision(18, 2);
        }
    }
}
