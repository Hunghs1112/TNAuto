import React, { useCallback, useMemo, useState } from "react";
import { View, TextInput, StyleSheet, Platform } from "react-native";
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typo";
import { spacing } from "../../design-system/spacing";
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
  inputStyle?: any;
  iconLeft?: React.ReactNode;
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
  placeholderTextColor,
  textColor = Colors.text.primary,
  borderColor,
  multiline = false,
  numberOfLines = 1,
  keyboardType = "default",
  editable = true,
  style,
  inputStyle: inputStyleProp,
  iconLeft,
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
  focusBorderColor,
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

  // Dynamic container style based on focus
  const containerStyle = useMemo(() => [
    styles.container,
    isFocused && styles.containerFocused,
    style,
  ], [isFocused, style]);

  // Dynamic input style
  const inputStyle = useMemo(() => [
    styles.input,
    {
      color: textColor,
      paddingLeft: iconLeft ? spacing.md : spacing.base,
      paddingRight: iconRight ? 44 : spacing.base,
      textAlignVertical: multiline ? "top" : "center",
    },
    multiline && styles.inputMultiline,
    inputStyleProp,
  ], [textColor, iconLeft, iconRight, multiline, inputStyleProp]);

  return (
    <View style={containerStyle}>
      {/* Icon left area with separator */}
      {iconLeft && (
        <View style={[styles.iconLeftArea, isFocused && styles.iconLeftAreaFocused]}>
          {iconLeft}
        </View>
      )}

      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor ?? Colors.neutral[400]}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        numberOfLines={numberOfLines}
        keyboardType={keyboardType}
        editable={editable}
        style={inputStyle}
        underlineColorAndroid="transparent"
        onFocus={handleFocus}
        onBlur={handleBlur}
        autoFocus={autoFocus}
        maxLength={maxLength}
        autoCapitalize={autoCapitalize}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        blurOnSubmit={blurOnSubmit}
      />

      {/* Icon right */}
      {iconRight && (
        <View style={styles.iconRightArea} pointerEvents="box-none">
          {iconRight}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    width: "100%",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    backgroundColor: Colors.neutral[50],
    overflow: "hidden",
    height: 40,
  },
  containerFocused: {
    borderColor: Colors.primary,
    backgroundColor: '#fff',
  },
  iconLeftArea: {
    width: 38,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "stretch",
    borderRightWidth: 1,
    borderRightColor: Colors.neutral[200],
    backgroundColor: Colors.neutral[100],
  },
  iconLeftAreaFocused: {
    borderRightColor: Colors.alpha.primary12,
    backgroundColor: Colors.primarySoft,
  },
  input: {
    flex: 1,
    fontSize: 13,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: Typography.weight.medium,
    paddingHorizontal: 10,
    paddingVertical: 0,
    height: 40,
    textAlignVertical: "center",
    backgroundColor: "transparent",
    includeFontPadding: false,
  },
  inputMultiline: {
    height: 60,
    paddingVertical: 8,
    textAlignVertical: "top",
  },
  iconRightArea: {
    paddingHorizontal: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "stretch",
  },
});

TextInputComponent.displayName = 'TextInputComponent';

export default React.memo(TextInputComponent);
