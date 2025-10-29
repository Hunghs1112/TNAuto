# 🔄 YÊU CẦU CẬP NHẬT BACKEND - UNIFIED LOGIN FLOW

**Version**: 1.1.0  
**Ngày tạo**: October 21, 2025  
**Mức độ ưu tiên**: HIGH  
**Ảnh hưởng**: Authentication Flow

---

## 📋 TỔNG QUAN

### Vấn đề hiện tại
- Giao diện login có 2 mode riêng biệt (khách hàng / nhân viên)
- User phải biết trước mình là loại tài khoản nào
- UX không tối ưu, gây rối cho người dùng

### Giải pháp mới
- **Unified Login**: User chỉ cần nhập số điện thoại
- Hệ thống tự động phát hiện loại tài khoản:
  - **Khách hàng** → Đăng nhập trực tiếp (không cần mật khẩu)
  - **Nhân viên** → Yêu cầu nhập mật khẩu ở màn hình tiếp theo
  - **Chưa đăng ký** → Đề xuất đăng ký

---

## 🆕 API MỚI CẦN TẠO

### 📍 **Endpoint**: `POST /api/auth/check-phone`

**Mục đích**: Kiểm tra số điện thoại và xác định loại user

**Route location**: `routes/authRoutes.js` (tạo mới nếu chưa có)

---

## 📥 REQUEST FORMAT

### Headers
```http
Content-Type: application/json
```

### Body
```json
{
  "phone": "0901234567"
}
```

### Validation Rules
- `phone` là **bắt buộc** (required)
- `phone` phải là string
- Nên validate format số điện thoại Việt Nam (optional nhưng recommended)

---

## 📤 RESPONSE FORMAT

### ✅ **Case 1: Tìm thấy khách hàng**

**HTTP Status**: `200 OK`

```json
{
  "success": true,
  "user_type": "customer",
  "message": "Customer account found",
  "data": {
    "id": 123,
    "name": "Nguyễn Văn A",
    "phone": "0901234567",
    "email": "nguyenvana@email.com",
    "license_plate": "30A-12345",
    "avatar_url": "https://example.com/avatar.jpg"
  }
}
```

---

### 👷 **Case 2: Tìm thấy nhân viên**

**HTTP Status**: `200 OK`

```json
{
  "success": true,
  "user_type": "employee",
  "message": "Employee account found",
  "data": {
    "id": 45,
    "name": "Trần Thị B",
    "phone": "0912345678",
    "position": "Kỹ thuật viên",
    "avatar_url": "https://example.com/avatar-employee.jpg"
  }
}
```

**⚠️ LƯU Ý**: 
- **KHÔNG trả về password** trong response
- **KHÔNG trả về các thông tin nhạy cảm** (employee_id nội bộ, v.v.)

---

### ❌ **Case 3: Không tìm thấy**

**HTTP Status**: `200 OK`

```json
{
  "success": true,
  "user_type": "not_found",
  "message": "Phone number not registered"
}
```

**Note**: Vẫn trả `200 OK` vì đây không phải lỗi server, chỉ là không tìm thấy user.

---

### 🚫 **Case 4: Lỗi validation**

**HTTP Status**: `400 Bad Request`

```json
{
  "success": false,
  "error": "Phone number is required"
}
```

Hoặc:

```json
{
  "success": false,
  "error": "Invalid phone number format"
}
```

---

### ⚠️ **Case 5: Lỗi server**

**HTTP Status**: `500 Internal Server Error`

```json
{
  "success": false,
  "error": "Database connection error",
  "details": "Error details for debugging (chỉ trong dev mode)"
}
```

---

## 💻 IMPLEMENTATION LOGIC

### Flowchart

```
START
  ↓
Nhận request với phone
  ↓
Validate phone (required, format)
  ↓ OK
Query database: SELECT * FROM customers WHERE phone = ?
  ↓
Có kết quả? → YES → Return user_type: "customer" + data
  ↓ NO
Query database: SELECT * FROM employees WHERE phone = ?
  ↓
Có kết quả? → YES → Return user_type: "employee" + data
  ↓ NO
Return user_type: "not_found"
```

---

## 📝 SAMPLE CODE (Node.js + Express + MySQL)

### 1. Tạo route file: `routes/authRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const db = require('../config/database'); // Your database connection

/**
 * POST /api/auth/check-phone
 * Check if phone number exists and return user type
 */
router.post('/check-phone', async (req, res) => {
  const { phone } = req.body;
  
  // Validation
  if (!phone) {
    return res.status(400).json({ 
      success: false, 
      error: 'Phone number is required' 
    });
  }

  // Optional: Validate phone format (Vietnamese phone numbers)
  const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
  if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid phone number format' 
    });
  }

  try {
    // Step 1: Check in customers table
    const [customers] = await db.query(
      'SELECT id, name, phone, email, license_plate, avatar_url FROM customers WHERE phone = ?',
      [phone]
    );
    
    if (customers.length > 0) {
      const customer = customers[0];
      return res.json({
        success: true,
        user_type: 'customer',
        message: 'Customer account found',
        data: {
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          email: customer.email || null,
          license_plate: customer.license_plate || null,
          avatar_url: customer.avatar_url || null
        }
      });
    }
    
    // Step 2: Check in employees table
    const [employees] = await db.query(
      'SELECT id, name, phone, position, avatar_url FROM employees WHERE phone = ?',
      [phone]
    );
    
    if (employees.length > 0) {
      const employee = employees[0];
      return res.json({
        success: true,
        user_type: 'employee',
        message: 'Employee account found',
        data: {
          id: employee.id,
          name: employee.name,
          phone: employee.phone,
          position: employee.position || null,
          avatar_url: employee.avatar_url || null
        }
      });
    }
    
    // Step 3: Not found
    return res.json({
      success: true,
      user_type: 'not_found',
      message: 'Phone number not registered'
    });
    
  } catch (error) {
    console.error('Check phone error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
```

---

### 2. Đăng ký route trong `app.js` hoặc `server.js`

```javascript
const authRoutes = require('./routes/authRoutes');

// ... existing code ...

app.use('/api/auth', authRoutes);
```

---

## 🧪 TEST CASES

### Test Case 1: Valid Customer Phone
**Request**:
```bash
curl -X POST http://localhost:3000/api/auth/check-phone \
  -H "Content-Type: application/json" \
  -d '{"phone": "0901234567"}'
```

**Expected Response**: `200 OK` với `user_type: "customer"`

---

### Test Case 2: Valid Employee Phone
**Request**:
```bash
curl -X POST http://localhost:3000/api/auth/check-phone \
  -H "Content-Type: application/json" \
  -d '{"phone": "0912345678"}'
```

**Expected Response**: `200 OK` với `user_type: "employee"`

---

### Test Case 3: Unregistered Phone
**Request**:
```bash
curl -X POST http://localhost:3000/api/auth/check-phone \
  -H "Content-Type: application/json" \
  -d '{"phone": "0999999999"}'
```

**Expected Response**: `200 OK` với `user_type: "not_found"`

---

### Test Case 4: Missing Phone
**Request**:
```bash
curl -X POST http://localhost:3000/api/auth/check-phone \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected Response**: `400 Bad Request` với error message

---

### Test Case 5: Invalid Phone Format
**Request**:
```bash
curl -X POST http://localhost:3000/api/auth/check-phone \
  -H "Content-Type: application/json" \
  -d '{"phone": "123"}'
```

**Expected Response**: `400 Bad Request` với error message

---

## 🔒 SECURITY CONSIDERATIONS

### ✅ DO's
1. ✅ **Luôn validate input** (phone format, required fields)
2. ✅ **Không trả về password** trong response
3. ✅ **Không trả về thông tin nhạy cảm** (employee_id nội bộ, salary, v.v.)
4. ✅ **Log errors** để debug nhưng không expose trong production
5. ✅ **Rate limiting**: Áp dụng rate limit cho endpoint này (tránh brute force)

### ❌ DON'Ts
1. ❌ **Không trả về chi tiết lỗi database** trong production
2. ❌ **Không trả về stack trace** cho client
3. ❌ **Không expose thông tin về cấu trúc database**

---

## 📊 PERFORMANCE CONSIDERATIONS

### Database Optimization
1. **Index**: Đảm bảo có index trên cột `phone` trong cả 2 bảng:
   ```sql
   CREATE INDEX idx_customers_phone ON customers(phone);
   CREATE INDEX idx_employees_phone ON employees(phone);
   ```

2. **Query Optimization**: Sử dụng `LIMIT 1` vì chỉ cần 1 kết quả:
   ```sql
   SELECT ... FROM customers WHERE phone = ? LIMIT 1;
   ```

3. **Connection Pooling**: Đảm bảo sử dụng connection pool cho database

---

## 🔄 MIGRATION PLAN

### Backward Compatibility
- ✅ API cũ vẫn hoạt động bình thường:
  - `POST /api/customers/login` (không thay đổi)
  - `POST /api/employees/login` (không thay đổi)
- ✅ API mới là **bổ sung**, không thay thế

### Rollout Strategy
1. **Phase 1**: Deploy backend với API mới
2. **Phase 2**: Test API mới trên staging
3. **Phase 3**: Update mobile app với flow mới
4. **Phase 4**: Monitor và thu thập feedback
5. **Phase 5** (tương lai): Có thể deprecate API cũ nếu cần

---

## 📚 DOCUMENTATION UPDATE

### Cập nhật file `API_DOCUMENTATION.md`

Thêm section mới:

```markdown
### 🔐 AUTHENTICATION
**Base URL**: `/api/auth`

#### 📱 Public Endpoints
| Method | Endpoint | Mô Tả | Cache |
|--------|----------|-------|-------|
| `POST` | `/check-phone` | Kiểm tra số điện thoại và xác định loại user | No cache |

**Request Body**:
```json
{
  "phone": "0901234567"
}
```

**Response**:
```json
{
  "success": true,
  "user_type": "customer" | "employee" | "not_found",
  "message": "...",
  "data": { ... }
}
```

**User Types**:
- `customer`: Tài khoản khách hàng (tự động đăng nhập, không cần mật khẩu)
- `employee`: Tài khoản nhân viên (yêu cầu mật khẩu)
- `not_found`: Số điện thoại chưa đăng ký
```

---

## 📞 SUPPORT & QUESTIONS

### Implementation Questions?
- Check existing login endpoints: `/api/customers/login`, `/api/employees/login`
- Database schema: Xem file `tnauto.sql`
- Similar pattern: Endpoint này tương tự như login nhưng không authenticate

### Testing Support
- Postman collection sẽ được cung cấp sau khi implement
- Swagger docs sẽ được cập nhật tự động nếu có sử dụng swagger-jsdoc

---

## ✅ CHECKLIST

**Backend Developer**: Vui lòng check các items sau khi hoàn thành:

- [ ] Tạo file `routes/authRoutes.js`
- [ ] Implement logic check phone theo flowchart
- [ ] Validate input (phone required, format)
- [ ] Test với phone của customer → trả về đúng data
- [ ] Test với phone của employee → trả về đúng data
- [ ] Test với phone không tồn tại → trả về not_found
- [ ] Test với input không hợp lệ → trả về 400 error
- [ ] Đảm bảo không trả về password
- [ ] Kiểm tra performance (có index trên phone column)
- [ ] Áp dụng rate limiting
- [ ] Update API documentation
- [ ] Deploy lên staging
- [ ] Thông báo frontend team để test

---

## 📊 EXPECTED TIMELINE

- **Implementation**: 2-4 hours
- **Testing**: 1-2 hours
- **Documentation**: 30 minutes
- **Total**: ~1 working day

---

**Prepared by**: Frontend Team - TNAUTO  
**Last Updated**: October 21, 2025  
**Status**: Pending Implementation

---

## 📧 CONTACT

Nếu có thắc mắc, vui lòng liên hệ:
- Frontend Lead: [contact info]
- Project Manager: [contact info]

