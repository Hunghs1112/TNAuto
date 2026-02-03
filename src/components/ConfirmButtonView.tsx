import React from "react"
import {
  View,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  Animated,
} from "react-native"
import LinearGradient from "react-native-linear-gradient"
import { Colors } from "../constants/colors"
import { Typography } from "../constants/typo"

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient)

export type ConfirmButtonViewProps = {
  title: string
  textColor: string
  height: number
  borderRadius: number
  loading: boolean
  colors: string[]
  scaleValue: Animated.Value
  disabled: boolean
  onPress: () => void
  onPressIn: () => void
  onPressOut: () => void
}

const ConfirmButtonView = ({
  title,
  textColor,
  height,
  borderRadius,
  loading,
  colors,
  scaleValue,
  disabled,
  onPress,
  onPressIn,
  onPressOut,
}: ConfirmButtonViewProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <View style={styles.buttonShadow}>
        <AnimatedLinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.button,
            {
              height,
              borderRadius,
              opacity: disabled ? 0.5 : 1,
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
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  buttonShadow: {
    width: "100%",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  button: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  buttonText: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    fontFamily: Typography.fontFamily.semibold,
    letterSpacing: 0.3,
  },
})

export default React.memo(ConfirmButtonView)



