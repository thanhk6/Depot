using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Depot.Data.EF
{
    /// <summary>
    /// Design-time Factory hỗ trợ EF Core Tools sinh mã Migrations cho PostgreSQL.
    /// </summary>
    public class DepotDbContextFactory : IDesignTimeDbContextFactory<DepotDbContext>
    {
        public DepotDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<DepotDbContext>();
            var connectionString = "Host=localhost;Port=5432;Database=SolutionDepotDb;Username=postgres;Password=12345678;";

            optionsBuilder.UseNpgsql(connectionString, b => b.MigrationsAssembly("Depot.Data"));
            return new DepotDbContext(optionsBuilder.Options);
        }
    }
}
