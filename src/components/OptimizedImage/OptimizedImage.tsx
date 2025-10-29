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

  const containerStyle = useMemo(() => [{ width, height, borderRadius }, style], [width, height, borderRadius, style]);
  const imageStyle = useMemo(() => [{ width, height, borderRadius }, style], [width, height, borderRadius, style]);

  const handleLoadStart = useCallback(() => {
    setLoading(true);
    setError(false);
  }, []);

  const handleLoadEnd = useCallback(() => {
    setLoading(false);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleError = useCallback(() => {
    setLoading(false);
    setError(true);
  }, []);

  return (
    <View style={containerStyle}>
      {loading && showPlaceholder && (
        <View style={StyleSheet.absoluteFill}>
          <SkeletonLoader width={width} height={height} borderRadius={borderRadius} />
        </View>
      )}
      <Animated.View style={{ opacity: fadeAnim }}>
        <Image
          {...props}
          style={imageStyle}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
          resizeMode="cover"
          resizeMethod="resize"
        />
      </Animated.View>
    </View>
  );
});

