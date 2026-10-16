import express from "express";
import compression from "compression";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

// Không còn dữ liệu mẫu in-memory: mọi /api/* chuyển tiếp sang Depot.BackendApi (dữ liệu PostgreSQL).

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const BACKEND_API_URL = process.env.DEPOT_BACKEND_URL || "http://localhost:50210";

  // BUG-031: không lộ "X-Powered-By: Express" và bổ sung header bảo mật cơ bản. Chưa đặt CSP đầy đủ vì app
  // còn tải font/ảnh từ nguồn ngoài — chỉ chặn nhúng trang vào iframe của site khác (clickjacking).
  app.disable("x-powered-by");
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("Content-Security-Policy", "frame-ancestors 'self'");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    next();
  });
  // BUG-015: bundle JS ~2,8 MB trước đây gửi nguyên không nén.
  app.use(compression());
  app.use(express.json());

  // Tải file (ảnh Survey/Sửa chữa...) từ Depot.FileServer — URL ảnh backend trả về là tương đối
  // "/api/files/{fileId}/{tên}" nên trình duyệt luôn gọi qua đây, FileServer chỉ cần lắng nghe nội bộ
  // (127.0.0.1) cả ở dev lẫn VPS. Đặt TRƯỚC middleware forward /api/* bên dưới vì middleware đó đọc body
  // dạng text (làm hỏng dữ liệu nhị phân) và gửi sang BackendApi chứ không phải FileServer. Chỉ GET —
  // upload/xóa vẫn đi qua BackendApi (/api/depot-files, /api/DepotJobs/{id}/repair/photos).
  const FILE_SERVER_URL = process.env.DEPOT_FILESERVER_URL || "http://localhost:50211";
  // Chỉ người đã đăng nhập mới tải được file (BUG-013). JWT nằm ở cookie depot_file_token (token.service.ts);
  // hỏi BackendApi xác thực — server.ts không giữ khoá JWT — rồi nhớ kết quả 60 giây để không gọi lại cho mỗi ảnh.
  const fileTokenCache = new Map<string, number>();
  const readCookie = (header: string | undefined, name: string) =>
    header?.split(";").map((part) => part.trim()).find((part) => part.startsWith(name + "="))?.slice(name.length + 1);
  const isFileTokenValid = async (token: string) => {
    const now = Date.now();
    if ((fileTokenCache.get(token) ?? 0) > now) return true;
    const check = await fetch(`${BACKEND_API_URL}/api/depot-files/access-check`, { headers: { Authorization: `Bearer ${token}` } });
    if (!check.ok) return false;
    if (fileTokenCache.size > 1000) fileTokenCache.clear();
    fileTokenCache.set(token, now + 60_000);
    return true;
  };
  app.get("/api/files/:fileId/:storedName", async (req, res) => {
    try {
      const token = readCookie(req.headers.cookie, "depot_file_token");
      if (!token || !(await isFileTokenValid(decodeURIComponent(token)))) {
        res.status(401).json({ statusCode: 401, message: "Cần đăng nhập để xem file" });
        return;
      }
      const fileResponse = await fetch(
        `${FILE_SERVER_URL}/api/files/${encodeURIComponent(req.params.fileId)}/${encodeURIComponent(req.params.storedName)}`
      );
      res.status(fileResponse.status);
      if (!fileResponse.ok) {
        res.end();
        return;
      }
      res.setHeader("Content-Type", fileResponse.headers.get("content-type") || "application/octet-stream");
      res.setHeader("Cache-Control", "private, max-age=86400");
      res.send(Buffer.from(await fileResponse.arrayBuffer()));
    } catch {
      res.status(502).json({ statusCode: 502, message: "Không thể kết nối Depot.FileServer" });
    }
  });

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

    // Trước đây MỌI request (kể cả upload file multipart/form-data) đều bị ép cứng thành
    // Content-Type: application/json + body = JSON.stringify(req.body) khi forward sang .NET —
    // dữ liệu file nhị phân thật bị vứt bỏ hoàn toàn, backend luôn từ chối 415 dù frontend gửi đúng.
    // express.json() ở trên chỉ parse khi Content-Type khớp application/json, multipart thì bỏ qua và
    // giữ nguyên stream — forward thẳng req (raw stream) + đúng Content-Type gốc (còn nguyên boundary)
    // thay vì ép JSON.
    const contentType = req.headers["content-type"] || "";
    const isMultipart = contentType.toLowerCase().startsWith("multipart/form-data");
    const isBodyless = ["GET", "HEAD"].includes(req.method);

    // Chuyển tiếp JWT của người dùng sang backend — thiếu dòng này mọi API đều trả 401 vì backend yêu cầu
    // đăng nhập. Chỉ forward đúng header Authorization, không forward các header khác của client.
    const forwardHeaders: Record<string, string> = isMultipart
      ? { "Content-Type": contentType }
      : { "Content-Type": "application/json" };
    if (typeof req.headers.authorization === "string") {
      forwardHeaders["Authorization"] = req.headers.authorization;
    }

    try {
      const backendResponse = await fetch(`${BACKEND_API_URL}${backendPath}`, {
        method: req.method,
        headers: forwardHeaders,
        body: isBodyless ? undefined : (isMultipart ? (req as any) : JSON.stringify(req.body || {})),
        ...(isMultipart && !isBodyless ? { duplex: "half" } : {})
      } as any);
      const responseText = await backendResponse.text();
      res.status(backendResponse.status);
      res.setHeader("Content-Type", backendResponse.headers.get("content-type") || "application/json");
      // Tổng số dòng khi gọi danh sách có phân trang (?page=&pageSize=) — xem DepotJobsController.GetAllJobs.
      const totalCount = backendResponse.headers.get("x-total-count");
      if (totalCount) res.setHeader("X-Total-Count", totalCount);
      res.send(responseText);
    } catch (error) {
      res.status(502).json({
        statusCode: 502,
        message: "Không thể kết nối Backend .NET",
        data: error instanceof Error ? error.message : "Backend unavailable"
      });
    }
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
    // File trong /assets có hash trong tên nên cache lâu dài được; index.html luôn tải lại để nhận bản build mới.
    app.use(express.static(distPath, {
      setHeaders: (res, filePath) => {
        res.setHeader("Cache-Control", filePath.includes(`${path.sep}assets${path.sep}`)
          ? "public, max-age=31536000, immutable"
          : "no-cache");
      }
    }));
    app.get('*', (_req, res) => {
      res.setHeader("Cache-Control", "no-cache");
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

