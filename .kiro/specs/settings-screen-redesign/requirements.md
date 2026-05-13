# Requirements Document

## Introduction

Redesign toàn bộ màn hình Cài đặt / Hồ sơ (ProfileScreen) trong ứng dụng React Native TNAuto.
Mục tiêu là cung cấp cho mỗi role (customer, employee, dealer, garage_manager, garage_admin) một bộ menu items phù hợp với quyền hạn và nhu cầu thực tế, đồng thời nâng cao chất lượng giao diện thông qua phân nhóm rõ ràng, thêm section "Về ứng dụng", và tuân thủ convention tách logic/UI của project (container → custom hook → presentational view → section/components).

---

## Glossary

- **ProfileScreen**: Màn hình Cài đặt / Hồ sơ người dùng, truy cập từ tab Profile trong MainTabs.
- **ProfileContainer**: Component container điều phối logic và truyền props xuống view.
- **useProfileScreen**: Custom hook chứa toàn bộ state, handlers, navigation logic của ProfileScreen.
- **ProfileView**: Presentational component thuần — chỉ render UI, nhận props từ container.
- **HeroSection**: Phần đầu màn hình hiển thị avatar, tên, số điện thoại, role chip.
- **SettingsSection**: Một nhóm setting items có tiêu đề nhóm (label) và danh sách các SettingItem.
- **SettingItem**: Một dòng trong danh sách cài đặt gồm icon, tiêu đề, subtitle (tuỳ chọn), và mũi tên điều hướng.
- **AboutSection**: Section cuối màn hình hiển thị phiên bản ứng dụng và thông tin pháp lý.
- **DangerZone**: Nhóm hành động nguy hiểm (Xóa tài khoản, Đăng xuất) ở cuối màn hình.
- **AuthUserType**: Kiểu dữ liệu định nghĩa role người dùng: `customer` | `employee` | `dealer` | `garage_manager` | `garage_admin`.
- **RoleMenuConfig**: Cấu hình danh sách SettingsSection được tạo ra dựa trên AuthUserType.
- **AppVersion**: Chuỗi phiên bản ứng dụng lấy từ `app.json` hoặc `react-native-device-info`.
- **Design_System**: Tập hợp các hằng số thiết kế gồm `Colors`, `Typography`, `spacing` từ `constants/` và `design-system/`.

---

## Requirements

### Requirement 1: Tái cấu trúc theo convention tách logic/UI

**User Story:** As a developer, I want the ProfileScreen to follow the project's container/hook/view convention, so that the codebase is maintainable and logic is separated from UI.

#### Acceptance Criteria

1. THE ProfileScreen SHALL được tổ chức theo cấu trúc: `ProfileContainer` → `useProfileScreen` → `ProfileView` → các section/component con.
2. THE `useProfileScreen` hook SHALL chứa toàn bộ logic bao gồm: đọc Redux state, xây dựng RoleMenuConfig, xử lý logout, xử lý delete account, và navigation handlers.
3. THE `ProfileView` SHALL là một presentational component thuần — chỉ nhận props và render UI, không chứa `useSelector`, `useDispatch`, hay navigation logic trực tiếp.
4. WHEN ProfileScreen được render, THE ProfileContainer SHALL truyền toàn bộ dữ liệu cần thiết xuống ProfileView thông qua props được định nghĩa rõ ràng bằng TypeScript interface.
5. THE `styles.ts` SHALL được tách thành các file style riêng theo từng section nếu số lượng style vượt quá 60 entries, hoặc giữ nguyên một file nếu dưới ngưỡng đó.

---

### Requirement 2: Hero Section — Hiển thị thông tin người dùng

**User Story:** As a user of any role, I want to see my profile information clearly at the top of the settings screen, so that I can quickly identify my account and role.

#### Acceptance Criteria

1. THE HeroSection SHALL hiển thị avatar, tên người dùng, số điện thoại, và role chip cho tất cả AuthUserType.
2. WHEN avatar URL không hợp lệ hoặc rỗng, THE HeroSection SHALL hiển thị avatar placeholder mặc định (initials hoặc icon người dùng).
3. THE role chip SHALL hiển thị nhãn tiếng Việt tương ứng với AuthUserType theo bảng sau:
   - `customer` → "Khách hàng"
   - `employee` → "Nhân viên"
   - `dealer` → "Đại lý"
   - `garage_manager` → "Quản lý Gara"
   - `garage_admin` → "Super Admin"
4. WHEN người dùng nhấn vào avatar, THE HeroSection SHALL điều hướng đến màn hình `AccountInfo` để chỉnh sửa thông tin.
5. THE HeroSection SHALL sử dụng màu sắc, typography, và spacing từ Design_System (không hardcode giá trị).

---

### Requirement 3: Phân nhóm Setting Items theo Section

**User Story:** As a user, I want settings to be organized into clearly labeled groups, so that I can quickly find what I'm looking for without scanning a flat list.

#### Acceptance Criteria

1. THE ProfileView SHALL hiển thị danh sách SettingsSection, mỗi section có tiêu đề nhóm (label) và danh sách SettingItem bên trong.
2. THE `useProfileScreen` hook SHALL xây dựng RoleMenuConfig dựa trên AuthUserType hiện tại, trả về mảng SettingsSection phù hợp.
3. WHEN AuthUserType là `customer`, THE `useProfileScreen` SHALL trả về RoleMenuConfig gồm các section:
   - **Tài khoản**: Thông tin tài khoản (`AccountInfo`), Đổi mật khẩu, Cài đặt thông báo (`Notification`)
   - **Xe của tôi**: Thông tin xe (`VehicleList`), Gara hiện tại (`SelectGarage`)
4. WHEN AuthUserType là `employee`, THE `useProfileScreen` SHALL trả về RoleMenuConfig gồm các section:
   - **Tài khoản**: Thông tin tài khoản (`AccountInfo`), Đổi mật khẩu, Cài đặt thông báo (`Notification`)
   - **Công việc**: Quản lý đơn hàng (`GarageOrders`), Gara hiện tại (`SelectGarage`)
5. WHEN AuthUserType là `dealer`, THE `useProfileScreen` SHALL trả về RoleMenuConfig gồm các section:
   - **Tài khoản**: Thông tin tài khoản (`AccountInfo`), Đổi mật khẩu, Cài đặt thông báo (`Notification`)
   - **Kinh doanh**: Danh sách khách hàng (`Customers`), Gara hiện tại (`SelectGarage`)
6. WHEN AuthUserType là `garage_manager`, THE `useProfileScreen` SHALL trả về RoleMenuConfig gồm các section:
   - **Tài khoản**: Thông tin tài khoản (`AccountInfo`), Đổi mật khẩu, Cài đặt thông báo (`Notification`)
   - **Quản lý Gara**: Quản lý nhân viên (`GarageEmployees`), Quản lý đơn hàng (`GarageOrders`), Quản lý khách hàng (`GarageCustomers`), Cài đặt hệ thống (`AdminSettings`)
   - **Gara**: Gara hiện tại (`SelectGarage`)
7. WHEN AuthUserType là `garage_admin`, THE `useProfileScreen` SHALL trả về RoleMenuConfig gồm các section:
   - **Tài khoản**: Thông tin tài khoản (`AccountInfo`), Đổi mật khẩu, Cài đặt thông báo (`Notification`)
   - **Quản lý Hệ thống**: Quản lý tất cả Gara (`SuperAdminGarages`), Quản lý nhân viên (`GarageEmployees`), Quản lý đơn hàng (`GarageOrders`), Quản lý khách hàng (`GarageCustomers`)
   - **Cấu hình**: Danh mục dịch vụ & sản phẩm (`AdminCatalog`), Vận hành (`AdminOperations`), Cài đặt hệ thống (`AdminSettings`)
8. IF AuthUserType không khớp với bất kỳ giá trị nào đã định nghĩa, THEN THE `useProfileScreen` SHALL trả về RoleMenuConfig mặc định chỉ gồm section **Tài khoản** với item Thông tin tài khoản.

---

### Requirement 4: SettingItem — Hiển thị và tương tác

**User Story:** As a user, I want each setting item to be visually clear and responsive to touch, so that I can navigate confidently.

#### Acceptance Criteria

1. THE SettingItem SHALL hiển thị icon (Ionicons), tiêu đề, và mũi tên điều hướng.
2. WHERE subtitle được cung cấp trong RoleMenuConfig, THE SettingItem SHALL hiển thị subtitle bên dưới tiêu đề với màu `Colors.text.secondary`.
3. WHEN người dùng nhấn vào SettingItem, THE SettingItem SHALL thực thi handler `onPress` tương ứng được truyền từ `useProfileScreen`.
4. WHEN SettingItem đang được nhấn (pressed state), THE SettingItem SHALL thay đổi background sang `Colors.primarySoft` để phản hồi thị giác.
5. THE SettingItem SHALL sử dụng `Pressable` với `android_ripple` để đảm bảo trải nghiệm nhất quán trên cả iOS và Android.
6. THE SettingItem SHALL có `minHeight` đủ lớn (tối thiểu 60dp) để đáp ứng tiêu chuẩn touch target accessibility.

---

### Requirement 5: About Section — Thông tin ứng dụng

**User Story:** As a user, I want to see the app version and legal information at the bottom of the settings screen, so that I can reference it for support or compliance purposes.

#### Acceptance Criteria

1. THE AboutSection SHALL hiển thị phiên bản ứng dụng (app version) ở cuối màn hình cho tất cả AuthUserType.
2. THE AboutSection SHALL hiển thị tên ứng dụng "TNAuto" cùng với số phiên bản.
3. THE AboutSection SHALL hiển thị các liên kết tĩnh: "Điều khoản sử dụng" và "Chính sách bảo mật".
4. WHEN người dùng nhấn vào "Điều khoản sử dụng" hoặc "Chính sách bảo mật", THE AboutSection SHALL mở URL tương ứng bằng `Linking.openURL`.
5. THE AboutSection SHALL sử dụng màu `Colors.text.tertiary` và typography nhỏ hơn body để không cạnh tranh thị giác với các section chính.

---

### Requirement 6: Danger Zone — Đăng xuất và Xóa tài khoản

**User Story:** As a user, I want clear and safe access to logout and account deletion, so that I can manage my account lifecycle without accidental actions.

#### Acceptance Criteria

1. THE DangerZone SHALL hiển thị nút "Đăng xuất" cho tất cả AuthUserType.
2. WHEN người dùng nhấn "Đăng xuất", THE DangerZone SHALL hiển thị Alert xác nhận trước khi thực hiện logout.
3. WHEN người dùng xác nhận đăng xuất, THE `useProfileScreen` SHALL thực hiện tuần tự: hủy đăng ký FCM token, xóa auth storage, clear Redux state (warranties, vehicleApi, employeeSlice, garageContext), và dispatch `logout()`.
4. THE DangerZone SHALL hiển thị nút "Xóa tài khoản" chỉ khi AuthUserType là `customer`.
5. WHEN người dùng nhấn "Xóa tài khoản", THE DangerZone SHALL hiển thị Alert xác nhận với nội dung cảnh báo rõ ràng về tính không thể hoàn tác.
6. WHEN người dùng xác nhận xóa tài khoản, THE `useProfileScreen` SHALL gọi `deleteAccount` mutation với `{ phone, confirm: true }` và xử lý cả trường hợp thành công lẫn thất bại.
7. WHILE thao tác xóa tài khoản đang xử lý (`isDeleting === true`), THE DangerZone SHALL hiển thị `ActivityIndicator` và vô hiệu hóa nút "Xóa tài khoản".
8. IF API xóa tài khoản trả về lỗi, THEN THE DangerZone SHALL hiển thị Alert với thông báo lỗi từ `error.data?.error` hoặc thông báo mặc định "Không thể xóa tài khoản."

---

### Requirement 7: Đổi mật khẩu

**User Story:** As a user of any role, I want to change my password from the settings screen, so that I can maintain account security.

#### Acceptance Criteria

1. THE SettingItem "Đổi mật khẩu" SHALL xuất hiện trong section **Tài khoản** cho tất cả AuthUserType.
2. WHEN người dùng nhấn "Đổi mật khẩu", THE ProfileScreen SHALL điều hướng đến màn hình đổi mật khẩu phù hợp với role:
   - `employee` → `EmployeePassword`
   - `dealer` → `DealerLogin` (flow đổi mật khẩu)
   - `garage_manager` / `garage_admin` → `ManagerPassword`
   - `customer` → màn hình đổi mật khẩu customer (nếu chưa có thì placeholder navigation)
3. THE SettingItem "Đổi mật khẩu" SHALL sử dụng icon `key-outline` từ Ionicons.

---

### Requirement 8: Cài đặt thông báo

**User Story:** As a user of any role, I want to manage notification preferences from the settings screen, so that I can control which alerts I receive.

#### Acceptance Criteria

1. THE SettingItem "Cài đặt thông báo" SHALL xuất hiện trong section **Tài khoản** cho tất cả AuthUserType.
2. WHEN người dùng nhấn "Cài đặt thông báo", THE ProfileScreen SHALL điều hướng đến màn hình `Notification`.
3. THE SettingItem "Cài đặt thông báo" SHALL sử dụng icon `notifications-outline` từ Ionicons.

---

### Requirement 9: Trạng thái xác thực và bảo vệ màn hình

**User Story:** As the system, I want to ensure only authenticated users can access the settings screen, so that account data is protected.

#### Acceptance Criteria

1. WHEN `isLoggedIn` trong Redux auth state là `false`, THE ProfileContainer SHALL điều hướng người dùng đến màn hình `Login` bằng `navigation.replace`.
2. WHILE `isLoggedIn` là `false`, THE ProfileContainer SHALL render `null` thay vì hiển thị nội dung màn hình.
3. THE ProfileContainer SHALL sử dụng `useEffect` để lắng nghe thay đổi của `isLoggedIn` và phản ứng kịp thời.

---

### Requirement 10: Tuân thủ Design System

**User Story:** As a designer/developer, I want the redesigned settings screen to consistently use the project's design system, so that the UI is visually coherent with the rest of the app.

#### Acceptance Criteria

1. THE ProfileScreen SHALL sử dụng `Colors` từ `src/constants/colors.ts` cho tất cả giá trị màu sắc — không hardcode hex hay rgba trực tiếp trong StyleSheet.
2. THE ProfileScreen SHALL sử dụng `spacing` từ `src/design-system/spacing.ts` cho tất cả giá trị padding, margin, và gap.
3. THE ProfileScreen SHALL sử dụng `Typography` và `textStyles` từ `src/constants/typo.ts` và `src/design-system/typography.ts` cho tất cả text styles.
4. THE ProfileScreen SHALL sử dụng `Ionicons` từ `@react-native-vector-icons/ionicons` cho tất cả icons — không dùng thư viện icon khác.
5. THE ProfileScreen SHALL sử dụng component `Screen` từ `src/components/layout` làm wrapper ngoài cùng với prop `hideHeader` và `statusBarStyle="light-content"`.
6. THE HeroSection SHALL duy trì thiết kế gradient/decorative circles hiện tại với màu `Colors.primary` làm nền, đảm bảo tính nhất quán với phiên bản hiện tại.

---

### Requirement 11: Hiệu năng và tối ưu render

**User Story:** As a user, I want the settings screen to load and scroll smoothly, so that the experience feels responsive.

#### Acceptance Criteria

1. THE ProfileScreen SHALL sử dụng `React.memo` cho `ProfileView` và các section component con để tránh re-render không cần thiết.
2. THE `useProfileScreen` hook SHALL sử dụng `useMemo` để memoize RoleMenuConfig — chỉ tính toán lại khi `userType` hoặc các dependency liên quan thay đổi.
3. THE ProfileScreen SHALL sử dụng `ScrollView` với `showsVerticalScrollIndicator={false}` và `contentContainerStyle` có `paddingBottom` đủ để nội dung không bị che bởi bottom navigation bar.
4. THE ProfileContainer SHALL export component được wrap bởi `React.memo`.

