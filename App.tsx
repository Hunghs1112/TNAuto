// App.tsx - Main app entry with FCM and permissions setup
import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './src/redux/stores';
import RootNavigator from './src/navigation/RootNavigator';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { Platform, Alert } from 'react-native';
import { fcmService } from './src/services/FCMService';
import { notificationService } from './src/services/NotificationService';

export default function App() {
  useEffect(() => {
    // Initialize services
    const initializeApp = async () => {
      console.log('🚀 App: Initializing...');

      // Initialize notification service first (create channels)
      await notificationService.initialize();

      // Request storage permission
      await requestStoragePermission();

      // Small delay before next permission request to avoid spam
      await new Promise<void>(resolve => setTimeout(() => resolve(), 800));

      // Request notification permission with user-friendly prompt
      await requestNotificationPermission();

      // Initialize FCM service (setup listeners)
      await fcmService.initialize();

      console.log('✅ App: Initialization complete');
    };

    initializeApp();

    // Cleanup on unmount
    return () => {
      fcmService.cleanup();
    };
  }, []);

  const requestNotificationPermission = async () => {
    console.log('🔔 App: Checking notification permission...');
    
    try {
      // For Android 13+, need to request POST_NOTIFICATIONS permission
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const POST_NOTIFICATIONS = 'android.permission.POST_NOTIFICATIONS';
        const status = await check(POST_NOTIFICATIONS);
        console.log('🔔 App: POST_NOTIFICATIONS status:', status);
        
        if (status === RESULTS.GRANTED) {
          console.log('✅ App: Notification permission already granted');
          return;
        }
        
        if (status === RESULTS.BLOCKED) {
          console.log('⚠️ App: Notification permission blocked, cannot request');
          Alert.alert(
            'Quyền thông báo bị chặn',
            'Quyền thông báo đã bị chặn. Vui lòng bật trong cài đặt ứng dụng.',
            [{ text: 'OK' }]
          );
          return;
        }

        // Show alert to user before requesting permission
        return new Promise<void>((resolve) => {
          Alert.alert(
            'Cho phép thông báo',
            'Ứng dụng cần quyền gửi thông báo để bạn không bỏ lỡ các cập nhật quan trọng về đơn hàng và dịch vụ.',
            [
              {
                text: 'Không cho phép',
                style: 'cancel',
                onPress: () => {
                  console.log('⚠️ App: User declined notification permission');
                  resolve();
                },
              },
              {
                text: 'Cho phép',
                onPress: async () => {
                  console.log('🔔 App: User accepted, requesting POST_NOTIFICATIONS permission...');
                  const result = await request(POST_NOTIFICATIONS);
                  console.log('🔔 App: POST_NOTIFICATIONS result:', result);
                  
                  if (result === RESULTS.GRANTED) {
                    console.log('✅ App: Notification permission granted');
                    // Also request Firebase permission
                    await fcmService.requestPermission();
                  } else {
                    console.log('❌ App: Notification permission denied');
                    // Show guidance to enable in settings
                    setTimeout(() => {
                      Alert.alert(
                        'Thông báo',
                        'Bạn có thể bật thông báo bất cứ lúc nào trong cài đặt ứng dụng.',
                        [{ text: 'OK' }]
                      );
                    }, 500);
                  }
                  resolve();
                },
              },
            ],
            { cancelable: false }
          );
        });
      } else {
        // For iOS or Android < 13, use Firebase messaging permission
        const hasPermission = await fcmService.checkPermission();
        
        if (hasPermission) {
          console.log('✅ App: Notification permission already granted');
          return;
        }

        // Show alert to user before requesting permission
        return new Promise<void>((resolve) => {
          Alert.alert(
            'Cho phép thông báo',
            'Ứng dụng cần quyền gửi thông báo để bạn không bỏ lỡ các cập nhật quan trọng về đơn hàng và dịch vụ.',
            [
              {
                text: 'Không cho phép',
                style: 'cancel',
                onPress: () => {
                  console.log('⚠️ App: User declined notification permission');
                  resolve();
                },
              },
              {
                text: 'Cho phép',
                onPress: async () => {
                  console.log('🔔 App: User accepted, requesting permission...');
                  const granted = await fcmService.requestPermission();
                  
                  if (granted) {
                    console.log('✅ App: Notification permission granted');
                  } else {
                    console.log('❌ App: Notification permission denied');
                    // Show guidance to enable in settings
                    setTimeout(() => {
                      Alert.alert(
                        'Thông báo',
                        'Bạn có thể bật thông báo bất cứ lúc nào trong cài đặt ứng dụng.',
                        [{ text: 'OK' }]
                      );
                    }, 500);
                  }
                  resolve();
                },
              },
            ],
            { cancelable: false }
          );
        });
      }
    } catch (error) {
      console.error('❌ App: Notification permission request error:', error);
    }
  };

  const requestStoragePermission = async () => {
    console.log('📁 App: Starting permission request process');
    
    if (Platform.OS === 'android') {
      let permissionKey;
      if (Platform.Version >= 33) {
        permissionKey = PERMISSIONS.ANDROID.READ_MEDIA_IMAGES;
        console.log('📁 App: Targeting Android 13+ - READ_MEDIA_IMAGES');
      } else {
        permissionKey = PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
        console.log('📁 App: Targeting Android <13 - READ_EXTERNAL_STORAGE');
      }

      try {
        const status = await check(permissionKey);
        console.log('📁 App: Current permission status:', status);

        if (status === RESULTS.DENIED) {
          console.log('📁 App: Permission denied, requesting...');
          const result = await request(permissionKey);
          console.log('📁 App: Request result:', result);
          
          if (result === RESULTS.DENIED) {
            console.log('⚠️ App: User permanently denied permission');
            Alert.alert(
              'Cần quyền truy cập',
              'Ứng dụng cần quyền truy cập bộ nhớ để chọn ảnh. Vui lòng bật trong cài đặt.',
              [{ text: 'OK' }]
            );
          } else if (result === RESULTS.BLOCKED) {
            console.log('⚠️ App: Permission blocked');
            Alert.alert(
              'Quyền bị chặn',
              'Quyền truy cập bộ nhớ bị chặn. Vui lòng bật trong cài đặt.',
              [{ text: 'OK' }]
            );
          }
        } else if (status === RESULTS.GRANTED) {
          console.log('✅ App: Permission already granted');
        } else {
          console.log('⚠️ App: Unexpected status:', status);
        }
      } catch (error) {
        console.error('❌ App: Permission request error:', error);
      }
    } else {
      console.log('📁 App: iOS - No permission request needed for gallery');
    }
  };

  return (
    <Provider store={store}>
      <RootNavigator />
    </Provider>
  );
}