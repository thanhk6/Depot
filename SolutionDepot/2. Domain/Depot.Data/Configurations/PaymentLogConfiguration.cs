using Depot.Data.Entities.Finance;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Depot.Data.Configurations
{
    public sealed class PaymentLogConfiguration : IEntityTypeConfiguration<PaymentLog>
    {
        public void Configure(EntityTypeBuilder<PaymentLog> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.JobNo).HasMaxLength(50);
            builder.Property(x => x.ContainerNo).HasMaxLength(15);
            builder.Property(x => x.ServiceOrderNo).HasMaxLength(50);
            builder.Property(x => x.InvoiceNo).HasMaxLength(50);
            builder.Property(x => x.Method).IsRequired().HasMaxLength(30);
            builder.Property(x => x.Status).IsRequired().HasMaxLength(20);
            builder.Property(x => x.Amount).HasPrecision(18, 2);
            builder.Property(x => x.OrderTotal).HasPrecision(18, 2);
            builder.Property(x => x.CashReceived).HasPrecision(18, 2);
            builder.Property(x => x.ChangeAmount).HasPrecision(18, 2);
            builder.Property(x => x.TransactionRef).HasMaxLength(100);
            builder.Property(x => x.Notes).HasMaxLength(500);
            builder.Property(x => x.CashierName).HasMaxLength(150);
            builder.Property(x => x.Message).HasMaxLength(500);
            builder.HasIndex(x => x.LoggedAt);
            builder.HasIndex(x => x.ContainerNo);
            builder.HasIndex(x => x.TransactionRef);
        }
    }
}
