// src/services/NotificationService.ts - Notifee display and navigation handling
import notifee, { 
  AndroidImportance, 
  Notification, 
  EventType,
  Event
} from '@notifee/react-native';
import { Platform } from 'react-native';
import * as RootNavigation from '../navigation/RootNavigation';
import { store } from '../redux/stores';

interface NotificationData {
  type?: string;
  order_id?: string;
  status?: string;
  employee_id?: string;
  warranty_period?: string;
  title?: string;
  body?: string;
  message?: string;
  [key: string]: any;
}

class NotificationService {
  private channelId: string = 'default';
  private channelCreated: boolean = false;

  /**
   * Initialize notification service and create channels
   */
  async initialize() {
    console.log('🔔 NotificationService: Initializing...');
    
    try {
      if (Platform.OS === 'android') {
        // Create default channel
        this.channelId = await notifee.createChannel({
          id: 'default',
          name: 'Thông báo chung',
          description: 'Kênh thông báo mặc định',
          importance: AndroidImportance.HIGH,
          sound: 'default',
          vibration: true,
        });

        // Create order channel
        await notifee.createChannel({
          id: 'orders',
          name: 'Đơn hàng',
          description: 'Thông báo về đơn hàng',
          importance: AndroidImportance.HIGH,
          sound: 'default',
          vibration: true,
        });

        // Create warranty channel
        await notifee.createChannel({
          id: 'warranty',
          name: 'Bảo hành',
          description: 'Thông báo về bảo hành',
          importance: AndroidImportance.DEFAULT,
          sound: 'default',
        });

        this.channelCreated = true;
        console.log('✅ NotificationService: Channels created');
      }

      // Setup foreground event handler
      this.setupEventHandlers();

      console.log('✅ NotificationService: Initialization complete');
    } catch (error) {
      console.error('❌ NotificationService: Initialization error:', error);
    }
  }

  /**
   * Setup notification event handlers (press, dismiss, etc.)
   */
  setupEventHandlers() {
    console.log('👆 NotificationService: Setting up event handlers...');

    // Foreground events
    notifee.onForegroundEvent(({ type, detail }) => {
      console.log('📱 NotificationService: Foreground event:', type, detail);

      if (type === EventType.PRESS) {
        this.handleNotificationPress(detail.notification?.data);
      }
    });

    // Background events
    notifee.onBackgroundEvent(async ({ type, detail }) => {
      console.log('🔵 NotificationService: Background event:', type, detail);

      if (type === EventType.PRESS) {
        this.handleNotificationPress(detail.notification?.data);
      }
    });

    console.log('✅ NotificationService: Event handlers setup complete');
  }

  /**
   * Display notification using Notifee
   */
  async displayNotification(title: string, body: string, data?: NotificationData) {
    console.log('🔔 NotificationService: Displaying notification', { title, body, data });

    try {
      // Determine channel based on notification type
      let channelId = this.channelId;
      if (data?.type) {
        if (data.type.includes('order')) {
          channelId = 'orders';
        } else if (data.type.includes('warranty')) {
          channelId = 'warranty';
        }
      }

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
          sound: 'default',
          vibrationPattern: [300, 500],
          showTimestamp: true,
          timestamp: Date.now(),
        },
        ios: {
          sound: 'default',
          criticalVolume: 1.0,
        },
        data: data as Record<string, string>,
      };

      await notifee.displayNotification(notification);
      console.log('✅ NotificationService: Notification displayed');
    } catch (error) {
      console.error('❌ NotificationService: Display notification error:', error);
    }
  }

  /**
   * Handle notification press - navigate to appropriate screen
   */
  handleNotificationPress(data?: NotificationData | Record<string, any>) {
    console.log('👆 NotificationService: Handling notification press', data);

    if (!data) {
      console.log('⚠️ NotificationService: No data, navigating to Notifications screen');
      RootNavigation.navigate('Notification');
      return;
    }

    const notificationData = data as NotificationData;
    const state = store.getState();
    const userType = state.auth.userType;

    try {
      // Handle based on notification type
      switch (notificationData.type) {
        case 'order_created':
        case 'order_status_update':
        case 'order_assigned':
        case 'order_completed':
          if (notificationData.order_id) {
            this.navigateToOrderDetail(notificationData.order_id, userType);
          } else {
            RootNavigation.navigate('MyService');
          }
          break;

        case 'warranty_created':
        case 'warranty_expiring':
          RootNavigation.navigate('Warranty');
          break;

        default:
          // If order_id exists in data, navigate to order detail
          if (notificationData.order_id) {
            this.navigateToOrderDetail(notificationData.order_id, userType);
          } else {
            // Default to notifications screen
            RootNavigation.navigate('Notification');
          }
          break;
      }
    } catch (error) {
      console.error('❌ NotificationService: Navigation error:', error);
      RootNavigation.navigate('Notification');
    }
  }

  /**
   * Navigate to order detail screen based on user type
   */
  private navigateToOrderDetail(orderId: string, userType: 'customer' | 'employee' | null) {
    console.log('🔄 NotificationService: Navigating to order detail:', orderId, userType);

    if (userType === 'employee') {
      RootNavigation.navigate('EmployeeOrderDetail', { id: orderId });
    } else {
      RootNavigation.navigate('OrderDetail', { id: orderId });
    }
  }

  /**
   * Cancel all notifications
   */
  async cancelAllNotifications() {
    try {
      await notifee.cancelAllNotifications();
      console.log('✅ NotificationService: All notifications cancelled');
    } catch (error) {
      console.error('❌ NotificationService: Cancel all error:', error);
    }
  }

  /**
   * Cancel notification by ID
   */
  async cancelNotification(notificationId: string) {
    try {
      await notifee.cancelNotification(notificationId);
      console.log('✅ NotificationService: Notification cancelled:', notificationId);
    } catch (error) {
      console.error('❌ NotificationService: Cancel notification error:', error);
    }
  }

  /**
   * Get badge count (iOS)
   */
  async getBadgeCount(): Promise<number> {
    try {
      if (Platform.OS === 'ios') {
        return await notifee.getBadgeCount();
      }
      return 0;
    } catch (error) {
      console.error('❌ NotificationService: Get badge count error:', error);
      return 0;
    }
  }

  /**
   * Set badge count (iOS)
   */
  async setBadgeCount(count: number) {
    try {
      if (Platform.OS === 'ios') {
        await notifee.setBadgeCount(count);
        console.log('✅ NotificationService: Badge count set to:', count);
      }
    } catch (error) {
      console.error('❌ NotificationService: Set badge count error:', error);
    }
  }

  /**
   * Increment badge count (iOS)
   */
  async incrementBadgeCount() {
    try {
      if (Platform.OS === 'ios') {
        await notifee.incrementBadgeCount();
        console.log('✅ NotificationService: Badge count incremented');
      }
    } catch (error) {
      console.error('❌ NotificationService: Increment badge count error:', error);
    }
  }

  /**
   * Decrement badge count (iOS)
   */
  async decrementBadgeCount() {
    try {
      if (Platform.OS === 'ios') {
        await notifee.decrementBadgeCount();
        console.log('✅ NotificationService: Badge count decremented');
      }
    } catch (error) {
      console.error('❌ NotificationService: Decrement badge count error:', error);
    }
  }
}

export const notificationService = new NotificationService();
// Initialize on import
notificationService.initialize();