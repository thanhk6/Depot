using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Depot.Data.Entities.Depot;

namespace Depot.Data.Configurations
{
    public sealed class EstimateConfiguration : IEntityTypeConfiguration<Estimate>
    {
        public void Configure(EntityTypeBuilder<Estimate> builder)
        {
            builder.Property(x => x.JobNo).IsRequired().HasMaxLength(30);
            builder.Property(x => x.DepotJobId).IsRequired();
            builder.HasIndex(x => x.JobNo).IsUnique();
            builder.HasIndex(x => x.DepotJobId).IsUnique();

            // EstimateItem không còn navigation trỏ ngược về Estimate — khai báo tường minh thay cho
            // convention discovery cũ (xem SurveyConfiguration.cs cho cùng pattern).
            builder.HasMany<EstimateItem>().WithOne().HasForeignKey(x => x.EstimateId).OnDelete(DeleteBehavior.Cascade);
        }
    }
}
