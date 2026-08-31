using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Depot.Data.Entities.Yard;

namespace Depot.Data.Configurations
{
    public sealed class ForkliftDispatchConfiguration : IEntityTypeConfiguration<ForkliftDispatch>
    {
        public void Configure(EntityTypeBuilder<ForkliftDispatch> builder)
        {
            builder.Property(x => x.Code).IsRequired().HasMaxLength(40);
            builder.HasIndex(x => x.Code).IsUnique();
            builder.Property(x => x.ForkliftCode).IsRequired().HasMaxLength(20);
            builder.HasIndex(x => x.ForkliftCode);
            builder.Property(x => x.ContainerNo).IsRequired().HasMaxLength(15);
            builder.HasIndex(x => x.ContainerNo);
            builder.Property(x => x.ToLocation).IsRequired().HasMaxLength(50);
            builder.Property(x => x.Status).IsRequired().HasMaxLength(20);
            builder.Property(x => x.Priority).IsRequired().HasMaxLength(20);

            builder.HasOne(x => x.Forklift)
                .WithMany()
                .HasForeignKey(x => x.ForkliftCode)
                .HasPrincipalKey(x => x.Code)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
