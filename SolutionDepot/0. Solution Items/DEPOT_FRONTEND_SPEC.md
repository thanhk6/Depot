# DEPOT FRONTEND DOCUMENTATION

Phiên b?n: 2026
M?c tiêu: Tài li?u giao di?n frontend cho `Depot.Frontend` ???c t?p trung vào `SolutionDepot\0. Solution Items` ?? làm tài li?u tham kh?o.

## 1. T?ng quan
- Framework: React + TypeScript
- Build tool: Vite
- UI: Tailwind CSS
- Data fetching: React Query (TanStack)
- Real-time: SignalR / WebSocket

## 2. C?u trúc project
- `src/pages/` - route pages
- `src/components/` - reusable components
- `src/features/` - domain features
- `src/services/api/` - axios & API clients
- `src/hooks/` - custom hooks
- `src/styles/` - Tailwind config & global styles

## 3. API contract & Auth
- Use OpenAPI generated types if available
- JWT auth via httpOnly cookie or in-memory with refresh token

## 4. Testing
- Unit: Jest + React Testing Library
- E2E: Playwright

## 5. Deployment
- Build static assets and host via CDN or static server
- CI: lint -> test -> build -> publish artifacts

