// src/screens/Profile/components/AboutSection.tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet, Linking } from 'react-native';

import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typo';
import { spacing } from '../../../design-system/spacing';
import { textStyles } from '../../../design-system/typography';
import { AboutSectionProps } from '../types';

const TERMS_URL = 'https://tnauto.vn/dieu-khoan-su-dung';
const PRIVACY_URL = 'https://tnauto.vn/chinh-sach-bao-mat';

const AboutSection = ({ appVersion }: AboutSectionProps) => {
  const openTerms = () => Linking.openURL(TERMS_URL).catch(() => {});
  const openPrivacy = () => Linking.openURL(PRIVACY_URL).catch(() => {});

  return (
    <View style={styles.container}>
      {/* App name + version */}
      <Text style={styles.versionText}>TNAuto  v{appVersion}</Text>

      {/* Legal links */}
      <View style={styles.linksRow}>
        <Pressable
          onPress={openTerms}
          accessibilityRole="link"
          accessibilityLabel="Điều khoản sử dụng"
        >
          <Text style={styles.linkText}>Điều khoản sử dụng</Text>
        </Pressable>

        <Text style={styles.separator}>·</Text>

        <Pressable
          onPress={openPrivacy}
          accessibilityRole="link"
          accessibilityLabel="Chính sách bảo mật"
        >
          <Text style={styles.linkText}>Chính sách bảo mật</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    alignItems: 'center',
    gap: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.alpha.primary08,
  },
  versionText: {
    ...textStyles.caption,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
  linksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  linkText: {
    ...textStyles.caption,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.text.tertiary,
    textDecorationLine: 'underline',
  },
  separator: {
    ...textStyles.caption,
    color: Colors.text.tertiary,
  },
});

export default React.memo(AboutSection);
