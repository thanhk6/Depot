using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Depot.Data.Entities.Depot;
using Depot.Data.Entities.Finance;
using Depot.Data.Entities.Master;

namespace Depot.Data.Configurations
{
    /// <summary>DepotJob.JobNo là business key của toàn bộ vòng đời container.</summary>
    public sealed class DepotJobConfiguration : IEntityTypeConfiguration<DepotJob>
    {
        public void Configure(EntityTypeBuilder<DepotJob> builder)
        {
            builder.ToTable("depot_jobs");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.JobNo).IsRequired().HasMaxLength(30);
            builder.Property(x => x.ContainerNo).IsRequired().HasMaxLength(15);
            builder.Property(x => x.IsoSize).HasMaxLength(10).HasDefaultValue("40HC");
            builder.Property(x => x.ShippingLineId).IsRequired();
            builder.Property(x => x.Status).HasMaxLength(50).IsRequired();
            // GateInStaffId cố tình KHÔNG khai báo HasOne/HasForeignKey tới SystemUser: đây chỉ là
            // 1 con số tham chiếu để tra cứu, không cần EF load kèm navigation mỗi lần đọc DepotJob.
            builder.Property(x => x.GateInStaffName).HasMaxLength(150);
            builder.HasIndex(x => x.JobNo).IsUnique();
            builder.HasIndex(x => x.ContainerNo);
            builder.HasIndex(x => x.Status);
            builder.HasIndex(x => x.ShippingLineId);
            builder.HasOne(x => x.ShippingLine)
                .WithMany(x => x.DepotJobs)
                .HasForeignKey(x => x.ShippingLineId)
                .OnDelete(DeleteBehavior.Restrict);
            builder.HasOne(x => x.Survey).WithOne(x => x.DepotJob).HasForeignKey<Survey>(x => x.DepotJobId).OnDelete(DeleteBehavior.Cascade);
            builder.HasOne(x => x.Estimate).WithOne(x => x.DepotJob).HasForeignKey<Estimate>(x => x.DepotJobId).OnDelete(DeleteBehavior.Cascade);
            builder.HasOne(x => x.RepairOrder).WithOne(x => x.DepotJob).HasForeignKey<RepairOrder>(x => x.DepotJobId).OnDelete(DeleteBehavior.Cascade);
            builder.HasOne(x => x.Payment).WithOne(x => x.DepotJob).HasForeignKey<Payment>(x => x.DepotJobId).OnDelete(DeleteBehavior.Cascade);
            builder.HasMany(x => x.AuditLogs).WithOne(x => x.DepotJob).HasForeignKey(x => x.DepotJobId).OnDelete(DeleteBehavior.Cascade);
        }
    }
}
