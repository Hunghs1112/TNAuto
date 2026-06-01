# Design Document

## Overview

Cập nhật giao diện và luồng điều hướng cho role **nhân viên (employee)** trong ứng dụng TNAuto. Các thay đổi tập trung vào 4 khu vực: HomeScreen, Navbar, ProfileScreen, và Backend API. Tất cả thay đổi đều được giới hạn trong phạm vi role `employee` — các role khác không bị ảnh hưởng.

## Architecture

Không có thay đổi kiến trúc tổng thể. Các thay đổi là cục bộ trong từng file:

```
Frontend (React Native)
├── src/components/navbarPolicy.ts          ← Cập nhật tabs cho employee
├── src/screens/Home/HomeScreen.tsx         ← Ẩn WarrantyInfo, ẩn Offer/Warranty buttons
├── src/screens/Home/components/
│   └── EmployeeOrdersList.tsx              ← Đổi default status filter
├── src/screens/Profile/useProfileScreen.ts ← Cập nhật employee menu config
├── src/screens/Login/ChangePasswordScreen.tsx  ← Màn hình mới
├── src/navigation/AppNavigator.tsx         ← Thêm route ChangePassword
└── src/services/employeeApi.ts             ← Thêm mutation changePassword

Backend (Node.js/Express)
└── src/routes/app/employee.js              ← Thêm PUT /change-password
    src/domains/employee/employee.controller.js  ← Thêm handler
    src/domains/employee/employee.service.js     ← Thêm service method
```

## Components and Interfaces

### 1. navbarPolicy.ts — Employee tabs

**Thay đổi:** Thay thế block `isEmployee` từ 5 tabs xuống còn 2 tabs (HomeTab + Profile).

```typescript
// Trước
if (isEmployee) {
  return [
    { key: "notification", routeName: "Notification", ... },
    { key: "orders",       routeName: "GarageOrders", ... },
    { key: "home",         routeName: "HomeTab", isCenter: true, ... },
    { key: "service",      routeName: "ServiceCategory", ... },
    { key: "settings",     routeName: "Profile", ... },
  ];
}

// Sau
if (isEmployee) {
  return [
    { key: "home",     label: "Trang chủ", icon: "home", routeName: "HomeTab", isCenter: true },
    { key: "settings", label: "Hồ sơ",     icon: "settings-outline", routeName: "Profile", requiresAuth: true },
  ];
}
```

**Lưu ý:** `splitNavbarTabs` hiện tại slice `leftTabs = slice(0,2)` và `rightTabs = slice(2,4)`. Với 2 tabs (1 center + 1 non-center), `leftTabs` sẽ có 1 item và `rightTabs` sẽ rỗng — cần kiểm tra Navbar component có render đúng không.

### 2. HomeScreen.tsx — Ẩn WarrantyInfo và hero buttons

**Thay đổi A — Ẩn section bảo hành:**

```tsx
// Xóa block này trong phần userType === "employee":
<View style={styles.section}>
  <SectionHeader title="Thông tin bảo hành" />
  <WarrantyInfo ... />
</View>
```

**Thay đổi B — Ẩn nút Ưu đãi và Bảo hành trong heroActionsOverlay:**

```tsx
// Trước: render cả 3 nút cho mọi role đã đăng nhập
{isLoggedIn && (
  <View style={styles.heroActionsOverlay}>
    <TouchableOpacity onPress={actions.onOfferPress}>...</TouchableOpacity>
    <TouchableOpacity onPress={actions.onWarrantyPress}>...</TouchableOpacity>
    <TouchableOpacity onPress={actions.onNotificationPress}>...</TouchableOpacity>
  </View>
)}

// Sau: ẩn Offer và Warranty với employee
{isLoggedIn && (
  <View style={styles.heroActionsOverlay}>
    {userType !== "employee" && (
      <TouchableOpacity onPress={actions.onOfferPress}>...</TouchableOpacity>
    )}
    {userType !== "employee" && (
      <TouchableOpacity onPress={actions.onWarrantyPress}>...</TouchableOpacity>
    )}
    <TouchableOpacity onPress={actions.onNotificationPress}>...</TouchableOpacity>
  </View>
)}
```

**Lưu ý:** `userType` hiện chỉ có trong `StandardHomeScreen` (từ `useHomeScreen()`). Cần đảm bảo `userType` accessible tại vị trí render heroActionsOverlay.

### 3. EmployeeOrdersList.tsx — Default status filter

**Thay đổi:** Đổi giá trị khởi tạo của `useState` và thêm `useFocusEffect` để reset khi quay lại màn hình.

```tsx
import { useFocusEffect } from '@react-navigation/native';

const EmployeeOrdersList = ({ ... }) => {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('in_progress'); // ← đổi từ 'all'

  // Reset về in_progress mỗi khi screen được focus lại
  useFocusEffect(
    React.useCallback(() => {
      setSelectedStatus('in_progress');
    }, [])
  );
  // ...
};
```

### 4. useProfileScreen.ts — Employee menu config

**Thay đổi:** Cập nhật `case 'employee'` trong `buildRoleMenuConfig`:

```typescript
case 'employee':
  return [
    {
      id: 'account',
      label: 'Tài khoản',
      items: [
        {
          id: 'accountInfo',
          title: 'Thông tin tài khoản',
          subtitle: 'Chỉnh sửa hồ sơ cá nhân',
          icon: 'person-outline',
          onPress: handlers.navigateToAccountInfo,
        },
        {
          id: 'changePassword',
          title: 'Đổi mật khẩu',
          subtitle: 'Cập nhật mật khẩu của bạn',
          icon: 'key-outline',
          onPress: handlers.handleChangePassword,
        },
        // ← Bỏ mục 'notification' (Cài đặt thông báo)
      ],
    },
    // ← Bỏ section 'work' (Công việc)
  ];
```

**Thay đổi trong `getChangePasswordHandler`:** Đổi case `'employee'` để navigate đến `ChangePassword` thay vì `EmployeePassword`:

```typescript
case 'employee':
  return () => navigation.navigate('ChangePassword', { phone: userPhone });
```

### 5. ChangePasswordScreen.tsx — Màn hình mới

**Vị trí:** `src/screens/Login/ChangePasswordScreen.tsx`

**Tái sử dụng:** `AuthShell` (layout), `TextInputComponent`, `Button` — giống pattern của `EmployeePasswordScreen`.

**State:**
```typescript
const [currentPassword, setCurrentPassword] = useState('');
const [newPassword, setNewPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');
const [errors, setErrors] = useState<{ current?: string; new?: string; confirm?: string }>({});
const [isLoading, setIsLoading] = useState(false);
```

**Validation (client-side, trước khi gọi API):**
- `newPassword.length < 6 || newPassword.length > 50` → lỗi dưới trường mật khẩu mới
- `newPassword === currentPassword` → lỗi "Mật khẩu mới không được trùng mật khẩu hiện tại"
- `confirmPassword !== newPassword` → lỗi dưới trường xác nhận

**API call:** `useChangePasswordMutation` từ `employeeApi`

**Success flow:** `Alert.alert('Thành công', ...)` → `navigation.goBack()`

**Error flow:** Hiển thị lỗi từ API response, giữ nguyên form

### 6. AppNavigator.tsx — Thêm route ChangePassword

```typescript
// Thêm vào AppStackParamList:
ChangePassword: { phone: string };

// Thêm Screen:
import ChangePasswordScreen from "../screens/Login/ChangePasswordScreen";
<Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
```

### 7. employeeApi.ts — Thêm mutation

```typescript
changePassword: builder.mutation<
  { success: boolean; message?: string },
  { current_password: string; new_password: string }
>({
  query: (body) => ({
    url: ENDPOINTS.employeeChangePassword.path,
    method: 'PUT',
    body,
  }),
}),
```

### 8. apiEndpoints.ts — Thêm endpoint

```typescript
employeeChangePassword: {
  method: 'PUT',
  path: '/api/app/employee/change-password',
  description: 'Employee self-service change password (requires Bearer token)',
  body: ['current_password', 'new_password'],
},
```

### 9. Backend — employee.js route + controller + service

**Route** (`src/routes/app/employee.js`):
```javascript
router.put('/change-password', requireEmployeeAuth, employeeController.changePassword.bind(employeeController));
```

**Controller** (`src/domains/employee/employee.controller.js`):
```javascript
async changePassword(req, res) {
  const employeeId = req.auth?.employee_id;
  const { current_password, new_password } = req.body || {};
  // validate → service.changePassword → 200 / 400
}
```

**Service** (`src/domains/employee/employee.service.js`):
- Lấy employee theo `id`
- So sánh `current_password` với hash hiện tại (bcrypt.compare)
- Hash `new_password` mới
- UPDATE vào DB
- Tái sử dụng pattern từ `garageManager.service.js#changePassword`

## Data Models

Không có thay đổi schema DB. Chỉ cập nhật cột `password` (đã tồn tại) trong bảng `employees`.

## Error Handling

| Tình huống | Frontend | Backend |
|---|---|---|
| `current_password` sai | Hiển thị lỗi từ API response | HTTP 400 `{ error: "Mật khẩu hiện tại không đúng" }` |
| `new_password` quá ngắn/dài | Validation inline, không gọi API | — |
| `new_password` trùng `current_password` | Validation inline, không gọi API | — |
| Token hết hạn | RTK Query auto-retry / redirect Login | HTTP 401 |
| Lỗi server | Alert.alert chung | HTTP 500 |

## Testing

Các điểm cần kiểm tra thủ công sau khi implement:

1. **Navbar employee:** Chỉ thấy 2 tab (Trang chủ + Hồ sơ), không thấy Đơn hàng / Thông báo / Dịch vụ.
2. **HomeScreen employee:** Không thấy section "Thông tin bảo hành", không thấy nút Ưu đãi và Bảo hành ở trên cao, vẫn thấy nút Thông báo.
3. **EmployeeOrdersList:** Mở HomeScreen → tab "Đang xử lý" được chọn mặc định. Chuyển sang tab khác → rời màn hình → quay lại → tab reset về "Đang xử lý".
4. **ProfileScreen employee:** Không thấy section "Công việc", không thấy mục "Cài đặt thông báo". Thấy "Đổi mật khẩu" trong section Tài khoản.
5. **ChangePassword:** Bấm "Đổi mật khẩu" → mở màn hình form (không phải trang đăng nhập). Validation inline hoạt động. Đổi thành công → quay về Profile. Sai mật khẩu hiện tại → hiển thị lỗi, giữ form.
6. **Các role khác:** Customer, dealer, manager, garage_admin không bị ảnh hưởng bởi bất kỳ thay đổi nào.
