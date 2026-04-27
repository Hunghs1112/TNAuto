// src/utils/fcmTokenManager.ts - Utility to manage FCM token registration

type SupportedUserType = 'customer' | 'employee' | 'dealer' | 'garage_manager' | 'garage_admin';

async function getFCMService() {
  const module = await import('../services/FCMService');
  return module.fcmService;
}

/**
 * Register FCM token after login
 * Call this function after successful login
 */
export async function registerFCMTokenAfterLogin(
  userId: string,
  userType: SupportedUserType,
): Promise<boolean> {
  try {
    const fcmService = await getFCMService();

    // Always fetch fresh token on new login (khong dung cached)
    const token = await fcmService.getFCMToken();

    if (!token) {
      console.error('FCM Token Manager: Failed to get FCM token');
      return false;
    }

    await fcmService.registerTokenWithBackend(token, userId, userType);
    return true;
  } catch (error) {
    console.error('FCM Token Manager: Unexpected error:', error);
    return false;
  }
}

/**
 * Unregister FCM token on logout
 * Call this function before logout
 */
export async function unregisterFCMTokenOnLogout(): Promise<boolean> {
  try {
    const fcmService = await getFCMService();
    const token = await fcmService.getSavedToken();

    if (!token) {
      return true;
    }

    await fcmService.unregisterTokenFromBackend(token);
    await fcmService.deleteToken();

    return true;
  } catch (error) {
    console.error('FCM Token Manager: Unregistration failed:', error);
    return false;
  }
}

/**
 * Refresh FCM token registration (e.g., when token changes)
 */
export async function refreshFCMTokenRegistration(
  userId: string,
  userType: SupportedUserType,
): Promise<boolean> {
  try {
    const fcmService = await getFCMService();
    const token = await fcmService.getFCMToken();

    if (!token) {
      console.error('FCM Token Manager: Failed to get FCM token');
      return false;
    }

    await fcmService.refreshTokenWithBackend(token, userId, userType);
    return true;
  } catch (error) {
    console.error('FCM Token Manager: Refresh failed:', error);
    return false;
  }
}

