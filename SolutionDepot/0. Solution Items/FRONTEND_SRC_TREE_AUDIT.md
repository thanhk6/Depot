# Frontend src tree audit

## Entry points

- `src/main.tsx`: React bootstrap.
- `src/App.tsx`: application shell, active tab, providers, container data load.
- `src/app/providers.tsx`: provider composition used by the app.
- `src/api/index.ts`: public API facade.

## Runtime architecture

```text
src/main.tsx
  -> App.tsx
      -> AuthProvider / DepotProvider
      -> components/layout/Sidebar
      -> modules/*/pages/*
          -> modules/*/components/*
          -> src/api/*
              -> server.ts proxy :3000
                  -> Depot.BackendApi :50210
                      -> Depot.Application
                          -> Depot.Data / SQL Server
```

## Directory responsibilities

- `api/`: Axios clients, endpoint constants, one public facade at `api/index.ts`.
- `app/`: providers, Redux/UI state.
- `components/`: reusable shell and shared UI.
- `context/`: auth, depot, permission, theme, language contexts.
- `features/`: older feature facades that re-export components from `components/tabs`.
- `modules/`: active screen implementations selected by `App.tsx`.
- `services/`: shared services and legacy mock data store.
- `types/`: shared TypeScript contracts.
- `data/`: role/menu/master data; inspect before treating data as backend-owned.
- `utils/`: formatting and pure helpers.

## Active API-backed paths

- `modules/gate/pages/GateInPage.tsx` -> `api/container.api.ts` -> Gate-In API.
- `modules/survey/pages/SurveyModulePage.tsx` -> `api/container.api.ts` and `api/survey.api.ts`.
- `modules/estimate/pages/EstimatePage.tsx` -> `api/container.api.ts` and `api/estimate.api.ts`.
- `modules/payment/pages/PaymentPage.tsx` -> `api/payment.api.ts`.
- `modules/system/pages/SystemPage.tsx` -> `api/user.api.ts` and Job audit logs.
- `App.tsx` -> `api/container.api.ts` for operational containers.

## Known remaining local/mock branches

Search targets for the next audit pass:

- `modules/billing/mockData.ts`
- `modules/warehouse/mockData.ts` and `warehouse/services/warehouseService.ts`
- `modules/customer/data/*`
- `modules/notifications/services/notificationService.ts`
- `modules/forklift/mockData.ts`
- `modules/gate_out/data/gateOutMockData.ts`
- `modules/masterdata/*MockData*`
- `modules/operation/mockData.ts`
- `modules/shipping_api/data/carrierApiConfigs.ts`
- `modules/system/data/rbacMockData.ts`
- `services/mockDataStore.ts`
- legacy routes in `server.ts` after the forwarding middleware.

These files are not automatically safe to delete yet because their UI components still depend on their types and local state. Each branch needs an entity, API contract, service, controller, migration, and UI adapter before removal.
