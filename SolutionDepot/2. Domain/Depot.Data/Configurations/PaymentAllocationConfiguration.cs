using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Depot.Data.Entities.Finance;

namespace Depot.Data.Configurations
{
    public sealed class PaymentAllocationConfiguration : IEntityTypeConfiguration<PaymentAllocation>
    {
        public void Configure(EntityTypeBuilder<PaymentAllocation> builder)
        {
            builder.Property(x => x.Code).IsRequired().HasMaxLength(40);
            builder.HasIndex(x => x.Code).IsUnique();
            builder.Property(x => x.ArPaymentCode).IsRequired().HasMaxLength(40);
            builder.HasIndex(x => x.ArPaymentCode);
            builder.Property(x => x.ShippingLineDebtCode).IsRequired().HasMaxLength(40);
            builder.HasIndex(x => x.ShippingLineDebtCode);
            builder.Property(x => x.ContainerNo).IsRequired().HasMaxLength(15);
            builder.Property(x => x.QuotationNo).IsRequired().HasMaxLength(40);
            builder.Property(x => x.AllocatedAmountVnd).HasPrecision(18, 2);

            builder.HasOne(x => x.ArPayment)
                .WithMany(x => x.Allocations)
                .HasForeignKey(x => x.ArPaymentCode)
                .HasPrincipalKey(x => x.Code)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
