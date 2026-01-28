# Yêu Cầu Cập Nhật Backend API

## Vấn Đề Hiện Tại

Frontend đang gặp lỗi 404 khi nhân viên cố gắng cập nhật trạng thái đơn hàng:
- **Lỗi**: `Route /api/service-orders/:id/status not found`
- **Nguyên nhân**: Backend chưa có endpoint để nhân viên cập nhật trạng thái đơn hàng

## API Endpoint Cần Thêm

### 1. Cập Nhật Trạng Thái Đơn Hàng (Nhân Viên)

**Endpoint**: `PUT /api/employees/orders/:id/status`

**Mô tả**: Cho phép nhân viên cập nhật trạng thái của đơn hàng được giao cho họ xử lý.

**Request**:
- **Method**: `PUT`
- **URL**: `/api/employees/orders/:id/status`
- **Path Parameters**:
  - `id` (required): ID của đơn hàng (service order ID)
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>` (nếu có authentication)
- **Body**:
```json
{
  "status": "ready_for_pickup",
  "employee_id": "123"
}
```

**Body Parameters**:
- `status` (required, string): Trạng thái mới của đơn hàng
- `employee_id` (required, string): ID của nhân viên đang cập nhật
  - Các giá trị có thể:
    - `"received"`: Đã nhận xe
    - `"in_progress"`: Đang xử lý
    - `"ready_for_pickup"`: Sẵn sàng giao xe
    - `"completed"`: Hoàn thành
    - `"cancelled"`: Đã hủy

**Response Success (200 OK)**:
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "data": {
    "id": 3,
    "status": "ready_for_pickup",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

**Response Error (400 Bad Request)**:
```json
{
  "success": false,
  "error": "Invalid status value"
}
```

**Response Error (404 Not Found)**:
```json
{
  "success": false,
  "error": "Order not found"
}
```

**Response Error (403 Forbidden)**:
```json
{
  "success": false,
  "error": "You don't have permission to update this order"
}
```

**Response Error (401 Unauthorized)**:
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

## Logic Backend Cần Implement

### 1. Validation
- Kiểm tra đơn hàng có tồn tại không
- Kiểm tra đơn hàng có được gán cho nhân viên hiện tại không (nếu có authentication)
- Kiểm tra giá trị `status` có hợp lệ không
- Kiểm tra trạng thái hiện tại có thể chuyển sang trạng thái mới không (state machine validation)

### 2. Business Logic
- Cập nhật trạng thái đơn hàng trong database
- Cập nhật `updated_at` timestamp
- Có thể cập nhật `employee_id` nếu chưa được gán
- Gửi notification cho khách hàng khi trạng thái thay đổi (optional)

### 3. State Transition Rules (Gợi ý)
```
received → in_progress → ready_for_pickup → completed
received → cancelled
in_progress → ready_for_pickup → completed
in_progress → cancelled (nếu cho phép)
```

### 4. Database Update
```sql
UPDATE service_orders 
SET 
  status = :new_status,
  updated_at = NOW(),
  employee_id = :employee_id  -- Nếu chưa được gán
WHERE 
  id = :order_id
  AND (employee_id = :employee_id OR employee_id IS NULL)  -- Kiểm tra quyền
```

## Ví Dụ Implementation (Node.js/Express)

```javascript
// routes/employees.js
router.put('/orders/:id/status', authenticateEmployee, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const employeeId = req.employee.id; // Từ authentication middleware

    // Validate status
    const validStatuses = ['received', 'in_progress', 'ready_for_pickup', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status value'
      });
    }

    // Check if order exists and is assigned to this employee
    const order = await db.query(
      'SELECT * FROM service_orders WHERE id = $1 AND (employee_id = $2 OR employee_id IS NULL)',
      [id, employeeId]
    );

    if (order.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Order not found or not assigned to you'
      });
    }

    // Validate state transition (optional but recommended)
    const currentStatus = order.rows[0].status;
    const validTransitions = {
      'received': ['in_progress', 'cancelled'],
      'in_progress': ['ready_for_pickup', 'cancelled'],
      'ready_for_pickup': ['completed'],
      'completed': [], // Cannot change from completed
      'cancelled': []  // Cannot change from cancelled
    };

    if (!validTransitions[currentStatus]?.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Cannot transition from ${currentStatus} to ${status}`
      });
    }

    // Validate employee_id from request body or use authenticated employee
    const requestEmployeeId = req.body.employee_id || employeeId;
    
    if (!requestEmployeeId) {
      return res.status(400).json({
        success: false,
        error: 'Mã nhân viên là bắt buộc (truyền trong body hoặc query)'
      });
    }

    // Update order status
    const result = await db.query(
      `UPDATE service_orders 
       SET status = $1, updated_at = NOW(), employee_id = COALESCE(employee_id, $2)
       WHERE id = $3
       RETURNING id, status, updated_at`,
      [status, requestEmployeeId, id]
    );

    // Send notification to customer (optional)
    // await sendNotificationToCustomer(order.rows[0].customer_id, {
    //   type: 'order_status_update',
    //   order_id: id,
    //   status: status
    // });

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});
```

## Ví Dụ Implementation (Python/Flask)

```python
# routes/employees.py
@employees_bp.route('/orders/<int:order_id>/status', methods=['PUT'])
@require_employee_auth
def update_order_status(order_id):
    try:
        data = request.get_json()
        status = data.get('status')
        employee_id = g.employee['id']  # Từ authentication decorator

        # Validate status
        valid_statuses = ['received', 'in_progress', 'ready_for_pickup', 'completed', 'cancelled']
        if status not in valid_statuses:
            return jsonify({
                'success': False,
                'error': 'Invalid status value'
            }), 400

        # Check if order exists and is assigned to this employee
        order = db.session.query(ServiceOrder).filter(
            ServiceOrder.id == order_id,
            or_(
                ServiceOrder.employee_id == employee_id,
                ServiceOrder.employee_id.is_(None)
            )
        ).first()

        if not order:
            return jsonify({
                'success': False,
                'error': 'Order not found or not assigned to you'
            }), 404

        # Validate state transition
        valid_transitions = {
            'received': ['in_progress', 'cancelled'],
            'in_progress': ['ready_for_pickup', 'cancelled'],
            'ready_for_pickup': ['completed'],
            'completed': [],
            'cancelled': []
        }

        if status not in valid_transitions.get(order.status, []):
            return jsonify({
                'success': False,
                'error': f'Cannot transition from {order.status} to {status}'
            }), 400

        # Update order status
        order.status = status
        order.updated_at = datetime.utcnow()
        if not order.employee_id:
            order.employee_id = employee_id

        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Order status updated successfully',
            'data': {
                'id': order.id,
                'status': order.status,
                'updated_at': order.updated_at.isoformat()
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f'Error updating order status: {e}')
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500
```

## Testing

### Test Cases Cần Kiểm Tra

1. **Success Case**
   - PUT `/api/employees/orders/3/status` với body `{ "status": "ready_for_pickup" }`
   - Expected: 200 OK với response success

2. **Invalid Status**
   - PUT với status không hợp lệ (ví dụ: "invalid_status")
   - Expected: 400 Bad Request

3. **Order Not Found**
   - PUT với order_id không tồn tại
   - Expected: 404 Not Found

4. **Order Not Assigned**
   - PUT với order_id không được gán cho nhân viên
   - Expected: 404 Not Found hoặc 403 Forbidden

5. **Invalid State Transition**
   - PUT để chuyển từ "completed" sang "in_progress"
   - Expected: 400 Bad Request với message về state transition

6. **Unauthorized**
   - PUT không có token hoặc token không hợp lệ
   - Expected: 401 Unauthorized

## Tóm Tắt

**Endpoint cần thêm**: `PUT /api/employees/orders/:id/status`

**Request Body**:
```json
{
  "status": "ready_for_pickup",
  "employee_id": "123"
}
```

**Lưu ý**: `employee_id` có thể lấy từ:
- Request body (ưu tiên)
- Authenticated employee từ token/session
- Query parameter (nếu backend hỗ trợ)

**Response Success**:
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "data": {
    "id": 3,
    "status": "ready_for_pickup",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

**Các trường hợp lỗi cần xử lý**:
- 400: Invalid status value hoặc invalid state transition
- 401: Unauthorized
- 403: Forbidden (không có quyền cập nhật đơn này)
- 404: Order not found
- 500: Internal server error

---

**Lưu ý**: Sau khi backend implement xong, frontend đã sẵn sàng sử dụng endpoint này. Không cần thay đổi gì ở frontend.

