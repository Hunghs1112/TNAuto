# Implementation Plan: Admin Dashboard Analytics

## Overview

Xây dựng lại `GarageManagementScreen` với biểu đồ thống kê trực quan theo khoảng thời gian (1d/3d/7d/1m/1y). Bao gồm: cài thư viện chart, tạo các UI components mới, cập nhật RTK Query API, và bổ sung backend analytics endpoint.

## Tasks

## Task Dependency Graph

```json
{
  "waves": [
    {
      "wave": 1,
      "tasks": [1, 9],
      "description": "Cài thư viện frontend + tạo backend controller (song song)"
    },
    {
      "wave": 2,
      "tasks": [2, 10],
      "description": "RTK Query types/endpoint + backend router mount (song song)"
    },
    {
      "wave": 3,
      "tasks": [3, 4, 5, 6],
      "description": "Tạo 4 UI components (song song)"
    },
    {
      "wave": 4,
      "tasks": [7],
      "description": "AnalyticsSkeleton (cần charts xong)"
    },
    {
      "wave": 5,
      "tasks": [8],
      "description": "Cập nhật GarageManagementScreen (cần tất cả components)"
    }
  ]
}
```

- [x] 1. Cài đặt thư viện react-native-gifted-charts
  - Chạy `npm install react-native-gifted-charts@^1.4.0` trong thư mục `/Users/nguyenquanghuy/Downloads/TNAuto`
  - Verify `package.json` có entry `react-native-gifted-charts` ^1.4.0
  - Xác nhận không có peer dependency conflict với `react-native-svg` ^15.x và `react-native-linear-gradient` ^2.x đã có sẵn
  - Không cần `pod install` thêm vì cả 2 peer deps đã được link native

- [x] 2. Thêm types và RTK Query endpoint cho Analytics API
  - **File:** `src/services/adminGarageApi.ts`
  - Thêm type `TimePeriod = '1d' | '3d' | '7d' | '1m' | '1y'`
  - Thêm interface `AnalyticsKpi` với các fields: `total_orders`, `new_customers`, `completed_orders`, `in_progress_orders`, `previous_period_orders`, `previous_period_new_customers`, `previous_period_completed`, `previous_period_in_progress` (tất cả `number`)
  - Thêm interface `TimeSeriesPoint` với `label: string` và `value: number`
  - Thêm interface `AdminAnalyticsResponse` với `kpi: AnalyticsKpi` và `series: { orders: TimeSeriesPoint[]; new_customers: TimeSeriesPoint[] }`
  - Thêm endpoint `getAdminAnalytics` vào `adminGarageApi` endpoints: query `GET /api/app/admin/analytics?period=`, transformResponse extract `kpi` và `series`, providesTags `AdminDashboard:analytics:{period}`
  - Export hook `useGetAdminAnalyticsQuery` trong export block cuối file
  - _Depends on: Task 1_

- [x] 3. Tạo component PeriodSelector
  - **File mới:** `src/components/ui/PeriodSelector.tsx`
  - Props: `value: TimePeriod`, `onChange: (period: TimePeriod) => void`
  - Render hàng ngang 5 nút pill với labels: `{ '1d': 'Ngày', '3d': '3 Ngày', '7d': '7 Ngày', '1m': 'Tháng', '1y': 'Năm' }`
  - Nút active: `backgroundColor: Colors.primary`, text `Colors.background.light`, `fontFamily: Typography.fontFamily.bold`
  - Nút inactive: `backgroundColor: Colors.background.light`, border `Colors.border.light`, text `Colors.text.secondary`
  - Wrap trong `ScrollView horizontal` để tránh overflow trên màn nhỏ
  - Dùng `TouchableOpacity` với `activeOpacity={0.85}`, `hitSlop` đủ rộng
  - Export default component
  - _Depends on: Task 2_

- [x] 4. Tạo component KpiCard
  - **File mới:** `src/components/ui/KpiCard.tsx`
  - Props: `title: string`, `value: number`, `previousValue: number`, `icon: string` (Ionicons name), `onPress?: () => void`
  - Tính `trend: 'up' | 'down' | 'neutral'` từ `value` vs `previousValue`
  - Trend `up`: icon `trending-up`, màu `#16a34a`
  - Trend `down`: icon `trending-down`, màu `Colors.status.error`
  - Trend `neutral`: icon `remove-outline`, màu `Colors.text.secondary`
  - Layout: icon circle (primarySoft bg) + value lớn (primary color) + title + trend badge
  - Width `48%`, `borderRadius: borderRadius['2xl']`, `padding: spacing.base`, border `Colors.border.light`
  - Wrap trong `TouchableOpacity` nếu `onPress` được truyền vào
  - Export default component
  - _Depends on: Task 2_

- [x] 5. Tạo component OrdersBarChart
  - **File mới:** `src/components/ui/OrdersBarChart.tsx`
  - Props: `data: TimeSeriesPoint[]`, `period: TimePeriod`, `isLoading?: boolean`
  - Import `BarChart` từ `react-native-gifted-charts`
  - Gradient bars: dùng `gradientColor` prop với màu từ `Colors.palette.navy` → `Colors.palette.cobalt`
  - Trục X: nhãn từ `data[i].label`
  - Bọc `BarChart` trong `ScrollView horizontal` khi `data.length > 7`
  - Empty state 1: `data.length === 0` → Text "Không có dữ liệu" căn giữa, không render chart
  - Empty state 2: `data.every(p => p.value === 0)` → Render chart (tất cả cột = 0) + Text "Không có đơn hàng trong kỳ này" bên dưới
  - Chiều cao chart: 180px
  - Export default component
  - _Depends on: Task 2_

- [x] 6. Tạo component NewCustomersLineChart
  - **File mới:** `src/components/ui/NewCustomersLineChart.tsx`
  - Props: `data: TimeSeriesPoint[]`, `period: TimePeriod`, `isLoading?: boolean`
  - Import `LineChart` từ `react-native-gifted-charts`
  - Luôn render chart kể cả khi tất cả `value === 0` (đường nằm ngang y=0)
  - Data point dots: `dataPointsColor: Colors.primary`, `dataPointsRadius: 4`
  - Line color: `Colors.primaryLight`
  - Trục X: nhãn từ `data[i].label`
  - Chiều cao chart: 160px
  - Nếu `data.length === 0`: hiển thị Text "Không có dữ liệu" thay vì chart
  - Export default component
  - _Depends on: Task 2_

- [x] 7. Tạo component AnalyticsSkeleton
  - **File mới:** `src/components/ui/AnalyticsSkeleton.tsx`
  - Import `SkeletonLoader` từ `../../components/SkeletonLoader`
  - Layout từ trên xuống:
    - 1 skeleton bar ngang (PeriodSelector): height 36, borderRadius full, width `100%`
    - 4 skeleton cards 2×2 (KPI): height 80, borderRadius 16, width `48%`, gap `spacing.sm`
    - 1 skeleton block lớn (bar chart): height 180, borderRadius 16, width `100%`
    - 1 skeleton block vừa (line chart): height 160, borderRadius 16, width `100%`
  - Dùng `View` với `flexDirection: 'row', flexWrap: 'wrap'` cho 4 KPI skeletons
  - Export default component
  - _Depends on: Task 5, Task 6_

- [x] 8. Cập nhật GarageManagementScreen với AnalyticsSection
  - **File:** `src/screens/GarageManagement/GarageManagementScreen.tsx`
  - Thêm import: `TimePeriod`, `useGetAdminAnalyticsQuery` từ `adminGarageApi`; `PeriodSelector`, `KpiCard`, `OrdersBarChart`, `NewCustomersLineChart`, `AnalyticsSkeleton` từ `../../components/ui/`
  - Thêm state: `const [activePeriod, setActivePeriod] = useState<TimePeriod>('7d')`
  - Thêm query: `const analyticsQuery = useGetAdminAnalyticsQuery({ period: activePeriod }, { skip: !canAccess })`
  - Thêm `analyticsQuery.refetch()` vào `handleRefresh`
  - Thêm section "Phân tích hoạt động" giữa quick actions row và section "Tổng quan nghiệp vụ":
    - Tiêu đề section "Phân tích hoạt động"
    - `PeriodSelector` với `value={activePeriod}` và `onChange={setActivePeriod}`
    - Khi `analyticsQuery.isLoading && !analyticsQuery.data`: render `AnalyticsSkeleton`
    - Khi `analyticsQuery.isError`: render `ErrorView` với `onRetry={() => analyticsQuery.refetch()}`
    - Khi có data: render 4 `KpiCard` (2×2 grid) + `OrdersBarChart` + `NewCustomersLineChart`
    - Khi `analyticsQuery.isFetching && analyticsQuery.data`: hiển thị nhỏ `ActivityIndicator` bên cạnh tiêu đề section (stale data vẫn hiển thị)
  - KpiCard mapping:
    - "Tổng đơn": `value=kpi.total_orders`, `previousValue=kpi.previous_period_orders`, icon `receipt-outline`, `onPress → GarageOrders`
    - "Khách mới": `value=kpi.new_customers`, `previousValue=kpi.previous_period_new_customers`, icon `person-add-outline`, `onPress → GarageCustomers`
    - "Hoàn thành": `value=kpi.completed_orders`, `previousValue=kpi.previous_period_completed`, icon `checkmark-circle-outline`
    - "Đang xử lý": `value=kpi.in_progress_orders`, `previousValue=kpi.previous_period_in_progress`, icon `time-outline`, `onPress → GarageOrders`
  - Giữ nguyên toàn bộ phần còn lại (hero card, quick actions, static overview, config section)
  - _Depends on: Task 3, Task 4, Task 7_

- [x] 9. Backend — tạo analyticsController.js
  - **File mới:** `src/controllers/analyticsController.js` trong repo `/Users/nguyenquanghuy/Downloads/TNAUTO-backend`
  - Hàm `getAnalytics(req, res, next)`:
    - Đọc `period` từ `req.query.period` (đã validated bởi router middleware)
    - Lấy `garageId` từ `req.garageContext` hoặc `req.user.garage_id`
    - Tính `startDate` và `prevStartDate` theo period: `1d`=24h, `3d`=3 ngày, `7d`=7 ngày, `1m`=30 ngày, `1y`=365 ngày
    - Query KPI hiện tại: `COUNT(*)`, `COUNT(CASE WHEN status='completed')`, `COUNT(CASE WHEN status='in_progress')` từ `service_orders` WHERE `garage_id=? AND receive_date >= startDate`
    - Query KPI kỳ trước: tương tự với khoảng `prevStartDate` đến `startDate`
    - Query new_customers hiện tại và kỳ trước từ bảng `customers`
    - Query series orders: GROUP BY theo granularity (giờ cho `1d`, ngày cho `3d`/`7d`, tuần cho `1m`, tháng cho `1y`)
    - Query series new_customers: GROUP BY tương tự
    - Fill đủ điểm trong khoảng (ngày/giờ không có data → value = 0) bằng cách generate array đầy đủ rồi merge với query result
    - Trả về JSON: `{ success: true, data: { kpi: {...}, series: { orders: [...], new_customers: [...] } } }`
    - Bắt lỗi với `try/catch` → `next(err)`

- [x] 10. Backend — tạo analytics router và mount
  - **File mới:** `src/routes/web/analytics.js` trong repo `/Users/nguyenquanghuy/Downloads/TNAUTO-backend`
  - Validation middleware (chạy TRƯỚC `requireGarageAdminAuth`): kiểm tra `period` hợp lệ trong `['1d', '3d', '7d', '1m', '1y']`, trả về HTTP 400 nếu không hợp lệ
  - Route: `router.get('/', requireGarageAdminAuth, analyticsController.getAnalytics)`
  - **File sửa:** `src/routes/web/index.js` — thêm `router.use('/analytics', require('./analytics'))`
  - Verify endpoint `GET /api/app/admin/analytics?period=7d` trả về đúng cấu trúc `{ success: true, data: { kpi, series } }`
  - _Depends on: Task 9_

## Notes

- `react-native-gifted-charts` dùng `react-native-svg` làm renderer — không cần WebView hay Canvas native
- Backend fill đủ điểm time-series (kể cả ngày không có data → value = 0) để frontend không cần xử lý gap
- Validation `period` ở backend chạy TRƯỚC auth middleware (theo Requirement 5, tiêu chí 4)
- Stale data được giữ khi refetch — chỉ show skeleton ở lần load đầu tiên
- Tất cả components mới đặt trong `src/components/ui/` để tái sử dụng
