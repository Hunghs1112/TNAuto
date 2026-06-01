# Requirements Document

## Introduction

Tài liệu này mô tả các yêu cầu cập nhật giao diện dành riêng cho role **nhân viên (employee)** trong ứng dụng TNAuto. Mục tiêu là tinh gọn trải nghiệm người dùng, loại bỏ các thành phần không phù hợp với công việc thực tế của nhân viên, và sửa các lỗi điều hướng hiện có.

## Glossary

| Thuật ngữ | Định nghĩa |
|---|---|
| Employee | Nhân viên kỹ thuật tại gara, role `employee` trong hệ thống |
| HomeScreen | Màn hình chính sau khi đăng nhập |
| Navbar | Thanh điều hướng dưới cùng (bottom tab bar) |
| ProfileScreen | Màn hình hồ sơ / cài đặt tài khoản |
| EmployeeOrdersList | Component hiển thị danh sách đơn hàng được giao cho nhân viên, có bộ lọc trạng thái |
| AvailableOrdersList | Component hiển thị đơn hàng mới chưa được giao cho ai |
| WarrantyInfo | Component hiển thị thông tin bảo hành trên HomeScreen |
| HeroActionsOverlay | Nhóm nút hành động nhanh ở góc trên phải HomeScreen (Ưu đãi, Bảo hành, Thông báo) |
| ChangePassword | Màn hình đổi mật khẩu dành cho nhân viên |

## Requirements

### Requirement 1: HomeScreen — Đặt tab "Đang xử lý" làm mặc định trong EmployeeOrdersList

**User Story:** As a nhân viên, I want phần "Việc đang đảm nhận" hiển thị tab "Đang xử lý" ngay khi vào HomeScreen, so that tôi thấy ngay các công việc cần xử lý mà không cần bấm thêm bước.

#### Acceptance Criteria

1. WHEN nhân viên mở HomeScreen, THE system SHALL khởi tạo `EmployeeOrdersList` với `selectedStatus` bằng `'in_progress'` (thay vì `'all'` như hiện tại).
2. WHEN `selectedStatus` là `'in_progress'` và không có đơn nào ở trạng thái đó, THE system SHALL hiển thị empty state với thông báo `"Không có đơn ở trạng thái \"Đang xử lý\""`.
3. WHEN nhân viên bấm vào một tab trạng thái khác trong bộ lọc, THE system SHALL cập nhật `selectedStatus` và lọc lại danh sách theo trạng thái được chọn.
4. WHEN nhân viên điều hướng rời khỏi HomeScreen và quay lại (screen focus event), THE system SHALL reset `selectedStatus` về `'in_progress'`.

---

### Requirement 2: HomeScreen — Ẩn section "Thông tin bảo hành"

**User Story:** As a nhân viên, I want không thấy section "Thông tin bảo hành" trên HomeScreen, so that giao diện gọn hơn và tập trung vào công việc thực tế.

#### Acceptance Criteria

1. WHEN nhân viên xem HomeScreen, THE system SHALL NOT render section "Thông tin bảo hành" (không được xuất hiện trong cây component, không chỉ ẩn bằng style).
2. WHEN section bảo hành bị loại bỏ, THE system SHALL vẫn render đầy đủ section "Việc mới tạo chưa giao ai" và section "Việc đang đảm nhận".
3. THE system SHALL NOT xóa component `WarrantyInfo` khỏi codebase — component vẫn hoạt động bình thường khi được sử dụng ở các màn hình hoặc userType khác.
4. IF userType không phải `employee`, THE system SHALL không bị ảnh hưởng bởi thay đổi này.

---

### Requirement 3: Navbar — Ẩn các tab không phù hợp với role nhân viên

**User Story:** As a nhân viên, I want navbar chỉ hiển thị các tab thực sự cần thiết cho công việc, so that tôi không bị nhầm lẫn bởi các tab không có quyền truy cập hoặc không liên quan.

#### Acceptance Criteria

1. WHEN nhân viên đăng nhập, THE system SHALL hiển thị navbar với đúng 2 tab: **Trang chủ** (center, routeName: `HomeTab`) và **Hồ sơ** (routeName: `Profile`, requiresAuth: true).
2. THE system SHALL NOT render tab **Đơn hàng** (routeName: `GarageOrders`) trong navbar của nhân viên.
3. THE system SHALL NOT render tab **Thông báo** (routeName: `Notification`) trong navbar của nhân viên.
4. THE system SHALL NOT render tab **Dịch vụ** (routeName: `ServiceCategory`) trong navbar của nhân viên.
5. WHEN nhân viên bấm vào tab Trang chủ, THE system SHALL điều hướng đến `HomeTab`.
6. WHEN nhân viên bấm vào tab Hồ sơ, THE system SHALL điều hướng đến `Profile`.

---

### Requirement 4: HomeScreen — Ẩn nút "Bảo hành" và "Ưu đãi" trong HeroActionsOverlay

**User Story:** As a nhân viên, I want không thấy nút "Bảo hành" và "Ưu đãi" ở góc trên phải HomeScreen, so that giao diện phù hợp với vai trò của tôi và không gây nhầm lẫn.

#### Acceptance Criteria

1. WHEN nhân viên xem HomeScreen, THE system SHALL NOT render nút "Ưu đãi" (icon `pricetag-outline`) trong `heroActionsOverlay`.
2. WHEN nhân viên xem HomeScreen, THE system SHALL NOT render nút "Bảo hành" (icon `shield-checkmark-outline`) trong `heroActionsOverlay`.
3. WHEN nhân viên xem HomeScreen, THE system SHALL vẫn render nút "Thông báo" (icon `notifications-outline`) trong `heroActionsOverlay`.
4. IF userType không phải `employee`, THE system SHALL hiển thị đầy đủ cả 3 nút như hiện tại.

---

### Requirement 5: ProfileScreen — Tạo màn hình đổi mật khẩu cho nhân viên

**User Story:** As a nhân viên, I want bấm vào "Đổi mật khẩu" trong ProfileScreen sẽ mở một màn hình đổi mật khẩu riêng, so that tôi có thể cập nhật mật khẩu mà không bị đưa về trang đăng nhập.

#### Acceptance Criteria

1. WHEN nhân viên bấm "Đổi mật khẩu" trong ProfileScreen, THE system SHALL điều hướng đến màn hình `ChangePassword` (route mới trong `AppStackParamList` với param `{ phone: string }`).
2. THE ChangePassword screen SHALL render form với 3 trường: mật khẩu hiện tại, mật khẩu mới, xác nhận mật khẩu mới.
3. IF mật khẩu mới có độ dài dưới 6 ký tự hoặc trên 50 ký tự, THE system SHALL hiển thị lỗi validation inline dưới trường mật khẩu mới trước khi gọi API.
4. IF mật khẩu mới trùng với mật khẩu hiện tại, THE system SHALL hiển thị lỗi validation inline "Mật khẩu mới không được trùng mật khẩu hiện tại".
5. IF mật khẩu xác nhận không khớp với mật khẩu mới, THE system SHALL hiển thị lỗi validation inline dưới trường xác nhận mật khẩu.
6. WHEN tất cả validation hợp lệ và nhân viên bấm xác nhận, THE system SHALL disable nút submit và hiển thị trạng thái loading trong khi gọi API.
7. WHEN API trả về thành công, THE system SHALL hiển thị thông báo thành công và điều hướng về ProfileScreen.
8. WHEN API trả về lỗi, THE system SHALL hiển thị thông báo lỗi cụ thể và giữ nguyên form để nhân viên sửa lại.
9. THE system SHALL NOT redirect nhân viên về trang đăng nhập khi bấm "Đổi mật khẩu" từ ProfileScreen.
10. WHEN nhân viên bấm nút quay lại trên ChangePassword screen, THE system SHALL điều hướng về ProfileScreen mà không thực hiện thay đổi nào.

---

### Requirement 6: ProfileScreen — Ẩn mục "Cài đặt thông báo" cho nhân viên

**User Story:** As a nhân viên, I want không thấy mục "Cài đặt thông báo" trong ProfileScreen, so that menu hồ sơ gọn hơn và chỉ hiển thị các tùy chọn thực sự cần thiết.

#### Acceptance Criteria

1. WHEN nhân viên xem ProfileScreen, THE system SHALL NOT render mục "Cài đặt thông báo" (id: `notification`) trong section Tài khoản của employee.
2. WHEN mục "Cài đặt thông báo" bị loại bỏ, THE system SHALL vẫn render "Thông tin tài khoản" (id: `accountInfo`) và "Đổi mật khẩu" (id: `changePassword`) trong section Tài khoản.
3. IF userType không phải `employee`, THE system SHALL hiển thị "Cài đặt thông báo" như hiện tại.

---

### Requirement 7: ProfileScreen — Ẩn section "Công việc" cho nhân viên

**User Story:** As a nhân viên, I want không thấy section "Công việc" trong ProfileScreen, so that menu hồ sơ không bị trùng lặp với thông tin đã có trên HomeScreen.

#### Acceptance Criteria

1. WHEN nhân viên xem ProfileScreen, THE system SHALL NOT render section có id `work` (bao gồm các mục "Đơn hàng của tôi" và "Thông báo").
2. WHEN section "Công việc" bị loại bỏ, THE system SHALL vẫn render section "Tài khoản" với các mục còn lại.
3. IF userType không phải `employee`, THE system SHALL không bị ảnh hưởng bởi thay đổi này.

---

### Requirement 8: Backend — API đổi mật khẩu cho nhân viên

**User Story:** As a nhân viên, I want hệ thống backend hỗ trợ API đổi mật khẩu an toàn, so that tôi có thể cập nhật mật khẩu từ ứng dụng mà không cần qua luồng đăng nhập lại.

#### Acceptance Criteria

1. WHERE backend chưa có endpoint đổi mật khẩu cho employee, THE system SHALL cung cấp endpoint `PUT /api/employees/change-password` nhận body `{ current_password: string, new_password: string }`.
2. THE endpoint SHALL yêu cầu xác thực Bearer token hợp lệ — trả về HTTP 401 nếu không có token hoặc token không hợp lệ.
3. WHEN `current_password` không khớp với mật khẩu hiện tại của nhân viên, THE system SHALL trả về HTTP 400 với message lỗi rõ ràng.
4. WHEN `new_password` hợp lệ và `current_password` đúng, THE system SHALL cập nhật mật khẩu và trả về HTTP 200.
5. IF backend đã có endpoint phù hợp, THE system SHALL tái sử dụng endpoint đó thay vì tạo mới.
