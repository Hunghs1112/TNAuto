// src/components/UserHeader/UserHeader.tsx
import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
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
            <Ionicons name="notifications-outline" size={24} color={Colors.text.secondary} />
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
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    width: "100%",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  greetingContainer: {
    gap: 6,
    flex: 1,
  },
  greeting: {
    color: Colors.text.secondary,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.base,
    lineHeight: 19,
  },
  userName: {
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    fontSize: 20,
    lineHeight: 22,
  },
  actionContainer: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  notificationButton: {
    width: 44, // Tăng kích thước vùng bấm
    height: 44, // Tăng kích thước vùng bấm
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    padding: 10, // Thêm padding để mở rộng vùng chạm
  },
  badge: {
    position: "absolute",
    top: 2, // Điều chỉnh vị trí badge cho phù hợp
    right: 2, // Điều chỉnh vị trí badge cho phù hợp
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.background.red,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: Colors.text.inverted,
    fontFamily: Typography.fontFamily.bold,
    fontSize: 10,
    fontWeight: 'bold',
    lineHeight: 12,
  },
});

export default UserHeader;