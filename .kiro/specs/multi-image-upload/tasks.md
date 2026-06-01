# Implementation Plan: Multi-Image Upload cho Dịch vụ

## Overview

Thay thế logic upload ảnh đơn lẻ trong `EmployeeOrderDetailScreen` bằng logic upload nhiều ảnh (tối đa 10 ảnh/lần). Thay đổi tập trung hoàn toàn ở frontend: `EmployeeOrderDetailScreen.tsx` và `imageUpload.ts`. Backend không cần thay đổi.

## Tasks

- [x] 1. Cập nhật utility `imageUpload.ts` để hỗ trợ multi-select
  - [x] 1.1 Kiểm tra và cập nhật `pickImageFromGallery` để nhận `selectionLimit` linh hoạt
    - Đảm bảo hàm `pickImageFromGallery` trả về `Asset[]` (mảng) thay vì `Asset | null`
    - Xác nhận `selectionLimit` được truyền đúng vào native image picker
    - _Requirements: 1.2, 1.4_

  - [ ]* 1.2 Viết unit tests cho `pickImageFromGallery` với `selectionLimit > 1`
    - Test trả về mảng nhiều assets khi chọn nhiều ảnh
    - Test trả về mảng rỗng khi user cancel
    - _Requirements: 1.4, 1.5_

- [x] 2. Refactor state management trong `EmployeeOrderDetailScreen`
  - [x] 2.1 Thay thế state `uploading: boolean` bằng `uploadingSection: string | null`
    - Xóa `const [uploading, setUploading] = useState(false)`
    - Thêm `const [uploadingSection, setUploadingSection] = useState<string | null>(null)`
    - Cập nhật tất cả chỗ dùng `uploading` sang `uploadingSection`
    - Thêm constant `MAX_IMAGES_PER_UPLOAD = 10`
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 3. Implement hàm `handleUploadImages` (thay thế `handleUploadImage`)
  - [x] 3.1 Implement logic chọn ảnh theo source (`camera` | `gallery`)
    - Gọi `pickImageFromCamera` khi `source === 'camera'` (trả về 1 ảnh)
    - Gọi `pickImageFromGallery({ selectionLimit: MAX_IMAGES_PER_UPLOAD, maxWidth: 1920, maxHeight: 1920, quality: 0.8 })` khi `source === 'gallery'`
    - Return sớm nếu assets rỗng (user cancel)
    - _Requirements: 1.2, 1.3, 1.5_

  - [x] 3.2 Implement validation kích thước ảnh cho toàn bộ batch
    - Lặp qua từng asset, gọi `validateImageSize(asset, 5)` cho mỗi ảnh
    - Hủy toàn bộ batch và return nếu bất kỳ ảnh nào > 5MB
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 3.3 Implement guard checks (quyền upload và trạng thái đang upload)
    - Kiểm tra `canUploadImages` — Alert và return nếu `false`
    - Kiểm tra `uploadingSection !== null` — Alert "đang tải lên" và return nếu đang có upload
    - _Requirements: 5.5, 6.1, 6.2_

  - [x] 3.4 Implement parallel storage upload với `Promise.all`
    - Set `uploadingSection(statusAtTime)` trước khi upload
    - Gọi `Promise.all(assets.map(asset => uploadSingleImage(createImageFormData(asset, 'image')).unwrap()))`
    - _Requirements: 3.1, 3.2, 5.1_

  - [x] 3.5 Implement sequential metadata save và error handling
    - Lặp tuần tự qua `uploadResults`, gọi `uploadServiceOrderImage` cho từng URL
    - Truyền `order_id`, `image_url`, `status_at_time`, `uploaded_by: currentEmployeeId`, `description: ''`
    - Alert thành công với số lượng ảnh sau khi tất cả metadata save xong
    - Gọi `refetch()` sau khi thành công
    - Wrap toàn bộ trong `try/catch/finally` — `finally` luôn reset `uploadingSection(null)`
    - Alert lỗi với `getApiErrorMessage` trong `catch`
    - _Requirements: 3.3, 4.1, 4.2, 4.3, 4.4, 4.5, 7.1, 7.2, 7.4_

  - [ ]* 3.6 Viết property test: Upload count matches selection (Property 1)
    - **Property 1: Upload count matches selection**
    - Với bất kỳ batch N ảnh hợp lệ (1 ≤ N ≤ 10, mỗi ảnh ≤ 5MB), số lần gọi `uploadServiceOrderImage` phải bằng đúng N
    - **Validates: Requirements 1.4, 4.1, 4.2**

  - [ ]* 3.7 Viết property test: State always cleaned up (Property 2)
    - **Property 2: State always cleaned up**
    - Với bất kỳ kết quả upload (thành công hay thất bại), `uploadingSection` luôn được reset về `null` sau khi kết thúc
    - **Validates: Requirements 5.4, 7.4**

  - [ ]* 3.8 Viết unit test: Unauthorized upload blocked (Property 3)
    - **Property 3: Unauthorized upload blocked**
    - Khi `canUploadImages === false`, không có Image_Picker, Storage_Upload, hay Metadata_Save nào được gọi
    - **Validates: Requirements 6.1, 6.2**

  - [ ]* 3.9 Viết unit test: File size validation stops batch (Property 4)
    - **Property 4: File size validation stops batch**
    - Khi batch chứa ít nhất một ảnh > 5MB, toàn bộ batch bị hủy và không có Storage_Upload nào được thực hiện
    - **Validates: Requirements 2.1, 2.2**

- [x] 4. Checkpoint — Đảm bảo tất cả tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Cập nhật `handlePickImage` và `renderImageSection`
  - [x] 5.1 Cập nhật `handlePickImage` để gọi `handleUploadImages` thay vì `handleUploadImage`
    - Thay `handleUploadImage(statusAtTime)` bằng `handleUploadImages(statusAtTime, 'camera')` và `handleUploadImages(statusAtTime, 'gallery')`
    - Giữ nguyên logic `showImagePickerOptions` và guard `canUploadImages`
    - _Requirements: 1.1, 6.1_

  - [x] 5.2 Cập nhật `renderImageSection` để dùng `uploadingSection` thay vì `uploading`
    - Thay điều kiện `disabled={uploading}` bằng `disabled={uploadingSection === statusAtTime}`
    - Thay điều kiện hiển thị `ActivityIndicator` bằng `uploadingSection === statusAtTime`
    - Đảm bảo các section khác không bị disable khi một section đang upload
    - _Requirements: 5.2, 5.3_

  - [ ]* 5.3 Viết unit test: Section isolation during upload (Property 5)
    - **Property 5: Section isolation during upload**
    - Khi `uploadingSection === 'received'`, nút "Tải lên" của section `'completed'` phải ở trạng thái enabled (và ngược lại)
    - **Validates: Requirements 5.2, 5.3**

  - [ ]* 5.4 Viết unit test: Duplicate upload prevention (Property 6)
    - **Property 6: Duplicate upload prevention**
    - Khi `uploadingSection !== null`, bấm nút "Tải lên" không bắt đầu upload mới và không thay đổi `uploadingSection`
    - **Validates: Requirements 5.5**

- [x] 6. Xóa hàm `handleUploadImage` cũ và dọn dẹp
  - [x] 6.1 Xóa hàm `handleUploadImage` (single image) khỏi `EmployeeOrderDetailScreen`
    - Đảm bảo không còn reference nào đến hàm cũ
    - Xóa state `uploading` nếu còn sót
    - _Requirements: 1.2, 5.1_

- [x] 7. Final checkpoint — Đảm bảo tất cả tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks đánh dấu `*` là optional và có thể bỏ qua để implement MVP nhanh hơn
- Mỗi task tham chiếu requirements cụ thể để đảm bảo traceability
- Checkpoints đảm bảo validation từng bước
- Property tests dùng `fast-check` (đã có trong devDependencies)
- Unit tests dùng Jest (test runner mặc định của React Native)
- File test integration: `src/screens/OrderDetail/__tests__/EmployeeOrderDetailScreen.test.tsx`
- File test utility: `src/utils/__tests__/imageUpload.test.ts`

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1"] },
    { "id": 1, "tasks": ["1.2", "3.1"] },
    { "id": 2, "tasks": ["3.2", "3.3"] },
    { "id": 3, "tasks": ["3.4"] },
    { "id": 4, "tasks": ["3.5"] },
    { "id": 5, "tasks": ["3.6", "3.7", "3.8", "3.9"] },
    { "id": 6, "tasks": ["5.1", "5.2"] },
    { "id": 7, "tasks": ["5.3", "5.4", "6.1"] }
  ]
}
```
