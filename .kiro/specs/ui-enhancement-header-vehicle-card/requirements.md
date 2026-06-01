# Requirements Document

## Introduction

Cải thiện giao diện ứng dụng TNAuto với hai thay đổi: (1) tăng shadow cho header/navbar để tách biệt rõ hơn với nội dung, (2) thiết kế lại VehicleInfoCard thành thẻ ngang hiện đại theo phong cách card có gradient, hình ảnh xe lớn bên trái, thông tin chi tiết bên phải và nút hành động nổi bật.

## Requirements

### Requirement 1: Tăng Shadow cho Header

**User Story:** Là người dùng, tôi muốn header có đổ bóng rõ hơn để phân biệt dễ dàng với nội dung bên dưới.

#### Acceptance Criteria

1. WHEN a Header component is rendered on iOS, THE UI_System SHALL apply shadowOpacity of 0.18, shadowRadius of 10, shadowOffset { width: 0, height: 5 }, shadowColor "#000"
2. WHEN a Header component is rendered on Android, THE UI_System SHALL apply elevation of 10
3. THE UI_System SHALL apply identical shadow values to all Header instances across all screens

### Requirement 2: Tăng Shadow cho Navbar

**User Story:** Là người dùng, tôi muốn navbar nổi bật hơn với shadow đậm hơn.

#### Acceptance Criteria

1. WHEN Navbar is rendered on iOS, THE UI_System SHALL apply shadowOpacity of 0.3, shadowRadius of 16, shadowOffset { width: 0, height: 4 }, shadowColor "#000"
2. WHEN Navbar is rendered on Android, THE UI_System SHALL apply elevation of 20
3. THE Navbar already has correct shadow values — no change needed if values already meet criteria

### Requirement 3: Thiết kế lại VehicleInfoCard thành thẻ ngang

**User Story:** Là khách hàng, tôi muốn xem thông tin xe trong một thẻ ngang lớn đẹp mắt.

#### Acceptance Criteria

1. THE UI_System SHALL display VehicleInfoCard with horizontal layout: image on left, info on right
2. THE UI_System SHALL display vehicle image or placeholder icon with size 90x90, borderRadius 14, on the left
3. THE UI_System SHALL display vehicle name/model, license plate, and expiry status rows on the right
4. THE UI_System SHALL apply LinearGradient background using Colors.gradients.primary (navy → cobalt)
5. THE UI_System SHALL display all text in white (Colors.text.inverted) on gradient background
6. THE UI_System SHALL display a "Xem chi tiết" action button at bottom-right of the card
7. WHEN user taps the card or button, THE UI_System SHALL navigate to VehicleDetail screen
8. THE UI_System SHALL apply borderRadius 20, shadow with elevation 8 / shadowOpacity 0.15

### Requirement 4: Hiển thị trạng thái hạn sử dụng trong thẻ xe

**User Story:** Là khách hàng, tôi muốn thấy trạng thái hạn bằng lái, đăng kiểm, bảo hiểm ngay trong thẻ xe.

#### Acceptance Criteria

1. THE UI_System SHALL display 3 expiry status chips inline: Bằng lái, Đăng kiểm, Bảo hiểm
2. WHEN expiry date has passed, THE UI_System SHALL show chip with red/warning tint
3. WHEN expiry date is within 30 days, THE UI_System SHALL show chip with amber/warning tint
4. WHEN expiry date is valid (>30 days), THE UI_System SHALL show chip with green/success tint
5. WHEN expiry date is missing, THE UI_System SHALL show chip with neutral/gray tint
6. THE UI_System SHALL keep DocumentExpiryCards component unchanged (it remains as overlay above home)
