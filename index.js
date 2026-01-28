/**
 * @format
 * Entry point for React Native app
 * Background message handler MUST be registered here at top level
 */

import 'react-native-gesture-handler';
import 'react-native-reanimated';

import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';

/**
 * Background Message Handler
 * 
 * This handler is called when:
 * 1. App is in background (not visible but still running)
 * 2. App is terminated (completely closed)
 * 3. Device is locked
 * 
 * IMPORTANT: This MUST be registered at top level, before AppRegistry.registerComponent
 * React Native Firebase requires this to be in the root index.js file
 */
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('🔵 [Background Handler] Message received:', {
    messageId: remoteMessage.messageId,
    from: remoteMessage.from,
    notification: remoteMessage.notification,
    data: remoteMessage.data,
    sentTime: remoteMessage.sentTime,
  });

  try {
    // Dynamically import to avoid circular dependencies
    const { notificationService } = await import('./src/services/NotificationService');
    
    // Extract notification content
    let title = 'Thông báo mới';
    let body = '';
    let data = remoteMessage.data || {};

    if (remoteMessage.notification) {
      // Notification payload (will be displayed automatically by system)
      title = remoteMessage.notification.title || title;
      body = remoteMessage.notification.body || body;
    } else if (remoteMessage.data) {
      // Data-only payload (we need to display manually)
      title = remoteMessage.data.title || remoteMessage.data.notification?.title || title;
      body = remoteMessage.data.body || 
             remoteMessage.data.message || 
             remoteMessage.data.notification?.body || 
             body;
    }

    // Display notification using Notifee
    // This ensures notification is shown even when app is terminated or locked
    await notificationService.displayNotification(title, body, data);
    
    console.log('✅ [Background Handler] Notification displayed successfully');
  } catch (error) {
    console.error('❌ [Background Handler] Error processing notification:', error);
  }
});

AppRegistry.registerComponent(appName, () => App);
