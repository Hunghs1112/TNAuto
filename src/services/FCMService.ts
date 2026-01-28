/**
 * FCMService - Firebase Cloud Messaging Service
 * 
 * Handles all FCM operations:
 * - Token management (get, register, delete)
 * - Foreground message handling (when app is open)
 * - Background/terminated message handling (via index.js)
 * - Notification tap handling
 * - Token refresh handling
 */

import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { notificationService } from './NotificationService';
import { Platform, AppState, AppStateStatus } from 'react-native';
import { store } from '../redux/stores';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FCM_TOKEN_KEY = 'fcm_token';

/**
 * Note: Background message handler is registered in index.js (top level)
 * This is required by React Native Firebase for background/terminated notifications
 */

class FCMService {
  private fcmToken: string | null = null;
  private unsubscribeForegroundListener: (() => void) | null = null;
  private unsubscribeTokenRefreshListener: (() => void) | null = null;
  private unsubscribeAppStateListener: { remove: () => void } | null = null;
  private isInitialized: boolean = false;

  /**
   * Request notification permission (required for iOS, Android 13+)
   */
  async requestPermission(): Promise<boolean> {
    console.log('🔔 FCMService: Requesting notification permission...');
    
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('✅ FCMService: Permission granted, status:', authStatus);
      } else {
        console.log('❌ FCMService: Permission denied, status:', authStatus);
      }

      return enabled;
    } catch (error) {
      console.error('❌ FCMService: Permission request error:', error);
      return false;
    }
  }

  /**
   * Get FCM token from Firebase
   */
  async getFCMToken(): Promise<string | null> {
    try {
      // Check permission first
      const hasPermission = await this.checkPermission();
      if (!hasPermission) {
        console.log('⚠️ FCMService: No permission, requesting...');
        const granted = await this.requestPermission();
        if (!granted) {
          console.log('❌ FCMService: Permission not granted, cannot get token');
          return null;
        }
      }

      // Get token
      const token = await messaging().getToken();
      this.fcmToken = token;
      
      // Save to AsyncStorage
      await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
      
      console.log('✅ FCMService: FCM Token obtained:', token.substring(0, 50) + '...');
      return token;
    } catch (error) {
      console.error('❌ FCMService: Get token error:', error);
      return null;
    }
  }

  /**
   * Get saved token from AsyncStorage
   */
  async getSavedToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem(FCM_TOKEN_KEY);
      return token;
    } catch (error) {
      console.error('❌ FCMService: Get saved token error:', error);
      return null;
    }
  }

  /**
   * Check if permission is granted
   */
  async checkPermission(): Promise<boolean> {
    try {
      const authStatus = await messaging().hasPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      
      return enabled;
    } catch (error) {
      console.error('❌ FCMService: Check permission error:', error);
      return false;
    }
  }

  /**
   * Delete FCM token (call on logout)
   */
  async deleteToken(): Promise<void> {
    try {
      await messaging().deleteToken();
      await AsyncStorage.removeItem(FCM_TOKEN_KEY);
      this.fcmToken = null;
      console.log('✅ FCMService: Token deleted locally');
    } catch (error) {
      console.error('❌ FCMService: Delete token error:', error);
    }
  }

  /**
   * Register FCM token with backend
   */
  async registerTokenWithBackend(token: string, userId: string, userType: 'customer' | 'employee'): Promise<void> {
    try {
      console.log('📤 FCMService: Registering token with backend...', {
        userId,
        userType,
        tokenPreview: token.substring(0, 30) + '...'
      });

      // Get device info
      const deviceInfo = `${Platform.OS} ${Platform.Version}`;

      // Import API dynamically to avoid circular dependency
      const { notificationApi } = await import('./notificationApi');
      
      const registerMutation = store.dispatch(
        notificationApi.endpoints.registerFcmToken.initiate({
          user_id: userId,
          user_type: userType,
          token: token,
          device_info: deviceInfo,
        })
      );

      const result = await registerMutation;
      
      if ('error' in result) {
        console.error('❌ FCMService: Backend returned error:', JSON.stringify(result.error, null, 2));
        throw new Error(`Failed to register token: ${JSON.stringify(result.error)}`);
      }

      console.log('✅ FCMService: Token registered with backend successfully');
    } catch (error) {
      console.error('❌ FCMService: Register token with backend error:', error);
      // Don't throw - allow app to continue working even if FCM registration fails
      // Token will be re-registered on next app start or token refresh
    }
  }

  /**
   * Unregister FCM token from backend (call on logout)
   */
  async unregisterTokenFromBackend(token: string): Promise<void> {
    try {
      const { notificationApi } = await import('./notificationApi');
      
      const deleteMutation = store.dispatch(
        notificationApi.endpoints.deleteFcmToken.initiate({
          token: token,
        })
      );

      const result = await deleteMutation;
      
      if ('error' in result) {
        throw new Error('Failed to unregister token from backend');
      }

      console.log('✅ FCMService: Token unregistered from backend');
    } catch (error) {
      console.error('❌ FCMService: Unregister token from backend error:', error);
    }
  }

  /**
   * Setup foreground message listener
   * This handles notifications when app is open and visible
   */
  setupForegroundListener(): void {
    // Cleanup existing listener first
    if (this.unsubscribeForegroundListener) {
      console.log('⚠️ FCMService: Removing existing foreground listener...');
      this.unsubscribeForegroundListener();
      this.unsubscribeForegroundListener = null;
    }

    console.log('🔔 FCMService: Setting up foreground listener...');
    
    this.unsubscribeForegroundListener = messaging().onMessage(async remoteMessage => {
      console.log('📱 FCMService: Foreground message received', {
        messageId: remoteMessage.messageId,
        notification: remoteMessage.notification,
        data: remoteMessage.data,
      });

      try {
        // Extract notification content
        let title = 'Thông báo mới';
        let body = '';
        let data = remoteMessage.data || {};

        if (remoteMessage.notification) {
          title = remoteMessage.notification.title || title;
          body = remoteMessage.notification.body || body;
        } else if (remoteMessage.data) {
          // Data-only notification
          const dataObj = remoteMessage.data as Record<string, any>;
          title = dataObj.title || dataObj.notification?.title || title;
          body = dataObj.body || 
                 dataObj.message || 
                 dataObj.notification?.body || 
                 body;
        }

        // Display notification using Notifee
        // This ensures notification is shown even when app is in foreground
        await notificationService.displayNotification(title, body, data);
        
        console.log('✅ FCMService: Foreground notification displayed');
      } catch (error) {
        console.error('❌ FCMService: Error displaying foreground notification:', error);
      }
    });

    console.log('✅ FCMService: Foreground listener setup complete');
  }

  /**
   * Setup token refresh listener
   * FCM tokens can be refreshed by Firebase automatically
   */
  setupTokenRefreshListener(): void {
    // Cleanup existing listener first
    if (this.unsubscribeTokenRefreshListener) {
      console.log('⚠️ FCMService: Removing existing token refresh listener...');
      this.unsubscribeTokenRefreshListener();
      this.unsubscribeTokenRefreshListener = null;
    }

    console.log('🔄 FCMService: Setting up token refresh listener...');
    
    this.unsubscribeTokenRefreshListener = messaging().onTokenRefresh(async token => {
      console.log('🔄 FCMService: Token refreshed by Firebase:', token.substring(0, 50) + '...');
      
      // Update stored token
      this.fcmToken = token;
      await AsyncStorage.setItem(FCM_TOKEN_KEY, token);

      // Check if user is logged in
      const state = store.getState();
      if (!state.auth.isLoggedIn || !state.auth.userId || !state.auth.userType) {
        console.log('⚠️ FCMService: User not logged in, token saved locally only');
        return;
      }

      // Re-register with backend (backend will handle update if token exists)
      console.log('🔄 FCMService: Re-registering token with backend');
      await this.registerTokenWithBackend(token, state.auth.userId, state.auth.userType);
    });

    console.log('✅ FCMService: Token refresh listener setup complete');
  }

  /**
   * Handle notification opened from quit/terminated state
   * This is called when user taps notification and app was completely closed
   */
  async handleInitialNotification(): Promise<void> {
    console.log('🚀 FCMService: Checking initial notification...');
    
    try {
      const remoteMessage = await messaging().getInitialNotification();
      
      if (remoteMessage) {
        console.log('📬 FCMService: App opened from terminated state via notification:', {
          messageId: remoteMessage.messageId,
          data: remoteMessage.data,
        });
        
        // Wait for navigation to be ready, then handle navigation
        setTimeout(() => {
          notificationService.handleNotificationPress(remoteMessage.data);
        }, 1500);
      } else {
        console.log('ℹ️ FCMService: No initial notification');
      }
    } catch (error) {
      console.error('❌ FCMService: Error checking initial notification:', error);
    }
  }

  /**
   * Setup notification opened listener
   * This handles when user taps notification and app is in background
   */
  setupNotificationOpenedListener(): void {
    console.log('👆 FCMService: Setting up notification opened listener...');
    
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('📬 FCMService: Notification opened app from background:', {
        messageId: remoteMessage.messageId,
        data: remoteMessage.data,
      });
      
      // Handle navigation
      notificationService.handleNotificationPress(remoteMessage.data);
    });

    console.log('✅ FCMService: Notification opened listener setup complete');
  }

  /**
   * Setup app state listener to handle device lock/unlock
   */
  setupAppStateListener(): void {
    if (this.unsubscribeAppStateListener) {
      this.unsubscribeAppStateListener.remove();
      this.unsubscribeAppStateListener = null;
    }

    console.log('📱 FCMService: Setting up app state listener...');

    this.unsubscribeAppStateListener = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      console.log('📱 FCMService: App state changed:', nextAppState);
      
      // When app comes to foreground, check for any pending notifications
      if (nextAppState === 'active') {
        // Check for initial notification in case it was missed
        this.handleInitialNotification().catch(error => {
          console.error('❌ FCMService: Error handling initial notification on app state change:', error);
        });
      }
    });

    console.log('✅ FCMService: App state listener setup complete');
  }

  /**
   * Initialize FCM service (call in App.tsx)
   * Note: Permission should be requested separately before calling this
   */
  async initialize(): Promise<void> {
    // Prevent multiple initializations
    if (this.isInitialized) {
      console.log('⚠️ FCMService: Already initialized, skipping...');
      return;
    }

    console.log('🚀 FCMService: Initializing...');

    try {
      // Setup listeners (only once)
      this.setupForegroundListener();
      this.setupTokenRefreshListener();
      this.setupNotificationOpenedListener();
      this.setupAppStateListener();

      // Handle initial notification (if app was opened from terminated state)
      await this.handleInitialNotification();

      this.isInitialized = true;
      console.log('✅ FCMService: Initialization complete');
    } catch (error) {
      console.error('❌ FCMService: Initialization error:', error);
    }
  }

  /**
   * Cleanup listeners
   */
  cleanup(): void {
    console.log('🧹 FCMService: Cleaning up...');
    
    if (this.unsubscribeForegroundListener) {
      this.unsubscribeForegroundListener();
      this.unsubscribeForegroundListener = null;
    }
    
    if (this.unsubscribeTokenRefreshListener) {
      this.unsubscribeTokenRefreshListener();
      this.unsubscribeTokenRefreshListener = null;
    }

    if (this.unsubscribeAppStateListener) {
      this.unsubscribeAppStateListener.remove();
      this.unsubscribeAppStateListener = null;
    }

    this.isInitialized = false;
    console.log('✅ FCMService: Cleanup complete');
  }

  /**
   * Get current FCM token (cached or fetch new)
   */
  getCurrentToken(): string | null {
    return this.fcmToken;
  }
}

export const fcmService = new FCMService();
