export const Routes = {
  AUTH: {
    LOGIN: 'Login',
    REGISTER: 'Register',
  },
  APP: {
    HOME: 'Home',
    CART: 'Cart',
    PROFILE: 'Profile',
  },
};

import { Platform } from 'react-native';

export const API_BASE_URL = Platform.select({
  ios: 'http://103.200.20.253:5000',
  android: 'http://103.200.20.253:5000',
}) as string;