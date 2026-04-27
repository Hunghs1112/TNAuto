import { isDealerLikeRole, isManagerRole } from "../navigation/rolePolicy";
import { AuthUserType } from "../redux/slices/authSlice";

export type NavbarTabItem = {
  key: string;
  label: string;
  icon: string;
  routeName: string;
  isCenter?: boolean;
  requiresAuth?: boolean;
};

export function buildNavbarTabs(userType?: string | null): NavbarTabItem[] {
  const role = (userType || null) as AuthUserType | null;
  const isDealer = isDealerLikeRole(role);
  const isManager = isManagerRole(role);

  if (isManager) {
    return [
      { key: "customers", label: "Khach hang", icon: "people-outline", routeName: "Customers" },
      { key: "orders", label: "Don hang", icon: "receipt-outline", routeName: "Category" },
      { key: "home", label: "Trang chu", icon: "home", routeName: "HomeTab", isCenter: true },
      {
        key: "settings",
        label: "Cai dat",
        icon: "settings-outline",
        routeName: "Profile",
        requiresAuth: true,
      },
    ];
  }

  if (isDealer) {
    return [
      { key: "offer", label: "Ưu đãi", icon: "pricetag-outline", routeName: "Offer" },
      { key: "product", label: "Sản phẩm", icon: "cube-outline", routeName: "Category" },
      { key: "home", label: "Trang chủ", icon: "home", routeName: "HomeTab", isCenter: true },
      { key: "service", label: "Danh mục", icon: "grid-outline", routeName: "Category" },
      {
        key: "settings",
        label: "Cài đặt",
        icon: "settings-outline",
        routeName: "Profile",
        requiresAuth: true,
      },
    ];
  }

  return [
    {
      key: "calendar",
      label: "Đặt lịch",
      icon: "calendar-outline",
      routeName: "Booking",
      requiresAuth: true,
    },
    { key: "product", label: "Sản phẩm", icon: "cube-outline", routeName: "Category" },
    { key: "home", label: "Trang chủ", icon: "home", routeName: "HomeTab", isCenter: true },
    { key: "service", label: "Dịch vụ", icon: "construct-outline", routeName: "ServiceCategory" },
    {
      key: "settings",
      label: "Cài đặt",
      icon: "settings-outline",
      routeName: "Profile",
      requiresAuth: true,
    },
  ];
}

export function splitNavbarTabs(tabs: NavbarTabItem[]) {
  const leftTabs = tabs.filter((t) => !t.isCenter).slice(0, 2);
  const rightTabs = tabs.filter((t) => !t.isCenter).slice(2, 4);
  const centerTab = tabs.find((t) => t.isCenter);

  return { leftTabs, rightTabs, centerTab };
}
