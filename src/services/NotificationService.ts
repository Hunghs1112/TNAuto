/**
 * NotificationService - Notifee display and navigation handling
 * 
 * Handles:
 * - Displaying notifications using Notifee (works in all app states)
 * - Navigation when user taps notification
 * - Badge count management (iOS)
 * - Notification channels (Android)
 */

import notifee, { 
  AndroidImportance, 
  Notification, 
  EventType,
  Event
} from '@notifee/react-native';
import { Platform } from 'react-native';
import { Colors } from '../constants/colors';
import * as RootNavigation from '../navigation/RootNavigation';
import { store } from '../redux/stores';

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
  [key: string]: any;
}

class NotificationService {
  private channelId: string = 'default';
  private channelCreated: boolean = false;

  /**
   * Initialize notification service and create channels
   * Must be called before displaying any notifications
   */
  async initialize() {
    console.log('🔔 NotificationService: Initializing...');
    
    try {
      if (Platform.OS === 'android') {
        // Create default channel (required for Android 8.0+)
        this.channelId = await notifee.createChannel({
          id: 'default',
          name: 'Thông báo chung',
          description: 'Kênh thông báo mặc định',
          importance: AndroidImportance.HIGH,
          sound: 'default',
          vibration: true,
          lights: true,
          lightColor: Colors.primary,
        });

        // Create order channel
        await notifee.createChannel({
          id: 'orders',
          name: 'Đơn hàng',
          description: 'Thông báo về đơn hàng',
          importance: AndroidImportance.HIGH,
          sound: 'default',
          vibration: true,
          lights: true,
          lightColor: Colors.primary,
        });

        // Create warranty channel
        await notifee.createChannel({
          id: 'warranty',
          name: 'Bảo hành',
          description: 'Thông báo về bảo hành',
          importance: AndroidImportance.DEFAULT,
          sound: 'default',
          vibration: true,
        });

        this.channelCreated = true;
        console.log('✅ NotificationService: Channels created');
      }

      // Setup event handlers for notification interactions
      this.setupEventHandlers();

      console.log('✅ NotificationService: Initialization complete');
    } catch (error) {
      console.error('❌ NotificationService: Initialization error:', error);
    }
  }

  /**
   * Setup notification event handlers (press, dismiss, etc.)
   * Handles both foreground and background events
   */
  setupEventHandlers() {
    console.log('👆 NotificationService: Setting up event handlers...');

    // Foreground events (when app is open)
    notifee.onForegroundEvent(({ type, detail }) => {
      console.log('📱 NotificationService: Foreground event:', type, detail);

      if (type === EventType.PRESS) {
        this.handleNotificationPress(detail.notification?.data);
      } else if (type === EventType.DISMISS) {
        console.log('📱 NotificationService: Notification dismissed');
      }
    });

    // Background events (when app is in background or terminated)
    notifee.onBackgroundEvent(async ({ type, detail }) => {
      console.log('🔵 NotificationService: Background event:', type, detail);

      if (type === EventType.PRESS) {
        this.handleNotificationPress(detail.notification?.data);
      } else if (type === EventType.DISMISS) {
        console.log('🔵 NotificationService: Notification dismissed');
      }
    });

    console.log('✅ NotificationService: Event handlers setup complete');
  }

  /**
   * Display notification using Notifee
   * Works in all app states: foreground, background, terminated, locked
   */
  async displayNotification(title: string, body: string, data?: NotificationData) {
    console.log('🔔 NotificationService: Displaying notification', { title, body, data });

    try {
      // Ensure channels are created (for Android)
      if (Platform.OS === 'android' && !this.channelCreated) {
        await this.initialize();
      }

      // Determine channel based on notification type
      let channelId = this.channelId;
      if (data?.type) {
        if (data.type.includes('order') || data.order_id) {
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
          // Large icon (optional - can be added later)
          // largeIcon: require('../assets/logo.png'),
          pressAction: {
            id: 'default',
            launchActivity: 'default',
          },
          sound: 'default',
          vibrationPattern: [300, 500],
          showTimestamp: true,
          timestamp: Date.now(),
          // Auto cancel when user taps
          autoCancel: true,
          // Show on lock screen
          visibility: 1, // VISIBILITY_PUBLIC
        },
        ios: {
          sound: 'default',
          // Critical alert (bypasses Do Not Disturb on iOS 12+)
          // Only use for critical notifications
          // critical: true,
          // criticalVolume: 1.0,
          // Show badge
          badge: true,
          // Show in foreground
          foregroundPresentationOptions: {
            alert: true,
            badge: true,
            sound: true,
          },
        },
        data: data as Record<string, string>,
      };

      // Display notification
      const notificationId = await notifee.displayNotification(notification);
      console.log('✅ NotificationService: Notification displayed with ID:', notificationId);

      // Increment badge count (iOS)
      if (Platform.OS === 'ios') {
        await this.incrementBadgeCount();
      }
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

        case 'warranty_reminder':
          // Spec: open warranty detail, or order detail if order_id exists
          if (notificationData.order_id) {
            this.navigateToOrderDetail(notificationData.order_id, userType);
          } else {
            RootNavigation.navigate('Warranty');
          }
          break;

        case 'service_reminder':
          // Spec: open service detail (service_id) or suggest booking
          if (notificationData.service_id) {
            RootNavigation.navigate('ServiceDetail', { serviceId: Number(notificationData.service_id) });
          } else {
            RootNavigation.navigate('Service');
          }
          break;

        case 'order_created':
        case 'order_status_update':
        case 'order_completed':
          if (notificationData.order_id) {
            this.navigateToOrderDetail(notificationData.order_id, userType);
          } else {
            RootNavigation.navigate('MyService');
          }
          break;

        case 'order_assigned':
          if (notificationData.order_id) {
            if (userType === 'employee') {
              RootNavigation.navigate('MyService');
            } else {
              this.navigateToOrderDetail(notificationData.order_id, userType);
            }
          } else {
            RootNavigation.navigate('MyService');
          }
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
// Initialize on import (channels will be created)
notificationService.initialize();
