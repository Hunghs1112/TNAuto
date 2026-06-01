# Implementation Plan: Cập nhật Giao diện Luồng Khách hàng

## Overview

11 tasks được chia thành các wave song song. Wave 1 tạo nền tảng (utility + component), Wave 2 áp dụng vào các màn hình, Wave 3 fix Redux/state, Wave 4 hoàn thiện và tài liệu.

## Tasks

## Task Dependency Graph

```json
{
  "waves": [
    {
      "wave": 1,
      "tasks": ["1", "2", "5"],
      "description": "Utility, component nền tảng và Redux fix — độc lập nhau"
    },
    {
      "wave": 2,
      "tasks": ["3", "4", "6", "7", "8", "9"],
      "description": "Áp dụng vào màn hình — phụ thuộc wave 1"
    },
    {
      "wave": 3,
      "tasks": ["10"],
      "description": "Backend fix"
    },
    {
      "wave": 4,
      "tasks": ["11"],
      "description": "Tài liệu tổng kết"
    }
  ],
  "dependencies": {
    "3": ["1"],
    "4": ["1"],
    "6": ["5"],
    "7": ["2"],
    "8": [],
    "9": [],
    "10": [],
    "11": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
  }
}
```

- [ ] 1. Tạo utility `normalizeVietnamese`
  - Tạo file `src/utils/normalizeVietnamese.ts`
  - Export `normalizeVietnamese(str: string): string` — dùng `String.normalize('NFD')` + regex xóa combining diacritics + xử lý `đ/Đ` → lowercase
  - Export `fuzzyMatchVietnamese(text: string, query: string): boolean` — trả về `true` khi query rỗng
  - Xử lý null/undefined an toàn (không crash)
  - _Requirements: R3_

- [~] 2. Tạo component `MultiImagePicker`
  - Tạo thư mục `src/components/MultiImagePicker/`
  - Tạo `MultiImagePicker.tsx` với props: `images: ImageItem[]`, `onImagesChange`, `maxImages=10`, `singleMode=false`, `disabled`
  - Định nghĩa type `ImageItem` với fields: `id`, `uri`, `uploadedUrl`, `status`, `progress`, `fileName`
  - Layout grid 3 cột, thumbnail 100×100, `borderRadius: 12`
  - Overlay status: spinner khi `uploading`, tick xanh khi `success`, icon lỗi đỏ + nút retry khi `error`
  - Ô cuối là nút `+` (ẩn khi đủ `maxImages`)
  - Nhấn `×` góc phải trên để xóa ảnh
  - Nhấn giữ thumbnail → Modal xem full screen
  - Dùng `launchImageLibrary` với `selectionLimit` = `singleMode ? 1 : maxImages - images.length`
  - Upload song song qua `useUploadSingleImageMutation` cho từng ảnh mới
  - Tạo `index.ts` export `MultiImagePicker` và `ImageItem`
  - _Requirements: R1, R2_

- [~] 3. Cập nhật `ProductScreen` — fuzzy search + debounce
  - Import `fuzzyMatchVietnamese` từ `src/utils/normalizeVietnamese`
  - Thay filter `toLowerCase().includes()` bằng `fuzzyMatchVietnamese` cho `product.name` và `product.description`
  - Thêm `useEffect` debounce 300ms: `searchInput` → `searchQuery` (thay thế `onBlur`/`onSubmitEditing`)
  - Cập nhật empty message: "Không tìm thấy kết quả cho '[searchQuery]'"
  - _Requirements: R3_

- [~] 4. Cập nhật `VehicleListScreen` — fuzzy search + debounce
  - Import `fuzzyMatchVietnamese` từ `src/utils/normalizeVietnamese`
  - Thay filter trong `displayedVehicles` useMemo bằng `fuzzyMatchVietnamese` cho `license_plate` và `model`
  - Thêm `useEffect` debounce 300ms: `searchInput` → `searchQuery` (thay thế `onBlur`/`onSubmitEditing`)
  - _Requirements: R3_

- [~] 5. Sửa lỗi trùng gara trong `garageContextSlice`
  - Cập nhật `upsertSavedGarageState`: tìm theo `garageCode` trước, nếu không thấy tìm theo `garageId` (trường hợp đổi mã)
  - Cập nhật `sanitizeGarageContextState`: sau khi build `savedGarages`, deduplicate theo `garageId` (giữ entry cuối cùng, bỏ duplicate)
  - _Requirements: R4_

- [~] 6. Cập nhật `GarageTabs` — deduplicate prop
  - Thêm `useMemo` trong component để deduplicate `garages` prop theo `garageId` (fallback `garageCode`)
  - Đảm bảo `key` prop trong render không bị trùng
  - _Requirements: R4_

- [~] 7. Cập nhật `VehicleEditScreen` — dùng `MultiImagePicker`
  - Cập nhật `useVehicleEditScreen.ts`:
    - Thay `vehicleImageUri` + `vehicleImageFileName` bằng `vehicleImages: ImageItem[]`
    - Xóa `handlePickVehicleImage` và `uploadVehicleImage` (logic chuyển vào `MultiImagePicker`)
    - Trong `handleSave`: lấy `uploadedUrl` từ `vehicleImages[0]?.uploadedUrl ?? vehicleImages[0]?.uri ?? vehicle?.image_url ?? null`
    - Khởi tạo `vehicleImages` từ `vehicle.image_url` khi load (status: 'success', uploadedUrl = image_url)
  - Cập nhật `VehicleEditScreen.tsx`:
    - Thay `TouchableOpacity` + `Image` picker cũ bằng `<MultiImagePicker singleMode maxImages={1} />`
    - Xóa import `handlePickVehicleImage`, `vehicleImageUri`
  - _Requirements: R1, R2_

- [~] 8. Cập nhật `Profile Screen` — ẩn items cho customer
  - Trong `useProfileScreen.ts`, hàm `buildRoleMenuConfig`, case `customer`:
    - Xóa item `changePassword` khỏi `accountSection.items`
    - Xóa item `notification` khỏi `accountSection.items`
    - Thêm comment `// TODO: bật lại khi tính năng hoàn thiện` tại chỗ xóa
  - Giữ nguyên `accountSection` đầy đủ cho các role khác
  - _Requirements: R5_

- [~] 9. Cập nhật `VehicleEditScreen` — bỏ validation bắt buộc
  - Trong `useVehicleEditScreen.ts`, hàm `handleSave`:
    - Xóa guard Alert: `!currentLicenseExpiryDate`
    - Xóa guard Alert: `!currentInspectionCertificateNumber || !currentInspectionDate || !currentInspectionExpiryDate`
    - Xóa guard Alert: `!currentInsuranceCompany || !currentInsuranceStartDate || !currentInsuranceExpiryDate`
    - Giữ lại guard `!userId` và `!garageCode && !garageId`
  - Trong `VehicleEditScreen.tsx`:
    - Thêm style `optionalLabel` (fontSize: 11, color: Colors.text.secondary)
    - Thêm text "(Tùy chọn)" vào label của: Số bằng lái, Ngày hết hạn bằng lái, Số đăng kiểm, Ngày đăng kiểm, Ngày hết hạn đăng kiểm, Đơn vị bảo hiểm, Ngày bắt đầu bảo hiểm, Ngày hết hạn bảo hiểm
  - _Requirements: R6_

- [~] 10. Backend — đảm bảo vehicle update chấp nhận `null`
  - Tìm service/controller xử lý `PUT /vehicles/:id` trong backend
  - Kiểm tra các trường tùy chọn: `license_number`, `license_expiry_date`, `inspection_certificate_number`, `inspection_date`, `inspection_expiry_date`, `insurance_company`, `insurance_start_date`, `insurance_expiry_date`
  - Đảm bảo khi nhận `null`, các trường được cập nhật thành `NULL` trong DB (không bị bỏ qua bởi `undefined` check)
  - Nếu service dùng pattern `if (field !== undefined) updates[key] = field`, đổi thành `if (field !== undefined) updates[key] = field ?? null`
  - _Requirements: R6_

- [~] 11. Viết tài liệu MD tổng kết
  - Tạo file `docs/customer-ui-flow-update.md`
  - Mô tả các thay đổi đã thực hiện theo từng tính năng (6 nhóm)
  - Liệt kê các file đã thay đổi (frontend + backend)
  - Hướng dẫn bật lại các tính năng tạm ẩn (đổi mật khẩu, thông báo)
  - Ghi chú về fuzzy search utility và cách mở rộng sang màn hình khác
  - Ghi chú về MultiImagePicker và cách dùng lại
  - _Requirements: tất cả_

## Notes

- Task 1, 2, 5 có thể chạy song song (wave 1)
- Task 3, 4 phụ thuộc Task 1; Task 6 phụ thuộc Task 5; Task 7 phụ thuộc Task 2
- Task 8, 9, 10 độc lập hoàn toàn, có thể chạy bất kỳ lúc nào
- Backend (Task 10) nên được kiểm tra trước khi test Task 9 end-to-end
- Không có breaking change với các role khác (employee, dealer, manager, admin)
