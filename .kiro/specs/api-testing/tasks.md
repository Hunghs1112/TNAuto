# Implementation Plan: API Testing Suite (TNAuto)

## Overview

Tạo bộ test suite đầy đủ cho tất cả API services trong TNAuto app. Tests được tổ chức theo 6 phases: infrastructure, pure function tests, transformResponse tests, property-based tests, error handling tests, và verification. Tất cả tests chạy offline với Jest và không cần backend thật.

## Tasks

### Phase 1: Test Infrastructure

- [ ] 1. Tạo mock factories cho core types
  - Tạo file `src/services/__tests__/factories/index.ts`
  - Implement `makeCustomer`, `makeVehicle`, `makeServiceOrder`, `makeWarranty`, `makeNotification`, `makeGarageSummary` factories
  - Mỗi factory có default values hợp lệ và hỗ trợ `overrides` parameter
  - Export tất cả factories từ file index
  - _Requirements: 11.1, 11.2, 11.3_

### Phase 2: Unit Tests cho Pure Functions

- [ ] 2. Unit tests cho `parseDate` và `getExpiryMeta` (DocumentExpiryCards)
  - Tạo file `src/services/__tests__/documentExpiry.unit.test.ts`
  - Test `parseDate` với null, undefined, invalid string, valid ISO string
  - Test `getExpiryMeta` với null/undefined (missing), past date (expired), future date (valid)
  - Verify `daysLabel` là số dương cho expired/valid states
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [ ] 3. Unit tests cho `normalizeBoolean` (notificationApi)
  - Tạo file `src/services/__tests__/notification.unit.test.ts`
  - Test tất cả truthy variants: `true`, `1`, `'1'`, `'true'`
  - Test tất cả falsy variants: `false`, `0`, `'0'`, `'false'`
  - Test các giá trị khác trả về `undefined`
  - _Requirements: 2.7, 2.8, 2.9_

### Phase 3: Unit Tests cho transformResponse

- [ ] 4. Unit tests cho `vehicleApi` transformResponse
  - Thêm vào file `src/services/__tests__/vehicle.unit.test.ts` (tạo mới)
  - Test `getCustomerVehicles` transform: success=true → đủ pagination fields
  - Test `getCustomerVehicles` transform: success=false → empty fallback response
  - Test `getVehicleById` transform: preserve `garage` field kể cả khi null
  - Test `updateVehicle` transform: preserve `garage` field
  - _Requirements: 1.4, 1.5, 5.1, 5.2, 5.3, 5.4_

- [ ] 5. Unit tests cho `customerApi` transformResponse
  - Tạo file `src/services/__tests__/customer.unit.test.ts`
  - Test `loginCustomer` transform: success=false → throw Error
  - Test `loginCustomer` transform: success=true → return response với customer + linked_garages
  - Test `registerCustomer` transform: success=false → throw Error
  - Test `getCustomerOrders` transform: success=true → data array + count + customer
  - Test `getOrderDetails` transform: images default to `[]`
  - Test `getCustomerDriverLicense` transform: success=false → return null (không throw)
  - Test `getCustomerDriverLicense` transform: normalize license_no → license_number, registered_at → issued_date
  - Test `getUiVisibility` transform: non-object response → return null
  - _Requirements: 1.2, 1.3, 1.6, 1.7, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

- [ ] 6. Unit tests cho `authApi` transformResponse
  - Tạo file `src/services/__tests__/auth.unit.test.ts`
  - Test `resolveGarageByCode` transform: success=false → throw Error
  - Test `resolveGarageByCode` transform: success=true → return GarageSummary
  - Test `getPublicGarages` transform: array response trực tiếp → return array
  - Test `getPublicGarages` transform: wrapped response → return data array
  - Test `addCustomerGarage` transform: success=false → throw Error
  - Test `addCustomerGarage` transform: prefer `response.data` over `response.garage`
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [ ] 7. Unit tests cho `notificationApi` transformResponse
  - Thêm vào `src/services/__tests__/notification.unit.test.ts`
  - Test `getNotifications` transform: is_read=1 → read=true
  - Test `getNotifications` transform: is_read=0 → read=false
  - Test `getNotifications` transform: is_read=true (boolean) → read=true, is_read=1
  - Test `getUnreadCount` transform: data.unread_count → return number
  - Test `getUnreadCount` transform: root unread_count → return number
  - Test `getUnreadCount` transform: no unread_count → return 0
  - Test `extractOrderId`: ref_type='order' + ref_id → order_id set
  - Test `extractOrderId`: metadata.order_id → order_id set
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_

- [ ] 8. Unit tests cho `warrantyApi` và `imageApi` transformResponse
  - Tạo file `src/services/__tests__/warranty.unit.test.ts`
  - Test `getWarranties` transform: success=false → throw Error
  - Test `getWarranties` transform: data=null → return []
  - Test `createWarranty` transform: success=false → throw Error
  - Test `completeServiceOrder` transform: success=true → return object với warranty_id
  - Test `updateWarranty` transform: success=false → throw Error
  - Tạo file `src/services/__tests__/image.unit.test.ts`
  - Test `uploadSingleImage`: success=true → return url + filename
  - Test `uploadMultipleImages`: success=true → return files array + count
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.3_

### Phase 4: Property-Based Tests

- [ ] 9. [PBT] Property-based tests cho `parseDate`
  - Tạo file `src/services/__tests__/pbt.property.test.ts`
  - Property: `parseDate(s)` không bao giờ throw với bất kỳ string input nào
  - Property: `parseDate(date.toISOString())` luôn trả về valid Date
  - Property: `parseDate(null)` và `parseDate(undefined)` luôn trả về null
  - Sử dụng `fc.string()`, `fc.date()`, `fc.constant(null)` từ fast-check
  - _Requirements: 9.1, 9.2_

- [ ] 10. [PBT] Property-based tests cho `getExpiryMeta`
  - Thêm vào `src/services/__tests__/pbt.property.test.ts`
  - Property: `getExpiryMeta(input).state` luôn thuộc `{ 'missing', 'valid', 'expired' }`
  - Property: khi state='missing', `daysLabel` luôn là empty string
  - Property: khi state='valid' hoặc 'expired', `daysLabel` chứa số dương
  - Sử dụng `fc.option(fc.string(), { nil: null })` để generate inputs
  - _Requirements: 9.3, 9.4_

- [ ] 11. [PBT] Property-based tests cho `normalizeBoolean` và vehicle transform
  - Thêm vào `src/services/__tests__/pbt.property.test.ts`
  - Property: `normalizeBoolean(input)` luôn trả về `true`, `false`, hoặc `undefined`
  - Property: vehicle transform với success=false luôn trả về `data: []`
  - Property: vehicle transform với success=true luôn có đủ pagination fields
  - _Requirements: 9.5, 9.6, 9.7_

### Phase 5: Error Handling Tests

- [ ] 12. Tests cho error handling và retry logic
  - Tạo file `src/services/__tests__/errorHandling.unit.test.ts`
  - Test: response với success=false → Error message đúng
  - Test: error classification: 401 → AUTH_ERROR, không retry
  - Test: error classification: 429 → RATE_LIMIT
  - Test: error classification: TIMEOUT_ERROR → TIMEOUT
  - Test: error classification: FETCH_ERROR → NETWORK
  - Test: transformResponse throw → error được propagate đúng
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

### Phase 6: Verification

- [ ] 13. Chạy toàn bộ test suite và fix failures
  - Chạy `npx jest --testPathPattern="src/services/__tests__" --passWithNoTests`
  - Fix bất kỳ import errors hoặc type errors
  - Đảm bảo tất cả tests pass
  - _Requirements: 11.4, 11.5, 11.6_

## Task Dependency Graph

```json
{
  "waves": [
    { "wave": 1, "tasks": ["1"] },
    { "wave": 2, "tasks": ["2", "3", "4", "5", "6", "7", "8"] },
    { "wave": 3, "tasks": ["9", "10", "11", "12"] },
    { "wave": 4, "tasks": ["13"] }
  ]
}
```

## Notes

- Tất cả tests phải chạy offline — không cần backend thật
- Dùng `fast-check` (đã có trong devDependencies) cho property-based tests
- Không cần cài thêm dependency mới
- Convention: test files đặt trong `src/services/__tests__/` theo pattern hiện tại
- Chạy tests: `npx jest --testPathPattern="src/services/__tests__" --passWithNoTests`
- PBT tasks (9, 10, 11) được đánh dấu `[PBT]` để tracking với update_pbt_status tool
