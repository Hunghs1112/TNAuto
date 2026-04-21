/**
 * RootView - Component đơn giản cho safe area
 * Chỉ sử dụng khi cần wrapper cơ bản không có Screen component
 */

import React from "react";
import { View, ViewProps, StatusBar } from "react-native";
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from "../../constants/colors";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type RootViewProps = ViewProps & {
  topColor?: string;
  bottomColor?: string;
};

export default function RootView({ 
  topColor = Colors.primary,
  bottomColor = Colors.background.light,
  style,
  children,
  ...rest 
}: RootViewProps) {
  const insets = useSafeAreaInsets();
  const isGradientHeader = topColor === Colors.primary;

  return (
    <View style={[{ flex: 1, backgroundColor: bottomColor }, style]} {...rest}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={isGradientHeader ? Colors.primary : topColor}
        translucent={false}
      />
      
      {/* Top safe area */}
      {insets.top > 0 && (
        <View style={{ position: 'relative', zIndex: 1001, elevation: 11 }}>
          {isGradientHeader ? (
            <LinearGradient
              colors={Colors.gradients.brand}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ height: insets.top, width: '100%' }}
            />
          ) : (
            <View style={{ height: insets.top, backgroundColor: topColor }} />
          )}
        </View>
      )}
      
      {/* Content */}
      <View style={{ flex: 1 }}>{children}</View>
      
      {/* Bottom safe area */}
      {insets.bottom > 0 && (
        <View style={{ height: insets.bottom, backgroundColor: bottomColor }} />
      )}
    </View>
  );
}
