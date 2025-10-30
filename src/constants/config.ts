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
  ios: 'http://127.0.0.1:3000/api',
  android: 'http://10.0.2.2:3000/api',
}) as string;