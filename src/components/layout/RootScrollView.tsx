import React from "react";
import { ScrollView, ScrollViewProps, StyleProp, ViewStyle } from "react-native";
import RootView from "./RootView";

type RootScrollViewProps = ScrollViewProps & {
  topColor?: string;
  bottomColor?: string;
  contentContainerStyle?: StyleProp<ViewStyle>;
  disableTopInset?: boolean;
  disableBottomInset?: boolean;
};

export default function RootScrollView(props: RootScrollViewProps) {
  const { contentContainerStyle, children, ...rest } = props;

  return (
    <RootView {...rest}>
      <ScrollView
        contentContainerStyle={[{ flexGrow: 1 }, contentContainerStyle]}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        {children}
      </ScrollView>
    </RootView>
  );
}


