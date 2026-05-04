# Admin Garage Flow - Các bước còn lại

## Trạng thái hiện tại
- [x] Tạo namespace endpoint `/api/app/admin`
- [x] Thêm `adminGarageApi`
- [x] Nối dữ liệu cơ bản cho:
  - `GarageManagement`
  - `GarageCustomers`
  - `GarageOrders`
  - `CustomerDetail`
  - `OrderDetail`
  - `Notification`

### Màn hình đã hoàn thiện (Bước 1–9, 11 một phần)
- `src/navigation/rolePolicy.ts` — tách `garage_admin` / `garage_manager` / `isSuperAdminRole`
- `src/components/navbarPolicy.ts` — 4 luồng tab riêng biệt theo role
- `src/navigation/MainTabs.tsx` + `AppNavigator.tsx` — đăng ký đầy đủ routes admin
- `src/screens/GarageManagement/GarageCustomersScreen.tsx` — list + tạo khách hàng + error state
- `src/screens/Customers/CustomerDetailScreen.tsx` — 4 tab: info/xe/bằng lái/đơn hàng + CRUD
- `src/screens/GarageManagement/GarageOrdersScreen.tsx` — list + tạo đơn mới + error state
- `src/screens/OrderDetail/OrderDetailScreen.tsx` — action bar: status/assign/complete + quản lý ảnh
- `src/screens/GarageManagement/GarageEmployeesScreen.tsx` — list + tạo nhân viên + error state (mới)
- `src/screens/GarageManagement/EmployeeDetailScreen.tsx` — detail + edit + upload avatar + gán đơn (mới)
- `src/screens/GarageManagement/AdminCatalogScreen.tsx` — 5 tab CRUD catalog + upload image + error state (mới)
- `src/screens/GarageManagement/AdminOperationsScreen.tsx` — warranties CRUD + vehicles + inspection (mới)
- `src/screens/Notification/NotificationScreen.tsx` — thêm FAB tạo notification cho admin
- `src/screens/GarageManagement/AdminSettingsScreen.tsx` — reminder configs + UI visibility (mới)
- `src/screens/GarageManagement/SuperAdminGaragesScreen.tsx` — CRUD garages + error state, chỉ `garage_admin`
- `src/services/adminMappers.ts` — typed interfaces + mapper helpers cho tất cả admin resources (mới)

---

## 1. Khóa scope role và điều hướng
- [x] Rà lại toàn bộ luồng `garage_admin` / `garage_manager`
- [x] Đảm bảo các màn admin không fallback sang API customer/employee/dealer
- [x] Ẩn các tab/menu không thuộc scope admin
- [x] Tách rõ các màn chỉ dành cho `super admin`

File liên quan:
- `src/components/navbarPolicy.ts`
- `src/navigation/AppNavigator.tsx`
- `src/navigation/MainTabs.tsx`

---

## 2. Hoàn thiện Customers Management
- [x] Sửa khách hàng
- [x] Xóa khách hàng
- [x] Upload avatar khách hàng
- [x] Xem / cập nhật / xóa bằng lái
- [x] Xem / thêm xe của khách hàng

API:
- `GET/PUT/PATCH/DELETE /api/app/admin/customers/:id`
- `POST /api/app/admin/customers/:id/upload-avatar`
- `GET/PUT/DELETE /api/app/admin/customers/:id/driver-license`
- `GET/POST /api/app/admin/customers/:id/vehicles`

---

## 3. Hoàn thiện Service Orders Management
- [x] Tạo đơn mới
- [x] Cập nhật trạng thái đơn
- [x] Gán đơn cho nhân viên
- [x] Hoàn thành đơn
- [x] Quản lý ảnh đơn (xem / thêm / xóa theo trạng thái received/completed)

API:
- `POST /api/app/admin/service-orders`
- `PUT /api/app/admin/service-orders/:id/status`
- `PATCH /api/app/admin/service-orders/:id/assign`
- `PATCH /api/app/admin/service-orders/:id/complete`
- `GET/POST/PUT/DELETE /api/app/admin/service-orders/.../images`

---

## 4. Hoàn thiện Employees Management
- [x] Danh sách nhân viên
- [x] Tạo nhân viên
- [x] Cập nhật nhân viên
- [x] Xóa nhân viên
- [x] Gán đơn từ màn nhân sự
- [x] Upload avatar nhân viên

API:
- `GET/POST /api/app/admin/employees`
- `GET/PUT/DELETE /api/app/admin/employees/:id`
- `POST /api/app/admin/employees/assign-order`
- `POST /api/app/admin/employees/:id/upload-avatar`

---

## 5. Hoàn thiện Catalog Management
- [x] Services CRUD + upload image
- [x] Service Categories CRUD + upload image
- [x] Products CRUD + images
- [x] Categories CRUD + upload image
- [x] Offers CRUD + image + images gallery

API:
- `/api/app/admin/services`
- `/api/app/admin/service-categories`
- `/api/app/admin/products`
- `/api/app/admin/categories`
- `/api/app/admin/offers`

---

## 6. Hoàn thiện Operations Management
- [x] Warranties CRUD
- [x] Vehicles list/detail/update/delete
- [x] Vehicle search
- [x] Upload vehicle image
- [x] Vehicle inspection CRUD

API:
- `/api/app/admin/warranties`
- `/api/app/admin/vehicles`
- `/api/app/admin/vehicles/search`
- `/api/app/admin/vehicles/:id/upload-image`
- `/api/app/admin/vehicles/:vehicleId/inspection`

---

## 7. Hoàn thiện Communications & Settings
- [x] Tạo notification từ app admin
- [x] Xem logs notification
- [x] Quản lý service reminder configs
- [x] Quản lý UI visibility settings

API:
- `/api/app/admin/notifications`
- `/api/app/admin/notifications/logs`
- `/api/app/admin/settings/service-reminder-configs`
- `/api/app/admin/settings/ui-visibility`

---

## 8. Hoàn thiện Super Admin Garages Management
- [x] Chỉ hiển thị với quyền phù hợp
- [x] CRUD garages
- [x] Tách riêng khỏi luồng admin gara thường

API:
- `/api/app/admin/garages`

---

## 9. Chuẩn hóa UI state
- [x] Loading state — đã có ActivityIndicator trên tất cả màn
- [x] Empty state — đã có icon + text trên tất cả màn
- [x] Error state — ErrorView component trên tất cả màn admin list
- [x] Pull-to-refresh — đã có RefreshControl trên tất cả màn
- [x] Confirm dialog cho delete / destructive actions — Alert.alert trên tất cả delete
- [x] Toast/alert thống nhất cho mutation success/fail — Alert.alert sau mỗi mutation

---

## 10. Kiểm thử và chốt
- [ ] Test từng endpoint bằng token `garage_admin`
- [ ] Test role `garage_manager`
- [ ] Test role `dealer` không đi vào admin flow
- [ ] Test upload ảnh
- [ ] Test điều hướng từ notification sang detail
- [ ] Rà response format thực tế của backend để chỉnh mapper nếu cần

---

## 11. Cleanup kỹ thuật
- [x] Tách helper map response admin → `src/services/adminMappers.ts` với typed interfaces
- [x] Áp dụng mappers vào GarageOrdersScreen, SuperAdminGaragesScreen
- [ ] Áp dụng mappers vào các màn còn lại (GarageCustomers, AdminOperations...)
- [ ] Giảm `AdminEntity` dạng generic về type cụ thể theo resource (dùng adminMappers)
- [ ] Viết test cho `adminGarageApi`
- [ ] Xử lý các lỗi TypeScript nền của repo nếu muốn build sạch toàn bộ

---

## Thứ tự làm đề xuất
1. Khóa role + navigation
2. Customers
3. Service Orders
4. Employees
5. Catalog
6. Operations
7. Notifications & Settings
8. Super Admin garages
9. QA + cleanup
