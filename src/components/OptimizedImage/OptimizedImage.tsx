import React, { useState, useCallback, useMemo } from 'react';
import { Image, ImageProps, View, StyleSheet, Animated } from 'react-native';
import { SkeletonLoader } from '../SkeletonLoader';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Colors } from '../../constants/colors';

interface OptimizedImageProps extends ImageProps {
  width?: number;
  height?: number;
  borderRadius?: number;
  showPlaceholder?: boolean;
  fallbackIcon?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = React.memo(({
  width = 48,
  height = 48,
  borderRadius = 24,
  showPlaceholder = true,
  fallbackIcon = 'image-outline',
  style,
  ...props
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  const containerStyle = useMemo(() => [
    { width, height, borderRadius, overflow: 'hidden', backgroundColor: Colors.neutral[100] }, 
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

  const handleError = useCallback(() => {
    setLoading(false);
    setError(true);
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
      
      {error ? (
        <View style={[StyleSheet.absoluteFill, styles.centerContent]}>
          <Ionicons name={fallbackIcon as any} size={Math.min(width, height) * 0.5} color={Colors.text.secondary} />
        </View>
      ) : (
        <Animated.View style={[{ opacity: fadeAnim }, StyleSheet.absoluteFill]}>
          <Image
            {...props}
            style={imageStyle}
            onLoadStart={handleLoadStart}
            onLoadEnd={handleLoadEnd}
            onError={handleError}
            resizeMode="cover"
            fadeDuration={0}
          />
        </Animated.View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.neutral[100],
  }
});
