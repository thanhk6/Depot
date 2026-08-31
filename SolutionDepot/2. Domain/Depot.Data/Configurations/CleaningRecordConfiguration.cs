using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Depot.Data.Entities.Cleaning;

namespace Depot.Data.Configurations
{
    /// <summary>CleaningRecord.Code là business key, Items liên kết theo Code (quy tắc bảng mới).</summary>
    public sealed class CleaningRecordConfiguration : IEntityTypeConfiguration<CleaningRecord>
    {
        public void Configure(EntityTypeBuilder<CleaningRecord> builder)
        {
            builder.Property(x => x.Code).IsRequired().HasMaxLength(40);
            builder.HasIndex(x => x.Code).IsUnique();
            builder.Property(x => x.JobNo).HasMaxLength(30);
            builder.HasIndex(x => x.JobNo);
            builder.Property(x => x.ContainerNo).IsRequired().HasMaxLength(15);
            builder.HasIndex(x => x.ContainerNo);
            builder.Property(x => x.Status).IsRequired().HasMaxLength(30);
            builder.HasIndex(x => x.Status);
            builder.Property(x => x.TargetQualityGrade).IsRequired().HasMaxLength(30);
            builder.Property(x => x.TotalCostVnd).HasPrecision(18, 2);
            builder.Property(x => x.ChemicalVolumeLiters).HasPrecision(18, 2);
            builder.Property(x => x.TemperatureCelsius).HasPrecision(18, 2);

            builder.HasMany(x => x.Items)
                .WithOne(x => x.CleaningRecord)
                .HasForeignKey(x => x.CleaningRecordCode)
                .HasPrincipalKey(x => x.Code)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
