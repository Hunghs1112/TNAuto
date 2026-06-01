# Design Document

## Overview

Cập nhật giao diện luồng khách hàng trong TNAuto bao gồm 6 nhóm thay đổi độc lập: (1) utility fuzzy search tiếng Việt, (2) component upload đa ảnh, (3) sửa lỗi trùng gara, (4) tinh gọn Profile screen, (5) bỏ validation bắt buộc form xe, (6) tối ưu tốc độ tải ảnh. Không có breaking change với API backend ngoài việc đảm bảo vehicle update chấp nhận `null` cho các trường tùy chọn.

## Architecture

### Lớp thay đổi

```
┌─────────────────────────────────────────────────────┐
│  Utility Layer                                      │
│  src/utils/normalizeVietnamese.ts                   │
└─────────────────────────────────────────────────────┘
         ↓ dùng bởi
┌─────────────────────────────────────────────────────┐
│  Component Layer                                    │
│  src/components/MultiImagePicker/                   │
│  src/components/GarageTabs.tsx (dedup fix)          │
│  src/components/OptimizedImage/ (đã có, tận dụng)  │
└─────────────────────────────────────────────────────┘
         ↓ dùng bởi
┌─────────────────────────────────────────────────────┐
│  Screen Layer                                       │
│  ProductScreen, VehicleListScreen (fuzzy)           │
│  VehicleEditScreen (multi-image, no validation)     │
│  ProfileScreen (ẩn items customer)                  │
└─────────────────────────────────────────────────────┘
         ↓ state
┌─────────────────────────────────────────────────────┐
│  Redux Layer                                        │
│  garageContextSlice (dedup fix)                     │
└─────────────────────────────────────────────────────┘
```

### Phụ thuộc giữa các thay đổi

- `normalizeVietnamese` → `ProductScreen`, `VehicleListScreen`
- `MultiImagePicker` → `VehicleEditScreen`
- `garageContextSlice` fix → `GarageTabs` fix
- `Profile` và `VehicleEdit validation` độc lập hoàn toàn

## Components and Interfaces

### MultiImagePicker

**File:** `src/components/MultiImagePicker/MultiImagePicker.tsx`

```typescript
interface ImageItem {
  id: string;           // uuid local
  uri: string;          // local URI hoặc remote URL
  uploadedUrl?: string; // URL sau khi upload thành công
  status: 'idle' | 'uploading' | 'success' | 'error';
  progress?: number;    // 0–100
  fileName?: string;
}

interface MultiImagePickerProps {
  images: ImageItem[];
  onImagesChange: (images: ImageItem[]) => void;
  maxImages?: number;   // default: 10
  singleMode?: boolean; // default: false
  disabled?: boolean;
}
```

Layout grid 3 cột, thumbnail 100×100, `borderRadius: 12`. Overlay status per ảnh: spinner khi uploading, tick xanh khi success, icon lỗi + retry khi error. Ô cuối là nút `+`. Upload song song qua `useUploadSingleImageMutation`.

### normalizeVietnamese utility

**File:** `src/utils/normalizeVietnamese.ts`

```typescript
export function normalizeVietnamese(str: string): string
export function fuzzyMatchVietnamese(text: string, query: string): boolean
```

Dùng `String.normalize('NFD')` + regex xóa combining diacritics + xử lý `đ/Đ` → lowercase.

### GarageTabs (cập nhật)

Thêm `useMemo` deduplicate `garages` prop theo `garageId` (fallback `garageCode`) trước khi render.

### buildRoleMenuConfig (cập nhật)

Case `customer`: xóa items `changePassword` và `notification` khỏi `accountSection`.

## Data Models

### ImageItem

| Field | Type | Mô tả |
|-------|------|-------|
| id | string | UUID local, dùng làm key |
| uri | string | Local URI (file://...) hoặc remote URL |
| uploadedUrl | string? | URL trả về từ server sau upload |
| status | 'idle' \| 'uploading' \| 'success' \| 'error' | Trạng thái upload |
| progress | number? | Tiến trình 0–100 |
| fileName | string? | Tên file gốc |

### GarageContextState (không thay đổi schema)

Thay đổi logic `upsertSavedGarageState`: tìm theo `garageCode` trước, nếu không thấy tìm theo `garageId`. Đảm bảo không có 2 entry cùng `garageId`.

### Vehicle update payload

Các trường tùy chọn gửi `null` khi rỗng (không gửi `undefined` hay chuỗi rỗng):
- `license_number`, `license_expiry_date`
- `inspection_certificate_number`, `inspection_date`, `inspection_expiry_date`
- `insurance_company`, `insurance_start_date`, `insurance_expiry_date`

## Correctness Properties

### Property 1: Fuzzy search idempotent với query rỗng

`fuzzyMatchVietnamese(text, '')` luôn trả về `true` với bất kỳ `text` nào.

**Validates: Requirements 3.1, 3.7**

### Property 2: Normalize idempotent

`normalizeVietnamese(normalizeVietnamese(s)) === normalizeVietnamese(s)` với bất kỳ chuỗi `s` nào.

**Validates: Requirements 3.4**

### Property 3: Garage dedup không tăng count

Sau `upsertSavedGarage` với cùng `garageId`, `savedGarages.length` không tăng.

**Validates: Requirements 4.4, 4.5**

### Property 4: Vehicle save không crash khi trường rỗng

`handleSave` với tất cả trường tùy chọn rỗng không throw, gọi `updateVehicle` với payload hợp lệ (null cho trường rỗng).

**Validates: Requirements 6.2, 6.3**

### Property 5: Profile customer không có items bị ẩn

`buildRoleMenuConfig('customer', ...)` không chứa item có `id === 'changePassword'` hoặc `id === 'notification'`.

**Validates: Requirements 5.1, 5.2**

## Error Handling

- **Upload lỗi:** Mỗi ảnh có trạng thái `error` riêng, hiển thị nút retry. Không block toàn bộ form.
- **Garage dedup:** Nếu không có `garageId`, fallback deduplicate theo `garageCode`. Không throw.
- **Fuzzy search:** Nếu `normalizeVietnamese` gặp chuỗi null/undefined, trả về `''` (không crash).
- **Vehicle save:** Khi trường rỗng → gửi `null`, backend xử lý. Nếu backend lỗi → Alert thông báo lỗi như hiện tại.

## Testing Strategy

- **Unit test** `normalizeVietnamese`: test các case dấu tiếng Việt, ký tự đặc biệt, chuỗi rỗng.
- **Unit test** `buildRoleMenuConfig('customer')`: kiểm tra không có `changePassword`, `notification`.
- **Unit test** `upsertSavedGarageState`: kiểm tra không tạo duplicate khi cùng `garageId`.
- **Manual test** `MultiImagePicker`: chọn nhiều ảnh, kiểm tra progress, retry, xóa.
- **Manual test** `VehicleEditScreen`: lưu với tất cả trường rỗng → không có Alert lỗi.
