// src/screens/Profile/types.ts
import { AuthUserType } from '../../redux/slices/authSlice';

// ─── Core data types ──────────────────────────────────────────────────────────

export type SettingItem = {
  id: string;
  title: string;
  subtitle?: string;
  icon: string; // Ionicons name
  onPress: () => void;
  badge?: string;
};

export type SettingsSection = {
  id: string;
  label: string;
  items: SettingItem[];
};

export type RoleMenuConfig = SettingsSection[];

// ─── Component props ──────────────────────────────────────────────────────────

export interface HeroSectionProps {
  userName: string;
  userPhone: string;
  userType: AuthUserType;
  avatarUrl: string;
  roleLabel: string;
  onAvatarPress: () => void;
}

export interface SettingsSectionProps {
  section: SettingsSection;
}

export interface SettingRowProps {
  item: SettingItem;
  isFirst: boolean;
  isLast: boolean;
}

export interface AboutSectionProps {
  appVersion: string;
}

export interface DangerZoneProps {
  onLogout: () => void;
  onDeleteAccount: () => void;
  isDeleting: boolean;
  userType: AuthUserType;
}

export interface ProfileViewProps {
  userName: string;
  userPhone: string;
  userType: AuthUserType;
  avatarUrl: string;
  roleLabel: string;
  sections: RoleMenuConfig;
  handleLogout: () => void;
  handleDeleteAccount: () => void;
  isDeleting: boolean;
  navigateToAccountInfo: () => void;
  appVersion: string;
}

// ─── Hook return type ─────────────────────────────────────────────────────────

export interface ProfileScreenData {
  // User info
  userName: string;
  userPhone: string;
  userType: AuthUserType;
  avatarUrl: string;
  roleLabel: string;
  // Menu
  sections: RoleMenuConfig;
  // Actions
  handleLogout: () => void;
  handleDeleteAccount: () => void;
  isDeleting: boolean;
  // Navigation
  navigateToAccountInfo: () => void;
  // Auth guard
  isLoggedIn: boolean;
  // App info
  appVersion: string;
}
