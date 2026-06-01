# Requirements Document

## Introduction

Tài liệu này định nghĩa các yêu cầu chức năng cho bộ test suite bao phủ toàn bộ API services trong app React Native TNAuto. Mục tiêu là đảm bảo tất cả API calls, transformations, và error handling hoạt động đúng thông qua unit tests, integration tests, và property-based tests — tất cả chạy offline với Jest.

## Requirements

### Requirement 1: Unit Tests cho transformResponse Functions

**User Story:** Là developer, tôi muốn có unit tests cho tất cả `transformResponse` functions trong các API slices, để đảm bảo data normalization hoạt động đúng trước khi đến Redux store.

#### Acceptance Criteria

1.1. WHEN `transformResponse` nhận response với `success: true` và `data` hợp lệ THEN phải trả về normalized data đúng TypeScript interface tương ứng.

1.2. WHEN `transformResponse` nhận response với `success: false` THEN phải throw Error với message lấy từ `response.error` hoặc `response.message`.

1.3. WHEN `loginCustomer` transformResponse nhận response thành công THEN phải trả về response nguyên vẹn bao gồm `customer`, `customer_id`, và `linked_garages`.

1.4. WHEN `getCustomerVehicles` transformResponse nhận response thành công THEN phải trả về object có đủ pagination fields: `total`, `page`, `limit`, `totalPages`, `hasNextPage`.

1.5. WHEN `getCustomerVehicles` transformResponse nhận response với `success: false` THEN phải trả về `{ success: false, data: [], count: 0, total: 0, page: 1, limit: 20, totalPages: 0, hasNextPage: false }`.

1.6. WHEN `getCustomerDriverLicense` transformResponse nhận response với `success: false` THEN phải trả về `null` (không throw).

1.7. WHEN `getCustomerDriverLicense` transformResponse nhận response thành công THEN phải normalize các fields: `license_number = license_no`, `issued_date = registered_at`, `expiry_date = expires_at`.

---

### Requirement 2: Unit Tests cho Pure Utility Functions

**User Story:** Là developer, tôi muốn có unit tests cho các pure utility functions như `parseDate`, `getExpiryMeta`, và `normalizeBoolean`, để đảm bảo logic tính toán ngày hết hạn và normalization hoạt động đúng.

#### Acceptance Criteria

2.1. WHEN `parseDate` nhận `null` hoặc `undefined` THEN phải trả về `null`.

2.2. WHEN `parseDate` nhận string không phải date hợp lệ THEN phải trả về `null`.

2.3. WHEN `parseDate` nhận ISO date string hợp lệ THEN phải trả về `Date` object với `getTime()` không phải NaN.

2.4. WHEN `getExpiryMeta` nhận `null` hoặc `undefined` THEN phải trả về `{ state: 'missing', label: 'Chưa cập nhật', daysLabel: '' }`.

2.5. WHEN `getExpiryMeta` nhận date đã qua THEN phải trả về `{ state: 'expired', label: 'Hết hạn' }` với `daysLabel` chứa số ngày dương.

2.6. WHEN `getExpiryMeta` nhận date chưa qua THEN phải trả về `{ state: 'valid', label: 'Còn hạn' }` với `daysLabel` chứa số ngày dương.

2.7. WHEN `normalizeBoolean` nhận `true`, `1`, `'1'`, hoặc `'true'` THEN phải trả về `true`.

2.8. WHEN `normalizeBoolean` nhận `false`, `0`, `'0'`, hoặc `'false'` THEN phải trả về `false`.

2.9. WHEN `normalizeBoolean` nhận bất kỳ giá trị nào khác THEN phải trả về `undefined`.

---

### Requirement 3: Integration Tests cho Auth API

**User Story:** Là developer, tôi muốn có integration tests cho `authApi`, để đảm bảo các flows đăng nhập, resolve garage, và check phone hoạt động đúng với mock responses.

#### Acceptance Criteria

3.1. WHEN `resolveGarageByCode` transformResponse nhận response với `success: true` và `data` THEN phải trả về `GarageSummary` object.

3.2. WHEN `resolveGarageByCode` transformResponse nhận response với `success: false` THEN phải throw Error.

3.3. WHEN `getPublicGarages` transformResponse nhận array trực tiếp (không có wrapper) THEN phải trả về array đó.

3.4. WHEN `getPublicGarages` transformResponse nhận response với `success: true` và `data` array THEN phải trả về `data` array.

3.5. WHEN `addCustomerGarage` transformResponse nhận response với `success: false` THEN phải throw Error.

3.6. WHEN `addCustomerGarage` transformResponse nhận response thành công THEN phải trả về garage từ `response.data` hoặc `response.garage`.

---

### Requirement 4: Integration Tests cho Customer API

**User Story:** Là developer, tôi muốn có integration tests cho `customerApi`, để đảm bảo các operations liên quan đến customer profile, orders, và driver license hoạt động đúng.

#### Acceptance Criteria

4.1. WHEN `loginCustomer` nhận response với `success: false` THEN phải throw Error.

4.2. WHEN `registerCustomer` nhận response với `success: false` THEN phải throw Error.

4.3. WHEN `getCustomerOrders` transformResponse nhận response thành công THEN phải trả về object có `data` array, `count`, và optional `customer`.

4.4. WHEN `getOrderDetails` transformResponse nhận response thành công THEN phải trả về order với `images` là array (default `[]` nếu không có).

4.5. WHEN `createOrder` transformResponse nhận response với `success: false` THEN phải throw Error.

4.6. WHEN `updateProfile` transformResponse nhận response với `success: false` THEN phải throw Error.

4.7. WHEN `deleteAccount` transformResponse nhận response thành công THEN phải trả về object có `deleted_data` với các count fields.

4.8. WHEN `getUiVisibility` transformResponse nhận response không phải object THEN phải trả về `null`.

---

### Requirement 5: Integration Tests cho Vehicle API

**User Story:** Là developer, tôi muốn có integration tests cho `vehicleApi`, để đảm bảo CRUD operations và search cho xe hoạt động đúng.

#### Acceptance Criteria

5.1. WHEN `getCustomerVehicles` nhận response với `data` array THEN phải trả về tất cả vehicles trong array.

5.2. WHEN `getCustomerVehicles` nhận response rỗng (`data: []`) THEN phải trả về `data: []` với `count: 0`.

5.3. WHEN `getVehicleById` transformResponse nhận response THEN phải preserve `garage` field (kể cả khi `null`).

5.4. WHEN `updateVehicle` transformResponse nhận response THEN phải preserve `garage` field.

5.5. WHEN `searchVehiclesByPlate` nhận response với `success: false` THEN phải trả về empty response với pagination defaults.

5.6. WHEN `createVehicle` nhận response với `success: false` THEN phải throw Error.

---

### Requirement 6: Integration Tests cho Notification API

**User Story:** Là developer, tôi muốn có integration tests cho `notificationApi`, để đảm bảo notification normalization và scope routing hoạt động đúng.

#### Acceptance Criteria

6.1. WHEN `getNotifications` transformResponse nhận notification với `is_read: 1` THEN phải set `read: true`.

6.2. WHEN `getNotifications` transformResponse nhận notification với `is_read: 0` THEN phải set `read: false`.

6.3. WHEN `getNotifications` transformResponse nhận notification với `is_read: true` (boolean) THEN phải set `read: true` và `is_read: 1`.

6.4. WHEN `getUnreadCount` transformResponse nhận response với `data.unread_count` THEN phải trả về số đó.

6.5. WHEN `getUnreadCount` transformResponse nhận response với `unread_count` ở root level THEN phải trả về số đó.

6.6. WHEN `getUnreadCount` transformResponse nhận response không có unread_count THEN phải trả về `0`.

6.7. WHEN notification có `ref_type: 'order'` và `ref_id` THEN `order_id` phải được set từ `ref_id`.

6.8. WHEN notification có `metadata.order_id` THEN `order_id` phải được set từ `metadata.order_id`.

---

### Requirement 7: Integration Tests cho Warranty API

**User Story:** Là developer, tôi muốn có integration tests cho `warrantyApi`, để đảm bảo warranty CRUD và completeServiceOrder hoạt động đúng.

#### Acceptance Criteria

7.1. WHEN `getWarranties` transformResponse nhận response với `success: false` THEN phải throw Error.

7.2. WHEN `getWarranties` transformResponse nhận response với `data: null` THEN phải trả về `[]`.

7.3. WHEN `createWarranty` transformResponse nhận response với `success: false` THEN phải throw Error.

7.4. WHEN `completeServiceOrder` transformResponse nhận response thành công THEN phải trả về object có `warranty_id`.

7.5. WHEN `updateWarranty` transformResponse nhận response với `success: false` THEN phải throw Error.

---

### Requirement 8: Integration Tests cho Image API

**User Story:** Là developer, tôi muốn có integration tests cho `imageApi`, để đảm bảo upload và management của service order images hoạt động đúng.

#### Acceptance Criteria

8.1. WHEN `uploadSingleImage` nhận response với `success: true` THEN phải trả về object có `url` và `filename`.

8.2. WHEN `uploadMultipleImages` nhận response với `success: true` THEN phải trả về object có `files` array và `count`.

8.3. WHEN `getServiceOrderImages` nhận response với `success: true` THEN phải trả về `GetServiceOrderImagesResponse` với `data` array.

---

### Requirement 9: Property-Based Tests

**User Story:** Là developer, tôi muốn có property-based tests cho các pure functions, để đảm bảo các invariants được giữ vững với mọi input hợp lệ.

#### Acceptance Criteria

9.1. FOR ALL string inputs: `parseDate(s)` phải trả về `null` hoặc valid `Date` — không bao giờ throw exception.

9.2. FOR ALL date inputs: `parseDate(date.toISOString())` phải trả về `Date` với `getTime()` không phải NaN.

9.3. FOR ALL inputs: `getExpiryMeta(input).state` phải thuộc tập `{ 'missing', 'valid', 'expired' }`.

9.4. FOR ALL null/undefined/invalid-date inputs: `getExpiryMeta(input).daysLabel` phải là empty string khi `state = 'missing'`.

9.5. FOR ALL inputs: `normalizeBoolean(input)` phải trả về `true`, `false`, hoặc `undefined` — không bao giờ throw.

9.6. FOR ALL valid vehicle responses: `transformVehiclesResponse(response)` phải có đủ pagination fields.

9.7. FOR ALL responses với `success: false`: `transformVehiclesResponse(response).data` phải là empty array.

---

### Requirement 10: Error Handling Tests

**User Story:** Là developer, tôi muốn có tests cho tất cả error scenarios, để đảm bảo app xử lý lỗi đúng cách và không crash.

#### Acceptance Criteria

10.1. WHEN API response có `status: 401` THEN retry logic phải gọi `retry.fail()` và không retry.

10.2. WHEN API response có `status: 429` THEN error phải được propagate với status `429`.

10.3. WHEN API response có `status: 'TIMEOUT_ERROR'` THEN error phải được propagate với status `'TIMEOUT_ERROR'`.

10.4. WHEN API response có `status: 'FETCH_ERROR'` THEN error phải được propagate với status `'FETCH_ERROR'`.

10.5. WHEN `transformResponse` throw Error THEN RTK Query phải convert thành error state (không crash app).

10.6. WHEN response thiếu required fields THEN `transformResponse` phải throw Error với descriptive message.

---

### Requirement 11: Test Infrastructure

**User Story:** Là developer, tôi muốn có test infrastructure tốt (factories, helpers), để viết tests nhanh hơn và dễ maintain hơn.

#### Acceptance Criteria

11.1. Mock factories phải tồn tại cho tất cả core types: `Customer`, `Vehicle`, `ServiceOrder`, `Warranty`, `Notification`, `GarageSummary`.

11.2. Mỗi factory phải có default values hợp lệ cho tất cả required fields.

11.3. Mỗi factory phải hỗ trợ `overrides` parameter để customize từng field.

11.4. Tất cả tests phải chạy được với lệnh `npx jest --testPathPattern="src/services/__tests__" --passWithNoTests` mà không cần network.

11.5. Test files phải được đặt trong `src/services/__tests__/` theo convention hiện tại của project.

11.6. Mỗi test file phải có `describe` block rõ ràng theo domain (auth, customer, vehicle, v.v.).

## Glossary

- **transformResponse**: Hàm trong RTK Query endpoint definition dùng để normalize raw API response trước khi lưu vào Redux cache.
- **pure function**: Hàm không có side effects, cùng input luôn cho cùng output.
- **mock response**: Dữ liệu giả lập thay thế HTTP response thật trong tests.
- **property-based test**: Test kiểm tra invariants với nhiều inputs được generate tự động bởi fast-check.
- **RTK Query**: Redux Toolkit Query — thư viện quản lý API calls và caching trong Redux.
- **GarageSummary**: Type đại diện cho thông tin tóm tắt của một garage (id, code, name, address).
- **linked_garages**: Danh sách garages mà customer đã liên kết, trả về sau khi đăng nhập.
- **scope routing**: Logic trong notificationApi để chọn đúng endpoint dựa trên `user_type` (customer/employee/dealer).
