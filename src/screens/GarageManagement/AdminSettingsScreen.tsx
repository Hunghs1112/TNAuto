/**
 * AdminSettingsScreen — Bước 7: Communications & Settings
 * 2 tab: Reminder Configs | UI Visibility
 */
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';

import { Screen } from '../../components/layout';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typo';
import { borderRadius } from '../../design-system/borders';
import { spacing } from '../../design-system/spacing';
import { isManagerRole } from '../../navigation/rolePolicy';
import { useAppSelector } from '../../redux/hooks/useAppSelector';
import {
  AdminServiceReminderConfig,
  AdminUiVisibilitySetting,
  useGetAdminServiceReminderConfigsQuery,
  useGetAdminUiVisibilityQuery,
  useToggleAdminServiceReminderConfigMutation,
  useUpdateAdminServiceReminderConfigMutation,
  useUpdateAdminUiVisibilityMutation,
} from '../../services/adminGarageApi';

type SettingsTab = 'reminders' | 'visibility';

const TABS: Array<{ key: SettingsTab; label: string; icon: string }> = [
  { key: 'reminders', label: 'Nhắc dịch vụ', icon: 'time-outline' },
  { key: 'visibility', label: 'Hiển thị UI', icon: 'eye-outline' },
];

export default function AdminSettingsScreen() {
  const userType = useAppSelector((s) => s.auth.userType);
  const canAccess = isManagerRole(userType);
  const [activeTab, setActiveTab] = useState<SettingsTab>('reminders');

  if (!canAccess) {
    return (
      <Screen headerTitle="Cài đặt" showBackButton statusBarStyle="light-content">
        <View style={styles.emptyState}>
          <Ionicons name="lock-closed-outline" size={40} color={Colors.text.secondary} />
          <Text style={styles.emptyTitle}>Bạn không có quyền truy cập màn này</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      headerTitle="Cài đặt hệ thống"
      showBackButton
      statusBarStyle="light-content"
      useScrollView={false}
      backgroundColor={Colors.background.secondary}
    >
      {/* Tab bar */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabItem, isActive && styles.tabItemActive]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.8}
            >
              <Ionicons name={tab.icon as any} size={16} color={isActive ? Colors.primary : Colors.text.secondary} />
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={{ flex: 1 }}>
        {activeTab === 'reminders' && <RemindersTab />}
        {activeTab === 'visibility' && <VisibilityTab />}
      </View>
    </Screen>
  );
}

// ─── Reminders Tab ────────────────────────────────────────────────────────────
function RemindersTab() {
  const [refreshing, setRefreshing] = useState(false);
  const [editItem, setEditItem] = useState<AdminServiceReminderConfig | null>(null);

  const query = useGetAdminServiceReminderConfigsQuery();
  const [toggleConfig] = useToggleAdminServiceReminderConfigMutation();
  const [updateConfig] = useUpdateAdminServiceReminderConfigMutation();

  const items = useMemo(() => query.data || [], [query.data]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await query.refetch(); } finally { setRefreshing(false); }
  }, [query]);

  const isTruthy = (v: unknown) => v === true || v === 1 || v === '1' || v === 'true';

  const handleToggle = useCallback(async (item: AdminServiceReminderConfig, value: boolean) => {
    try {
      await toggleConfig({
        serviceId: item.service_id,
        body: { enabled: value },
      }).unwrap();
      await query.refetch();
    } catch {
      Alert.alert('Lỗi', 'Không thể cập nhật cấu hình.');
    }
  }, [query, toggleConfig]);

  const handleSaveEdit = useCallback(async (item: AdminServiceReminderConfig, days: string) => {
    try {
      const daysNum = Number(days);
      await updateConfig({
        serviceId: item.service_id,
        // Backend expects reminder_days as array
        body: { reminder_days: [daysNum], interval_days: daysNum },
      }).unwrap();
      await query.refetch();
      Alert.alert('Thành công', 'Đã cập nhật cấu hình nhắc nhở.');
      setEditItem(null);
    } catch {
      Alert.alert('Lỗi', 'Không thể cập nhật.');
    }
  }, [query, updateConfig]);

  const renderItem = useCallback(({ item }: { item: AdminServiceReminderConfig }) => {
    const enabled = isTruthy(item.enabled) || isTruthy(item.is_enabled);
    // reminder_days is an array from backend e.g. [30, 60], show first value
    const daysRaw = item.reminder_days ?? item.interval_days;
    const days = Array.isArray(daysRaw)
      ? (daysRaw.length > 0 ? Number(daysRaw[0]) : 0)
      : Number(daysRaw || 0);

    return (
      <View style={styles.settingCard}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingName}>{item.service_name || `Dịch vụ #${item.service_id}`}</Text>
            {days > 0 ? (
              <Text style={styles.settingMeta}>Nhắc sau {days} ngày</Text>
            ) : null}
          </View>
          <View style={styles.settingActions}>
            <TouchableOpacity
              style={styles.editIconBtn}
              onPress={() => setEditItem(item)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="create-outline" size={18} color={Colors.primary} />
            </TouchableOpacity>
            <Switch
              value={enabled}
              onValueChange={(v) => handleToggle(item, v)}
              trackColor={{ false: Colors.border.light, true: Colors.primary }}
              thumbColor={Colors.background.light}
            />
          </View>
        </View>
      </View>
    );
  }, [handleToggle]);

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.service_id)}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing || query.isFetching} onRefresh={handleRefresh} />}
        ListHeaderComponent={
          <Text style={styles.sectionDesc}>
            Bật/tắt và điều chỉnh số ngày nhắc nhở dịch vụ cho từng loại dịch vụ.
          </Text>
        }
        ListEmptyComponent={
          query.isLoading ? (
            <View style={styles.centered}><ActivityIndicator size="large" color={Colors.primary} /></View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="time-outline" size={40} color={Colors.text.secondary} />
              <Text style={styles.emptyTitle}>Chưa có cấu hình nào</Text>
            </View>
          )
        }
      />

      {editItem && (
        <EditReminderModal
          item={editItem}
          onClose={() => setEditItem(null)}
          onSave={(days) => handleSaveEdit(editItem, days)}
        />
      )}
    </View>
  );
}

// ─── Visibility Tab ───────────────────────────────────────────────────────────
function VisibilityTab() {
  const [refreshing, setRefreshing] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  const query = useGetAdminUiVisibilityQuery();
  const [updateVisibility] = useUpdateAdminUiVisibilityMutation();

  // Backend trả 1 object đơn {id, is_hidden} hoặc array — normalize thành array
  const items = useMemo(() => {
    const raw = query.data || [];
    if (Array.isArray(raw) && raw.length > 0) {
      // Nếu item không có key/label, gán mặc định
      return raw.map((item, idx) => ({
        ...item,
        key: item.key ?? String(item.id ?? idx),
        label: item.label ?? 'Ẩn giao diện',
        section: item.section ?? 'Cài đặt chung',
      }));
    }
    return [];
  }, [query.data]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await query.refetch(); } finally { setRefreshing(false); }
  }, [query]);

  const isTruthy = (v: unknown) => v === true || v === 1 || v === '1' || v === 'true';

  const getIsHidden = useCallback((item: AdminUiVisibilitySetting) => {
    const key = String(item.key || item.id);
    if (key in pendingChanges) return pendingChanges[key];
    return isTruthy(item.is_hidden);
  }, [pendingChanges]);

  const handleToggle = useCallback((item: AdminUiVisibilitySetting, value: boolean) => {
    const key = String(item.key || item.id);
    setPendingChanges((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSaveAll = useCallback(async () => {
    if (Object.keys(pendingChanges).length === 0) return;
    setSaving(true);
    try {
      // Build payload: merge current items with pending changes
      const payload: Record<string, boolean> = {};
      items.forEach((item) => {
        const key = String(item.key || item.id);
        payload[key] = key in pendingChanges ? pendingChanges[key] : isTruthy(item.is_hidden);
      });
      await updateVisibility(payload).unwrap();
      await query.refetch();
      setPendingChanges({});
      Alert.alert('Thành công', 'Đã lưu cài đặt hiển thị.');
    } catch {
      Alert.alert('Lỗi', 'Không thể lưu cài đặt.');
    } finally {
      setSaving(false);
    }
  }, [items, pendingChanges, query, updateVisibility]);

  // Group by section
  const grouped = useMemo(() => {
    const map: Record<string, AdminUiVisibilitySetting[]> = {};
    items.forEach((item) => {
      const section = String(item.section || 'Khác');
      if (!map[section]) map[section] = [];
      map[section].push(item);
    });
    return Object.entries(map);
  }, [items]);

  const hasPending = Object.keys(pendingChanges).length > 0;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing || query.isLoading} onRefresh={handleRefresh} />}
      >
        <Text style={styles.sectionDesc}>
          Ẩn/hiện các mục trong giao diện người dùng. Nhấn "Lưu thay đổi" để áp dụng.
        </Text>

        {grouped.map(([section, sectionItems]) => (
          <View key={section} style={styles.visibilityGroup}>
            <Text style={styles.groupTitle}>{section}</Text>
            <View style={styles.settingCardGroup}>
              {sectionItems.map((item, idx) => {
                const isHidden = getIsHidden(item);
                const isLast = idx === sectionItems.length - 1;
                return (
                  <View key={String(item.key || item.id)}>
                    <View style={styles.settingRow}>
                      <View style={styles.settingInfo}>
                        <Text style={styles.settingName}>{item.label || String(item.key || item.id)}</Text>
                        <Text style={styles.settingMeta}>{isHidden ? 'Đang ẩn' : 'Đang hiện'}</Text>
                      </View>
                      <Switch
                        value={isHidden}
                        onValueChange={(v) => handleToggle(item, v)}
                        trackColor={{ false: Colors.border.light, true: Colors.status.warning }}
                        thumbColor={Colors.background.light}
                      />
                    </View>
                    {!isLast && <View style={styles.itemDivider} />}
                  </View>
                );
              })}
            </View>
          </View>
        ))}

        {items.length === 0 && !query.isLoading && (
          <View style={styles.emptyState}>
            <Ionicons name="eye-outline" size={40} color={Colors.text.secondary} />
            <Text style={styles.emptyTitle}>Chưa có cài đặt nào</Text>
          </View>
        )}
      </ScrollView>

      {/* Save bar */}
      {hasPending && (
        <View style={styles.saveBar}>
          <Text style={styles.saveBarText}>{Object.keys(pendingChanges).length} thay đổi chưa lưu</Text>
          <TouchableOpacity
            style={[styles.saveBarBtn, saving && { opacity: 0.6 }]}
            onPress={handleSaveAll}
            disabled={saving}
          >
            {saving
              ? <ActivityIndicator size="small" color={Colors.background.light} />
              : <Text style={styles.saveBarBtnText}>Lưu thay đổi</Text>}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ─── Edit Reminder Modal ──────────────────────────────────────────────────────
function EditReminderModal({
  item,
  onClose,
  onSave,
}: {
  item: AdminServiceReminderConfig;
  onClose: () => void;
  onSave: (days: string) => Promise<void>;
}) {
  const currentDays = (() => {
    const raw = item.reminder_days ?? item.interval_days;
    if (Array.isArray(raw)) return raw.length > 0 ? String(raw[0]) : '';
    return String(raw || '');
  })();
  const [days, setDays] = useState(currentDays);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!days.trim() || isNaN(Number(days))) {
      Alert.alert('Lỗi', 'Vui lòng nhập số ngày hợp lệ.');
      return;
    }
    setSaving(true);
    try { await onSave(days.trim()); }
    finally { setSaving(false); }
  };

  return (
    <View style={modalStyles.overlay}>
      <View style={modalStyles.sheet}>
        <View style={modalStyles.header}>
          <Text style={modalStyles.title}>Sửa cấu hình nhắc nhở</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={22} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>
        <Text style={modalStyles.serviceName}>{item.service_name || `Dịch vụ #${item.service_id}`}</Text>
        <View style={modalStyles.field}>
          <Text style={modalStyles.label}>Số ngày nhắc nhở</Text>
          <TextInput
            style={modalStyles.input}
            value={days}
            onChangeText={setDays}
            placeholder="VD: 30"
            placeholderTextColor={Colors.text.secondary}
            keyboardType="numeric"
          />
        </View>
        <View style={modalStyles.actions}>
          <TouchableOpacity style={modalStyles.cancelBtn} onPress={onClose}>
            <Text style={modalStyles.cancelText}>Hủy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[modalStyles.saveBtn, saving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving
              ? <ActivityIndicator size="small" color={Colors.background.light} />
              : <Text style={modalStyles.saveText}>Lưu</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.background.light,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  tabItem: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.xs, paddingVertical: spacing.sm,
    borderRadius: borderRadius.full, borderWidth: 1, borderColor: Colors.border.light,
    backgroundColor: Colors.background.secondary,
  },
  tabItemActive: { borderColor: Colors.primary, backgroundColor: Colors.primarySoft },
  tabLabel: { fontFamily: Typography.fontFamily.medium, fontSize: Typography.size.xs, color: Colors.text.secondary },
  tabLabelActive: { color: Colors.primary, fontFamily: Typography.fontFamily.bold },
  listContent: { padding: spacing.base, gap: spacing.base, paddingBottom: spacing['4xl'] },
  sectionDesc: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  settingCard: {
    backgroundColor: Colors.background.light,
    borderRadius: borderRadius['2xl'],
    paddingHorizontal: spacing.base,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  settingCardGroup: {
    backgroundColor: Colors.background.light,
    borderRadius: borderRadius['2xl'],
    paddingHorizontal: spacing.base,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.base,
  },
  settingInfo: { flex: 1, gap: 2 },
  settingName: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.base,
    color: Colors.text.primary,
  },
  settingMeta: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.text.secondary,
  },
  settingActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  editIconBtn: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.background.secondary,
  },
  visibilityGroup: { gap: spacing.sm },
  groupTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.sm,
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemDivider: { height: 1, backgroundColor: Colors.border.light },
  saveBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.base,
    backgroundColor: Colors.background.light,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    gap: spacing.base,
  },
  saveBarText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.text.secondary,
    flex: 1,
  },
  saveBarBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBarBtnText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.sm,
    color: Colors.background.light,
    fontWeight: Typography.weight.bold,
  },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: spacing.xl },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing['4xl'], gap: spacing.sm },
  emptyTitle: { fontFamily: Typography.fontFamily.bold, fontSize: Typography.size.lg, color: Colors.text.primary, textAlign: 'center' },
});

const modalStyles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end', zIndex: 100 },
  sheet: { backgroundColor: Colors.background.light, borderTopLeftRadius: borderRadius['3xl'], borderTopRightRadius: borderRadius['3xl'], padding: spacing.lg, gap: spacing.base, paddingBottom: spacing['3xl'] },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontFamily: Typography.fontFamily.bold, fontSize: Typography.size.lg, color: Colors.text.primary, fontWeight: Typography.weight.bold },
  serviceName: { fontFamily: Typography.fontFamily.medium, fontSize: Typography.size.base, color: Colors.text.secondary },
  field: { gap: spacing.xs },
  label: { fontFamily: Typography.fontFamily.medium, fontSize: Typography.size.sm, color: Colors.text.secondary },
  input: { backgroundColor: Colors.background.secondary, borderRadius: borderRadius.xl, paddingHorizontal: spacing.base, paddingVertical: spacing.md, fontFamily: Typography.fontFamily.regular, fontSize: Typography.size.base, color: Colors.text.primary, borderWidth: 1, borderColor: Colors.border.light },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  cancelBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: borderRadius.xl, borderWidth: 1, borderColor: Colors.border.light, alignItems: 'center' },
  cancelText: { fontFamily: Typography.fontFamily.medium, fontSize: Typography.size.base, color: Colors.text.secondary },
  saveBtn: { flex: 2, paddingVertical: spacing.md, borderRadius: borderRadius.xl, backgroundColor: Colors.primary, alignItems: 'center' },
  saveText: { fontFamily: Typography.fontFamily.bold, fontSize: Typography.size.base, color: Colors.background.light, fontWeight: Typography.weight.bold },
});
