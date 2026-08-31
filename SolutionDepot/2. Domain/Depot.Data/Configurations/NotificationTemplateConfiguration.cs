using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Depot.Data.Entities.Integration;

namespace Depot.Data.Configurations
{
    public sealed class NotificationTemplateConfiguration : IEntityTypeConfiguration<NotificationTemplate>
    {
        public void Configure(EntityTypeBuilder<NotificationTemplate> builder)
        {
            builder.Property(x => x.Code).IsRequired().HasMaxLength(60);
            builder.HasIndex(x => x.Code).IsUnique();
            builder.Property(x => x.Name).IsRequired().HasMaxLength(200);
            builder.Property(x => x.EventType).IsRequired().HasMaxLength(50);
            builder.Property(x => x.TargetAudience).IsRequired().HasMaxLength(20);
            builder.Property(x => x.Channel).IsRequired().HasMaxLength(20);
        }
    }
}
