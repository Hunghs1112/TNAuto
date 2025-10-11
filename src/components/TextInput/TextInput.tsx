import React from "react";
import { View, TextInput, StyleSheet, Platform } from "react-native";
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typo";

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
}) => {
  return (
    <View style={[styles.container, style]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        numberOfLines={numberOfLines}
        keyboardType={keyboardType}
        editable={editable}
        style={[
          styles.input,
          {
            color: textColor,
            borderColor: borderColor,
            paddingRight: iconRight ? 40 : 12,
            textAlignVertical: multiline ? "top" : "center",
          },
        ]}
        underlineColorAndroid="transparent"
      />
      {iconRight && (
        <View style={styles.iconRightContainer}>
          {iconRight}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
    width: "100%",
    position: "relative",
  },
  input: {
    flex: 1,
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.medium,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: Colors.background.light,
    paddingHorizontal: 12,
    paddingVertical: Platform.select({
      ios: 14,
      android: 12,
    }),
    minHeight: 46,
  },
  iconRightContainer: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: [{ translateY: -10 }],
    zIndex: 1,
  },
});

export default TextInputComponent;