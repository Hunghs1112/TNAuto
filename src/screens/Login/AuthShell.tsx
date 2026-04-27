import React, { ReactNode } from "react";
import { Image, Text, View } from "react-native";
import { Screen, FormContainer } from "../../components/layout";
import { loginSharedStyles } from "./loginSharedStyles";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
};

export default function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <Screen statusBarStyle="light-content" showBackButton={false} useScrollView={false}>
      <FormContainer
        keyboardAvoiding
        withScroll
        paddingCustom={{ horizontal: "xl", top: "lg", bottom: "xl" }}
        dismissKeyboardOnPress
      >
        <Text style={loginSharedStyles.welcomeText}>{title}</Text>
        <Text style={loginSharedStyles.subtitle}>{subtitle}</Text>

        <View style={loginSharedStyles.logoFrame}>
          <Image style={loginSharedStyles.logo} source={require("../../assets/logo.png")} resizeMode="contain" />
        </View>

        <View style={loginSharedStyles.formBody}>{children}</View>
        {footer}
      </FormContainer>
    </Screen>
  );
}
