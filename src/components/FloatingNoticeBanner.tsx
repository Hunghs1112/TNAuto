import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@react-native-vector-icons/ionicons";

import { Colors } from "../constants/colors";
import { Typography } from "../constants/typo";

export type FloatingNoticeBannerProps = {
  title: string;
  subtitle?: string;
  onDismiss?: () => void;
  onPress?: () => void;
};

export default function FloatingNoticeBanner({
  title,
  subtitle,
  onDismiss,
  onPress,
}: FloatingNoticeBannerProps) {
  return (
    <View style={styles.card}>
      <Pressable onPress={onDismiss} hitSlop={10} style={styles.closeButtonTopLeft} accessibilityRole="button">
        <Ionicons name="close" size={16} color={Colors.text.secondary} />
      </Pressable>

      <View style={styles.inlineContent}>
        <Text style={styles.title} numberOfLines={2}>
          Cập nhật thông tin còn thiếu để nhận nhắc nhở đúng thời hạn nhé
        </Text>
        {!!subtitle && (
          <Text style={styles.subtitle} numberOfLines={3} ellipsizeMode="tail">
            Cập nhật thông tin {subtitle} để nhận được nhắc nhở đúng thời hạn nhé.
          </Text>
        )}
      </View>

      <Pressable onPress={onPress} hitSlop={8} style={styles.ctaButtonBottom} accessibilityRole="button">
        <Text style={styles.ctaText}>Xem thêm</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: "relative",
    borderRadius: 22,
    backgroundColor: Colors.surface.elevated,
    shadowColor: Colors.shadow.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 8,
    paddingTop: 14,
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  inlineContent: {
    width: "100%",
    gap: 4,
  },
  title: {
    fontSize: 15,
    lineHeight: 19,
    marginTop: 4,
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 16,
    color: Colors.text.secondary,
    fontFamily: Typography.fontFamily.regular,
  },
  ctaButtonBottom: {
    minHeight: 30,
    alignSelf: "flex-start",
    marginTop: 0,
    paddingVertical: 5,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.alpha.primary08,
    flexDirection: "row",
    gap: 4,
  },
  ctaText: {
    fontSize: 12,
    lineHeight: 15,
    color: Colors.primary,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: "700",
  },
  closeButtonTopLeft: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    zIndex: 2,
  },
});
