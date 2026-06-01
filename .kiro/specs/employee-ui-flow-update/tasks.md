# Implementation Plan

## Overview

Cập nhật giao diện và luồng điều hướng cho role nhân viên (employee) trong ứng dụng TNAuto. Bao gồm: tinh gọn Navbar, ẩn các thành phần không phù hợp trên HomeScreen và ProfileScreen, tạo màn hình đổi mật khẩu riêng, và thêm backend API hỗ trợ.

## Task Dependency Graph

```json
{
  "waves": [
    {
      "wave": 1,
      "tasks": ["1", "2", "5", "6", "7"],
      "description": "Backend API, frontend API layer, Navbar, HomeScreen, EmployeeOrdersList — tất cả độc lập nhau"
    },
    {
      "wave": 2,
      "tasks": ["3"],
      "description": "ChangePasswordScreen — phụ thuộc Task 2 (mutation đã có)"
    },
    {
      "wave": 3,
      "tasks": ["4"],
      "description": "ProfileScreen update — phụ thuộc Task 3 (route ChangePassword đã có)"
    },
    {
      "wave": 4,
      "tasks": ["8"],
      "description": "Documentation — thực hiện sau khi tất cả thay đổi hoàn tất"
    }
  ]
}
```

## Notes

- Tất cả thay đổi UI được giới hạn trong phạm vi role `employee` — các role khác không bị ảnh hưởng.
- Backend: tái sử dụng pattern bcrypt từ `garageManager.service.js#changePassword`.
- Frontend: tái sử dụng `AuthShell`, `TextInputComponent`, `Button` từ các màn hình login hiện có.
- Không có thay đổi schema DB.

## Tasks

- [x] 1. Backend: Thêm endpoint đổi mật khẩu cho nhân viên
  - [x] 1.1 Thêm method `changePassword` vào `employee.service.js`
    - Đọc employee theo `employee_id` từ DB
    - So sánh `current_password` với hash bằng `bcrypt.compare`
    - Nếu sai → throw ApiError 400 "Mật khẩu hiện tại không đúng"
    - Hash `new_password` mới bằng bcrypt
    - UPDATE cột `password` trong bảng `employees`
    - Tham khảo pattern từ `garageManager.service.js#changePassword`
    - **Files:** `TNAUTO-backend/src/domains/employee/employee.service.js`
  - [x] 1.2 Thêm handler `changePassword` vào `employee.controller.js`
    - Lấy `employee_id` từ `req.auth`
    - Validate `current_password` và `new_password` có trong body
    - Gọi `service.changePassword(employeeId, current_password, new_password)`
    - Trả về 200 `{ success: true, message: "Đổi mật khẩu thành công" }` hoặc forward error
    - **Files:** `TNAUTO-backend/src/domains/employee/employee.controller.js`
  - [x] 1.3 Đăng ký route `PUT /change-password` trong `employee.js`
    - Thêm `router.put('/change-password', requireEmployeeAuth, employeeController.changePassword.bind(employeeController))`
    - **Files:** `TNAUTO-backend/src/routes/app/employee.js`

- [x] 2. Frontend: Thêm API endpoint và mutation cho đổi mật khẩu
  - [x] 2.1 Thêm `employeeChangePassword` vào `apiEndpoints.ts`
    - `method: 'PUT'`, `path: '/api/app/employee/change-password'`
    - **Files:** `src/constants/apiEndpoints.ts`
  - [x] 2.2 Thêm mutation `changePassword` vào `employeeApi.ts`
    - Kiểu input: `{ current_password: string; new_password: string }`
    - Kiểu output: `{ success: boolean; message?: string }`
    - Export `useChangePasswordMutation`
    - **Files:** `src/services/employeeApi.ts`

- [x] 3. Frontend: Tạo màn hình ChangePassword
  - [x] 3.1 Tạo `ChangePasswordScreen.tsx`
    - Dùng `AuthShell` làm layout (title: "Đổi mật khẩu", subtitle: "Nhập mật khẩu hiện tại và mật khẩu mới")
    - 3 trường: mật khẩu hiện tại, mật khẩu mới, xác nhận mật khẩu mới (đều `secureTextEntry`)
    - Hiển thị lỗi validation inline dưới mỗi trường (Text màu đỏ)
    - Validation: độ dài 6–50, không trùng mật khẩu cũ, xác nhận khớp
    - Gọi `useChangePasswordMutation`, disable button khi loading
    - Thành công: `Alert.alert` → `navigation.goBack()`
    - Thất bại: hiển thị lỗi từ API, giữ form
    - **Files:** `src/screens/Login/ChangePasswordScreen.tsx`
  - [x] 3.2 Đăng ký route `ChangePassword` trong `AppNavigator.tsx`
    - Thêm `ChangePassword: { phone: string }` vào `AppStackParamList`
    - Import và thêm `<Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />`
    - **Files:** `src/navigation/AppNavigator.tsx`

- [ ] 4. Frontend: Cập nhật ProfileScreen cho employee
  - [-] 4.1 Cập nhật `getChangePasswordHandler` trong `useProfileScreen.ts`
    - Đổi case `'employee'` để navigate đến `'ChangePassword'` với param `{ phone: userPhone }`
    - **Files:** `src/screens/Profile/useProfileScreen.ts`
  - [ ] 4.2 Cập nhật `buildRoleMenuConfig` case `'employee'` trong `useProfileScreen.ts`
    - Giữ lại section `account` với 2 items: `accountInfo` và `changePassword`
    - Xóa item `notification` (Cài đặt thông báo) khỏi section account của employee
    - Xóa toàn bộ section `work` (Công việc)
    - **Files:** `src/screens/Profile/useProfileScreen.ts`

- [x] 5. Frontend: Cập nhật Navbar cho employee
  - Cập nhật block `isEmployee` trong `buildNavbarTabs` tại `navbarPolicy.ts`
  - Thay 5 tabs hiện tại bằng 2 tabs: `HomeTab` (center) và `Profile` (requiresAuth)
  - Kiểm tra `Navbar` component render đúng với chỉ 1 non-center tab (leftTabs có 1 item, rightTabs rỗng)
  - **Files:** `src/components/navbarPolicy.ts`

- [x] 6. Frontend: Cập nhật HomeScreen cho employee
  - [x] 6.1 Ẩn section "Thông tin bảo hành" trong `HomeScreen.tsx`
    - Xóa block `<View style={styles.section}><SectionHeader title="Thông tin bảo hành" /><WarrantyInfo .../></View>` khỏi phần render của `userType === "employee"`
    - **Files:** `src/screens/Home/HomeScreen.tsx`
  - [x] 6.2 Ẩn nút "Ưu đãi" và "Bảo hành" trong heroActionsOverlay cho employee
    - Bọc nút `pricetag-outline` và `shield-checkmark-outline` trong điều kiện `userType !== "employee"`
    - Đảm bảo `userType` accessible tại vị trí render (đã có trong `useHomeScreen()`)
    - **Files:** `src/screens/Home/HomeScreen.tsx`

- [x] 7. Frontend: Đổi default filter trong EmployeeOrdersList
  - Đổi `useState('all' as OrderStatus)` thành `useState('in_progress' as OrderStatus)`
  - Thêm `useFocusEffect` từ `@react-navigation/native` để reset `selectedStatus` về `'in_progress'` mỗi khi screen được focus
  - **Files:** `src/screens/Home/components/EmployeeOrdersList.tsx`

- [~] 8. Viết tài liệu mô tả thay đổi
  - Tạo file `docs/employee-ui-flow-update.md` trong thư mục gốc của project
  - Mô tả tất cả thay đổi đã thực hiện: Navbar, HomeScreen, ProfileScreen, ChangePassword screen, Backend API
  - **Files:** `docs/employee-ui-flow-update.md`
