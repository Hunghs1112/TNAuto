import React from "react"
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from "react-native"
import { Colors } from "../constants/colors"
import { Typography } from "../constants/typo"

type ConfirmButtonProps = {
  title?: string
  onPress?: () => void
  buttonColor?: string
  textColor?: string
  disabled?: boolean
  loading?: boolean
  height?: number
  borderRadius?: number
}

const ConfirmButton = ({
  title = "Confirm",
  onPress = () => {},
  buttonColor = Colors.button.primary,
  textColor = Colors.text.inverted,
  disabled = false,
  loading = false,
  height = 44,
  borderRadius = 15,
}: ConfirmButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          height: height,
          backgroundColor: buttonColor,
          borderRadius: borderRadius,
          opacity: disabled || loading ? 0.5 : 1,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <Text style={[styles.buttonText, { color: textColor }]}>{title}</Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.medium,
    fontFamily: Typography.fontFamily.medium,
  },
})

export default React.memo(ConfirmButton)
