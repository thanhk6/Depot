using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace Depot.Data.EF
{
    /// <summary>
    /// Khởi tạo và kiểm tra trạng thái CSDL khi ứng dụng khởi chạy.
    /// </summary>
    public static class DbInitializer
    {
        public static async Task InitializeAsync(DepotDbContext context)
        {
            var migrations = context.Database.GetMigrations();

            if (migrations.Any())
            {
                await context.Database.MigrateAsync();
            }
            else
            {
                await context.Database.EnsureCreatedAsync();
            }

            await DbSeeder.SeedAsync(context);
        }
    }
}
