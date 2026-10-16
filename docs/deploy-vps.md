# Quy tắc deploy SolutionDepot: Docker Hub → VPS

Áp dụng cho mọi lần đưa bản local lên VPS demo (`depot.matran.com.vn`).

## 0. Điều kiện bắt buộc

- **Chỉ deploy khi người dùng yêu cầu rõ ràng** ("deploy", "push lên docker và pull về vps"…). Mặc định chỉ làm trên local.
- Change OpenSpec liên quan đã **apply + kiểm thử xong trên local** (http://127.0.0.1:3000) và nên đã archive.
- Build sạch trước khi đóng image:
  - `dotnet build SolutionDepot/SolutionDepot.sln` không lỗi (dừng `Depot.BackendApi` đang chạy trước).
  - `cd fontend && npx tsc --noEmit -p .` không lỗi.
- Liệt kê migration EF Core mới chưa có trên VPS (so `SolutionDepot/2. Domain/Depot.Data/Migrations/` với lần deploy trước) và báo người dùng — migration **tự chạy** khi backend khởi động trên VPS.
- Không đưa mật khẩu, khoá API, `.env` vào Git, tài liệu hay đặc tả. Mật khẩu SSH do người dùng cung cấp khi cần, không lưu lại.

## 1. Build và push image lên Docker Hub (máy dev)

Tài khoản Docker Hub `thanhnguyenit89` đã đăng nhập sẵn trên máy dev. Mỗi image gắn **2 tag**: `latest` và tag theo ngày `YYYYMMDD` (thêm `b`, `c`… nếu deploy nhiều lần trong ngày) để có thể quay lại bản cũ.

```bash
TAG=20261016            # đổi theo ngày deploy
U=thanhnguyenit89

# Backend + FileServer: context = thư mục gốc repo
docker build -f Dockerfile.backend    -t $U/depot-backend:latest    -t $U/depot-backend:$TAG .
docker build -f Dockerfile.fileserver -t $U/depot-fileserver:latest -t $U/depot-fileserver:$TAG .
# Frontend: context = thư mục fontend
docker build -t $U/depot-cms:latest -t $U/depot-cms:$TAG ./fontend

for img in depot-backend depot-fileserver depot-cms; do
  docker push $U/$img:latest
  docker push $U/$img:$TAG
done
```

Chỉ build lại image có thay đổi (ví dụ chỉ sửa giao diện thì chỉ cần `depot-cms`), nhưng tag ngày phải ghi rõ image nào đã đẩy.

## 2. Sao lưu trên VPS trước khi pull

VPS `160.187.146.176`, thư mục `/opt/depot` (`docker-compose.yml` = `docker-compose.vps.yml` của repo, kèm `.env`). Từ Windows dùng `plink` / `pscp` (PuTTY).

```bash
cd /opt/depot && mkdir -p backups
# PostgreSQL cài thẳng trên VPS (127.0.0.1:5432) — user/DB đọc từ .env
pg_dump -h 127.0.0.1 -U <DB_USER> -Fc <DB_NAME> > backups/db-$TAG.dump
tar czf backups/storage-files-$TAG.tgz storage-files
```

Bắt buộc sao lưu khi có migration mới hoặc có sửa dữ liệu.

## 3. Pull và chạy lại trên VPS

```bash
cd /opt/depot
# .env để TAG=latest (mặc định). Muốn chạy đúng 1 bản thì đặt TAG=<YYYYMMDD> trong .env.
docker compose pull
docker compose up -d
docker compose ps        # 3 service fileserver → backend → frontend đều "healthy"
```

Nếu `docker-compose.vps.yml` trong repo có thay đổi thì chép lên `/opt/depot/docker-compose.yml` trước khi pull (`pscp`).

## 4. Kiểm tra sau deploy

- `curl -s http://127.0.0.1:50210/api/health` trên VPS trả 200.
- `docker logs depot-backend --tail 50` không có lỗi migration.
- Mở https://depot.matran.com.vn, đăng nhập, mở thử màn vừa thay đổi.
- Không đăng nhập thử nhiều lần bằng mật khẩu trong `.env` (`ADMIN_PASSWORD` có thể không còn đúng — dễ khoá tài khoản).

## 5. Quay lại bản cũ (rollback)

```bash
cd /opt/depot
# đặt TAG=<tag ngày cũ> trong .env rồi:
docker compose pull && docker compose up -d
```

Migration EF Core không tự quay ngược — nếu bản mới đã chạy migration, khôi phục DB bằng `pg_restore` từ `backups/db-<TAG>.dump`.

## 6. Lưu ý VPS dùng chung

- VPS còn chạy dự án `doanhnghiep-*` và Caddy dùng chung (`proxy-caddy`, `/opt/proxy/Caddyfile`) — **không** `docker compose down` toàn máy, không đụng container khác.
- Dữ liệu trên VPS là demo; chỉ xoá / sửa dữ liệu khi người dùng yêu cầu.

## 7. Ghi lại sau mỗi lần deploy

Báo người dùng: tag đã đẩy, image nào, migration nào đã chạy, đường dẫn bản sao lưu. Nhắc đổi mật khẩu SSH nếu mật khẩu đã được gửi qua chat.
