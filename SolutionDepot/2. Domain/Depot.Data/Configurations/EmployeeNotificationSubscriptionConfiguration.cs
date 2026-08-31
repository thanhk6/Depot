using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Depot.Data.Entities.Integration;

namespace Depot.Data.Configurations
{
    public sealed class EmployeeNotificationSubscriptionConfiguration : IEntityTypeConfiguration<EmployeeNotificationSubscription>
    {
        public void Configure(EntityTypeBuilder<EmployeeNotificationSubscription> builder)
        {
            builder.Property(x => x.Code).IsRequired().HasMaxLength(40);
            builder.HasIndex(x => x.Code).IsUnique();
            builder.Property(x => x.Username).IsRequired().HasMaxLength(50);
            builder.HasIndex(x => x.Username).IsUnique();
        }
    }
}
