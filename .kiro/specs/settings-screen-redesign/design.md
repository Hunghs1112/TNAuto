# Design Document: Settings Screen Redesign

## Overview

Redesign màn hình Cài đặt / Hồ sơ (ProfileScreen) của ứng dụng TNAuto theo triết lý tối giản, khoa học, và phân tầng rõ ràng. Thiết kế mới áp dụng flat design với section grouping kiểu iOS Settings, compact hero, và tách biệt hoàn toàn logic/UI theo convention của project.

**Mục tiêu chính:**
- Giao diện tối giản hơn: bỏ shadow nặng, card nổi — thay bằng flat rows với divider nhẹ
- Phân nhóm setting items theo section có label rõ ràng
- Mỗi role có menu config riêng phù hợp với quyền hạn
- Tách logic hoàn toàn vào `useProfileScreen` hook
- Thêm `AboutSection` (version + legal links) và cải thiện `DangerZone`

---

## Architecture

### Component Tree

```
ProfileScreen (ProfileContainer)
│   ├── useProfileScreen (custom hook — toàn bộ logic)
│   └── ProfileView (presentational — chỉ render)
│       ├── Screen (layout wrapper)
│       └── ScrollView
│           ├── HeroSection
│           │   ├── Decorative circles (background)
│           │   ├── Avatar (Pressable → AccountInfo)
│           │   ├── UserName (Text)
│           │   ├── UserPhone (Text)
│           │   └── RoleChip (View + Text)
│           ├── SettingsSection[] (mapped từ sections)
│           │   ├── Section Label (Text — ngoài card)
│           │   └── Section Card (View — borderRadius 16)
│           │       └── SettingRow[] (mapped từ items)
│           │           ├── Icon wrap (View 36×36)
│           │           ├── Title + Subtitle (View)
│           │           ├── Badge (optional)
│           │           └── Chevron (Ionicons)
│           ├── AboutSection
│           │   ├── App name + version (Text)
│           │   └── Legal links row (Pressable × 2)
│           └── DangerZone
│               ├── Logout (Pressable text + icon)
│               └── Delete Account (Pressable text — customer only)
```

### Data Flow

```
Redux Store (auth, garageContext)
    │
    ▼
useProfileScreen (hook)
    │  reads: userName, userPhone, userType, userId, avatarUrl, garageName
    │  builds: sections (RoleMenuConfig via useMemo)
    │  exposes: handleLogout, handleDeleteAccount, isDeleting, appVersion
    │
    ▼
ProfileContainer (ProfileScreen.tsx)
    │  passes all data as typed props
    │
    ▼
ProfileView (ProfileView.tsx)
    │  pure render — no Redux, no navigation logic
    │
    ├── HeroSection (props: userName, userPhone, userType, avatarUrl, roleLabel, onAvatarPress)
    ├── SettingsSection[] (props: section: SettingsSection)
    │       └── SettingRow[] (props: item: SettingItem)
    ├── AboutSection (props: appVersion)
    └── DangerZone (props: onLogout, onDeleteAccount, isDeleting, userType)
```

---

## Components and Interfaces

### ProfileScreenData (hook return type)

```typescript
interface ProfileScreenData {
  // User info
  userName: string;
  userPhone: string;
  userType: AuthUserType;
  avatarUrl: string;
  roleLabel: string;
  // Menu
  sections: RoleMenuConfig;
  // Actions
  handleLogout: () => void;
  handleDeleteAccount: () => void;
  isDeleting: boolean;
  // Navigation
  navigateToAccountInfo: () => void;
  // App info
  appVersion: string;
}
```

### SettingItem & RoleMenuConfig

```typescript
type SettingItem = {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;           // Ionicons name
  onPress: () => void;
  badge?: string;         // optional badge text
};

type SettingsSection = {
  id: string;
  label: string;
  items: SettingItem[];
};

type RoleMenuConfig = SettingsSection[];
```

### HeroSection Props

```typescript
interface HeroSectionProps {
  userName: string;
  userPhone: string;
  userType: AuthUserType;
  avatarUrl: string;
  roleLabel: string;
  onAvatarPress: () => void;
}
```

### SettingsSection Props

```typescript
interface SettingsSectionProps {
  section: SettingsSection;
}
```

### SettingRow Props

```typescript
interface SettingRowProps {
  item: SettingItem;
  isFirst: boolean;
  isLast: boolean;
}
```

### AboutSection Props

```typescript
interface AboutSectionProps {
  appVersion: string;
}
```

### DangerZone Props

```typescript
interface DangerZoneProps {
  onLogout: () => void;
  onDeleteAccount: () => void;
  isDeleting: boolean;
  userType: AuthUserType;
}
```

### ProfileView Props

```typescript
interface ProfileViewProps {
  userName: string;
  userPhone: string;
  userType: AuthUserType;
  avatarUrl: string;
  roleLabel: string;
  sections: RoleMenuConfig;
  handleLogout: () => void;
  handleDeleteAccount: () => void;
  isDeleting: boolean;
  navigateToAccountInfo: () => void;
  appVersion: string;
}
```

---

## Data Models

### Role Label Mapping

```typescript
const ROLE_LABELS: Record<AuthUserType, string> = {
  customer: 'Khách hàng',
  employee: 'Nhân viên',
  dealer: 'Đại lý',
  garage_manager: 'Quản lý Gara',
  garage_admin: 'Super Admin',
};
```

### Role Menu Config (per role)

**customer**
```
sections: [
  {
    id: 'account', label: 'Tài khoản',
    items: [AccountInfo, ChangePassword, Notification]
  },
  {
    id: 'vehicle', label: 'Xe của tôi',
    items: [VehicleList, SelectGarage]
  }
]
```

**employee**
```
sections: [
  {
    id: 'account', label: 'Tài khoản',
    items: [AccountInfo, ChangePassword, Notification]
  },
  {
    id: 'work', label: 'Công việc',
    items: [GarageOrders, SelectGarage]
  }
]
```

**dealer**
```
sections: [
  {
    id: 'account', label: 'Tài khoản',
    items: [AccountInfo, ChangePassword, Notification]
  },
  {
    id: 'business', label: 'Kinh doanh',
    items: [GarageCustomers, SelectGarage]
  }
]
```

**garage_manager**
```
sections: [
  {
    id: 'account', label: 'Tài khoản',
    items: [AccountInfo, ChangePassword, Notification]
  },
  {
    id: 'management', label: 'Quản lý Gara',
    items: [GarageEmployees, GarageOrders, GarageCustomers, AdminSettings]
  },
  {
    id: 'garage', label: 'Gara',
    items: [SelectGarage]
  }
]
```

**garage_admin**
```
sections: [
  {
    id: 'account', label: 'Tài khoản',
    items: [AccountInfo, ChangePassword, Notification]
  },
  {
    id: 'system', label: 'Quản lý Hệ thống',
    items: [SuperAdminGarages, GarageEmployees, GarageOrders, GarageCustomers]
  },
  {
    id: 'config', label: 'Cấu hình',
    items: [AdminCatalog, AdminOperations, AdminSettings]
  }
]
```

### Change Password Routing

```typescript
const getChangePasswordHandler = (
  userType: AuthUserType,
  userPhone: string,
  navigation: NavigationProp,
): () => void => {
  switch (userType) {
    case 'employee':
      return () => navigation.navigate('EmployeePassword', { phone: userPhone, employeeData: undefined });
    case 'dealer':
      return () => navigation.navigate('DealerLogin', { phone: userPhone });
    case 'garage_manager':
    case 'garage_admin':
      return () => navigation.navigate('ManagerPassword', { phone: userPhone, expectedRole: userType });
    case 'customer':
    default:
      return () => Alert.alert('Thông báo', 'Tính năng đang phát triển');
  }
};
```

### Logout Flow (ordered steps)

```typescript
const handleLogout = async () => {
  // 1. Hủy đăng ký FCM token
  await unregisterFCMTokenOnLogout();
  // 2. Xóa auth storage
  await clearAuthStorage();
  // 3. Clear Redux state
  dispatch(clearWarranties());
  dispatch(warrantyApi.util.resetApiState());
  dispatch(vehicleApi.util.resetApiState());
  dispatch(clearCurrentEmployee());
  dispatch(clearGarageContext());
  // 4. Dispatch logout
  dispatch(logout());
};
```

### App Version

```typescript
const appVersion: string =
  require('../../../app.json').expo?.version ||
  require('../../../app.json').version ||
  '1.0.0';
```

---

## Visual Design Spec

### Tổng quan triết lý tối giản

Thiết kế mới loại bỏ hoàn toàn card nổi (shadow + elevation nặng) cho từng setting row. Thay vào đó, các items trong cùng một section được nhóm trong một card nhẹ duy nhất, phân tách bằng divider mỏng. Section label nằm ngoài card, nhỏ và mờ hơn — tương tự iOS Settings app.

### HeroSection — Compact Layout

```
┌─────────────────────────────────────────┐
│  [bg: Colors.primary #112552]           │
│  [decorative circles opacity 0.12]      │
│                                         │
│  ┌──────┐  Nguyễn Văn A                 │
│  │ 72px │  0901 234 567                 │
│  │avatar│  ┌──────────────┐             │
│  └──────┘  │ ✦ Khách hàng │             │
│            └──────────────┘             │
└─────────────────────────────────────────┘
```

- **Container height**: ~180px (giảm từ 292px)
- **Avatar**: 72×72px, borderRadius 20, borderWidth 1 (`Colors.alpha.white20`), padding 3
- **Avatar shell**: background `Colors.alpha.white12`
- **userName**: fontSize 22, fontWeight semibold, color white, letterSpacing -0.3
- **userPhone**: `textStyles.bodySmall`, color `Colors.alpha.white65`
- **roleChip**: background `Colors.alpha.white14`, border `Colors.alpha.white20`, paddingH 10, paddingV 4, borderRadius 999
- **roleChipText**: `textStyles.caption`, fontWeight medium, color white, letterSpacing 0.3
- **heroContent paddingH**: `spacing.xl` (24px), paddingTop: `spacing.lg` (20px)
- **Layout**: row, alignItems center, gap `spacing.md` (12px)
- **Decorative circles**: giữ nguyên 3 circles, opacity 0.12

### Sheet / Content Area

- **marginTop**: -32px (overlap nhẹ lên hero, giảm từ -64px)
- **borderTopLeftRadius / borderTopRightRadius**: 24px (giảm từ 30px)
- **background**: `Colors.background.light`
- **paddingH**: `spacing.xl` (24px)
- **paddingTop**: `spacing.lg` (20px)
- **gap giữa các section**: `spacing.lg` (20px)

### SettingsSection — Section Label + Card

```
  TÀI KHOẢN                    ← section label (ngoài card)
  ┌─────────────────────────┐
  │ 👤  Thông tin tài khoản  › │  ← SettingRow
  │ ─────────────────────── │  ← divider
  │ 🔑  Đổi mật khẩu        › │
  │ ─────────────────────── │
  │ 🔔  Cài đặt thông báo   › │
  └─────────────────────────┘
```

**Section Label:**
- `textStyles.caption`, fontWeight semibold (600)
- color: `Colors.text.tertiary`
- letterSpacing: 0.8 (uppercase feel)
- textTransform: uppercase
- marginBottom: `spacing.sm` (8px)

**Section Card:**
- background: `Colors.surface.elevated` (white)
- borderRadius: 16
- borderWidth: 1, borderColor: `Colors.alpha.primary12`
- overflow: hidden (để divider không tràn)
- Không có shadow/elevation

**Divider giữa các SettingRow:**
- height: 1
- background: `Colors.alpha.primary08`
- marginLeft: 52px (align với text, sau icon wrap)

### SettingRow — Flat Design

```
│ ┌────┐  Title text              › │
│ │icon│  Subtitle text (optional)  │
│ └────┘                            │
```

- **minHeight**: 60dp (accessibility touch target)
- **paddingV**: `spacing.md` (12px)
- **paddingH**: `spacing.base` (16px)
- **layout**: row, alignItems center
- **background**: white (không shadow)
- **pressed state**: background `Colors.primarySoft` (`#eef2f8`)

**Icon wrap:**
- size: 36×36px (giảm từ 46px)
- borderRadius: 10
- background: `Colors.primarySoft`
- border: none (loại bỏ border trên icon wrap)
- marginRight: `spacing.md` (12px)

**Icon:**
- size: 18px (giảm từ 20px)
- color: `Colors.primary`

**Title:**
- `textStyles.body`, fontWeight medium (500)
- color: `Colors.text.primary`

**Subtitle (optional):**
- `textStyles.caption`
- color: `Colors.text.secondary`
- marginTop: 2px

**Badge (optional):**
- background: `Colors.secondary` (`#c37b1e`)
- paddingH: 8, paddingV: 2
- borderRadius: 999
- text: `textStyles.caption`, color white, fontWeight semibold

**Chevron:**
- Ionicons `chevron-forward`, size 16px
- color: `Colors.text.tertiary`
- Không có wrap circle (loại bỏ rowArrowWrap)

### AboutSection — Compact

```
  ─────────────────────────────
  TNAuto  v1.2.0
  Điều khoản sử dụng  ·  Chính sách bảo mật
```

- **paddingTop**: `spacing.lg` (20px)
- **borderTop**: 1px `Colors.alpha.primary08`
- **App name + version**: `textStyles.caption`, color `Colors.text.tertiary`, textAlign center
- **Legal links row**: flexDirection row, gap `spacing.md`, justifyContent center, marginTop `spacing.xs`
- **Link text**: `textStyles.caption`, color `Colors.text.tertiary`, textDecorationLine underline

### DangerZone — Text-based Actions

```
  ─────────────────────────────
  [→ Đăng xuất]                ← text + icon, color primary
  [🗑 Xóa tài khoản]           ← text nhỏ đỏ (customer only)
```

- **paddingTop**: `spacing.lg` (20px)
- **gap**: `spacing.sm` (8px)

**Logout button:**
- layout: row, alignItems center, gap `spacing.sm`
- paddingV: `spacing.md` (12px)
- background: transparent (không phải button nổi)
- Ionicons `log-out-outline`, size 18px, color `Colors.primary`
- Text: `textStyles.body`, fontWeight semibold, color `Colors.primary`
- Pressed: background `Colors.primarySoft`, borderRadius 12

**Delete Account (customer only):**
- Text: `textStyles.bodySmall`, color `Colors.status.error` (bronze `#b48242`)
- Ionicons `trash-outline`, size 16px, color `Colors.status.error`
- layout: row, alignItems center, gap `spacing.xs`
- paddingV: `spacing.sm` (8px)
- Pressed: opacity 0.7

**Loading state (isDeleting):**
- ActivityIndicator size small, color `Colors.status.error`
- Button disabled, opacity 0.5

---

## File Structure

### Files cần tạo mới

```
src/screens/Profile/
  ProfileScreen.tsx          ← ProfileContainer (thay thế file hiện tại)
  useProfileScreen.ts        ← Custom hook (mới)
  ProfileView.tsx            ← Presentational view (mới)
  styles.ts                  ← Styles (cập nhật toàn bộ)
  components/
    HeroSection.tsx          ← Hero với avatar + info
    SettingsSection.tsx      ← Một nhóm setting items (label + card)
    SettingRow.tsx           ← Một dòng setting (flat design)
    AboutSection.tsx         ← App version + legal links
    DangerZone.tsx           ← Logout + delete account
```

### Files cần cập nhật

- `src/screens/Profile/ProfileScreen.tsx` — thay thế toàn bộ bằng ProfileContainer
- `src/screens/Profile/styles.ts` — viết lại theo flat design spec

### Files không thay đổi

- `src/navigation/AppNavigator.tsx` — import ProfileScreen vẫn hoạt động (default export)
- `src/navigation/MainTabs.tsx` — không thay đổi
- Tất cả các screen được navigate đến (AccountInfo, VehicleList, v.v.)

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: HeroSection renders all required elements for any role

*For any* `AuthUserType` value and any user data (name, phone, avatarUrl), rendering `HeroSection` SHALL produce output containing the user's name, phone number, and a role chip with the correct Vietnamese label.

**Validates: Requirements 2.1, 2.3**

### Property 2: Role label mapping is total and correct

*For any* `AuthUserType` value from the set `{customer, employee, dealer, garage_manager, garage_admin}`, the `getRoleLabel` function SHALL return the corresponding Vietnamese label from the defined mapping, and SHALL never return an empty string or undefined.

**Validates: Requirements 2.3**

### Property 3: RoleMenuConfig is complete for every role

*For any* `AuthUserType` value, the `buildRoleMenuConfig` function SHALL return a non-empty array of `SettingsSection`, where every section has a non-empty `label` and at least one `SettingItem`, and the **Tài khoản** section SHALL always be present containing items for AccountInfo, ChangePassword, and Notification.

**Validates: Requirements 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 7.1, 8.1**

### Property 4: ProfileView renders all sections and items

*For any* `RoleMenuConfig` (array of sections with items), rendering `ProfileView` SHALL produce output containing every section label and every item title present in the config — no section or item SHALL be silently dropped.

**Validates: Requirements 3.1**

### Property 5: SettingRow renders required elements for any item

*For any* `SettingItem` with a non-empty title and icon, rendering `SettingRow` SHALL produce output containing the item's title text and the chevron arrow. When `subtitle` is provided and non-empty, the subtitle text SHALL also be present in the output.

**Validates: Requirements 4.1, 4.2**

### Property 6: Delete account button visibility matches customer role

*For any* `AuthUserType`, rendering `DangerZone` SHALL show the "Xóa tài khoản" button if and only if `userType === 'customer'`. For all other roles, the delete button SHALL NOT be present.

**Validates: Requirements 6.1, 6.4**

### Property 7: Change password navigation target matches role

*For any* `AuthUserType`, pressing the "Đổi mật khẩu" item SHALL trigger navigation to the screen defined in the role-to-screen mapping: `employee → EmployeePassword`, `dealer → DealerLogin`, `garage_manager/garage_admin → ManagerPassword`, `customer → Alert`.

**Validates: Requirements 7.2**

---

## Error Handling

### Avatar load failure
- `Image` component với `onError` callback → set `avatarError` state → render initials placeholder (first letter of userName) với background `Colors.primarySoft`
- Fallback: `<View>` với `<Text>` hiển thị initial, không dùng external placeholder URL

### Logout failure (FCM token unregister)
- Wrap `unregisterFCMTokenOnLogout()` trong try/catch
- Log lỗi nhưng tiếp tục logout flow — không block người dùng
- Lý do: FCM token cleanup là best-effort, không critical

### Delete account API error
- Catch error từ `deleteAccount().unwrap()`
- Hiển thị `Alert.alert('Lỗi', error.data?.error || 'Không thể xóa tài khoản.')`
- Reset loading state

### Unknown userType
- `buildRoleMenuConfig` với unknown type → trả về default config chỉ gồm section **Tài khoản** với item AccountInfo
- `getRoleLabel` với unknown type → trả về `'Người dùng'`

### Navigation guard
- `useEffect` trong ProfileContainer lắng nghe `isLoggedIn`
- Khi `isLoggedIn === false` → `navigation.replace('Login')`
- Render `null` trong khi chưa redirect

---

## Testing Strategy

### Unit Tests (example-based)

Tập trung vào các hành vi cụ thể và edge cases:

- `getRoleLabel`: verify từng mapping value (5 examples)
- `buildRoleMenuConfig`: verify exact section structure cho từng role (5 examples)
- `getChangePasswordHandler`: verify navigation target cho từng role (5 examples)
- `handleLogout`: mock tất cả dependencies, verify thứ tự gọi (1 example)
- `handleDeleteAccount` success: mock mutation success, verify logout được gọi
- `handleDeleteAccount` error: mock mutation error, verify Alert với error message
- `ProfileContainer` với `isLoggedIn=false`: verify `navigation.replace('Login')` và render null
- `DangerZone` với `isDeleting=true`: verify ActivityIndicator và disabled state
- `HeroSection` với empty avatarUrl: verify placeholder rendered

### Property-Based Tests

Sử dụng **fast-check** (TypeScript/JavaScript PBT library). Mỗi property test chạy tối thiểu **100 iterations**.

**Setup:**
```bash
npm install --save-dev fast-check
```

**Tag format:** `// Feature: settings-screen-redesign, Property {N}: {property_text}`

**Property 1 — HeroSection renders all required elements:**
```typescript
// Feature: settings-screen-redesign, Property 1: HeroSection renders all required elements for any role
fc.assert(fc.property(
  fc.constantFrom('customer', 'employee', 'dealer', 'garage_manager', 'garage_admin'),
  fc.string({ minLength: 1 }),
  fc.string({ minLength: 10, maxLength: 11 }),
  (userType, userName, userPhone) => {
    const { getByText } = render(<HeroSection ... />);
    expect(getByText(userName)).toBeTruthy();
    expect(getByText(userPhone)).toBeTruthy();
    expect(getByText(ROLE_LABELS[userType])).toBeTruthy();
  }
), { numRuns: 100 });
```

**Property 2 — Role label mapping is total:**
```typescript
// Feature: settings-screen-redesign, Property 2: Role label mapping is total and correct
fc.assert(fc.property(
  fc.constantFrom('customer', 'employee', 'dealer', 'garage_manager', 'garage_admin'),
  (userType) => {
    const label = getRoleLabel(userType);
    expect(label).toBeTruthy();
    expect(label.length).toBeGreaterThan(0);
    expect(label).toBe(ROLE_LABELS[userType]);
  }
), { numRuns: 100 });
```

**Property 3 — RoleMenuConfig is complete:**
```typescript
// Feature: settings-screen-redesign, Property 3: RoleMenuConfig is complete for every role
fc.assert(fc.property(
  fc.constantFrom('customer', 'employee', 'dealer', 'garage_manager', 'garage_admin'),
  (userType) => {
    const config = buildRoleMenuConfig(userType, mockHandlers);
    expect(config.length).toBeGreaterThan(0);
    const accountSection = config.find(s => s.id === 'account');
    expect(accountSection).toBeDefined();
    expect(accountSection!.items.length).toBeGreaterThanOrEqual(3);
    config.forEach(section => {
      expect(section.label.length).toBeGreaterThan(0);
      expect(section.items.length).toBeGreaterThan(0);
    });
  }
), { numRuns: 100 });
```

**Property 4 — ProfileView renders all sections:**
```typescript
// Feature: settings-screen-redesign, Property 4: ProfileView renders all sections and items
fc.assert(fc.property(
  fc.array(
    fc.record({
      id: fc.string({ minLength: 1 }),
      label: fc.string({ minLength: 1 }),
      items: fc.array(fc.record({
        id: fc.string({ minLength: 1 }),
        title: fc.string({ minLength: 1 }),
        icon: fc.constant('person-outline'),
        onPress: fc.constant(() => {}),
      }), { minLength: 1 }),
    }),
    { minLength: 1 }
  ),
  (sections) => {
    const { getByText } = render(<ProfileView sections={sections} ... />);
    sections.forEach(section => {
      expect(getByText(section.label.toUpperCase())).toBeTruthy();
      section.items.forEach(item => {
        expect(getByText(item.title)).toBeTruthy();
      });
    });
  }
), { numRuns: 100 });
```

**Property 5 — SettingRow renders required elements:**
```typescript
// Feature: settings-screen-redesign, Property 5: SettingRow renders required elements for any item
fc.assert(fc.property(
  fc.record({
    id: fc.string({ minLength: 1 }),
    title: fc.string({ minLength: 1 }),
    icon: fc.constant('person-outline'),
    onPress: fc.constant(() => {}),
    subtitle: fc.option(fc.string({ minLength: 1 })),
  }),
  (item) => {
    const { getByText, queryByText } = render(<SettingRow item={item} isFirst isLast />);
    expect(getByText(item.title)).toBeTruthy();
    if (item.subtitle) {
      expect(getByText(item.subtitle)).toBeTruthy();
    }
  }
), { numRuns: 100 });
```

**Property 6 — Delete button visibility:**
```typescript
// Feature: settings-screen-redesign, Property 6: Delete account button visibility matches customer role
fc.assert(fc.property(
  fc.constantFrom('customer', 'employee', 'dealer', 'garage_manager', 'garage_admin'),
  (userType) => {
    const { queryByText } = render(
      <DangerZone userType={userType} onLogout={() => {}} onDeleteAccount={() => {}} isDeleting={false} />
    );
    const deleteButton = queryByText('Xóa tài khoản');
    if (userType === 'customer') {
      expect(deleteButton).toBeTruthy();
    } else {
      expect(deleteButton).toBeNull();
    }
  }
), { numRuns: 100 });
```

**Property 7 — Change password routing:**
```typescript
// Feature: settings-screen-redesign, Property 7: Change password navigation target matches role
fc.assert(fc.property(
  fc.constantFrom('customer', 'employee', 'dealer', 'garage_manager', 'garage_admin'),
  fc.string({ minLength: 10, maxLength: 11 }),
  (userType, userPhone) => {
    const mockNavigate = jest.fn();
    const handler = getChangePasswordHandler(userType, userPhone, { navigate: mockNavigate } as any);
    handler();
    const EXPECTED_SCREENS = {
      employee: 'EmployeePassword',
      dealer: 'DealerLogin',
      garage_manager: 'ManagerPassword',
      garage_admin: 'ManagerPassword',
    };
    if (userType !== 'customer') {
      expect(mockNavigate).toHaveBeenCalledWith(
        EXPECTED_SCREENS[userType as keyof typeof EXPECTED_SCREENS],
        expect.objectContaining({ phone: userPhone })
      );
    }
  }
), { numRuns: 100 });
```

### Integration Tests

- Render `ProfileScreen` với mock Redux store cho từng role → verify correct sections hiển thị
- Simulate logout flow end-to-end với mock store → verify Redux state cleared
- Simulate delete account flow → verify mutation called và logout triggered sau khi thành công
