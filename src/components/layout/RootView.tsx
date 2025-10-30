import React from "react";
import { View, ViewProps, StyleProp, ViewStyle, Platform, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../constants/colors";

type RootViewBaseProps = ViewProps & {
  topColor?: string;
  bottomColor?: string;
  withScroll?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  disableTopInset?: boolean;
  disableBottomInset?: boolean;
};
type RootViewProps = React.PropsWithChildren<RootViewBaseProps>;

export default function RootView(props: RootViewProps) {
  const {
    topColor = Colors.primary,
    bottomColor = Colors.background.light,
    style,
    disableTopInset,
    disableBottomInset,
    children,
    ...rest
  } = props;

  const insets = useSafeAreaInsets();

  // Fallback for environments without proper safe area (Android older versions)
  const topInset = disableTopInset ? 0 : Math.max(insets.top, Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0);
  const bottomInset = disableBottomInset ? 0 : insets.bottom;

  return (
    <View style={[{ flex: 1, backgroundColor: bottomColor }, style]} {...rest}>
      {topInset > 0 ? (
        <View style={{ height: topInset, backgroundColor: topColor }} />
      ) : null}
      <View style={{ flex: 1 }}>{children}</View>
      {bottomInset > 0 ? (
        <View style={{ height: bottomInset, backgroundColor: bottomColor }} />
      ) : null}
    </View>
  );
}


