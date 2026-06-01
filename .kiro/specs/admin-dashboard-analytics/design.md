# Design Document — Admin Dashboard Analytics

## Overview

Xây dựng lại `GarageManagementScreen` thành một dashboard quản lý trực quan, bổ sung biểu đồ thống kê theo khoảng thời gian (1d / 3d / 7d / 1m / 1y). Thiết kế giữ nguyên phần "Tổng quan nghiệp vụ" tĩnh hiện có và thêm phần analytics mới phía trên.

---

## Architecture

### Tổng quan luồng dữ liệu

```
GarageManagementScreen
  ├── [NEW] AnalyticsSection
  │     ├── PeriodSelector          (state: activePeriod)
  │     ├── KpiCardsRow             (data: analytics.kpi)
  │     │     ├── KpiCard (Tổng đơn)
  │     │     ├── KpiCard (Khách mới)
  │     │     ├── KpiCard (Hoàn thành)
  │     │     └── KpiCard (Đang xử lý)
  │     ├── OrdersBarChart          (data: analytics.series.orders)
  │     └── NewCustomersLineChart   (data: analytics.series.new_customers)
  │
  └── [EXISTING] StaticOverviewSection
        └── 9 dashboard cards (giữ nguyên)
```

### Thư viện mới cần cài

```bash
# Frontend
npm install react-native-gifted-charts@^1.4.0
# Không cần pod install thêm vì dùng react-native-svg đã có sẵn
```

### Backend — file mới

```
src/
  controllers/
    analyticsController.js          ← controller mới
  routes/web/
    index.js                        ← thêm mount analytics router
    analytics.js                    ← router mới: GET /analytics
```

---

## Components

### 1. `PeriodSelector`

**File:** `src/components/ui/PeriodSelector.tsx`

```typescript
type TimePeriod = '1d' | '3d' | '7d' | '1m' | '1y';

interface PeriodSelectorProps {
  value: TimePeriod;
  onChange: (period: TimePeriod) => void;
}
```

**Render:** Hàng ngang 5 nút pill. Nút active: `backgroundColor: Colors.primary`, text trắng. Nút inactive: `backgroundColor: Colors.background.light`, border `Colors.border.light`.

**Labels:** `{ '1d': 'Ngày', '3d': '3 Ngày', '7d': '7 Ngày', '1m': 'Tháng', '1y': 'Năm' }`

---

### 2. `KpiCard`

**File:** `src/components/ui/KpiCard.tsx`

```typescript
type TrendDirection = 'up' | 'down' | 'neutral';

interface KpiCardProps {
  title: string;
  value: number;
  previousValue: number;
  icon: string;           // Ionicons name
  onPress?: () => void;
}
```

**Trend logic:**
- `value > previousValue` → `up`: icon `trending-up`, màu `#16a34a` (xanh lá)
- `value < previousValue` → `down`: icon `trending-down`, màu `Colors.status.error`
- `value === previousValue` → `neutral`: icon `remove-outline`, màu `Colors.text.secondary`

**Layout:** Card 2 cột (width `48%`), bo góc `borderRadius['2xl']`, padding `spacing.base`.

---

### 3. `OrdersBarChart`

**File:** `src/components/ui/OrdersBarChart.tsx`

```typescript
interface ChartPoint {
  label: string;
  value: number;
}

interface OrdersBarChartProps {
  data: ChartPoint[];
  period: TimePeriod;
  isLoading?: boolean;
}
```

**Thư viện:** `BarChart` từ `react-native-gifted-charts`.

**Gradient:** Dùng `LinearGradient` từ `react-native-linear-gradient` cho `gradientColor` prop của `BarChart`.

**Scroll ngang:** Bọc trong `ScrollView horizontal` khi `data.length > 7`.

**Empty states:**
- `data.length === 0` → Text "Không có dữ liệu"
- `data.every(p => p.value === 0)` → Hiển thị chart + Text "Không có đơn hàng trong kỳ này"

---

### 4. `NewCustomersLineChart`

**File:** `src/components/ui/NewCustomersLineChart.tsx`

```typescript
interface NewCustomersLineChartProps {
  data: ChartPoint[];
  period: TimePeriod;
  isLoading?: boolean;
}
```

**Thư viện:** `LineChart` từ `react-native-gifted-charts`.

**Luôn hiển thị** kể cả khi tất cả value = 0 (đường nằm ngang ở y=0).

**Data points:** `dataPointsColor: Colors.primary`, `dataPointsRadius: 4`.

---

### 5. `AnalyticsSkeleton`

**File:** `src/components/ui/AnalyticsSkeleton.tsx`

Dùng `SkeletonLoader` component hiện có (`src/components/SkeletonLoader/SkeletonLoader.tsx`).

**Layout:**
- 1 skeleton bar ngang (PeriodSelector placeholder): height 36, borderRadius full
- 4 skeleton cards 2×2 (KPI placeholder): height 80, borderRadius 2xl
- 1 skeleton block lớn (chart placeholder): height 180, borderRadius 2xl

---

### 6. `GarageManagementScreen` (cập nhật)

**File:** `src/screens/GarageManagement/GarageManagementScreen.tsx`

**State mới:**
```typescript
const [activePeriod, setActivePeriod] = useState<TimePeriod>('7d');
```

**Query mới:**
```typescript
const analyticsQuery = useGetAdminAnalyticsQuery(
  { period: activePeriod },
  { skip: !canAccess }
);
```

**Layout mới (từ trên xuống dưới trong ScrollView):**
1. Hero card (giữ nguyên)
2. Quick actions row (giữ nguyên)
3. **[MỚI] Section "Phân tích hoạt động"**
   - PeriodSelector
   - KpiCardsRow (4 KpiCard)
   - OrdersBarChart
   - NewCustomersLineChart
4. Section "Tổng quan nghiệp vụ" (giữ nguyên 9 cards)
5. Section "Cấu hình quản trị" (giữ nguyên)

---

## Data Models

### Analytics API Response

```typescript
// Frontend type
interface AnalyticsKpi {
  total_orders: number;
  new_customers: number;
  completed_orders: number;
  in_progress_orders: number;
  previous_period_orders: number;
  previous_period_new_customers: number;
  previous_period_completed: number;
  previous_period_in_progress: number;
}

interface TimeSeriesPoint {
  label: string;   // "08:00", "T2", "Tuần 1", "Tháng 1"
  value: number;
}

interface AnalyticsResponse {
  kpi: AnalyticsKpi;
  series: {
    orders: TimeSeriesPoint[];
    new_customers: TimeSeriesPoint[];
  };
}
```

### Backend SQL — `analyticsController.js`

**Khoảng thời gian:**

| period | Khoảng hiện tại | Khoảng trước | Granularity |
|--------|----------------|--------------|-------------|
| `1d`   | 24h qua        | 24h trước đó | Mỗi giờ (24 điểm) |
| `3d`   | 3 ngày qua     | 3 ngày trước | Mỗi ngày (3 điểm) |
| `7d`   | 7 ngày qua     | 7 ngày trước | Mỗi ngày (7 điểm) |
| `1m`   | 30 ngày qua    | 30 ngày trước | Mỗi tuần (4–5 điểm) |
| `1y`   | 12 tháng qua   | 12 tháng trước | Mỗi tháng (12 điểm) |

**KPI query (ví dụ `7d`):**
```sql
SELECT
  COUNT(*) as total_orders,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
  COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_orders
FROM service_orders
WHERE garage_id = :garageId
  AND receive_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
```

**Series query (orders, `7d`):**
```sql
SELECT
  DATE(receive_date) as day_label,
  COUNT(*) as value
FROM service_orders
WHERE garage_id = :garageId
  AND receive_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY DATE(receive_date)
ORDER BY day_label ASC
```

**New customers query:**
```sql
SELECT
  DATE(created_at) as day_label,
  COUNT(*) as value
FROM customers
WHERE garage_id = :garageId
  AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY DATE(created_at)
ORDER BY day_label ASC
```

> **Lưu ý:** Backend fill đủ tất cả điểm trong khoảng (kể cả ngày/giờ không có dữ liệu → value = 0) để frontend không cần xử lý gap.

---

## RTK Query — `adminGarageApi.ts`

Thêm endpoint mới vào `adminGarageApi`:

```typescript
// Types
export type TimePeriod = '1d' | '3d' | '7d' | '1m' | '1y';

export interface AnalyticsKpi {
  total_orders: number;
  new_customers: number;
  completed_orders: number;
  in_progress_orders: number;
  previous_period_orders: number;
  previous_period_new_customers: number;
  previous_period_completed: number;
  previous_period_in_progress: number;
}

export interface TimeSeriesPoint {
  label: string;
  value: number;
}

export interface AdminAnalyticsResponse {
  kpi: AnalyticsKpi;
  series: {
    orders: TimeSeriesPoint[];
    new_customers: TimeSeriesPoint[];
  };
}

// Endpoint
getAdminAnalytics: builder.query<AdminAnalyticsResponse, { period: TimePeriod }>({
  query: ({ period }) => ({
    url: `${ADMIN_BASE_PATH}/analytics`,
    params: { period },
  }),
  providesTags: (result, error, { period }) => [
    { type: 'AdminDashboard' as const, id: `analytics:${period}` }
  ],
  transformResponse: (response: unknown) => {
    // extract kpi + series từ response
  },
}),
```

---

## Backend Route

**File:** `src/routes/web/analytics.js`

```javascript
const express = require('express');
const analyticsController = require('../../controllers/analyticsController');
const { requireGarageAdminAuth } = require('../../middleware/authContext');

const router = express.Router();

const VALID_PERIODS = ['1d', '3d', '7d', '1m', '1y'];

// Validation middleware — chạy TRƯỚC auth
router.use((req, res, next) => {
  const { period } = req.query;
  if (!period || !VALID_PERIODS.includes(period)) {
    return res.status(400).json({
      success: false,
      error: `Tham số 'period' không hợp lệ. Giá trị hợp lệ: ${VALID_PERIODS.join(', ')}`,
    });
  }
  next();
});

router.get('/', requireGarageAdminAuth, analyticsController.getAnalytics);

module.exports = router;
```

**Mount trong `src/routes/web/index.js`:**
```javascript
const analyticsRouter = require('./analytics');
router.use('/analytics', analyticsRouter);
```

---

## Error Handling

| Tình huống | Hành vi UI |
|-----------|-----------|
| `analyticsQuery.isLoading` (lần đầu) | Hiển thị `AnalyticsSkeleton` |
| `analyticsQuery.isFetching` (refetch) | Giữ data cũ, hiển thị nhỏ `ActivityIndicator` trên PeriodSelector |
| `analyticsQuery.isError` | Hiển thị `ErrorView` với nút "Thử lại" thay cho KPI + charts |
| Mất mạng | RTK Query tự retry; nếu fail → `isError = true` → ErrorView |
| Pull-to-refresh | Gọi `analyticsQuery.refetch()` + tất cả stats queries hiện có |

---

## File Changes Summary

### Frontend — files mới

| File | Mô tả |
|------|-------|
| `src/components/ui/PeriodSelector.tsx` | Component chọn khoảng thời gian |
| `src/components/ui/KpiCard.tsx` | Card KPI với trend indicator |
| `src/components/ui/OrdersBarChart.tsx` | Bar chart đơn hàng |
| `src/components/ui/NewCustomersLineChart.tsx` | Line chart khách mới |
| `src/components/ui/AnalyticsSkeleton.tsx` | Skeleton loading cho analytics section |

### Frontend — files sửa

| File | Thay đổi |
|------|---------|
| `src/screens/GarageManagement/GarageManagementScreen.tsx` | Thêm AnalyticsSection, state `activePeriod`, query `getAdminAnalytics` |
| `src/services/adminGarageApi.ts` | Thêm types `TimePeriod`, `AnalyticsKpi`, `AdminAnalyticsResponse`; thêm endpoint `getAdminAnalytics` |

### Backend — files mới

| File | Mô tả |
|------|-------|
| `src/controllers/analyticsController.js` | Controller xử lý GET /analytics |
| `src/routes/web/analytics.js` | Router với validation + auth |

### Backend — files sửa

| File | Thay đổi |
|------|---------|
| `src/routes/web/index.js` | Mount analytics router tại `/analytics` |

---

## Dependency

```
react-native-gifted-charts ^1.4.0
  └── peer: react-native-svg ^15.x  ✅ đã có
  └── peer: react-native-linear-gradient ^2.x  ✅ đã có
```

Không cần `pod install` thêm vì cả 2 peer dependency đã được link native.
