import React, { useCallback, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Colors } from "../constants/colors";
import { Typography } from "../constants/typo";
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { spacing } from "../design-system/spacing";
import { getShadowStyle } from "../design-system/shadows";
import { borderRadius } from "../design-system/borders";

type HeaderProps = {
  title?: string;
  subtitle?: string;
  hideBackButton?: boolean; // Optional prop to force hide back button
  hideRightButton?: boolean;
  onPressRight?: () => void;
};

const Header = ({
  title = "Đăng nhập",
  subtitle,
  hideBackButton = false,
  hideRightButton = false,
  onPressRight,
}: HeaderProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const handleBackPress = useCallback(() => {
    try {
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    } catch (error) {
      // Fallback: try to navigate to Home if goBack fails
      try {
        navigation.navigate('Home' as never);
      } catch (fallbackError) {
        // Silent fail
      }
    }
  }, [navigation]);

  const canGoBack = useMemo(() => navigation.canGoBack(), [navigation]);
  const showBackButton = useMemo(() => !hideBackButton && canGoBack, [hideBackButton, canGoBack]);

  return (
    <View style={styles.headerContainer}>
      <View style={styles.container}>
        <View style={styles.leftSlot}>
          {showBackButton && (
            <TouchableOpacity onPress={handleBackPress} style={styles.iconButton}>
              <Ionicons name="chevron-back-outline" size={22} color={Colors.text.primary} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.centerSlot}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {!!subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        <View style={styles.rightSlot} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    width: "100%",
    position: "relative",
    zIndex: 1000,
    elevation: 10,
    backgroundColor: Colors.background.light,
    ...getShadowStyle("sm"),
  },
  container: {
    width: "100%",
    minHeight: 44,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    marginTop: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftSlot: {
    width: 44,
    height: 44,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  centerSlot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
  },
  rightSlot: {
    width: 44,
    height: 44,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  iconButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: borderRadius.full,
    backgroundColor: "rgba(255, 255, 255, 0.14)",
  },
  title: {
    color: Colors.text.primary,
    fontSize: 16,
    lineHeight: 20,
    fontFamily: Typography.fontFamily.medium,
  },
  subtitle: {
    marginTop: 1,
    color: Colors.text.tertiary,
    opacity: 1,
    fontSize: 11,
    lineHeight: 14,
    fontFamily: Typography.fontFamily.regular,
  },
});

Header.displayName = 'Header';

export default React.memo(Header);