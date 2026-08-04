import notifee, {
  AndroidImportance,
  EventType,
  Notification,
} from '@notifee/react-native';
import { Platform } from 'react-native';

import { Colors } from '../constants/colors';
import {
  isAllowedTargetScreen,
  NotificationRecipientType,
  NotificationTargetScreen,
} from '../constants/notificationTargetScreens';
import * as RootNavigation from '../navigation/RootNavigation';
import { store } from '../redux/stores';

export const TNAUTO_CHANNEL_ID = 'tnauto_noti';

interface NotificationData {
  type?: string;
  order_id?: string;
  service_id?: string;
  warranty_id?: string;
  status?: string;
  employee_id?: string;
  warranty_period?: string;
  title?: string;
  body?: string;
  message?: string;
  source?: string;
  claimable?: string | boolean;
  ref_id?: string;
  metadata?: Record<string, any>;
  /**
   * Màn hình đích do Web Admin chỉ định. Phải nằm trong
   * `ALLOWED_TARGET_SCREENS` để tránh navigate linh tinh.
   * @see docs/notification-navigation-spec.md §3, §6, §7
   */
  target_screen?: string;
  /**
   * Params truyền cho navigate. Khi nhận từ FCM/notifee thì là string (JSON);
   * helper `parseTargetScreenData` sẽ parse sang object trước khi gọi navigator.
   */
  target_params?: string | Record<string, any>;
  schema_version?: string;
  [key: string]: any;
}

const stringifyData = (data: Record<string, any> | undefined) => {
  if (!data) {
    return undefined;
  }
  return Object.entries(data).reduce<Record<string, string>>((acc, [key, value]) => {
    if (value === undefined || value === null) {
      return acc;
    }
    acc[key] = typeof value === 'string' ? value : String(value);
    return acc;
  }, {});
};

/**
 * Chuẩn hoá data khi gửi push local (displayNotification) sao cho key `target_screen`
 * / `target_params` đúng định dạng FCM/notifee chấp nhận (mọi value đều string).
 */
function serializeDataForPush(
  data: NotificationData | Record<string, any> | undefined,
): Record<string, string> | undefined {
  const raw = stringifyData(data as Record<string, any>);
  if (!raw) {
    return undefined;
  }
  if (data && typeof (data as NotificationData).target_params === 'object') {
    raw.target_params = JSON.stringify((data as NotificationData).target_params);
  }
  return raw;
}


class NotificationService {
  private channelId: string = TNAUTO_CHANNEL_ID;
  private channelCreated: boolean = false;

  async ensureTNAutoChannel() {
    if (Platform.OS !== 'android') {
      return;
    }

    await notifee.createChannel({
      id: TNAUTO_CHANNEL_ID,
      name: 'TNAUTO Notifications',
      description: 'Thông báo chung từ hệ thống TN AUTO',
      importance: AndroidImportance.HIGH,
      sound: 'noti',
      vibration: true,
      vibrationPattern: [300, 500],
      lights: true,
      lightColor: Colors.primary,
    });
  }

  async initialize() {
    try {
      if (Platform.OS === 'android') {
        await this.ensureTNAutoChannel();
        this.channelId = TNAUTO_CHANNEL_ID;

        // Legacy channels remain available for locally displayed notifications.
        await notifee.createChannel({
          id: 'default_v2',
          name: 'Thông báo chung',
          description: 'Kênh thông báo mặc định',
          importance: AndroidImportance.HIGH,
          sound: 'noti',
          vibration: true,
          lights: true,
          lightColor: Colors.primary,
        });

        await notifee.createChannel({
          id: 'orders_v2',
          name: 'Đơn hàng',
          description: 'Thông báo về đơn hàng',
          importance: AndroidImportance.HIGH,
          sound: 'noti',
          vibration: true,
          lights: true,
          lightColor: Colors.primary,
        });

        await notifee.createChannel({
          id: 'warranty_v2',
          name: 'Bảo hành',
          description: 'Thông báo về bảo hành',
          importance: AndroidImportance.DEFAULT,
          sound: 'noti',
          vibration: true,
        });

        this.channelCreated = true;
      }

      this.setupEventHandlers();
    } catch (error) {
      console.error('NotificationService: Initialization error:', error);
    }
  }

  setupEventHandlers() {
    notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS) {
        this.handleNotificationPress(detail.notification?.data);
      }
    });

    notifee.onBackgroundEvent(async ({ type, detail }) => {
      if (type === EventType.PRESS) {
        this.handleNotificationPress(detail.notification?.data);
      }
    });
  }

  async displayNotification(title: string, body: string, data?: NotificationData) {
    try {
      if (Platform.OS === 'android' && !this.channelCreated) {
        await this.initialize();
      }

      const channelId = this.channelId;

      const notification: Notification = {
        title,
        body,
        android: {
          channelId,
          importance: AndroidImportance.HIGH,
          smallIcon: 'ic_launcher',
          pressAction: {
            id: 'default',
            launchActivity: 'default',
          },
          // sound để null: kênh Android đã gắn sound riêng trong createChannel
          // (nếu truyền string ở đây sẽ override channel sound và gây ra default)
          sound: undefined,
          vibrationPattern: [300, 500],
          showTimestamp: true,
          timestamp: Date.now(),
          autoCancel: true,
          visibility: 1,
        },
        ios: {
          sound: 'noti.mp3',
          foregroundPresentationOptions: {
            alert: true,
            badge: true,
            sound: true,
          },
        },
        data: serializeDataForPush(data) as Record<string, string>,
      };

      await notifee.displayNotification(notification);

      if (Platform.OS === 'ios') {
        await this.incrementBadgeCount();
      }
    } catch (error) {
      console.error('NotificationService: Display notification error:', error);
    }
  }

  handleNotificationPress(data?: NotificationData | Record<string, any>) {
    if (!data) {
      // Push notification tap (cold-start / background / foreground) chỉ mở app,
      // không deep-link theo target_screen. Mặc định rơi về Home.
      RootNavigation.navigate('Home');
      return;
    }

    const notificationData = data as NotificationData;
    const state = store.getState();
    const userType = state.auth.userType;
    const orderId = this.extractOrderId(notificationData);

    try {
      // Chú ý: nhánh `target_screen` đã được lược bỏ khỏi handler này để giữ
      // hành vi "bấm push → mở app" đơn giản. Deep-link theo target_screen chỉ
      // còn được xử lý khi user bấm row trong NotificationScreen (in-app tap),
      // xem `tryNavigateToTargetScreen` được gọi ở NotificationScreen.handlePress.
      switch (notificationData.type) {
        case 'order_available_for_claim':
        case 'order_claimed':
        case 'order_assigned':
        case 'order_created':
        case 'order_status_update':
        case 'order_completed':
          if (orderId) {
            this.navigateToOrderDetail(orderId, userType);
          } else if (userType === 'employee') {
            RootNavigation.navigate('Home');
          } else {
            RootNavigation.navigate('MyService');
          }
          break;

        case 'warranty_reminder':
          if (orderId) {
            this.navigateToOrderDetail(orderId, userType);
          } else {
            RootNavigation.navigate('Warranty');
          }
          break;

        case 'service_reminder':
          if (notificationData.service_id) {
            RootNavigation.navigate('ServiceDetail', {
              serviceId: Number(notificationData.service_id),
            });
          } else {
            RootNavigation.navigate('Service');
          }
          break;

        default:
          if (orderId) {
            this.navigateToOrderDetail(orderId, userType);
          } else {
            RootNavigation.navigate('Notification');
          }
          break;
      }
    } catch (error) {
      console.error('NotificationService: Navigation error:', error);
      RootNavigation.navigate('Home');
    }
  }

  private extractOrderId(data: NotificationData) {
    const rawOrderId =
      data.order_id ??
      data.metadata?.order_id ??
      ((data.ref_type === 'order' || data.type?.includes('order')) ? data.ref_id : undefined);

    if (rawOrderId === undefined || rawOrderId === null || rawOrderId === '') {
      return undefined;
    }

    return String(rawOrderId);
  }

  private navigateToOrderDetail(
    orderId: string,
    userType: 'customer' | 'employee' | 'dealer' | 'garage_manager' | 'garage_admin' | null,
  ) {
    if (userType === 'employee') {
      RootNavigation.navigate('EmployeeOrderDetail', { id: orderId });
      return;
    }

    if (userType === 'customer') {
      RootNavigation.navigate('OrderDetail', { id: orderId });
      return;
    }

    RootNavigation.navigate('Home');
  }

  async cancelAllNotifications() {
    try {
      await notifee.cancelAllNotifications();
    } catch (error) {
      console.error('NotificationService: Cancel all error:', error);
    }
  }

  async cancelNotification(notificationId: string) {
    try {
      await notifee.cancelNotification(notificationId);
    } catch (error) {
      console.error('NotificationService: Cancel notification error:', error);
    }
  }

  async getBadgeCount(): Promise<number> {
    try {
      if (Platform.OS === 'ios') {
        return await notifee.getBadgeCount();
      }

      return 0;
    } catch (error) {
      console.error('NotificationService: Get badge count error:', error);
      return 0;
    }
  }

  async setBadgeCount(count: number) {
    try {
      if (Platform.OS === 'ios') {
        await notifee.setBadgeCount(count);
      }
    } catch (error) {
      console.error('NotificationService: Set badge count error:', error);
    }
  }

  async incrementBadgeCount() {
    try {
      if (Platform.OS === 'ios') {
        await notifee.incrementBadgeCount();
      }
    } catch (error) {
      console.error('NotificationService: Increment badge count error:', error);
    }
  }

  async decrementBadgeCount() {
    try {
      if (Platform.OS === 'ios') {
        await notifee.decrementBadgeCount();
      }
    } catch (error) {
      console.error('NotificationService: Decrement badge count error:', error);
    }
  }
}

export const notificationService = new NotificationService();

/**
 * Parse `target_screen` + `target_params` từ payload nhận được.
 *
 * - FCM/notifee chỉ truyền string trong `data`, nên nếu backend đã
 *   `JSON.stringify(target_params)` thì `data.target_params` là string.
 * - Validate `target_screen` thuộc whitelist — nếu lạ thì trả về null để
 *   caller fallback nhánh switch theo `type` cũ (không crash).
 */
export function parseTargetScreenData(rawData: Record<string, any> | undefined | null): {
  targetScreen: NotificationTargetScreen;
  targetParams: Record<string, any>;
} | null {
  if (!rawData) {
    return null;
  }

  const rawScreen = rawData.target_screen;
  if (!isAllowedTargetScreen(rawScreen)) {
    return null;
  }

  const rawParams = rawData.target_params;
  let parsedParams: Record<string, any> = {};

  if (typeof rawParams === 'string') {
    try {
      const value = JSON.parse(rawParams);
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        parsedParams = value as Record<string, any>;
      }
    } catch {
      parsedParams = {};
    }
  } else if (rawParams && typeof rawParams === 'object' && !Array.isArray(rawParams)) {
    parsedParams = rawParams as Record<string, any>;
  }

  return { targetScreen: rawScreen, targetParams: parsedParams };
}

type RecipientTypeLike =
  | NotificationRecipientType
  | 'garage_manager'
  | 'garage_admin'
  | null
  | undefined;

/**
 * Thử navigate theo `target_screen` + `target_params`.
 *
 * Quy tắc:
 * - Nếu `target_screen` nằm ngoài whitelist hoặc không hợp với recipient của user
 *   → trả về false, caller rơi về switch theo `type` cũ (không crash).
 * - Nếu thiếu param bắt buộc → vẫn navigate, để màn hình đích tự handle missing
 *   param (vd hiển thị toast). Spec §7.2.
 * - Trả về true khi đã navigate, false khi không nên / không thể navigate.
 */
export function tryNavigateToTargetScreen(
  rawData: Record<string, any> | undefined | null,
  userType: RecipientTypeLike,
): boolean {
  const parsed = parseTargetScreenData(rawData);
  if (!parsed) {
    return false;
  }

  // Ánh xạ userType của app sang recipient type dùng trong whitelist.
  // customer/employee/dealer giữ nguyên; garage_manager/garage_admin map sang employee
  // (họ cũng là nhân viên nội bộ).
  const normalizedRecipient: NotificationRecipientType | null = ((): NotificationRecipientType | null => {
    if (userType === 'customer' || userType === 'employee' || userType === 'dealer') {
      return userType;
    }
    if (userType === 'garage_manager' || userType === 'garage_admin') {
      return 'employee';
    }
    return null;
  })();

  if (!normalizedRecipient) {
    return false;
  }

  // Spec §6: chỉ cho phép navigate khi recipient type của user nằm trong whitelist
  // của screen đó (vd: customer mới được OrderDetail, employee mới được EmployeeOrderDetail).
  const allowedForScreen = SCREEN_TO_RECIPIENTS[parsed.targetScreen];
  if (!allowedForScreen.includes(normalizedRecipient)) {
    return false;
  }

  const finalParams = coerceParamsForScreen(parsed.targetScreen, parsed.targetParams ?? {});
  RootNavigation.navigate(parsed.targetScreen as any, finalParams);
  return true;
}

const SCREEN_TO_RECIPIENTS: Record<NotificationTargetScreen, NotificationRecipientType[]> = {
  OrderDetail: ['customer'],
  EmployeeOrderDetail: ['employee'],
  ServiceDetail: ['customer'],
  Warranty: ['customer'],
  Booking: ['customer'],
  MyService: ['customer'],
  OfferDetail: ['customer'],
  ProductDetail: ['customer'],
  CustomerDetail: ['employee'],
  GarageManagement: ['employee'],
  GarageOrders: ['employee'],
  VehicleDetail: ['employee'],
  Notification: ['customer', 'employee', 'dealer'],
};

/**
 * Các key của `target_params` mà AppStackParamList khai báo là `number`
 * (vd: ProductDetail, OfferDetail, ServiceDetail, CustomerDetail). Khi payload
 * đi qua FCM/notifee, tất cả value đều bị stringify → số nguyên trở thành
 * chuỗi, làm cho React Navigation vẫn match được nhưng RTK Query truyền lên
 * URL path / query sẽ bị `encodeURIComponent("5")` thay vì `5`, gây 404 ở
 * backend (vd: `/products/undefined` hoặc `/products/NaN`).
 *
 * Map này là canonical cho mọi spec màn hình trong `notificationTargetScreens.ts`.
 */
const NUMERIC_PARAM_KEYS_BY_SCREEN: Partial<Record<NotificationTargetScreen, ReadonlyArray<string>>> = {
  ProductDetail: ['productId'],
  OfferDetail: ['offerId'],
  ServiceDetail: ['serviceId'],
  CustomerDetail: ['customerId'],
};

/**
 * Hàm cast + fallback key cho `target_params`:
 *
 * 1. Với mỗi key numeric khai báo trong `NUMERIC_PARAM_KEYS_BY_SCREEN` cho
 *    screen đó → đảm bảo value là `number` (ep từ string nếu cần).
 * 2. Nếu key chính thiếu mà backend lỡ gửi alias `id` → fallback dùng `id`.
 *    Áp dụng cho cả id-alias kiểu order (`OrderDetail`/`EmployeeOrderDetail`).
 * 3. Nếu không phải screen numeric param → trả params nguyên.
 *
 * Trả về object mới, không mutate input.
 */
function coerceParamsForScreen(
  screen: NotificationTargetScreen,
  params: Record<string, any>,
): Record<string, any> {
  const numericKeys = NUMERIC_PARAM_KEYS_BY_SCREEN[screen];
  const result: Record<string, any> = { ...params };

  if (numericKeys) {
    for (const key of numericKeys) {
      const raw = result[key];
      if (raw === undefined || raw === null || raw === '') {
        // Fallback: một số backend cũ dùng `id` thay vì `productId`/`offerId`…
        if (result.id !== undefined && result.id !== null && result.id !== '') {
          const coerced = Number(result.id);
          if (Number.isFinite(coerced)) {
            result[key] = coerced;
          }
        }
        continue;
      }
      const coerced = Number(raw);
      if (Number.isFinite(coerced)) {
        result[key] = coerced;
      } else {
        // value không cast được → để string, không overwrite
      }
    }
    return result;
  }

  // Các screen có param kiểu string id (OrderDetail, EmployeeOrderDetail, VehicleDetail):
  // - OrderDetail/EmployeeOrderDetail: route yêu cầu `{ id: string }`. Backend có thể
  //   gửi `id` (number) — giữ string là an toàn nhất vì extractOrderId cũng dùng String().
  // - VehicleDetail: cần `vehicleId` (string) + `licensePlate` (string) → không cast.
  if (
    screen === 'OrderDetail' ||
    screen === 'EmployeeOrderDetail'
  ) {
    if (result.id !== undefined && result.id !== null && result.id !== '') {
      result.id = String(result.id);
    } else if (result.order_id !== undefined && result.order_id !== null && result.order_id !== '') {
      // Fallback alias — tương thích backend cũ
      result.id = String(result.order_id);
    }
  }

  return result;
}
