// src/utils/fcmTokenManager.ts - Utility to manage FCM token registration
import { fcmService } from '../services/FCMService';

/**
 * Register FCM token after login
 * Call this function after successful login
 */
export async function registerFCMTokenAfterLogin(
  userId: string,
  userType: 'customer' | 'employee'
): Promise<boolean> {
  console.log('🔐 FCM Token Manager: Registering token after login', { userId, userType });

  try {
    // Always fetch fresh token on new login (không dùng cached)
    console.log('⚠️ FCM Token Manager: Fetching fresh token for new user...');
    const token = await fcmService.getFCMToken();

    if (!token) {
      console.error('❌ FCM Token Manager: Failed to get FCM token');
      return false;
    }

    // Register token with backend (errors handled inside, won't throw)
    await fcmService.registerTokenWithBackend(token, userId, userType);
    
    console.log('✅ FCM Token Manager: Token registration process completed');
    return true;
  } catch (error) {
    console.error('❌ FCM Token Manager: Unexpected error:', error);
    return false;
  }
}

/**
 * Unregister FCM token on logout
 * Call this function before logout
 */
export async function unregisterFCMTokenOnLogout(): Promise<boolean> {
  console.log('🔓 FCM Token Manager: Unregistering token on logout');

  try {
    // Get saved token
    const token = await fcmService.getSavedToken();
    
    if (!token) {
      console.log('⚠️ FCM Token Manager: No token to unregister');
      return true;
    }

    // Unregister from backend
    await fcmService.unregisterTokenFromBackend(token);
    
    // Delete token locally
    await fcmService.deleteToken();
    
    console.log('✅ FCM Token Manager: Token unregistered successfully');
    return true;
  } catch (error) {
    console.error('❌ FCM Token Manager: Unregistration failed:', error);
    return false;
  }
}

/**
 * Refresh FCM token registration (e.g., when token changes)
 */
export async function refreshFCMTokenRegistration(
  userId: string,
  userType: 'customer' | 'employee'
): Promise<boolean> {
  console.log('🔄 FCM Token Manager: Refreshing token registration');

  try {
    // Get new token
    const token = await fcmService.getFCMToken();
    
    if (!token) {
      console.error('❌ FCM Token Manager: Failed to get FCM token');
      return false;
    }

    // Re-register with backend
    await fcmService.registerTokenWithBackend(token, userId, userType);
    
    console.log('✅ FCM Token Manager: Token refreshed successfully');
    return true;
  } catch (error) {
    console.error('❌ FCM Token Manager: Refresh failed:', error);
    return false;
  }
}

