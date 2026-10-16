using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Depot.Data.Entities.Storage;

namespace Depot.Data.Configurations
{
    public sealed class DepotFileConfiguration : IEntityTypeConfiguration<DepotFile>
    {
        public void Configure(EntityTypeBuilder<DepotFile> builder)
        {
            builder.Property(x => x.TableName).IsRequired().HasMaxLength(100);
            builder.Property(x => x.NameGuid).IsRequired().HasMaxLength(100);
            builder.Property(x => x.Name).IsRequired().HasMaxLength(250);
            builder.Property(x => x.FileType).HasMaxLength(20);

            // Tra file theo bản ghi nghiệp vụ (vd "lấy hết ảnh của DamageItem Id=5") là truy vấn chính,
            // 1 bản ghi có thể có nhiều file nên không unique.
            builder.HasIndex(x => new { x.TableName, x.IdTable });
            // Tên file vật lý phải duy nhất trên storage — trùng là ghi đè file cũ.
            builder.HasIndex(x => x.NameGuid).IsUnique();
        }
    }
}
