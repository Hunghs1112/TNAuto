# Implementation Plan: Backend API Migration

## Overview

Migrate React Native app (TNAuto) để tương thích với backend đã tái cấu trúc sang domain-driven 3-layer architecture. Thực hiện theo thứ tự bottom-up: Types → Utils → Services → Screens để tránh TypeScript errors trong quá trình migration.

## Tasks

- [x] 1. Cập nhật TypeScript Types (`src/types/api.types.ts`)
  - Thêm type `ApiErrorCode` là string union của 8 error codes đã biết
  - Thêm interface `ApiErrorResponse` với fields `error_code?`, `message?`, `error?`
  - Thêm interface `PaginationMeta` với fields `total`, `page`, `limit`, `totalPages`, `hasNextPage`
  - Cập nhật `PaginatedResponse<T>` để thêm optional field `meta?: PaginationMeta`
  - Thêm optional field `garage` vào interface `Vehicle`
  - Thêm optional field `garage` vào interface `ServiceOrder`
  - Đảm bảo `is_super_garage` trong `LoginEmployeeResponse.garage` không còn `number` type
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

- [x] 2. Cập nhật Error Handler (`src/utils/errorHandler.ts`)
  - [x] 2.1 Implement hàm `mapErrorCodeToMessage(errorCode)` map từng `ApiErrorCode` sang Vietnamese message theo bảng trong design
    - Các code có server message fallback: `NOT_FOUND`, `VALIDATION_ERROR`, `CONFLICT`, `BAD_REQUEST`
    - Các code có fixed message: `UNAUTHORIZED`, `FORBIDDEN`, `GARAGE_CONTEXT_REQUIRED`, `INTERNAL_ERROR`
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9_

  - [x] 2.2 Cập nhật hàm `getErrorMessage` để ưu tiên đọc `error.data.error_code` trước HTTP status và message
    - Implement priority chain: `error_code` → HTTP status → `error.data.message` → `error.message` → default
    - Unknown/missing `error_code` fallback về server message hoặc "Có lỗi xảy ra. Vui lòng thử lại"
    - _Requirements: 1.1, 1.10, 1.11_

  - [x] 2.3 Cập nhật `handleApiError` để trả về `{ message, shouldLogout: true }` khi `error_code === 'UNAUTHORIZED'` hoặc `status === 401`
    - _Requirements: 1.3_

  - [ ]* 2.4 Viết property test cho Error Handler (Property 1: error_code priority)
    - **Property 1: Error code takes priority over HTTP status**
    - **Validates: Requirements 1.11**
    - Dùng `fast-check`, tag: `Feature: backend-api-migration, Property 1`
    - File: `src/utils/__tests__/errorHandler.test.ts`

  - [ ]* 2.5 Viết property test cho Error Handler (Property 2: unknown error codes fallback)
    - **Property 2: Unknown error codes fall back gracefully**
    - **Validates: Requirements 1.10**
    - Dùng `fast-check`, tag: `Feature: backend-api-migration, Property 2`
    - File: `src/utils/__tests__/errorHandler.test.ts`

  - [ ]* 2.6 Viết unit tests cho từng error_code mapping cụ thể
    - 8 test cases tương ứng với 8 error codes (Requirements 1.2 → 1.9)
    - File: `src/utils/__tests__/errorHandler.test.ts`

- [x] 3. Tạo Pagination Helper (`src/utils/paginationHelpers.ts`)
  - [x] 3.1 Tạo file mới `src/utils/paginationHelpers.ts` với hàm `extractPaginationMeta(response)`
    - Ưu tiên đọc từ `response.meta.*` khi `meta` object tồn tại
    - Fallback về flat fields (`response.total`, `response.page`, v.v.) khi không có `meta`
    - Không bao giờ trả về `undefined` cho bất kỳ pagination field nào
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [ ]* 3.2 Viết property test cho Pagination Helper (Property 4: meta priority with fallback)
    - **Property 4: Pagination meta takes priority with fallback**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6**
    - Dùng `fast-check`, tag: `Feature: backend-api-migration, Property 4`
    - File: `src/utils/__tests__/paginationHelpers.test.ts`

  - [ ]* 3.3 Viết unit tests cho `extractPaginationMeta`
    - Test case: response có `meta` object đầy đủ
    - Test case: response chỉ có flat fields
    - Test case: response không có cả hai (trả về defaults)
    - Test case: `hasNextPage=false` → đảm bảo trả về `false` không phải `undefined`
    - _Requirements: 4.6, 4.8_

- [x] 4. Tạo `isSuperGarage` utility và cập nhật các vị trí kiểm tra `is_super_garage`
  - [x] 4.1 Tạo hàm `isSuperGarage(value: unknown): boolean` trả về `value === true` (strict boolean equality)
    - Có thể đặt trong `src/utils/garageHelpers.ts` hoặc file phù hợp
    - _Requirements: 2.1, 2.3, 2.4_

  - [ ]* 4.2 Viết property test cho `isSuperGarage` (Property 3: strict boolean equality)
    - **Property 3: `is_super_garage` boolean strict equality**
    - **Validates: Requirements 2.1, 2.3, 2.4**
    - Dùng `fast-check`, tag: `Feature: backend-api-migration, Property 3`
    - File: `src/utils/__tests__/isSuperGarage.test.ts`

  - [x] 4.3 Tìm và cập nhật tất cả các vị trí trong codebase đang so sánh `is_super_garage` bằng `=== 1`, `!= 0`, hoặc truthy check sang dùng hàm `isSuperGarage()` hoặc `=== true`
    - _Requirements: 2.5_

- [x] 5. Checkpoint — Đảm bảo tất cả tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Cập nhật Base API để truyền `x-garage-id` header (`src/services/baseApi.ts`)
  - Trong `prepareHeaders`, đọc `garageContext.garageId` từ Redux state
  - Set `x-garage-id` header chỉ cho các endpoints trong allowlist: `createServiceOrder`, `getServiceOrderImages`, `getCustomerVehiclesAdmin`, `searchVehicles`, `updateVehicle`, `createVehicleForGarage`, `updateVehicleForGarage`
  - Không set header cho các endpoints không trong allowlist
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.9_

- [x] 7. Cập nhật Vehicle API (`src/services/vehicleApi.ts`)
  - [x] 7.1 Cập nhật `transformResponse` của `getVehicleById` để preserve `garage` object từ response
    - Extract vehicle từ `response.data || response`, giữ nguyên `garage` field
    - _Requirements: 6.1_

  - [x] 7.2 Cập nhật `transformResponse` của `updateVehicle` để preserve `garage` object từ response
    - _Requirements: 6.2_

  - [x] 7.3 Cập nhật các list endpoints trong `vehicleApi.ts` để dùng `extractPaginationMeta` từ pagination helper
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]* 7.4 Viết property test cho Vehicle transformResponse (Property 5: garage preservation)
    - **Property 5: Vehicle response preserves garage object**
    - **Validates: Requirements 6.1, 6.2**
    - Dùng `fast-check`, tag: `Feature: backend-api-migration, Property 5`
    - File: `src/services/__tests__/vehicleApi.test.ts`

- [x] 8. Cập nhật Employee API (`src/services/employeeApi.ts`)
  - [x] 8.1 Cập nhật `transformResponse` của `updateEmployee` mutation để đọc từ `response.data` với fallback về response root
    - _Requirements: 9.1, 9.2, 9.3_

  - [ ]* 8.2 Viết property test cho Employee transformResponse (Property 7: reads from response.data)
    - **Property 7: Employee update reads from `response.data`**
    - **Validates: Requirements 9.1, 9.2**
    - Dùng `fast-check`, tag: `Feature: backend-api-migration, Property 7`
    - File: `src/services/__tests__/employeeApi.test.ts`

- [x] 9. Cập nhật Admin Garage API (`src/services/adminGarageApi.ts`)
  - Cập nhật `transformResponse` của `createGarageManager` mutation để trả về full garage manager object từ response
  - Cập nhật `transformResponse` của `updateGarageManager` mutation để trả về full garage manager object từ response
  - _Requirements: 8.1, 8.2, 8.3_

- [x] 10. Cập nhật Manager API / Service Order API (`src/services/managerApi.ts` hoặc tương đương)
  - [x] 10.1 Cập nhật `transformResponse` của `getServiceOrderById` để preserve `garage` object từ response
    - _Requirements: 7.1_

  - [ ]* 10.2 Viết property test cho Service Order transformResponse (Property 6: garage preservation)
    - **Property 6: Service order response preserves garage object**
    - **Validates: Requirements 7.1**
    - Dùng `fast-check`, tag: `Feature: backend-api-migration, Property 6`
    - File: `src/services/__tests__/managerApi.test.ts`

- [x] 11. Cập nhật các list endpoints dùng pagination
  - Tìm tất cả các API endpoints trong `src/services/` đang đọc pagination fields trực tiếp từ response root (`response.total`, `response.page`, v.v.)
  - Cập nhật để dùng `extractPaginationMeta(response)` từ pagination helper
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [x] 12. Checkpoint — Đảm bảo tất cả tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. Cập nhật Customer Delete UI (`src/screens/Customers/CustomerDetailScreen.tsx`)
  - Cập nhật text trong dialog xác nhận xóa thành "Xóa khách hàng khỏi gara này? Tài khoản khách hàng vẫn được giữ nguyên trên hệ thống."
  - Cập nhật thông báo sau khi xóa thành công thành "Đã xóa khách hàng khỏi gara"
  - _Requirements: 5.1, 5.3, 5.4_

- [x] 14. Cập nhật Vehicle Detail Screen để hiển thị garage name
  - Tìm màn hình chi tiết xe (VehicleDetailScreen hoặc tương đương)
  - Nếu có UI phù hợp, hiển thị `vehicle.garage?.name` khi `garage` object có trong response
  - _Requirements: 6.4_

- [x] 15. Cập nhật Service Order Detail Screen để hiển thị garage name
  - Tìm màn hình chi tiết đơn hàng (ServiceOrderDetailScreen hoặc tương đương)
  - Nếu có UI phù hợp, hiển thị `serviceOrder.garage?.name` khi `garage` object có trong response
  - _Requirements: 7.3_

- [x] 16. Kiểm tra TypeScript compilation
  - Chạy `tsc --noEmit` để đảm bảo không còn TypeScript compile errors trong `src/services/` và `src/screens/`
  - Fix bất kỳ type errors nào phát sinh từ các thay đổi trên
  - _Requirements: 10.7_

- [x] 17. Final Checkpoint — Đảm bảo tất cả tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks đánh dấu `*` là optional và có thể bỏ qua để triển khai MVP nhanh hơn
- Thứ tự thực hiện: Types (1) → Utils (2, 3, 4) → Services (6–11) → Screens (13–15) → Verification (16)
- Property tests dùng `fast-check` library — cần cài nếu chưa có: `npm install --save-dev fast-check`
- Tất cả URL paths giữ nguyên 100% — không có breaking change về endpoint
- `x-garage-id` header dùng allowlist approach để tránh side effects không mong muốn
- `UNAUTHORIZED` error cần caller kiểm tra `shouldLogout` flag và dispatch `logout()` action
