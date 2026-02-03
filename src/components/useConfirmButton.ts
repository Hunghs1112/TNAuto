import React, { useCallback, useMemo, useRef } from "react"
import { Animated } from "react-native"
import { Colors } from "../constants/colors"

export type UseConfirmButtonParams = {
  onPress?: () => void
  disabled?: boolean
  loading?: boolean
  gradientColors?: string[]
}

export const useConfirmButton = ({
  onPress = () => {},
  disabled = false,
  loading = false,
  gradientColors,
}: UseConfirmButtonParams) => {
  const scaleValue = useRef(new Animated.Value(1)).current

  const colors = useMemo(
    () => gradientColors || [Colors.primary, Colors.primaryLight],
    [gradientColors],
  )

  const isDisabled = disabled || loading

  const handlePressIn = useCallback(() => {
    if (!disabled && !loading) {
      Animated.spring(scaleValue, {
        toValue: 0.95,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }).start()
    }
  }, [disabled, loading, scaleValue])

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start()
  }, [scaleValue])

  const handlePress = useCallback(() => {
    if (!disabled && !loading) {
      onPress()
    }
  }, [disabled, loading, onPress])

  return {
    colors,
    isDisabled,
    scaleValue,
    handlePress,
    handlePressIn,
    handlePressOut,
  }
}



