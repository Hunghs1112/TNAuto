import React, { useCallback, useMemo, useState } from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typo";
import { spacing } from "../../design-system/spacing";
import { borderPresets } from "../../design-system/borders";
import { selectPlatform } from "../../utils/platform";
import { textStyles } from "../../design-system/typography";

interface TextInputComponentProps {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  placeholderTextColor?: string;
  textColor?: string;
  borderColor?: string;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad" | "number-pad";
  editable?: boolean;
  style?: any;
  iconRight?: React.ReactNode;
  onFocus?: () => void;
  onBlur?: () => void;
  inputRef?: React.RefObject<any>;
  maxLength?: number;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  returnKeyType?: "done" | "next" | "go" | "send" | "search" | "default";
  onSubmitEditing?: () => void;
  blurOnSubmit?: boolean;
  autoFocus?: boolean;
  focusBorderColor?: string;
}

const TextInputComponent: React.FC<TextInputComponentProps> = ({
  value = "",
  onChangeText = () => {},
  placeholder = "Nhập thông tin",
  secureTextEntry = false,
  placeholderTextColor = Colors.text.placeholder,
  textColor = Colors.text.primary,
  borderColor = Colors.neutral[300],
  multiline = false,
  numberOfLines = 1,
  keyboardType = "default",
  editable = true,
  style,
  iconRight,
  onFocus,
  onBlur,
  inputRef,
  maxLength,
  autoCapitalize,
  returnKeyType = "default",
  onSubmitEditing,
  blurOnSubmit,
  autoFocus = false,
  focusBorderColor = Colors.accent.yellow,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleChangeText = useCallback((text: string) => {
    onChangeText(text);
  }, [onChangeText]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    onFocus?.();
  }, [onFocus]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    onBlur?.();
  }, [onBlur]);

  const inputStyle = useMemo(() => [
    styles.input,
    {
      color: textColor,
      borderColor: isFocused && focusBorderColor ? focusBorderColor : borderColor,
      paddingRight: iconRight ? 40 : spacing.md,
      textAlignVertical: multiline ? "top" : "center",
      transform: multiline ? undefined : [{ translateY: -2 }],
    },
  ], [textColor, borderColor, focusBorderColor, iconRight, isFocused, multiline]);
  return (
    <View style={[styles.container, style]}>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        numberOfLines={numberOfLines}
        keyboardType={keyboardType}
        editable={editable}
        style={inputStyle}
        underlineColorAndroid={Colors.transparent}
        onFocus={handleFocus}
        onBlur={handleBlur}
        autoFocus={autoFocus}
        maxLength={maxLength}
        autoCapitalize={autoCapitalize}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        blurOnSubmit={blurOnSubmit}
      />
      {iconRight && (
        <View style={styles.iconRightContainer} pointerEvents="none">
          {iconRight}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    width: "100%",
    position: "relative",
  },
  input: {
    flex: 1,
    ...textStyles.bodySmall,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: Typography.weight.medium,
    borderRadius: borderPresets.input,
    borderWidth: 1,
    backgroundColor: Colors.background.light,
    paddingHorizontal: spacing.md,
    paddingVertical: selectPlatform(14, 12),
    minHeight: 46,
  },
  iconRightContainer: {
    position: "absolute",
    right: spacing.md,
    top: "50%",
    transform: [{ translateY: -10 }],
    zIndex: 1,
  },
});

TextInputComponent.displayName = 'TextInputComponent';

export default React.memo(TextInputComponent);
