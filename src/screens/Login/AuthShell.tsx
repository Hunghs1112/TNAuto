import React, { ReactNode } from "react";
import { Image, Text, View, StyleSheet } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { Screen, FormContainer } from "../../components/layout";
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typo";
import { spacing } from "../../design-system/spacing";

type AuthShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export default function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <Screen statusBarStyle="light-content" showBackButton={false} useScrollView={false} hideHeader>
      {/* Gradient header band */}
      <LinearGradient
        colors={[...Colors.gradients.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerBand}
      >
        {/* Logo nhỏ gọn trong band */}
        <View style={styles.logoWrap}>
          <Image
            style={styles.logo}
            source={require("../../assets/logo.png")}
            resizeMode="contain"
          />
        </View>
      </LinearGradient>

      {/* Card trắng nổi lên trên gradient */}
      <View style={styles.card}>
        <FormContainer
          keyboardAvoiding
          withScroll
          paddingCustom={{ horizontal: "xl", top: "lg", bottom: "xl" }}
          dismissKeyboardOnPress
        >
          {/* Title */}
          <Text style={styles.title}>{title}</Text>
          {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

          {/* Form fields */}
          <View style={styles.formBody}>{children}</View>

          {/* Footer (link đăng ký / đăng nhập) */}
          {footer}
        </FormContainer>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerBand: {
    height: 220,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 20,
  },
  logoWrap: {
    width: 160,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  // Card trắng bo góc trên, nổi lên trên gradient
  card: {
    flex: 1,
    backgroundColor: Colors.background.light,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,
    // Shadow nhẹ
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
    overflow: "hidden",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.text.secondary,
    marginBottom: spacing.lg,
  },
  formBody: {
    width: "100%",
    marginTop: spacing.md,
  },
});
