# SolutionDepot (Backend skeleton)

This folder contains a basic skeleton for the backend implementation of the SolutionDepot project.

Projects created:
- `Depot.Data` - EF Core DbContext and entities
- `Depot.Application` - application services and DTOs
- `Depot.BackendApi` - ASP.NET Core Web API host

How to run (development):
1. Ensure .NET 8 SDK is installed.
2. Open the `SolutionDepot` folder in terminal or VS.
3. From terminal run:
   - `dotnet restore SolutionDepot/Depot.BackendApi/Depot.BackendApi.csproj`
   - `dotnet build SolutionDepot/Depot.BackendApi/Depot.BackendApi.csproj`
   - `dotnet run --project SolutionDepot/Depot.BackendApi/Depot.BackendApi.csproj`

Notes:
- The sample uses LocalDB connection string in `appsettings.Development.json`.
- Run EF migrations by adding the tools and creating migrations in `Depot.Data` project.

This is a minimal starter that implements a `GateIn` entity, service and API controller as an example feature.
