// src/services/NotificationService.ts (New: Centralized Notifee handling for display and quit state via channels/service)
import notifee, { AndroidImportance, AndroidChannel, Notification } from '@notifee/react-native';
import { Platform } from 'react-native';

class NotificationService {
  private channelId: string | null = null;

  async initialize() {
    console.log('NotificationService: Initializing...');
    if (Platform.OS === 'android') {
      this.channelId = await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        importance: AndroidImportance.HIGH,
      });
      console.log('NotificationService: Channel created', this.channelId);
    }
  }

  async displayNotification(title: string, body: string, data?: object) {
    console.log('NotificationService: Displaying notification', { title, body, data });
    const notification: Notification = {
      title,
      body,
      android: {
        channelId: this.channelId!,
        importance: AndroidImportance.HIGH,
        smallIcon: 'ic_launcher',
        pressAction: {
          id: 'default',
          launchActivity: 'default',
        },
      },
      data,
    };

    await notifee.displayNotification(notification);
    console.log('NotificationService: Notification displayed');
  }

  // For quit state: Handled via FCM payload with data-only for app killed
  // Assume backend sends FCM with 'data' for silent handling or 'notification' for display
  // On device, use messaging().onMessage for foreground, setBackgroundMessageHandler for background/quit
}

export const notificationService = new NotificationService();
notificationService.initialize();