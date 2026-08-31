# Dockerfile cho frontend (React + Vite + Express server.ts).
# Build context = thư mục "fontend" (xem docker-compose.yml).

# ===== Stage 1: Build =====
FROM node:20-alpine AS build
WORKDIR /app

# Copy trước package.json + lockfile để cache layer "npm install" khi source code đổi
# nhưng dependency không đổi.
COPY package.json package-lock.json* ./
RUN npm install

COPY . .
# vite build (ra thư mục dist/) + đóng gói server.ts thành dist/server.cjs (Express server
# vừa serve static SPA vừa proxy /api/* sang backend .NET qua biến môi trường DEPOT_BACKEND_URL).
RUN npm run build

# ===== Stage 2: Runtime =====
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# server.cjs được build với --packages=external nên vẫn cần node_modules thật ở runtime
# (express, vite...) — copy nguyên node_modules từ stage build để không phải cài lại.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/dist ./dist

EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=5s --retries=10 --start-period=15s \
    CMD wget -q -O- http://localhost:3000/api/health || exit 1

CMD ["node", "dist/server.cjs"]
