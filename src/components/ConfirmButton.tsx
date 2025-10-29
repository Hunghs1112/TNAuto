import React, { useCallback } from "react"
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, Animated } from "react-native"
import LinearGradient from 'react-native-linear-gradient'
import { Colors } from "../constants/colors"
import { Typography } from "../constants/typo"
import { HapticFeedback } from "../utils/haptics"

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient)

type ConfirmButtonProps = {
  title?: string
  onPress?: () => void
  buttonColor?: string
  gradientColors?: string[]
  textColor?: string
  disabled?: boolean
  loading?: boolean
  height?: number
  borderRadius?: number
}

const ConfirmButton = ({
  title = "Confirm",
  onPress = () => {},
  buttonColor,
  gradientColors,
  textColor = Colors.text.inverted,
  disabled = false,
  loading = false,
  height = 44,
  borderRadius = 15,
}: ConfirmButtonProps) => {
  const scaleValue = React.useRef(new Animated.Value(1)).current;
  
  // Use gradient colors by default, fallback to buttonColor if provided
  const colors = gradientColors || [Colors.primary, Colors.primaryLight];

  const handlePressIn = useCallback(() => {
    if (!disabled && !loading) {
      HapticFeedback.light();
      Animated.spring(scaleValue, {
        toValue: 0.95,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }).start();
    }
  }, [disabled, loading, scaleValue]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleValue]);

  const handlePress = useCallback(() => {
    if (!disabled && !loading) {
      onPress();
    }
  }, [disabled, loading, onPress]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      <AnimatedLinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.button,
          {
            height: height,
            borderRadius: borderRadius,
            opacity: disabled || loading ? 0.5 : 1,
            transform: [{ scale: scaleValue }],
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={textColor} />
        ) : (
          <Text style={[styles.buttonText, { color: textColor }]}>{title}</Text>
        )}
      </AnimatedLinearGradient>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    fontFamily: Typography.fontFamily.semibold,
    letterSpacing: 0.3,
  },
})

export default React.memo(ConfirmButton)
