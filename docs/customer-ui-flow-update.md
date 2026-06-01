# Cập nhật Giao diện Luồng Khách hàng

**Ngày hoàn thành:** 2025  
**Phạm vi:** Frontend (React Native) + Backend (Node.js/Express)

---

## Tổng quan

Bản cập nhật này cải thiện toàn diện trải nghiệm người dùng cho role khách hàng trong ứng dụng TNAuto, bao gồm 6 nhóm thay đổi chính.

---

## 1. Upload nhiều ảnh cùng lúc (MultiImagePicker)

### Thay đổi
- Tạo component mới `src/components/MultiImagePicker/MultiImagePicker.tsx`
- Hỗ trợ chọn và upload nhiều ảnh cùng lúc (tối đa 10 ảnh)
- Grid layout 3 cột, thumbnail 100×100
- Hiển thị trạng thái từng ảnh: uploading (spinner), success (tick xanh), error (icon đỏ + retry)
- Hỗ trợ `singleMode` cho màn hình chỉ cần 1 ảnh (VehicleEditScreen)
- Upload song song qua `/api/upload/single`

### Files thay đổi
- `src/components/MultiImagePicker/MultiImagePicker.tsx` *(mới)*
- `src/components/MultiImagePicker/index.ts` *(mới)*
- `src/screens/Vehicle/VehicleEditScreen.tsx` — thay picker cũ bằng MultiImagePicker
- `src/screens/Vehicle/useVehicleEditScreen.ts` — thay `vehicleImageUri` bằng `vehicleImages: ImageItem[]`

### Cách dùng lại
```tsx
import { MultiImagePicker, ImageItem } from '../../components/MultiImagePicker';

// Nhiều ảnh
<MultiImagePicker
  images={images}
  onImagesChange={setImages}
  maxImages={10}
/>

// Một ảnh (singleMode)
<MultiImagePicker
  images={images}
  onImagesChange={setImages}
  singleMode
  maxImages={1}
/>
```

---

## 2. Tốc độ tải ảnh

### Thay đổi
- `OptimizedImage` component đã có sẵn với skeleton placeholder, fade-in animation, fallback icon
- FlatList trong ProductScreen và VehicleListScreen đã có `removeClippedSubviews`, `maxToRenderPerBatch`, `windowSize`
- Prefetch ảnh cho 10 item đầu tiên trong ProductScreen và VehicleListScreen

### Files thay đổi
- Không có thay đổi mới — tận dụng `OptimizedImage` đã có

---

## 3. Tìm kiếm gần đúng (Fuzzy Search / Diacritic-insensitive)

### Thay đổi
- Tạo utility `src/utils/normalizeVietnamese.ts` với 2 hàm:
  - `normalizeVietnamese(str)` — chuẩn hóa về ASCII không dấu, lowercase
  - `fuzzyMatchVietnamese(text, query)` — so sánh fuzzy, query rỗng luôn true
- Áp dụng vào ProductScreen và VehicleListScreen
- Thêm debounce 300ms — tìm kiếm real-time, không cần nhấn Enter

### Ví dụ
```
"Hung"  → tìm ra "Hùng", "Hung", "hùng"
"Hùng"  → tìm ra "Hung", "Hùng"
"duong" → tìm ra "đường", "Đường"
```

### Files thay đổi
- `src/utils/normalizeVietnamese.ts` *(mới)*
- `src/screens/Product/ProductScreen.tsx` — fuzzy filter + debounce
- `src/screens/Vehicle/VehicleListScreen.tsx` — fuzzy filter + debounce

### Mở rộng sang màn hình khác
```typescript
import { fuzzyMatchVietnamese } from '../../utils/normalizeVietnamese';

// Trong filter của bất kỳ màn hình nào
items.filter(item => fuzzyMatchVietnamese(item.name, searchQuery))
```

---

## 4. Sửa lỗi trùng gara

### Vấn đề
Khi admin đổi `garageCode` của một gara, `upsertSavedGarage` không tìm thấy entry cũ (vì tìm theo `garageCode`) → push entry mới → 2 tab cho cùng 1 gara trong ProductScreen.

### Fix
- `garageContextSlice.ts`: `upsertSavedGarageState` tìm theo `garageCode` trước, nếu không thấy tìm theo `garageId`
- `garageContextSlice.ts`: `sanitizeGarageContextState` deduplicate theo `garageId` khi rehydrate Redux
- `GarageTabs.tsx`: deduplicate `garages` prop bằng `useMemo` trước khi render

### Files thay đổi
- `src/redux/slices/garageContextSlice.ts`
- `src/components/GarageTabs.tsx`

---

## 5. Tinh gọn Profile Screen khách hàng

### Thay đổi
- Ẩn item **"Đổi mật khẩu"** cho role `customer` (tính năng chưa hoàn thiện)
- Ẩn item **"Cài đặt thông báo"** cho role `customer` (tạm ẩn)
- Các role khác (employee, dealer, garage_manager, garage_admin) không thay đổi

### Bật lại khi cần
Trong `src/screens/Profile/useProfileScreen.ts`, hàm `buildRoleMenuConfig`, case `customer`, thêm lại vào `items`:

```typescript
// Bật lại đổi mật khẩu:
{
  id: 'changePassword',
  title: 'Đổi mật khẩu',
  subtitle: 'Cập nhật mật khẩu của bạn',
  icon: 'key-outline',
  onPress: handlers.handleChangePassword,
},

// Bật lại cài đặt thông báo:
{
  id: 'notification',
  title: 'Cài đặt thông báo',
  subtitle: 'Quản lý thông báo ứng dụng',
  icon: 'notifications-outline',
  onPress: handlers.navigateToNotification,
},
```

### Files thay đổi
- `src/screens/Profile/useProfileScreen.ts`

---

## 6. Form thông tin xe — tất cả trường, không bắt buộc

### Thay đổi
- Xóa validation bắt buộc: bằng lái, đăng kiểm, bảo hiểm
- Tất cả trường hiển thị label "(Tùy chọn)"
- Trường rỗng → gửi `null` lên backend (không gửi chuỗi rỗng)
- Backend `vehicle.service.js` đảm bảo `null` được ghi vào DB

### Files thay đổi (Frontend)
- `src/screens/Vehicle/useVehicleEditScreen.ts` — xóa 3 guard Alert bắt buộc
- `src/screens/Vehicle/VehicleEditScreen.tsx` — thêm label "(Tùy chọn)"

### Files thay đổi (Backend)
- `src/domains/customer/vehicle.service.js` — đảm bảo `model` và `image_url` null được ghi đúng

---

## Danh sách file thay đổi

### Frontend (`/TNAuto`)
| File | Loại | Mô tả |
|------|------|-------|
| `src/utils/normalizeVietnamese.ts` | Mới | Fuzzy search utility |
| `src/components/MultiImagePicker/MultiImagePicker.tsx` | Mới | Component upload đa ảnh |
| `src/components/MultiImagePicker/index.ts` | Mới | Export |
| `src/components/GarageTabs.tsx` | Cập nhật | Deduplicate garages |
| `src/redux/slices/garageContextSlice.ts` | Cập nhật | Fix dedup theo garageId |
| `src/screens/Product/ProductScreen.tsx` | Cập nhật | Fuzzy search + debounce |
| `src/screens/Vehicle/VehicleListScreen.tsx` | Cập nhật | Fuzzy search + debounce |
| `src/screens/Vehicle/VehicleEditScreen.tsx` | Cập nhật | MultiImagePicker + optional labels |
| `src/screens/Vehicle/useVehicleEditScreen.ts` | Cập nhật | ImageItem[], bỏ validation |
| `src/screens/Profile/useProfileScreen.ts` | Cập nhật | Ẩn items customer |

### Backend (`/TNAUTO-backend`)
| File | Loại | Mô tả |
|------|------|-------|
| `src/domains/customer/vehicle.service.js` | Cập nhật | Null-safe canonical update |
