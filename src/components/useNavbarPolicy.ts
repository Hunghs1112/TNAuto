import { Alert } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useCallback, useMemo } from "react";

import { useAppSelector } from "../redux/hooks/useAppSelector";
import { buildNavbarTabs, NavbarTabItem } from "./navbarPolicy";

export type NavbarPolicyContract = {
  tabs: NavbarTabItem[];
  activeTab: string;
  onTabPress: (tab: NavbarTabItem) => void;
};

export function useNavbarPolicy(props: BottomTabBarProps): NavbarPolicyContract {
  const { navigation, state } = props;

  const isLoggedIn = useAppSelector((s) => s.auth.isLoggedIn);
  const userType = useAppSelector((s) => s.auth.userType);

  const activeTab = state?.routes?.[state.index]?.name || "";

  const tabs = useMemo(() => buildNavbarTabs(userType), [userType]);

  const requireAuth = useCallback(
    (action: () => void) => {
      if (!isLoggedIn) {
        Alert.alert("Cần đăng nhập", "Vui lòng đăng nhập để tiếp tục.", [
          { text: "Hủy", style: "cancel" },
          { text: "Đăng nhập", onPress: () => navigation.navigate("Login" as never) },
        ]);
        return;
      }
      action();
    },
    [isLoggedIn, navigation]
  );

  const onTabPress = useCallback(
    (tab: NavbarTabItem) => {
      if (activeTab === tab.routeName) return;

      const go = () => navigation.navigate(tab.routeName as never);

      if (tab.requiresAuth) {
        requireAuth(go);
        return;
      }

      go();
    },
    [activeTab, navigation, requireAuth]
  );

  return {
    tabs,
    activeTab,
    onTabPress,
  };
}
