using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Xunit;
using Depot.Application.Services;
using Depot.Data.EF;
using Depot.Data.Entities.Master;
using Depot.ViewModels;

namespace Depot.IntegrationTests;

public sealed class DepotWorkflowTests : IAsyncLifetime
{
    private SqliteConnection _connection = null!;
    private DepotDbContext _db = null!;
    private DepotJobService _service = null!;

    public async Task InitializeAsync()
    {
        _connection = new SqliteConnection("Data Source=:memory:");
        await _connection.OpenAsync();
        var options = new DbContextOptionsBuilder<DepotDbContext>()
            .UseSqlite(_connection)
            .Options;
        _db = new DepotDbContext(options);
        await _db.Database.EnsureCreatedAsync();
        _db.ShippingLines.Add(new ShippingLine { Code = "MAEU", Name = "Maersk Line" });
        await _db.SaveChangesAsync();
        _service = new DepotJobService(_db);
    }

    public async Task DisposeAsync()
    {
        await _db.DisposeAsync();
        await _connection.DisposeAsync();
    }

    [Fact]
    public async Task GateIn_persists_job_with_business_codes_and_audit()
    {
        var job = await _service.CreateGateInJobAsync(new CreateDepotJobRequest
        {
            ContainerNo = "MSKU1234567",
            IsoSize = "40HC",
            ShippingLine = "MAEU",
            TareWeightKg = 3820,
            MaxPayloadKg = 28680
        });

        var saved = await _db.DepotJobs
            .Include(x => x.AuditLogs)
            .SingleAsync(x => x.JobNo == job.JobNo);

        Assert.Equal("MSKU1234567", saved.ContainerNo);
        Assert.Equal("MAEU", saved.ShippingLineCode);
        Assert.Equal("SURVEYING", saved.Status);
        Assert.StartsWith("EIR-IN-", saved.GateInEirNo);
        Assert.Contains(saved.AuditLogs, x => x.JobNo == saved.JobNo && x.Action == "GATE_IN");
    }

    [Fact]
    public async Task GateIn_rejects_unknown_shipping_line_business_code()
    {
        var request = new CreateDepotJobRequest
        {
            ContainerNo = "MSKU7654321",
            IsoSize = "40HC",
            ShippingLine = "UNKNOWN",
            TareWeightKg = 3820,
            MaxPayloadKg = 28680
        };

        var error = await Assert.ThrowsAsync<ArgumentException>(() => _service.CreateGateInJobAsync(request));

        Assert.Contains("ShippingLine.Code", error.Message);
        Assert.Empty(await _db.DepotJobs.ToListAsync());
    }

    [Fact]
    public async Task GateIn_rejects_duplicate_active_container()
    {
        var request = new CreateDepotJobRequest
        {
            ContainerNo = "MSKU1111111",
            IsoSize = "40HC",
            ShippingLine = "MAEU",
            TareWeightKg = 3820,
            MaxPayloadKg = 28680
        };

        await _service.CreateGateInJobAsync(request);
        var error = await Assert.ThrowsAsync<InvalidOperationException>(() => _service.CreateGateInJobAsync(request));

        Assert.Contains("đã có hồ sơ", error.Message);
        Assert.Single(await _db.DepotJobs.ToListAsync());
    }

    [Fact]
    public async Task Survey_moves_job_to_estimating_and_persists_damage_by_job_no()
    {
        var job = await _service.CreateGateInJobAsync(new CreateDepotJobRequest
        {
            ContainerNo = "MSKU2222222",
            IsoSize = "40HC",
            ShippingLine = "MAEU"
        });

        var saved = await _service.SubmitSurveyAsync(job.Id, new SurveyRecordViewModel
        {
            SurveyorName = "Integration Surveyor",
            ConditionRating = "C",
            Notes = "Damage test",
            Damages =
            {
                new DamageItemViewModel
                {
                    Component = "Door",
                    LocationCode = "DR1",
                    DamageCode = "DENT",
                    RepairCode = "STRAIGHTEN",
                    Quantity = 1,
                    LaborHours = 1.5m,
                    LaborRate = 150000,
                    MaterialCost = 80000
                }
            }
        });

        var result = await _db.DepotJobs
            .Include(x => x.Survey!)
            .ThenInclude(x => x.Damages)
            .SingleAsync(x => x.JobNo == job.JobNo);

        Assert.True(saved);
        Assert.Equal("ESTIMATING", result.Status);
        Assert.NotNull(result.Survey);
        Assert.Equal(result.JobNo, result.Survey!.JobNo);
        Assert.Single(result.Survey.Damages);
        Assert.Equal(305000m, result.Survey.Damages.Single().TotalCost);
    }

    [Fact]
    public async Task Payment_updates_job_and_payment_using_job_no()
    {
        var job = await _service.CreateGateInJobAsync(new CreateDepotJobRequest
        {
            ContainerNo = "MSKU3333333",
            IsoSize = "40HC",
            ShippingLine = "MAEU"
        });

        var success = await _service.ProcessPaymentAsync(job.Id, new ProcessPaymentRequest
        {
            Method = "VIETQR",
            TransactionRef = "TEST-001",
            Amount = 500000
        });

        var payment = await _db.Payments.SingleAsync(x => x.JobNo == job.JobNo);
        var persistedJob = await _db.DepotJobs.SingleAsync(x => x.JobNo == job.JobNo);

        Assert.True(success);
        Assert.Equal("PAID", persistedJob.Status);
        Assert.Equal("PAID", payment.Status);
        Assert.Equal(500000m, payment.Amount);
    }
}
