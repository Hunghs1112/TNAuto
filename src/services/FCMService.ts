// src/services/FCMService.ts (New: If using FCM for push in quit/background; integrate with NotificationService)
import messaging from '@react-native-firebase/messaging';
import { notificationService } from './NotificationService';
import { Platform } from 'react-native';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('FCMService: Background message received', remoteMessage);
  if (remoteMessage.notification) {
    await notificationService.displayNotification(
      remoteMessage.notification.title || '',
      remoteMessage.notification.body || '',
      remoteMessage.data
    );
  }
  // Quit state: FCM data-only wakes app or displays via system
});

export const setupFCM = async () => {
  console.log('FCMService: Setting up...');
  if (Platform.OS === 'android') {
    const authStatus = await messaging().requestPermission();
    console.log('FCMService: Auth status', authStatus);
  }

  messaging().onMessage(async remoteMessage => {
    console.log('FCMService: Foreground message', remoteMessage);
    await notificationService.displayNotification(
      remoteMessage.notification?.title || '',
      remoteMessage.notification?.body || '',
      remoteMessage.data
    );
  });

  // Handle quit: Relies on background handler; app restarts on tap
};