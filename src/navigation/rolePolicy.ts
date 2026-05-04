import { AuthUserType } from '../redux/slices/authSlice';

// garage_admin = super admin (quản lý nhiều gara, có quyền cao nhất)
// garage_manager = admin của 1 gara cụ thể
export const MANAGER_ROLES: AuthUserType[] = ['garage_manager', 'garage_admin'];
export const SUPER_ADMIN_ROLES: AuthUserType[] = ['garage_admin'];
export const DEALER_LIKE_ROLES: AuthUserType[] = ['dealer', ...MANAGER_ROLES];

/** Có quyền quản trị gara (garage_manager hoặc garage_admin) */
export const isManagerRole = (role?: AuthUserType | null): boolean => {
  return !!role && MANAGER_ROLES.includes(role);
};

/** Chỉ dành cho super admin (garage_admin) */
export const isSuperAdminRole = (role?: AuthUserType | null): boolean => {
  return role === 'garage_admin';
};

/** dealer hoặc bất kỳ manager role nào */
export const isDealerLikeRole = (role?: AuthUserType | null): boolean => {
  return !!role && DEALER_LIKE_ROLES.includes(role);
};

/** Không phải customer thuần — dùng để ẩn các tính năng chỉ dành cho customer */
export const isNonCustomerRole = (role?: AuthUserType | null): boolean => {
  return !!role && role !== 'customer';
};
