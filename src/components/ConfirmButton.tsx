import React from "react"
import { Colors } from "../constants/colors"
import ConfirmButtonView from "./ConfirmButtonView"
import { useConfirmButton } from "./useConfirmButton"

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
  style?: any
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
  style,
}: ConfirmButtonProps) => {
  const { colors, isDisabled, scaleValue, handlePress, handlePressIn, handlePressOut } =
    useConfirmButton({ onPress, disabled, loading, gradientColors })

  return (
    <ConfirmButtonView
      title={title}
      textColor={textColor}
      height={height}
      borderRadius={borderRadius}
      loading={loading}
      colors={colors}
      scaleValue={scaleValue}
      disabled={isDisabled}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    />
  )
}

export default React.memo(ConfirmButton)
