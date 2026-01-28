/**
 * Screen Component - Đơn giản và dễ sử dụng
 * Wrapper cơ bản cho các màn hình với header và safe area
 */

import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../../../constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../../Header';

export interface ScreenProps {
  children: React.ReactNode;
  headerTitle?: string;
  showBackButton?: boolean;
  hideHeader?: boolean;
  backgroundColor?: string;
  statusBarStyle?: 'light-content' | 'dark-content';
}

const Screen: React.FC<ScreenProps> = ({
  children,
  headerTitle,
  showBackButton = true,
  hideHeader = false,
  backgroundColor = Colors.background.light,
  statusBarStyle = 'light-content',
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <StatusBar
        barStyle={statusBarStyle}
        backgroundColor={Colors.primary}
        translucent={false}
      />
      
      {/* Top safe area với gradient */}
      {insets.top > 0 && (
        <View style={styles.topSafeAreaContainer}>
          <LinearGradient
            colors={[...Colors.gradients.primary, Colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ height: insets.top, width: '100%' }}
          />
        </View>
      )}

      {/* Header */}
      {!hideHeader && headerTitle && (
        <View style={styles.headerContainer}>
          <Header title={headerTitle} hideBackButton={!showBackButton} />
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSafeAreaContainer: {
    position: 'relative',
    zIndex: 1001,
    elevation: 11, // For Android - higher than header
  },
  headerContainer: {
    position: 'relative',
    zIndex: 1000,
    elevation: 10, // For Android
  },
  content: {
    flex: 1,
    paddingHorizontal: 16, // Consistent padding for all screens
    zIndex: 1,
  },
});

Screen.displayName = 'Screen';

export default React.memo(Screen);
