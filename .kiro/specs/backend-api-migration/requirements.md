# Requirements Document

## Introduction

Backend đã được tái cấu trúc sang domain-driven 3-layer architecture. Tất cả URL paths giữ nguyên 100% — không có breaking change về endpoint. Tuy nhiên, một số thay đổi về response shape, error format, type và behavior cần được cập nhật trong React Native mobile app để đảm bảo tương thích hoàn toàn.

Spec này bao gồm toàn bộ các thay đổi cần thực hiện trong app, được ưu tiên theo mức độ ảnh hưởng đến người dùng.

## Glossary

- **App**: React Native mobile application (TNAuto)
- **API_Client**: Lớp RTK Query trong `src/services/` chịu trách nhiệm gọi API
- **Error_Handler**: Module xử lý lỗi API, hiển thị thông báo cho người dùng
- **Garage_Context**: Thông tin garage đang hoạt động, lưu trong Redux slice `garageContextSlice`
- **Meta_Object**: Object `meta` mới trong response của list endpoints, chứa `total`, `page`, `limit`, `totalPages`, `hasNextPage`
- **Pagination_Fields**: Các field phân trang (`total`, `page`, `limit`, `totalPages`, `hasNextPage`) có thể nằm ở flat level hoặc trong `meta` object
- **Garage_Object**: Object garage được trả về trong response của vehicle và service order endpoints
- **error_code**: Field mới trong error response của backend, dạng string enum
- **is_super_garage**: Field boolean trong garage object, trước đây là number (0/1), nay là boolean (true/false)
- **x-garage-id**: HTTP header truyền garage context cho các endpoint yêu cầu
- **Backward_Compatible_Read**: Đọc giá trị từ `meta` object trước, fallback về flat field nếu không có

---

## Requirements

### Requirement 1: Cập nhật Error Handler đọc `error_code`

**User Story:** As a người dùng app, I want nhận được thông báo lỗi rõ ràng và phù hợp với từng loại lỗi, so that tôi biết cần làm gì tiếp theo khi gặp sự cố.

#### Acceptance Criteria

1. WHEN API trả về response lỗi có field `error_code`, THE Error_Handler SHALL đọc `error_code` từ `error.response.data.error_code` để xác định loại lỗi.

2. WHEN `error_code` là `NOT_FOUND`, THE Error_Handler SHALL hiển thị thông báo "Không tìm thấy" hoặc message từ server nếu có.

3. WHEN `error_code` là `UNAUTHORIZED`, THE Error_Handler SHALL hiển thị thông báo "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại" và điều hướng người dùng về màn hình đăng nhập.

4. WHEN `error_code` là `FORBIDDEN`, THE Error_Handler SHALL hiển thị thông báo "Bạn không có quyền thực hiện thao tác này".

5. WHEN `error_code` là `GARAGE_CONTEXT_REQUIRED`, THE Error_Handler SHALL hiển thị thông báo "Vui lòng chọn gara trước khi thực hiện thao tác này".

6. WHEN `error_code` là `VALIDATION_ERROR`, THE Error_Handler SHALL hiển thị thông báo lỗi validation từ server hoặc "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại".

7. WHEN `error_code` là `CONFLICT`, THE Error_Handler SHALL hiển thị thông báo từ server hoặc "Dữ liệu đã tồn tại. Vui lòng kiểm tra lại".

8. WHEN `error_code` là `INTERNAL_ERROR`, THE Error_Handler SHALL hiển thị thông báo "Lỗi hệ thống. Vui lòng thử lại sau".

9. WHEN `error_code` là `BAD_REQUEST`, THE Error_Handler SHALL hiển thị thông báo từ server hoặc "Yêu cầu không hợp lệ".

10. WHEN API trả về response lỗi không có `error_code` hoặc `error_code` không thuộc danh sách đã biết, THE Error_Handler SHALL hiển thị message từ server hoặc thông báo mặc định "Có lỗi xảy ra. Vui lòng thử lại".

11. THE Error_Handler SHALL ưu tiên đọc `error_code` trước khi đọc `error.message` hoặc `error.response.data.message` để xác định thông báo hiển thị.

---

### Requirement 2: Cập nhật kiểm tra `is_super_garage` sang boolean

**User Story:** As a garage manager, I want app nhận diện đúng trạng thái super garage của tôi, so that các tính năng dành riêng cho super garage hoạt động chính xác.

#### Acceptance Criteria

1. WHEN App đọc field `is_super_garage` từ bất kỳ garage object nào trong response, THE App SHALL so sánh giá trị bằng `=== true` (strict boolean equality) thay vì `=== 1` hoặc truthy check.

2. THE App SHALL cập nhật TypeScript type của `is_super_garage` trong `LoginEmployeeResponse` và các interface liên quan từ `number | boolean` sang `boolean`.

3. WHEN `is_super_garage` là `false` hoặc `undefined`, THE App SHALL xử lý như garage thông thường (không phải super garage).

4. WHEN `is_super_garage` là `true`, THE App SHALL kích hoạt các tính năng và quyền hạn dành riêng cho super garage.

5. THE App SHALL tìm kiếm và cập nhật tất cả các vị trí trong codebase đang kiểm tra `is_super_garage` bằng so sánh số học (ví dụ: `=== 1`, `!= 0`) sang so sánh boolean.

---

### Requirement 3: Truyền Garage Context cho các endpoint yêu cầu

**User Story:** As a garage manager, I want các thao tác liên quan đến garage được thực hiện đúng trong ngữ cảnh garage của tôi, so that dữ liệu được phân tách chính xác theo từng garage.

#### Acceptance Criteria

1. WHEN App gọi `POST /api/web/service-orders`, THE API_Client SHALL đính kèm `x-garage-id` header với giá trị `garageId` từ Garage_Context hiện tại.

2. WHEN App gọi `GET /api/web/service-orders/:id/images`, THE API_Client SHALL đính kèm `x-garage-id` header với giá trị `garageId` từ Garage_Context hiện tại.

3. WHEN App gọi `GET /api/web/customers/:id/vehicles`, THE API_Client SHALL đính kèm `x-garage-id` header với giá trị `garageId` từ Garage_Context hiện tại.

4. WHEN App gọi `GET /api/web/vehicles/search`, THE API_Client SHALL đính kèm `x-garage-id` header với giá trị `garageId` từ Garage_Context hiện tại.

5. WHEN App gọi `PUT /api/web/vehicles/:id`, THE API_Client SHALL đính kèm `x-garage-id` header với giá trị `garageId` từ Garage_Context hiện tại.

6. WHEN App gọi `POST /api/app/garages/:garageCode/vehicles`, THE API_Client SHALL đính kèm `x-garage-id` header với giá trị `garageId` từ Garage_Context hiện tại.

7. WHEN App gọi `PUT /api/app/garages/:garageCode/vehicles/:id`, THE API_Client SHALL đính kèm `x-garage-id` header với giá trị `garageId` từ Garage_Context hiện tại.

8. WHEN Garage_Context không có `garageId` hợp lệ và App cố gọi một endpoint yêu cầu garage context, THE API_Client SHALL không gọi API và THE Error_Handler SHALL hiển thị thông báo "Vui lòng chọn gara trước khi thực hiện thao tác này".

9. THE API_Client SHALL đọc `garageId` từ Redux state `garageContext.garageId` để đính kèm vào header `x-garage-id`.

---

### Requirement 4: Migrate Pagination sang `meta` object

**User Story:** As a người dùng app, I want danh sách dữ liệu hiển thị đúng số trang và tổng số bản ghi, so that tôi có thể điều hướng phân trang chính xác.

#### Acceptance Criteria

1. WHEN API trả về response có `meta` object, THE API_Client SHALL đọc `total` từ `response.meta.total` thay vì `response.total` hoặc `response.pagination.totalItems`.

2. WHEN API trả về response có `meta` object, THE API_Client SHALL đọc `page` từ `response.meta.page` thay vì `response.page` hoặc `response.pagination.currentPage`.

3. WHEN API trả về response có `meta` object, THE API_Client SHALL đọc `limit` từ `response.meta.limit` thay vì `response.limit`.

4. WHEN API trả về response có `meta` object, THE API_Client SHALL đọc `totalPages` từ `response.meta.totalPages` thay vì `response.totalPages`.

5. WHEN API trả về response có `meta` object, THE API_Client SHALL đọc `hasNextPage` từ `response.meta.hasNextPage`.

6. WHILE `meta` object chưa có trong response (backward compatibility), THE API_Client SHALL fallback về flat fields (`response.total`, `response.page`, v.v.) để đảm bảo không bị lỗi.

7. THE App SHALL cập nhật TypeScript interface `PaginatedResponse` trong `src/types/api.types.ts` để bao gồm optional `meta` object với các fields `total`, `page`, `limit`, `totalPages`, `hasNextPage`.

8. WHEN `meta.hasNextPage` là `false` hoặc không có, THE App SHALL ẩn nút "Tải thêm" hoặc vô hiệu hóa infinite scroll.

---

### Requirement 5: Cập nhật hành vi Customer Delete

**User Story:** As a garage manager, I want xóa khách hàng khỏi danh sách garage của tôi mà không ảnh hưởng đến tài khoản khách hàng trên hệ thống, so that khách hàng vẫn có thể sử dụng app với các garage khác.

#### Acceptance Criteria

1. WHEN garage manager thực hiện `DELETE /api/web/customers/:id`, THE App SHALL hiển thị dialog xác nhận với nội dung "Xóa khách hàng khỏi gara này? Tài khoản khách hàng vẫn được giữ nguyên trên hệ thống."

2. WHEN người dùng xác nhận xóa, THE API_Client SHALL gọi `DELETE /api/web/customers/:id` và xử lý response thành công.

3. WHEN xóa thành công, THE App SHALL hiển thị thông báo "Đã xóa khách hàng khỏi gara" (không phải "Đã xóa khách hàng") và điều hướng về danh sách khách hàng.

4. THE App SHALL cập nhật text trong dialog xác nhận xóa tại `CustomerDetailScreen` để phản ánh đúng hành vi mới (chỉ xóa liên kết, không xóa tài khoản).

---

### Requirement 6: Cập nhật Vehicle Endpoints với Garage Object trong Response

**User Story:** As a garage manager, I want xem thông tin garage liên kết khi xem chi tiết xe, so that tôi biết xe này thuộc garage nào.

#### Acceptance Criteria

1. WHEN App nhận response từ `GET /api/web/vehicles/:id`, THE API_Client SHALL đọc và lưu `garage` object từ response nếu có.

2. WHEN App nhận response từ `PUT /api/web/vehicles/:id`, THE API_Client SHALL đọc và lưu `garage` object từ response nếu có.

3. THE App SHALL cập nhật TypeScript type `Vehicle` trong `src/types/api.types.ts` để bao gồm optional field `garage` với type phù hợp (id, code, name).

4. WHEN `garage` object có trong vehicle response, THE App SHALL hiển thị tên garage trong màn hình chi tiết xe nếu có UI phù hợp.

---

### Requirement 7: Cập nhật Service Order Detail với Garage Object

**User Story:** As a người dùng app, I want xem thông tin garage khi xem chi tiết đơn dịch vụ, so that tôi biết đơn hàng này được xử lý tại garage nào.

#### Acceptance Criteria

1. WHEN App nhận response từ `GET /api/web/service-orders/:id`, THE API_Client SHALL đọc và lưu `garage` object từ response nếu có.

2. THE App SHALL cập nhật TypeScript type `ServiceOrder` trong `src/types/api.types.ts` để bao gồm optional field `garage` với type phù hợp (id, code, name, address).

3. WHEN `garage` object có trong service order response, THE App SHALL hiển thị tên garage trong màn hình chi tiết đơn hàng nếu có UI phù hợp.

---

### Requirement 8: Cập nhật Garage Manager Mutations trả về Full Object

**User Story:** As a garage admin, I want thông tin garage manager được cập nhật ngay lập tức sau khi tạo hoặc chỉnh sửa, so that tôi không cần reload trang để thấy thay đổi.

#### Acceptance Criteria

1. WHEN App gọi `POST /api/web/garage-managers` và nhận response thành công, THE API_Client SHALL đọc full garage manager object từ response thay vì chỉ đọc ID hoặc message.

2. WHEN App gọi `PUT /api/web/garage-managers/:id` và nhận response thành công, THE API_Client SHALL đọc full garage manager object từ response thay vì chỉ đọc ID hoặc message.

3. WHEN tạo hoặc cập nhật garage manager thành công, THE App SHALL cập nhật local state với dữ liệu đầy đủ từ response mà không cần gọi thêm GET request.

---

### Requirement 9: Cập nhật Employee Update trả về Full Object với `data` field

**User Story:** As a garage manager, I want thông tin nhân viên được cập nhật ngay lập tức sau khi chỉnh sửa, so that tôi thấy thay đổi mà không cần reload.

#### Acceptance Criteria

1. WHEN App gọi `PUT /api/web/employees/:id` và nhận response thành công, THE API_Client SHALL đọc employee object từ `response.data` field.

2. THE App SHALL cập nhật `transformResponse` của `updateEmployee` mutation trong `employeeApi` để extract data từ `response.data` thay vì đọc trực tiếp từ response root.

3. WHEN cập nhật employee thành công, THE App SHALL cập nhật local state với dữ liệu đầy đủ từ `response.data`.

---

### Requirement 10: Cập nhật TypeScript Types

**User Story:** As a developer, I want TypeScript types phản ánh đúng cấu trúc response mới của backend, so that IDE có thể phát hiện lỗi type sớm trong quá trình phát triển.

#### Acceptance Criteria

1. THE App SHALL cập nhật interface `PaginatedResponse` trong `src/types/api.types.ts` để thêm optional `meta` object với fields: `total: number`, `page: number`, `limit: number`, `totalPages: number`, `hasNextPage: boolean`.

2. THE App SHALL cập nhật field `is_super_garage` trong `LoginEmployeeResponse.garage` từ `boolean | undefined` sang `boolean | undefined` (đảm bảo không còn `number` type).

3. THE App SHALL thêm optional field `garage` vào interface `Vehicle` với type `{ id?: string | number; code?: string; name?: string } | null`.

4. THE App SHALL thêm optional field `garage` vào interface `ServiceOrder` với type `{ id?: string | number; code?: string; name?: string; address?: string | null } | null`.

5. THE App SHALL thêm type `ApiErrorCode` là string union của tất cả error codes đã biết: `'BAD_REQUEST' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'CONFLICT' | 'VALIDATION_ERROR' | 'INTERNAL_ERROR' | 'GARAGE_CONTEXT_REQUIRED'`.

6. THE App SHALL thêm interface `ApiErrorResponse` với fields `error_code?: ApiErrorCode`, `message?: string`, `error?: string` vào `src/types/api.types.ts`.

7. FOR ALL TypeScript files trong `src/services/` và `src/screens/`, THE App SHALL không có TypeScript compile errors sau khi cập nhật types.
