import { isDealerLikeRole, isManagerRole, isSuperAdminRole } from "../navigation/rolePolicy";
import { AuthUserType } from "../redux/slices/authSlice";

export type NavbarTabItem = {
  key: string;
  label: string;
  icon: string;
  routeName: string;
  isCenter?: boolean;
  requiresAuth?: boolean;
  /** Nếu true, tab này chỉ hiển thị với super admin (garage_admin) */
  superAdminOnly?: boolean;
};

export function buildNavbarTabs(userType?: string | null): NavbarTabItem[] {
  const role = (userType || null) as AuthUserType | null;
  const isManager = isManagerRole(role);
  const isSuperAdmin = isSuperAdminRole(role);
  const isDealer = isDealerLikeRole(role) && !isManager;

  // ── Garage manager (quản lý 1 gara) ──────────────────────────────────────
  if (isManager && !isSuperAdmin) {
    return [
      { key: "customers", label: "Khách hàng", icon: "people-outline", routeName: "GarageCustomers", requiresAuth: true },
      { key: "garage", label: "Gara", icon: "business-outline", routeName: "GarageManagement", requiresAuth: true },
      { key: "home", label: "Trang chủ", icon: "home", routeName: "HomeTab", isCenter: true },
      { key: "orders", label: "Đơn hàng", icon: "receipt-outline", routeName: "GarageOrders", requiresAuth: true },
      { key: "settings", label: "Cài đặt", icon: "settings-outline", routeName: "Profile", requiresAuth: true },
    ];
  }

  // ── Super admin (garage_admin) — có thêm tab Garages ─────────────────────
  if (isSuperAdmin) {
    return [
      { key: "customers", label: "Khách hàng", icon: "people-outline", routeName: "GarageCustomers", requiresAuth: true },
      { key: "garage", label: "Gara", icon: "business-outline", routeName: "GarageManagement", requiresAuth: true },
      { key: "home", label: "Trang chủ", icon: "home", routeName: "HomeTab", isCenter: true },
      { key: "orders", label: "Đơn hàng", icon: "receipt-outline", routeName: "GarageOrders", requiresAuth: true },
      { key: "garages", label: "Hệ thống", icon: "storefront-outline", routeName: "SuperAdminGarages", requiresAuth: true, superAdminOnly: true },
    ];
  }

  // ── Dealer ────────────────────────────────────────────────────────────────
  if (isDealer) {
    return [
      { key: "offer", label: "Ưu đãi", icon: "pricetag-outline", routeName: "Offer" },
      { key: "product", label: "Sản phẩm", icon: "cube-outline", routeName: "Category" },
      { key: "home", label: "Trang chủ", icon: "home", routeName: "HomeTab", isCenter: true },
      { key: "service", label: "Danh mục", icon: "grid-outline", routeName: "Category" },
      { key: "settings", label: "Cài đặt", icon: "settings-outline", routeName: "Profile", requiresAuth: true },
    ];
  }

  // ── Customer / guest ──────────────────────────────────────────────────────
  return [
    { key: "calendar", label: "Đặt lịch", icon: "calendar-outline", routeName: "Booking", requiresAuth: true },
    { key: "product", label: "Sản phẩm", icon: "cube-outline", routeName: "Category" },
    { key: "home", label: "Trang chủ", icon: "home", routeName: "HomeTab", isCenter: true },
    { key: "service", label: "Dịch vụ", icon: "construct-outline", routeName: "ServiceCategory" },
    { key: "settings", label: "Cài đặt", icon: "settings-outline", routeName: "Profile", requiresAuth: true },
  ];
}

export function splitNavbarTabs(tabs: NavbarTabItem[]) {
  const leftTabs = tabs.filter((t) => !t.isCenter).slice(0, 2);
  const rightTabs = tabs.filter((t) => !t.isCenter).slice(2, 4);
  const centerTab = tabs.find((t) => t.isCenter);

  return { leftTabs, rightTabs, centerTab };
}
