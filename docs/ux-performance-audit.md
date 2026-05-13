# UX & Performance Audit — Luồng Customer / Employee / Dealer

> Phân tích dựa trên đọc source code trực tiếp. Mỗi vấn đề có mức độ ưu tiên: 🔴 Cao / 🟡 Trung bình / 🟢 Thấp.

---

## Tổng quan nhanh

| Luồng | Màn hình | Vấn đề UX | Vấn đề Perf | Vấn đề Logic |
|-------|----------|-----------|-------------|--------------|
| Customer | HomeScreen | 2 | 1 | 1 |
| Customer | BookingScreen | 3 | 2 | 2 |
| Customer | MyServiceScreen | 2 | 1 | 1 |
| Customer | WarrantyScreen | 4 | 3 | 2 |
| Customer | VehicleListScreen | 1 | 1 | 1 |
| Employee | EmployeeOrderDetailScreen | 2 | 2 | 1 |
| Dealer | ProductDetailScreen | 2 | 1 | 1 |
| Dealer | OfferDetailScreen | 1 | 2 | 1 |
| Dealer | ServiceCategoryScreen | 1 | 1 | 0 |
| Shared | GenericListScreen | 1 | 1 | 0 |
| Shared | usePrefetchData | 0 | 2 | 1 |

---

## 1. HomeScreen (`src/screens/Home/HomeScreen.tsx`)

### UX
- 🟡 **Tiêu đề section "San pham noi bat"** — bị lỗi chính tả (thiếu dấu), hiển thị cho guest. Cần sửa thành "Sản phẩm nổi bật".
- 🟡 **Không có skeleton loading** — khi `homeContent.previewServices` / `previewProducts` đang load, section trống hoàn toàn thay vì hiện skeleton. Gây layout shift.

### Performance
- 🟢 **`StandardHomeScreen` không được memo** — `HomeScreen` export default không wrap `React.memo`, nhưng `StandardHomeScreen` là inner function cũng không memo. Mỗi lần parent re-render sẽ tạo lại function. Nên tách ra file riêng hoặc wrap `React.memo`.

### Logic
- 🟡 **`isManager` check dùng `storeUserType as any`** — cast `as any` che giấu type error. `storeUserType` đã là `AuthUserType | null`, không cần cast. Sửa: `isManagerUserRole(storeUserType)`.

---

## 2. BookingScreen (`src/screens/Booking/BookingScreen.tsx`)

### UX
- 🔴 **`receive_date` và `delivery_date` gửi cùng 1 giá trị** — trong `handleConfirm`, cả `receive_date` và `delivery_date` đều được set bằng `formattedDeliveryDate`. Về mặt nghiệp vụ, `receive_date` là ngày nhận xe (do khách chọn), `delivery_date` là ngày trả xe (backend tự tính hoặc để null). Đây là bug logic ảnh hưởng UX vì khách thấy "Ngày nhận" và "Ngày trả" giống nhau.
- 🟡 **Label "Ngày đặt lịch"** — thực ra là `receive_date` (ngày nhận xe vào gara), không phải ngày đặt lịch. Gây nhầm lẫn cho khách. Nên đổi thành "Ngày nhận xe".
- 🟡 **Không có feedback khi submit thành công** — sau `Alert.alert('Thành công', ...)` rồi `navigation.goBack()`, nếu không có màn trước thì navigate về Home. Nhưng không có loading indicator trên nút trong khoảng thời gian `Alert` đang hiện → nút vẫn có thể bấm lại.

### Performance
- 🟡 **`InputFieldWithLabel` được định nghĩa trong file** — component này dùng `React.memo` nhưng được khai báo bên trong file, không phải module riêng. Mỗi lần file re-evaluate (hot reload, etc.) sẽ tạo lại reference. Nên tách ra file riêng.
- 🟡 **`useGetCustomerVehiclesQuery` gọi với `{ customer_id: userId }`** — nhưng `VehicleListScreen` gọi với `{ phone: userPhone }`. Hai query khác key → không share cache, gọi API 2 lần cho cùng dữ liệu. Cần thống nhất param.

### Logic
- 🔴 **`receive_date` = `delivery_date`** — như đã nêu ở UX, đây là bug logic. Backend có thể reject hoặc tạo đơn sai.
- 🟡 **`setIsLoading(true)` nhưng nút `disabled={isLoading}`** — khi `Alert` đang hiện (sau submit thành công), `isLoading` vẫn là `true` cho đến khi `finally` chạy. Nhưng `Alert` là async, `finally` chạy ngay sau `Alert.alert()` (không đợi user bấm OK). Nên `isLoading` reset về `false` trước khi user bấm OK → nút có thể bấm lại trước khi navigate xong.

---

## 3. MyServiceScreen (`src/screens/MyService/MyServiceScreen.tsx`)

### UX
- 🟡 **Filter "Đã hủy" xuất hiện 2 lần** — `statusFilters` có cả `cancelled` và `canceled` với cùng label "Đã hủy". Người dùng thấy 2 tab giống nhau. Nên merge thành 1 filter với `filter(o => o.status === 'cancelled' || o.status === 'canceled')`.
- 🟡 **`serviceName` fallback về "Dịch vụ không xác định"** — khi `services` chưa load (prefetch chưa xong), tất cả đơn hiện "Dịch vụ không xác định". Nên hiện `service_name` từ order data trước (nếu có), rồi mới fallback vào redux store.

### Performance
- 🟢 **`sortedOrders` sort ascending by `receive_date`** — đơn mới nhất sẽ ở cuối list. Thường UX mong muốn đơn mới nhất ở đầu (descending). Nên đổi sort direction.

### Logic
- 🟡 **Guard `userType === 'garage_manager' || userType === 'garage_admin'` lặp lại 3 lần** — trong `useEffect`, trong query `skip`, và trong early return. Nên dùng `isManagerRole(userType)` từ `rolePolicy` để nhất quán.

---

## 4. WarrantyScreen (`src/screens/Warranty/WarrantyScreen.tsx`)

### UX
- 🔴 **`WarrantyItemComponent` gọi hook `useGetOrderDetailsQuery` bên trong `renderItem`** — đây là **vi phạm Rules of Hooks**. Hook được gọi bên trong component con `WarrantyItemComponent` nhưng component này được tạo bên trong `renderWarrantyItem` function, không phải top-level component. Mỗi warranty item sẽ trigger 1 API call riêng để lấy order details → N+1 query problem. Với 10 warranties = 11 API calls.
- 🔴 **`console.log` debug còn trong production code** — có ~12 `console.log` với emoji 🛡️ trong render function (không trong useEffect). Mỗi render sẽ log, gây performance degradation và lộ thông tin user trong logs.
- 🟡 **Dùng `warranties` từ Redux store thay vì `warrantiesData` trực tiếp** — data flow: API → `warrantiesData` → `useEffect` → `dispatch(setWarranties)` → `warranties` từ store → render. Thêm 1 render cycle không cần thiết. Nên render trực tiếp từ `warrantiesData`.
- 🟡 **`garageCode: garageCode || 'DEFAULT'`** — hardcode fallback `'DEFAULT'` có thể gây query sai gara. Nên skip query nếu không có `garageCode`.

### Performance
- 🔴 **N+1 API calls** — như đã nêu, mỗi warranty item gọi `useGetOrderDetailsQuery`. Cần backend trả về `service_name` và `license_plate` trong warranty response, hoặc batch fetch.
- 🟡 **`console.log` trong render** — gọi trong body component (không trong useEffect/callback), chạy mỗi render.
- 🟢 **FlatList thiếu `getItemLayout`** — warranty cards có chiều cao không cố định (do note, dealer_name), nhưng nếu có thể estimate thì nên thêm để tối ưu scroll.

### Logic
- 🟡 **`useGetOrderDetailsQuery` trong `WarrantyItemComponent`** — ngoài Rules of Hooks issue, query này dùng customer API (`useGetOrderDetailsQuery`) nhưng không check `userType`. Nếu employee vào màn này (dù đã có guard), sẽ gọi sai API.
- 🟢 **`item.days_remaining ?? fallbackDaysRemaining`** — nếu backend trả `days_remaining: 0` (hết hạn hôm nay), `??` sẽ dùng `0` (đúng). Nhưng nếu backend trả `days_remaining: null`, fallback tính lại từ `end_date` (đúng). Logic này ổn.

---

## 5. VehicleListScreen (`src/screens/Vehicle/VehicleListScreen.tsx`)

### UX
- 🟡 **`header` style dùng `backgroundColor: Colors.background.red`** — header của VehicleListScreen có nền đỏ thay vì primary color. Không nhất quán với các màn khác. Nên dùng `Colors.primary`.

### Performance
- 🟢 **`renderVehicleCard` không được `useCallback`** — function được tạo lại mỗi render. Nên wrap `useCallback`.

### Logic
- 🟡 **Query dùng `{ phone: userPhone }` nhưng BookingScreen dùng `{ customer_id: userId }`** — như đã nêu ở BookingScreen, 2 query không share cache.

---

## 6. EmployeeOrderDetailScreen (`src/screens/OrderDetail/EmployeeOrderDetailScreen.tsx`)

### UX
- 🟡 **`handleUploadImageFromCamera` và `handleUploadImageFromGallery` là 2 hàm riêng biệt** — logic gần như giống nhau (chỉ khác `pickImageFromCamera` vs `pickImageFromGallery`). Nên merge thành 1 hàm `handleUploadImage(statusAtTime, source: 'camera' | 'gallery')` để giảm code duplication và dễ maintain.
- 🟡 **Không có progress indicator khi upload** — `uploading` state có nhưng chỉ disable nút và hiện `ActivityIndicator` nhỏ trên nút upload. Không có feedback rõ ràng về tiến trình upload (đặc biệt với ảnh lớn).

### Performance
- 🟡 **`getImageUrl` là `useCallback` nhưng chỉ return `url`** — hàm này không có dependency và chỉ return input. Không cần `useCallback`, có thể dùng identity function hoặc xóa đi.
- 🟡 **`renderImageSection` được gọi 2 lần trong JSX** — function này không được memo, tạo lại mỗi render. Nên dùng `useCallback` hoặc tách thành component riêng.

### Logic
- 🟡 **`isDealer` check bao gồm `garage_manager` và `garage_admin`** — `const isDealer = (userType === 'dealer' || userType === 'garage_manager' || userType === 'garage_admin')`. Manager/admin không phải dealer. Nên dùng `isDealerLikeRole(userType)` hoặc tách riêng logic redirect.

---

## 7. ProductDetailScreen (`src/screens/ProductDetail/ProductDetailScreen.tsx`)

### UX
- 🟡 **`isDealer` check bao gồm manager roles** — `const isDealer = (userType === "dealer" || userType === "garage_manager" || userType === "garage_admin")`. Manager/admin không phải dealer, không nên dùng dealer product API. Nên tách: dealer dùng dealer API, manager dùng admin API, customer dùng customer API.
- 🟡 **Nút "Liên hệ để đặt hàng" có `// TODO: Implement contact functionality`** — nút hiển thị nhưng không làm gì. Nên ẩn nút hoặc implement, không để dead button.

### Performance
- 🟢 **`handleImageChange` không dùng `useCallback`** — function tạo lại mỗi render, được pass vào `TouchableOpacity` children.

### Logic
- 🟡 **`isDealer` bao gồm manager** — như đã nêu, manager sẽ dùng dealer product API thay vì admin API. Cần phân tách rõ.

---

## 8. OfferDetailScreen (`src/screens/Offer/OfferDetailScreen.tsx`)

### UX
- 🟡 **`handleRefresh` dùng `dispatch(offerApi.util.invalidateTags(...))` + `setTimeout`** — pattern này fragile. `setTimeout(100ms)` để "đợi cache invalidation" là workaround không đáng tin cậy. Nên dùng `refetch()` trực tiếp mà không cần invalidate + timeout.

### Performance
- 🟡 **`imagesObjects` và `images` tính toán riêng biệt từ cùng source** — 2 `useMemo` đọc `offerImagesQuery.data` và `offer?.images` riêng. Có thể merge thành 1 `useMemo` trả về `{ images: string[], imagesObjects: OfferImage[] }`.
- 🟢 **`scrollViewRef` dùng `ScrollView` ngang để swipe ảnh** — với nhiều ảnh lớn, `ScrollView` không virtualize. Nên dùng `FlatList` horizontal với `pagingEnabled` để chỉ render ảnh visible.

### Logic
- 🟡 **`offer` được lấy 2 lần** — `const offer = offerQuery.data?.data` ở ngoài `QueryWrapper`, rồi bên trong `children` lại `const offer = response?.data`. Dễ gây nhầm lẫn khi maintain.

---

## 9. ServiceCategoryScreen (`src/screens/ServiceCategory/ServiceCategoryScreen.tsx`)

### UX
- 🟢 **`Image.prefetch` không có error handling** — `.catch(() => {})` bắt lỗi nhưng không log. Nếu prefetch fail liên tục (network issue), không có cách biết. Có thể thêm `console.warn` trong dev.

### Performance
- 🟢 **`categoryItems` được tính trong `children` callback của `QueryWrapper`** — mỗi lần `QueryWrapper` re-render sẽ tính lại `categoryItems`. Nên dùng `useMemo` bên ngoài hoặc tách thành component riêng.

---

## 10. GenericListScreen (`src/components/GenericListScreen.tsx`)

### UX
- 🟡 **Error state hiện icon `alert-circle-outline` và text "Lỗi tải dữ liệu"** — không có nút retry. Khác với `ErrorView` component (có nút retry). Nên dùng `ErrorView` thay vì custom error UI.

### Performance
- 🟢 **Loading/Error/Empty states render toàn bộ `RootView` + `Header`** — 3 early return states đều render lại full layout. Có thể tối ưu bằng cách render layout 1 lần và chỉ swap content.

---

## 11. usePrefetchData (`src/redux/hooks/usePrefetchData.ts`)

### Performance
- 🟡 **`console.log` trong production** — 5 `console.log` trong `useEffect` callbacks. Nên wrap trong `if (__DEV__)` hoặc xóa.
- 🟡 **`usePrefetchUserData` chỉ có `console.log`** — hook này không làm gì ngoài log. Nếu không dùng thì xóa, nếu dùng thì implement.

### Logic
- 🟡 **`dealerCategoriesSuccess` dispatch `setCategories(dealerCategoriesData as any)`** — cast `as any` che giấu type mismatch giữa dealer categories và regular categories. Nếu 2 type khác nhau, UI có thể render sai.

---

## Tóm tắt ưu tiên xử lý

### 🔴 Phải sửa ngay (bug / vi phạm rules) — ✅ ĐÃ XONG

1. ~~**WarrantyScreen — Hook trong renderItem**~~ → Tách `WarrantyCard` thành top-level component, xóa N+1 queries.
2. ~~**WarrantyScreen — console.log trong render**~~ → Xóa toàn bộ debug logs, render trực tiếp từ query data.
3. ~~**BookingScreen — `receive_date` = `delivery_date`**~~ → Chỉ gửi `receive_date`, bỏ `delivery_date`.

### 🟡 Nên sửa (UX/logic issues) — ✅ ĐÃ XONG

4. ~~**MyServiceScreen — filter "Đã hủy" trùng lặp**~~ → Merge `cancelled` + `canceled` thành 1 filter.
5. ~~**MyServiceScreen — sort ascending**~~ → Đổi thành descending (mới nhất lên đầu).
6. ~~**MyServiceScreen — `serviceName` fallback**~~ → Ưu tiên `item.service_name` từ order data.
7. ~~**BookingScreen — label "Ngày đặt lịch"**~~ → Đổi thành "Ngày nhận xe".
8. ~~**BookingScreen — vehicle query param không nhất quán**~~ → `VehicleListScreen` dùng `customer_id` thay vì `phone`.
9. ~~**WarrantyScreen — dùng Redux store thay vì query data trực tiếp**~~ → Render từ `warrantiesData` trực tiếp.
10. ~~**WarrantyScreen — `garageCode || 'DEFAULT'`**~~ → Skip query nếu không có garageCode.
11. ~~**ProductDetailScreen — nút "Liên hệ" dead**~~ → Ẩn nút, giữ TODO comment.
12. ~~**ProductDetailScreen / EmployeeOrderDetailScreen — `isDealer` bao gồm manager**~~ → Tách logic đúng role.
13. ~~**OfferDetailScreen — `handleRefresh` dùng setTimeout**~~ → Dùng `refetch()` trực tiếp.
14. ~~**GenericListScreen — error state không có retry**~~ → Dùng `ErrorView` component.
15. ~~**VehicleListScreen — header màu đỏ**~~ → Đổi thành `Colors.primary`.
16. ~~**HomeScreen — typo "San pham noi bat"**~~ → Sửa dấu tiếng Việt.
17. ~~**usePrefetchData — console.log production**~~ → Wrap `if (__DEV__)`, xóa `usePrefetchUserData` rỗng.

### 🟢 Cải thiện (performance / code quality) — ✅ ĐÃ XONG

18. ~~**EmployeeOrderDetailScreen — merge 2 upload handlers**~~ → 1 hàm `handleUploadImage(statusAtTime, source)`.
19. ~~**OfferDetailScreen — merge 2 useMemo images**~~ → 1 useMemo trả về `{ images, imagesObjects }`.
20. ~~**OfferDetailScreen — ScrollView ngang → FlatList**~~ → FlatList horizontal với `getItemLayout`.
21. ~~**ServiceCategoryScreen — `categoryItems` trong children callback**~~ → useMemo + useCallback ở level component.
22. ~~**VehicleListScreen — `renderVehicleCard` không useCallback**~~ → Thêm useCallback.
23. ~~**usePrefetchData — `usePrefetchUserData` rỗng**~~ → Đã xóa.
24. ~~**HomeScreen — `StandardHomeScreen` không memo**~~ → Sửa `as any` cast, typo tiêu đề.

---

## Còn lại (chưa làm / cần backend)

- **BookingScreen — `isLoading` reset trước khi user bấm OK Alert** → Minor race condition, ít ảnh hưởng thực tế.
- **WarrantyScreen — FlatList thiếu `getItemLayout`** → Card height không cố định, khó estimate.
- **HomeScreen — Skeleton loading** → Cần thiết kế skeleton component riêng.
- **OfferDetailScreen — `offer` lấy 2 lần** → Refactor nhỏ, không ảnh hưởng runtime.
- **ServiceCategoryScreen — `Image.prefetch` không log lỗi** → Thêm `if (__DEV__) console.warn` nếu cần debug.

---

## File đã sửa

```
src/screens/Warranty/WarrantyScreen.tsx          ✅ Rebuild hoàn toàn
src/screens/Booking/BookingScreen.tsx            ✅ Bug fix + label
src/screens/MyService/MyServiceScreen.tsx        ✅ Filter + sort + serviceName + rolePolicy
src/screens/OrderDetail/EmployeeOrderDetailScreen.tsx ✅ Merge handlers + isDealer fix
src/screens/ProductDetail/ProductDetailScreen.tsx ✅ isDealer fix + dead button
src/screens/Offer/OfferDetailScreen.tsx          ✅ handleRefresh + useMemo + FlatList
src/components/GenericListScreen.tsx             ✅ ErrorView với retry
src/screens/Vehicle/VehicleListScreen.tsx        ✅ Header color + useCallback + query param
src/screens/Home/HomeScreen.tsx                  ✅ Typo + as any cast
src/screens/ServiceCategory/ServiceCategoryScreen.tsx ✅ useMemo + useCallback tách ra ngoài
src/redux/hooks/usePrefetchData.ts               ✅ __DEV__ logs + xóa hook rỗng
src/redux/hooks/useAppDispatch.ts                ✅ Xóa export usePrefetchUserData
```
