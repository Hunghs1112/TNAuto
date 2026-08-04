// src/constants/notificationTargetScreens.ts
//
// Canonical whitelist cho `target_screen` mà backend / web admin có thể chỉ định
// để mobile mở khi user bấm vào notification.
//
// Phải khớp với:
//   - Backend:    src/constants/notificationTargetScreens.js
//   - Web Admin:  TNAUTO-admin/src/constants/notificationTargetScreens.js
//
// Xem docs/notification-navigation-spec.md §6 để biết thêm chi tiết.

export type NotificationRecipientType = 'customer' | 'employee' | 'dealer';

export type NotificationTargetScreen =
  | 'OrderDetail'
  | 'EmployeeOrderDetail'
  | 'ServiceDetail'
  | 'Warranty'
  | 'Booking'
  | 'MyService'
  | 'OfferDetail'
  | 'ProductDetail'
  | 'CustomerDetail'
  | 'GarageManagement'
  | 'GarageOrders'
  | 'VehicleDetail'
  | 'Notification';

export interface NotificationTargetScreenMeta {
  screen: NotificationTargetScreen;
  /** Tên hiển thị trong UI dropdown (web admin / mobile admin) */
  label: string;
  /** Recipient types được phép navigate tới screen này */
  recipients: NotificationRecipientType[];
  /** Key bắt buộc phải có trong `target_params` (nếu có). undefined = không bắt buộc */
  requiredParams?: ReadonlyArray<string>;
}

/**
 * Whitelist canonical của target_screen. Khi nhận `target_screen` không có trong
 * danh sách này (hoặc không hợp với `recipient_type` của user) → fallback về
 * nhánh switch theo `type` cũ.
 */
export const NOTIFICATION_TARGET_SCREENS: ReadonlyArray<NotificationTargetScreenMeta> = [
  { screen: 'OrderDetail', label: 'Chi tiết đơn (khách)', recipients: ['customer'], requiredParams: ['id'] },
  { screen: 'ServiceDetail', label: 'Chi tiết dịch vụ', recipients: ['customer'], requiredParams: ['serviceId'] },
  { screen: 'Warranty', label: 'Bảo hành', recipients: ['customer'] },
  { screen: 'Booking', label: 'Đặt lịch', recipients: ['customer'] },
  { screen: 'MyService', label: 'Dịch vụ của tôi', recipients: ['customer'] },
  { screen: 'OfferDetail', label: 'Chi tiết ưu đãi', recipients: ['customer'], requiredParams: ['offerId'] },
  { screen: 'ProductDetail', label: 'Chi tiết sản phẩm', recipients: ['customer'], requiredParams: ['productId'] },
  { screen: 'EmployeeOrderDetail', label: 'Chi tiết đơn (nhân viên)', recipients: ['employee'], requiredParams: ['id'] },
  { screen: 'GarageManagement', label: 'Quản lý gara', recipients: ['employee'] },
  { screen: 'GarageOrders', label: 'Đơn của gara', recipients: ['employee'] },
  { screen: 'CustomerDetail', label: 'Chi tiết khách', recipients: ['employee'], requiredParams: ['customerId'] },
  { screen: 'VehicleDetail', label: 'Chi tiết xe', recipients: ['employee'], requiredParams: ['vehicleId', 'licensePlate'] },
  { screen: 'Notification', label: 'Danh sách thông báo (fallback)', recipients: ['customer', 'employee', 'dealer'] },
];

/**
 * Set lookup nhanh — dùng để validate `target_screen` thuộc whitelist hay không
 * trước khi gọi RootNavigation.navigate, tránh navigate tới screen lạ.
 */
export const ALLOWED_TARGET_SCREENS: ReadonlySet<NotificationTargetScreen> = new Set(
  NOTIFICATION_TARGET_SCREENS.map(meta => meta.screen),
);

export const isAllowedTargetScreen = (value: unknown): value is NotificationTargetScreen =>
  typeof value === 'string' && ALLOWED_TARGET_SCREENS.has(value as NotificationTargetScreen);

/**
 * Lấy meta của 1 target_screen (dùng để kiểm tra recipient & requiredParams).
 * Trả về undefined nếu không nằm trong whitelist.
 */
export const getTargetScreenMeta = (
  screen: NotificationTargetScreen,
): NotificationTargetScreenMeta | undefined =>
  NOTIFICATION_TARGET_SCREENS.find(meta => meta.screen === screen);
