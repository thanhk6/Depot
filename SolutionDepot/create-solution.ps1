# Recreate SolutionDepot.sln and add projects
# Run this script from the workspace root (where this file is located).
# Usage: Open PowerShell and run: .\SolutionDepot\create-solution.ps1

param()

Write-Host "Recreating SolutionDepot.sln..."

$slnPath = Join-Path -Path (Get-Location) -ChildPath "SolutionDepot.sln"
if (Test-Path $slnPath) {
    Write-Host "Removing existing $slnPath"
    Remove-Item $slnPath -Force
}

# Create new solution
dotnet new sln -n SolutionDepot

# Add projects (adjust paths if your folders differ)
$projects = @(
    'SolutionDepot/Depot.Data/Depot.Data.csproj',
    'SolutionDepot/Depot.Application/Depot.Application.csproj',
    'SolutionDepot/3. Hosts/Depot.BackendApi/Depot.BackendApi.csproj',
    'SolutionDepot/Seed/SeedRunner.csproj'
)

foreach ($p in $projects) {
    if (Test-Path $p) {
        Write-Host "Adding $p"
        dotnet sln add $p
    } else {
        Write-Warning "Project not found: $p"
    }
}

Write-Host "Done. Run 'dotnet sln list' to verify projects in the solution."