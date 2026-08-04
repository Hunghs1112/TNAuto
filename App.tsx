// App.tsx - Main app entry
import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './src/redux/stores';
import RootNavigator from './src/navigation/RootNavigator';
import { notificationService } from './src/services/NotificationService';
import { fcmService } from './src/services/FCMService';

export default function App() {
  useEffect(() => {
    // Initialize services
    const initializeApp = async () => {
      console.log('🚀 App: Initializing...');

      // Initialize the notification channel before any FCM message can be displayed.
      await notificationService.initialize();

      // Initialize FCM service (setup listeners) so foreground/initial messages work.
      await fcmService.initialize();

      console.log('✅ App: Initialization complete');
    };

    initializeApp();

    // Cleanup on unmount
    return () => {
      fcmService.cleanup();
    };
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