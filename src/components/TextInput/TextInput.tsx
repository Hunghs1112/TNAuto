import { View, TextInput, StyleSheet, Platform } from "react-native";
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typo";

type TextInputComponentProps = {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  placeholderTextColor?: string;
  textColor?: string;
  borderColor?: string;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: string;
  style?: any;
  iconRight?: React.ReactNode;
};

const TextInputComponent = ({
  value = "",
  onChangeText = () => {},
  placeholder = "Số điện thoại hoặc biển số xe",
  secureTextEntry = false,
  placeholderTextColor = Colors.text.placeholder,
  textColor = Colors.text.primary,
  borderColor = Colors.border,
  multiline = false,
  numberOfLines = 1,
  keyboardType,
  style,
  iconRight,
}: TextInputComponentProps) => {
  const inputHeight = multiline 
    ? Math.max((numberOfLines || 1) * 24 + 20, 100)
    : 46;

  return (
    <View style={[
      styles.container, 
      { height: inputHeight },
      style
    ]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        numberOfLines={numberOfLines}
        textAlignVertical={multiline ? "top" : "center"}
        style={[
          styles.input,
          {
            color: textColor,
            borderColor: borderColor,
            textAlignVertical: multiline ? "top" : "center",
            paddingRight: iconRight ? 40 : 12,
            paddingTop: multiline ? 12 : Platform.select({
              ios: 14,
              android: 12,
            }),
            paddingBottom: multiline ? 8 : Platform.select({
              ios: 14,
              android: 12,
            }),
            paddingLeft: 12,
            // Bỏ gạch chân (underline)
            textDecorationLine: 'none',
            textDecorationStyle: 'solid',
            textDecorationColor: 'transparent',
          },
        ]}
        underlineColorAndroid="transparent" // Android: Bỏ gạch chân
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
    width: "100%",
    position: "relative",
  },
  input: {
    flex: 1,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
    fontFamily: Typography.fontFamily.medium,
    borderRadius: 16,
    borderWidth: 1,
    
    // Đảm bảo không có gạch chân
    textDecorationLine: 'none',
    backgroundColor: Colors.background.light,
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