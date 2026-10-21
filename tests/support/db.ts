import pg from 'pg';
import { env, assertLocalOnly, TEST_PREFIX } from './env';
import { call, admin } from './api';

// Truy cập DB local chỉ cho 2 việc: tạo tài khoản tạm và dọn dữ liệu test theo tiền tố.
// Không bao giờ đụng bản ghi không mang tiền tố test.
export async function withDb<T>(fn: (db: pg.Client) => Promise<T>): Promise<T> {
  assertLocalOnly();
  const db = new pg.Client({ connectionString: env.dbUrl });
  await db.connect();
  try { return await fn(db); } finally { await db.end(); }
}

/** Tạo tài khoản tạm qa_t_<name> với vai trò roleId, cùng mật khẩu admin (copy hash). */
export async function createTempUser(name: string, roleId: number) {
  const username = TEST_PREFIX.user + name;
  await withDb(async (db) => {
    await db.query(`delete from "SystemUser" where "Username" = $1`, [username]);
    await db.query(
      `insert into "SystemUser" ("Username","PasswordHash","FullName","Email","IsActive","CreatedAt","CreatedBy","IsDeleted","RoleId")
       select $1::text, a."PasswordHash", 'QA ' || $1::text, $1::text || '@local', true, now(), 'qa', false, $2::int
       from "SystemUser" a where a."Username" = $3`,
      [username, roleId, env.adminUser]
    );
  });
  return username;
}

const CONTAINER_LIKE = `${TEST_PREFIX.container}%`;

/** Xoá toàn bộ dữ liệu test: ảnh (qua API để xoá cả file vật lý), hồ sơ QATS* và bảng con, tài khoản qa_t_*, danh mục QA_T_*. */
export async function cleanupTestData() {
  const fileIds = await withDb(async (db) => (await db.query(
    `select "Id" from "DepotFiles" where not "IsDeleted" and "TableName" in ('DepotJob','RepairOrder')
       and "IdTable" in (select "Id" from depot_jobs where "ContainerNo" like $1)`, [CONTAINER_LIKE])).rows.map((r) => r.Id));
  for (const id of fileIds) await call(admin(), 'DELETE', `/depot-files/${id}`);

  return withDb(async (db) => {
    await db.query('begin');
    try {
      await db.query(`create temp table j on commit drop as select "Id","JobNo" from depot_jobs where "ContainerNo" like $1`, [CONTAINER_LIKE]);
      await db.query(`create temp table sv on commit drop as select "Id" from "Surveys" where "DepotJobId" in (select "Id" from j)`);
      await db.query(`create temp table ro on commit drop as select "Id" from "RepairOrders" where "DepotJobId" in (select "Id" from j)`);
      await db.query(`create temp table es on commit drop as select "Id" from "Estimates" where "DepotJobId" in (select "Id" from j)`);
      await db.query(`create temp table so on commit drop as select "Id" from "ServiceOrders" where "DepotJobId" in (select "Id" from j)`);
      await db.query(`create temp table cr on commit drop as select "Code" from "CleaningRecords" where "ContainerNo" like $1`, [CONTAINER_LIKE]);
      const steps = [
        `delete from "DepotFiles" where ("TableName"='DepotJob' and "IdTable" in (select "Id" from j)) or ("TableName"='RepairOrder' and "IdTable" in (select "Id" from ro))`,
        `delete from "RepairOrders" where "Id" in (select "Id" from ro)`,
        `delete from "EstimateItem" where "EstimateId" in (select "Id" from es)`,
        `delete from "Estimates" where "Id" in (select "Id" from es)`,
        `delete from "DamageItem" where "SurveyId" in (select "Id" from sv)`,
        `delete from "SurveyChecklistItem" where "SurveyId" in (select "Id" from sv)`,
        `delete from "SurveyCleaningItem" where "SurveyId" in (select "Id" from sv)`,
        `delete from "SurveyPhotoItem" where "SurveyId" in (select "Id" from sv)`,
        `delete from "Surveys" where "Id" in (select "Id" from sv)`,
        `delete from "CleaningWorkItem" where "CleaningRecordCode" in (select "Code" from cr)`,
        `delete from "CleaningRecords" where "Code" in (select "Code" from cr)`,
        `delete from "ServiceOrderItems" where "ServiceOrderId" in (select "Id" from so)`,
        `delete from "ServiceOrders" where "Id" in (select "Id" from so)`,
        `delete from "Payments" where "DepotJobId" in (select "Id" from j)`,
        `delete from "PaymentLogs" where "DepotJobId" in (select "Id" from j)`,
        `delete from "ShippingSyncLogs" where "DepotJobId" in (select "Id" from j)`,
        `delete from "AuditLogs" where "DepotJobId" in (select "Id" from j) or "JobNo" in (select "JobNo" from j)`,
        `delete from "YardPositions" where "OccupiedContainerNo" like '${CONTAINER_LIKE}'`,
        `delete from depot_jobs where "Id" in (select "Id" from j)`,
        `delete from "StorageTariffRules" where "Code" like '${TEST_PREFIX.catalog}%'`,
        `delete from "PaymentAllocations" where "ArPaymentCode" in (select "Code" from "ArPayments" where "ShippingLineCode" like '${TEST_PREFIX.catalog}%')`,
        `delete from "ArPayments" where "ShippingLineCode" like '${TEST_PREFIX.catalog}%'`,
        `delete from "ShippingLineDebts" where "ShippingLineCode" like '${TEST_PREFIX.catalog}%'`,
        `delete from "DebtPeriods" where "ShippingLineCode" like '${TEST_PREFIX.catalog}%'`,
        `delete from "ShippingLines" where "Code" like '${TEST_PREFIX.catalog}%'`,
        `delete from "SurveyChecklistItem" where "ZoneKey" like '${TEST_PREFIX.catalog}%'`,
        `delete from "MasterCatalogItems" where "Code" like '${TEST_PREFIX.catalog}%'`,
        `delete from "ServiceTariffs" where "Code" like '${TEST_PREFIX.catalog}%'`,
        `delete from "CleaningTariffs" where "Code" like '${TEST_PREFIX.catalog}%'`,
        `delete from "SystemUser" where "Username" like '${TEST_PREFIX.user}%'`
      ];
      for (const sql of steps) await db.query(sql);
      await db.query('commit');
    } catch (error) {
      await db.query('rollback');
      throw error;
    }
    const left = await db.query(
      `select (select count(*) from depot_jobs where "ContainerNo" like $1)::int as jobs,
              (select count(*) from "MasterCatalogItems" where "Code" like $2)::int as catalog,
              (select count(*) from "SystemUser" where "Username" like $3)::int as users`,
      [CONTAINER_LIKE, `${TEST_PREFIX.catalog}%`, `${TEST_PREFIX.user}%`]
    );
    return left.rows[0] as { jobs: number; catalog: number; users: number };
  });
}

/** Chỉnh hồ sơ test QATS* để thử phí lưu bãi: lùi ngày Gate-In về N ngày trước (12:00 giờ Việt Nam) và / hoặc đổi trạng thái.
 *  Từ chối hồ sơ không mang tiền tố test. */
export async function setTestJob(jobId: string, opts: { gateInDaysAgo?: number; status?: string }) {
  await withDb(async (db) => {
    const r = await db.query(
      `update depot_jobs set
         "GateInDate" = case when $2::int is null then "GateInDate"
           else (((now() at time zone 'Asia/Ho_Chi_Minh')::date - $2::int) + time '12:00') at time zone 'Asia/Ho_Chi_Minh' end,
         "Status" = coalesce($3::text, "Status")
       where "Id" = $1::bigint and "ContainerNo" like $4`,
      [jobId, opts.gateInDaysAgo ?? null, opts.status ?? null, CONTAINER_LIKE]);
    if (r.rowCount !== 1) throw new Error(`setTestJob: không thấy hồ sơ test ${jobId}`);
  });
}

/** Nhật ký mới nhất của hồ sơ test theo action. */
export const lastAudit = (jobId: string, action: string) => withDb(async (db) =>
  (await db.query(`select "Details" from "AuditLogs" where "DepotJobId" = $1::bigint and "Action" = $2 order by "Id" desc limit 1`, [jobId, action])).rows[0]?.Details as string | undefined);

/** Dựng báo giá đã ghi nhận hãng duyệt + lệnh sửa chữa cho hồ sơ test QATS* (bỏ qua các bước giám định / sửa chữa trên giao diện).
 *  qcStatus PASSED = QC đạt lúc này. Từ chối hồ sơ không mang tiền tố test. */
export async function fixtureApprovedRepair(jobId: string, opts: { total: number; approved: number; authCode?: string; qcStatus: 'PASSED' | 'PENDING' | 'FAILED' }) {
  return withDb(async (db) => {
    const job = (await db.query(`select "Id","JobNo" from depot_jobs where "Id" = $1::bigint and "ContainerNo" like $2`, [jobId, CONTAINER_LIKE])).rows[0];
    if (!job) throw new Error(`fixtureApprovedRepair: không thấy hồ sơ test ${jobId}`);
    const estimateNo = `EST-QA-${jobId}-${Date.now() % 100000}`;
    await db.query(
      `insert into "Estimates" ("DepotJobId","JobNo","EstimateNo","TotalLaborCost","TotalMaterialCost","TotalTax","GrandTotal","Currency","Status",
         "ApprovedAt","ApprovedBy","ApprovedAmount","CarrierAuthCode","ApprovalChannel","CreatedAt","CreatedBy","IsDeleted")
       values ($1::bigint, $2::text, $3::text, $4::numeric, 0, 0, $4::numeric, 'VND', 'APPROVED', now(), 'qa', $5::numeric, $6::text, 'EMAIL', now(), 'qa', false)`,
      [job.Id, job.JobNo, estimateNo, opts.total, opts.approved, opts.authCode ?? null]);
    await db.query(
      `insert into "RepairOrders" ("DepotJobId","JobNo","TechnicianId","TechnicianName","StartedAt","CompletedAt","QcStatus","CreatedAt","CreatedBy","IsDeleted")
       values ($1::bigint, $2::text, 'qa', 'QA', now(), case when $3::text = 'PENDING' then null else now() end, $3::text, now(), 'qa', false)`,
      [job.Id, job.JobNo, opts.qcStatus]);
    return { jobNo: job.JobNo as string, estimateNo };
  });
}
