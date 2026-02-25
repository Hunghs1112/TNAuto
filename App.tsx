// App.tsx - Main app entry
import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './src/redux/stores';
import RootNavigator from './src/navigation/RootNavigator';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { Platform, Alert } from 'react-native';
// import { fcmService } from './src/services/FCMService';
// import { notificationService } from './src/services/NotificationService';

export default function App() {
  useEffect(() => {
    // Initialize services
    const initializeApp = async () => {
      console.log('🚀 App: Initializing...');

      // Initialize notification service first (create channels)
      // await notificationService.initialize();

      // Small delay before next permission request to avoid spam
      // await new Promise<void>(resolve => setTimeout(() => resolve(), 800));

      // Request notification permission with user-friendly prompt
      // await requestNotificationPermission();

      // Initialize FCM service (setup listeners)
      // await fcmService.initialize();

      console.log('✅ App: Initialization complete');
    };

    initializeApp();

    // Cleanup on unmount
    // return () => {
    //   fcmService.cleanup();
    // };
  }, []);

  // DISABLED: Firebase/Notifee removed
  // const requestNotificationPermission = async () => {
  //   console.log('🔔 App: Checking notification permission...');
  //   ...
  // };

  // Storage permission is now requested only when needed (e.g., when employee uploads images)
  // This complies with Google Play's Photo and Video Permissions policy

  return (
    <Provider store={store}>
      <RootNavigator />
    </Provider>
  );
}