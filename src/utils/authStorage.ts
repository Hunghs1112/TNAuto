// src/utils/authStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_STORAGE_KEY = 'persist:root';

/**
 * Clear all persisted authentication data
 */
export const clearAuthStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    console.log('Auth storage cleared successfully');
  } catch (error) {
    console.error('Error clearing auth storage:', error);
  }
};

/**
 * Check if user has persisted auth data
 */
export const hasPersistedAuth = async (): Promise<boolean> => {
  try {
    const data = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    return data !== null;
  } catch (error) {
    console.error('Error checking persisted auth:', error);
    return false;
  }
};

/**
 * Get persisted auth data (for debugging)
 */
export const getPersistedAuthData = async (): Promise<any> => {
  try {
    const data = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting persisted auth data:', error);
    return null;
  }
};

