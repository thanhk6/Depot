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
            builder.Property(x => x.ForkliftClaimedByOperatorId).HasMaxLength(30);
            builder.Property(x => x.ForkliftClaimedByOperatorName).HasMaxLength(150);
            builder.Property(x => x.ForkliftAssignedVehicleCode).HasMaxLength(30);
            // Số booking cấp vỏ lúc Gate-Out — cùng độ dài với CustomerBooking.BookingNo.
            builder.Property(x => x.GateOutBookingNo).HasMaxLength(50);
            builder.Property(x => x.GateInTruckingName).HasMaxLength(200);
            builder.HasIndex(x => x.JobNo).IsUnique();
            builder.HasIndex(x => x.ContainerNo);
            // 1 số container chỉ có tối đa 1 hồ sơ đang trong bãi. Kiểm tra AnyAsync trong CreateGateInJobAsync
            // không đủ khi nhiều request Gate-In tới cùng lúc (BUG-004) — DB là chốt chặn cuối cùng.
            // Hồ sơ xoá mềm (xoá hồ sơ đã Gate-Out, hoặc hồ sơ trùng bị migration UniqueActiveContainerJob gỡ)
            // không được hiện ở danh sách/thống kê/sơ đồ bãi — trước đây phần lớn truy vấn quên lọc IsDeleted.
            builder.HasQueryFilter(x => !x.IsDeleted);
            builder.HasIndex(x => x.ContainerNo, "UX_depot_jobs_ContainerNo_Active")
                .IsUnique()
                .HasFilter("\"Status\" <> 'GATE_OUT' AND \"IsDeleted\" = false");
            builder.HasIndex(x => x.Status);
            builder.HasIndex(x => x.ShippingLineId);
            // Không còn navigation property 2 chiều (Entity chỉ giữ FK-ID, xem docs/backend-progress/00-quy-tac-backend.md
            // mục 3 bản cập nhật) — khai báo quan hệ bằng overload không-navigation để EF vẫn biết đây là FK thật
            // (tránh migration sau này hiểu nhầm là cột rời rồi DROP constraint).
            builder.HasOne<ShippingLine>()
                .WithMany()
                .HasForeignKey(x => x.ShippingLineId)
                .OnDelete(DeleteBehavior.Restrict);
            builder.HasOne<Survey>().WithOne().HasForeignKey<Survey>(x => x.DepotJobId).OnDelete(DeleteBehavior.Cascade);
            builder.HasOne<Estimate>().WithOne().HasForeignKey<Estimate>(x => x.DepotJobId).OnDelete(DeleteBehavior.Cascade);
            builder.HasOne<RepairOrder>().WithOne().HasForeignKey<RepairOrder>(x => x.DepotJobId).OnDelete(DeleteBehavior.Cascade);
            // Payment/JobAuditLog là hồ sơ tài chính + nhật ký audit — TUYỆT ĐỐI không được cascade-xoá
            // theo DepotJob dù hiện tại chưa có code path nào xoá cứng DepotJob (toàn hệ thống dùng
            // soft-delete). Restrict để nếu sau này ai đó lỡ thêm hard-delete, DB sẽ chặn lại thay vì
            // âm thầm xoá mất lịch sử thanh toán/audit.
            builder.HasOne<Payment>().WithOne().HasForeignKey<Payment>(x => x.DepotJobId).OnDelete(DeleteBehavior.Restrict);
            builder.HasMany<JobAuditLog>().WithOne().HasForeignKey(x => x.DepotJobId).OnDelete(DeleteBehavior.Restrict);
        }
    }
}
