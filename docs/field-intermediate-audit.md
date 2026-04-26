# Audit các luồng đang dùng field trung gian thay vì truyền 1 field gốc

Tài liệu này ghi lại những luồng trong codebase đang **không truyền một field duy nhất từ trên xuống dưới**, mà thay vào đó tạo ra field trung gian, normalize data, hoặc split dữ liệu ra nhiều props trước khi render UI.

Mục tiêu của audit này là giúp nhận diện:

- nơi nào đang làm **data shaping**
- nơi nào đang làm **view-model mapping**
- nơi nào đang để **component UI ôm logic trung gian**
- chỗ nào nên gom lại thành một object/config duy nhất để contract rõ hơn

---

## Khái niệm dùng trong tài liệu

### Field gốc
Là field/data ban đầu lấy từ store, API, route params, hoặc hook.

Ví dụ:
- `garageContext`
- `currentGarageCode`
- `customerVehicle`
- `unreadCount`

### Field trung gian
Là field được suy ra từ field gốc, thường qua các bước:
- normalize
- merge nhiều nguồn
- chọn fallback
- split thành nhiều props nhỏ hơn
- chuyển object thành view model

Ví dụ:
- `currentGarageAvatarUrl`
- `shouldShowPromoHome`
- `savedGarageCount`
- `banner`

### Truyền cùng 1 field
Là khi container/hook/view giữ nguyên một object hoặc một contract thống nhất, thay vì biến nó thành nhiều biến trung gian rồi truyền rải rác.

---

## Tổng quan nhanh

Các luồng dùng field trung gian nhiều nhất hiện nằm ở:

1. `src/screens/Home/useHomeScreen.ts`
2. `src/screens/Home/HomeScreen.tsx`
3. `src/screens/Home/UserHeader.tsx`
4. `src/screens/Home/GarageSummaryCard.tsx`
5. `src/screens/Home/DocumentExpiryCards.tsx`
6. `src/components/Navbar.tsx`
7. `src/screens/Login/LoginScreen.tsx`
8. `src/screens/Login/DealerLoginScreen.tsx`
9. `src/screens/Garage/SelectGarageScreen.tsx`
10. `src/screens/Garage/useSelectGarageScreen.ts`
11. `src/screens/Vehicle/VehicleEditScreen.tsx`
12. `src/screens/Vehicle/useVehicleEditScreen.ts`

> Lưu ý: `HomeScreenView.tsx` đã bị gộp vào `HomeScreen.tsx`, nên hiện tại Home chỉ còn 1 file screen chính.

---

## 1. `src/screens/Home/useHomeScreen.ts`

Đây vẫn là file có nhiều field trung gian nhất trong nhóm Home.

### Các field gốc đang được đọc

- `userType`
- `userName`
- `userPhone`
- `userId`
- `currentEmployee`
- `garageContext`
- `currentGarageCode`
- `currentGarageName`
- `services`
- `isLoggedIn`
- `customerVehiclesQuery.data`
- `offersData`
- `warrantyItems`
- `resolvedGarageByCode`

### Các field trung gian được tạo ra

#### Nhóm garage
- `currentGarageAvatarUrl`
- `savedGarageCount`
- `hasGarageContext`
- `shouldResolveGarageName`

#### Nhóm UI state
- `shouldShowPromoHome`
- `bannerDismissedThisSession`
- `claimingOrderId`
- `actualRefreshing`
- `navbarHeight`

#### Nhóm preview content
- `homePreviewProducts`
- `homePreviewServices`

#### Nhóm notification/summary
- `banner`
- `bannerNextRoute`
- `bannerNextParams`

### Luồng dữ liệu trung gian đáng chú ý

#### A. Garage name / avatar resolution

`garageContext` + `currentGarageCode` + `resolvedGarageByCode` được dùng để tạo ra avatar/name hiển thị cho header. 

Điều này có nghĩa UI không lấy garage data trực tiếp từ một nguồn duy nhất, mà đi qua nhiều lớp fallback.

#### B. Banner logic

`customerVehicle` được dùng để tạo banner cảnh báo thiếu thông tin xe:

- `license_expiry_date`
- `inspection_expiry_date`
- `insurance_expiry_date`

Sau đó tạo `banner` object hoàn chỉnh với:

- `variant`
- `title`
- `subtitle`
- `nextRoute`
- `nextParams`

#### C. Preview data

API data thô từ products/services được cắt còn 4 phần tử để render Home:

- `homePreviewProducts`
- `homePreviewServices`

### Nhận xét

Đây là file chuẩn kiểu **controller/hook**, nên việc có field trung gian là hợp lý. Tuy nhiên file này đang làm khá nhiều việc cùng lúc:

- resolve garage context
- normalize header data
- build banner
- build preview data
- điều phối query refresh
- điều phối navigation

Nếu muốn giảm field trung gian, có thể tách riêng:

- `useHomeGarageContext`
- `useHomeBanner`
- `useHomePreviewData`

---

## 2. `src/screens/Home/HomeScreen.tsx`

File này hiện là container + UI chính của màn Home sau khi đã gộp `HomeScreenView`.

### Field trung gian đang map ở đây

Từ hook sang UI có các field được đổi tên hoặc tính lại:

- `currentGarageName` → `garageName`
- `currentGarageAvatarUrl` → `garageAvatarUrl`
- `hasGarageContext` + `userType` → `canChangeGarage`
- `customerVehicle` → `DocumentExpiryCards` prop `vehicle`
- `shouldShowPromoHome` → điều khiển layout bottom sheet

### Nhận xét

Luồng này không sai, nhưng nó cho thấy contract giữa hook và UI vẫn bị “bẻ nhỏ” tương đối nhiều.

Nếu muốn rõ hơn, có thể truyền một object như:

- `garageSummary`
- `headerState`
- `homeContent`
- `ordersState`

thay vì truyền từng field rời.

---

## 3. `src/screens/Home/UserHeader.tsx`

Đây là file đã được dọn khá nhiều.

### Trạng thái hiện tại

- Không còn badge count
- Không còn badge state trung gian
- Chỉ còn render 3 icon:
  - offer
  - insurance
  - notifications

### Field gốc được truyền vào

- `userName`
- `isLoggedIn`
- `onNotificationPress`
- `onOfferPress`
- `onInsurancePress`
- `onLoginPress`

### Field trung gian hiện tại

Hầu như không còn field trung gian đặc thù nào trong component này ngoài việc chọn nhánh `isLoggedIn`.

### Nhận xét

So với trước, `UserHeader` đã chuyển từ dạng “UI + badge logic” sang gần với component thuần UI hơn.

---

## 4. `src/screens/Home/GarageSummaryCard.tsx`

Đây là file đã được dọn bớt logic và chỉ còn hiển thị thông tin gara cơ bản.

### Field gốc

- `garageName`
- `garageAvatarUrl`
- `canChangeGarage`
- `onPress`

### Field trung gian

Hiện tại gần như không còn field trung gian riêng.

### Trạng thái hiện tại

- Không còn tự đọc Redux store
- Không còn `savedGarageCount`
- Không còn phần stats hiển thị số gara đang dùng

### Nhận xét

File này đã trở thành component presentational rõ hơn. Đây là một bước clean tốt vì giảm coupling với state global.

---

## 5. `src/screens/Home/DocumentExpiryCards.tsx`

File này nằm giữa UI và nghiệp vụ tính hạn.

### Field gốc thường gặp

- `vehicle`
- các expiry date fields trong vehicle

### Field trung gian thường có xu hướng xuất hiện

- ngày đã định dạng
- trạng thái sắp hết hạn
- cảnh báo đỏ/vàng/xanh
- thứ tự hiển thị từng card

### Nhận xét

Nếu file này đang dày, nên tách:

- helper tính hạn
- helper map trạng thái
- view render card

---

## 6. `src/components/Navbar.tsx`

Navbar là shared component nhưng vẫn giữ nhiều policy logic.

### Field gốc/nguồn dữ liệu thường dùng

- `userType`
- `isLoggedIn`
- navigation state
- tab config

### Field trung gian/policy logic

- danh sách tab theo role
- auth gating cho tab
- logic `requireAuth`
- active state cho animation

### Nhận xét

Đây là ví dụ rõ của “UI component nhưng vẫn ôm policy”.

Nếu muốn contract gọn hơn, Navbar nên nhận một cấu hình kiểu:

- `tabs`
- `activeTab`
- `onTabPress`
- `requiresAuth`

thay vì tự suy ra gần như toàn bộ rule bên trong component.

---

## 7. `src/screens/Login/LoginScreen.tsx`

Màn login customer đang làm nhiều bước sau khi login.

### Field/logic trung gian thường xuất hiện

- response login
- auth state hydrate
- garage context hydrate
- FCM register token
- navigation reset

### Nhận xét

Đây là luồng `API response -> auth/tenant/session state -> routing`.

Nó không truyền 1 field đơn lẻ, mà biến login result thành nhiều state trung gian để app hoạt động.

Nếu scale thêm role, nên gom thành một auth flow service/use-case chung để tránh screen ôm quá nhiều logic.

---

## 8. `src/screens/Login/DealerLoginScreen.tsx`

Dealer login còn nhiều bước hơn customer login.

### Field trung gian/logic phụ

- `garageCode`
- dealer login result
- auth slice update
- garage context update
- FCM register token
- reset navigation

### Nhận xét

Đây là một trong các luồng rõ nhất của kiểu:

`form input` → `API mutation` → `state hydrate` → `context set` → `navigation`

Nghĩa là một field đầu vào không đi thẳng đến UI, mà được trải qua nhiều lớp trung gian để quyết định trạng thái app.

---

## 9. `src/screens/Garage/SelectGarageScreen.tsx`

### Field gốc

- list gara
- mã gara người dùng nhập
- garage context hiện tại

### Field trung gian

- gara đã resolve
- gara active
- state preview/confirm text
- trạng thái loading/disabled của nút xác nhận

### Nhận xét

Màn này đã có hook riêng nên logic không quá lẫn, nhưng vẫn đang tạo nhiều trạng thái trung gian để phục vụ UI.

Điểm này hợp lý, chỉ cần lưu ý nếu số nhánh còn tăng.

---

## 10. `src/screens/Garage/useSelectGarageScreen.ts`

Hook này gom resolve/activate logic cho garage.

### Field trung gian đáng chú ý

- garage input
- garage resolved result
- saved garage active result
- label nút confirm dựa theo trạng thái
- trạng thái có thể confirm hay không

### Nhận xét

Đây là hook controller đúng nghĩa. Field trung gian ở đây là hợp lệ vì nó đang biến data thành hành vi UI.

---

## 11. `src/screens/Vehicle/VehicleEditScreen.tsx`

### Field gốc

- vehicle data
- form input state
- validation result

### Field trung gian

- form section data
- save payload
- dirty state
- computed display state

### Nhận xét

Screen này đã tách logic vào hook khá tốt, nhưng vẫn dễ có nhiều field trung gian trong form flow.

Nếu muốn sạch hơn, nên tiếp tục chia các section form thành subcomponent riêng.

---

## 12. `src/screens/Vehicle/useVehicleEditScreen.ts`

### Field trung gian

- form initial values
- submit payload
- validation/normalization result
- update preview state

### Nhận xét

Đây là file phù hợp để chứa field trung gian vì nó đóng vai trò orchestration.

---

## Các kiểu field trung gian đang xuất hiện lặp lại trong codebase

### 1. Normalize trước khi render
Ví dụ:
- trim tên gara
- uppercase mã gara
- fallback avatar

### 2. Merge nhiều nguồn thành một field hiển thị
Ví dụ:
- gara name từ `currentGarageName` + `resolvedGarageByCode`
- garage avatar từ store context + resolved API data

### 3. Split một object thành nhiều props
Ví dụ:
- `banner` thành `variant/title/subtitle/nextRoute/nextParams`
- `vehicle` thành nhiều card cảnh báo

### 4. Derived state phục vụ role-based UI
Ví dụ:
- `shouldShowPromoHome`
- `hasGarageContext`
- `currentGarageCode`
- `currentEmployee`
- `ordersLoading`
- `availableLoading`
- `assignedLoading`
- `isLoggedIn`
- `userType`

### 5. Store access nằm trong component UI
Ví dụ:
- `Navbar` vẫn giữ policy điều hướng/phân quyền

---

## Những chỗ nên xem là “đang dùng field trung gian” rõ nhất

Nếu chỉ chọn các file đáng chú ý nhất, thì đây là danh sách ngắn:

1. `src/screens/Home/useHomeScreen.ts`
   - nhiều normalize/merge/split nhất

2. `src/components/Navbar.tsx`
   - policy điều hướng/phân quyền nằm ngay trong component

3. `src/screens/Login/LoginScreen.tsx`
4. `src/screens/Login/DealerLoginScreen.tsx`
   - login result → nhiều state/side effect trung gian

5. `src/screens/Garage/SelectGarageScreen.tsx`
   - garage input/list → resolved garage, confirm state

6. `src/screens/Vehicle/useVehicleEditScreen.ts`
   - form data → submit payload, normalization, validation

---

## Kết luận ngắn

Codebase hiện tại vẫn có nhiều luồng dùng field trung gian, nhưng phần lớn là theo kiểu hợp lý của kiến trúc UI hiện đại:

- hook làm data shaping
- screen/UI nhận view model
- component nhỏ render theo props

Tuy nhiên, vài điểm vẫn đáng chú ý:

- `useHomeScreen.ts` đang ôm khá nhiều loại field trung gian cùng lúc
- `Navbar.tsx` chứa policy logic khá nhiều
- `LoginScreen.tsx` và `DealerLoginScreen.tsx` vẫn ôm nhiều side effect sau login

---

## Gợi ý refactor nếu muốn giảm field trung gian

1. Gom garage-related data thành một object duy nhất, ví dụ `garageSummary`.
2. Gom banner-related data thành một object duy nhất, ví dụ `promoBanner`.
3. Chuyển policy điều hướng của `Navbar` ra config/hook.
4. Không để component UI tự đọc Redux nếu đã có container/hook phía trên.
5. Tách logic login flow ra một use-case/service chung.
6. Tách logic banner/garage resolution ra hook nhỏ hơn.
7. Tách validation/form payload ra helper riêng ở màn edit.

---

## Mapping nhanh giữa field gốc và field trung gian

| File | Field gốc | Field trung gian |
|---|---|---|
| `useHomeScreen.ts` | `garageContext`, `currentGarageCode`, `customerVehicle` | `currentGarageAvatarUrl`, `shouldShowPromoHome`, `banner` |
| `HomeScreen.tsx` | output từ hook | `garageName`, `garageAvatarUrl`, `canChangeGarage` |
| `UserHeader.tsx` | `userName`, `isLoggedIn` | không còn badge state |
| `GarageSummaryCard.tsx` | `garageName`, `garageAvatarUrl`, `canChangeGarage` | không còn stats trung gian |
| `Navbar.tsx` | auth state, role | tab config, auth gating |
| `LoginScreen.tsx` | login response | hydrate store, context, navigation |
| `DealerLoginScreen.tsx` | login response + garageCode | hydrate store, context, navigation |
| `SelectGarageScreen.tsx` | garage input/list | resolved garage, confirm state |
| `useVehicleEditScreen.ts` | vehicle + form input | save payload, validation |

---

## Kết luận cuối

Nếu câu hỏi là: **“Trong codebase có file/luồng nào đang dùng field trung gian thay vì truyền 1 field duy nhất không?”** thì câu trả lời là **có, và khá nhiều**.

Những nơi nổi bật nhất là:
- `useHomeScreen.ts`
- `Navbar.tsx`
- `LoginScreen.tsx`
- `DealerLoginScreen.tsx`
- `SelectGarageScreen.tsx`
- `useVehicleEditScreen.ts`

Hiện tại Home đã được clean khá nhiều:
- `HomeScreenView` đã bị gộp vào `HomeScreen`
- badge ở header đã bị bỏ
- `GarageSummaryCard` không còn tự đọc store
- một số field không dùng nữa đã được loại bỏ

Nếu muốn, mình có thể làm tiếp một bản audit riêng cho các file **còn dư prop/logic không dùng** sau khi clean Home xong.
