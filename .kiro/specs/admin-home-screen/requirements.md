# Requirements Document

## Introduction

Tính năng này thiết kế lại màn hình Home dành cho vai trò quản lý (garage_manager và garage_admin) sau khi đăng nhập. Mục tiêu là tạo ra một dashboard hiện đại, khoa học, trực quan — hiển thị ngay danh sách đơn dịch vụ đang được xử lý ở vị trí đầu tiên, sau đó chia thành các section quản lý từng nghiệp vụ (khách hàng, xe, nhân viên, catalog, vận hành, thông báo). Ngoài ra, spec này bao gồm yêu cầu kiểm thử toàn bộ luồng CRUD qua API admin để xác nhận tích hợp đúng chuẩn.

Codebase hiện tại đã có `ManagerHomeScreen.tsx`, `useManagerHomeScreen.ts`, `GarageManagementScreen.tsx` và đầy đủ API endpoints tại `/api/app/admin/*` và `/api/app/manager/*`. Spec này nâng cấp và hợp nhất các màn hình đó thành một Home Screen thống nhất, đẹp và đầy đủ chức năng.

## Glossary

- **Admin_Home_Screen**: Màn hình chính sau khi đăng nhập với vai trò `garage_manager` hoặc `garage_admin`
- **Manager_Role**: Vai trò `garage_manager` — quản lý 1 gara cụ thể
- **Super_Admin_Role**: Vai trò `garage_admin` — quản lý nhiều gara, có quyền cao nhất
- **Active_Orders_Section**: Section đầu tiên trên màn hình, hiển thị danh sách đơn dịch vụ đang được xử lý
- **KPI_Card**: Thẻ hiển thị chỉ số vận hành nhanh (số đơn chờ, đang xử lý, quá hạn, hoàn thành hôm nay)
- **Management_Section**: Một khối UI đại diện cho một nghiệp vụ quản lý (khách hàng, xe, nhân viên, v.v.)
- **Quick_Action**: Nút tắt cho phép điều hướng nhanh đến màn hình quản lý tương ứng
- **Admin_API**: Nhóm endpoint `/api/app/admin/*` dành riêng cho vai trò quản lý
- **Manager_API**: Nhóm endpoint `/api/app/manager/*` dành riêng cho vai trò quản lý (home summary, orders, notifications)
- **Service_Order**: Đơn dịch vụ xe, có các trạng thái: `received`, `pending`, `confirmed`, `in_progress`, `processing`, `ready_for_pickup`, `completed`, `cancelled`
- **CRUD_Flow**: Luồng tạo, đọc, cập nhật, xóa dữ liệu qua API
- **Stats_Endpoint**: Endpoint `/stats` của từng resource, trả về số liệu tổng hợp
- **useManagerHomeScreen**: Custom hook chứa toàn bộ logic nghiệp vụ của Admin_Home_Screen
- **ManagerHomeScreenView**: Component UI thuần, nhận dữ liệu qua props từ hook

---

## Requirements

### Requirement 1: Hiển thị Active Orders Section ở đầu màn hình

**User Story:** As a garage_manager, I want thấy ngay danh sách đơn dịch vụ đang được xử lý khi mở app, so that tôi nắm được tình trạng vận hành hiện tại mà không cần điều hướng thêm.

#### Acceptance Criteria

1. WHEN Admin_Home_Screen được render, THE Admin_Home_Screen SHALL hiển thị Active_Orders_Section là section đầu tiên trong vùng cuộn, trước tất cả các section khác.

2. WHEN Admin_Home_Screen được render, THE Active_Orders_Section SHALL hiển thị danh sách các đơn dịch vụ có trạng thái thuộc nhóm đang xử lý (`received`, `pending`, `confirmed`, `in_progress`, `processing`, `ready_for_pickup`).

3. WHEN Manager_API trả về dữ liệu từ `GET /api/app/manager/home/orders`, THE useManagerHomeScreen SHALL lọc và phân loại đơn theo trạng thái trước khi truyền xuống view.

4. WHEN Active_Orders_Section có dữ liệu, THE Active_Orders_Section SHALL hiển thị mỗi đơn với ít nhất: mã đơn, tên khách hàng, tên dịch vụ, trạng thái hiện tại, và ngày nhận xe.

5. WHEN Active_Orders_Section không có đơn nào đang xử lý, THE Active_Orders_Section SHALL hiển thị trạng thái empty state với icon và thông báo "Không có đơn nào đang xử lý".

6. WHEN người dùng nhấn vào một đơn trong Active_Orders_Section, THE Admin_Home_Screen SHALL điều hướng đến màn hình chi tiết đơn tương ứng.

7. WHEN Manager_API trả về lỗi khi fetch orders, THE Active_Orders_Section SHALL hiển thị error state với nút "Thử lại".

---

### Requirement 2: KPI Cards — Tổng quan vận hành nhanh

**User Story:** As a garage_manager, I want xem ngay các chỉ số vận hành quan trọng (đơn chờ, đang xử lý, quá hạn, hoàn thành hôm nay) trên màn hình chính, so that tôi có cái nhìn tổng quan mà không cần vào từng màn quản lý.

#### Acceptance Criteria

1. WHEN Admin_Home_Screen được render, THE Admin_Home_Screen SHALL hiển thị ít nhất 4 KPI_Card: "Đơn chờ xử lý", "Đang xử lý", "Quá hạn", "Hoàn thành hôm nay".

2. WHEN Manager_API trả về dữ liệu từ `GET /api/app/manager/home/summary`, THE useManagerHomeScreen SHALL ưu tiên đọc giá trị từ `stats` object trong response trước khi tính toán từ danh sách đơn.

3. WHEN `GET /api/app/manager/home/summary` không trả về stats hợp lệ, THE useManagerHomeScreen SHALL tính toán các KPI từ danh sách đơn đã fetch từ `GET /api/app/manager/home/orders` như một fallback.

4. WHILE Admin_Home_Screen đang fetch dữ liệu, THE KPI_Card SHALL hiển thị skeleton loading state thay vì giá trị thực.

5. WHEN KPI_Card "Quá hạn" có giá trị lớn hơn 0, THE KPI_Card SHALL hiển thị màu cảnh báo (đỏ hoặc cam) để thu hút sự chú ý của manager.

6. WHEN người dùng nhấn vào KPI_Card "Đơn chờ xử lý" hoặc "Đang xử lý", THE Admin_Home_Screen SHALL điều hướng đến màn hình GarageOrders với filter tương ứng.

---

### Requirement 3: Management Sections — Các khối quản lý nghiệp vụ

**User Story:** As a garage_manager, I want thấy tổng quan từng nghiệp vụ (khách hàng, xe, nhân viên, dịch vụ, sản phẩm, bảo hành) được chia thành các section rõ ràng, so that tôi có thể nhanh chóng điều hướng đến phần cần quản lý.

#### Acceptance Criteria

1. WHEN Admin_Home_Screen được render, THE Admin_Home_Screen SHALL hiển thị ít nhất 6 Management_Section: Khách hàng, Nhân sự, Đơn dịch vụ, Catalog (Dịch vụ & Sản phẩm), Vận hành (Xe & Bảo hành), Thông báo.

2. WHEN Admin_API trả về dữ liệu stats từ `GET /api/app/admin/{resource}/stats`, THE Management_Section tương ứng SHALL hiển thị số liệu tổng hợp (tổng số bản ghi, số đang hoạt động).

3. WHEN người dùng nhấn vào một Management_Section, THE Admin_Home_Screen SHALL điều hướng đến màn hình quản lý tương ứng.

4. WHEN Admin_API trả về lỗi khi fetch stats của một section, THE Management_Section đó SHALL hiển thị giá trị "—" thay vì crash hoặc hiển thị số 0 sai lệch.

5. THE Admin_Home_Screen SHALL hiển thị Management_Section theo thứ tự ưu tiên nghiệp vụ: Active Orders → KPI Cards → Khách hàng → Nhân sự → Đơn dịch vụ → Catalog → Vận hành → Thông báo → Cài đặt.

6. WHERE Super_Admin_Role đang đăng nhập, THE Admin_Home_Screen SHALL hiển thị thêm Management_Section "Hệ thống Gara" với Quick_Action điều hướng đến SuperAdminGarages.

---

### Requirement 4: Pull-to-Refresh và Loading States

**User Story:** As a garage_manager, I want kéo xuống để làm mới dữ liệu trên màn hình chính, so that tôi luôn thấy thông tin cập nhật nhất mà không cần thoát và vào lại app.

#### Acceptance Criteria

1. WHEN người dùng kéo xuống trên Admin_Home_Screen, THE Admin_Home_Screen SHALL trigger refetch đồng thời tất cả các query: manager home summary, manager home orders, manager home notifications, và admin stats của tất cả resources.

2. WHILE pull-to-refresh đang thực hiện, THE Admin_Home_Screen SHALL hiển thị RefreshControl indicator.

3. WHEN tất cả các query đã hoàn thành (thành công hoặc lỗi), THE Admin_Home_Screen SHALL ẩn RefreshControl indicator.

4. WHEN Admin_Home_Screen được mount lần đầu, THE Admin_Home_Screen SHALL hiển thị loading skeleton cho toàn bộ nội dung cho đến khi ít nhất manager home orders và summary đã được fetch xong.

---

### Requirement 5: Header và Thông tin Gara

**User Story:** As a garage_manager, I want thấy tên gara và thông tin của mình ngay trên header màn hình chính, so that tôi biết mình đang quản lý gara nào.

#### Acceptance Criteria

1. WHEN Admin_Home_Screen được render, THE Admin_Home_Screen SHALL hiển thị tên gara đang hoạt động từ `garageContext.garageName` trong header.

2. WHEN Admin_Home_Screen được render, THE Admin_Home_Screen SHALL hiển thị tên người dùng đang đăng nhập từ `authSlice.userName`.

3. WHEN `garageContext.garageName` không có giá trị, THE Admin_Home_Screen SHALL hiển thị text fallback "Garage Dashboard".

4. WHEN người dùng nhấn vào khu vực thông tin gara trên header, THE Admin_Home_Screen SHALL điều hướng đến màn hình GarageManagement.

5. WHEN Admin_Home_Screen được render, THE Admin_Home_Screen SHALL hiển thị nút thông báo (notification bell) trên header với badge số lượng thông báo chưa đọc.

6. WHEN người dùng nhấn vào nút thông báo, THE Admin_Home_Screen SHALL điều hướng đến màn hình Notification.

---

### Requirement 6: Quick Actions Bar

**User Story:** As a garage_manager, I want có các nút tắt cho các thao tác thường dùng nhất ngay trên màn hình chính, so that tôi có thể thực hiện nhanh mà không cần điều hướng qua nhiều màn hình.

#### Acceptance Criteria

1. WHEN Admin_Home_Screen được render, THE Admin_Home_Screen SHALL hiển thị Quick_Action bar với ít nhất 3 nút: "Tạo đơn mới", "Thêm khách hàng", "Xem tất cả đơn".

2. WHEN người dùng nhấn "Tạo đơn mới", THE Admin_Home_Screen SHALL mở modal hoặc điều hướng đến màn hình tạo đơn dịch vụ mới.

3. WHEN người dùng nhấn "Thêm khách hàng", THE Admin_Home_Screen SHALL điều hướng đến màn hình GarageCustomers với trạng thái mở form tạo mới.

4. WHEN người dùng nhấn "Xem tất cả đơn", THE Admin_Home_Screen SHALL điều hướng đến màn hình GarageOrders.

---

### Requirement 7: Kiến trúc UI/Logic Separation

**User Story:** As a developer, I want Admin_Home_Screen tuân thủ pattern container/hook/view của codebase, so that code dễ maintain, test và mở rộng.

#### Acceptance Criteria

1. THE Admin_Home_Screen SHALL được tổ chức theo pattern: `ManagerHomeScreen.tsx` (container mỏng) → `useManagerHomeScreen.ts` (hook chứa toàn bộ logic) → `ManagerHomeScreenView.tsx` (view thuần nhận props).

2. THE useManagerHomeScreen SHALL chứa toàn bộ logic: gọi API, tính toán KPI, lọc đơn theo trạng thái, xử lý navigation handlers, và quản lý refresh state.

3. THE ManagerHomeScreenView SHALL không gọi API trực tiếp, không đọc Redux store trực tiếp, và chỉ nhận dữ liệu qua props.

4. THE Admin_Home_Screen SHALL tách các section thành component con riêng biệt: `ActiveOrdersSection`, `KPISection`, `ManagementSection`, `QuickActionsBar`.

5. THE useManagerHomeScreen SHALL export một view-model object rõ ràng với các field: `activeOrders`, `pendingOrders`, `processingOrders`, `overdueOrders`, `completedTodayCount`, `alertsCount`, `kpis`, `managementStats`, `isLoading`, `isRefreshing`, `onRefresh`, `onOrderPress`, `onSectionPress`, `onQuickAction`.

---

### Requirement 8: API Integration Testing — Service Orders CRUD

**User Story:** As a developer, I want kiểm thử toàn bộ luồng CRUD đơn dịch vụ qua Admin_API, so that tôi xác nhận các endpoint đã được tích hợp đúng chuẩn trong app.

#### Acceptance Criteria

1. WHEN gọi `GET /api/app/admin/service-orders`, THE Admin_API SHALL trả về danh sách đơn dịch vụ và app SHALL parse đúng cấu trúc response.

2. WHEN gọi `POST /api/app/admin/service-orders` với body hợp lệ, THE Admin_API SHALL tạo đơn mới và trả về đơn vừa tạo.

3. WHEN gọi `GET /api/app/admin/service-orders/:id` với id hợp lệ, THE Admin_API SHALL trả về chi tiết đơn.

4. WHEN gọi `PUT /api/app/admin/service-orders/:id/status` với status hợp lệ, THE Admin_API SHALL cập nhật trạng thái đơn.

5. WHEN gọi `PATCH /api/app/admin/service-orders/:id/assign` với employee_id hợp lệ, THE Admin_API SHALL gán đơn cho nhân viên.

6. WHEN gọi `PATCH /api/app/admin/service-orders/:id/complete` với delivery_date hợp lệ, THE Admin_API SHALL hoàn thành đơn và tạo bảo hành.

7. WHEN gọi `DELETE /api/app/admin/service-orders/:id`, THE Admin_API SHALL xóa đơn và trả về response thành công.

8. WHEN gọi `GET /api/app/admin/service-orders/stats`, THE Admin_API SHALL trả về object stats với ít nhất các field: `total_orders`, `processing_orders`.

---

### Requirement 9: API Integration Testing — Customers CRUD

**User Story:** As a developer, I want kiểm thử toàn bộ luồng CRUD khách hàng qua Admin_API, so that tôi xác nhận tích hợp đúng chuẩn.

#### Acceptance Criteria

1. WHEN gọi `GET /api/app/admin/customers`, THE Admin_API SHALL trả về danh sách khách hàng với đúng cấu trúc.

2. WHEN gọi `POST /api/app/admin/customers` với body hợp lệ, THE Admin_API SHALL tạo khách hàng mới.

3. WHEN gọi `GET /api/app/admin/customers/:id`, THE Admin_API SHALL trả về chi tiết khách hàng.

4. WHEN gọi `PUT /api/app/admin/customers/:id` hoặc `PATCH /api/app/admin/customers/:id`, THE Admin_API SHALL cập nhật thông tin khách hàng.

5. WHEN gọi `DELETE /api/app/admin/customers/:id`, THE Admin_API SHALL xóa liên kết khách hàng khỏi gara (không xóa tài khoản).

6. WHEN gọi `GET /api/app/admin/customers/:id/vehicles`, THE Admin_API SHALL trả về danh sách xe của khách hàng.

7. WHEN gọi `PUT /api/app/admin/customers/:id/driver-license`, THE Admin_API SHALL tạo hoặc cập nhật bằng lái của khách hàng.

8. WHEN gọi `GET /api/app/admin/customers/stats`, THE Admin_API SHALL trả về object stats với ít nhất field `total_customers`.

---

### Requirement 10: API Integration Testing — Employees CRUD

**User Story:** As a developer, I want kiểm thử toàn bộ luồng CRUD nhân viên qua Admin_API, so that tôi xác nhận tích hợp đúng chuẩn.

#### Acceptance Criteria

1. WHEN gọi `GET /api/app/admin/employees`, THE Admin_API SHALL trả về danh sách nhân viên.

2. WHEN gọi `POST /api/app/admin/employees` với body hợp lệ, THE Admin_API SHALL tạo nhân viên mới.

3. WHEN gọi `GET /api/app/admin/employees/:id`, THE Admin_API SHALL trả về chi tiết nhân viên.

4. WHEN gọi `PUT /api/app/admin/employees/:id`, THE Admin_API SHALL cập nhật thông tin nhân viên.

5. WHEN gọi `DELETE /api/app/admin/employees/:id`, THE Admin_API SHALL xóa nhân viên.

6. WHEN gọi `POST /api/app/admin/employees/assign-order` với employee_id và order_id hợp lệ, THE Admin_API SHALL gán đơn cho nhân viên.

7. WHEN gọi `GET /api/app/admin/employees/stats`, THE Admin_API SHALL trả về object stats với ít nhất field `total_employees`.

---

### Requirement 11: API Integration Testing — Catalog CRUD (Services, Products, Offers)

**User Story:** As a developer, I want kiểm thử toàn bộ luồng CRUD catalog qua Admin_API, so that tôi xác nhận tích hợp đúng chuẩn.

#### Acceptance Criteria

1. WHEN gọi `GET /api/app/admin/services`, THE Admin_API SHALL trả về danh sách dịch vụ.

2. WHEN gọi `POST /api/app/admin/services` với body hợp lệ, THE Admin_API SHALL tạo dịch vụ mới.

3. WHEN gọi `PUT /api/app/admin/services/:id`, THE Admin_API SHALL cập nhật dịch vụ.

4. WHEN gọi `DELETE /api/app/admin/services/:id`, THE Admin_API SHALL xóa dịch vụ.

5. WHEN gọi `GET /api/app/admin/products`, THE Admin_API SHALL trả về danh sách sản phẩm.

6. WHEN gọi `POST /api/app/admin/products` với body hợp lệ, THE Admin_API SHALL tạo sản phẩm mới.

7. WHEN gọi `PUT /api/app/admin/products/:id`, THE Admin_API SHALL cập nhật sản phẩm.

8. WHEN gọi `DELETE /api/app/admin/products/:id`, THE Admin_API SHALL xóa sản phẩm.

9. WHEN gọi `GET /api/app/admin/offers`, THE Admin_API SHALL trả về danh sách ưu đãi.

10. WHEN gọi `POST /api/app/admin/offers` với body hợp lệ, THE Admin_API SHALL tạo ưu đãi mới.

11. WHEN gọi `PUT /api/app/admin/offers/:id`, THE Admin_API SHALL cập nhật ưu đãi.

12. WHEN gọi `DELETE /api/app/admin/offers/:id`, THE Admin_API SHALL xóa ưu đãi.

---

### Requirement 12: API Integration Testing — Operations CRUD (Vehicles, Warranties)

**User Story:** As a developer, I want kiểm thử toàn bộ luồng CRUD vận hành qua Admin_API, so that tôi xác nhận tích hợp đúng chuẩn.

#### Acceptance Criteria

1. WHEN gọi `GET /api/app/admin/vehicles`, THE Admin_API SHALL trả về danh sách xe.

2. WHEN gọi `GET /api/app/admin/vehicles/:id`, THE Admin_API SHALL trả về chi tiết xe.

3. WHEN gọi `PUT /api/app/admin/vehicles/:id`, THE Admin_API SHALL cập nhật thông tin xe.

4. WHEN gọi `DELETE /api/app/admin/vehicles/:id`, THE Admin_API SHALL xóa xe.

5. WHEN gọi `GET /api/app/admin/vehicles/search` với query hợp lệ, THE Admin_API SHALL trả về danh sách xe khớp.

6. WHEN gọi `GET /api/app/admin/vehicles/:vehicleId/inspection`, THE Admin_API SHALL trả về thông tin kiểm định xe.

7. WHEN gọi `PUT /api/app/admin/vehicles/:vehicleId/inspection`, THE Admin_API SHALL tạo hoặc cập nhật kiểm định xe.

8. WHEN gọi `GET /api/app/admin/warranties`, THE Admin_API SHALL trả về danh sách bảo hành.

9. WHEN gọi `POST /api/app/admin/warranties` với body hợp lệ, THE Admin_API SHALL tạo bảo hành mới.

10. WHEN gọi `PUT /api/app/admin/warranties/:id`, THE Admin_API SHALL cập nhật bảo hành.

11. WHEN gọi `DELETE /api/app/admin/warranties/:id`, THE Admin_API SHALL xóa bảo hành.

---

### Requirement 13: API Integration Testing — Manager Home Endpoints

**User Story:** As a developer, I want kiểm thử các endpoint home của manager, so that tôi xác nhận dữ liệu KPI và đơn hàng được trả về đúng chuẩn.

#### Acceptance Criteria

1. WHEN gọi `GET /api/app/manager/home/summary` với token hợp lệ của garage_manager, THE Manager_API SHALL trả về response có `success: true` và object chứa stats vận hành.

2. WHEN gọi `GET /api/app/manager/home/orders` với token hợp lệ, THE Manager_API SHALL trả về danh sách đơn dịch vụ có thể parse được thành mảng `ServiceOrder[]`.

3. WHEN gọi `GET /api/app/manager/home/notifications` với token hợp lệ, THE Manager_API SHALL trả về danh sách thông báo.

4. WHEN gọi các endpoint Manager_API với token của role `customer` hoặc `employee`, THE Manager_API SHALL trả về HTTP 401 hoặc 403.

5. WHEN gọi `GET /api/app/manager/home/summary` và backend chưa có endpoint này, THE useManagerHomeScreen SHALL xử lý lỗi gracefully và fallback về tính toán từ orders list mà không crash app.

---

### Requirement 14: Role Guard và Phân quyền

**User Story:** As a system, I want đảm bảo chỉ đúng role mới truy cập được Admin_Home_Screen và các tính năng tương ứng, so that bảo mật phân quyền được duy trì.

#### Acceptance Criteria

1. WHEN người dùng với role `customer` hoặc `employee` cố truy cập Admin_Home_Screen, THE Admin_Home_Screen SHALL không render và hệ thống SHALL điều hướng về màn hình Home tương ứng với role đó.

2. WHEN người dùng với role `garage_manager` đăng nhập, THE Admin_Home_Screen SHALL render đầy đủ nhưng KHÔNG hiển thị Management_Section "Hệ thống Gara" (SuperAdminGarages).

3. WHEN người dùng với role `garage_admin` đăng nhập, THE Admin_Home_Screen SHALL render đầy đủ bao gồm Management_Section "Hệ thống Gara".

4. WHEN token hết hạn và Admin_Home_Screen cố fetch dữ liệu, THE Admin_Home_Screen SHALL xử lý lỗi 401 và điều hướng về màn hình đăng nhập.

5. THE Admin_Home_Screen SHALL đọc role từ `authSlice.userType` và kiểm tra bằng hàm `isManagerRole()` từ `rolePolicy.ts`.
