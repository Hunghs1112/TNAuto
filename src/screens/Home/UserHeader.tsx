// src/components/UserHeader/UserHeader.tsx
import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typo";

interface UserHeaderProps {
  userName: string;
  notificationCount?: number;
  onNotificationPress?: () => void;
}

const UserHeader: React.FC<UserHeaderProps> = ({ userName, notificationCount, onNotificationPress }) => {
  const showBadge = notificationCount && notificationCount > 0;

  console.log('UserHeader rendered with userName:', userName, 'notificationCount:', notificationCount);

  return (
    <LinearGradient
      colors={[Colors.primary, Colors.primaryLight]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientContainer}
    >
      <View style={styles.container}>
        <View style={styles.headerContent}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>Xin chào!</Text>
            <Text style={styles.userName}>{userName}</Text>
          </View>
          <View style={styles.actionContainer}>
            <Pressable 
              style={styles.notificationButton}
              onPress={onNotificationPress}
            >
              <Ionicons name="notifications-outline" size={26} color={Colors.background.light} />
              {showBadge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    width: "100%",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: Colors.shadow.red,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  container: {
    paddingVertical: 28,
    paddingHorizontal: 24,
    width: "100%",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  greetingContainer: {
    gap: 8,
    flex: 1,
  },
  greeting: {
    color: Colors.background.light,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.base,
    lineHeight: 20,
    opacity: 0.95,
  },
  userName: {
    color: Colors.background.light,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    fontSize: 24,
    lineHeight: 28,
    letterSpacing: 0.3,
  },
  actionContainer: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  badge: {
    position: "absolute",
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.secondary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Colors.background.light,
    shadowColor: Colors.shadow.default,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  badgeText: {
    color: Colors.text.inverted,
    fontFamily: Typography.fontFamily.bold,
    fontSize: 8,
    fontWeight: 'bold',
    lineHeight: 10,
    paddingHorizontal: 2,
  },
});

export default React.memo(UserHeader);