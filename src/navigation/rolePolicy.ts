import { AuthUserType } from '../redux/slices/authSlice';

export const MANAGER_ROLES: AuthUserType[] = ['garage_manager', 'garage_admin'];
export const DEALER_LIKE_ROLES: AuthUserType[] = ['dealer', ...MANAGER_ROLES];

export const isManagerRole = (role?: AuthUserType | null) => {
  return !!role && MANAGER_ROLES.includes(role);
};

export const isDealerLikeRole = (role?: AuthUserType | null) => {
  return !!role && DEALER_LIKE_ROLES.includes(role);
};
