# Backend update: App-Admin Garage Managers + Dealers + Dealer Catalog

Tài liệu này mô tả phần backend cần bổ sung để mobile app (TNAuto) hiển thị được
2 module quản trị mới:

1. **Quản lý tài khoản gara manager** (Super Admin CRUD + reset password).
2. **Quản lý đại lý + Catalog đại lý** (Categories + Products).

Mọi endpoint mới dùng namespace `/api/app/admin/*` (mobile-first), song song với
namespace web `/api/web/*` hiện có. Cấu trúc response, header, quy ước
pagination, validate… bám sát các module admin khác (xem
`src/constants/apiEndpoints.ts` để đối chiếu).

> Lưu ý: workspace này chỉ chứa mobile app, không có source backend. Mô tả dưới
> đây dựa trên convention đã thấy ở `apiEndpoints.ts`, `adminGarageApi.ts`,
> `authApi.ts` và các file spec đang có trong `docs/`. Backend dev tự map vào
> controller/service/repository hiện có.

---

## 1. Quy ước chung

### 1.1. Header

```
Authorization: Bearer <jwt>
Content-Type:  application/json     (JSON)
Content-Type: multipart/form-data   (upload ảnh)
```

JWT phải chứa (giống các module `/api/app/admin/*` hiện tại):

```json
{
  "sub": "manager-or-admin-id",
  "user_type": "garage_admin",
  "garage_id": 1,
  "is_super_garage": true
}
```

| Claim             | Ý nghĩa                                                         |
|-------------------|-----------------------------------------------------------------|
| `user_type`       | Bắt buộc `garage_admin` để qua middleware `requireAdmin`        |
| `garage_id`       | Phạm vi dữ liệu mặc định khi `is_super_garage = false`         |
| `is_super_garage` | `true` => thao tác cross-garage, override được mọi filter       |

### 1.2. Response envelope (giống các module admin hiện có)

```jsonc
// Thành công
{
  "success": true,
  "data": <object | array>,
  "message": "OK"   // optional
}

// Lỗi nghiệp vụ (HTTP 4xx)
{
  "success": false,
  "error": "PHONE_ALREADY_EXISTS",
  "message": "Số điện thoại đã tồn tại trong hệ thống"
}

// Lỗi hệ thống (HTTP 5xx) — express handler mặc định, không cần đổi
```

### 1.3. Phân trang

Query string: `page` (>=1, default 1), `limit` (1..100, default 20). Response trả
`{data: [...], pagination: {page, limit, total, total_pages}}` hoặc đơn giản
`{data: [...], total}` nếu controller đang dùng. Mobile chỉ đọc `data` +
`total`, định dạng phụ thuộc controller hiện tại — giữ nhất quán.

### 1.4. Lọc và tìm kiếm

| Endpoint                              | Query filter                              |
|---------------------------------------|-------------------------------------------|
| `GET /api/app/admin/garage-managers`  | `garage_id`, `search`, `status`, `page`, `limit` |
| `GET /api/app/admin/dealers`          | `garage_code`, `search`, `status`, `page`, `limit` |
| `GET /api/app/admin/dealer-categories`| `dealer_id`, `search`, `page`, `limit`    |
| `GET /api/app/admin/dealer-products`  | `dealer_id`, `category_id`, `search`, `page`, `limit` |

`search` khớp substring, không phân biệt hoa/thường, áp dụng cho các trường
`name`, `phone`, `code` (tùy resource).

### 1.5. Phân quyền

Middleware `requireAdmin({ user_type: 'garage_admin' })` bắt buộc cho toàn bộ
route group `/api/app/admin/*`. Trong controller, sau khi middleware xong:

- Nếu `is_super_garage = true` ⇒ cho phép thao tác với mọi `garage_id`.
- Nếu `is_super_garage = false` ⇒ mọi thao tác phải ép `garage_id =
  req.user.garage_id`. Nếu request khai báo `garage_id` khác (PUT/POST body,
  query) ⇒ trả 403 `FORBIDDEN_CROSS_GARAGE`.

---

## 2. Module: Garage Managers

### 2.1. Schema MySQL (tham khảo, dựa trên các module hiện có)

Giả định bảng `garage_managers` (hoặc tương đương) đã tồn tại để phục vụ web
admin. Bổ sung / xác nhận các cột:

```sql
-- Đảm bảo các cột tối thiểu
ALTER TABLE garage_managers
  MODIFY COLUMN password_hash VARCHAR(255) NOT NULL,
  MODIFY COLUMN status ENUM('active','inactive') NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS last_login_at DATETIME NULL,
  ADD COLUMN IF NOT EXISTS updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP;

-- Một manager có thể thuộc nhiều gara (multi-garage) — đã có thể có sẵn
-- bảng garage_manager_garages(garage_id, manager_id).
```

Nếu schema hiện tại chỉ cho phép 1-1 (manager ↔ garage), bước CRUD vẫn hoạt
động bình thường; trường `garages[]` trong detail trả `[{id, code, name}]`
danh sách hiện tại.

### 2.2. Endpoints

Tất cả dưới tiền tố `/api/app/admin/garage-managers`.

#### `GET /api/app/admin/garage-managers`

Query: `garage_id`, `search`, `status`, `page`, `limit`.

Response `data`:

```jsonc
[
  {
    "id": 12,
    "name": "Nguyễn Văn A",
    "phone": "0901234567",
    "role": "manager",                 // optional: manager | admin
    "status": "active",
    "garage_id": 1,
    "garage_name": "Head Quarter",
    "last_login_at": "2026-08-01T10:00:00.000Z",
    "created_at": "2026-01-12T03:21:00.000Z"
  }
]
```

#### `GET /api/app/admin/garage-managers/:id`

Response `data`:

```jsonc
{
  "id": 12,
  "name": "Nguyễn Văn A",
  "phone": "0901234567",
  "role": "manager",
  "status": "active",
  "last_login_at": "2026-08-01T10:00:00.000Z",
  "created_at": "2026-01-12T03:21:00.000Z",
  "garages": [
    { "id": 1, "code": "HQ", "name": "Head Quarter", "is_super_garage": true }
  ]
}
```

#### `POST /api/app/admin/garage-managers`

Body:

```jsonc
{
  "name": "Nguyễn Văn B",          // required, string, 2..100
  "phone": "0909999999",            // required, string, 9..15, unique trong hệ thống
  "password": "Manager@2026",       // required, string, >=8
  "garage_id": 1,                   // required nếu is_super_garage=true; còn lại ép = req.user.garage_id
  "role": "manager"                 // optional, default "manager"
}
```

Validation: trùng `phone` ⇒ 409 `PHONE_ALREADY_EXISTS`. `garage_id` không tồn
tại ⇒ 404 `GARAGE_NOT_FOUND`. Thiếu trường required ⇒ 400 `VALIDATION_ERROR`.

Response `data`: object manager vừa tạo (không trả `password_hash`).

#### `PUT /api/app/admin/garage-managers/:id`

Body partial:

```jsonc
{
  "name": "Nguyễn Văn B (mới)",
  "status": "inactive",
  "garage_id": 2                // optional; đổi gara cho manager
}
```

Không cho phép đổi `phone` qua endpoint này (dùng API đổi SĐT riêng nếu có).

Response `data`: object manager sau update.

#### `DELETE /api/app/admin/garage-managers/:id`

Soft-delete bằng cách set `status = 'inactive'`. Nếu manager đang có phiên đăng
nhập (token còn hạn) ⇒ trả 409 `MANAGER_HAS_ACTIVE_SESSION`.

Response: `{ success: true, message: "Đã vô hiệu hóa tài khoản" }`.

#### `POST /api/app/admin/garage-managers/:id/reset-password`

Body:

```jsonc
{ "new_password": "NewPassword@2026" }
```

Yêu cầu `is_super_garage = true` (chỉ super admin mới được reset mật khẩu của
manager khác). Manager tự đổi mật khẩu dùng endpoint
`PUT /api/app/employee/change-password` đã có.

Response:

```jsonc
{ "success": true, "message": "Đã đặt lại mật khẩu", "data": { "id": 12 } }
```

---

## 3. Module: Dealers

### 3.1. Schema

Giả định bảng `dealers` đã có sẵn để phục vụ flow đăng nhập/đăng ký
`/api/app/dealer/*`. Mobile chỉ cần thêm 1 cột `status` nếu chưa có.

```sql
ALTER TABLE dealers
  ADD COLUMN IF NOT EXISTS status ENUM('active','inactive') NOT NULL DEFAULT 'active';
```

### 3.2. Endpoints

Tiền tố `/api/app/admin/dealers`. Các endpoint đã được khai báo trong
`apiEndpoints.ts` (`adminDealers`, `adminDealerById`, `adminUpdateDealer`,
`adminDeleteDealer`); chỉ cần **bổ sung `POST`** và **làm rõ filter**.

#### `GET /api/app/admin/dealers`

Query: `garage_code`, `search`, `status`, `page`, `limit`. Nếu `is_super_garage
= false` thì ép `garage_code = garage.code` của user hiện tại.

Response `data`:

```jsonc
[
  {
    "id": 5,
    "name": "Đại lý Bình Dương",
    "phone": "0987654321",
    "email": "binhduong@example.com",
    "address": "123 Đại lộ Bình Dương",
    "avatar_url": null,
    "garage_id": 1,
    "garage_code": "HQ",
    "garage_name": "Head Quarter",
    "status": "active",
    "created_at": "2026-02-20T11:00:00.000Z"
  }
]
```

#### `POST /api/app/admin/dealers`  *(mới)*

Body:

```jsonc
{
  "garage_code": "HQ",               // required
  "name": "Đại lý Bình Dương",        // required
  "phone": "0987654321",              // required, unique
  "password": "Dealer@2026",          // required
  "email": "bd@example.com",          // optional
  "address": "123 Đại lộ Bình Dương", // optional
  "avatar_url": "https://...",        // optional
  "status": "active"                  // optional, default active
}
```

Lưu ý: dùng `garage_code` thay vì `garage_id` để mirror đúng endpoint
`/api/app/dealer/auth/register` đã có; backend map `garage_code → garage_id`
trước khi insert.

Validation: trùng `phone` ⇒ 409 `PHONE_ALREADY_EXISTS`. `garage_code` không tồn
tại ⇒ 404 `GARAGE_NOT_FOUND`. Nếu user hiện tại không phải super admin thì
`garage_code` phải khớp với gara của họ.

Response `data`: object dealer vừa tạo.

#### `PUT /api/app/admin/dealers/:id`, `DELETE /api/app/admin/dealers/:id`

Đã có trong `apiEndpoints.ts`. Body PUT partial (trừ `password`). DELETE soft
delete (set `status = 'inactive'`).

---

## 4. Module: Dealer Catalog (Categories + Products)

Tận dụng các endpoint đã khai báo trong `apiEndpoints.ts`:

- `/api/app/admin/dealer-categories`
- `/api/app/admin/dealer-products`
- `/api/app/admin/dealer-products/:productId/images`
- `/api/app/admin/dealer-products/images`

Bổ sung **1 endpoint upload ảnh cho category** đã có trong spec app:

### 4.1. `POST /api/app/admin/dealer-categories/:id/upload-image`

- Body: `multipart/form-data` với field `image` (jpeg/png/webp, <=5MB).
- Trả về object `{ id, image_url }`. Cập nhật `image_url` của category tương
  ứng. Nếu có S3/Cloudinary sẵn thì upload lên đó, không tự lưu local.

Response:

```jsonc
{ "success": true, "data": { "id": 7, "image_url": "https://cdn/.../cat7.png" } }
```

### 4.2. Quy tắc

- Tất cả CRUD dealer categories/products phải có `dealer_id` được suy ra từ JWT
  hoặc từ query `dealer_id` (chỉ áp dụng khi `is_super_garage = true`).
- Mobile client sẽ gửi `dealer_id` qua query khi list chi tiết (vd. list sản
  phẩm của dealer cụ thể), controller kiểm tra quyền trước khi trả.

### 4.3. Các endpoint khác (chỉ liệt kê để tham chiếu)

Đã đủ trong `apiEndpoints.ts`:

```
GET    /api/app/admin/dealer-categories
POST   /api/app/admin/dealer-categories
GET    /api/app/admin/dealer-categories/:id
PUT    /api/app/admin/dealer-categories/:id
DELETE /api/app/admin/dealer-categories/:id

GET    /api/app/admin/dealer-products
POST   /api/app/admin/dealer-products
GET    /api/app/admin/dealer-products/:id
PUT    /api/app/admin/dealer-products/:id
DELETE /api/app/admin/dealer-products/:id

GET    /api/app/admin/dealer-products/:productId/images
POST   /api/app/admin/dealer-products/images
PUT    /api/app/admin/dealer-products/images/:id
DELETE /api/app/admin/dealer-products/images/:id
```

Body CRUD mẫu:

```jsonc
// DealerCategory
{
  "dealer_id": 5,            // required
  "name": "Phụ tùng",        // required
  "description": "Mô tả",    // optional
  "image_url": "https://..." // optional, set sau upload
}

// DealerProduct
{
  "dealer_id": 5,
  "category_id": 7,
  "name": "Lọc gió điều hòa",
  "description": "...",
  "price": 250000,
  "video_url": "https://..."  // optional
}
```

---

## 5. Mã lỗi tiêu chuẩn

| Code                              | HTTP | Mô tả                                        |
|-----------------------------------|------|----------------------------------------------|
| `VALIDATION_ERROR`                | 400  | Thiếu/sai trường body                        |
| `UNAUTHORIZED`                    | 401  | Không có / sai JWT                           |
| `FORBIDDEN_CROSS_GARAGE`          | 403  | User không phải super admin mà truy cập gara khác |
| `GARAGE_NOT_FOUND`                | 404  | `garage_code`/`garage_id` không tồn tại      |
| `MANAGER_NOT_FOUND` / `DEALER_NOT_FOUND` | 404 | ID không tồn tại                  |
| `PHONE_ALREADY_EXISTS`            | 409  | Trùng SĐT khi tạo manager/dealer             |
| `MANAGER_HAS_ACTIVE_SESSION`      | 409  | Không thể vô hiệu hóa manager đang login     |

---

## 6. Checklist triển khai backend

1. **Migration**: bổ sung cột `status`, `last_login_at`, `updated_at` cho
   `garage_managers` (nếu thiếu); cột `status` cho `dealers` (nếu thiếu).
2. **Middleware**: bổ sung `requireAdmin` cho route group `/api/app/admin/*`
   (nếu chưa có).
3. **Garage Managers controller**: 6 endpoint (list, detail, create, update,
   delete, reset-password).
4. **Dealers controller**: thêm `POST /api/app/admin/dealers`; làm rõ filter
   cho GET. (Các PUT/DELETE đã có.)
5. **Dealer Catalog controller**: đảm bảo CRUD + image. Thêm
   `POST /api/app/admin/dealer-categories/:id/upload-image`.
6. **Permission helper** (tương tự `requireSuperAdminGarage` đang có cho
   garage): chỉ `is_super_garage = true` mới đổi `garage_id`/xem cross-garage.
7. **Validation**: chuẩn hóa theo schema trong `docs/backend-super-garage-api.md`
   — dùng cùng pattern lỗi `VALIDATION_ERROR`, `*_NOT_FOUND`.
8. **Tests**:
   - Tạo manager thành công / trùng SĐT / cross-garage không được phép.
   - Reset password bởi user không phải super admin ⇒ 403.
   - Soft-delete manager đang login ⇒ 409.
   - Upload ảnh dealer-category thành công + từ chối file > 5MB.
   - CRUD dealer + filter `garage_code` đúng với user non-super-admin.
9. **Logging/Audit**: ghi log mỗi lần reset password, đổi `garage_id` của
   manager (giống pattern audit log hiện có).

---

## 7. Mapping tới mobile (tham chiếu thuận tiện)

| Backend endpoint                                     | Mobile hook sẽ dùng (sau khi cài)         |
|------------------------------------------------------|--------------------------------------------|
| `GET /api/app/admin/garage-managers`                 | `useGetAdminGarageManagersQuery`          |
| `POST /api/app/admin/garage-managers`                | `useCreateAdminGarageManagerMutation`     |
| `POST /api/app/admin/garage-managers/:id/reset-pw`   | `useResetAdminGarageManagerPasswordMutation` |
| `POST /api/app/admin/dealers`                        | `useCreateAdminDealerMutation`            |
| `POST /api/app/admin/dealer-categories/:id/upload-image` | `useUploadAdminDealerCategoryImageMutation` |
| `GET /api/app/admin/dealer-products`                 | `useGetAdminResourceListQuery({resource:'dealer-products'})` (đã có) |

Sau khi backend hoàn tất, mobile sẽ triển khai tiếp các todo 1–8 trong plan
chính.