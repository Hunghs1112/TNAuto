// src/components/ManagerHome/NotificationButton.example.tsx

/**
 * Example usage of NotificationButton component
 * 
 * This file demonstrates how to use the NotificationButton component
 * in the ManagerHomeScreen.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NotificationButton } from './NotificationButton';

export const NotificationButtonExample: React.FC = () => {
  const handleNotificationPress = () => {
    console.log('Navigate to Notification screen');
    // navigation.navigate('Notification');
  };

  return (
    <View style={styles.container}>
      {/* Example 1: No unread notifications */}
      <NotificationButton
        unreadCount={0}
        onPress={handleNotificationPress}
      />

      {/* Example 2: Few unread notifications */}
      <NotificationButton
        unreadCount={5}
        onPress={handleNotificationPress}
      />

      {/* Example 3: Many unread notifications */}
      <NotificationButton
        unreadCount={42}
        onPress={handleNotificationPress}
      />

      {/* Example 4: Over 99 unread notifications */}
      <NotificationButton
        unreadCount={150}
        onPress={handleNotificationPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 16,
    padding: 20,
    backgroundColor: '#112552', // Dark background to show white icon
  },
});
