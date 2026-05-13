# Design Document: Backend API Migration

## Overview

Backend TNAuto đã được tái cấu trúc sang domain-driven 3-layer architecture. URL paths giữ nguyên 100%, nhưng một số thay đổi về response shape, error format, type và behavior cần được cập nhật trong React Native mobile app.

Spec này thiết kế các thay đổi cần thực hiện trong app, tập trung vào:
1. Cập nhật Error Handler để đọc `error_code` mới
2. Migration `is_super_garage` sang boolean
3. Truyền `x-garage-id` header cho 7 endpoints
4. Migrate pagination sang `meta` object (backward-compatible)
5. Cập nhật Customer Delete behavior
6. Thêm `garage` object vào Vehicle và ServiceOrder types
7. Cập nhật Garage Manager mutations để đọc full object
8. Cập nhật Employee Update để đọc từ `response.data`
9. Cập nhật toàn bộ TypeScript types

Tất cả thay đổi là **additive hoặc behavioral** — không có breaking change về URL, không cần migration data.

---

## Architecture

### Layered Change Strategy

```
┌─────────────────────────────────────────────────────────┐
│                    UI Layer (Screens)                    │
│  - CustomerDetailScreen: dialog text, success message   │
│  - VehicleDetailScreen: hiển thị garage name            │
│  - ServiceOrderDetailScreen: hiển thị garage name       │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│               Service Layer (RTK Query APIs)             │
│  - baseApi.ts: thêm x-garage-id header logic            │
│  - vehicleApi.ts: garage object trong response          │
│  - employeeApi.ts: transformResponse từ response.data   │
│  - adminGarageApi.ts: garage manager full object        │
│  - managerApi.ts: service order garage object           │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│              Utility Layer (Utils)                       │
│  - errorHandler.ts: đọc error_code, map to messages     │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│              Type Layer (Types)                          │
│  - api.types.ts: PaginatedResponse, Vehicle,            │
│    ServiceOrder, ApiErrorCode, ApiErrorResponse         │
└─────────────────────────────────────────────────────────┘
```

### Dependency Flow

Thay đổi được thực hiện từ dưới lên (bottom-up):
1. **Types** → cập nhật trước để TypeScript không báo lỗi
2. **Utils** → cập nhật `errorHandler.ts`
3. **Services** → cập nhật `baseApi.ts` và các API slices
4. **Screens** → cập nhật UI text và display logic

---

## Components and Interfaces

### 1. Error Handler (`src/utils/errorHandler.ts`)

**Hiện tại:** Chỉ đọc HTTP status code và `error.data.message`.

**Sau migration:** Đọc `error_code` từ `error.data.error_code` với priority cao hơn HTTP status.

```typescript
// Luồng xử lý mới
function getErrorMessage(error: ApiError): string {
  // 1. Ưu tiên đọc error_code
  const errorCode = error.data?.error_code;
  if (errorCode) {
    return mapErrorCodeToMessage(errorCode);
  }
  // 2. Fallback về HTTP status
  // 3. Fallback về server message
  // 4. Fallback về default message
}

function mapErrorCodeToMessage(errorCode: ApiErrorCode | string): string {
  // Map từng error_code sang Vietnamese message
}
```

**Error Code Mapping:**

| `error_code` | Message hiển thị |
|---|---|
| `NOT_FOUND` | "Không tìm thấy" (hoặc server message) |
| `UNAUTHORIZED` | "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại" |
| `FORBIDDEN` | "Bạn không có quyền thực hiện thao tác này" |
| `GARAGE_CONTEXT_REQUIRED` | "Vui lòng chọn gara trước khi thực hiện thao tác này" |
| `VALIDATION_ERROR` | Server message hoặc "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại" |
| `CONFLICT` | Server message hoặc "Dữ liệu đã tồn tại. Vui lòng kiểm tra lại" |
| `INTERNAL_ERROR` | "Lỗi hệ thống. Vui lòng thử lại sau" |
| `BAD_REQUEST` | Server message hoặc "Yêu cầu không hợp lệ" |
| Unknown / không có | Server message hoặc "Có lỗi xảy ra. Vui lòng thử lại" |

**Lưu ý:** `UNAUTHORIZED` cần trigger navigation về màn hình đăng nhập — caller vẫn chịu trách nhiệm navigation, `handleApiError` sẽ trả về signal để caller biết.

### 2. Base API (`src/services/baseApi.ts`)

**Hiện tại:** `prepareHeaders` không set `x-garage-id`.

**Sau migration:** Set `x-garage-id` header từ `garageContext.garageId` cho các endpoints yêu cầu.

```typescript
// Trong prepareHeaders
const garageId = (state as RootState)?.garageContext?.garageId;
const garageRequiredEndpoints = new Set([
  'createServiceOrder',
  'getServiceOrderImages',
  'getCustomerVehiclesAdmin',
  'searchVehicles',
  'updateVehicle',
  'createVehicleForGarage',
  'updateVehicleForGarage',
]);

if (garageId && garageRequiredEndpoints.has(endpoint)) {
  headers.set('x-garage-id', garageId);
}
```

**Thiết kế quyết định:** Dùng allowlist (whitelist) thay vì set header cho tất cả endpoints, để tránh gửi header không cần thiết và giảm rủi ro side effects.

### 3. Pagination Helper (`src/utils/paginationHelpers.ts` — file mới)

Tách logic đọc pagination ra utility function để tái sử dụng và dễ test:

```typescript
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
}

export function extractPaginationMeta(response: any): PaginationMeta {
  // Ưu tiên đọc từ meta object
  if (response?.meta) {
    return {
      total: response.meta.total ?? 0,
      page: response.meta.page ?? 1,
      limit: response.meta.limit ?? 20,
      totalPages: response.meta.totalPages ?? 0,
      hasNextPage: response.meta.hasNextPage ?? false,
    };
  }
  // Fallback về flat fields (backward compatibility)
  return {
    total: response?.total ?? response?.count ?? 0,
    page: response?.page ?? 1,
    limit: response?.limit ?? 20,
    totalPages: response?.totalPages ?? 0,
    hasNextPage: response?.hasNextPage ?? false,
  };
}
```

### 4. Vehicle API (`src/services/vehicleApi.ts`)

Cập nhật `transformResponse` của `getVehicleById` và `updateVehicle` để preserve `garage` object:

```typescript
transformResponse: (response: any) => {
  const vehicle = response.data || response;
  return {
    ...vehicle,
    garage: vehicle.garage ?? null,  // preserve garage object
  };
}
```

### 5. Employee API (`src/services/employeeApi.ts`)

Cập nhật `transformResponse` của `updateEmployee` mutation:

```typescript
// Trước
transformResponse: (response: any) => response

// Sau
transformResponse: (response: any) => {
  return response?.data ?? response;
}
```

### 6. Admin Garage API (`src/services/adminGarageApi.ts`)

Cập nhật `transformResponse` của `createGarageManager` và `updateGarageManager` mutations để trả về full object thay vì chỉ ID/message.

---

## Data Models

### `ApiErrorCode` (mới)

```typescript
export type ApiErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'VALIDATION_ERROR'
  | 'INTERNAL_ERROR'
  | 'GARAGE_CONTEXT_REQUIRED';
```

### `ApiErrorResponse` (mới)

```typescript
export interface ApiErrorResponse {
  error_code?: ApiErrorCode;
  message?: string;
  error?: string;
}
```

### `ApiError` (cập nhật trong `errorHandler.ts`)

```typescript
export interface ApiError {
  status?: number;
  data?: ApiErrorResponse;
  message?: string;
}
```

### `PaginatedResponse` (cập nhật)

```typescript
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  count: number;
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  hasNextPage?: boolean;
  meta?: PaginationMeta;  // mới — optional để backward compatible
}
```

### `Vehicle` (cập nhật)

```typescript
export interface Vehicle extends VehicleDocumentFields {
  // ... existing fields ...
  garage?: {
    id?: string | number;
    code?: string;
    name?: string;
  } | null;  // mới
}
```

### `ServiceOrder` (cập nhật)

```typescript
export interface ServiceOrder {
  // ... existing fields ...
  garage?: {
    id?: string | number;
    code?: string;
    name?: string;
    address?: string | null;
  } | null;  // mới
}
```

### `LoginEmployeeResponse.garage.is_super_garage` (cập nhật)

```typescript
// Trước: is_super_garage?: boolean (đã đúng trong file hiện tại)
// Đảm bảo không còn number type ở bất kỳ đâu trong codebase
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Error code takes priority over HTTP status

*For any* error response object that contains both an `error_code` field and an HTTP status code, the message returned by `getErrorMessage` SHALL be determined by the `error_code` mapping, not by the HTTP status code mapping.

**Validates: Requirements 1.11**

### Property 2: Unknown error codes fall back gracefully

*For any* string value that is not in the known `ApiErrorCode` union, passing it as `error_code` to `getErrorMessage` SHALL return either the server-provided `message` field or the default fallback message — never throw an exception or return an empty string.

**Validates: Requirements 1.10**

### Property 3: `is_super_garage` boolean strict equality

*For any* value `v`, the super garage check SHALL return `true` if and only if `v === true` (strict boolean equality). Values such as `1`, `"true"`, `{}`, or any other truthy non-boolean value SHALL return `false`.

**Validates: Requirements 2.1, 2.3, 2.4**

### Property 4: Pagination meta takes priority with fallback

*For any* API response object, `extractPaginationMeta` SHALL return pagination values from `response.meta.*` when the `meta` object is present, and SHALL fall back to flat fields (`response.total`, `response.page`, etc.) when `meta` is absent — never returning `undefined` for any pagination field.

**Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6**

### Property 5: Vehicle response preserves garage object

*For any* vehicle API response that contains a `garage` object, the `transformResponse` function SHALL preserve the `garage` object in the returned `Vehicle` — the garage data SHALL not be dropped or overwritten.

**Validates: Requirements 6.1, 6.2**

### Property 6: Service order response preserves garage object

*For any* service order API response that contains a `garage` object, the `transformResponse` function SHALL preserve the `garage` object in the returned `ServiceOrder` — the garage data SHALL not be dropped or overwritten.

**Validates: Requirements 7.1**

### Property 7: Employee update reads from `response.data`

*For any* employee update response object, the `transformResponse` function SHALL return the value at `response.data` when it exists, and SHALL fall back to the response root when `response.data` is absent — never returning `undefined` when the response contains employee data.

**Validates: Requirements 9.1, 9.2**

---

## Error Handling

### Error Handler Priority Chain

```
error.data.error_code (highest priority)
  → mapErrorCodeToMessage(error_code)
  → for server-message codes (NOT_FOUND, VALIDATION_ERROR, CONFLICT, BAD_REQUEST):
      use error.data.message if present, else use default
  → for fixed-message codes (UNAUTHORIZED, FORBIDDEN, GARAGE_CONTEXT_REQUIRED, INTERNAL_ERROR):
      always use fixed Vietnamese message

HTTP status code (fallback when no error_code)
  → 401 → "Phiên đăng nhập hết hạn"
  → 404 → "Không tìm thấy dữ liệu"
  → 500/502/503 → "Lỗi hệ thống. Vui lòng thử lại sau"

error.data.message (fallback)
error.message (fallback)
"Có lỗi xảy ra. Vui lòng thử lại" (default)
```

### UNAUTHORIZED Special Handling

`UNAUTHORIZED` error_code cần trigger navigation về Login screen. Thiết kế:
- `getErrorMessage` trả về message string như bình thường
- `handleApiError` trả về object `{ message, shouldLogout: true }` khi `error_code === 'UNAUTHORIZED'` hoặc `status === 401`
- Caller (screen/component) kiểm tra `shouldLogout` và dispatch `logout()` action

### Garage Context Guard

Khi endpoint yêu cầu `x-garage-id` nhưng `garageContext.garageId` rỗng:
- `prepareHeaders` không set header
- Backend sẽ trả về `GARAGE_CONTEXT_REQUIRED` error_code
- Error Handler hiển thị message "Vui lòng chọn gara trước khi thực hiện thao tác này"

Không cần guard ở client side (không gọi API) vì backend đã handle gracefully. Điều này đơn giản hóa implementation và tránh duplicate logic.

---

## Testing Strategy

### Dual Testing Approach

Kết hợp unit tests (ví dụ cụ thể, edge cases) và property-based tests (universal properties) để đạt coverage toàn diện.

### Property-Based Testing

Sử dụng **fast-check** (TypeScript/JavaScript PBT library) cho các correctness properties.

Mỗi property test chạy tối thiểu **100 iterations**.

Tag format: `Feature: backend-api-migration, Property {N}: {property_text}`

**Property 1 — Error code priority:**
```typescript
// Feature: backend-api-migration, Property 1: error_code takes priority over HTTP status
fc.assert(fc.property(
  fc.constantFrom(...ALL_ERROR_CODES),
  fc.integer({ min: 400, max: 599 }),
  (errorCode, httpStatus) => {
    const error = { status: httpStatus, data: { error_code: errorCode } };
    const msg = getErrorMessage(error);
    const msgFromCode = mapErrorCodeToMessage(errorCode);
    return msg === msgFromCode;
  }
), { numRuns: 100 });
```

**Property 2 — Unknown error codes fallback:**
```typescript
// Feature: backend-api-migration, Property 2: unknown error codes fall back gracefully
fc.assert(fc.property(
  fc.string().filter(s => !ALL_ERROR_CODES.includes(s as any)),
  fc.option(fc.string({ minLength: 1 })),
  (unknownCode, serverMessage) => {
    const error = { data: { error_code: unknownCode, message: serverMessage ?? undefined } };
    const msg = getErrorMessage(error);
    return typeof msg === 'string' && msg.length > 0;
  }
), { numRuns: 100 });
```

**Property 3 — `is_super_garage` strict boolean:**
```typescript
// Feature: backend-api-migration, Property 3: is_super_garage boolean strict equality
fc.assert(fc.property(
  fc.anything(),
  (value) => {
    const result = isSuperGarage(value);
    return result === (value === true);
  }
), { numRuns: 100 });
```

**Property 4 — Pagination meta priority:**
```typescript
// Feature: backend-api-migration, Property 4: pagination meta takes priority with fallback
fc.assert(fc.property(
  fc.record({
    meta: fc.option(fc.record({
      total: fc.nat(),
      page: fc.nat({ max: 100 }),
      limit: fc.nat({ max: 100 }),
      totalPages: fc.nat({ max: 100 }),
      hasNextPage: fc.boolean(),
    })),
    total: fc.option(fc.nat()),
    page: fc.option(fc.nat()),
  }),
  (response) => {
    const result = extractPaginationMeta(response);
    if (response.meta) {
      return result.total === response.meta.total &&
             result.hasNextPage === response.meta.hasNextPage;
    }
    return typeof result.total === 'number' && typeof result.hasNextPage === 'boolean';
  }
), { numRuns: 100 });
```

**Property 5 — Vehicle garage preservation:**
```typescript
// Feature: backend-api-migration, Property 5: vehicle response preserves garage object
fc.assert(fc.property(
  fc.record({
    id: fc.nat(),
    license_plate: fc.string({ minLength: 1 }),
    garage: fc.option(fc.record({
      id: fc.oneof(fc.string(), fc.nat()),
      code: fc.option(fc.string()),
      name: fc.option(fc.string()),
    })),
  }),
  (vehicleData) => {
    const response = { success: true, data: vehicleData };
    const result = transformVehicleResponse(response);
    if (vehicleData.garage !== null) {
      return result.garage !== undefined;
    }
    return true;
  }
), { numRuns: 100 });
```

**Property 6 — Service order garage preservation:**
```typescript
// Feature: backend-api-migration, Property 6: service order response preserves garage object
fc.assert(fc.property(
  fc.record({
    id: fc.nat(),
    garage: fc.option(fc.record({
      id: fc.oneof(fc.string(), fc.nat()),
      name: fc.option(fc.string()),
    })),
  }),
  (orderData) => {
    const response = { success: true, data: orderData };
    const result = transformServiceOrderResponse(response);
    if (orderData.garage !== null) {
      return result.garage !== undefined;
    }
    return true;
  }
), { numRuns: 100 });
```

**Property 7 — Employee update reads from `response.data`:**
```typescript
// Feature: backend-api-migration, Property 7: employee update reads from response.data
fc.assert(fc.property(
  fc.record({
    id: fc.string({ minLength: 1 }),
    name: fc.string({ minLength: 1 }),
    phone: fc.string({ minLength: 1 }),
  }),
  fc.boolean(),
  (employeeData, hasDataWrapper) => {
    const response = hasDataWrapper
      ? { success: true, data: employeeData }
      : { success: true, ...employeeData };
    const result = transformEmployeeUpdateResponse(response);
    return result.id === employeeData.id && result.name === employeeData.name;
  }
), { numRuns: 100 });
```

### Unit Tests

Unit tests tập trung vào:
- Từng error_code mapping cụ thể (1.2 → 1.9): 8 test cases
- `hasNextPage=false` ẩn nút "Tải thêm" (4.8)
- Dialog text Customer Delete (5.1, 5.3)
- Garage name display khi có/không có garage object (6.4, 7.3)
- Garage manager full object sau mutation (8.3)

### Integration Tests

- TypeScript compilation: `tsc --noEmit` không có errors (Requirements 10.7)
- Kiểm tra không còn numeric comparison với `is_super_garage` (Requirements 2.5)

### Test File Structure

```
src/utils/__tests__/
  errorHandler.test.ts       ← Unit + Property tests (Properties 1, 2)
  paginationHelpers.test.ts  ← Unit + Property tests (Property 4)

src/services/__tests__/
  vehicleApi.test.ts         ← Property test (Property 5)
  employeeApi.test.ts        ← Property test (Property 7)
  managerApi.test.ts         ← Property test (Property 6)

src/utils/__tests__/
  isSuperGarage.test.ts      ← Property test (Property 3)
```
