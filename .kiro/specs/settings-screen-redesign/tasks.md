# Implementation Plan: Settings Screen Redesign

## Overview

Tái cấu trúc `ProfileScreen` theo kiến trúc Container → Hook → View → Components, áp dụng flat design với section grouping kiểu iOS Settings. Mỗi task xây dựng tăng dần từ types/interfaces → hook logic → từng UI component → wiring hoàn chỉnh.

## Tasks

- [x] 1. Tạo types và interfaces cho toàn bộ feature
  - Tạo file `src/screens/Profile/types.ts`
  - Định nghĩa `SettingItem`, `SettingsSection`, `RoleMenuConfig`
  - Định nghĩa `HeroSectionProps`, `SettingsSectionProps`, `SettingRowProps`
  - Định nghĩa `AboutSectionProps`, `DangerZoneProps`, `ProfileViewProps`
  - Định nghĩa `ProfileScreenData` (return type của hook)
  - _Requirements: 1.1, 1.4, 2.1, 3.1, 4.1, 5.1, 6.1_

- [x] 2. Tạo `useProfileScreen` hook
  - [x] 2.1 Tạo file `src/screens/Profile/useProfileScreen.ts` với skeleton hook
    - Import Redux selectors: `userName`, `userPhone`, `userType`, `userId`, `avatarUrl`, `garageName`
    - Import `useNavigation`, `useAppDispatch`, `useDeleteAccountMutation`
    - Khai báo `appVersion` từ `app.json`
    - _Requirements: 1.2, 9.1, 9.3_

  - [x] 2.2 Implement `getRoleLabel` và `buildRoleMenuConfig`
    - Implement `getRoleLabel(userType): string` với `ROLE_LABELS` mapping đầy đủ 5 roles
    - Implement `buildRoleMenuConfig(userType, handlers): RoleMenuConfig` với `useMemo`
    - Mỗi role trả về đúng sections và items theo spec (customer/employee/dealer/garage_manager/garage_admin)
    - Fallback cho unknown userType: chỉ section **Tài khoản** với AccountInfo
    - _Requirements: 2.3, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

  - [x] 2.3 Implement `getChangePasswordHandler`
    - Implement `getChangePasswordHandler(userType, userPhone, navigation): () => void`
    - Routing: `employee → EmployeePassword`, `dealer → DealerLogin`, `garage_manager/garage_admin → ManagerPassword`, `customer → Alert`
    - _Requirements: 7.1, 7.2_

  - [x] 2.4 Implement `handleLogout` và `handleDeleteAccount`
    - `handleLogout`: Alert xác nhận → unregisterFCMTokenOnLogout (try/catch) → clearAuthStorage → clear Redux state (warranties, vehicleApi, employeeSlice, garageContext) → dispatch logout
    - `handleDeleteAccount`: Alert xác nhận → gọi `deleteAccount({ phone, confirm: true })` → success: gọi logout; error: Alert với `error.data?.error`
    - Export `isDeleting` từ mutation state
    - _Requirements: 6.2, 6.3, 6.5, 6.6, 6.7, 6.8_

  - [x] 2.5 Implement navigation guard trong hook
    - `useEffect` lắng nghe `isLoggedIn` → `navigation.replace('Login')` khi false
    - Return `null` guard cho ProfileContainer
    - _Requirements: 9.1, 9.2, 9.3_

  - [ ]* 2.6 Viết property test cho `getRoleLabel` (Property 2)
    - **Property 2: Role label mapping is total and correct**
    - **Validates: Requirements 2.3**
    - Dùng `fc.constantFrom` cho 5 AuthUserType values, assert label truthy và khớp `ROLE_LABELS`

  - [ ]* 2.7 Viết property test cho `buildRoleMenuConfig` (Property 3)
    - **Property 3: RoleMenuConfig is complete for every role**
    - **Validates: Requirements 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 7.1, 8.1**
    - Assert: config non-empty, section `account` luôn tồn tại với ≥3 items, mọi section có label và items

  - [ ]* 2.8 Viết property test cho `getChangePasswordHandler` (Property 7)
    - **Property 7: Change password navigation target matches role**
    - **Validates: Requirements 7.2**
    - Mock navigation, assert đúng screen được navigate cho từng role

- [x] 3. Tạo `HeroSection` component
  - Tạo file `src/screens/Profile/components/HeroSection.tsx`
  - Render: decorative circles (opacity 0.12), avatar shell 72×72 (Pressable → `onAvatarPress`), userName, userPhone, roleChip
  - Avatar fallback: `onError` → render initials placeholder (first letter of userName)
  - Áp dụng đúng visual spec: compact height ~180px, spacing từ Design System
  - Wrap với `React.memo`
  - _Requirements: 2.1, 2.2, 2.4, 2.5, 10.1, 10.2, 10.3, 10.4, 10.6_

  - [ ]* 3.1 Viết property test cho `HeroSection` (Property 1)
    - **Property 1: HeroSection renders all required elements for any role**
    - **Validates: Requirements 2.1, 2.3**
    - Dùng `fc.constantFrom` cho userType, `fc.string` cho userName/userPhone, assert getByText cho tên, phone, role label

- [x] 4. Tạo `SettingRow` component (flat design)
  - Tạo file `src/screens/Profile/components/SettingRow.tsx`
  - Props: `item: SettingItem`, `isFirst: boolean`, `isLast: boolean`
  - Render: icon wrap 36×36 (borderRadius 10, background `Colors.primarySoft`), title, subtitle (optional), badge (optional), chevron `chevron-forward` size 16
  - Divider: height 1, `Colors.alpha.primary08`, marginLeft 52, hiển thị khi `!isLast`
  - Pressed state: background `Colors.primarySoft`
  - `minHeight` 60dp, dùng `Pressable` với `android_ripple`
  - Wrap với `React.memo`
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 10.1, 10.2, 10.4_

  - [ ]* 4.1 Viết property test cho `SettingRow` (Property 5)
    - **Property 5: SettingRow renders required elements for any item**
    - **Validates: Requirements 4.1, 4.2**
    - Dùng `fc.record` cho SettingItem với optional subtitle, assert title luôn có, subtitle có khi được cung cấp

- [x] 5. Tạo `SettingsSection` component (label + card + rows)
  - Tạo file `src/screens/Profile/components/SettingsSection.tsx`
  - Props: `section: SettingsSection`
  - Render: section label (uppercase, `Colors.text.tertiary`, letterSpacing 0.8) ngoài card; section card (borderRadius 16, border `Colors.alpha.primary12`, overflow hidden, không shadow); map `SettingRow` với `isFirst`/`isLast` props
  - Wrap với `React.memo`
  - _Requirements: 3.1, 10.1, 10.2, 10.3_

- [x] 6. Tạo `DangerZone` component
  - Tạo file `src/screens/Profile/components/DangerZone.tsx`
  - Props: `onLogout`, `onDeleteAccount`, `isDeleting`, `userType`
  - Logout button: text-based (transparent background), icon `log-out-outline` size 18, pressed → background `Colors.primarySoft` borderRadius 12
  - Delete Account: chỉ render khi `userType === 'customer'`, text nhỏ màu `Colors.status.error`, icon `trash-outline` size 16
  - Loading state: `ActivityIndicator` size small, disabled + opacity 0.5 khi `isDeleting`
  - Wrap với `React.memo`
  - _Requirements: 6.1, 6.4, 6.7, 10.1, 10.2, 10.4_

  - [ ]* 6.1 Viết property test cho `DangerZone` (Property 6)
    - **Property 6: Delete account button visibility matches customer role**
    - **Validates: Requirements 6.1, 6.4**
    - Dùng `fc.constantFrom` cho 5 roles, assert "Xóa tài khoản" có khi customer, null khi role khác

- [x] 7. Tạo `AboutSection` component
  - Tạo file `src/screens/Profile/components/AboutSection.tsx`
  - Props: `appVersion: string`
  - Render: borderTop 1px `Colors.alpha.primary08`, text "TNAuto v{appVersion}" (textAlign center, `Colors.text.tertiary`), legal links row ("Điều khoản sử dụng" · "Chính sách bảo mật") dùng `Linking.openURL`
  - Typography: `textStyles.caption`, color `Colors.text.tertiary`
  - Wrap với `React.memo`
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 10.1, 10.2, 10.3_

- [x] 8. Tạo `ProfileView` (presentational component)
  - Tạo file `src/screens/Profile/ProfileView.tsx`
  - Props: `ProfileViewProps` (đầy đủ theo interface đã định nghĩa ở task 1)
  - Render: `Screen` wrapper (hideHeader, statusBarStyle="light-content") → `ScrollView` (showsVerticalScrollIndicator=false, paddingBottom đủ) → `HeroSection` → map `SettingsSection[]` → `AboutSection` → `DangerZone`
  - Không chứa `useSelector`, `useDispatch`, hay navigation logic
  - Wrap với `React.memo`
  - _Requirements: 1.3, 1.4, 3.1, 10.5, 11.1, 11.3_

  - [ ]* 8.1 Viết property test cho `ProfileView` (Property 4)
    - **Property 4: ProfileView renders all sections and items**
    - **Validates: Requirements 3.1**
    - Dùng `fc.array(fc.record(...))` cho sections với items, assert mọi section label và item title đều được render

- [x] 9. Cập nhật `ProfileScreen.tsx` thành `ProfileContainer`
  - Thay thế toàn bộ nội dung `src/screens/Profile/ProfileScreen.tsx`
  - Import và gọi `useProfileScreen()` để lấy toàn bộ data
  - Render `null` khi `!isLoggedIn` (guard)
  - Truyền tất cả props xuống `ProfileView` theo `ProfileViewProps`
  - Export default `React.memo(ProfileContainer)` — giữ tên export là `ProfileScreen` để không phá vỡ import trong `AppNavigator.tsx`
  - _Requirements: 1.1, 1.4, 9.1, 9.2, 11.4_

- [x] 10. Cập nhật `styles.ts`
  - Viết lại `src/screens/Profile/styles.ts` theo flat design spec
  - HeroSection styles: compact height ~180px, avatar 72×72, borderRadius 20, heroContent paddingH `spacing.xl`
  - Sheet styles: marginTop -32px, borderTopRadius 24px, paddingH `spacing.xl`
  - SettingRow styles: flat (không shadow/elevation), minHeight 60, icon wrap 36×36 borderRadius 10
  - DangerZone styles: text-based buttons (transparent background), pressed state borderRadius 12
  - AboutSection styles: borderTop, textAlign center
  - Xóa toàn bộ styles cũ không còn dùng (rowArrowWrap, actionButton, deleteButton, logoutButton, v.v.)
  - Tất cả giá trị màu từ `Colors`, spacing từ `spacing`, typography từ `textStyles`
  - _Requirements: 10.1, 10.2, 10.3, 11.1_

- [x] 11. Checkpoint — Kiểm tra tích hợp cuối
  - Đảm bảo `AppNavigator.tsx` import `ProfileScreen` vẫn hoạt động (default export không đổi)
  - Đảm bảo tất cả components được import đúng trong `ProfileView`
  - Đảm bảo `useProfileScreen` export đúng `ProfileScreenData` interface
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks đánh dấu `*` là optional — có thể bỏ qua để MVP nhanh hơn
- Cần cài `fast-check` trước khi chạy property tests: `npm install --save-dev fast-check`
- `AppNavigator.tsx` và `MainTabs.tsx` **không cần thay đổi** — default export của `ProfileScreen.tsx` được giữ nguyên
- Property tests dùng tag format: `// Feature: settings-screen-redesign, Property {N}: {property_text}`
- Mỗi property test chạy tối thiểu 100 iterations (`numRuns: 100`)
