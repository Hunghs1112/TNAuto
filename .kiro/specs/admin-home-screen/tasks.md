# Implementation Plan: Admin Home Screen

## Overview

Nâng cấp và hợp nhất `ManagerHomeScreen.tsx` + `GarageManagementScreen.tsx` thành một Home Screen thống nhất cho vai trò `garage_manager` và `garage_admin`. Các task được tổ chức theo thứ tự: types → hook logic → UI components → wiring → integration tests.

## Tasks

- [x] 1. Cập nhật types và interfaces cho feature
  - Mở rộng `src/types/managerHome.ts` với các interface mới:
    - `ManagerHomeViewModel` — view-model object đầy đủ xuất từ hook
    - `ManagementSectionData` — dữ liệu cho mỗi management section card
    - `QuickActionKey` — union type `'create_order' | 'add_customer' | 'view_all_orders'`
    - `ActiveOrdersSectionProps`, `ManagementSectionProps`, `QuickActionsBarProps`
  - Thêm `ACTIVE_ORDER_STATUSES` set vào constants (bao gồm cả `received`, `pending`, `confirmed`, `in_progress`, `processing`, `ready_for_pickup`)
  - Thêm `isAlert?: boolean` vào interface `KPI`
  - _Requirements: 1.2, 2.1, 2.5, 3.1, 6.1, 7.5_

- [x] 2. Nâng cấp `useManagerHomeScreen` hook
  - [x] 2.1 Mở rộng hook tại `src/hooks/useManagerHomeScreen.ts` để fetch active orders
    - Thêm `useGetManagerHomeOrdersQuery` và `useGetManagerHomeNotificationsQuery` vào hook
    - Tính `activeOrders` = filter orders theo `ACTIVE_ORDER_STATUSES`
    - Tính `unreadNotificationsCount` từ notifications query hoặc summary stats
    - Cập nhật return type thành `ManagerHomeViewModel`
    - _Requirements: 1.2, 1.3, 2.2, 2.3, 7.2, 7.5_

  - [x] 2.2 Thêm management stats queries vào hook
    - Thêm `useGetAdminStatsQuery` cho từng resource: `customers`, `employees`, `service-orders`, `services`, `products`, `offers`, `vehicles`, `warranties`, `notifications`
    - Implement `buildManagementStats(statsMap, navigation)` — trả về `ManagementSectionData[]`
    - Xử lý lỗi: khi stats query fail, section tương ứng có `totalCount = 0`, `activeCount = 0`
    - Thêm `isSuperAdmin` = `isSuperAdminRole(userType)` từ `rolePolicy.ts`
    - _Requirements: 3.2, 3.4, 3.6, 7.2, 7.5_

  - [x] 2.3 Implement `onRefresh` handler và `isRefreshing` state
    - `onRefresh` gọi đồng thời `refetch()` của tất cả queries (summary, orders, notifications, tất cả stats)
    - `isRefreshing` = true trong khi refresh đang chạy, false khi tất cả hoàn thành
    - _Requirements: 4.1, 4.2, 4.3, 7.2, 7.5_

  - [x] 2.4 Implement navigation handlers trong hook
    - `onOrderPress(orderId)` → navigate đến OrderDetail
    - `onSectionPress(sectionKey)` → navigate đến màn hình tương ứng (GarageCustomers, GarageEmployees, GarageOrders, AdminCatalog, AdminOperations, Notification, SuperAdminGarages)
    - `onQuickAction(action)` → xử lý 3 quick actions: create_order, add_customer, view_all_orders
    - `onNotificationPress()` → navigate đến Notification
    - `onGaragePress()` → navigate đến GarageManagement
    - _Requirements: 1.6, 2.6, 3.3, 5.4, 5.6, 6.2, 6.3, 6.4, 7.2_

  - [x] 2.5 Implement KPI alert flag và overdue detection
    - Cập nhật `computeKPIs` để thêm `isAlert: true` khi `key === 'overdue' && value > 0`
    - Đảm bảo fallback logic: khi summary không có stats hợp lệ, tính từ orders list
    - _Requirements: 2.3, 2.5, 7.2_

  - [x] 2.6 Thêm role guard và header data vào hook
    - Đọc `userType` từ `authSlice`, `garageName` từ `garageContextSlice`, `userName` từ `authSlice`
    - Kiểm tra `isManagerRole(userType)` — nếu false, navigate về màn hình phù hợp
    - Xử lý 401 response: navigate về Login
    - `garageName` fallback: "Garage Dashboard" khi empty
    - _Requirements: 5.1, 5.2, 5.3, 14.1, 14.4, 14.5_

  - [ ]* 2.7 Viết property test cho `categorizeOrders` (Property 1 & 7)
    - **Property 1: Active orders contain only active statuses**
    - **Property 7: Order status filter round-trip**
    - **Validates: Requirements 1.2, 1.3**
    - Dùng `fc.array(fc.record({ status: fc.string() }))` để generate random orders
    - Assert: mọi order trong `activeOrders` có status thuộc `ACTIVE_ORDER_STATUSES`
    - Assert: không có order closed-status nào trong `activeOrders`
    - Assert: mọi non-closed order xuất hiện trong đúng một sub-group (mutually exclusive)

  - [ ]* 2.8 Viết property test cho `computeKPIs` (Property 2 & 3)
    - **Property 2: KPI values are non-negative integers**
    - **Property 3: KPI fallback consistency**
    - **Validates: Requirements 2.1, 2.2, 2.3**
    - Dùng `fc.option(fc.record({ stats: fc.option(fc.record({...})) }))` cho summary
    - Assert: `computeKPIs` luôn trả về đúng 4 entries với value >= 0
    - Assert: khi summary null/empty, KPI values khớp với manual count từ orders list

  - [ ]* 2.9 Viết property test cho overdue alert flag (Property 4)
    - **Property 4: Overdue alert flag**
    - **Validates: Requirements 2.5**
    - Dùng `fc.integer({ min: 0, max: 1000 })` cho overdue value
    - Assert: `isAlert === true` khi và chỉ khi `value > 0`

  - [ ]* 2.10 Viết property test cho `buildManagementStats` (Property 5)
    - **Property 5: Management stats error isolation**
    - **Validates: Requirements 3.4**
    - Generate random stats maps với một số entries là errors
    - Assert: `managementStats` luôn có entry cho mọi section
    - Assert: sections với error có `totalCount = 0`, sections thành công có giá trị thực

  - [ ]* 2.11 Viết property test cho role-based visibility (Property 6)
    - **Property 6: Role-based section visibility**
    - **Validates: Requirements 3.6, 14.2, 14.3**
    - Dùng `fc.constantFrom('customer', 'employee', 'dealer', 'garage_manager', 'garage_admin')` cho userType
    - Assert: `isSuperAdmin === true` khi và chỉ khi `userType === 'garage_admin'`

- [x] 3. Tạo `ActiveOrdersSection` component
  - Tạo file `src/components/ManagerHome/ActiveOrdersSection.tsx`
  - Props: `ActiveOrdersSectionProps` (orders, isLoading, isError, onOrderPress, onRetry)
  - Render khi `isLoading`: skeleton loader (3 placeholder cards)
  - Render khi `isError`: error state với icon và nút "Thử lại"
  - Render khi `orders.length === 0`: empty state với icon và text "Không có đơn nào đang xử lý"
  - Render khi có data: `FlatList` hoặc `ScrollView` ngang với `OrderCard` cho mỗi đơn
  - Mỗi `OrderCard` hiển thị: mã đơn, tên khách hàng, tên dịch vụ, trạng thái, ngày nhận xe
  - Wrap với `React.memo`
  - _Requirements: 1.1, 1.4, 1.5, 1.6, 1.7_

- [x] 4. Nâng cấp `KPISection` component
  - Cập nhật `src/components/ManagerHome/KPISection.tsx` để hỗ trợ `isAlert` flag
  - Cập nhật `KPICard` để nhận `isAlert?: boolean` prop — khi true, hiển thị màu cảnh báo (đỏ/cam)
  - Thêm `onPress?: () => void` prop vào `KPICard` để hỗ trợ navigation khi nhấn
  - Đảm bảo skeleton loading state hiển thị đúng khi `isLoading = true`
  - _Requirements: 2.1, 2.4, 2.5, 2.6_

- [x] 5. Tạo `ManagementSection` component
  - Tạo file `src/components/ManagerHome/ManagementSection.tsx`
  - Props: `ManagementSectionProps` (sections: ManagementSectionData[], isLoading: boolean)
  - Render grid 2 cột với `ManagementCard` cho mỗi section
  - `ManagementCard` hiển thị: icon, title, totalCount (hoặc "—" khi error), subtitle (activeCount)
  - Khi `isLoading`: skeleton cards
  - Khi section có error (totalCount = 0 và activeCount = 0): hiển thị "—" thay vì "0"
  - Wrap với `React.memo`
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 6. Tạo `QuickActionsBar` component
  - Tạo file `src/components/ManagerHome/QuickActionsBar.tsx`
  - Props: `QuickActionsBarProps` (onCreateOrder, onAddCustomer, onViewAllOrders)
  - Render 3 nút ngang: "Tạo đơn mới" (icon `add-circle-outline`), "Thêm khách hàng" (icon `person-add-outline`), "Xem tất cả đơn" (icon `receipt-outline`)
  - Style: row layout, mỗi nút flex 1, border, borderRadius, icon + text
  - Wrap với `React.memo`
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 7. Tạo `ManagerHomeScreenView` component
  - Tạo file `src/screens/Home/ManagerHomeScreenView.tsx`
  - Props: `ManagerHomeViewModel` (toàn bộ view-model từ hook)
  - Render theo thứ tự: Header → QuickActionsBar → ActiveOrdersSection → KPISection → ManagementSection (×N) → SuperAdmin section (nếu `isSuperAdmin`)
  - Header: tên gara (`garageName`), tên user (`userName`), notification bell với badge (`unreadNotificationsCount`)
  - Wrap toàn bộ trong `ScrollView` với `RefreshControl` (`refreshing={isRefreshing}`, `onRefresh={onRefresh}`)
  - Không gọi API, không đọc Redux — chỉ nhận props
  - Wrap với `React.memo`
  - _Requirements: 1.1, 3.5, 4.2, 4.3, 5.1, 5.2, 5.3, 5.5, 7.1, 7.3, 7.4_

- [x] 8. Cập nhật `ManagerHomeScreen.tsx` thành container mỏng
  - Thay thế nội dung `src/screens/Home/ManagerHomeScreen.tsx`
  - Gọi `useManagerHomeScreen({ isEnabled: true })` để lấy view-model
  - Render `<ManagerHomeScreenView {...viewModel} />`
  - Không chứa state, logic, hay API calls
  - Giữ nguyên default export để không phá vỡ import trong `AppNavigator.tsx`
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 9. Cập nhật `index.ts` của ManagerHome components
  - Cập nhật `src/components/ManagerHome/index.ts` để export các components mới:
    - `ActiveOrdersSection`
    - `ManagementSection`
    - `QuickActionsBar`
  - Giữ nguyên các exports hiện có (`KPISection`, `KPICard`, `OrderCard`, v.v.)
  - _Requirements: 7.4_

- [x] 10. Integration Tests — Service Orders CRUD (Requirement 8)
  - Tạo file `src/services/__tests__/serviceOrders.integration.test.ts`
  - Test `GET /api/app/admin/service-orders` — parse response thành `ServiceOrder[]`
  - Test `POST /api/app/admin/service-orders` với body hợp lệ — verify đơn được tạo
  - Test `GET /api/app/admin/service-orders/:id` — verify chi tiết đơn
  - Test `PUT /api/app/admin/service-orders/:id/status` — verify cập nhật trạng thái
  - Test `PATCH /api/app/admin/service-orders/:id/assign` — verify gán nhân viên
  - Test `PATCH /api/app/admin/service-orders/:id/complete` — verify hoàn thành + bảo hành
  - Test `DELETE /api/app/admin/service-orders/:id` — verify xóa thành công
  - Test `GET /api/app/admin/service-orders/stats` — verify có `total_orders`, `processing_orders`
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_

- [x] 11. Integration Tests — Customers CRUD (Requirement 9)
  - Tạo file `src/services/__tests__/customers.integration.test.ts`
  - Test GET list, POST create, GET by id, PUT/PATCH update, DELETE
  - Test `GET /api/app/admin/customers/:id/vehicles`
  - Test `PUT /api/app/admin/customers/:id/driver-license`
  - Test `GET /api/app/admin/customers/stats` — verify có `total_customers`
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8_

- [x] 12. Integration Tests — Employees CRUD (Requirement 10)
  - Tạo file `src/services/__tests__/employees.integration.test.ts`
  - Test GET list, POST create, GET by id, PUT update, DELETE
  - Test `POST /api/app/admin/employees/assign-order`
  - Test `GET /api/app/admin/employees/stats` — verify có `total_employees`
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

- [x] 13. Integration Tests — Catalog CRUD (Requirement 11)
  - Tạo file `src/services/__tests__/catalog.integration.test.ts`
  - Test Services: GET list, POST create, PUT update, DELETE
  - Test Products: GET list, POST create, PUT update, DELETE
  - Test Offers: GET list, POST create, PUT update, DELETE
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8, 11.9, 11.10, 11.11, 11.12_

- [x] 14. Integration Tests — Operations CRUD (Requirement 12)
  - Tạo file `src/services/__tests__/operations.integration.test.ts`
  - Test Vehicles: GET list, GET by id, PUT update, DELETE, GET search, GET/PUT inspection
  - Test Warranties: GET list, POST create, PUT update, DELETE
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8, 12.9, 12.10, 12.11_

- [x] 15. Integration Tests — Manager Home Endpoints (Requirement 13)
  - Tạo file `src/services/__tests__/managerHome.integration.test.ts`
  - Test `GET /api/app/manager/home/summary` với token hợp lệ — verify `success: true` và stats object
  - Test `GET /api/app/manager/home/orders` — verify parse thành `ServiceOrder[]`
  - Test `GET /api/app/manager/home/notifications` — verify danh sách thông báo
  - Test role guard: gọi với token `customer`/`employee` → expect 401 hoặc 403
  - Test graceful fallback: khi summary endpoint không tồn tại, hook không crash và fallback về orders list
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 16. Checkpoint — Kiểm tra tích hợp cuối
  - Đảm bảo `AppNavigator.tsx` import `ManagerHomeScreen` vẫn hoạt động (default export không đổi)
  - Đảm bảo `GarageManagementScreen.tsx` vẫn hoạt động độc lập (không bị phá vỡ)
  - Đảm bảo `useManagerHomeScreen` tại `src/hooks/` export đúng `ManagerHomeViewModel`
  - Kiểm tra TypeScript không có lỗi: `tsc --noEmit`
  - Đảm bảo tất cả property tests pass với `numRuns: 100`
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks đánh dấu `*` là optional — có thể bỏ qua để MVP nhanh hơn
- Cần cài `fast-check` trước khi chạy property tests: `npm install --save-dev fast-check`
- Hook chính tại `src/hooks/useManagerHomeScreen.ts` (không phải `src/screens/Home/useManagerHomeScreen.ts` — file cũ có thể giữ lại hoặc xóa sau khi migrate xong)
- `GarageManagementScreen.tsx` vẫn giữ nguyên — Admin Home Screen là màn hình Home mới, không thay thế GarageManagement
- Property tests dùng tag format: `// Feature: admin-home-screen, Property {N}: {property_text}`
- Mỗi property test chạy tối thiểu 100 iterations (`numRuns: 100`)
- Integration tests (tasks 10–15) có thể dùng MSW (Mock Service Worker) hoặc Jest mock để tránh gọi API thật trong CI
