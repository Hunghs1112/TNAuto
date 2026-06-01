# Admin Stats Sync Fix

**Date:** 2025-07-14  
**Scope:** Backend API stats endpoints vs. Frontend `GarageManagementScreen` dashboard

---

## Vấn đề

Frontend (`GarageManagementScreen.tsx`, `GarageOrdersScreen.tsx`, `GarageEmployeesScreen.tsx`, `GarageCustomersScreen.tsx`) gọi `GET /api/app/admin/{resource}/stats` cho 11 resource và dùng `pickStat()` để tìm các key trong response. Nhiều key frontend tìm không tồn tại trong response backend, dẫn đến hiển thị `0`.

---

## Danh sách vấn đề tìm thấy

| # | Resource | Key frontend tìm | Key backend có | Trạng thái |
|---|----------|-----------------|----------------|------------|
| 1 | `customers` | `active_customers` | `customers_with_orders` | ❌ MISS → đã fix |
| 2 | `employees` | `active_employees` | `employees_with_active_orders` | ❌ MISS → đã fix |
| 3 | `service-orders` | `pending_orders` | `received_orders` | ❌ MISS → đã fix |
| 4 | `service-orders` | `processing_orders` | `in_progress_orders` | ❌ MISS → đã fix |
| 5 | `service-orders` | `completed_today` | (không có) | ❌ MISS → đã thêm query |
| 6 | `notifications` | `total_notifications` | `total` (trong `stats`) | ❌ MISS → đã fix |
| 7 | `vehicles` | `vehicles_due_inspection` | (không có) | ❌ MISS → đã thêm query |
| 8 | `offers` | `active_offers` | (không có) | ❌ MISS → đã fix |
| 9 | `warranties` | `total_warranties`, `active_warranties` | ✅ có sẵn | ✅ OK |
| 10 | `services` | `total_services` | ✅ có sẵn | ✅ OK |
| 11 | `service-categories` | `total_categories` | ✅ có sẵn | ✅ OK |
| 12 | `products` | `total_products` | ✅ có sẵn | ✅ OK |
| 13 | `categories` | `total_categories` | ✅ có sẵn | ✅ OK |

---

## Các thay đổi đã thực hiện

### 1. `customer.repository.js`
**File:** `src/domains/customer/customer.repository.js`  
**Thay đổi:** Thêm alias `active_customers = customers_with_orders` vào kết quả `getStats()`.

```js
const result = { ...stats[0], ...orderStats[0] };
// Alias for frontend compatibility: active_customers = customers_with_orders
result.active_customers = result.customers_with_orders ?? 0;
return result;
```

---

### 2. `employee.repository.js`
**File:** `src/domains/employee/employee.repository.js`  
**Thay đổi:** Thêm alias `active_employees = employees_with_active_orders` vào kết quả `getStats()`.

```js
const result = { ...stats[0], ...orderStats[0], ...activeOrders[0] };
// Alias for frontend compatibility: active_employees = employees_with_active_orders
result.active_employees = result.employees_with_active_orders ?? 0;
return result;
```

---

### 3. `serviceOrder.controller.js`
**File:** `src/domains/serviceOrder/serviceOrder.controller.js`  
**Thay đổi:**
- Thêm `completed_today` vào SQL query: `COUNT(CASE WHEN status = 'completed' AND DATE(delivery_date) = CURDATE() THEN 1 END) as completed_today`
- Thêm alias `pending_orders = received_orders`
- Thêm alias `processing_orders = in_progress_orders`

```js
// Trong SQL:
COUNT(CASE WHEN status = 'completed' AND DATE(delivery_date) = CURDATE() THEN 1 END) as completed_today,

// Trong response:
pending_orders: aggregate.received_orders ?? 0,
processing_orders: aggregate.in_progress_orders ?? 0,
```

---

### 4. `notificationController.js`
**File:** `src/controllers/notificationController.js`  
**Thay đổi:** Thêm `total_notifications` alias trong object `stats` của `getNotificationStats()`.

```js
stats: {
  total: totalResult[0].count,
  total_notifications: totalResult[0].count,  // ← thêm mới
  unread: unreadResult[0].count,
  read: totalResult[0].count - unreadResult[0].count,
  by_type: [...]
}
```

> **Lưu ý:** Frontend dùng `extractStats()` → tìm `response.stats` → trả về object `{ total, total_notifications, unread, read, by_type }`. `by_type` là array nên bị lọc ra bởi `extractStats()`, chỉ các primitive được giữ lại.

---

### 5. `vehicle.repository.js`
**File:** `src/domains/customer/vehicle.repository.js`  
**Thay đổi:** Thêm query đếm xe có `inspection_expiry_date` trong 30 ngày tới hoặc chưa có inspection, trả về `vehicles_due_inspection` và `expiring_inspections`.

```js
const inspectionStats = await query(
  `SELECT
     COUNT(DISTINCT v.id) as vehicles_due_inspection
   FROM vehicles v
   JOIN customer_garages cg ON cg.customer_id = v.customer_id
   LEFT JOIN vehicle_inspections vi ON vi.vehicle_id = v.id
   WHERE cg.garage_id = ?
     AND (
       vi.inspection_expiry_date IS NULL
       OR vi.inspection_expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
     )`,
  [garageId]
);

return {
  ...stats[0],
  ...customerStats[0],
  ...orderStats[0],
  vehicles_due_inspection: Number(inspectionStats[0]?.vehicles_due_inspection ?? 0),
  expiring_inspections: Number(inspectionStats[0]?.vehicles_due_inspection ?? 0),
};
```

> **Lưu ý:** Dùng `vehicle_inspections` table (join qua `buildVehicleInspectionJoin`) với column `inspection_expiry_date` (từ `vehicleDocumentService.js`). Xe không có bản ghi inspection cũng được tính vào "cần theo dõi".

---

### 6. `offerController.js`
**File:** `src/controllers/offerController.js`  
**Thay đổi:** Thêm `active_offers` và `running_offers` alias. Vì bảng `offers` không có cột `status`, dùng `total_offers` làm giá trị (tất cả offer đều được coi là active).

```js
return res.json({
  success: true,
  data: {
    ...stats[0],
    ...serviceStats[0],
    active_offers: stats[0]?.total_offers ?? 0,
    running_offers: stats[0]?.total_offers ?? 0,
  }
});
```

---

## Mapping key frontend → backend sau khi fix

### `customers/stats`
| Frontend key | Backend key | Ghi chú |
|---|---|---|
| `total_customers` | `total_customers` | ✅ trực tiếp |
| `new_customers_30d` | `new_customers_30d` | ✅ trực tiếp |
| `active_customers` | `active_customers` | ✅ alias mới = `customers_with_orders` |

### `employees/stats`
| Frontend key | Backend key | Ghi chú |
|---|---|---|
| `total_employees` | `total_employees` | ✅ trực tiếp |
| `active_employees` | `active_employees` | ✅ alias mới = `employees_with_active_orders` |

### `service-orders/stats`
| Frontend key | Backend key | Ghi chú |
|---|---|---|
| `total_orders` | `total_orders` | ✅ trực tiếp |
| `pending_orders` | `pending_orders` | ✅ alias mới = `received_orders` |
| `processing_orders` | `processing_orders` | ✅ alias mới = `in_progress_orders` |
| `completed_today` | `completed_today` | ✅ query mới |
| `in_progress_orders` | `in_progress_orders` | ✅ trực tiếp (fallback) |
| `received_orders` | `received_orders` | ✅ trực tiếp (fallback) |

### `notifications/stats`
| Frontend key | Backend key | Ghi chú |
|---|---|---|
| `total_notifications` | `total_notifications` | ✅ alias mới = `total` |
| `unread` | `unread` | ✅ trực tiếp |

### `vehicles/stats`
| Frontend key | Backend key | Ghi chú |
|---|---|---|
| `total_vehicles` | `total_vehicles` | ✅ trực tiếp |
| `vehicles_due_inspection` | `vehicles_due_inspection` | ✅ query mới |
| `expiring_inspections` | `expiring_inspections` | ✅ alias = `vehicles_due_inspection` |

### `warranties/stats`
| Frontend key | Backend key | Ghi chú |
|---|---|---|
| `total_warranties` | `total_warranties` | ✅ trực tiếp (qua `response.data`) |
| `active_warranties` | `active_warranties` | ✅ trực tiếp |

### `services/stats`
| Frontend key | Backend key | Ghi chú |
|---|---|---|
| `total_services` | `total_services` | ✅ trực tiếp |

### `service-categories/stats`
| Frontend key | Backend key | Ghi chú |
|---|---|---|
| `total_categories` | `total_categories` | ✅ trực tiếp |

### `products/stats`
| Frontend key | Backend key | Ghi chú |
|---|---|---|
| `total_products` | `total_products` | ✅ trực tiếp |

### `categories/stats`
| Frontend key | Backend key | Ghi chú |
|---|---|---|
| `total_categories` | `total_categories` | ✅ trực tiếp |

### `offers/stats`
| Frontend key | Backend key | Ghi chú |
|---|---|---|
| `total_offers` | `total_offers` | ✅ trực tiếp (qua `response.data`) |
| `active_offers` | `active_offers` | ✅ alias mới = `total_offers` |
| `running_offers` | `running_offers` | ✅ alias mới = `total_offers` |

---

## Quy tắc áp dụng

- Chỉ **thêm** alias/field mới, không xóa field cũ → backward compatible
- `completed_today`: dùng `DATE(delivery_date) = CURDATE()` (delivery_date là ngày hoàn thành thực tế)
- `vehicles_due_inspection`: xe không có bản ghi inspection + xe có `inspection_expiry_date <= 30 ngày tới` đều được tính
- `active_offers`: vì bảng `offers` không có cột `status`, dùng `total_offers` làm proxy
