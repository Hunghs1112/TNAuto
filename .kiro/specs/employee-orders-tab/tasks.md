# Implementation Plan: employee-orders-tab

## Overview

Ba thay đổi nhỏ, gói gọn trong 3 file: cập nhật `navbarPolicy.ts` để thêm tab và sửa logic split, đăng ký route mới trong `MainTabs.tsx`, và điều chỉnh `showBackButton` trong `EmployeeOrdersScreen.tsx` để phản ánh đúng navigation context.

## Tasks

- [ ] 1. Cập nhật `navbarPolicy.ts`
  - [ ] 1.1 Thêm tab EmployeeOrders vào employee case và sửa `splitNavbarTabs`
    - Trong `buildNavbarTabs`, thêm entry `{ key: "orders", label: "Đơn việc", icon: "receipt-outline", routeName: "EmployeeOrders", requiresAuth: true }` vào đầu mảng employee
    - Sửa `splitNavbarTabs` để dùng `Math.ceil(nonCenter.length / 2)` thay vì `slice(0,2)` / `slice(2,4)` cứng
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ]* 1.2 Viết property test cho Property 1 — Employee navbar có đúng 3 tab theo thứ tự chuẩn
    - **Property 1: Employee navbar có đúng 3 tab theo thứ tự chuẩn**
    - **Validates: Requirements 1.1, 1.3**

  - [ ]* 1.3 Viết property test cho Property 2 — splitNavbarTabs đặt đúng tab vào đúng bên
    - **Property 2: splitNavbarTabs đặt đúng tab vào đúng bên**
    - **Validates: Requirements 1.4**

  - [ ]* 1.4 Viết property test cho Property 3 — Các role khác không bị ảnh hưởng
    - **Property 3: Các role khác không bị ảnh hưởng**
    - **Validates: Requirements 4.1**

- [ ] 2. Cập nhật `MainTabs.tsx`
  - [ ] 2.1 Thêm `EmployeeOrders` vào `TabParamList` và đăng ký `Tab.Screen`
    - Thêm `EmployeeOrders: undefined` vào `TabParamList`
    - Import `EmployeeOrdersScreen` từ `../screens/EmployeeOrders/EmployeeOrdersScreen`
    - Thêm `<Tab.Screen name="EmployeeOrders" component={EmployeeOrdersScreen} />` vào `Tab.Navigator`
    - Giữ nguyên tất cả `Tab.Screen` hiện có — không xóa bất kỳ entry nào
    - _Requirements: 2.1, 2.2, 2.3, 4.2_

- [ ] 3. Checkpoint — Đảm bảo TypeScript compile thành công
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Cập nhật `EmployeeOrdersScreen.tsx`
  - [ ] 4.1 Detect navigation context và điều chỉnh `showBackButton` động
    - Import `useNavigationState` từ `@react-navigation/native`
    - Thêm `const navType = useNavigationState((state) => state?.type)` vào đầu component
    - Thay `showBackButton={true}` (hardcoded) thành `showBackButton={navType !== 'tab'}` ở cả hai vị trí render `<Screen>` trong component (empty state và main render)
    - _Requirements: 3.1, 3.2_

  - [ ]* 4.2 Viết property test cho Property 4 — showBackButton phản ánh đúng navigation context
    - **Property 4: showBackButton phản ánh đúng navigation context**
    - **Validates: Requirements 3.1, 3.2**

- [ ] 5. Checkpoint cuối — Đảm bảo tất cả tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks đánh dấu `*` là optional và có thể bỏ qua để triển khai nhanh hơn
- `EmployeeOrders` vẫn giữ nguyên trong `AppStackParamList` / `AppNavigator` — không xóa, không ảnh hưởng
- `splitNavbarTabs` với `Math.ceil` split: với 4 non-center tabs (manager/customer) `mid=2` → kết quả giống hệt hiện tại; với 2 non-center tabs (employee) `mid=1` → đúng yêu cầu
- `useNavigationState` đã có sẵn trong `@react-navigation/native` — không cần cài thêm dependency

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1"] },
    { "id": 1, "tasks": ["4.1", "1.2", "1.3", "1.4"] },
    { "id": 2, "tasks": ["4.2"] }
  ]
}
```
