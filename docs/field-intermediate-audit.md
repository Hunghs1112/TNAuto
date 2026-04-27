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

## 13. Bổ sung sau khi quét các màn còn lại (ngoài Home)

Phần dưới đây bổ sung thêm các màn đã quét thêm để tránh chỉ tập trung vào Home.

### 13.1 `src/screens/Vehicle/VehicleDetailScreen.tsx`

#### Field gốc
- `vehicleId`, `licensePlate` từ route params
- `ordersData`, `servicesData`, `vehicle` từ query
- `hasGarageContext`, `userPhone`, `activeGarageCode` từ store

#### Field trung gian
- `serviceMap` (map `service_id -> service_name`)
- `vehicleOrders` (lọc theo biển số + enrich `service_name`)
- `filteredOrders` (lọc theo `selectedStatus`)
- `isLoading` (gộp nhiều loading flag)
- `statusMeta` cho từng loại giấy tờ
- `formatDisplayDate(...)` để normalize date hiển thị

#### Nhận xét
Đây là màn có data shaping khá rõ: merge dữ liệu từ nhiều query rồi mới render UI.

---

### 13.2 `src/screens/Vehicle/VehicleListScreen.tsx`

#### Field gốc
- `vehiclesData.data`
- `hasGarageContext`
- route `userPhone`

#### Field trung gian
- `imageUrls` (extract danh sách URL từ vehicles)
- prefetch subset `imageUrls.slice(0, 12)`
- `selectedImage` cho modal preview

#### Nhận xét
Mức field trung gian vừa phải, chủ yếu phục vụ tối ưu hiển thị (prefetch + modal state).

---

### 13.3 `src/screens/Product/ProductScreen.tsx`

#### Field gốc
- route params `categoryId`, `categoryName`
- auth/garage context: `userType`, `currentGarageCode`, `savedGarages`
- dữ liệu từ 4 query (`allProducts`, `category`, `dealerProducts`, `dealerCategory`)

#### Field trung gian
- `activeQuery` (chọn query theo role + category)
- `filteredProducts` (chuẩn hóa dữ liệu từ nhiều nguồn về 1 list)
- `actualRefreshing` (gộp trạng thái refresh)
- `headerTitle` (fallback chain)
- `showGarageTabs`
- `productItems` (map sang item VM cho list)

#### Nhận xét
Đây là luồng rất điển hình của “1 màn UI nhưng normalize nhiều nguồn data + policy theo role”.

---

### 13.4 `src/screens/Service/ServiceScreen.tsx`

#### Field gốc
- route params `categoryId`, `categoryName`
- `userType`, `currentGarageCode`, `savedGarages`
- `categoryQuery`, `allServicesQuery`

#### Field trung gian
- `data` (unify format giữa category API và all services API)
- `isLoading`, `error` (chọn theo nhánh category/all)
- `mapDataToItems(...)` (map service -> list item view model)
- `showGarageTabs`

#### Nhận xét
Màn này dùng field trung gian hợp lý để thống nhất contract trước khi đưa cho `GenericListScreen`.

---

### 13.5 `src/screens/Notification/NotificationScreen.tsx`

#### Field gốc
- `notifications`, `unreadCount` từ API
- auth context (`isLoggedIn`, `userType`, `customerId`)

#### Field trung gian
- `recipientParams` (shape request params theo role)
- `actualRefreshing` (gộp nhiều isFetching)
- `getNotificationOrderId(...)` (resolve order id từ nhiều nguồn: field, metadata, regex từ message)
- `title`, `body`, `time` được derive ở `renderItem`
- `headerTitle` có unread badge

#### Nhận xét
Đây là màn có nhiều parse/fallback logic trung gian, đặc biệt phần định tuyến theo loại notification.

---

### 13.6 `src/screens/OrderDetail/OrderDetailScreen.tsx`

#### Field gốc
- route param `id`
- `orderData` từ API
- `userType`, `hasGarageContext`

#### Field trung gian
- `isCompleted`, `showConfirmationRow`
- `warrantyEndStr`, `warrantyEndDate`, `isWarrantyExpired`
- `getStatusText()`, `getStatusColor()`
- tách image list theo `status_at_time` (`received` / `completed`)

#### Nhận xét
Màn này có nhiều derived field để điều khiển nhánh hiển thị (status, warranty, image sections).

---

### 13.7 `src/screens/ServiceCategory/ServiceCategoryScreen.tsx`

#### Field gốc
- `query.data` từ `useGetServiceCategoriesQuery`
- `userType`, `currentGarageCode`, `savedGarages`, `hasGarageContext`

#### Field trung gian
- `actualRefreshing` (gộp `refreshing` + `query.isFetching`)
- `imageUrls` (extract + filter URL ảnh category)
- `showGarageTabs`
- `categoryItems` (map category -> item list model)

#### Nhận xét
Màn này có normalize/map dữ liệu rõ ràng trước khi render `FlatList`, không chỉ render data thô.

---

### 13.8 `src/screens/MyService/MyServiceScreen.tsx`

#### Field gốc
- `ordersResponse?.data`
- `userPhone`, `userType`, `hasGarageContext`
- `services` từ store

#### Field trung gian
- `orders` (fallback từ response)
- `statusFilters` (UI config)
- `actualRefreshing`
- `sortedOrders` (sort theo `receive_date`)
- `filteredOrders` (lọc theo tab trạng thái)
- `sectionTitle` (derive theo filter hiện tại)
- `serviceName`/`secondaryName` map cho `ServiceOrderCard`

#### Nhận xét
Đây là luồng view-model khá đậm: list thô -> sort/filter -> card props.

---

### 13.9 `src/screens/ProductDetail/ProductDetailScreen.tsx`

#### Field gốc
- `productId` route param
- `productQuery`, `productImagesQuery`, `dealerProductQuery`, `dealerProductImagesQuery`
- `categories` query

#### Field trung gian
- `activeProductQuery`, `activeProductImagesQuery` (switch theo role)
- `categoryName` (resolve từ `category_id` + categories hoặc `category_name`)
- `images` (normalize danh sách ảnh + placeholder fallback)
- `refreshing`, `imageRetry`, `currentImageIndex`, `selectedImage`

#### Nhận xét
Màn chi tiết này có nhiều fallback/normalize cho media và source theo role.

---

### 13.10 `src/screens/Offer/OfferDetailScreen.tsx`

#### Field gốc
- `offerQuery`, `offerImagesQuery`
- `offer` data từ API

#### Field trung gian
- `images` (ưu tiên nhiều nguồn: offer images endpoint -> `offer.images` -> `primary_image` -> `image_url` -> placeholder)
- `imagesObjects` (phục vụ badge `is_primary`)
- `currentImageIndex`, `selectedImage`, `refreshing`
- logic derive từ `valid_from`/`valid_to` sang chuỗi hiển thị

#### Nhận xét
Đây là ví dụ rõ của merge nhiều nguồn ảnh + fallback chain ngay trong màn hình.

---

### 13.11 `src/screens/Customers/CustomersScreen.tsx`

#### Field gốc
- `assignedResponse` từ `useGetAssignedOrdersQuery`
- `currentEmployee`, `userId`

#### Field trung gian
- `employeeId` (fallback employee hiện tại hoặc user)
- `customersMap` (group orders theo customer + thống kê `activeOrders`, `totalOrders`, số xe)
- refresh state gộp `autoRefreshing || queryRefreshing`

#### Nhận xét
Màn này không chỉ list; đang làm aggregation/grouping dữ liệu trước khi hiển thị.

---

### 13.12 `src/screens/Customers/CustomerDetailScreen.tsx`

#### Field gốc
- route params (`customerId`, `customerName`, `customerPhone`)
- `assignedResponse`, `services`

#### Field trung gian
- `employeeId`
- `customerOrders` (lọc theo `customer_id`)
- `customerInfo` (derive name/phone/totalOrders/activeOrders/vehicles)
- `getServiceName(...)` (resolve từ `service_name` hoặc map từ `service_id`)

#### Nhận xét
Màn này có derived object tương đối rõ để phục vụ summary header và list card.

---

## Cập nhật tổng quan sau khi quét thêm

Ngoài nhóm Home/Login/Garage/VehicleEdit đã nêu trước đó, các màn dưới đây cũng dùng field trung gian rõ rệt:

- `VehicleDetailScreen.tsx`
- `VehicleListScreen.tsx`
- `ProductScreen.tsx`
- `ProductDetailScreen.tsx`
- `ServiceScreen.tsx`
- `ServiceCategoryScreen.tsx`
- `NotificationScreen.tsx`
- `OrderDetailScreen.tsx`
- `MyServiceScreen.tsx`
- `CustomersScreen.tsx`
- `CustomerDetailScreen.tsx`
- `OfferDetailScreen.tsx`

=> Tức là pattern “field gốc -> normalize/merge/derive -> view model/UI props” đang xuất hiện rộng ở nhiều màn, không chỉ Home.

---

## Kết luận cuối

Nếu câu hỏi là: **“Trong codebase có file/luồng nào đang dùng field trung gian thay vì truyền 1 field duy nhất không?”** thì câu trả lời là **có, và xuất hiện ở nhiều cụm màn hình khác nhau, không chỉ Home**.

Những nơi nổi bật nhất (bản cập nhật) là:
- `src/screens/Home/useHomeScreen.ts`
- `src/components/Navbar.tsx`
- `src/screens/Login/LoginScreen.tsx`
- `src/screens/Login/DealerLoginScreen.tsx`
- `src/screens/Garage/SelectGarageScreen.tsx`
- `src/screens/Vehicle/useVehicleEditScreen.ts`
- `src/screens/Vehicle/VehicleDetailScreen.tsx`
- `src/screens/Product/ProductScreen.tsx`
- `src/screens/Service/ServiceScreen.tsx`
- `src/screens/Notification/NotificationScreen.tsx`
- `src/screens/OrderDetail/OrderDetailScreen.tsx`

Hiện tại Home đã được clean khá nhiều:
- `HomeScreenView` đã bị gộp vào `HomeScreen`
- badge ở header đã bị bỏ
- `GarageSummaryCard` không còn tự đọc store
- một số field không dùng nữa đã được loại bỏ

Nếu muốn, mình có thể làm tiếp một bản audit riêng theo từng module (Vehicle/Product/Order/Notification) kèm mức độ ưu tiên refactor.

---

## 14. Cập nhật tiến độ refactor đã hoàn thành (Home)

Phần này ghi lại các thay đổi đã làm sau audit, theo hướng:

- giảm truyền data qua nhiều tầng component
- gom contract rõ ràng ở hook/screen
- để component cần data tự lấy từ Store/Hook khi phù hợp
- navigation chỉ truyền `id` hoặc params nhỏ

### 14.1 Đã dọn ở `useHomeScreen.ts`

Đã loại bỏ và gom lại một số field trung gian:

1. Bỏ field dư thừa:
- bỏ `savedGarageCount`
- bỏ các selector/import không còn dùng theo thay đổi này

2. Gom contract garage:
- thêm `garageSummary` gồm:
  - `name`
  - `avatarUrl`
  - `hasContext`
  - `canChangeGarage`

3. Gom contract banner:
- thêm `promoBanner` gồm:
  - `title`
  - `subtitle`
  - `dismiss`
- không còn trả rời `banner`, `dismissBanner`, `bannerNextRoute`, `bannerNextParams` cho UI

4. Gom contract content:
- thêm `homeContent` gồm:
  - `previewServices`
  - `previewProducts`

5. Gom contract orders:
- thêm `ordersState` gồm:
  - `displayedOrders`
  - `sortedOrders`
  - `ordersLoading`
  - `sortedAvailableOrders`
  - `availableLoading`
  - `sortedAssignedOrders`
  - `assignedLoading`
  - `claimingOrderId`

6. Gom contract action:
- thêm `actions` gồm các handler chính:
  - `onNotificationPress`
  - `onOfferPress`
  - `onWarrantyPress`
  - `onOrderPress`
  - `onProductPress`
  - `onServicePress`
  - `onClaimOrder`
  - `onViewMore`
  - `onLoginPress`
  - `onGaragePress`
  - `onVehicleBannerPress`

### 14.2 Đã dọn ở `HomeScreen.tsx`

`HomeScreen` đã giảm đáng kể việc map field rời từ hook:

- dùng `garageSummary` thay cho `currentGarageName/currentGarageAvatarUrl/hasGarageContext` rời
- dùng `promoBanner` thay cho cụm banner rời
- dùng `homeContent` thay cho `homePreviewServices/homePreviewProducts`
- dùng `ordersState` thay cho các field order/loading rời
- dùng `actions.*` thay cho nhiều `handle*` rời

=> Vai trò `HomeScreen` gần hơn với container/layout, ít data shaping tại view.

### 14.3 Đã giảm truyền props qua nhiều tầng component

Theo nguyên tắc mới: component cần data thì tự lấy từ Store/Hook.

1. `DocumentExpiryCards.tsx`
- trước: nhận prop `vehicle` từ `HomeScreen`
- nay: tự lấy `userId/userType/isLoggedIn` từ store + tự gọi `useGetCustomerVehiclesQuery`
- `HomeScreen` chỉ còn render `<DocumentExpiryCards />`

2. `VehicleInfoCard.tsx`
- trước: nhận `userId`, `userPhone` từ `HomeScreen`
- nay: tự lấy `userId`, `userPhone` từ store
- `HomeScreen` chỉ còn render `<VehicleInfoCard />`

3. Nhóm list ở Home tự lấy `services` từ store:
- `src/screens/Home/components/OrdersList.tsx`
- `src/screens/Home/components/AvailableOrdersList.tsx`
- `src/screens/Home/components/EmployeeOrdersList.tsx`

=> `HomeScreen` không còn truyền `services` xuống các list này.

### 14.4 Trạng thái hiện tại sau đợt refactor

Nhóm Home đã chuyển dần sang contract rõ ràng hơn:

- `garageSummary`
- `homeContent`
- `ordersState`
- `promoBanner`
- `actions`

Đây là bước đi đúng hướng để scale:
- giảm props drilling
- giảm coupling giữa screen và child components
- giữ data-flow nhất quán hơn giữa hook/controller và UI.
---

## 15. Garage Manager Auth Update (bo sung)

Muc tieu:
- Tach tai khoan quan ly gara ra khoi bang `garages`.
- Dung chung tai khoan manager cho:
  - Web: `POST /api/web/auth/login`
  - App: `POST /api/app/manager/auth/login`
- Role moi sau login: `garage_manager`.

### 15.1 Migration DB

File migration:
- `scripts/sql/2026-04-26-add-garage-managers.sql`

Noi dung chinh:
- Tao bang `garage_managers`.
- Copy du lieu ban dau tu `garages` (`admin_phone`, `admin_email`, `password_hash`) neu chua co.
- Rang buoc `UNIQUE (garage_id)` de dam bao 1 tai khoan / 1 gara.

Schema bang moi:
- `id` PK
- `garage_id` FK -> `garages.id`
- `name`
- `phone` (UNIQUE)
- `email` (UNIQUE, nullable)
- `password_hash`
- `status` (`active` / `inactive`)
- `last_login_at`
- `created_at`, `updated_at`

### 15.2 API login manager

Web login:
- Endpoint: `POST /api/web/auth/login`
- Body:

```json
{
  "login": "0912345678",
  "password": "your-password"
}
```

App manager login:
- Endpoint: `POST /api/app/manager/auth/login`
- Body:

```json
{
  "login": "manager@example.com",
  "password": "your-password"
}
```

`login` cho phep nhap phone hoac email.

Response chinh:

```json
{
  "success": true,
  "token": "<token>",
  "expires_at": "<iso-datetime>",
  "garage_manager_id": 1,
  "data": {
    "user_type": "garage_manager",
    "garage_id": 2
  },
  "garage": {
    "id": 2,
    "code": "TN001",
    "name": "TNAUTO..."
  }
}
```

### 15.3 Tuong thich token cu

Middleware `requireGarageAdminAuth` da cho phep ca:
- `garage_admin` (token cu)
- `garage_manager` (token moi)

Toan bo API quan tri gara hien tai tiep tuc chay duoc trong giai doan chuyen doi.

### 15.4 File backend lien quan

- `src/controllers/authController.js`
- `src/middleware/authContext.js`
- `src/routes/web/index.js`
- `src/routes/app/index.js`
- `src/routes/app/manager.js`
- `src/app.js`

### 15.5 Rollout an toan

1. Chay migration SQL.
2. Deploy backend.
3. Cap nhat app login sang endpoint manager.
4. Cap nhat web login UI gui `login` + `password`.
5. Theo doi log/login failure rate, sau on dinh co the bo login format cu.

Luu y:
- Gara khong co `admin_phone` se khong duoc seed manager account, can tao thu cong trong `garage_managers`.

---

## 16. Plan cap nhat Trang chu va phan trang theo role

Muc tieu:
- Phan luong UI ro rang theo role sau login.
- Khong pha vo luong cu (`garage_admin`) trong giai doan chuyen tiep.
- Tat ca role dung chung 1 co che auth context + route guard.

### 16.1 Role matrix de render trang

- `guest`:
  - Trang chu public.
  - Hien CTA dang nhap.
  - Khong hien dashboard quan tri.

- `customer`:
  - Trang chu khach hang (uu dai, lich su xe, nhac han giay to, thong bao).
  - Khong hien menu quan tri gara.

- `garage_manager`:
  - Trang chu manager dashboard (don moi, don dang xu ly, KPI nhanh, thong bao noi bo).
  - Hien day du menu quan tri gara.

- `garage_admin` (legacy token):
  - Tam thoi dung cung layout/menu voi `garage_manager`.
  - Muc tieu la khong doi hanh vi sau deploy.

- `employee` (neu co):
  - Trang chu theo cong viec duoc giao.
  - An nhung trang chi danh cho manager/admin.

### 16.2 Route guard va redirect sau login

1. Sau login, map role -> landing route:
   - `customer` -> `/home/customer`
   - `garage_manager` va `garage_admin` -> `/home/garage`
   - `employee` -> `/home/employee`
2. Neu vao route sai role, redirect ve landing route cua role.
3. Neu token het han/invalid, clear session va redirect `/login`.
4. Cho phep `garage_admin` truy cap cung tap route voi `garage_manager` trong thoi gian chuyen doi.

### 16.3 Ke hoach cap nhat Home

Pha 1 (khong doi UI lon):
1. Tach `HomeContainer` theo role, giu lai cac component hien tai.
2. Them `role-based switch` tai entry `Home`:
   - `CustomerHome`
   - `GarageHome`
   - `EmployeeHome` (neu can)
3. Doi ten contract view-model cho ro role:
   - `customerHomeVM`
   - `garageHomeVM`

Pha 2 (toi uu dashboard manager):
1. Home manager uu tien widget:
   - don cho nhan
   - don qua han SLA
   - lich hen hom nay
   - doanh thu nhanh
2. Top action co dinh:
   - Tao don moi
   - Quan ly khach hang
   - Quan ly dich vu/san pham
3. Hien canh bao account:
   - `inactive` manager
   - canh bao thong tin tai khoan thieu (`phone/email`)

### 16.4 Ke hoach cap nhat cac trang khac

1. Navbar/Sidebar:
   - Dung 1 `menuConfigByRole`.
   - Role `garage_manager` va `garage_admin` dung chung config.

2. Login page:
   - Label ro: "Dang nhap quan ly gara".
   - Form dung `login` + `password` (khong hardcode phone-only).
   - Message loi chung cho phone/email khong hop le.

3. Profile/Account page:
   - Hien `garage_manager_id`, `garage_id`, `status`.
   - Them action doi mat khau, cap nhat email.

4. Order/Customer/Service/Product pages:
   - Goi API nhu cu nhung them role guard o route layer.
   - Neu API can role moi, uu tien update middleware check theo `garage_manager` + `garage_admin`.

5. Notification page:
   - Tach bo loc thong bao theo role (customer vs manager).

### 16.5 Thu tu implementation de giam rui ro

1. Cap nhat auth context va role constants (`garage_manager` la role chinh moi).
2. Cap nhat login form web/app gui `login`.
3. Them role-based redirect sau login.
4. Cap nhat navbar/menu theo `menuConfigByRole`.
5. Tach Home theo role, deploy voi feature flag neu can.
6. Theo doi metrics 3-7 ngay:
   - login success rate
   - unauthorized response rate (401/403)
   - sai role redirect rate
7. Khi on dinh, lap ke hoach tat dan support login cu.
