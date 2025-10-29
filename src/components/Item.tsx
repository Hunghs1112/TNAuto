import React, { useCallback, useRef } from "react";
import { View, Text, Pressable, StyleSheet, Animated } from "react-native";
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from "../constants/colors";
import { Typography } from "../constants/typo";
import { OptimizedImage } from "./OptimizedImage";
import { HapticFeedback } from "../utils/haptics";

type ItemProps = {
  title: string;
  description: string;
  imageUri?: string;
  onPress?: () => void;
  isPressable?: boolean;
};

const Item = ({ title, description, imageUri, onPress, isPressable = true }: ItemProps) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    if (isPressable) {
      HapticFeedback.light();
      Animated.spring(scaleValue, {
        toValue: 0.97,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }).start();
    }
  }, [isPressable, scaleValue]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleValue]);

  const content = (
    <Animated.View style={[styles.card, { transform: [{ scale: scaleValue }] }]}>
      <LinearGradient
        colors={[Colors.primary, Colors.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.accentBar}
      />
      <View style={styles.cardShadowBox}>
        <View style={styles.contentRow}>
          {imageUri ? (
            <OptimizedImage 
              source={{ uri: imageUri }} 
              width={52}
              height={52}
              borderRadius={26}
              style={styles.image}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <LinearGradient
                colors={[Colors.primarySoft, Colors.background.light]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.placeholderGradient}
              />
            </View>
          )}
          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
            <Text style={styles.description} numberOfLines={2}>{description}</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );

  return isPressable ? (
    <Pressable 
      onPress={onPress} 
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessible={true} 
      accessibilityRole="button"
    >
      {content}
    </Pressable>
  ) : (
    content
  );
};

const styles = StyleSheet.create({
  card: {
    width: "100%",
    height: 120,
    borderRadius: 16,
    backgroundColor: Colors.background.light,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: Colors.neutral[200],
    flexDirection: "row",
  },
  accentBar: {
    width: 5,
    height: "100%",
  },
  cardShadowBox: {
    flex: 1,
    padding: 18,
    justifyContent: "center",
    shadowColor: Colors.shadow.red,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  image: {
    marginRight: 16,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  imagePlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 16,
    overflow: 'hidden',
  },
  placeholderGradient: {
    width: "100%",
    height: "100%",
    borderWidth: 2,
    borderColor: 'rgba(218, 28, 18, 0.2)',
    borderRadius: 26,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
    gap: 6,
  },
  title: {
    fontSize: Typography.size.lg,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.text.primary,
    lineHeight: 22,
  },
  description: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
});

export default React.memo(Item);