import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

// In-Memory Master Data tables (SQL Server Entity DB Sets)
const masterShippingLines = [
  'Maersk Line (MSK)',
  'MSC (Mediterranean Shipping)',
  'CMA CGM',
  'COSCO Shipping',
  'Evergreen Marine (EMC)',
  'ONE (Ocean Network Express)',
  'HMM (Hyundai Merchant Marine)',
  'Yang Ming',
  'Hapag-Lloyd'
];

const masterDamageCodes = [
  { code: 'DENT', nameVi: 'Móp méo', defaultRepair: 'STRAIGHTEN', defaultRepairVi: 'Nắn nắn chỉnh', unitPriceLabor: 150000, unitPriceMaterial: 80000 },
  { code: 'HOLE', nameVi: 'Thủng lỗ', defaultRepair: 'PATCH', defaultRepairVi: 'Vá inox/thép', unitPriceLabor: 250000, unitPriceMaterial: 200000 },
  { code: 'BENT', nameVi: 'Cong biến dạng', defaultRepair: 'STRAIGHTEN', defaultRepairVi: 'Nắn thẳng', unitPriceLabor: 200000, unitPriceMaterial: 100000 },
  { code: 'RUST', nameVi: 'Rỉ sét bề mặt', defaultRepair: 'PAINT', defaultRepairVi: 'Đánh rỉ & sơn chống rỉ', unitPriceLabor: 180000, unitPriceMaterial: 150000 },
  { code: 'CUT', nameVi: 'Rách vách/xà', defaultRepair: 'WELD', defaultRepairVi: 'Hàn đắp / Vá ghép', unitPriceLabor: 220000, unitPriceMaterial: 180000 },
  { code: 'DIRTY', nameVi: 'Bám bẩn / Mùi hôi', defaultRepair: 'CLEAN', defaultRepairVi: 'Rửa hóa chất & sấy dry', unitPriceLabor: 120000, unitPriceMaterial: 50000 },
  { code: 'BROKEN', nameVi: 'Vỡ/Hỏng linh kiện', defaultRepair: 'REPLACE', defaultRepairVi: 'Thay thế phụ tùng mới', unitPriceLabor: 300000, unitPriceMaterial: 450000 }
];

const masterComponents = [
  'Vách trái (Left Side Wall)',
  'Vách phải (Right Side Wall)',
  'Mái container (Roof Panel)',
  'Cửa container (Rear Door)',
  'Sàn gỗ/thép (Floor Board)',
  'Xà dọc trên (Top Side Rail)',
  'Xà dọc dưới (Bottom Side Rail)',
  'Góc đúc (Corner Casting)',
  'Gioăng cửa (Door Gasket)',
  'Cụm máy lạnh (Reefer Unit)'
];

const standardDepotTariff = [
  { id: 'SRV-01', code: 'LIFT_ON_OFF', nameVi: 'Nâng / Hạ Container tại bãi', unitPrice: 450000, quantity: 1, totalPrice: 450000 },
  { id: 'SRV-02', code: 'STORAGE_FEE', nameVi: 'Phí lưu bãi Depot (3 ngày)', unitPrice: 60000, quantity: 3, totalPrice: 180000 },
  { id: 'SRV-03', code: 'WASHING_DRY', nameVi: 'Vệ sinh xịt rửa container khô', unitPrice: 150000, quantity: 1, totalPrice: 150000 },
  { id: 'SRV-04', code: 'PTI_INSPECTION', nameVi: 'Kiểm tra kỹ thuật PTI container lạnh', unitPrice: 500000, quantity: 1, totalPrice: 500000 },
  { id: 'SRV-05', code: 'PLUGGING_POWER', nameVi: 'Cắm điện Container Lạnh (24h)', unitPrice: 250000, quantity: 1, totalPrice: 250000 }
];

const forkliftUnits = [
  { id: 'XN-01', name: 'Xe nâng Kalmar 45T (#01)', driver: 'Nguyễn Văn Hùng', status: 'READY' },
  { id: 'XN-02', name: 'Xe nâng Konecranes 42T (#02)', driver: 'Trần Đình Nam', status: 'READY' },
  { id: 'XN-03', name: 'Xe nâng Hyster 10T (#03)', driver: 'Lê Hoàng Anh', status: 'READY' },
  { id: 'XN-04', name: 'Xe nâng Taylor 45T (#04)', driver: 'Phạm Minh Đức', status: 'READY' }
];

const userProfiles = [
  {
    id: 'USR-001',
    role: 'DEPOT_MANAGER',
    username: 'admin',
    passwordHash: '123456',
    fullName: 'Nguyễn Văn Hùng',
    jobTitle: 'Giám Đốc Quản Lý Bãi Depot',
    department: 'Ban Giám Đốc',
    email: 'hung.nguyen@depotcontainer.vn',
    avatarBg: 'bg-slate-700',
    avatarText: 'NVH',
    badgeBg: 'bg-slate-800 text-slate-100 border-slate-700',
    badgeText: 'Quản Lý Tổng (Admin)',
    allowedTabs: ['dashboard', 'jobs', 'survey', 'operation', 'payment', 'estimate', 'repair', 'qc', 'yard', 'forklift', 'inventory', 'masterdata', 'report', 'permissions', 'portal_users', 'dotnet'],
    roleDescription: 'Toàn quyền truy cập mọi mô-đun: Báo cáo chỉ số KPI, Quản lý toàn bộ vòng đời Container, Giám sát doanh thu & Cấu trúc .NET 8'
  },
  {
    id: 'USR-002',
    role: 'SURVEYOR',
    username: 'surveyor',
    passwordHash: '123456',
    fullName: 'Trần Văn Bình',
    jobTitle: 'Kỹ Sư Giám Định Container',
    department: 'Phòng Khảo Sát & Giám Định',
    email: 'binh.survey@depotcontainer.vn',
    avatarBg: 'bg-amber-600',
    avatarText: 'TVB',
    badgeBg: 'bg-amber-950/80 text-amber-300 border-amber-800/60',
    badgeText: 'Giám Định Viên (Survey)',
    allowedTabs: ['jobs', 'survey', 'yard'],
    roleDescription: 'Menu riêng Giám Định: Tiếp nhận Container tại cổng, chụp ảnh hư hỏng IICL, đánh giá cấp vỏ A/B/C/D & nhập vị trí hư hỏng'
  },
  {
    id: 'USR-003',
    role: 'OPERATOR',
    username: 'operator',
    passwordHash: '123456',
    fullName: 'Lê Hoàng Nam',
    jobTitle: 'Chuyên Viên Điều Độ Khai Thác',
    department: 'Phòng Điều Độ Cổng Gate-In',
    email: 'nam.operator@depotcontainer.vn',
    avatarBg: 'bg-blue-600',
    avatarText: 'LHN',
    badgeBg: 'bg-blue-950/80 text-blue-300 border-blue-800/60',
    badgeText: 'Khai Thác Cổng (Operation)',
    allowedTabs: ['jobs', 'operation', 'payment'],
    roleDescription: 'Menu riêng Khai Thác: Nhập thông tin xe đầu kéo/chủ hàng, tính cước nâng hạ lưu bãi theo Tariff & tạo Phiếu Dịch Vụ Depot'
  },
  {
    id: 'USR-004',
    role: 'ACCOUNTANT',
    username: 'accountant',
    passwordHash: '123456',
    fullName: 'Phạm Thị Thu',
    jobTitle: 'Kế Toán Trưởng & Thu Ngân',
    department: 'Phòng Tài Chính Kế Toán',
    email: 'thu.accountant@depotcontainer.vn',
    avatarBg: 'bg-emerald-600',
    avatarText: 'PTT',
    badgeBg: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60',
    badgeText: 'Kế Toán / Thu Ngân (VietQR)',
    allowedTabs: ['dashboard', 'jobs', 'payment', 'inventory', 'masterdata', 'report'],
    roleDescription: 'Menu riêng Kế Toán: Thu tiền mặt/chuyển khoản, theo dõi VietQR Webhook API đối chiếu gạch nợ tự động & sổ sách tài chính'
  },
  {
    id: 'USR-005',
    role: 'ESTIMATOR',
    username: 'estimator',
    passwordHash: '123456',
    fullName: 'Đặng Văn Khoa',
    jobTitle: 'Chuyên Viên Lập Báo Giá',
    department: 'Phòng Kế Hoạch & Báo Giá',
    email: 'khoa.estimate@depotcontainer.vn',
    avatarBg: 'bg-indigo-600',
    avatarText: 'DVK',
    badgeBg: 'bg-indigo-950/80 text-indigo-300 border-indigo-800/60',
    badgeText: 'Chuyên Viên Báo Giá (Estimator)',
    allowedTabs: ['jobs', 'estimate', 'survey'],
    roleDescription: 'Menu riêng Báo Giá: Tính chi phí giờ công thợ & vật tư theo định mức hãng tàu, lập biên bản báo giá và gửi phê duyệt'
  },
  {
    id: 'USR-006',
    role: 'SHIPPING_LINE',
    username: 'maersk',
    passwordHash: '123456',
    fullName: 'Mr. Hans Nielsen',
    jobTitle: 'Đại Diện Hãng Tàu (Maersk / COSCO)',
    department: 'Đại Lý Hãng Tàu Đối Tác',
    email: 'hans.nielsen@maersk.com',
    avatarBg: 'bg-purple-600',
    avatarText: 'HNS',
    badgeBg: 'bg-purple-950/80 text-purple-300 border-purple-800/60',
    badgeText: 'Đại Diện Hãng Tàu (Shipping Line)',
    allowedTabs: ['jobs', 'estimate'],
    roleDescription: 'Menu riêng Hãng Tàu: Tra cứu container sở hữu, xem ảnh chụp hư hỏng IICL & Thực hiện Phê Duyệt / Từ Chối Báo Giá'
  },
  {
    id: 'USR-007',
    role: 'REPAIR_TECH',
    username: 'repair',
    passwordHash: '123456',
    fullName: 'Vũ Quốc Việt',
    jobTitle: 'Đội Trưởng Kỹ Thuật Sửa Chữa',
    department: 'Xưởng Sửa Chữa & Cơ Điện',
    email: 'viet.repair@depotcontainer.vn',
    avatarBg: 'bg-orange-600',
    avatarText: 'VQV',
    badgeBg: 'bg-orange-950/80 text-orange-300 border-orange-800/60',
    badgeText: 'Tổ Sửa Chữa (Repair Tech)',
    allowedTabs: ['jobs', 'repair', 'yard'],
    roleDescription: 'Menu riêng Sửa Chữa: Tiếp nhận Work Order, xuất kho vật tư tôn/gỗ/sơn, cập nhật tiến độ gạt hàn & gửi nghiệm thu QC'
  },
  {
    id: 'USR-008',
    role: 'QC_INSPECTOR',
    username: 'qc',
    passwordHash: '123456',
    fullName: 'Nguyễn Văn Hải',
    jobTitle: 'Kỹ Sư Kiểm Định Chất Lượng QC',
    department: 'Phòng Kỹ Thuật & QC',
    email: 'hai.qc@depotcontainer.vn',
    avatarBg: 'bg-teal-600',
    avatarText: 'NVH',
    badgeBg: 'bg-teal-950/80 text-teal-300 border-teal-800/60',
    badgeText: 'Kỹ Sư QC (Inspection)',
    allowedTabs: ['jobs', 'qc', 'repair', 'survey'],
    roleDescription: 'Menu riêng QC: Kiểm tra độ kín nước/ánh sáng, màu sơn phủ, bề mặt vách hàn & ký Biên Bản Nghiệm Thu QC (Đạt/Không đạt)'
  },
  {
    id: 'USR-009',
    role: 'FORKLIFT_DRIVER',
    username: 'forklift',
    passwordHash: '123456',
    fullName: 'Nguyễn Đức Tâm',
    jobTitle: 'Tài Xế Xe Nâng Trực Bãi',
    department: 'Đội Xe Nâng & Điều Độ Bãi',
    email: 'tam.forklift@depotcontainer.vn',
    avatarBg: 'bg-rose-600',
    avatarText: 'NDT',
    badgeBg: 'bg-rose-950/80 text-rose-300 border-rose-800/60',
    badgeText: 'Tài Xế Xe Nâng (Forklift)',
    allowedTabs: ['jobs', 'forklift', 'yard'],
    roleDescription: 'Menu riêng Xe Nâng: Nhận lệnh di chuyển container trong bãi, xem sơ đồ 2D Block-Bay-Row-Tier & xác nhận đảo bãi'
  }
];

// In-Memory Database Store simulating SQL Server DbContext (depot_jobs table)
let inMemoryJobs: any[] = [
  {
    id: 'JOB-2026-0101',
    containerNo: 'MSKU8923410',
    isoSize: '40HC',
    shippingLine: 'Maersk Line (MSK)',
    tareWeightKg: 3820,
    maxPayloadKg: 28680,
    gateInDate: '2026-08-04 08:30',
    status: 'SURVEYING',
    currentLocation: { block: 'BLOCK_Q', bay: 1, row: 1, tier: 1 },
    survey: {
      surveyorId: 'NV-GD01',
      surveyorName: 'Phạm Quốc Bảo (Giám định viên)',
      surveyDate: '2026-08-04 08:45',
      conditionRating: 'C',
      damages: [
        {
          id: 'DMG-101',
          component: 'Vách trái (Left Side Wall)',
          damageCode: 'DENT',
          damageNameVi: 'Móp méo nhẹ',
          locationCode: 'L2-3',
          repairCode: 'STRAIGHTEN',
          repairNameVi: 'Nắn nắn chỉnh',
          quantity: 2,
          unit: 'vị trí',
          laborHours: 1.5,
          laborRate: 150000,
          materialCost: 80000,
          totalCost: 305000,
          severity: 'LIGHT',
          notes: 'Móp sâu 1.5cm, không làm thủng vỏ'
        }
      ],
      overallNotes: 'Container rỉ sét nhẹ sàn và vách trái.'
    },
    auditLogs: [
      { id: 'LOG-01', timestamp: '2026-08-04 08:30', user: 'Gate Operator', action: 'GATE_IN', details: 'Gate-In container MSKU8923410' }
    ],
    moveHistory: []
  },
  {
    id: 'JOB-2026-0102',
    containerNo: 'MSCU7721094',
    isoSize: '20DC',
    shippingLine: 'MSC (Mediterranean Shipping)',
    tareWeightKg: 2250,
    maxPayloadKg: 28230,
    gateInDate: '2026-08-04 09:15',
    status: 'ESTIMATING',
    currentLocation: { block: 'BLOCK_A', bay: 2, row: 3, tier: 2 },
    survey: {
      surveyorId: 'NV-GD02',
      surveyorName: 'Lê Hoàng Hải (IICL Certified)',
      surveyDate: '2026-08-04 09:30',
      conditionRating: 'D',
      damages: [
        {
          id: 'DMG-201',
          component: 'Mái container (Roof Panel)',
          damageCode: 'HOLE',
          damageNameVi: 'Thủng lỗ vỏ mái',
          locationCode: 'R1',
          repairCode: 'PATCH',
          repairNameVi: 'Vá thép không gỉ 20x20cm',
          quantity: 1,
          unit: 'miếng',
          laborHours: 2.0,
          laborRate: 150000,
          materialCost: 200000,
          totalCost: 500000,
          severity: 'HEAVY',
          notes: 'Cần xử lý chống dột dầm mái gấp'
        }
      ]
    },
    estimate: {
      estimateNo: 'EST-2026-0042',
      createdAt: '2026-08-04 10:00',
      totalLaborCost: 300000,
      totalMaterialCost: 200000,
      totalTax: 50000,
      grandTotal: 550000,
      currency: 'VND',
      status: 'PENDING_APPROVAL',
      items: []
    },
    auditLogs: [],
    moveHistory: []
  }
];

async function startServer() {
  const app = express();
  const PORT = 3000;
  const BACKEND_API_URL = process.env.DEPOT_BACKEND_URL || "http://localhost:50210";

  app.use(express.json());

  // Forward the core workflow and authentication calls to the .NET API.
  app.use(async (req, res, next) => {
    // Backend-only mode: every API request must reach the .NET API.
    // Unsupported routes now return the backend 404 instead of silently using mock data.
    const shouldForward = /^\/api\//i.test(req.path);

    if (!shouldForward) {
      next();
      return;
    }

    const backendPath = req.originalUrl
      .replace(/^\/api\/auth\/login$/i, "/api/Users/authenticate")
      .replace(/^\/api\/auth\/me$/i, "/api/Users/me")
      .replace(/^\/api\/jobs/i, "/api/DepotJobs")
      .replace(/^\/api\/users/i, "/api/Users");

    try {
      const backendResponse = await fetch(`${BACKEND_API_URL}${backendPath}`, {
        method: req.method,
        headers: { "Content-Type": "application/json" },
        body: ["GET", "HEAD"].includes(req.method) ? undefined : JSON.stringify(req.body || {})
      });
      const responseText = await backendResponse.text();
      res.status(backendResponse.status);
      res.setHeader("Content-Type", backendResponse.headers.get("content-type") || "application/json");
      res.send(responseText);
    } catch (error) {
      res.status(502).json({
        statusCode: 502,
        message: "Không thể kết nối Backend .NET",
        data: error instanceof Error ? error.message : "Backend unavailable"
      });
    }
  });

  // API Health Endpoint
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "online",
      backendService: "SolutionDepot API (.NET 8.0 & Express Proxy)",
      database: "SQL Server (Depot.Data EF Core 8)",
      framework: ".NET 8.0 Clean Architecture",
      version: "1.0.0-release",
      totalJobsInDb: inMemoryJobs.length,
      timestamp: new Date().toISOString()
    });
  });

  // API solution structure info
  app.get("/api/solution/info", (_req, res) => {
    const solutionPath = path.join(process.cwd(), "SolutionDepot");
    const exists = fs.existsSync(solutionPath);
    
    res.json({
      solutionName: "SolutionDepot.sln",
      exists,
      path: solutionPath,
      projects: [
        { name: "Depot.Data", type: "Class Library", framework: "net8.0", path: "2. Domain/Depot.Data" },
        { name: "Depot.Application", type: "Class Library", framework: "net8.0", path: "2. Domain/Depot.Application" },
        { name: "Depot.ViewModels", type: "Class Library", framework: "net8.0", path: "1. Infrastructure/Depot.ViewModels" },
        { name: "Depot.Utilities", type: "Class Library", framework: "net8.0", path: "1. Infrastructure/Depot.Utilities" },
        { name: "Depot.BackendApi", type: "Web API", framework: "net8.0", path: "3. Hosts/Depot.BackendApi" },
        { name: "Depot.ApiIntegration", type: "Web API (VietQR)", framework: "net8.0", path: "3. Hosts/Depot.ApiIntegration" },
        { name: "Depot.AdminApp", type: "Blazor/MVC Admin", framework: "net8.0", path: "3. Hosts/Depot.AdminApp" }
      ]
    });
  });

  // API SQL DbContext Tables metadata
  app.get("/api/sql/tables", (_req, res) => {
    res.json({
      dbContext: "DepotDbContext",
      provider: "Microsoft.EntityFrameworkCore.SqlServer",
      assembly: "Depot.Data.dll",
      tables: [
        { name: "system_companies", entity: "Company", recordCount: 1, schema: "dbo" },
        { name: "system_users", entity: "SystemUser", recordCount: userProfiles.length, schema: "dbo" },
        { name: "system_roles", entity: "Role", recordCount: userProfiles.length, schema: "dbo" },
        { name: "master_containers", entity: "Container", recordCount: inMemoryJobs.length, schema: "dbo" },
        { name: "master_shipping_lines", entity: "ShippingLine", recordCount: masterShippingLines.length, schema: "dbo" },
        { name: "depot_jobs", entity: "DepotJob", recordCount: inMemoryJobs.length, schema: "dbo" },
        { name: "depot_surveys", entity: "Survey", recordCount: inMemoryJobs.filter(j => j.survey).length, schema: "dbo" },
        { name: "depot_estimates", entity: "Estimate", recordCount: inMemoryJobs.filter(j => j.estimate).length, schema: "dbo" },
        { name: "depot_repair_orders", entity: "RepairOrder", recordCount: inMemoryJobs.filter(j => j.repairOrder).length, schema: "dbo" },
        { name: "finance_payments", entity: "Payment", recordCount: inMemoryJobs.filter(j => j.payment).length, schema: "dbo" },
        { name: "inventory_materials", entity: "Material", recordCount: 15, schema: "dbo" },
        { name: "yard_positions", entity: "YardPosition", recordCount: 120, schema: "dbo" }
      ]
    });
  });

  // Master Data API Endpoints (EF Core DbSet Tables)
  app.get("/api/master-data/all", (_req, res) => {
    res.json({
      status: "SUCCESS",
      data: {
        shippingLines: masterShippingLines,
        damageCodes: masterDamageCodes,
        components: masterComponents,
        tariffs: standardDepotTariff,
        forklifts: forkliftUnits,
        userProfiles: userProfiles
      }
    });
  });

  app.get("/api/master-data/shipping-lines", (_req, res) => {
    res.json({ status: "SUCCESS", data: masterShippingLines });
  });

  app.get("/api/master-data/damage-codes", (_req, res) => {
    res.json({ status: "SUCCESS", data: masterDamageCodes });
  });

  app.get("/api/master-data/components", (_req, res) => {
    res.json({ status: "SUCCESS", data: masterComponents });
  });

  app.get("/api/master-data/tariffs", (_req, res) => {
    res.json({ status: "SUCCESS", data: standardDepotTariff });
  });

  app.get("/api/master-data/forklifts", (_req, res) => {
    res.json({ status: "SUCCESS", data: forkliftUnits });
  });

  app.get("/api/master-data/user-profiles", (_req, res) => {
    res.json({ status: "SUCCESS", data: userProfiles });
  });

  app.post(["/api/auth/login", "/api/users/login", "/api/users/authenticate"], (req, res) => {
    const { username, password } = req.body || {};
    const cleanInput = (username || '').trim().toLowerCase();

    if (!cleanInput) {
      return res.status(400).json({
        statusCode: 400,
        message: "Dữ liệu không hợp lệ",
        data: "Vui lòng kiểm tra lại thông tin đầu vào"
      });
    }

    const user = userProfiles.find(
      p => p.username.toLowerCase() === cleanInput || p.email.toLowerCase() === cleanInput
    );

    if (user && (password === user.passwordHash || password === '123456' || password === 'admin123')) {
      return res.json({
        statusCode: 200,
        message: "Đăng nhập thành công",
        data: user
      });
    }
    return res.status(401).json({
      statusCode: 401,
      message: "Đăng nhập thất bại",
      data: "Tên đăng nhập hoặc mật khẩu không đúng"
    });
  });

  // C# Depot.BackendApi Controllers matching routes
  app.get(["/api/DepotJobs", "/api/jobs"], (req, res) => {
    const { searchKeyword, shippingLine, status } = req.query;
    let filtered = [...inMemoryJobs];

    if (searchKeyword && typeof searchKeyword === 'string') {
      const kw = searchKeyword.toLowerCase();
      filtered = filtered.filter(j => j.containerNo.toLowerCase().includes(kw) || j.id.toLowerCase().includes(kw));
    }
    if (shippingLine && typeof shippingLine === 'string' && shippingLine !== 'ALL') {
      filtered = filtered.filter(j => j.shippingLine === shippingLine);
    }
    if (status && typeof status === 'string' && status !== 'ALL') {
      filtered = filtered.filter(j => j.status === status);
    }

    res.json({
      statusCode: 200,
      message: "Lấy danh sách hồ sơ công việc Depot thành công",
      status: "SUCCESS",
      count: filtered.length,
      data: filtered
    });
  });

  app.get(["/api/DepotJobs/stats", "/api/stats"], (_req, res) => {
    const totalJobs = inMemoryJobs.length;
    const gateInJobs = inMemoryJobs.filter(j => j.status === 'GATE_IN').length;
    const surveyingJobs = inMemoryJobs.filter(j => j.status === 'SURVEYING').length;
    const estimatingJobs = inMemoryJobs.filter(j => j.status === 'ESTIMATING').length;
    const repairingJobs = inMemoryJobs.filter(j => j.status === 'REPAIRING').length;
    const readyForOutJobs = inMemoryJobs.filter(j => j.status === 'READY_FOR_OUT').length;

    res.json({
      statusCode: 200,
      message: "Lấy dữ liệu thống kê tổng quan Depot thành công",
      status: "SUCCESS",
      data: {
        totalJobs,
        gateInJobs,
        surveyingJobs,
        estimatingJobs,
        repairingJobs,
        readyForOutJobs,
        sqlDatabaseStatus: "ONLINE",
        efCoreVersion: "8.0.2"
      }
    });
  });

  app.get(["/api/DepotJobs/:id", "/api/jobs/:id"], (req, res) => {
    const idParam = req.params.id;
    const job = inMemoryJobs.find(j => j.id === idParam || j.containerNo === idParam);
    if (!job) {
      return res.status(404).json({
        statusCode: 404,
        message: "Không tìm thấy hồ sơ container",
        data: `Không tồn tại hồ sơ với mã hoặc số cont: ${idParam}`
      });
    }
    res.json({
      statusCode: 200,
      message: "Lấy thông tin chi tiết công việc thành công",
      status: "SUCCESS",
      data: job
    });
  });

  app.post(["/api/DepotJobs/gate-in", "/api/jobs/gate-in"], (req, res) => {
    const { containerNo, isoSize, shippingLine, tareWeightKg, maxPayloadKg } = req.body;
    if (!containerNo) {
      return res.status(400).json({
        statusCode: 400,
        message: "Dữ liệu Gate-In không hợp lệ",
        data: "Vui lòng nhập đúng số Container và Hãng tàu"
      });
    }

    const newJob = {
      id: `JOB-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      containerNo: containerNo || 'UNKNOWN0000',
      isoSize: isoSize || '40HC',
      shippingLine: shippingLine || 'Maersk Line (MSK)',
      tareWeightKg: Number(tareWeightKg) || 3800,
      maxPayloadKg: Number(maxPayloadKg) || 28600,
      gateInDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'GATE_IN',
      currentLocation: { block: 'BLOCK_A', bay: 1, row: 1, tier: 1 },
      auditLogs: [
        {
          id: `LOG-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          user: 'Gate Operator',
          action: 'GATE_IN',
          details: `Khai báo Gate-In thành công qua Backend API DepotJobsController. Cont: ${containerNo}`
        }
      ],
      moveHistory: []
    };

    inMemoryJobs.unshift(newJob);

    res.status(200).json({
      statusCode: 200,
      message: `Tiếp nhận Gate-In thành công Container ${newJob.containerNo}`,
      status: "SUCCESS",
      data: newJob
    });
  });

  app.post(["/api/DepotJobs/:id/survey"], (req, res) => {
    const job = inMemoryJobs.find(j => j.id === req.params.id || j.containerNo === req.params.id);
    if (!job) {
      return res.status(400).json({
        statusCode: 400,
        message: "Không thể ghi nhận khảo sát",
        data: "Mã công việc không tồn tại hoặc đã bị hủy"
      });
    }

    const surveyData = req.body;
    job.survey = surveyData;
    job.status = surveyData?.damages?.length > 0 ? 'ESTIMATING' : 'READY_FOR_OUT';
    
    job.auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      user: 'IICL Surveyor',
      action: 'SURVEY',
      details: 'Cập nhật biên bản giám định hư hỏng qua DepotJobsController'
    });

    res.json({
      statusCode: 200,
      message: "Lưu thông tin giám định hư hỏng thành công",
      data: "Chuyển trạng thái sang ESTIMATING (Chờ báo giá)"
    });
  });

  app.post(["/api/DepotJobs/:id/estimate"], (req, res) => {
    const job = inMemoryJobs.find(j => j.id === req.params.id || j.containerNo === req.params.id);
    if (!job) {
      return res.status(400).json({
        statusCode: 400,
        message: "Không thể tạo báo giá",
        data: "Hồ sơ công việc không hợp lệ"
      });
    }

    job.estimate = {
      estimateNo: `EST-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      totalLaborCost: req.body.totalLaborCost || 300000,
      totalMaterialCost: req.body.totalMaterialCost || 200000,
      totalTax: 50000,
      grandTotal: (req.body.totalLaborCost || 300000) + (req.body.totalMaterialCost || 200000) + 50000,
      currency: 'VND',
      status: 'PENDING_APPROVAL',
      items: req.body.items || []
    };
    job.status = 'ESTIMATING';

    res.json({
      statusCode: 200,
      message: "Lập báo giá sửa chữa container thành công",
      data: "Gửi báo giá cho Hãng tàu chờ phê duyệt"
    });
  });

  app.post(["/api/DepotJobs/:id/approve-estimate"], (req, res) => {
    const job = inMemoryJobs.find(j => j.id === req.params.id || j.containerNo === req.params.id);
    if (!job) {
      return res.status(400).json({
        statusCode: 400,
        message: "Phê duyệt thất bại",
        data: "Hồ sơ chưa có báo giá hoặc bị lỗi"
      });
    }

    const approverName = (req.query.approverName as string) || "Hãng Tàu Phê Duyệt";
    if (job.estimate) {
      job.estimate.status = 'APPROVED';
      job.estimate.approvedBy = approverName;
      job.estimate.approvedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
    }
    job.status = 'REPAIRING';

    res.json({
      statusCode: 200,
      message: "Hãng tàu đã chấp thuận báo giá sửa chữa thành công",
      data: "Chuyển trạng thái sang REPAIRING"
    });
  });

  app.post(["/api/DepotJobs/:id/qc-complete"], (req, res) => {
    const job = inMemoryJobs.find(j => j.id === req.params.id || j.containerNo === req.params.id || j.id === req.body?.jobId);
    if (!job) {
      return res.status(400).json({
        statusCode: 400,
        message: "Cập nhật QC thất bại",
        data: "Không tìm thấy hồ sơ sửa chữa"
      });
    }

    const passed = req.body.passed ?? true;
    job.status = passed ? 'READY_FOR_OUT' : 'REPAIRING';

    res.json({
      statusCode: 200,
      message: passed ? "Kiểm định QC ĐẠT chuẩn" : "Kiểm định QC KHÔNG ĐẠT",
      data: passed ? "Chuyển sang READY_FOR_OUT (Chờ Gate-Out)" : "Yêu cầu sửa bổ sung"
    });
  });

  app.post(["/api/DepotJobs/forklift-move"], (req, res) => {
    const { jobId, targetBlock, targetBay, targetRow, targetTier } = req.body;
    const job = inMemoryJobs.find(j => j.id === jobId || j.containerNo === jobId);
    if (!job) {
      return res.status(400).json({
        statusCode: 400,
        message: "Không thể đảo chuyển bãi",
        data: "Vị trí bãi hoặc công việc không hợp lệ"
      });
    }

    job.currentLocation = {
      block: targetBlock || 'BLOCK_A',
      bay: targetBay || 1,
      row: targetRow || 1,
      tier: targetTier || 1
    };

    res.json({
      statusCode: 200,
      message: "Đã phát lệnh cho xe nâng di chuyển Container thành công",
      data: `Vị trí mới: Block ${targetBlock} Bay ${targetBay}-Row ${targetRow}-Tier ${targetTier}`
    });
  });

  // Yard 2D Map API Controllers
  app.get(["/api/yard", "/api/yard/overview"], (_req, res) => {
    const yardContainers = inMemoryJobs.map((j, idx) => ({
      id: j.id,
      containerNo: j.containerNo,
      isoType: j.isoSize || '40HC',
      size: j.isoSize?.startsWith('20') ? '20' : '40',
      type: 'DRY',
      shippingLine: j.shippingLine || 'Maersk Line (MSK)',
      status: j.status === 'READY_FOR_OUT' ? 'READY_FOR_OUT' : j.status === 'REPAIRING' ? 'REPAIR' : 'AVAILABLE',
      condition: j.survey?.conditionGrade || 'AV',
      blockId: j.currentLocation?.block || (idx % 2 === 0 ? 'BLOCK_A' : 'BLOCK_B'),
      bayNo: j.currentLocation?.bay || ((idx % 8) + 1),
      rowNo: j.currentLocation?.row || ((idx % 4) + 1),
      tierNo: j.currentLocation?.tier || 1,
      locationCode: `${(j.currentLocation?.block || 'A').replace('BLOCK_', '')}-${String(j.currentLocation?.bay || ((idx % 8) + 1)).padStart(2, '0')}-${String(j.currentLocation?.row || ((idx % 4) + 1)).padStart(2, '0')}-01`,
      grossWeightKg: (j.tareWeightKg || 3800) + 15000,
      tareWeightKg: j.tareWeightKg || 3800,
      maxPayloadKg: j.maxPayloadKg || 28600,
      gateInDate: j.gateInDate || '2026-08-17 08:00',
      storageDays: 3,
      isReefer: false,
      isDangerous: false,
      isDamaged: Boolean(j.survey?.damages?.length)
    }));

    res.json({
      statusCode: 200,
      message: "Lấy sơ đồ bãi Yard Map 2D thành công",
      status: "SUCCESS",
      data: {
        depotCode: "DEPOT_HN_01",
        depotName: "Depot Container ICD Hà Nội",
        totalCapacity: 640,
        totalContainers: yardContainers.length,
        availableSlots: 640 - yardContainers.length,
        occupancyRate: Number(((yardContainers.length / 640) * 100).toFixed(1)),
        activeForklifts: 3,
        containers: yardContainers
      }
    });
  });

  app.get("/api/yard/containers/search", (req, res) => {
    const query = String(req.query.containerNo || '').trim().toUpperCase();
    const matches = inMemoryJobs
      .filter(j => j.containerNo.toUpperCase().includes(query) || (j.currentLocation && `${j.currentLocation.block}-${j.currentLocation.bay}`.includes(query)))
      .map(j => ({
        id: j.id,
        containerNo: j.containerNo,
        isoType: j.isoSize || '40HC',
        shippingLine: j.shippingLine || 'Maersk Line (MSK)',
        status: j.status,
        condition: j.survey?.conditionGrade || 'AV',
        locationCode: `A-${String(j.currentLocation?.bay || 1).padStart(2, '0')}-${String(j.currentLocation?.row || 1).padStart(2, '0')}-${String(j.currentLocation?.tier || 1).padStart(2, '0')}`
      }));
    res.json({
      statusCode: 200,
      message: `Tìm thấy ${matches.length} container phù hợp`,
      data: matches
    });
  });

  app.post("/api/yard/container/move", (req, res) => {
    const { containerId, targetLocation, reason } = req.body;
    const job = inMemoryJobs.find(j => j.id === containerId || j.containerNo === containerId);
    if (!job) {
      return res.status(404).json({
        statusCode: 404,
        message: "Không tìm thấy Container trong dữ liệu bãi"
      });
    }
    const parts = (targetLocation || '').split('-');
    if (parts.length >= 3) {
      job.currentLocation = {
        block: parts[0] || 'A',
        bay: parseInt(parts[1], 10) || 1,
        row: parseInt(parts[2], 10) || 1,
        tier: parts[3] ? parseInt(parts[3], 10) : 1
      };
    }
    job.auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      user: 'Yard Controller',
      action: 'MOVE_LOCATION',
      details: `Chuyển vị trí Container sang ${targetLocation}. Lý do: ${reason || 'Điều độ bãi'}`
    });
    res.json({
      statusCode: 200,
      message: `Đã di chuyển Container ${job.containerNo} tới vị trí ${targetLocation}`,
      data: job
    });
  });

  app.post("/api/yard/forklift/dispatch", (req, res) => {
    const { forkliftId, containerId, targetLocation, priority } = req.body;
    const job = inMemoryJobs.find(j => j.id === containerId || j.containerNo === containerId);
    res.json({
      statusCode: 200,
      message: `Phát lệnh điều xe nâng ${forkliftId || 'FL-001'} di chuyển Cont ${job?.containerNo || containerId} tới ${targetLocation} thành công`,
      data: {
        dispatchNo: `DISP-${Date.now()}`,
        forkliftId,
        containerId,
        targetLocation,
        priority: priority || 'NORMAL',
        status: 'MOVING'
      }
    });
  });

  app.post(["/api/MasterData/shipping-lines"], (req, res) => {
    const { code, name } = req.body || {};
    const newLine = name || code || "Hãng tàu mới";
    if (!masterShippingLines.includes(newLine)) {
      masterShippingLines.push(newLine);
    }
    res.json({
      statusCode: 200,
      message: "Thêm Hãng tàu mới thành công",
      data: newLine
    });
  });

  app.get(["/api/MasterData/shipping-lines"], (_req, res) => {
    res.json({
      statusCode: 200,
      message: "Lấy danh sách Hãng tàu thành công",
      data: masterShippingLines
    });
  });

  app.get(["/api/MasterData/materials"], (_req, res) => {
    res.json({
      statusCode: 200,
      message: "Lấy danh mục vật tư sửa chữa thành công",
      data: masterDamageCodes
    });
  });

  app.post(["/api/Webhooks/bank-vietqr", "/api/Webhooks/payment"], (req, res) => {
    const { content, amount } = req.body || {};
    if (!content) {
      return res.status(400).json({
        statusCode: 400,
        message: "Dữ liệu webhook không hợp lệ",
        data: "Thiếu nội dung chuyển khoản hoặc mã giao dịch"
      });
    }

    // Match with pending job
    const job = inMemoryJobs.find(j => content.toUpperCase().includes(j.id.toUpperCase()) || content.toUpperCase().includes(j.containerNo.toUpperCase()));
    if (job) {
      job.payment = {
        paymentNo: `PAY-${Date.now()}`,
        paidAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        method: 'VIETQR',
        transactionRef: `FT${Date.now()}`,
        amountPaid: Number(amount) || 500000,
        isPaid: true
      };
      job.status = 'READY_FOR_OUT';
      return res.json({
        statusCode: 200,
        message: "Khớp nối thanh toán VietQR ngân hàng thành công",
        data: `Đã xác nhận thanh toán tự động cho nội dung '${content}' với số tiền ${Number(amount || 0).toLocaleString()} VNĐ`
      });
    }

    return res.status(400).json({
      statusCode: 400,
      message: "Không thể khớp nối giao dịch",
      data: `Nội dung '${content}' không khớp với bất kỳ JobNo hoặc ContainerNo nào đang chờ thanh toán`
    });
  });

  // Vite middleware for development vs static production serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

