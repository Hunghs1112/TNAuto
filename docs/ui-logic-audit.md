# Audit trạng thái hiện tại của codebase UI

Tài liệu này ghi lại trạng thái hiện tại của cụm màn hình Home/Garage/Vehicle và một vài thành phần điều hướng chung, tập trung vào việc file nào đang theo đúng mô hình tách `container/hook/view`, file nào còn chứa logic, và file nào đang lệch khỏi pattern chung.

## Tổng quan nhanh

Hiện tại codebase đang đi theo hướng khá rõ:

- `HomeScreen.tsx` đóng vai trò container mỏng.
- `useHomeScreen.ts` gom phần lớn logic nghiệp vụ, query, navigation và state trung gian.
- `HomeScreenView.tsx` chủ yếu render UI và nhận dữ liệu/handler qua props.
- Các màn edit/chọn như `VehicleEditScreen.tsx` và `SelectGarageScreen.tsx` đã bắt đầu tách logic ra hook riêng.
- Một số component con như `UserHeader.tsx`, `GarageSummaryCard.tsx`, `Navbar.tsx` vẫn còn lẫn một phần logic hiển thị hoặc logic điều hướng.

Riêng luồng auth hiện tại đang được chia theo 3 lớp chính:

- `authSlice.ts` giữ trạng thái đăng nhập, loại user, token, thông tin profile cơ bản và `authMode`.
- `AuthNavigator.tsx` chỉ lo stack cho màn login/register theo từng luồng auth.
- Các màn đăng nhập (`LoginScreen.tsx`, `DealerLoginScreen.tsx`) đang tự xử lý login + hydrate store + điều hướng sau login.

Nói ngắn gọn, pattern chính đang là:

**`screen container` -> `custom hook` -> `presentational view` -> `section/components`**

Với auth thì pattern thực tế là:

**`auth screen` -> `API mutation` -> `redux slice hydrate` -> `reset navigation`**

## File nào đang tuân thủ logic code nào

### 1. `src/screens/Home/HomeScreen.tsx`

- Đang đúng vai trò container.
- Không chứa logic nghiệp vụ đáng kể, chỉ lấy dữ liệu từ hook và truyền xuống view.
- Đây là file theo pattern chuẩn nhất hiện tại.

### 2. `src/screens/Home/useHomeScreen.ts`

- Là nơi tập trung logic chính của màn Home.
- Chứa:
  - query API
  - refetch / refresh orchestration
  - mapping dữ liệu từ store / API
  - navigation handlers
  - claim order flow
  - banner logic
  - resolve garage context
- File này đúng với vai trò “controller/hook” của màn hình.
- Tuy nhiên file đang khá dày, nên xem nó là trung tâm logic chính của Home hơn là hook nhỏ gọn.

### 3. `src/screens/Home/HomeScreenView.tsx`

- Là file UI chính.
- Phần lớn chỉ render theo props và theo role `customer`, `dealer`, `employee`, `guest`.
- File này đang theo logic “view thuần” tương đối tốt, dù vẫn có nhiều nhánh điều kiện.
- Đây là file giữ phần lớn layout và quyết định hiển thị theo trạng thái người dùng.

### 4. `src/screens/Home/components/*`

Các file dạng section/component con nhìn chung đang đi theo hướng tách UI nhỏ ra từ `HomeScreenView`:

- `OrdersList.tsx`
- `AvailableOrdersList.tsx`
- `EmployeeOrdersList.tsx`
- `WarrantyInfo.tsx`
- `DocumentExpiryCards.tsx`
- `ViewMoreButton.tsx`
- `orderHelpers.ts`

Các file này đang làm đúng một việc riêng biệt: render danh sách, format dữ liệu hoặc chuẩn hoá helper cho danh sách.

### 5. `src/screens/Vehicle/VehicleEditScreen.tsx`

- File view của màn edit khá lớn, nhưng phần logic đã được đẩy ra hook `useVehicleEditScreen.ts`.
- Bản thân screen chủ yếu render form, section và footer nút lưu.
- Đây là ví dụ tốt của pattern container/hook/view ở một màn chỉnh sửa dữ liệu.

### 6. `src/screens/Login/LoginScreen.tsx`

- Màn login customer hiện đang tự làm khá nhiều việc trong một file.
- Nó gọi API login, hydrate `authSlice`, hydrate `garageContext`, đăng ký FCM token và quyết định chuyển sang `Home` hay `SelectGarage`.
- Với scale lớn hơn, đây là điểm dễ bị phình logic nhất trong auth flow.
- File này đang hoạt động đúng, nhưng chưa phải dạng “auth screen thuần UI”.

### 7. `src/screens/Login/DealerLoginScreen.tsx`

- Màn login dealer cũng đang ôm cả login mutation, set auth state, set garage context, register FCM và reset navigation.
- So với customer login, file này còn thêm ràng buộc theo `garageCode` và context gara hiện tại.
- Đây là file auth có nhiều trách nhiệm nghiệp vụ nhất trong nhóm login hiện tại.

### 8. `src/redux/slices/authSlice.ts`

- Đây là nơi giữ trạng thái auth nền tảng của app.
- State hiện tại bao gồm: `isLoggedIn`, `userType`, `userId`, `userName`, `userPhone`, `userLicensePlate`, `avatarUrl`, `userEmail`, `token`, `expiresAt`, `authMode`.
- Slice hiện chưa tách theo session/identity/role, nên khi scale thêm quyền hoặc nhiều nguồn đăng nhập, state này có thể bắt đầu phình.

### 9. `src/redux/slices/garageContextSlice.ts`

- Luồng gara hiện là một phần quan trọng của auth domain, không chỉ là dữ liệu phụ.
- Slice này giữ `garageCode`, `activeGarageCode`, `resolved`, `savedGarages` và nhiều helper để set/activate/remove garage.
- Vì app của bạn phụ thuộc khá nhiều vào gara hiện tại, đây gần như là một phần của “auth + tenant context”.
- Khi scale, nên coi nó là context định danh tenant chứ không chỉ là UI state.

### 10. `src/utils/authStorage.ts`

- File này đang thao tác trực tiếp với `persist:root` trong AsyncStorage.
- Nó có hàm clear, check tồn tại và đọc raw persisted data.
- Cách này tiện cho debug, nhưng khi scale auth nên cẩn thận vì đang gắn chặt vào implementation của redux-persist root key.

### 11. `src/services/authApi.ts`

- Đây là API layer cho resolve gara, list gara public, add gara cho customer, dealer login và dealer register.
- File này đóng vai trò hạ tầng auth/tenant khá rõ.
- Hiện tại auth login không đi qua một abstraction chung duy nhất; customer và dealer login đang tách ra theo endpoint khác nhau.
- Điều này ổn ở giai đoạn hiện tại, nhưng sẽ cần chuẩn hoá nếu thêm role mới hoặc thêm cách đăng nhập mới.

### 12. `src/navigation/AppNavigator.tsx` và `src/navigation/MainTabs.tsx`

- `AppNavigator` đang chứa cả stack auth-independent, detail screens và màn `SelectGarage`.
- `MainTabs` đang bọc `Navbar` và render các tab theo cấu trúc app sau login.
- Hai file này không xử lý auth logic trực tiếp, nhưng là nơi auth state ảnh hưởng mạnh đến routing thực tế.
- Khi scale, đây là nơi cần chú ý để tránh navigation condition chồng chéo.

### 13. `src/screens/Garage/SelectGarageScreen.tsx`

- Màn UI chính của luồng chọn gara.
- Phần render danh sách gara, preview và form nhập mã gara đang nằm ở view.
- Logic đã được đẩy sang hook riêng.

### 14. `src/screens/Garage/useSelectGarageScreen.ts`

- Là hook điều khiển toàn bộ luồng chọn gara.
- Chứa:
  - đọc state tài khoản/gara
  - resolve gara theo mã
  - xác nhận gara
  - activate gara từ danh sách đã lưu
  - xác định text nút confirm
- Đây là file đúng với vai trò controller của màn chọn gara.

### 15. `src/screens/Home/components/OrdersList.tsx`

- Là component tách tốt, nhưng vẫn có một phần logic phụ trợ rõ ràng.
- Có helper `renderOrderItem` nội bộ.
- Có logic build `secondaryName` theo `userType`.
- Có logic map service name/image thông qua `orderHelpers`.

Kết luận:

- Đây không phải file lệch pattern, mà là file “UI list + mapping nhẹ”.
- Việc tách `orderHelpers.ts` là dấu hiệu tốt, vì phần format data đã được đẩy ra ngoài component.

### 16. `src/screens/Home/components/orderHelpers.ts`

File này là một điểm đúng của codebase hiện tại.

- Tách riêng logic `getServiceName` và `getServiceImageUrl` khỏi component render.
- Làm giảm độ dày của các list component.
- Đây là file helper rõ ràng, không lẫn UI.

## File nào đang khác các file còn lại

### 1. `src/screens/Home/UserHeader.tsx`

Đây là file khác biệt rõ nhất so với phần còn lại của cụm Home.

Điểm lệch pattern:

- File vừa là UI, vừa chứa helper logic nhỏ `getBadgeState`.
- Có nhánh render login vs logged-in trực tiếp trong component.
- Có nhiều style inline/object dày đặc trong cùng file.
- Có prop `onGaragePress` được khai báo nhưng hiện chưa dùng trong UI.
- Có comment đường dẫn cũ `// src/components/UserHeader/UserHeader.tsx`, cho thấy file đã được di chuyển hoặc copy sang vị trí mới nhưng chưa dọn sạch hoàn toàn.
- Badge logic đang được xử lý ngay trong component thay vì tách ra helper hoặc prop đã chuẩn hoá từ hook/container.

Kết luận:

- File này vẫn hoạt động như component presentational,
- nhưng không “thuần UI” bằng `HomeScreenView` vì còn mang logic hiển thị badge và nhánh trạng thái.

### 2. `src/screens/Home/GarageSummaryCard.tsx`

File này cũng lệch nhẹ so với pattern chung.

Điểm lệch:

- Tự gọi `useAppSelector` bên trong component để đọc `savedGarageCount`.
- Nghĩa là component UI này đang phụ thuộc trực tiếp vào Redux store, không chỉ nhận dữ liệu qua props.
- `useMemo(() => savedGarageCount, [savedGarageCount])` là thừa, không tạo thêm giá trị thực tế.
- Đây là component “semi-container”, không phải component thuần presentational.

Kết luận:

- So với các file khác trong Home, nó đang giữ logic dữ liệu nhiều hơn mức mong muốn.
- Nếu muốn đồng nhất, nên chuyển count này ra hook hoặc props.

### 3. `src/screens/Home/DocumentExpiryCards.tsx`

File này khá đặc biệt vì nó nằm giữa UI và logic phụ trợ.

Điểm cần lưu ý:

- Đây là một component render theo dữ liệu xe, nhưng có khả năng chứa khá nhiều logic tính toán ngày hết hạn, trạng thái cảnh báo và thứ tự hiển thị.
- So với các component con đơn giản như `ViewMoreButton`, file này có xu hướng “UI có nghiệp vụ nhẹ”.

Kết luận:

- Không lệch pattern nặng như `GarageSummaryCard`, nhưng cũng không hoàn toàn là UI tĩnh.
- Nếu phần tính toán ngày tháng còn dày, file này nên được tách helper riêng.

### 4. `src/components/Navbar.tsx`

Đây là file điều hướng chung nhưng đang chứa nhiều logic hơn mức UI component thông thường.

Điểm lệch pattern:

- Có hook animation nội bộ `usePressActiveAnimation`.
- Có logic auth gating trực tiếp trong component (`requireAuth`).
- Có logic đổi tập tab theo `userType` ngay trong UI component.
- Có `useMemo` để dựng danh sách tab theo vai trò người dùng.
- Có comment giải thích riêng cho từng nhánh dealer/non-dealer, cho thấy component đang chứa cả UI lẫn rule sản phẩm.
- Có một số cast `as any` / `as never` trong phần animated icon, cho thấy type của navigation/icon vẫn chưa thật sự sạch.

Kết luận:

- `Navbar.tsx` là shared UI component nhưng không còn là component trình bày thuần túy.
- Nó đang giữ cả policy điều hướng và policy phân quyền tab, nên lệch hơn so với các component giao diện đơn giản.
- Nếu auth scale thêm role mới hoặc permission-based tab, đây là một trong những file cần refactor đầu tiên.

### 5. `src/screens/Home/HomeScreenView.tsx`

File này theo hướng đúng, nhưng vẫn có vài điểm lệch nhẹ so với một view hoàn toàn thuần:

- `userType`, `isLoggedIn` và nhiều nhánh render theo role vẫn nằm trực tiếp trong view.
- Có xử lý default data (`homePreviewServices = []`, `homePreviewProducts = []`).
- Có logic condition khá lớn cho `customer`, `dealer`, `guest`.
- Có import một số component chỉ dùng trong từng nhánh, làm view khá nặng.

Kết luận:

- Đây là view chính nhưng vẫn còn “logic trình bày” tương đối nhiều.
- Nếu muốn sạch hơn nữa, nên tách theo role thành các sub-view riêng.

### 6. `src/screens/Garage/SelectGarageScreen.tsx`

- View này đã được tách hook nhưng vẫn có nhiều logic UI inline trong `map`.
- Phần render từng gara đang chứa khá nhiều nhánh hiển thị màu sắc, avatar, badge active, và chuẩn hoá dữ liệu ngay trong JSX.
- Điều này không sai, nhưng nếu tiếp tục lớn lên thì file sẽ dễ quay lại trạng thái “view dày logic”.

### 7. `src/screens/Vehicle/VehicleEditScreen.tsx`

- Screen này đã tách logic ra hook khá tốt, nhưng bản thân view vẫn rất dài vì form có nhiều section.
- Hiện tại phần dày chủ yếu là layout form, không phải nghiệp vụ.
- Nếu muốn tối ưu tiếp, có thể tách các section form ra component con theo từng nhóm dữ liệu.

## Mức độ đồng nhất của codebase hiện tại

### Đồng nhất tốt

- Mô hình container/hook/view đã hình thành khá rõ ở Home, VehicleEdit và SelectGarage.
- Các action handler đã được đẩy về hook.
- Các section UI đã được chia nhỏ ra nhiều component con.
- Helper format dữ liệu đã bắt đầu được tách ra ngoài component render.
- Auth state cơ bản đã được chuẩn hoá vào `authSlice`, giúp các màn khác chỉ cần đọc state thay vì tự giữ session.

### Chưa đồng nhất hoàn toàn

- Một số component nhỏ vẫn tự đọc store hoặc chứa helper logic riêng.
- Dữ liệu và UI chưa được tách hoàn toàn ở mọi file.
- Một vài file còn prop type `any`, làm giảm độ rõ ràng của giao tiếp giữa hook và view.
- `Navbar.tsx` vẫn chứa khá nhiều rule điều hướng và phân quyền ngay trong component.
- Auth flow customer/dealer vẫn chia đôi ở màn login riêng, nên khi scale thêm role sẽ phải sửa nhiều điểm.
- Có vài dấu hiệu “dọn dang dở” như import không dùng, comment cũ, hoặc prop còn truyền nhưng chưa dùng.

## Kết luận ngắn

Nếu nhìn theo kiến trúc hiện tại, codebase đang đi theo pattern:

- **logic chính** nằm ở các hook như `useHomeScreen.ts`, `useVehicleEditScreen.ts`, `useSelectGarageScreen.ts`
- **render chính** nằm ở các screen view như `HomeScreenView.tsx`, `VehicleEditScreen.tsx`, `SelectGarageScreen.tsx`
- **component nhỏ** dùng để chia UI ra theo section
- **helper nhẹ** đã bắt đầu được tách ra ở `orderHelpers.ts`

Với auth, pattern thực tế hiện tại là:

- `LoginScreen.tsx` xử lý login customer + hydrate store + điều hướng
- `DealerLoginScreen.tsx` xử lý login dealer + hydrate store + set garage context + điều hướng
- `authSlice.ts` giữ state session/identity
- `garageContextSlice.ts` giữ tenant context gara
- `authStorage.ts` chỉ hỗ trợ debug/clear persisted root, chưa phải abstraction session chuẩn hoá

Những file khác biệt nhất so với pattern chung là:

1. `src/components/Navbar.tsx` — shared component nhưng chứa cả logic phân quyền và điều hướng.
2. `src/screens/Home/UserHeader.tsx` — vẫn chứa helper logic và nhánh trạng thái UI khá rõ.
3. `src/screens/Home/GarageSummaryCard.tsx` — component UI nhưng đọc Redux trực tiếp.
4. `src/screens/Home/DocumentExpiryCards.tsx` — component UI nhưng có khả năng chứa thêm logic nghiệp vụ theo ngày tháng.
5. `src/screens/Home/HomeScreenView.tsx` — vẫn là view chuẩn, nhưng còn khá nhiều nhánh render nên chưa hoàn toàn “thuần UI”.
6. `src/screens/Login/LoginScreen.tsx` và `src/screens/Login/DealerLoginScreen.tsx` — auth screen đang ôm luôn hydrate state, register FCM và route selection.

## Gợi ý hướng cải thiện tiếp theo

1. Tách badge logic ra helper dùng chung nếu còn file nào cần badge trạng thái.
2. Đưa `savedGarageCount` ra hook hoặc props thay vì để `GarageSummaryCard` tự đọc store.
3. Chia `HomeScreenView` thành các sub-view theo role nếu muốn giảm độ phình.
4. Xóa prop/import không dùng và comment đường dẫn cũ trong `UserHeader`.
5. Giảm `any` ở props của view để contract giữa hook và view rõ ràng hơn.
6. Xem lại `DocumentExpiryCards` để tách phần tính toán hạn dùng nếu file này đang ôm cả format ngày lẫn render.
7. Tách policy điều hướng/phân quyền tab ra khỏi `Navbar` nếu muốn shared component này thuần UI hơn.
8. Chuẩn hoá auth flow vào một lớp use-case/hook chung nếu sắp mở rộng thêm role hoặc nguồn đăng nhập mới.

## Chiến lược scale auth nên áp dụng ngay

Nếu mục tiêu là mở rộng auth an toàn trong vài sprint tới, nên đi theo hướng sau:

### 1. Tách “auth orchestration” khỏi screen

Hiện `LoginScreen`, `DealerLoginScreen` và các màn register đang vừa render UI vừa xử lý toàn bộ luồng nghiệp vụ. Khi scale thêm role, nên tách sang một hook/use-case như:

- `useCustomerLogin`
- `useDealerLogin`
- `useDealerRegister`
- `useRegisterCustomer`

Hoặc gọn hơn là một lớp service/hook chung cho auth flow.

### 2. Chuẩn hoá một auth result contract chung

Hiện customer login và dealer login trả shape khác nhau khá nhiều. Khi thêm role mới, nên quy về một contract chung kiểu:

- `user`
- `role`
- `session`
- `primaryContext` hoặc `tenantContext`
- `nextRoute`

Điều này giúp screen chỉ cần render UI và gọi một use-case, thay vì biết quá nhiều về response từng endpoint.

### 3. Tách session/auth identity khỏi tenant context

`authSlice` đang giữ identity, còn `garageContextSlice` đang giữ tenant context. Đây là hướng đúng, nhưng khi scale nên giữ ranh giới rõ:

- `authSlice`: ai đang đăng nhập, role nào, token gì
- `garageContextSlice`: đang dùng gara nào, danh sách gara nào, gara nào active

Đừng để màn UI tự quyết định quá nhiều dựa trên cả hai slice cùng lúc.

### 4. Đưa side effects sau login ra một nơi riêng

Sau login hiện có:

- hydrate redux
- set garage context
- register FCM token
- reset navigation

Đây là chuỗi side effects khá dài. Khi scale, nên gom vào một auth flow service để tránh mỗi screen tự viết lại logic này.

### 5. Xác định rõ vòng đời persisted auth

`authStorage.ts` đang thao tác trực tiếp với `persist:root`. Nếu auth bắt đầu có refresh token, token expiry, logout nhiều kiểu, hoặc multi-session, cần một abstraction rõ hơn thay vì dựa vào raw root persistence.

### 6. Xây rule routing theo role ở tầng điều hướng

Hiện routing sau login dựa nhiều vào `reset` trong screen. Nếu có thêm role mới, nên đưa rule route sang tầng điều hướng hoặc auth gate trung tâm, thay vì để từng screen quyết định.

### 7. Tách validation ra khỏi screen

Register screen hiện đang có nhiều validate logic. Khi mở rộng, nên đẩy validation sang `utils`/`schema`/`form rules` riêng để:

- reuse được giữa mobile/web nếu có
- giảm độ dài screen
- dễ test case lỗi

### 8. Tránh để shared UI component ôm auth policy

`Navbar` hiện đã có auth gating và role-based tab logic. Nếu auth scale, nên cân nhắc biến nó thành component thuần nhận config từ bên ngoài, thay vì tự tính policy ngay bên trong.
