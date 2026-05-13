# Design Document: Admin Home Screen

## Overview

Tính năng này nâng cấp và hợp nhất `ManagerHomeScreen.tsx` và `GarageManagementScreen.tsx` thành một màn hình Home thống nhất, hiện đại cho vai trò `garage_manager` và `garage_admin`. Màn hình mới hiển thị Active Orders ngay đầu trang, tiếp theo là KPI Cards, rồi đến các Management Sections theo từng nghiệp vụ, và Quick Actions Bar.

Thiết kế tuân thủ pattern container/hook/view của codebase:
- `ManagerHomeScreen.tsx` — container mỏng, chỉ kết nối hook với view
- `useManagerHomeScreen.ts` (tại `src/hooks/`) — hook chứa toàn bộ logic nghiệp vụ
- `ManagerHomeScreenView.tsx` — view thuần nhận props, không gọi API hay đọc Redux trực tiếp

Spec này cũng bao gồm kiểm thử tích hợp API cho toàn bộ luồng CRUD của các resource admin.

---

## Architecture

### Component Hierarchy

```
ManagerHomeScreen.tsx (container)
  └── useManagerHomeScreen.ts (hook - all logic)
  └── ManagerHomeScreenView.tsx (pure view)
        ├── Header (garageName, userName, notification bell)
        ├── ActiveOrdersSection.tsx
        │     └── OrderCard (per order)
        ├── KPISection.tsx (existing, enhanced)
        │     └── KPICard (per KPI)
        ├── ManagementSection.tsx (new unified section)
        │     └── ManagementCard (per business domain)
        ├── QuickActionsBar.tsx
        └── EmptyState / SkeletonLoader
```

### Data Flow

```
Redux Store (authSlice, garageContextSlice)
        │
        ▼
useManagerHomeScreen (hook)
  ├── useGetManagerHomeSummaryQuery   → KPI stats
  ├── useGetManagerHomeOrdersQuery    → Active orders list
  ├── useGetManagerHomeNotificationsQuery → Unread count
  └── useGetAdminStatsQuery (×N)     → Management section stats
        │
        ▼ (view-model object)
ManagerHomeScreenView (pure view)
  ├── ActiveOrdersSection
  ├── KPISection
  ├── ManagementSection (×N)
  └── QuickActionsBar
```

### Role-Based Rendering

```
authSlice.userType
    │
    ├── isManagerRole() → true  → render full Admin Home Screen
    │                              (garage_manager: no SuperAdmin section)
    │                              (garage_admin: include SuperAdmin section)
    └── isManagerRole() → false → redirect to role-appropriate screen
```

---

## Components and Interfaces

### ManagerHomeScreen.tsx (Container)

Container mỏng, chỉ kết nối hook với view. Không chứa logic nghiệp vụ.

```typescript
// src/screens/Home/ManagerHomeScreen.tsx
export default function ManagerHomeScreen() {
  const viewModel = useManagerHomeScreen({ isEnabled: true });
  return <ManagerHomeScreenView {...viewModel} />;
}
```

### useManagerHomeScreen.ts (Hook)

Hook chứa toàn bộ logic. Xuất một view-model object rõ ràng.

```typescript
// src/hooks/useManagerHomeScreen.ts

export interface ManagerHomeViewModel {
  // Data
  activeOrders: ServiceOrder[];          // orders với active statuses
  pendingOrders: ServiceOrder[];         // received/pending/confirmed
  processingOrders: ServiceOrder[];      // in_progress/processing/ready_for_pickup
  overdueOrders: ServiceOrder[];         // past delivery_date, not closed
  completedTodayCount: number;
  alertsCount: number;
  kpis: KPI[];
  managementStats: ManagementSectionData[];
  isSuperAdmin: boolean;

  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;

  // Handlers
  onRefresh: () => Promise<void>;
  onOrderPress: (orderId: string | number) => void;
  onSectionPress: (sectionKey: string) => void;
  onQuickAction: (action: QuickActionKey) => void;
  onNotificationPress: () => void;
  onGaragePress: () => void;

  // Header data
  garageName: string;
  userName: string;
  unreadNotificationsCount: number;
}

export type QuickActionKey = 'create_order' | 'add_customer' | 'view_all_orders';

export interface ManagementSectionData {
  key: string;
  icon: string;
  title: string;
  totalCount: number;
  activeCount: number;
  subtitle: string;
  onPress: () => void;
}
```

### ManagerHomeScreenView.tsx (Pure View)

View thuần nhận toàn bộ dữ liệu qua props từ hook. Không gọi API, không đọc Redux.

```typescript
// src/screens/Home/ManagerHomeScreenView.tsx
interface ManagerHomeScreenViewProps extends ManagerHomeViewModel {}

export function ManagerHomeScreenView(props: ManagerHomeScreenViewProps) {
  // Renders all sections using props only
}
```

### ActiveOrdersSection.tsx

```typescript
// src/components/ManagerHome/ActiveOrdersSection.tsx
interface ActiveOrdersSectionProps {
  orders: ServiceOrder[];
  isLoading: boolean;
  isError: boolean;
  onOrderPress: (orderId: string | number) => void;
  onRetry: () => void;
}
```

### ManagementSection.tsx

```typescript
// src/components/ManagerHome/ManagementSection.tsx
interface ManagementSectionProps {
  sections: ManagementSectionData[];
  isLoading: boolean;
}
```

### QuickActionsBar.tsx

```typescript
// src/components/ManagerHome/QuickActionsBar.tsx
interface QuickActionsBarProps {
  onCreateOrder: () => void;
  onAddCustomer: () => void;
  onViewAllOrders: () => void;
}
```

---

## Data Models

### Active Order Statuses

```typescript
// Statuses displayed in Active Orders Section
const ACTIVE_ORDER_STATUSES = new Set([
  'received',
  'pending',
  'confirmed',
  'in_progress',
  'processing',
  'ready_for_pickup',
]);
```

### KPI Computation

KPI values are sourced with priority:
1. `GET /api/app/manager/home/summary` → `stats` object
2. Fallback: computed from orders list fetched via `GET /api/app/manager/home/orders`

```typescript
interface KPI {
  key: 'pending' | 'processing' | 'overdue' | 'completed_today' | 'notifications';
  label: string;
  value: number;
  isAlert?: boolean;  // true when key === 'overdue' && value > 0
}
```

### Management Stats

Each management section fetches stats from `GET /api/app/admin/{resource}/stats`:

| Section Key    | Resource              | Stats Fields                                    |
|----------------|-----------------------|-------------------------------------------------|
| customers      | customers             | total_customers, active_customers               |
| employees      | employees             | total_employees, active_employees               |
| orders         | service-orders        | total_orders, processing_orders                 |
| services       | services              | total_services                                  |
| products       | products              | total_products                                  |
| offers         | offers                | total_offers, active_offers                     |
| vehicles       | vehicles              | total_vehicles, vehicles_due_inspection         |
| warranties     | warranties            | total_warranties, active_warranties             |
| notifications  | notifications         | total_notifications, alerts                     |

### AdminStats Type (existing in adminGarageApi.ts)

```typescript
interface AdminStats {
  [key: string]: number | string | null | undefined;
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Active orders contain only active statuses

*For any* list of service orders returned by the manager home orders API, after filtering through `useManagerHomeScreen`, every order in `activeOrders` SHALL have a status that belongs to the active status set (`received`, `pending`, `confirmed`, `in_progress`, `processing`, `ready_for_pickup`), and no order with a closed status (`completed`, `cancelled`, `canceled`) SHALL appear in `activeOrders`.

**Validates: Requirements 1.2, 1.3**

### Property 2: KPI values are non-negative integers

*For any* manager home summary response (including null/empty), the computed KPI array SHALL contain exactly 4 entries (`pending`, `processing`, `overdue`, `completed_today`), and each value SHALL be a non-negative integer (≥ 0).

**Validates: Requirements 2.1, 2.2, 2.3**

### Property 3: KPI fallback consistency

*For any* orders list, when the summary API returns no valid stats, the KPI values computed from the orders list SHALL equal the count of orders matching each status group — i.e., `pending` = count of orders with PENDING_STATUSES, `processing` = count with PROCESSING_STATUSES, `overdue` = count of non-closed orders past their delivery_date.

**Validates: Requirements 2.3**

### Property 4: Overdue alert flag

*For any* KPI array, the `overdue` KPI entry SHALL have `isAlert: true` if and only if its value is greater than 0.

**Validates: Requirements 2.5**

### Property 5: Management stats error isolation

*For any* set of admin stats API responses where one or more return errors, the `managementStats` array SHALL still contain an entry for every section, and sections with errors SHALL have `totalCount = 0` and `activeCount = 0` (displayed as "—" in the UI), while sections with successful responses SHALL display their actual values.

**Validates: Requirements 3.4**

### Property 6: Role-based section visibility

*For any* authenticated user, the `isSuperAdmin` flag in the view-model SHALL be `true` if and only if `authSlice.userType === 'garage_admin'`, and the SuperAdmin section SHALL be rendered if and only if `isSuperAdmin` is `true`.

**Validates: Requirements 3.6, 14.2, 14.3**

### Property 7: Order status filter round-trip

*For any* array of `ServiceOrder` objects with arbitrary statuses, partitioning them into `pendingOrders`, `processingOrders`, and `activeOrders` SHALL be mutually exclusive and collectively exhaustive for non-closed orders — i.e., every non-closed order appears in exactly one of the active sub-groups, and no order appears in more than one group.

**Validates: Requirements 1.2, 1.3**

---

## Error Handling

### API Error Strategy

| Scenario | Behavior |
|---|---|
| `GET /manager/home/orders` fails | Show error state in ActiveOrdersSection with "Thử lại" button; KPI falls back to 0 |
| `GET /manager/home/summary` fails | KPI falls back to computed values from orders list |
| `GET /admin/{resource}/stats` fails | ManagementSection shows "—" for that resource; other sections unaffected |
| HTTP 401 on any request | Redirect to Login screen |
| HTTP 403 on any request | Show access denied state; do not crash |
| `garageContext.garageName` empty | Header shows "Garage Dashboard" fallback |

### Loading States

- **Initial load**: Full-screen skeleton for ActiveOrders + KPI sections until `orders` and `summary` queries complete
- **Management stats**: Each ManagementCard shows skeleton independently while its stats query is loading
- **Pull-to-refresh**: `RefreshControl` indicator shown; hidden when all queries complete (success or error)

### Role Guard

```typescript
// In useManagerHomeScreen or ManagerHomeScreen container
const userType = useAppSelector(state => state.auth.userType);
if (!isManagerRole(userType)) {
  // Navigate away — handled by AppNavigator's withRoleGuard HOC
}
```

---

## Testing Strategy

### Unit Tests

Focus on pure logic functions that can be tested in isolation:

- `categorizeOrders(orders)` — verify correct partitioning into pending/processing/overdue/active groups
- `computeKPIs(summary, unreadCount)` — verify KPI array shape, fallback logic, and alert flag
- `buildManagementStats(statsMap)` — verify error isolation (one failing stat doesn't affect others)
- `isManagerRole(userType)` — verify role guard logic for all user types
- `isSuperAdminRole(userType)` — verify super admin detection

### Property-Based Tests

Using a property-based testing library (e.g., `fast-check` for TypeScript/Jest):

Each property test runs a minimum of **100 iterations** with randomly generated inputs.

Tag format: `Feature: admin-home-screen, Property {N}: {property_text}`

**Property 1 test** — Generate random arrays of `ServiceOrder` with arbitrary statuses. Assert that `activeOrders` contains only orders with active statuses and no closed-status orders.
`// Feature: admin-home-screen, Property 1: Active orders contain only active statuses`

**Property 2 test** — Generate random `ManagerHomeSummary` objects (including null, empty, partial). Assert that `computeKPIs` always returns exactly 4 entries with non-negative integer values.
`// Feature: admin-home-screen, Property 2: KPI values are non-negative integers`

**Property 3 test** — Generate random orders lists. Assert that KPI fallback values match manual counts of orders by status group.
`// Feature: admin-home-screen, Property 3: KPI fallback consistency`

**Property 4 test** — Generate random KPI arrays with varying overdue values. Assert that `isAlert` is true iff value > 0.
`// Feature: admin-home-screen, Property 4: Overdue alert flag`

**Property 5 test** — Generate random stats response maps with some entries as errors. Assert that `managementStats` always has an entry per section, with error entries showing 0/0.
`// Feature: admin-home-screen, Property 5: Management stats error isolation`

**Property 6 test** — Generate random `AuthUserType` values. Assert that `isSuperAdmin` matches `userType === 'garage_admin'` exactly.
`// Feature: admin-home-screen, Property 6: Role-based section visibility`

**Property 7 test** — Generate random orders arrays. Assert that partitioning into pending/processing/active is mutually exclusive and collectively exhaustive for non-closed orders.
`// Feature: admin-home-screen, Property 7: Order status filter round-trip`

### Integration Tests (API CRUD Flows)

These tests verify that the app correctly integrates with the backend API. They use real HTTP calls (or MSW mocks) and test 1–3 representative examples per endpoint.

**Requirements 8–13** map directly to integration test suites:

- **Service Orders CRUD** (Req 8): GET list, POST create, GET by id, PUT status, PATCH assign, PATCH complete, DELETE, GET stats
- **Customers CRUD** (Req 9): GET list, POST create, GET by id, PUT/PATCH update, DELETE, GET vehicles, PUT driver-license, GET stats
- **Employees CRUD** (Req 10): GET list, POST create, GET by id, PUT update, DELETE, POST assign-order, GET stats
- **Catalog CRUD** (Req 11): Services (GET/POST/PUT/DELETE), Products (GET/POST/PUT/DELETE), Offers (GET/POST/PUT/DELETE)
- **Operations CRUD** (Req 12): Vehicles (GET/GET by id/PUT/DELETE/search/inspection), Warranties (GET/POST/PUT/DELETE)
- **Manager Home Endpoints** (Req 13): GET summary, GET orders, GET notifications, role-based 401/403

Each integration test verifies:
1. Response has `success: true`
2. Response data can be parsed into the expected TypeScript type
3. Mutations return the created/updated resource
4. Error cases return appropriate HTTP status codes

### Smoke Tests

- Role guard: non-manager roles cannot access Admin Home Screen
- Token expiry: 401 response triggers navigation to Login
