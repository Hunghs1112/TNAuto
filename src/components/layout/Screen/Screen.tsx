/**
 * Screen Component - Đơn giản và dễ sử dụng
 * Wrapper cơ bản cho các màn hình với header và safe area
 */

import React, { ReactNode } from 'react';
import { View, StyleSheet, StatusBar, ScrollView, RefreshControl } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../../../constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../../Header';

export interface ScreenProps {
  children: ReactNode;
  headerTitle?: string;
  showBackButton?: boolean;
  hideHeader?: boolean;
  backgroundColor?: string;
  safeAreaTopColor?: string;
  statusBarStyle?: 'light-content' | 'dark-content';
  /**
   * Disable built-in ScrollView to avoid nesting issues when the screen's
   * content already contains a VirtualizedList (FlatList, SectionList, ...)
   */
  useScrollView?: boolean; // default true
  /**
   * Enable global pull-to-refresh for screens using the internal ScrollView
   */
  enablePullToRefresh?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  contentStyle?: any;
  /** Callback cho nút bên phải trên header */
  onHeaderRightPress?: () => void;
}

const Screen = ({
  children,
  headerTitle,
  showBackButton = true,
  hideHeader = false,
  backgroundColor = Colors.background.light,
  statusBarStyle = 'light-content',
  useScrollView = true,
  enablePullToRefresh = false,
  refreshing = false,
  onRefresh,
  contentStyle,
  onHeaderRightPress,
}: ScreenProps) => {
  const insets = useSafeAreaInsets();

  const TAB_BAR_HEIGHT = 76;

  const scrollRefreshControl =
    enablePullToRefresh && onRefresh
      ? (
          <RefreshControl
            refreshing={!!refreshing}
            onRefresh={onRefresh}
          />
        )
      : undefined;

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
            colors={Colors.gradients.brand}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ height: insets.top, width: '100%' }}
          />
        </View>
      )}

      {/* Header */}
      {!hideHeader && headerTitle && (
        <View style={styles.headerContainer}>
          <Header
            title={headerTitle}
            hideBackButton={!showBackButton}
            onPressRight={onHeaderRightPress}
            hideRightButton={!onHeaderRightPress}
          />
        </View>
      )}

      {/* Content */}
      {useScrollView ? (
        <ScrollView
          style={styles.content}
          contentContainerStyle={[
            styles.contentContainer,
            { paddingBottom: TAB_BAR_HEIGHT + insets.bottom },
            contentStyle,
          ]}
          showsVerticalScrollIndicator={false}
          alwaysBounceVertical={true}
          refreshControl={scrollRefreshControl}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, { paddingBottom: TAB_BAR_HEIGHT + insets.bottom }, contentStyle]}>
          {children}
        </View>
      )}
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
    zIndex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
});

Screen.displayName = 'Screen';

export default React.memo(Screen);
