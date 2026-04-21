// src/components/UserHeader/UserHeader.tsx
import React, { useMemo } from "react";
import { View, Text, Pressable, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typo";
import { spacing } from "../../design-system/spacing";
import { textStyles } from "../../design-system/typography";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppStackParamList } from "../../navigation/AppNavigator";
import { useAppSelector } from "../../redux/hooks/useAppSelector";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

interface UserHeaderProps {
  userName: string;
  garageName?: string;
  notificationCount?: number;
  offerCount?: number;
  insuranceCount?: number;
  onNotificationPress?: () => void;
  onOfferPress?: () => void;
  onInsurancePress?: () => void;
  onGaragePress?: () => void;
  isLoggedIn?: boolean;
  canChangeGarage?: boolean;
}

const UserHeader: React.FC<UserHeaderProps> = ({
  userName,
  garageName,
  notificationCount,
  offerCount,
  insuranceCount,
  onNotificationPress,
  onOfferPress,
  onInsurancePress,
  onGaragePress,
  isLoggedIn = true,
  canChangeGarage = false,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const showNotificationBadge = useMemo(() => notificationCount && notificationCount > 0, [notificationCount]);
  const notificationBadgeText = useMemo(() => {
    if (!notificationCount) return '';
    return notificationCount > 99 ? '99+' : notificationCount.toString();
  }, [notificationCount]);
  const showOfferBadge = useMemo(() => offerCount && offerCount > 0, [offerCount]);
  const offerBadgeText = useMemo(() => {
    if (!offerCount) return '';
    return offerCount > 99 ? '99+' : offerCount.toString();
  }, [offerCount]);
  const showInsuranceBadge = useMemo(() => insuranceCount && insuranceCount > 0, [insuranceCount]);
  const insuranceBadgeText = useMemo(() => {
    if (!insuranceCount) return '';
    return insuranceCount > 99 ? '99+' : insuranceCount.toString();
  }, [insuranceCount]);

  const handleLoginPress = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.topSpacing} />

      <View style={styles.content}>
        <View style={styles.headerContent}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>Xin chào!</Text>
            <Text style={styles.userName}>{userName}</Text>
            {!!garageName && (
              <TouchableOpacity
                style={[styles.garageChip, !canChangeGarage && styles.garageChipReadonly]}
                onPress={canChangeGarage ? onGaragePress : undefined}
                activeOpacity={canChangeGarage ? 0.8 : 1}
                disabled={!canChangeGarage}
              >
                <Ionicons name="business-outline" size={14} color={Colors.background.light} />
                <Text style={styles.garageChipText} numberOfLines={1}>
                  {garageName}
                </Text>
                {canChangeGarage && (
                  <Ionicons name="chevron-forward" size={14} color={Colors.background.light} />
                )}
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.actionContainer}>
            {isLoggedIn ? (
              <>
                <Pressable style={styles.notificationButton} onPress={onOfferPress}>
                  <Ionicons name="pricetag-outline" size={20} color={Colors.background.light} />
                  {showOfferBadge && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{offerBadgeText}</Text>
                    </View>
                  )}
                </Pressable>
                <Pressable style={styles.notificationButton} onPress={onInsurancePress}>
                  <Ionicons name="shield-checkmark-outline" size={20} color={Colors.background.light} />
                  {showInsuranceBadge && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{insuranceBadgeText}</Text>
                    </View>
                  )}
                </Pressable>
                <Pressable style={styles.notificationButton} onPress={onNotificationPress}>
                  <Ionicons name="notifications-outline" size={20} color={Colors.background.light} />
                  {showNotificationBadge && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{notificationBadgeText}</Text>
                    </View>
                  )}
                </Pressable>
              </>
            ) : (
              <TouchableOpacity style={styles.loginButton} onPress={handleLoginPress}>
                <Ionicons name="log-in-outline" size={20} color={Colors.background.light} />
                <Text style={styles.loginButtonText}>Đăng nhập</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  topSpacing: {
    height: 0,
  },
  content: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg - 8,
    width: "100%",
    position: 'relative',
    zIndex: 1,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  greetingContainer: {
    gap: spacing.xs,
    flex: 1,
  },
  greeting: {
    color: Colors.background.light,
    ...textStyles.body,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: Typography.weight.medium,
    opacity: 0.95,
  },
  userName: {
    color: Colors.background.light,
    ...textStyles.h2,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    letterSpacing: 0.2,
  },
  garageChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: Colors.alpha.white18,
    borderWidth: 1,
    borderColor: Colors.alpha.white30,
    maxWidth: '100%',
  },
  garageChipReadonly: {
    opacity: 0.92,
  },
  garageChipText: {
    color: Colors.background.light,
    fontFamily: Typography.fontFamily.medium,
    fontSize: 12,
    fontWeight: Typography.weight.medium,
    maxWidth: 180,
  },
  actionContainer: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: 2,
  },
  notificationButton: {
    width: 34,
    height: 34,
    borderRadius: 999,
    borderRadius: 999,
    backgroundColor: Colors.alpha.white25,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    borderWidth: 1.5,
    borderColor: Colors.alpha.white40,
  },
  badge: {
    position: "absolute",
    top: -3,
    right: -3,
    minWidth: 16,
    height: 16,
    borderRadius: 6,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.secondaryLight,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeText: {
    color: Colors.secondaryLight,
    fontFamily: Typography.fontFamily.bold,
    fontSize: 8,
    fontWeight: Typography.weight.bold,
    lineHeight: 11,
    paddingHorizontal: spacing.xs / 2,
    textShadowColor: Colors.background.light,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 1.1,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: Colors.alpha.white25,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.alpha.white40,
  },
  loginButtonText: {
    color: Colors.background.light,
    fontFamily: Typography.fontFamily.bold,
    fontSize: 14,
    fontWeight: Typography.weight.bold,
  },
});

export default React.memo(UserHeader);
