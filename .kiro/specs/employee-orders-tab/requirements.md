# Requirements Document

## Introduction

Tính năng này bổ sung tab "Đơn việc" vào thanh điều hướng (navbar) dành cho nhân viên (role `employee`). Hiện tại navbar nhân viên chỉ có 2 tab: Trang chủ (center) và Hồ sơ (phải). Sau khi thay đổi, navbar sẽ có 3 tab theo bố cục: **Đơn việc** (trái) — **Trang chủ** (center) — **Hồ sơ** (phải). Tab "Đơn việc" sẽ điều hướng đến `EmployeeOrdersScreen` đã có sẵn, được đăng ký như một tab trong `MainTabs` thay vì một stack screen độc lập. Khi hiển thị dưới dạng tab, màn hình không hiển thị nút back.

## Glossary

- **Navbar**: Thanh điều hướng dưới cùng (bottom tab bar) được render bởi component `Navbar` thông qua `useNavbarPolicy`.
- **NavbarPolicy**: Hàm `buildNavbarTabs` trong `navbarPolicy.ts` — xác định danh sách tab theo `userType`.
- **NavbarTabItem**: Kiểu dữ liệu mô tả một tab trong navbar, gồm `key`, `label`, `icon`, `routeName`, `isCenter`, `requiresAuth`.
- **Employee**: Người dùng có `userType === "employee"` trong Redux auth state.
- **EmployeeOrdersScreen**: Màn hình danh sách đơn hàng được giao cho nhân viên, đặt tại `src/screens/EmployeeOrders/EmployeeOrdersScreen.tsx`.
- **MainTabs**: Bottom tab navigator (`src/navigation/MainTabs.tsx`) chứa tất cả các tab screen.
- **TabParamList**: Kiểu định nghĩa các route name hợp lệ trong `MainTabs`.
- **Screen component**: Component layout `<Screen>` dùng prop `showBackButton` để kiểm soát hiển thị nút back.

## Requirements

### Requirement 1 — Cấu trúc navbar 3 tab cho nhân viên

**User Story:** As an employee, I want to see an "Đơn việc" tab in the navbar, so that I can quickly navigate to my assigned orders from anywhere in the app.

#### Acceptance Criteria

1. WHEN `buildNavbarTabs` is called with `userType === "employee"`, THE NavbarPolicy SHALL return exactly 3 `NavbarTabItem` entries in the following order: `EmployeeOrders` (left), `HomeTab` (center, `isCenter: true`), `Profile` (right).
2. THE NavbarPolicy SHALL assign `key: "orders"`, `label: "Đơn việc"`, `icon: "receipt-outline"`, `routeName: "EmployeeOrders"`, and `requiresAuth: true` to the "Đơn việc" tab item.
3. THE NavbarPolicy SHALL assign `isCenter: true` only to the `HomeTab` tab item in the employee tab list.
4. WHEN `splitNavbarTabs` processes the employee tab list, THE NavbarPolicy SHALL place the `EmployeeOrders` tab in `leftTabs` and the `Profile` tab in `rightTabs`.

### Requirement 2 — Đăng ký route EmployeeOrders trong MainTabs

**User Story:** As an employee, I want the "Đơn việc" tab to render `EmployeeOrdersScreen` inside the tab navigator, so that the bottom navbar remains visible while viewing my orders.

#### Acceptance Criteria

1. THE MainTabs SHALL register a `Tab.Screen` with `name="EmployeeOrders"` and `component={EmployeeOrdersScreen}`.
2. THE TabParamList SHALL include `EmployeeOrders: undefined` as a valid route entry.
3. WHEN the employee navigates to the `EmployeeOrders` tab, THE MainTabs SHALL render `EmployeeOrdersScreen` without removing the bottom navbar.

### Requirement 3 — Ẩn nút back khi EmployeeOrdersScreen hiển thị dưới dạng tab

**User Story:** As an employee, I want the orders screen to not show a back button when accessed via the tab, so that the navigation experience is consistent with other tab screens.

#### Acceptance Criteria

1. WHEN `EmployeeOrdersScreen` is rendered as a tab inside `MainTabs`, THE EmployeeOrdersScreen SHALL render the `<Screen>` component with `showBackButton={false}`.
2. THE EmployeeOrdersScreen SHALL accept a prop or detect context to determine whether it is rendered as a tab or as a stack screen, and SHALL set `showBackButton` accordingly.

### Requirement 4 — Không ảnh hưởng đến các role khác

**User Story:** As a system maintainer, I want the navbar changes to be isolated to the employee role, so that other user roles (customer, manager, super admin, dealer) are not affected.

#### Acceptance Criteria

1. WHEN `buildNavbarTabs` is called with any `userType` other than `"employee"`, THE NavbarPolicy SHALL return the same tab list as before this change.
2. THE MainTabs SHALL continue to register all existing `Tab.Screen` entries unchanged after adding the `EmployeeOrders` screen.
