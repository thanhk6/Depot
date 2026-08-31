using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Depot.Data.Migrations
{
    /// <inheritdoc />
    public partial class ConvertLegacyKeysToLong : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Postgres không có cast ngầm định uuid -> bigint (khác int -> bigint là widening hợp lệ),
            // EF Core tự sinh AlterColumn thẳng sẽ lỗi "column cannot be cast automatically to type bigint".
            // DB tại thời điểm chạy migration này luôn RỖNG (fresh dev DB, xem plan đã duyệt), nên dùng
            // raw SQL với "USING NULL::bigint" cho mọi cột đang là uuid — an toàn vì không có dòng dữ liệu
            // nào bị đánh giá bởi biểu thức USING. Cột int -> bigint vẫn cast ngầm được nên giữ nguyên.
            // Migration LinkRelationshipsById (2026-08-22) trước đó đã thêm FK thật theo Id cho nhiều bảng
            // (không chỉ 3 bảng item con) — thay vì liệt kê tay từng FK (dễ sót, như FK_Surveys_depot_jobs_
            // DepotJobId từng bị bỏ sót), dùng DO block PL/pgSQL tự phát hiện + gỡ TOÀN BỘ FK trong schema
            // trước khi đổi kiểu cột, rồi add lại nguyên văn từ pg_get_constraintdef sau khi đổi xong.
            migrationBuilder.Sql(@"
DO $$
DECLARE
    r RECORD;
    fk_names TEXT[] := ARRAY[]::TEXT[];
    fk_tables TEXT[] := ARRAY[]::TEXT[];
    fk_defs TEXT[] := ARRAY[]::TEXT[];
    i INT;
BEGIN
    FOR r IN
        SELECT conname, conrelid::regclass::text AS tbl, pg_get_constraintdef(oid) AS def
        FROM pg_constraint
        WHERE contype = 'f' AND connamespace = 'public'::regnamespace
    LOOP
        fk_names := array_append(fk_names, r.conname);
        fk_tables := array_append(fk_tables, r.tbl);
        fk_defs := array_append(fk_defs, r.def);
        EXECUTE format('ALTER TABLE %s DROP CONSTRAINT %I', r.tbl, r.conname);
    END LOOP;

-- int/integer -> bigint: cast ngầm hợp lệ, không cần USING.
ALTER TABLE ""YardPositions"" ALTER COLUMN ""Id"" TYPE bigint;
ALTER TABLE ""SystemUser"" ALTER COLUMN ""RoleId"" TYPE bigint;
ALTER TABLE ""SystemUser"" ALTER COLUMN ""Id"" TYPE bigint;
ALTER TABLE system_companies ALTER COLUMN ""Id"" TYPE bigint;
ALTER TABLE ""ShippingLines"" ALTER COLUMN ""Id"" TYPE bigint;
ALTER TABLE ""Roles"" ALTER COLUMN ""Id"" TYPE bigint;
ALTER TABLE ""Materials"" ALTER COLUMN ""Id"" TYPE bigint;
ALTER TABLE depot_jobs ALTER COLUMN ""ShippingLineId"" TYPE bigint;
ALTER TABLE ""CustomerBookings"" ALTER COLUMN ""ShippingLineId"" TYPE bigint;
ALTER TABLE ""Containers"" ALTER COLUMN ""ShippingLineId"" TYPE bigint;

-- uuid -> bigint: không có cast ngầm, ép qua NULL::bigint (an toàn vì bảng rỗng).
ALTER TABLE ""Surveys"" ALTER COLUMN ""DepotJobId"" TYPE bigint USING NULL::bigint;
ALTER TABLE ""Surveys"" ALTER COLUMN ""Id"" TYPE bigint USING NULL::bigint;
ALTER TABLE ""ShippingSyncLogs"" ALTER COLUMN ""DepotJobId"" TYPE bigint USING NULL::bigint;
ALTER TABLE ""ShippingSyncLogs"" ALTER COLUMN ""Id"" TYPE bigint USING NULL::bigint;
ALTER TABLE ""ServiceOrders"" ALTER COLUMN ""DepotJobId"" TYPE bigint USING NULL::bigint;
ALTER TABLE ""ServiceOrders"" ALTER COLUMN ""Id"" TYPE bigint USING NULL::bigint;
ALTER TABLE ""ServiceOrderItems"" ALTER COLUMN ""ServiceOrderId"" TYPE bigint USING NULL::bigint;
ALTER TABLE ""ServiceOrderItems"" ALTER COLUMN ""Id"" TYPE bigint USING NULL::bigint;
ALTER TABLE ""RepairOrders"" ALTER COLUMN ""DepotJobId"" TYPE bigint USING NULL::bigint;
ALTER TABLE ""RepairOrders"" ALTER COLUMN ""Id"" TYPE bigint USING NULL::bigint;
ALTER TABLE ""Payments"" ALTER COLUMN ""DepotJobId"" TYPE bigint USING NULL::bigint;
ALTER TABLE ""Payments"" ALTER COLUMN ""Id"" TYPE bigint USING NULL::bigint;
ALTER TABLE ""NotificationRecords"" ALTER COLUMN ""Id"" TYPE bigint USING NULL::bigint;
ALTER TABLE ""MaterialStockTransactions"" ALTER COLUMN ""Id"" TYPE bigint USING NULL::bigint;
ALTER TABLE ""MasterCatalogItems"" ALTER COLUMN ""Id"" TYPE bigint USING NULL::bigint;
ALTER TABLE ""Estimates"" ALTER COLUMN ""DepotJobId"" TYPE bigint USING NULL::bigint;
ALTER TABLE ""Estimates"" ALTER COLUMN ""Id"" TYPE bigint USING NULL::bigint;
ALTER TABLE ""EstimateItem"" ALTER COLUMN ""EstimateId"" TYPE bigint USING NULL::bigint;
ALTER TABLE ""EstimateItem"" ALTER COLUMN ""Id"" TYPE bigint USING NULL::bigint;
ALTER TABLE depot_jobs ALTER COLUMN ""Id"" TYPE bigint USING NULL::bigint;
ALTER TABLE ""DamageItem"" ALTER COLUMN ""SurveyId"" TYPE bigint USING NULL::bigint;
ALTER TABLE ""DamageItem"" ALTER COLUMN ""Id"" TYPE bigint USING NULL::bigint;
ALTER TABLE ""CustomerVehicles"" ALTER COLUMN ""Id"" TYPE bigint USING NULL::bigint;
ALTER TABLE ""CustomerPortalUsers"" ALTER COLUMN ""Id"" TYPE bigint USING NULL::bigint;
ALTER TABLE ""CustomerDrivers"" ALTER COLUMN ""Id"" TYPE bigint USING NULL::bigint;
ALTER TABLE ""CustomerCompanies"" ALTER COLUMN ""Id"" TYPE bigint USING NULL::bigint;
ALTER TABLE ""CustomerBookings"" ALTER COLUMN ""Id"" TYPE bigint USING NULL::bigint;
ALTER TABLE ""Containers"" ALTER COLUMN ""Id"" TYPE bigint USING NULL::bigint;
ALTER TABLE ""AuditLogs"" ALTER COLUMN ""DepotJobId"" TYPE bigint USING NULL::bigint;
ALTER TABLE ""AuditLogs"" ALTER COLUMN ""Id"" TYPE bigint USING NULL::bigint;

-- Khôi phục identity (GENERATED BY DEFAULT AS IDENTITY) cho các cột Id nguồn uuid — USING NULL::bigint
-- tạo cột mới hoàn toàn nên mất identity, phải add lại tường minh. Cột Id nguồn int KHÔNG cần dòng này:
-- ALTER COLUMN TYPE bigint (không USING) là widening cast hợp lệ, Postgres tự giữ nguyên identity sẵn có
-- (add lại sẽ lỗi ""column is already an identity column"").
ALTER TABLE ""Surveys"" ALTER COLUMN ""Id"" ADD GENERATED BY DEFAULT AS IDENTITY;
ALTER TABLE ""ShippingSyncLogs"" ALTER COLUMN ""Id"" ADD GENERATED BY DEFAULT AS IDENTITY;
ALTER TABLE ""ServiceOrders"" ALTER COLUMN ""Id"" ADD GENERATED BY DEFAULT AS IDENTITY;
ALTER TABLE ""ServiceOrderItems"" ALTER COLUMN ""Id"" ADD GENERATED BY DEFAULT AS IDENTITY;
ALTER TABLE ""RepairOrders"" ALTER COLUMN ""Id"" ADD GENERATED BY DEFAULT AS IDENTITY;
ALTER TABLE ""Payments"" ALTER COLUMN ""Id"" ADD GENERATED BY DEFAULT AS IDENTITY;
ALTER TABLE ""NotificationRecords"" ALTER COLUMN ""Id"" ADD GENERATED BY DEFAULT AS IDENTITY;
ALTER TABLE ""MaterialStockTransactions"" ALTER COLUMN ""Id"" ADD GENERATED BY DEFAULT AS IDENTITY;
ALTER TABLE ""MasterCatalogItems"" ALTER COLUMN ""Id"" ADD GENERATED BY DEFAULT AS IDENTITY;
ALTER TABLE ""Estimates"" ALTER COLUMN ""Id"" ADD GENERATED BY DEFAULT AS IDENTITY;
ALTER TABLE ""EstimateItem"" ALTER COLUMN ""Id"" ADD GENERATED BY DEFAULT AS IDENTITY;
ALTER TABLE depot_jobs ALTER COLUMN ""Id"" ADD GENERATED BY DEFAULT AS IDENTITY;
ALTER TABLE ""DamageItem"" ALTER COLUMN ""Id"" ADD GENERATED BY DEFAULT AS IDENTITY;
ALTER TABLE ""CustomerVehicles"" ALTER COLUMN ""Id"" ADD GENERATED BY DEFAULT AS IDENTITY;
ALTER TABLE ""CustomerPortalUsers"" ALTER COLUMN ""Id"" ADD GENERATED BY DEFAULT AS IDENTITY;
ALTER TABLE ""CustomerDrivers"" ALTER COLUMN ""Id"" ADD GENERATED BY DEFAULT AS IDENTITY;
ALTER TABLE ""CustomerCompanies"" ALTER COLUMN ""Id"" ADD GENERATED BY DEFAULT AS IDENTITY;
ALTER TABLE ""CustomerBookings"" ALTER COLUMN ""Id"" ADD GENERATED BY DEFAULT AS IDENTITY;
ALTER TABLE ""Containers"" ALTER COLUMN ""Id"" ADD GENERATED BY DEFAULT AS IDENTITY;
ALTER TABLE ""AuditLogs"" ALTER COLUMN ""Id"" ADD GENERATED BY DEFAULT AS IDENTITY;

    -- Gắn lại toàn bộ FK đã gỡ ở đầu, theo đúng định nghĩa gốc (giờ các cột liên quan đã là bigint).
    FOR i IN 1..COALESCE(array_length(fk_names, 1), 0) LOOP
        EXECUTE format('ALTER TABLE %s ADD CONSTRAINT %I %s', fk_tables[i], fk_names[i], fk_defs[i]);
    END LOOP;
END $$;
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Down không được kỳ vọng chạy thật (DB dev, không có nhu cầu rollback) — vẫn viết đối xứng
            // bằng raw SQL cho nhất quán, cùng lý do "USING NULL::..." như chiều Up.
            migrationBuilder.Sql(@"
DO $$
DECLARE
    r RECORD;
    fk_names TEXT[] := ARRAY[]::TEXT[];
    fk_tables TEXT[] := ARRAY[]::TEXT[];
    fk_defs TEXT[] := ARRAY[]::TEXT[];
    i INT;
BEGIN
    FOR r IN
        SELECT conname, conrelid::regclass::text AS tbl, pg_get_constraintdef(oid) AS def
        FROM pg_constraint
        WHERE contype = 'f' AND connamespace = 'public'::regnamespace
    LOOP
        fk_names := array_append(fk_names, r.conname);
        fk_tables := array_append(fk_tables, r.tbl);
        fk_defs := array_append(fk_defs, r.def);
        EXECUTE format('ALTER TABLE %s DROP CONSTRAINT %I', r.tbl, r.conname);
    END LOOP;

ALTER TABLE ""YardPositions"" ALTER COLUMN ""Id"" TYPE integer;
ALTER TABLE ""SystemUser"" ALTER COLUMN ""RoleId"" TYPE integer;
ALTER TABLE ""SystemUser"" ALTER COLUMN ""Id"" TYPE integer;
ALTER TABLE system_companies ALTER COLUMN ""Id"" TYPE integer;
ALTER TABLE ""ShippingLines"" ALTER COLUMN ""Id"" TYPE integer;
ALTER TABLE ""Roles"" ALTER COLUMN ""Id"" TYPE integer;
ALTER TABLE ""Materials"" ALTER COLUMN ""Id"" TYPE integer;
ALTER TABLE depot_jobs ALTER COLUMN ""ShippingLineId"" TYPE integer;
ALTER TABLE ""CustomerBookings"" ALTER COLUMN ""ShippingLineId"" TYPE integer;
ALTER TABLE ""Containers"" ALTER COLUMN ""ShippingLineId"" TYPE integer;

ALTER TABLE ""Surveys"" ALTER COLUMN ""DepotJobId"" TYPE uuid USING NULL::uuid;
ALTER TABLE ""Surveys"" ALTER COLUMN ""Id"" TYPE uuid USING NULL::uuid;
ALTER TABLE ""ShippingSyncLogs"" ALTER COLUMN ""DepotJobId"" TYPE uuid USING NULL::uuid;
ALTER TABLE ""ShippingSyncLogs"" ALTER COLUMN ""Id"" TYPE uuid USING NULL::uuid;
ALTER TABLE ""ServiceOrders"" ALTER COLUMN ""DepotJobId"" TYPE uuid USING NULL::uuid;
ALTER TABLE ""ServiceOrders"" ALTER COLUMN ""Id"" TYPE uuid USING NULL::uuid;
ALTER TABLE ""ServiceOrderItems"" ALTER COLUMN ""ServiceOrderId"" TYPE uuid USING NULL::uuid;
ALTER TABLE ""ServiceOrderItems"" ALTER COLUMN ""Id"" TYPE uuid USING NULL::uuid;
ALTER TABLE ""RepairOrders"" ALTER COLUMN ""DepotJobId"" TYPE uuid USING NULL::uuid;
ALTER TABLE ""RepairOrders"" ALTER COLUMN ""Id"" TYPE uuid USING NULL::uuid;
ALTER TABLE ""Payments"" ALTER COLUMN ""DepotJobId"" TYPE uuid USING NULL::uuid;
ALTER TABLE ""Payments"" ALTER COLUMN ""Id"" TYPE uuid USING NULL::uuid;
ALTER TABLE ""NotificationRecords"" ALTER COLUMN ""Id"" TYPE uuid USING NULL::uuid;
ALTER TABLE ""MaterialStockTransactions"" ALTER COLUMN ""Id"" TYPE uuid USING NULL::uuid;
ALTER TABLE ""MasterCatalogItems"" ALTER COLUMN ""Id"" TYPE uuid USING NULL::uuid;
ALTER TABLE ""Estimates"" ALTER COLUMN ""DepotJobId"" TYPE uuid USING NULL::uuid;
ALTER TABLE ""Estimates"" ALTER COLUMN ""Id"" TYPE uuid USING NULL::uuid;
ALTER TABLE ""EstimateItem"" ALTER COLUMN ""EstimateId"" TYPE uuid USING NULL::uuid;
ALTER TABLE ""EstimateItem"" ALTER COLUMN ""Id"" TYPE uuid USING NULL::uuid;
ALTER TABLE depot_jobs ALTER COLUMN ""Id"" TYPE uuid USING NULL::uuid;
ALTER TABLE ""DamageItem"" ALTER COLUMN ""SurveyId"" TYPE uuid USING NULL::uuid;
ALTER TABLE ""DamageItem"" ALTER COLUMN ""Id"" TYPE uuid USING NULL::uuid;
ALTER TABLE ""CustomerVehicles"" ALTER COLUMN ""Id"" TYPE uuid USING NULL::uuid;
ALTER TABLE ""CustomerPortalUsers"" ALTER COLUMN ""Id"" TYPE uuid USING NULL::uuid;
ALTER TABLE ""CustomerDrivers"" ALTER COLUMN ""Id"" TYPE uuid USING NULL::uuid;
ALTER TABLE ""CustomerCompanies"" ALTER COLUMN ""Id"" TYPE uuid USING NULL::uuid;
ALTER TABLE ""CustomerBookings"" ALTER COLUMN ""Id"" TYPE uuid USING NULL::uuid;
ALTER TABLE ""Containers"" ALTER COLUMN ""Id"" TYPE uuid USING NULL::uuid;
ALTER TABLE ""AuditLogs"" ALTER COLUMN ""DepotJobId"" TYPE uuid USING NULL::uuid;
ALTER TABLE ""AuditLogs"" ALTER COLUMN ""Id"" TYPE uuid USING NULL::uuid;

ALTER TABLE ""YardPositions"" ALTER COLUMN ""Id"" ADD GENERATED BY DEFAULT AS IDENTITY;
ALTER TABLE ""SystemUser"" ALTER COLUMN ""Id"" ADD GENERATED BY DEFAULT AS IDENTITY;
ALTER TABLE system_companies ALTER COLUMN ""Id"" ADD GENERATED BY DEFAULT AS IDENTITY;
ALTER TABLE ""ShippingLines"" ALTER COLUMN ""Id"" ADD GENERATED BY DEFAULT AS IDENTITY;
ALTER TABLE ""Roles"" ALTER COLUMN ""Id"" ADD GENERATED BY DEFAULT AS IDENTITY;
ALTER TABLE ""Materials"" ALTER COLUMN ""Id"" ADD GENERATED BY DEFAULT AS IDENTITY;

    FOR i IN 1..COALESCE(array_length(fk_names, 1), 0) LOOP
        EXECUTE format('ALTER TABLE %s ADD CONSTRAINT %I %s', fk_tables[i], fk_names[i], fk_defs[i]);
    END LOOP;
END $$;
");
        }
    }
}
