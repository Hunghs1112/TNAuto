# Notification Deep-Link Spec — Backend + Web Admin

Tài liệu này là **single source of truth** cho việc đồng bộ giữa **Backend** và **Web Admin** (mobile app nằm ở repo khác, tham chiếu spec này).

## 1. Vấn đề

Thông báo tạo riêng cho từng khách hàng từ Web Admin hiện hiển thị trên app khách hàng, nhưng khi khách bấm vào thì **không chuyển sang trang chi tiết** mà rơi về trang danh sách thông báo (hoặc trang chủ).

## 2. Nguyên nhân (theo codebase hiện tại)

### 2.1. Mobile

`handleNotificationPress` chỉ switch theo `type` + `order_id`/`service_id` cũ. Không có cơ chế generic để navigate theo `target_screen` do admin chỉ định.

### 2.2. Web Admin — modal gửi thông báo

File `src/components/features/NotificationSendModal.jsx` hiện chỉ gửi `{recipient_id, recipient_type, title, message, data}`. Không có field `target_screen` / `target_params`.

### 2.3. Backend — endpoint create

`POST /api/app/admin/notifications` (cũng mount ở `/api/web/communications/notifications` và `/api/app/manager/notifications`) hiện chỉ INSERT row vào bảng `notifications`, không lưu target_screen/target_params.

## 3. Giải pháp (MVP)

Thêm 2 field optional vào body `POST /api/app/admin/notifications`:

| Field            | Type                  | Required | Mô tả                                                          |
|------------------|-----------------------|----------|----------------------------------------------------------------|
| `target_screen`  | `string` (whitelist)  | optional | Màn hình đích trong app khi user bấm notif                     |
| `target_params`  | `Record<string, any>` | optional | Params truyền cho navigate (vd: `{id: "A1023"}`)               |

Backend validate whitelist theo `recipient_type`, persist vào DB, mirror vào FCM `data` payload. Web Admin thêm dropdown chọn màn hình đích vào modal.

## 4. API contract

### 4.1. Request body — `POST /api/app/admin/notifications`

```jsonc
{
  "recipient_id": 42,                    // required
  "recipient_type": "customer",          // required: customer | employee | dealer
  "title": "Đơn hàng #A1023 đã hoàn thành", // optional, default "Thông báo mới"
  "message": "Vui lòng kiểm tra...",     // required
  "image_url": "https://...",            // optional
  "target_screen": "OrderDetail",        // optional, whitelist §6
  "target_params": { "id": "A1023" }     // optional, object
}
```

### 4.2. Response

```jsonc
{
  "success": true,
  "message": "Gửi thông báo thành công",
  "notification_id": 123,
  "delivery": "sent",        // hoặc "failed"
  "target_screen": "OrderDetail"  // hoặc null
}
```

### 4.3. Validation rules

| Rule                                                                              | HTTP | Code                     |
|-----------------------------------------------------------------------------------|------|--------------------------|
| Thiếu `recipient_id` / `recipient_type` / `message`                              | 400  | (message tiếng Việt)    |
| `recipient_type` ∉ {customer, employee, dealer}                                  | 400  | `INVALID_RECIPIENT_TYPE` |
| `target_screen` không nằm trong whitelist cho `recipient_type`                    | 400  | `INVALID_TARGET_SCREEN`  |
| `target_screen` cần param bắt buộc mà `target_params` thiếu                      | 400  | `MISSING_TARGET_PARAMS`  |

Khi trả lỗi, response shape:

```jsonc
{
  "success": false,
  "code": "INVALID_TARGET_SCREEN",
  "error": "Màn hình đích không hợp lệ với loại người nhận",
  "required_params": ["id"]
}
```

### 4.4. Backward-compat

- Web Admin / mobile admin cũ chỉ gửi `{recipient_id, recipient_type, message}` vẫn hoạt động như hiện tại → không có `target_screen` trong FCM `data`, mobile fallback về nhánh `default` cũ.
- Không thay đổi INSERT statement ngoài việc thêm 2 cột nullable.

## 5. FCM payload

Mọi key trong `data` đều là string (FCM restriction). Object sẽ tự được stringify bởi `stringifyData` trong `src/utils/fcmPayloadBuilder.js`.

| Key (data-only)  | Source                                                                  | Ghi chú                                        |
|------------------|-------------------------------------------------------------------------|------------------------------------------------|
| `type`           | `'custom_notification'`                                                 | tag phân loại                                  |
| `title`          | request                                                                 | required                                       |
| `body`           | request (alias `message`)                                               | required                                       |
| `image_url`      | request                                                                 | optional                                       |
| `target_screen`  | request (nếu có)                                                        | **MỚI**                                       |
| `target_params`  | `JSON.stringify(request.target_params)`                                 | **MỚI**                                       |
| `order_id`       | `target_params.id` nếu target là `OrderDetail`/`EmployeeOrderDetail`    | mirror cho nhánh `order_*` cũ                  |
| `service_id`     | `target_params.serviceId` nếu target là `ServiceDetail`                 | mirror cho nhánh `service_reminder` cũ          |
| `schema_version` | `"1.1"`                                                                 | đánh dấu version payload                       |

## 6. Whitelist `target_screen`

Canonical ở 2 nơi (phải giữ đồng bộ):

- Backend: `src/constants/notificationTargetScreens.js`
- Web Admin: `TNAUTO-admin/src/constants/notificationTargetScreens.js`

| Recipient    | `target_screen`        | Param bắt buộc                                | Mô tả                              |
|--------------|------------------------|-----------------------------------------------|------------------------------------|
| `customer`   | `OrderDetail`          | `{id: string}`                                | Chi tiết đơn của khách             |
| `customer`   | `ServiceDetail`        | `{serviceId: number}`                         | Chi tiết dịch vụ                   |
| `customer`   | `Warranty`             | (không)                                       | Danh sách bảo hành                 |
| `customer`   | `Booking`              | (không)                                       | Đặt lịch                           |
| `customer`   | `MyService`            | (không)                                       | Dịch vụ của tôi                    |
| `customer`   | `OfferDetail`          | `{offerId: number}`                           | Chi tiết ưu đãi                    |
| `customer`   | `ProductDetail`        | `{productId: number}`                         | Chi tiết sản phẩm                  |
| `customer`   | `Notification`         | (không)                                       | Danh sách thông báo (fallback)     |
| `employee`   | `EmployeeOrderDetail`  | `{id: string}`                                | Chi tiết đơn nhân viên             |
| `employee`   | `GarageManagement`     | (không)                                       | Quản lý gara                       |
| `employee`   | `GarageOrders`         | (không)                                       | Đơn của gara                       |
| `employee`   | `CustomerDetail`       | `{customerId: number}`                        | Chi tiết khách                     |
| `employee`   | `VehicleDetail`        | `{vehicleId: string, licensePlate: string}`   | Chi tiết xe                        |
| `employee`   | `Notification`         | (không)                                       | Danh sách thông báo                |
| `dealer`     | `Notification`         | (không)                                       | Danh sách thông báo                |

Mobile app **không được** navigate tới screen nằm ngoài whitelist này. Khi nhận `target_screen` không hợp lệ → fallback nhánh `default` của `handleNotificationPress` để tránh crash.

## 7. Mobile app — gợi ý tiêu thụ payload (tham chiếu, không implement tại repo này)

### 7.1. Mở rộng model dữ liệu

`NotificationData` (extend):

```ts
interface NotificationData {
  type?: string;
  target_screen?: string;                  // MỚI
  target_params?: Record<string, any>;      // MỚI (đã JSON.parse)
  schema_version?: string;
  order_id?: string;
  service_id?: string;
  // ... các key cũ
}
```

Service nhận push hiện tại (ví dụ `FirebaseMessagingService` / `PushHandler`) cần:

- Parse `data.target_params` từ JSON-string sang object (FCM chỉ truyền string values).
- Truyền `target_screen` + `target_params` xuống tầng navigation.

### 7.2. Navigation flow

Trong `handleNotificationPress` (state `cold-start`, `background`, `foreground`), **chèn nhánh `target_screen` trước** switch theo `type` để giữ backward-compat:

```ts
const ALLOWED_SCREENS = new Set([
  'OrderDetail','EmployeeOrderDetail','ServiceDetail','Warranty',
  'CustomerDetail','GarageManagement','GarageOrders','VehicleDetail',
  'Booking','MyService','OfferDetail','ProductDetail','Notification',
]);

function handleNotificationPress(data: NotificationData) {
  if (data.target_screen && ALLOWED_SCREENS.has(data.target_screen)) {
    RootNavigation.navigate(data.target_screen as any, data.target_params ?? {});
    return;
  }
  // ... switch theo data.type cũ (fallback)
}
```

Quy tắc:

- Nếu `target_screen` nằm ngoài `ALLOWED_SCREENS` → bỏ qua, rơi về nhánh switch cũ (không crash).
- Nếu `target_params` thiếu param bắt buộc → vẫn navigate, màn hình đích tự handle missing param (vd hiển thị toast).
- Cold-start (app bị kill) và background đều dùng cùng hàm trên.

### 7.3. Bảng màn hình + param

| Screen                | Nhận từ `target_params`                          | Hành vi khi bấm vào                              |
|-----------------------|--------------------------------------------------|--------------------------------------------------|
| `OrderDetail`         | `{ id: string }`                                 | Mở chi tiết đơn hàng với `id`                    |
| `EmployeeOrderDetail` | `{ id: string }`                                 | Mở chi tiết đơn hàng nhân viên                  |
| `ServiceDetail`       | `{ serviceId: number }`                          | Mở chi tiết dịch vụ                              |
| `Warranty`            | `{}`                                             | Mở tab Bảo hành                                  |
| `Booking`             | `{}`                                             | Mở màn hình Đặt lịch                            |
| `MyService`           | `{}`                                             | Mở màn hình Dịch vụ của tôi                      |
| `OfferDetail`         | `{ offerId: number }`                            | Mở chi tiết ưu đãi                              |
| `ProductDetail`       | `{ productId: number }`                          | Mở chi tiết sản phẩm                            |
| `CustomerDetail`      | `{ customerId: number }`                         | Mở chi tiết khách (cho nhân viên)               |
| `VehicleDetail`       | `{ vehicleId: string, licensePlate: string }`    | Mở chi tiết xe                                   |
| `GarageManagement`    | `{}`                                             | Mở tab Quản lý gara (cho nhân viên)              |
| `GarageOrders`        | `{}`                                             | Mở danh sách đơn của gara (cho nhân viên)        |
| `Notification`        | `{}`                                             | Mở danh sách thông báo (fallback nếu không chỉ định) |

### 7.4. Test case cho mobile QA

| Case | Payload                                                                        | Kỳ vọng                                                                  |
|------|--------------------------------------------------------------------------------|---------------------------------------------------------------------------|
| 1    | `{type:"custom_notification", target_screen:"OrderDetail", target_params:{id:"A1"}}` | Mở OrderDetail với id=A1                                                  |
| 2    | `{type:"custom_notification", target_screen:"OrderDetail"}` (thiếu id)         | Vẫn navigate, OrderDetail tự xử lý missing → toast / về list             |
| 3    | `{type:"custom_notification", target_screen:"FakeScreen"}`                     | Rơi về nhánh switch cũ, không crash                                       |
| 4    | `{type:"custom_notification"}` (legacy)                                        | Nhánh cũ: switch theo `type` → fallback về Notification list             |
| 5    | Cold-start từ killed state                                                     | Restore navigation stack rồi mới gọi `handleNotificationPress`           |
| 6    | Background → foreground                                                        | Foreground handler gọi `handleNotificationPress` với cùng payload        |

## 8. DB schema

### 8.1. Hiện trạng bảng `notifications`

Xem `hotrohoc_tnauto.sql` dòng 240–262.

### 8.2. Cột bổ sung (idempotent)

```sql
ALTER TABLE `notifications`
  ADD COLUMN IF NOT EXISTS `target_screen` VARCHAR(64) COLLATE utf8mb4_general_ci DEFAULT NULL AFTER `image_url`,
  ADD COLUMN IF NOT EXISTS `target_params` JSON DEFAULT NULL AFTER `target_screen`;
```

> Lưu ý: file `hotrohoc_tnauto.sql` đã được cập nhật sẵn 2 cột này trong CREATE TABLE. ALTER ở trên là idempotent cho môi trường đã tồn tại.

## 9. File chính đã thay đổi

**Backend:**

- `src/constants/notificationTargetScreens.js` (mới) — whitelist canonical
- `src/controllers/notificationController.js` — extend `sendCustomNotification` (validate + persist + gọi `sendToUser`)
- `src/controllers/adminNotificationController.js` — `listNotifications` trả `target_screen` + `target_params`
- `src/services/notificationService.js` — `saveNotificationToDb` + `saveNotificationsBulkToDb` thêm 2 cột; trả `insertResult.insertId`
- `hotrohoc_tnauto.sql` — thêm 2 cột nullable

**Web Admin:**

- `TNAUTO-admin/src/constants/notificationTargetScreens.js` (mới) — mirror whitelist
- `TNAUTO-admin/src/components/features/NotificationSendModal.jsx` — dropdown + input + payload
- `TNAUTO-admin/src/components/features/NotificationManagement.jsx` — cột "Màn hình đích"
- `TNAUTO-admin/src/components/features/NotificationDetailModal.jsx` — render target

## 10. Verification

### Backend (curl)

```bash
# Payload cũ — vẫn 200, không có target_screen
curl -X POST http://localhost:5000/api/app/admin/notifications \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"recipient_id":42,"recipient_type":"customer","message":"hello"}'

# Payload mới — 200, có target_screen trong FCM data
curl -X POST http://localhost:5000/api/app/admin/notifications \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "recipient_id": 42,
    "recipient_type": "customer",
    "message": "Đơn hoàn thành",
    "target_screen": "OrderDetail",
    "target_params": { "id": "A1023" }
  }'

# Sai target_screen — 400 INVALID_TARGET_SCREEN
curl -X POST http://localhost:5000/api/app/admin/notifications \
  -d '{ ..., "target_screen": "FakeScreen" }'

# Thiếu param bắt buộc — 400 MISSING_TARGET_PARAMS
curl -X POST http://localhost:5000/api/app/admin/notifications \
  -d '{ ..., "target_screen": "OrderDetail" }'
```

### Web Admin

- Mở `/notifications` → bấm "Gửi thông báo" → thấy dropdown "Màn hình đích".
- Chọn `OrderDetail` + nhập ID → submit → list có row mới với cột "Màn hình đích = OrderDetail".
- Detail modal render `target_screen` + `target_params` (JSON).

### End-to-end (cần thiết bị thật)

Gửi từ admin có `target_screen=OrderDetail` → mở app khách → bấm notif → app phải mở OrderDetail với id tương ứng.

## 11. Out of scope (phase sau)

- Broadcast toàn bộ customer/employee của garage.
- Scheduled notification + cron worker scan.
- Audit log table.
- Rate limit per garage_admin.
- Template notif với biến `{{var}}`.
- Click rate tracking (`notification_opened` event từ mobile).
- Test tự động (Jest/Supertest) — MVP chỉ manual smoke test.