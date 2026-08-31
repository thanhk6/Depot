using Depot.Data.Entities.Integration;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Depot.Data.Configurations;

public sealed class NotificationRecordConfiguration : IEntityTypeConfiguration<NotificationRecord>
{
    public void Configure(EntityTypeBuilder<NotificationRecord> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.TrackingCode).IsRequired().HasMaxLength(80);
        builder.Property(x => x.TemplateCode).IsRequired().HasMaxLength(80);
        builder.Property(x => x.EventType).IsRequired().HasMaxLength(60);
        builder.Property(x => x.Status).IsRequired().HasMaxLength(20);
        builder.Property(x => x.Channel).IsRequired().HasMaxLength(30);
        builder.Property(x => x.Title).IsRequired().HasMaxLength(250);
        builder.Property(x => x.Content).IsRequired().HasMaxLength(4000);
        builder.HasIndex(x => x.TrackingCode).IsUnique();
        builder.HasIndex(x => new { x.Status, x.CreatedAt });
        builder.HasIndex(x => new { x.RecipientType, x.RecipientId });
    }
}
