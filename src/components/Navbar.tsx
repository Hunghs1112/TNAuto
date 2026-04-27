import React, { useCallback, useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { Colors } from "../constants/colors";
import { Typography } from "../constants/typo";
import { borderRadius } from "../design-system/borders";
import { spacing } from "../design-system/spacing";
import { NavbarTabItem, splitNavbarTabs } from "./navbarPolicy";

function usePressActiveAnimation(isActive: boolean, pressedScale: number, activeScale: number) {
  const pressed = useSharedValue(0);
  const active = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    active.value = withTiming(isActive ? 1 : 0, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
  }, [active, isActive]);

  const onPressIn = useCallback(() => {
    pressed.value = withTiming(1, { duration: 120, easing: Easing.out(Easing.quad) });
  }, [pressed]);

  const onPressOut = useCallback(() => {
    pressed.value = withTiming(0, { duration: 120, easing: Easing.out(Easing.quad) });
  }, [pressed]);

  const animStyle = useAnimatedStyle(() => {
    const scale = withTiming(pressed.value ? pressedScale : activeScale + active.value * 0.06, {
      duration: 200,
      easing: Easing.out(Easing.cubic),
    });

    const opacity = 1 - pressed.value * 0.18;

    return {
      transform: [{ scale }],
      opacity,
    };
  }, [pressedScale, activeScale]);

  return { onPressIn, onPressOut, animStyle, active };
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const TabButton = React.memo(function TabButton({
  label,
  icon,
  isActive,
  onPress,
}: {
  label: string;
  icon: string;
  isActive: boolean;
  onPress: () => void;
}) {
  const { onPressIn, onPressOut, animStyle, active } = usePressActiveAnimation(isActive, 0.95, 1);

  const ACTIVE_COLOR = Colors.primary;

  const iconColorStyle = useAnimatedStyle(() => {
    const color = interpolateColor(active.value, [0, 1], [Colors.text.tertiary, ACTIVE_COLOR]);
    return { color } as any;
  });

  const labelStyle = useAnimatedStyle(() => {
    const color = interpolateColor(active.value, [0, 1], [Colors.text.tertiary, ACTIVE_COLOR]);
    return { color } as any;
  });

  const iconWrapStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(active.value, [0, 1], [Colors.transparent, Colors.secondaryLight]);
    const backgroundColor = interpolateColor(
      active.value,
      [0, 1],
      [Colors.transparent, Colors.secondarySoft]
    );

    return {
      borderColor,
      backgroundColor,
      transform: [{ translateY: active.value * -1 }],
    };
  });

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[styles.tabButton, animStyle]}
      accessibilityRole="button"
    >
      <Animated.View style={[styles.iconWrap, iconWrapStyle]}>
        <Animated.Text style={[styles.iconText, iconColorStyle]}>
          <Ionicons
            name={icon as any}
            size={20}
            color={isActive ? Colors.secondary : Colors.text.tertiary}
          />
        </Animated.Text>
      </Animated.View>
      <Animated.Text style={[styles.tabLabel, labelStyle]}>{label}</Animated.Text>
    </AnimatedPressable>
  );
});

const CenterHomeButton = React.memo(function CenterHomeButton({
  isActive,
  onPress,
}: {
  isActive: boolean;
  onPress: () => void;
}) {
  const { onPressIn, onPressOut, animStyle, active } = usePressActiveAnimation(isActive, 0.94, 1);

  const ringStyle = useAnimatedStyle(() => {
    return {
      opacity: active.value,
      transform: [{ scale: 1 + active.value * 0.08 }],
    };
  });

  const activeBorderStyle = useAnimatedStyle(() => {
    return {
      opacity: active.value,
      transform: [{ scale: 1 + active.value * 0.02 }],
    };
  });

  return (
    <View style={styles.centerSlot} pointerEvents="box-none">
      <Animated.View style={[styles.centerRing, ringStyle]} />
      <Animated.View style={[styles.centerActiveBorder, activeBorderStyle]} />
      <AnimatedPressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[styles.centerButton, animStyle]}
        accessibilityRole="button"
      >
        <View
          colors={[...Colors.gradients.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.centerGradient, { backgroundColor: Colors.primary }]}
        >
          <Ionicons name="home" size={28} color={Colors.text.inverted} />
        </View>
      </AnimatedPressable>
    </View>
  );
});

type NavbarProps = {
  tabs: NavbarTabItem[];
  activeTab: string;
  onTabPress: (tab: NavbarTabItem) => void;
};

const Navbar = ({ tabs, activeTab, onTabPress }: NavbarProps) => {
  const insets = useSafeAreaInsets();
  const { leftTabs, rightTabs, centerTab } = splitNavbarTabs(tabs);

  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom }]} pointerEvents="box-none">
      <View style={[styles.container, { backgroundColor: Colors.background.light }]}
      >
        <View style={styles.borderTop} />
        <View style={styles.row}>
          <View style={styles.sideGroup}>
            {leftTabs.map((t: NavbarTabItem) => (
              <TabButton
                key={t.key}
                label={t.label}
                icon={t.icon}
                isActive={activeTab === t.routeName}
                onPress={() => onTabPress(t)}
              />
            ))}
          </View>
          <View style={styles.centerGap} />
          <View style={styles.sideGroup}>
            {rightTabs.map((t: NavbarTabItem) => (
              <TabButton
                key={t.key}
                label={t.label}
                icon={t.icon}
                isActive={activeTab === t.routeName}
                onPress={() => onTabPress(t)}
              />
            ))}
          </View>
        </View>
        {centerTab && (
          <CenterHomeButton
            isActive={activeTab === centerTab.routeName}
            onPress={() => onTabPress(centerTab)}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: Colors.background.light },
  container: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingTop: 10,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    minHeight: 76,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
    shadowColor: Colors.background.light,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 18,
  },
  borderTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Colors.background.light,
    opacity: 0.18,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
  },
  row: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" },
  sideGroup: { flex: 1, flexDirection: "row", justifyContent: "space-around", alignItems: "flex-end" },
  centerGap: { width: 84 },
  tabButton: {
    flex: 1,
    maxWidth: 92,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 16,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  iconText: { lineHeight: 22 },
  tabLabel: { marginTop: 4, fontSize: 10, fontFamily: Typography.fontFamily.medium },
  centerSlot: {
    position: "absolute",
    left: "53%",
    top: -18,
    marginLeft: -32,
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  centerRing: {
    position: "absolute",
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.background.light,
    opacity: 0.18,
  },
  centerActiveBorder: {
    position: "absolute",
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    borderColor: Colors.secondary,
  },
  centerButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    shadowColor: Colors.shadow.primary,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 24,
  },
  centerGradient: { flex: 1, borderRadius: 32, alignItems: "center", justifyContent: "center" },
});

export default Navbar;
