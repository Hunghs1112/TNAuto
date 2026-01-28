# Hướng Dẫn Gửi Push Notification cho Backend

## Tổng Quan

Tài liệu này mô tả cách backend cần gửi push notification thông qua Firebase Cloud Messaging (FCM) để đảm bảo notification hiển thị trong mọi trường hợp:
- ✅ Khi app đang mở (foreground)
- ✅ Khi app ở background
- ✅ Khi app đã đóng hoàn toàn (terminated)
- ✅ Khi thiết bị bị khóa màn hình

## 1. Cấu Trúc Payload Notification

Backend cần gửi notification với cấu trúc sau để đảm bảo hoạt động trong mọi trường hợp:

### Format 1: Notification Payload (Khuyến nghị)

```json
{
  "notification": {
    "title": "Tiêu đề thông báo",
    "body": "Nội dung thông báo"
  },
  "data": {
    "type": "order_status_update",
    "order_id": "123",
    "status": "completed",
    "title": "Tiêu đề thông báo",
    "body": "Nội dung thông báo"
  },
  "token": "FCM_TOKEN_HERE",
  "android": {
    "priority": "high",
    "notification": {
      "channel_id": "orders",
      "sound": "default",
      "priority": "high"
    }
  },
  "apns": {
    "payload": {
      "aps": {
        "sound": "default",
        "badge": 1,
        "content-available": 1
      }
    }
  }
}
```

### Format 2: Data-Only Payload (Cũng được hỗ trợ)

```json
{
  "data": {
    "type": "order_status_update",
    "order_id": "123",
    "status": "completed",
    "title": "Tiêu đề thông báo",
    "body": "Nội dung thông báo",
    "message": "Nội dung thông báo (alternative)"
  },
  "token": "FCM_TOKEN_HERE",
  "android": {
    "priority": "high"
  },
  "apns": {
    "payload": {
      "aps": {
        "content-available": 1
      }
    }
  }
}
```

## 2. Các Trường Dữ Liệu Quan Trọng

### Trường `data` (Bắt buộc)

| Trường | Loại | Mô tả | Ví dụ |
|--------|------|-------|-------|
| `type` | string | Loại notification để app xử lý navigation | `"order_status_update"`, `"order_created"`, `"warranty_expiring"` |
| `order_id` | string (optional) | ID đơn hàng nếu notification liên quan đến order | `"123"` |
| `title` | string (optional) | Tiêu đề notification (nếu không có trong `notification.title`) | `"Đơn hàng đã hoàn thành"` |
| `body` | string (optional) | Nội dung notification (nếu không có trong `notification.body`) | `"Đơn hàng #123 đã được hoàn thành"` |
| `message` | string (optional) | Alternative cho `body` | `"Đơn hàng #123 đã được hoàn thành"` |

### Các Loại Notification Type

| Type | Mô tả | Navigation Destination |
|------|-------|------------------------|
| `order_created` | Đơn hàng mới được tạo | Màn hình chi tiết đơn hàng |
| `order_status_update` | Trạng thái đơn hàng thay đổi | Màn hình chi tiết đơn hàng |
| `order_assigned` | Đơn hàng được gán cho nhân viên | Màn hình chi tiết đơn hàng |
| `order_completed` | Đơn hàng hoàn thành | Màn hình chi tiết đơn hàng |
| `warranty_created` | Bảo hành mới được tạo | Màn hình bảo hành |
| `warranty_expiring` | Bảo hành sắp hết hạn | Màn hình bảo hành |

## 3. Cấu Hình Android

### Priority
- **Bắt buộc**: `"priority": "high"` để đảm bảo notification được gửi ngay lập tức
- Notification với priority thấp có thể bị delay hoặc không gửi khi thiết bị ở chế độ tiết kiệm pin

### Notification Channels
App tự động tạo các channels sau:
- `default`: Thông báo chung
- `orders`: Thông báo về đơn hàng
- `warranty`: Thông báo về bảo hành

Backend có thể chỉ định channel trong `android.notification.channel_id`:
```json
{
  "android": {
    "notification": {
      "channel_id": "orders"
    }
  }
}
```

## 4. Cấu Hình iOS

### Content Available
- **Bắt buộc**: `"content-available": 1` trong `apns.payload.aps` để đảm bảo notification được xử lý khi app ở background/terminated

### Sound và Badge
```json
{
  "apns": {
    "payload": {
      "aps": {
        "sound": "default",
        "badge": 1,
        "content-available": 1
      }
    }
  }
}
```

## 5. Ví Dụ Gửi Notification

### Ví dụ 1: Thông báo đơn hàng hoàn thành

```json
{
  "notification": {
    "title": "Đơn hàng hoàn thành",
    "body": "Đơn hàng #123 đã được hoàn thành và sẵn sàng giao hàng"
  },
  "data": {
    "type": "order_completed",
    "order_id": "123",
    "status": "completed"
  },
  "token": "FCM_TOKEN_HERE",
  "android": {
    "priority": "high",
    "notification": {
      "channel_id": "orders",
      "sound": "default",
      "priority": "high"
    }
  },
  "apns": {
    "payload": {
      "aps": {
        "sound": "default",
        "badge": 1,
        "content-available": 1
      }
    }
  }
}
```

### Ví dụ 2: Thông báo bảo hành sắp hết hạn

```json
{
  "notification": {
    "title": "Bảo hành sắp hết hạn",
    "body": "Bảo hành của bạn sẽ hết hạn trong 7 ngày"
  },
  "data": {
    "type": "warranty_expiring",
    "warranty_period": "7"
  },
  "token": "FCM_TOKEN_HERE",
  "android": {
    "priority": "high",
    "notification": {
      "channel_id": "warranty",
      "sound": "default",
      "priority": "high"
    }
  },
  "apns": {
    "payload": {
      "aps": {
        "sound": "default",
        "badge": 1,
        "content-available": 1
      }
    }
  }
}
```

## 6. API Endpoints Backend Cần Implement

### 6.1. Đăng ký FCM Token

**Endpoint**: `POST /api/notifications/fcm-tokens`

**Request Body**:
```json
{
  "user_id": "123",
  "user_type": "customer",  // hoặc "employee"
  "token": "FCM_TOKEN_HERE",
  "device_info": "ios 17.0"  // optional
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "message": "Token registered successfully",
    "token_id": 1,
    "is_new": true
  }
}
```

**Lưu ý**:
- Backend nên lưu token kèm với `user_id` và `user_type`
- Nếu token đã tồn tại cho user, có thể update thay vì tạo mới
- Token có thể được refresh bởi Firebase, backend nên handle update

### 6.2. Xóa FCM Token

**Endpoint**: `DELETE /api/notifications/fcm-tokens`

**Request Body**:
```json
{
  "token": "FCM_TOKEN_HERE"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "message": "Token deleted successfully"
  }
}
```

**Khi nào gọi**:
- Khi user logout
- Khi user xóa app
- Khi token không còn hợp lệ

## 7. Quy Trình Gửi Notification

### Bước 1: Lấy FCM Token từ Database

```sql
SELECT token FROM fcm_tokens 
WHERE user_id = ? AND user_type = ? AND is_active = 1
```

### Bước 2: Gửi qua FCM API

Sử dụng Firebase Admin SDK hoặc FCM REST API:

**Firebase Admin SDK (Node.js)**:
```javascript
const admin = require('firebase-admin');

const message = {
  notification: {
    title: 'Tiêu đề',
    body: 'Nội dung'
  },
  data: {
    type: 'order_status_update',
    order_id: '123'
  },
  token: fcmToken,
  android: {
    priority: 'high',
    notification: {
      channelId: 'orders'
    }
  },
  apns: {
    payload: {
      aps: {
        sound: 'default',
        badge: 1,
        'content-available': 1
      }
    }
  }
};

await admin.messaging().send(message);
```

**FCM REST API**:
```bash
curl -X POST https://fcm.googleapis.com/v1/projects/YOUR_PROJECT_ID/messages:send \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "token": "FCM_TOKEN",
      "notification": {
        "title": "Tiêu đề",
        "body": "Nội dung"
      },
      "data": {
        "type": "order_status_update",
        "order_id": "123"
      },
      "android": {
        "priority": "high"
      },
      "apns": {
        "payload": {
          "aps": {
            "sound": "default",
            "badge": 1,
            "content-available": 1
          }
        }
      }
    }
  }'
```

### Bước 3: Xử lý Response

- **Success**: Notification đã được gửi thành công
- **Invalid Token**: Token không còn hợp lệ, đánh dấu `is_active = 0` trong database
- **Error**: Log lỗi và retry nếu cần

## 8. Best Practices

### 8.1. Priority
- **Luôn sử dụng**: `"priority": "high"` cho Android
- **Luôn sử dụng**: `"content-available": 1` cho iOS

### 8.2. Token Management
- Lưu token kèm với user_id và user_type
- Đánh dấu token không hợp lệ khi FCM trả về lỗi
- Cleanup token cũ khi user đăng nhập trên thiết bị mới

### 8.3. Retry Logic
- Retry khi gửi thất bại do network error
- Không retry khi token invalid
- Giới hạn số lần retry (ví dụ: 3 lần)

### 8.4. Batch Sending
- Khi gửi cho nhiều user, sử dụng FCM batch API hoặc sendMulticast
- Giới hạn số lượng token mỗi batch (ví dụ: 500 tokens)

## 9. Testing

### Test Cases Cần Kiểm Tra

1. **App đang mở (Foreground)**
   - Notification hiển thị trong app
   - Tap notification → Navigate đúng màn hình

2. **App ở background**
   - Notification hiển thị trên notification tray
   - Tap notification → App mở và navigate đúng màn hình

3. **App đã đóng (Terminated)**
   - Notification hiển thị trên notification tray
   - Tap notification → App mở và navigate đúng màn hình

4. **Thiết bị bị khóa**
   - Notification hiển thị trên lock screen
   - Tap notification → Unlock và mở app, navigate đúng màn hình

5. **Data-only notification**
   - Notification vẫn hiển thị đúng
   - App xử lý được data payload

## 10. Troubleshooting

### Notification không hiển thị

1. **Kiểm tra token có hợp lệ không**
   - Token phải được đăng ký từ app
   - Token không bị expired

2. **Kiểm tra priority**
   - Android: Phải có `"priority": "high"`
   - iOS: Phải có `"content-available": 1`

3. **Kiểm tra permissions**
   - User đã cho phép notification
   - Android 13+: Cần permission POST_NOTIFICATIONS

4. **Kiểm tra app state**
   - Background handler đã được đăng ký trong index.js
   - NotificationService đã được initialize

### Notification hiển thị nhưng không navigate

1. **Kiểm tra data payload**
   - Phải có trường `type`
   - Phải có `order_id` nếu là notification về order

2. **Kiểm tra navigation**
   - Screen name phải đúng
   - Navigation đã được setup

## 11. Tóm Tắt

### Checklist cho Backend

- [ ] Implement API đăng ký/xóa FCM token
- [ ] Lưu token kèm với user_id và user_type
- [ ] Gửi notification với format đúng (có cả `notification` và `data`)
- [ ] Sử dụng `priority: "high"` cho Android
- [ ] Sử dụng `content-available: 1` cho iOS
- [ ] Xử lý invalid token (đánh dấu inactive)
- [ ] Implement retry logic cho network errors
- [ ] Test trong mọi trường hợp (foreground, background, terminated, locked)

### Format Tối Thiểu

```json
{
  "notification": {
    "title": "Tiêu đề",
    "body": "Nội dung"
  },
  "data": {
    "type": "order_status_update",
    "order_id": "123"
  },
  "token": "FCM_TOKEN",
  "android": {
    "priority": "high"
  },
  "apns": {
    "payload": {
      "aps": {
        "content-available": 1
      }
    }
  }
}
```

---

**Lưu ý**: Tài liệu này dựa trên implementation hiện tại của app. Nếu có thay đổi, vui lòng cập nhật tài liệu này.













