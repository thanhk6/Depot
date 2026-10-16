using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Depot.Data.Entities.Depot;

namespace Depot.Data.Configurations
{
    public sealed class SurveyConfiguration : IEntityTypeConfiguration<Survey>
    {
        public void Configure(EntityTypeBuilder<Survey> builder)
        {
            builder.Property(x => x.JobNo).IsRequired().HasMaxLength(30);
            builder.Property(x => x.DepotJobId).IsRequired();
            builder.HasIndex(x => x.JobNo).IsUnique();
            builder.HasIndex(x => x.DepotJobId).IsUnique();

            builder.Property(x => x.SurveyNo).HasMaxLength(30);
            builder.Property(x => x.Owner).HasMaxLength(200);
            builder.Property(x => x.ContainerTypeName).HasMaxLength(100);
            builder.Property(x => x.ManufactureMonthYear).HasMaxLength(20);
            builder.Property(x => x.Material).HasMaxLength(200);
            builder.Property(x => x.FloorType).HasMaxLength(200);
            builder.Property(x => x.CscPlateNo).HasMaxLength(50);
            builder.Property(x => x.Standard).HasMaxLength(30);
            builder.Property(x => x.QualityGrade).HasMaxLength(30);
            builder.Property(x => x.ActionRequired).HasMaxLength(40);
            builder.Property(x => x.Shift).HasMaxLength(50);
            builder.Property(x => x.YardLocationNote).HasMaxLength(100);
            builder.Property(x => x.CargoStatus).HasMaxLength(20);
            builder.Property(x => x.ReeferBrand).HasMaxLength(30);
            builder.Property(x => x.ReeferModel).HasMaxLength(50);
            builder.Property(x => x.PtiStatus).HasMaxLength(20);

            // DamageItem/SurveyCleaningItem/SurveyChecklistItem/SurveyPhotoItem không còn navigation property
            // trỏ ngược về Survey — trước đây EF tự suy luận FK qua convention (nav + tên "SurveyId" khớp),
            // giờ phải khai báo tường minh bằng overload không-navigation để không mất constraint FK thật.
            builder.HasMany<DamageItem>().WithOne().HasForeignKey(x => x.SurveyId).OnDelete(DeleteBehavior.Cascade);
            builder.HasMany<SurveyCleaningItem>().WithOne().HasForeignKey(x => x.SurveyId).OnDelete(DeleteBehavior.Cascade);
            builder.HasMany<SurveyChecklistItem>().WithOne().HasForeignKey(x => x.SurveyId).OnDelete(DeleteBehavior.Cascade);
            builder.HasMany<SurveyPhotoItem>().WithOne().HasForeignKey(x => x.SurveyId).OnDelete(DeleteBehavior.Cascade);
        }
    }
}
