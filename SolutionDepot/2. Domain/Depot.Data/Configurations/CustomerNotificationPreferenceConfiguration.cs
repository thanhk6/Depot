using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Depot.Data.Entities.Integration;

namespace Depot.Data.Configurations
{
    public sealed class CustomerNotificationPreferenceConfiguration : IEntityTypeConfiguration<CustomerNotificationPreference>
    {
        public void Configure(EntityTypeBuilder<CustomerNotificationPreference> builder)
        {
            builder.Property(x => x.Code).IsRequired().HasMaxLength(40);
            builder.HasIndex(x => x.Code).IsUnique();
            builder.Property(x => x.CustomerCode).IsRequired().HasMaxLength(30);
            builder.HasIndex(x => x.CustomerCode).IsUnique();
            builder.Property(x => x.PreferredChannel).IsRequired().HasMaxLength(20);
        }
    }
}
