// src/components/OptimizedImage/OptimizedImage.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { Image, ImageProps, View, StyleSheet, Animated } from 'react-native';
import { SkeletonLoader } from '../SkeletonLoader';

interface OptimizedImageProps extends ImageProps {
  width?: number;
  height?: number;
  borderRadius?: number;
  showPlaceholder?: boolean;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = React.memo(({
  width = 48,
  height = 48,
  borderRadius = 24,
  showPlaceholder = true,
  style,
  ...props
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  const containerStyle = useMemo(() => [
    { width, height, borderRadius, overflow: 'hidden' }, 
    style
  ], [width, height, borderRadius, style]);
  
  const imageStyle = useMemo(() => [
    { width, height, borderRadius }, 
    style
  ], [width, height, borderRadius, style]);

  const handleLoadStart = useCallback(() => {
    setLoading(true);
    setError(false);
  }, []);

  const handleLoadEnd = useCallback(() => {
    setLoading(false);
    setError(false);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleError = useCallback((error: any) => {
    console.log('OptimizedImage - Image load error:', error);
    setLoading(false);
    setError(true);
    // Still show the image even if there's an error, let React Native handle it
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <View style={containerStyle}>
      {loading && showPlaceholder && (
        <View style={StyleSheet.absoluteFill}>
          <SkeletonLoader width={width} height={height} borderRadius={borderRadius} />
        </View>
      )}
      <Animated.View style={[{ opacity: fadeAnim }, StyleSheet.absoluteFill]}>
        <Image
          {...props}
          style={imageStyle}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
          resizeMode="cover"
        />
      </Animated.View>
    </View>
  );
});

