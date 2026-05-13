// src/screens/Profile/ProfileView.tsx
import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';

import { Screen } from '../../components/layout';
import { Colors } from '../../constants/colors';
import { spacing } from '../../design-system/spacing';
import { ProfileViewProps } from './types';

import HeroSection from './components/HeroSection';
import SettingsSection from './components/SettingsSection';
import DangerZone from './components/DangerZone';
import AboutSection from './components/AboutSection';

const ProfileView = ({
  userName,
  userPhone,
  userType,
  avatarUrl,
  roleLabel,
  sections,
  handleLogout,
  handleDeleteAccount,
  isDeleting,
  navigateToAccountInfo,
  appVersion,
}: ProfileViewProps) => {
  return (
    <Screen hideHeader statusBarStyle="light-content">
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero */}
        <HeroSection
          userName={userName}
          userPhone={userPhone}
          userType={userType}
          avatarUrl={avatarUrl}
          roleLabel={roleLabel}
          onAvatarPress={navigateToAccountInfo}
        />

        {/* Sheet */}
        <View style={styles.sheet}>
          <View style={styles.sheetContent}>
            {/* Settings sections */}
            {sections.map((section) => (
              <SettingsSection key={section.id} section={section} />
            ))}

            {/* Danger zone */}
            <DangerZone
              onLogout={handleLogout}
              onDeleteAccount={handleDeleteAccount}
              isDeleting={isDeleting}
              userType={userType}
            />

            {/* About */}
            <AboutSection appVersion={appVersion} />
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: Colors.background.muted,
  },
  scrollContent: {
    paddingBottom: spacing['2xl'],
  },
  sheet: {
    marginTop: -(spacing['2xl'] + spacing.lg),
    backgroundColor: Colors.background.muted,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: 400,
  },
  sheetContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing['2xl'],
    gap: spacing.lg,
  },
});

export default React.memo(ProfileView);
