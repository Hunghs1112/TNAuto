# TÀI LIỆU API - TNAUTO BACKEND

## 📋 TỔNG QUAN

**TNAUTO Backend** là hệ thống API RESTful cho ứng dụng quản lý trung tâm bảo dưỡng xe ô tô, hỗ trợ cả ứng dụng di động (khách hàng & nhân viên) và trang quản trị web.

### Thông Tin Chung
- **Base URL**: `http://your-domain/api`
- **Framework**: Express.js (Node.js)
- **Database**: MySQL
- **Authentication**: Phone-based login
- **Push Notification**: Firebase Cloud Messaging (FCM)
- **File Upload**: Multer + Local Storage

### API Documentation
- **Swagger UI**: `http://your-domain/api-docs`
- **Health Check**: `http://your-domain/health`

---

## 🏗️ CẤU TRÚC HỆ THỐNG

Hệ thống gồm 2 loại API chính:
- **📱 MOBILE API**: Dành cho ứng dụng di động (khách hàng & nhân viên)
- **👨‍💼 ADMIN API**: Dành cho trang quản trị web

---

## 📚 DANH MỤC API THEO MODULE

Hệ thống gồm **14 modules API** chính:

### 1️⃣ KHÁCH HÀNG (CUSTOMERS)
**Base URL**: `/api/customers`

#### 📱 Mobile Endpoints
| Method | Endpoint | Mô Tả |
|--------|----------|-------|
| `POST` | `/register` | Đăng ký khách hàng mới (có validation) |
| `POST` | `/login` | Đăng nhập bằng số điện thoại |
| `PUT` | `/profile` | Cập nhật thông tin cá nhân |
| `DELETE` | `/account` | Xóa tài khoản |
| `GET` | `/services` | Lấy danh sách dịch vụ |
| `GET` | `/orders` | Lấy danh sách đơn hàng của khách |
| `POST` | `/orders` | Tạo đơn hàng mới |
| `GET` | `/orders/:id` | Xem chi tiết đơn hàng |
| `GET` | `/vehicles` | Lấy danh sách xe của khách |

#### 👨‍💼 Admin Endpoints
| Method | Endpoint | Mô Tả |
|--------|----------|-------|
| `GET` | `/` | Lấy tất cả khách hàng (có phân trang & tìm kiếm) |
| `GET` | `/stats` | Thống kê khách hàng |
| `GET` | `/:id` | Xem chi tiết khách hàng |
| `PUT` | `/:id` | Cập nhật thông tin khách hàng |
| `PATCH` | `/:id` | Cập nhật một phần thông tin |
| `DELETE` | `/:id` | Xóa khách hàng |
| `POST` | `/:id/upload-avatar` | Upload avatar khách hàng |

---

### 2️⃣ NHÂN VIÊN (EMPLOYEES)
**Base URL**: `/api/employees`

#### 📱 Mobile Endpoints
| Method | Endpoint | Mô Tả |
|--------|----------|-------|
| `POST` | `/login` | Đăng nhập nhân viên |
| `GET` | `/orders/assigned` | Lấy đơn hàng được phân công |
| `GET` | `/orders` | Lấy tất cả đơn hàng của nhân viên |
| `GET` | `/orders/:id` | Chi tiết đơn hàng |

#### 👨‍💼 Admin Endpoints
| Method | Endpoint | Mô Tả |
|--------|----------|-------|
| `GET` | `/` | Lấy tất cả nhân viên (có phân trang & tìm kiếm) |
| `GET` | `/stats` | Thống kê nhân viên |
| `POST` | `/` | Tạo nhân viên mới |
| `GET` | `/:id` | Xem chi tiết nhân viên |
| `PUT` | `/:id` | Cập nhật nhân viên |
| `DELETE` | `/:id` | Xóa nhân viên |
| `POST` | `/assign-order` | Phân công đơn hàng cho nhân viên |
| `POST` | `/:id/upload-avatar` | Upload avatar nhân viên |

---

### 3️⃣ DỊCH VỤ (SERVICES)
**Base URL**: `/api/services`

#### 📱 Public Endpoints (Cached 5 phút)
| Method | Endpoint | Mô Tả |
|--------|----------|-------|
| `GET` | `/` | Lấy tất cả dịch vụ |
| `GET` | `/:id` | Xem chi tiết dịch vụ |

#### 👨‍💼 Admin Endpoints
| Method | Endpoint | Mô Tả |
|--------|----------|-------|
| `GET` | `/admin/stats` | Thống kê dịch vụ |
| `POST` | `/admin` | Tạo dịch vụ mới |
| `PUT` | `/admin/:id` | Cập nhật dịch vụ |
| `DELETE` | `/admin/:id` | Xóa dịch vụ |
| `POST` | `/admin/:id/upload-image` | Upload ảnh dịch vụ |

---

### 4️⃣ SẢN PHẨM (PRODUCTS)
**Base URL**: `/api/products`

#### 📱 Public Endpoints (Cached 5 phút)
| Method | Endpoint | Mô Tả |
|--------|----------|-------|
| `GET` | `/` | Lấy tất cả sản phẩm |
| `GET` | `/:id` | Xem chi tiết sản phẩm |
| `GET` | `/:productId/images` | Lấy danh sách ảnh sản phẩm |

#### 👨‍💼 Admin Endpoints
| Method | Endpoint | Mô Tả |
|--------|----------|-------|
| `GET` | `/admin/stats` | Thống kê sản phẩm |
| `POST` | `/admin` | Tạo sản phẩm mới |
| `PUT` | `/admin/:id` | Cập nhật sản phẩm |
| `DELETE` | `/admin/:id` | Xóa sản phẩm |

#### 🖼️ Product Images Management
| Method | Endpoint | Mô Tả |
|--------|----------|-------|
| `POST` | `/images` | Thêm ảnh sản phẩm |
| `PUT` | `/images/:id` | Cập nhật ảnh sản phẩm |
| `DELETE` | `/images/:id` | Xóa ảnh sản phẩm |

---

### 5️⃣ DANH MỤC (CATEGORIES)
**Base URL**: `/api/categories`

#### 📱 Public Endpoints
| Method | Endpoint | Mô Tả | Cache |
|--------|----------|-------|-------|
| `GET` | `/` | Lấy tất cả danh mục | 10 phút |
| `GET` | `/:id` | Xem chi tiết danh mục (kèm sản phẩm) | 5 phút |

#### 👨‍💼 Admin Endpoints
| Method | Endpoint | Mô Tả |
|--------|----------|-------|
| `GET` | `/admin/stats` | Thống kê danh mục |
| `POST` | `/admin` | Tạo danh mục mới |
| `PUT` | `/admin/:id` | Cập nhật danh mục |
| `DELETE` | `/admin/:id` | Xóa danh mục |
| `POST` | `/admin/:id/upload-image` | Upload ảnh danh mục |

---

### 6️⃣ ĐỞN DỊCH VỤ (SERVICE ORDERS)
**Base URL**: `/api/service-orders`

#### 📱 Public Endpoints
| Method | Endpoint | Mô Tả |
|--------|----------|-------|
| `GET` | `/:id` | Xem chi tiết đơn dịch vụ |
| `POST` | `/` | Tạo đơn dịch vụ mới |

#### 👨‍💼 Admin Endpoints
| Method | Endpoint | Mô Tả |
|--------|----------|-------|
| `GET` | `/` | Lấy tất cả đơn (có filter & phân trang) |
| `GET` | `/admin/stats` | Thống kê đơn dịch vụ |
| `PUT` | `/admin/:id/status` | Cập nhật trạng thái đơn |
| `PATCH` | `/admin/:id/complete` | Hoàn thành đơn (tạo bảo hành) |
| `PATCH` | `/admin/:id/assign` | Phân công nhân viên |
| `DELETE` | `/admin/:id` | Xóa đơn dịch vụ |

---

### 7️⃣ ẢNH ĐƠN DỊCH VỤ (SERVICE ORDER IMAGES)
**Base URL**: `/api/service-order-images`

#### 📱 Public Endpoints
| Method | Endpoint | Mô Tả |
|--------|----------|-------|
| `GET` | `/:order_id` | Lấy tất cả ảnh của đơn dịch vụ |
| `POST` | `/` | Thêm ảnh mới cho đơn dịch vụ |
| `PUT` | `/:id` | Cập nhật thông tin ảnh |
| `DELETE` | `/:id` | Xóa ảnh |

**Note**: Ảnh được phân loại theo trạng thái: `received`, `in_progress`, `completed`

---

### 8️⃣ PHƯƠNG TIỆN (VEHICLES)
**Base URL**: `/api/vehicles`

#### 📱 Public Endpoints
| Method | Endpoint | Mô Tả |
|--------|----------|-------|
| `GET` | `/` | Lấy xe của khách hàng |
| `GET` | `/search` | Tìm kiếm theo biển số |
| `GET` | `/:id` | Chi tiết phương tiện |
| `POST` | `/` | Tạo phương tiện mới |

#### 👨‍💼 Admin Endpoints
| Method | Endpoint | Mô Tả |
|--------|----------|-------|
| `GET` | `/admin/all` | Lấy tất cả xe (có phân trang & filter) |
| `GET` | `/admin/stats` | Thống kê phương tiện |
| `PUT` | `/admin/:id` | Cập nhật phương tiện |
| `DELETE` | `/admin/:id` | Xóa phương tiện |
| `POST` | `/admin/:id/upload-image` | Upload ảnh xe |

---

### 9️⃣ ƯU ĐÃI (OFFERS)
**Base URL**: `/api/offers`

#### 📱 Public Endpoints
| Method | Endpoint | Mô Tả |
|--------|----------|-------|
| `GET` | `/` | Lấy tất cả ưu đãi |
| `GET` | `/:id` | Chi tiết ưu đãi |

#### 👨‍💼 Admin Endpoints
| Method | Endpoint | Mô Tả |
|--------|----------|-------|
| `GET` | `/admin/stats` | Thống kê ưu đãi |
| `POST` | `/admin` | Tạo ưu đãi mới |
| `PUT` | `/admin/:id` | Cập nhật ưu đãi |
| `DELETE` | `/admin/:id` | Xóa ưu đãi |
| `POST` | `/admin/:id/upload-image` | Upload ảnh ưu đãi |

---

### 🔟 BẢO HÀNH (WARRANTIES)
**Base URL**: `/api/warranties`

#### 📱 Public Endpoints
| Method | Endpoint | Mô Tả |
|--------|----------|-------|
| `GET` | `/:id` | Xem chi tiết bảo hành |

#### 👨‍💼 Admin Endpoints
| Method | Endpoint | Mô Tả |
|--------|----------|-------|
| `GET` | `/` | Lấy tất cả bảo hành |
| `GET` | `/admin/stats` | Thống kê bảo hành |
| `POST` | `/admin` | Tạo bảo hành mới |
| `PUT` | `/admin/:id` | Cập nhật bảo hành |
| `DELETE` | `/admin/:id` | Xóa bảo hành |

---

### 1️⃣1️⃣ THÔNG BÁO (NOTIFICATIONS)
**Base URL**: `/api/notifications`

#### 📱 User Endpoints
| Method | Endpoint | Mô Tả |
|--------|----------|-------|
| `GET` | `/` | Lấy thông báo của user |
| `GET` | `/unread-count` | Đếm số thông báo chưa đọc |
| `PUT` | `/:id/read` | Đánh dấu đã đọc |
| `PUT` | `/read-all` | Đánh dấu tất cả đã đọc |
| `DELETE` | `/:id` | Xóa thông báo |

#### 👨‍💼 Admin Endpoints
| Method | Endpoint | Mô Tả |
|--------|----------|-------|
| `GET` | `/admin/all` | Lấy tất cả thông báo (có phân trang & filter) |
| `GET` | `/admin/stats` | Thống kê thông báo |
| `POST` | `/send` | Gửi thông báo tùy chỉnh |

---

### 1️⃣2️⃣ FCM TOKEN (Push Notification Tokens)
**Base URL**: `/api/fcm-tokens`

#### 📱 User Endpoints
| Method | Endpoint | Mô Tả |
|--------|----------|-------|
| `POST` | `/register` | Đăng ký/cập nhật FCM token |
| `POST` | `/refresh` | Làm mới token |
| `GET` | `/user` | Lấy token của user |
| `DELETE` | `/` | Xóa token (logout) |

#### 👨‍💼 Admin & System Endpoints
| Method | Endpoint | Mô Tả |
|--------|----------|-------|
| `GET` | `/active` | Lấy tất cả token đang hoạt động |
| `GET` | `/stats` | Thống kê token |
| `POST` | `/deactivate-inactive` | Vô hiệu hóa token không hoạt động (>10 phút) |
| `DELETE` | `/cleanup` | Dọn dẹp token cũ (>30 ngày) |

---

### 1️⃣3️⃣ PUSH NOTIFICATIONS
**Base URL**: `/api/push-notifications`

#### 👨‍💼 Admin Endpoints
| Method | Endpoint | Mô Tả |
|--------|----------|-------|
| `POST` | `/send-to-user` | Gửi thông báo cho 1 user cụ thể |
| `POST` | `/send-to-all` | Gửi thông báo cho tất cả user theo loại |
| `POST` | `/send-to-topic` | Gửi thông báo theo topic |
| `POST` | `/test` | Test thông báo |
| `GET` | `/health` | Kiểm tra trạng thái Firebase |
| `GET` | `/stats` | Thống kê push notification |

---

### 1️⃣4️⃣ UPLOAD (File Upload)
**Base URL**: `/api/upload`

#### 📱 Public Endpoints
| Method | Endpoint | Mô Tả |
|--------|----------|-------|
| `POST` | `/single` | Upload 1 ảnh |
| `POST` | `/multiple` | Upload nhiều ảnh (tối đa 10) |
| `DELETE` | `/:filename` | Xóa file đã upload |

**Note**: File upload sử dụng `multipart/form-data`:
- Single upload: field name = `image`
- Multiple upload: field name = `images`

**Static Files**: Truy cập file đã upload tại `/uploads/:filename`

---

## 🔧 TÍNH NĂNG KỸ THUẬT

### 1. Caching
- **Danh mục**: Cache 10 phút
- **Sản phẩm & Dịch vụ**: Cache 5 phút
- Sử dụng in-memory cache

### 2. Rate Limiting
- **Giới hạn**: 1000 requests / 15 phút
- Áp dụng cho tất cả `/api/*` endpoints

### 3. Validation
- Middleware validation cho đăng ký khách hàng
- Kiểm tra dữ liệu đầu vào

### 4. Error Handling
- Xử lý lỗi tập trung
- Response format chuẩn:
```json
{
  "success": false,
  "error": "Error message",
  "details": "Detailed information"
}
```

### 5. Compression
- Tự động nén response để tối ưu băng thông

### 6. Background Jobs
- **Token Cleanup**: Tự động dọn dẹp FCM token cũ
- **Token Refresh**: Làm mới token định kỳ
- Sử dụng `node-cron`

---

## 📊 STATUS CODES

| Code | Ý Nghĩa |
|------|---------|
| `200` | Thành công |
| `201` | Tạo mới thành công |
| `400` | Lỗi dữ liệu đầu vào |
| `404` | Không tìm thấy |
| `429` | Quá nhiều request (rate limit) |
| `500` | Lỗi server |
| `503` | Service không khả dụng |

---

## 🔐 AUTHENTICATION

Hiện tại hệ thống sử dụng **phone-based authentication**:
- Khách hàng: Đăng nhập bằng số điện thoại
- Nhân viên: Đăng nhập bằng employee ID và password/phone

**Note**: Có thể bổ sung JWT authentication trong tương lai cho bảo mật cao hơn.

---

## 📱 PUSH NOTIFICATION FLOW

1. **Client đăng ký**: Gọi `/api/fcm-tokens/register` với FCM token
2. **Server lưu token**: Lưu vào database với user_id & user_type
3. **Gửi thông báo**: 
   - Backend tự động gửi khi có sự kiện (đơn hàng mới, cập nhật...)
   - Admin có thể gửi thủ công qua `/api/push-notifications/send-*`
4. **Client nhận**: Hiển thị thông báo trên app
5. **Tracking**: Lưu lịch sử thông báo vào database

---

## 🗄️ DATABASE

- **Type**: MySQL
- **Connection Pool**: Sử dụng mysql2 với connection pool
- **Tables chính**:
  - customers
  - employees
  - services
  - products
  - categories
  - service_orders
  - vehicles
  - warranties
  - notifications
  - fcm_tokens
  - offers

**File SQL**: `tnauto.sql` (import để tạo database)

---

## 🚀 DEPLOYMENT

### Environment Variables
Cần thiết lập các biến môi trường:
```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=tnauto

# Server
PORT=3000
NODE_ENV=production

# Firebase (cho push notification)
FIREBASE_PROJECT_ID=your_project_id
# ... other Firebase configs
```

### Start Server
```bash
# Development
npm run dev

# Production
npm start
```

---

## 📞 SUPPORT

- **Health Check**: `GET /health` - Kiểm tra trạng thái server và database
- **API Docs**: `/api-docs` - Swagger UI documentation

---

## 📝 NOTES

1. **Phân quyền**: Hiện tại chưa có middleware kiểm tra admin role, cần bổ sung
2. **Pagination**: Hầu hết list API đều hỗ trợ phân trang (page, limit)
3. **Search**: Admin endpoints hỗ trợ tìm kiếm (search query param)
4. **Filters**: Service orders, vehicles hỗ trợ lọc theo nhiều tiêu chí
5. **Image Upload**: Lưu local trong folder `uploads/`, có thể nâng cấp lên Cloudinary

---

**Version**: 1.0.0  
**Last Updated**: October 2025  
**Maintained by**: TNAUTO Development Team

