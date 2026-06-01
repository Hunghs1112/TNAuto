# Employee UI Flow Update

**Ngày:** 2026-05-24  
**Phạm vi:** Role `employee` — các role khác không bị ảnh hưởng

---

## Tóm tắt thay đổi

Cập nhật giao diện và luồng điều hướng cho nhân viên (employee) nhằm tinh gọn trải nghiệm, loại bỏ các thành phần không phù hợp, và sửa lỗi điều hướng khi đổi mật khẩu.

---

## 1. Navbar — Tinh gọn tabs cho nhân viên

**File:** `src/components/navbarPolicy.ts`

**Trước:** Nhân viên thấy 5 tabs: Thông báo, Đơn hàng, Trang chủ, Dịch vụ, Cài đặt.  
**Sau:** Nhân viên chỉ thấy 2 tabs: **Trang chủ** (center) và **Hồ sơ**.

- Tab **Đơn hàng** (`GarageOrders`) bị ẩn — nhân viên không có quyền truy cập màn hình này.
- Tab **Thông báo** (`Notification`) bị ẩn — đã có nút thông báo ở header trên cao.
- Tab **Dịch vụ** (`ServiceCategory`) bị ẩn — nhân viên không cần duyệt danh mục dịch vụ.

---

## 2. HomeScreen — Ẩn section "Thông tin bảo hành"

**File:** `src/screens/Home/HomeScreen.tsx`

Section "Thông tin bảo hành" (component `WarrantyInfo`) đã bị xóa khỏi phần render dành cho `userType === "employee"`. Component `WarrantyInfo` vẫn tồn tại trong codebase và hoạt động bình thường cho các role khác.

---

## 3. HomeScreen — Ẩn nút "Ưu đãi" và "Bảo hành" ở header

**File:** `src/screens/Home/HomeScreen.tsx`

Nút **Ưu đãi** (`pricetag-outline`) và nút **Bảo hành** (`shield-checkmark-outline`) trong `heroActionsOverlay` được bọc trong điều kiện `userType !== "employee"`. Nút **Thông báo** vẫn hiển thị cho nhân viên.

---

## 4. HomeScreen — Tab "Đang xử lý" là mặc định

**File:** `src/screens/Home/components/EmployeeOrdersList.tsx`

- `selectedStatus` khởi tạo với `'in_progress'` thay vì `'all'`.
- Thêm `useFocusEffect` để reset về `'in_progress'` mỗi khi màn hình được focus lại.

---

## 5. ProfileScreen — Ẩn "Cài đặt thông báo" và section "Công việc"

**File:** `src/screens/Profile/useProfileScreen.ts`

`case 'employee'` trong `buildRoleMenuConfig` được cập nhật:
- Section **Tài khoản** chỉ còn 2 mục: "Thông tin tài khoản" và "Đổi mật khẩu" (bỏ "Cài đặt thông báo").
- Section **Công việc** (id: `work`) bị xóa hoàn toàn.

---

## 6. ProfileScreen — Sửa lỗi "Đổi mật khẩu" redirect về Login

**Files:**
- `src/screens/Profile/useProfileScreen.ts`
- `src/screens/Login/ChangePasswordScreen.tsx` *(mới)*
- `src/navigation/AppNavigator.tsx`
- `src/services/employeeApi.ts`
- `src/constants/apiEndpoints.ts`

**Vấn đề cũ:** Bấm "Đổi mật khẩu" trong ProfileScreen redirect nhân viên về màn hình đăng nhập (`EmployeePasswordScreen`).

**Giải pháp:**
1. Tạo màn hình mới `ChangePasswordScreen` với form 3 trường (mật khẩu hiện tại, mật khẩu mới, xác nhận).
2. Đăng ký route `ChangePassword: { phone: string }` trong `AppStackParamList`.
3. Cập nhật `getChangePasswordHandler` case `'employee'` để navigate đến `ChangePassword` thay vì `EmployeePassword`.
4. Thêm mutation `useChangePasswordMutation` vào `employeeApi.ts`.
5. Thêm endpoint `employeeChangePassword` vào `apiEndpoints.ts`.

**Validation client-side:**
- Mật khẩu mới: 6–50 ký tự
- Mật khẩu mới không được trùng mật khẩu hiện tại
- Xác nhận phải khớp mật khẩu mới

---

## 7. Backend — API đổi mật khẩu cho nhân viên

**Files:**
- `TNAUTO-backend/src/routes/app/employee.js`
- `TNAUTO-backend/src/domains/employee/employee.controller.js`
- `TNAUTO-backend/src/domains/employee/employee.service.js`
- `TNAUTO-backend/src/domains/employee/employee.repository.js`

**Endpoint mới:** `PUT /api/app/employee/change-password`

- Yêu cầu Bearer token (`requireEmployeeAuth`).
- Body: `{ current_password: string, new_password: string }`.
- Xác minh `current_password` bằng `verifyPassword` (passwordHashService).
- Hash `new_password` mới bằng `hashPassword`.
- Trả về `200 { success: true, message: "Đổi mật khẩu thành công" }`.
- Trả về `400` nếu mật khẩu hiện tại sai.
- Trả về `401` nếu không có token hợp lệ.

---

## Checklist kiểm tra thủ công

- [ ] Đăng nhập với role `employee` → navbar chỉ thấy 2 tabs (Trang chủ + Hồ sơ)
- [ ] HomeScreen employee → không thấy section "Thông tin bảo hành"
- [ ] HomeScreen employee → không thấy nút Ưu đãi và Bảo hành ở header, vẫn thấy nút Thông báo
- [ ] HomeScreen employee → phần "Việc đang đảm nhận" mặc định hiển thị tab "Đang xử lý"
- [ ] Rời HomeScreen và quay lại → tab reset về "Đang xử lý"
- [ ] ProfileScreen employee → không thấy "Cài đặt thông báo", không thấy section "Công việc"
- [ ] ProfileScreen employee → bấm "Đổi mật khẩu" → mở màn hình form (không phải trang đăng nhập)
- [ ] Form đổi mật khẩu → validation inline hoạt động đúng
- [ ] Đổi mật khẩu thành công → quay về ProfileScreen
- [ ] Nhập sai mật khẩu hiện tại → hiển thị lỗi, giữ form
- [ ] Đăng nhập với role `customer`, `dealer`, `manager`, `garage_admin` → không bị ảnh hưởng
