import notifee, {
  AndroidImportance,
  EventType,
  Notification,
} from '@notifee/react-native';
import { Platform } from 'react-native';

import { Colors } from '../constants/colors';
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
  [key: string]: any;
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
        data: data as Record<string, string>,
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
      RootNavigation.navigate('Notification');
      return;
    }

    const notificationData = data as NotificationData;
    const state = store.getState();
    const userType = state.auth.userType;
    const orderId = this.extractOrderId(notificationData);

    try {
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
      RootNavigation.navigate('Notification');
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
