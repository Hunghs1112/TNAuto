# Implementation Tasks

## Tasks

- [x] 1. Tăng shadow cho Header component
  - Mở `src/components/Header.tsx`
  - Trong `styles.header`, cập nhật shadow:
    - `elevation: 10` (Android)
    - `shadowOpacity: 0.18`
    - `shadowRadius: 10`
    - `shadowOffset: { width: 0, height: 5 }`
    - `shadowColor: "#000"` (giữ nguyên)
  - Giữ nguyên tất cả các thuộc tính khác
  - **Acceptance**: Header có shadow rõ hơn, tách biệt với nội dung bên dưới
  - _Requirements: 1_

- [x] 2. Redesign VehicleInfoCard thành thẻ ngang gradient
  - Mở `src/screens/Home/VehicleInfoCard.tsx`
  - Thêm import `LinearGradient from "react-native-linear-gradient"` (đã có sẵn trong project)
  - Thêm helper `getExpiryMeta` (copy logic từ `DocumentExpiryCards.tsx`) để tính trạng thái hạn sử dụng
  - Redesign layout chính (state có xe) thành:
    - Outer: `TouchableOpacity` → `LinearGradient` (colors: `Colors.gradients.primary`, start `{x:0,y:0}`, end `{x:1,y:1}`), borderRadius 20, shadow
    - Header row: icon xe nhỏ + text "THẺ XE" + badge xác minh (checkmark-circle, màu vàng gold)
    - Divider line mỏng `rgba(255,255,255,0.2)`
    - Body row (flexDirection: "row", gap 12):
      - Left: hình xe 90×90 borderRadius 14, hoặc placeholder icon `car-sport` trên nền `rgba(255,255,255,0.15)`
      - Right (flex 1): 
        - Biển số (text lớn, bold, white)
        - Dòng xe (text nhỏ hơn, white opacity 0.8)
        - Row 3 expiry chips (Bằng lái / Đăng kiểm / Bảo hiểm) — mỗi chip: dot màu + label ngắn, background `rgba(255,255,255,0.15)`, borderRadius 8, padding 4×8
        - Nút "Xem chi tiết →" align right, background `rgba(255,255,255,0.2)`, borderRadius 10, white text + chevron-forward icon
  - Giữ nguyên tất cả states: loading (VehicleCardSkeleton), error, empty, no garage context — chỉ wrap trong gradient thay vì card trắng
  - Giữ nguyên Modal xem ảnh full screen
  - Cập nhật `styles` để phù hợp với thiết kế mới (xóa styles cũ không dùng, thêm styles mới)
  - **Acceptance**: VehicleInfoCard hiển thị thẻ ngang gradient navy, hình xe trái, info phải, 3 expiry chips, nút xem chi tiết
  - _Requirements: 3, 4_
