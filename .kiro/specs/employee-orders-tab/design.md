# Design Document — employee-orders-tab

## Overview

Tính năng bổ sung tab "Đơn việc" vào navbar của nhân viên (`role === "employee"`), chuyển từ bố cục 2 tab sang 3 tab:
**Đơn việc** (trái) — **Trang chủ** (center, nút gradient) — **Hồ sơ** (phải).

Tab mới điều hướng đến `EmployeeOrdersScreen` — màn hình đã tồn tại, hiện đang được đăng ký như một stack screen trong `AppNavigator`. Sau thay đổi, màn hình này được đăng ký thêm như một `Tab.Screen` trong `MainTabs`, giúp navbar luôn hiển thị khi nhân viên xem danh sách đơn hàng của mình.

Phạm vi thay đổi gói gọn trong 3 file:
1. `src/components/navbarPolicy.ts`
2. `src/navigation/MainTabs.tsx`
3. `src/screens/EmployeeOrders/EmployeeOrdersScreen.tsx`

---

## Architecture

### Luồng dữ liệu hiện tại (trước thay đổi)

```
Redux auth.userType
      │
      ▼
useNavbarPolicy (hook)
      │  buildNavbarTabs(userType)
      ▼
NavbarPolicy → employee: [HomeTab(center), Profile]
      │
      ▼
Navbar (splitNavbarTabs)
  leftTabs: []   centerTab: HomeTab   rightTabs: [Profile]
```

### Luồng dữ liệu sau thay đổi

```
Redux auth.userType
      │
      ▼
useNavbarPolicy (hook)
      │  buildNavbarTabs(userType)
      ▼
NavbarPolicy → employee: [EmployeeOrders, HomeTab(center), Profile]
      │
      ▼
Navbar (splitNavbarTabs)
  leftTabs: [EmployeeOrders]   centerTab: HomeTab   rightTabs: [Profile]
```

### Cơ chế phát hiện context (tab vs stack)

`EmployeeOrdersScreen` cần biết mình đang chạy trong tab navigator hay stack navigator để quyết định `showBackButton`. Cách tiếp cận được chọn: **kiểm tra `navigation.getState().type`** thông qua `useNavigationState`.

```
EmployeeOrdersScreen
      │
      ├─ useNavigationState(state => state.type)
      │       │
      │       ├─ "tab"   → showBackButton = false
      │       └─ "stack" → showBackButton = true  (canGoBack vẫn guard thêm ở Header)
      │
      └─ <Screen showBackButton={isInStack} ...>
```

Cách này không cần thêm prop, không cần context provider, và hoạt động đúng trong cả hai trường hợp mà không phá vỡ đăng ký stack hiện tại trong `AppNavigator`.

---

## Components and Interfaces

### 1. `navbarPolicy.ts` — `buildNavbarTabs`

**Thay đổi:** Cập nhật `case isEmployee` từ 2 tab thành 3 tab.

```typescript
// Trước
if (isEmployee) {
  return [
    { key: "home",     label: "Trang chủ", icon: "home",             routeName: "HomeTab", isCenter: true },
    { key: "settings", label: "Hồ sơ",     icon: "settings-outline", routeName: "Profile", requiresAuth: true },
  ];
}

// Sau
if (isEmployee) {
  return [
    { key: "orders",   label: "Đơn việc",  icon: "receipt-outline",  routeName: "EmployeeOrders", requiresAuth: true },
    { key: "home",     label: "Trang chủ", icon: "home",             routeName: "HomeTab",        isCenter: true },
    { key: "settings", label: "Hồ sơ",     icon: "settings-outline", routeName: "Profile",        requiresAuth: true },
  ];
}
```

`splitNavbarTabs` không cần thay đổi — logic `slice(0, 2)` / `slice(2, 4)` tự động đặt `EmployeeOrders` vào `leftTabs` và `Profile` vào `rightTabs`.

### 2. `MainTabs.tsx` — `TabParamList` + `Tab.Navigator`

**Thay đổi:** Thêm entry vào type và thêm `Tab.Screen`.

```typescript
// TabParamList — thêm entry
export type TabParamList = {
  // ... existing entries ...
  EmployeeOrders: undefined;   // ← mới
};

// Tab.Navigator — thêm screen
<Tab.Screen name="EmployeeOrders" component={EmployeeOrdersScreen} />
```

Import `EmployeeOrdersScreen` từ `../screens/EmployeeOrders/EmployeeOrdersScreen`.

**Lưu ý:** `EmployeeOrders` vẫn còn trong `AppStackParamList` và `AppNavigator` — không xóa. Điều này cho phép các màn hình khác (nếu cần) vẫn navigate đến `EmployeeOrders` qua stack. Trong thực tế, nhân viên sẽ luôn đến màn hình này qua tab, nhưng giữ lại stack registration không gây hại.

### 3. `EmployeeOrdersScreen.tsx` — `showBackButton` động

**Thay đổi:** Thay `showBackButton` hardcoded thành giá trị phụ thuộc navigation state type.

```typescript
import { useNavigationState } from '@react-navigation/native';

export default function EmployeeOrdersScreen() {
  // ...existing state/hooks...

  // Phát hiện context: tab navigator không cần nút back
  const navType = useNavigationState((state) => state?.type);
  const isInStack = navType !== 'tab';

  // ...

  return (
    <Screen
      headerTitle="Đơn hàng của tôi"
      showBackButton={isInStack}   // ← thay vì showBackButton hardcoded
      // ...
    >
```

`useNavigationState` là hook có sẵn trong `@react-navigation/native` — không cần cài thêm dependency.

---

## Data Models

Không có thay đổi về data model. Tính năng này thuần túy là UI/navigation.

Các type liên quan (không thay đổi):

```typescript
// navbarPolicy.ts
type NavbarTabItem = {
  key: string;
  label: string;
  icon: string;
  routeName: string;
  isCenter?: boolean;
  requiresAuth?: boolean;
  superAdminOnly?: boolean;
};

// MainTabs.tsx
type TabParamList = {
  // ... existing + EmployeeOrders: undefined
};
```

---

## Interfaces

### `buildNavbarTabs(userType)` — contract sau thay đổi

| `userType`      | Số tab | leftTabs              | centerTab | rightTabs  |
|-----------------|--------|-----------------------|-----------|------------|
| `"employee"`    | 3      | `[EmployeeOrders]`    | `HomeTab` | `[Profile]`|
| `"customer"`    | 5      | `[Booking, Category]` | `HomeTab` | `[ServiceCategory, Profile]` |
| manager         | 5      | `[Customers, Garage]` | `HomeTab` | `[GarageOrders, Profile]` |
| super admin     | 5      | `[Customers, Garage]` | `HomeTab` | `[GarageOrders, SuperAdminGarages]` |
| dealer          | 5      | `[Offer, Product]`    | `HomeTab` | `[Category, Profile]` |
| `null`/guest    | 5      | `[Booking, Category]` | `HomeTab` | `[ServiceCategory, Profile]` |

### `splitNavbarTabs(tabs)` — không thay đổi

```typescript
function splitNavbarTabs(tabs: NavbarTabItem[]) {
  const leftTabs  = tabs.filter(t => !t.isCenter).slice(0, 2);
  const rightTabs = tabs.filter(t => !t.isCenter).slice(2, 4);
  const centerTab = tabs.find(t => t.isCenter);
  return { leftTabs, rightTabs, centerTab };
}
```

Với employee tab list `[EmployeeOrders, HomeTab(center), Profile]`:
- `filter(!isCenter)` → `[EmployeeOrders, Profile]`
- `leftTabs = slice(0,2)` → `[EmployeeOrders, Profile]`... 

**Quan trọng:** Với chỉ 2 non-center tabs, `leftTabs` sẽ là `[EmployeeOrders, Profile]` và `rightTabs` sẽ là `[]` nếu dùng logic hiện tại. Điều này sai với yêu cầu (Profile phải ở rightTabs).

**Giải pháp:** `splitNavbarTabs` cần được cập nhật để xử lý trường hợp 1 tab mỗi bên, hoặc `buildNavbarTabs` trả về tab list theo thứ tự `[EmployeeOrders, HomeTab(center), Profile]` và `splitNavbarTabs` được sửa để lấy đúng 1 tab trái và 1 tab phải khi chỉ có 2 non-center tabs.

**Phương án được chọn:** Sửa `splitNavbarTabs` để tách đều: nếu có N non-center tabs, `leftTabs = first ceil(N/2)`, `rightTabs = remaining`. Hoặc đơn giản hơn: giữ nguyên logic `slice(0,2)` / `slice(2,4)` nhưng đảm bảo employee tab list có đúng thứ tự `[EmployeeOrders, HomeTab(center), Profile]` — khi đó `filter(!isCenter)` = `[EmployeeOrders, Profile]`, `leftTabs = [EmployeeOrders]` (slice 0,1 nếu sửa), `rightTabs = [Profile]`.

**Quyết định cuối:** Sửa `splitNavbarTabs` để dùng `Math.ceil` split:

```typescript
export function splitNavbarTabs(tabs: NavbarTabItem[]) {
  const nonCenter = tabs.filter((t) => !t.isCenter);
  const mid = Math.ceil(nonCenter.length / 2);
  const leftTabs  = nonCenter.slice(0, mid);
  const rightTabs = nonCenter.slice(mid);
  const centerTab = tabs.find((t) => t.isCenter);
  return { leftTabs, rightTabs, centerTab };
}
```

Với 4 non-center tabs (manager/customer): `mid=2` → `leftTabs=[0,1]`, `rightTabs=[2,3]` — **không thay đổi** so với hiện tại.  
Với 2 non-center tabs (employee): `mid=1` → `leftTabs=[EmployeeOrders]`, `rightTabs=[Profile]` — **đúng yêu cầu**.

---

## Error Handling

| Tình huống | Xử lý |
|---|---|
| `employeeId` rỗng khi render tab | `EmployeeOrdersScreen` đã có guard hiển thị empty state với icon `person-outline` |
| API lỗi khi fetch assigned orders | `ErrorView` component với nút retry — đã có sẵn |
| `useNavigationState` trả về `undefined` (edge case) | `navType !== 'tab'` → `isInStack = true` → `showBackButton = true` — safe fallback |
| Employee navigate đến `EmployeeOrders` qua stack (deep link, notification) | `isInStack = true` → `showBackButton = true` — hành vi đúng |

---

## Testing Strategy

### Unit / Example tests

- `buildNavbarTabs("employee")` trả về đúng 3 tab với đúng field values (Requirement 1.1, 1.2)
- `splitNavbarTabs` với employee tab list đặt `EmployeeOrders` vào `leftTabs`, `Profile` vào `rightTabs` (Requirement 1.4)
- `EmployeeOrdersScreen` render `showBackButton={false}` khi trong tab context (Requirement 3.1)
- `EmployeeOrdersScreen` render `showBackButton={true}` khi trong stack context (Requirement 3.2)

### Property-based tests

- Property 1: `buildNavbarTabs("employee")` luôn trả về 3 tab đúng thứ tự
- Property 2: `splitNavbarTabs` luôn đặt đúng tab vào đúng bên với employee list
- Property 3: Các role khác không bị ảnh hưởng bởi thay đổi
- Property 4: `showBackButton` luôn phản ánh đúng navigation context

### Smoke tests

- `TabParamList` compile thành công với entry `EmployeeOrders: undefined`
- `Tab.Screen name="EmployeeOrders"` tồn tại trong `MainTabs`
- Tất cả `Tab.Screen` hiện có vẫn còn sau khi thêm `EmployeeOrders`

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Employee navbar có đúng 3 tab theo thứ tự chuẩn

*For any* call to `buildNavbarTabs` với `userType === "employee"`, kết quả SHALL có đúng 3 phần tử, phần tử đầu tiên có `routeName === "EmployeeOrders"`, phần tử thứ hai có `routeName === "HomeTab"` và `isCenter === true`, phần tử thứ ba có `routeName === "Profile"`.

**Validates: Requirements 1.1, 1.3**

### Property 2: splitNavbarTabs đặt đúng tab vào đúng bên

*For any* tab list trả về bởi `buildNavbarTabs("employee")`, khi xử lý qua `splitNavbarTabs`, `leftTabs` SHALL chứa tab có `routeName === "EmployeeOrders"` và `rightTabs` SHALL chứa tab có `routeName === "Profile"`.

**Validates: Requirements 1.4**

### Property 3: Các role khác không bị ảnh hưởng

*For any* `userType` khác `"employee"` (bao gồm `"customer"`, `"garage_manager"`, `"garage_admin"`, `"dealer"`, `null`), kết quả của `buildNavbarTabs(userType)` SHALL không chứa tab có `routeName === "EmployeeOrders"` và SHALL giữ nguyên số lượng tab như trước thay đổi.

**Validates: Requirements 4.1**

### Property 4: showBackButton phản ánh đúng navigation context

*For any* rendering context của `EmployeeOrdersScreen`, nếu màn hình được render bên trong một tab navigator thì `showBackButton` SHALL là `false`; nếu được render bên trong một stack navigator thì `showBackButton` SHALL là `true`.

**Validates: Requirements 3.1, 3.2**
