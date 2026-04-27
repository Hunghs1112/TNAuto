import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typo';

interface NotificationButtonProps {
  unreadCount: number;
  onPress: () => void;
  testID?: string;
}

/**
 * NotificationButton Component
 * 
 * Displays a notification bell icon with a badge showing unread count.
 * The badge is red when there are unread notifications.
 * Includes subtle animation for new notifications.
 * 
 * **Validates: Requirements 8.1, 8.3, 8.4, 8.6**
 */
export const NotificationButton: React.FC<NotificationButtonProps> = ({
  unreadCount,
  onPress,
  testID = 'notification-button',
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const prevUnreadCount = useRef(unreadCount);

  // Animate when unread count increases (new notification)
  useEffect(() => {
    if (unreadCount > prevUnreadCount.current && unreadCount > 0) {
      // Pulse animation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
    prevUnreadCount.current = unreadCount;
  }, [unreadCount, scaleAnim]);

  const showBadge = unreadCount > 0;
  const badgeText = unreadCount > 99 ? '99+' : unreadCount.toString();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel="Thông báo"
      accessibilityHint={`${unreadCount} thông báo chưa đọc`}
      testID={testID}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Ionicons 
          name="notifications-outline" 
          size={24} 
          color={Colors.background.light} 
        />
        {showBadge && (
          <View style={styles.badge} testID={`${testID}-badge`}>
            <Text style={styles.badgeText} testID={`${testID}-badge-text`}>
              {badgeText}
            </Text>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ef4444', // Red badge for unread notifications
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: Colors.background.light,
  },
  badgeText: {
    color: Colors.background.light,
    fontFamily: Typography.fontFamily.bold,
    fontSize: 10,
    fontWeight: 'bold',
    lineHeight: 12,
  },
});
