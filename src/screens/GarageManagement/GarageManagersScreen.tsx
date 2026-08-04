import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';

import { Screen } from '../../components/layout';
import ErrorView from '../../components/Loading/ErrorView';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typo';
import { borderRadius } from '../../design-system/borders';
import { spacing } from '../../design-system/spacing';
import { isSuperAdminRole } from '../../navigation/rolePolicy';
import { useAppSelector } from '../../redux/hooks/useAppSelector';
import {
  AdminGarageManager,
  mapAdminGarageManager,
  AdminGarage,
} from '../../services/adminMappers';
import {
  useCreateAdminGarageManagerMutation,
  useDeleteAdminGarageManagerMutation,
  useGetAdminGarageManagersQuery,
  useGetAdminResourceListQuery,
  useResetAdminGarageManagerPasswordMutation,
  useUpdateAdminGarageManagerMutation,
} from '../../services/adminGarageApi';

type MappedManager = AdminGarageManager;
type MappedGarage = AdminGarage;

export default function GarageManagersScreen() {
  const userType = useAppSelector((state) => state.auth.userType);
  const canAccess = isSuperAdminRole(userType);

  const [refreshing, setRefreshing] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editManager, setEditManager] = useState<MappedManager | null>(null);
  const [pwdManager, setPwdManager] = useState<MappedManager | null>(null);

  const managersQuery = useGetAdminGarageManagersQuery(
    { search: searchQuery || undefined },
    { skip: !canAccess },
  );
  const garagesQuery = useGetAdminResourceListQuery(
    { resource: 'garages' },
    { skip: !canAccess },
  );

  const [createManager] = useCreateAdminGarageManagerMutation();
  const [updateManager] = useUpdateAdminGarageManagerMutation();
  const [deleteManager] = useDeleteAdminGarageManagerMutation();
  const [resetPassword] = useResetAdminGarageManagerPasswordMutation();

  const managers = useMemo<MappedManager[]>(
    () => (managersQuery.data || []).map(mapAdminGarageManager),
    [managersQuery.data],
  );

  const garages = useMemo<MappedGarage[]>(
    () =>
      (garagesQuery.data || []).map((item) => ({
        id: String(item.id),
        name: String(item.name || item.garage_name || 'Gara'),
        code: String(item.code || item.garage_code || ''),
        address: String(item.address || ''),
        status: String(item.status || 'active'),
        is_super_garage: Boolean(item.is_super_garage),
        manager_count:
          item.manager_count != null ? Number(item.manager_count) : undefined,
      })),
    [garagesQuery.data],
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await managersQuery.refetch();
    } finally {
      setRefreshing(false);
    }
  }, [managersQuery]);

  const handleCreate = useCallback(
    async (data: Record<string, unknown>) => {
      await createManager(data).unwrap();
      await managersQuery.refetch();
    },
    [createManager, managersQuery],
  );

  const handleUpdate = useCallback(
    async (id: string | number, data: Record<string, unknown>) => {
      await updateManager({ id, body: data }).unwrap();
      await managersQuery.refetch();
    },
    [managersQuery, updateManager],
  );

  const handleDelete = useCallback(
    (m: MappedManager) => {
      Alert.alert(
        'Vô hiệu hóa tài khoản',
        `Bạn có chắc muốn vô hiệu hóa tài khoản "${m.name}"? Tài khoản sẽ không thể đăng nhập.`,
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Vô hiệu hóa',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteManager(m.id).unwrap();
                await managersQuery.refetch();
                Alert.alert('Thành công', 'Đã vô hiệu hóa tài khoản.');
              } catch (err) {
                const msg =
                  err instanceof Error ? err.message : 'Không thể vô hiệu hóa.';
                Alert.alert('Lỗi', msg);
              }
            },
          },
        ],
      );
    },
    [deleteManager, managersQuery],
  );

  if (!canAccess) {
    return (
      <Screen headerTitle="Tài khoản quản lý" statusBarStyle="light-content">
        <View style={styles.emptyState}>
          <Ionicons name="lock-closed-outline" size={40} color={Colors.text.secondary} />
          <Text style={styles.emptyTitle}>Chỉ dành cho Super Admin</Text>
          <Text style={styles.emptySubtitle}>
            Bạn cần quyền garage_admin để truy cập màn này.
          </Text>
        </View>
      </Screen>
    );
  }

  const isInitialLoading = managersQuery.isLoading && managers.length === 0;
  const isError =
    !managersQuery.isLoading && !!managersQuery.error && managers.length === 0;

  const renderManager = ({ item }: { item: MappedManager }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Ionicons name="person-circle-outline" size={26} color={Colors.primary} />
        </View>
        <View style={styles.cardMeta}>
          <Text style={styles.managerName}>{item.name}</Text>
          <Text style={styles.managerPhone}>{item.phone}</Text>
          {item.garage_name ? (
            <Text style={styles.managerGarage}>
              {item.garage_name}
              {item.garage_code ? ` · ${item.garage_code}` : ''}
            </Text>
          ) : null}
        </View>
        <View
          style={[
            styles.statusBadge,
            item.status === 'active' && styles.statusBadgeActive,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              item.status === 'active' && styles.statusTextActive,
            ]}
          >
            {item.status || 'N/A'}
          </Text>
        </View>
      </View>

      {item.last_login_at ? (
        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={14} color={Colors.text.secondary} />
          <Text style={styles.metaText}>
            Đăng nhập gần nhất: {formatDate(item.last_login_at)}
          </Text>
        </View>
      ) : null}

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => setEditManager(item)}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Ionicons name="create-outline" size={16} color={Colors.primary} />
          <Text style={styles.actionBtnText}>Sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => setPwdManager(item)}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Ionicons name="key-outline" size={16} color={Colors.status.warning} />
          <Text style={[styles.actionBtnText, { color: Colors.status.warning }]}>
            Đổi MK
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.actionBtnDanger]}
          onPress={() => handleDelete(item)}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Ionicons name="trash-outline" size={16} color={Colors.status.error} />
          <Text style={[styles.actionBtnText, { color: Colors.status.error }]}>
            Vô hiệu
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Screen
      headerTitle="Tài khoản quản lý"
      statusBarStyle="light-content"
      useScrollView={false}
      backgroundColor={Colors.background.secondary}
    >
      {isInitialLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Đang tải danh sách tài khoản...</Text>
        </View>
      ) : isError ? (
        <ErrorView
          message="Không thể tải danh sách tài khoản"
          onRetry={() => managersQuery.refetch()}
          icon="people-outline"
        />
      ) : (
        <FlatList
          data={managers}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderManager}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing || managersQuery.isFetching}
              onRefresh={handleRefresh}
            />
          }
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.headerBlock}>
              <Text style={styles.screenTitle}>Quản lý tài khoản gara</Text>
              <Text style={styles.screenSubtitle}>
                Tạo và quản lý tài khoản manager cho các gara trong hệ thống.
              </Text>

              <View style={styles.searchBar}>
                <Ionicons name="search-outline" size={16} color={Colors.text.secondary} />
                <TextInput
                  style={styles.searchInput}
                  value={searchInput}
                  onChangeText={setSearchInput}
                  onBlur={() => setSearchQuery(searchInput)}
                  onSubmitEditing={() => setSearchQuery(searchInput)}
                  placeholder="Tìm theo tên, SĐT..."
                  placeholderTextColor={Colors.text.secondary}
                  returnKeyType="search"
                />
                {searchInput ? (
                  <TouchableOpacity
                    onPress={() => {
                      setSearchInput('');
                      setSearchQuery('');
                    }}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Ionicons name="close-circle" size={16} color={Colors.text.secondary} />
                  </TouchableOpacity>
                ) : null}
              </View>

              <View style={styles.statRow}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{managers.length}</Text>
                  <Text style={styles.statLabel}>Tổng tài khoản</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>
                    {managers.filter((m) => m.status === 'active').length}
                  </Text>
                  <Text style={styles.statLabel}>Đang hoạt động</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{garages.length}</Text>
                  <Text style={styles.statLabel}>Tổng gara</Text>
                </View>
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={40} color={Colors.text.secondary} />
              <Text style={styles.emptyTitle}>Chưa có tài khoản nào</Text>
              <Text style={styles.emptySubtitle}>
                Bấm nút + để tạo tài khoản manager cho gara.
              </Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowCreateModal(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={26} color={Colors.background.light} />
      </TouchableOpacity>

      {showCreateModal && (
        <GarageManagerFormModal
          title="Tạo tài khoản manager"
          garages={garages}
          onClose={() => setShowCreateModal(false)}
          onSave={async (data) => {
            try {
              await handleCreate(data);
              Alert.alert('Thành công', 'Đã tạo tài khoản manager.');
              setShowCreateModal(false);
            } catch (err) {
              const msg = err instanceof Error ? err.message : 'Không thể tạo.';
              Alert.alert('Lỗi', msg);
            }
          }}
        />
      )}

      {editManager && (
        <GarageManagerFormModal
          title="Sửa tài khoản manager"
          initialValues={editManager}
          garages={garages}
          onClose={() => setEditManager(null)}
          onSave={async (data) => {
            try {
              await handleUpdate(editManager.id, data);
              Alert.alert('Thành công', 'Đã cập nhật tài khoản.');
              setEditManager(null);
            } catch (err) {
              const msg = err instanceof Error ? err.message : 'Không thể cập nhật.';
              Alert.alert('Lỗi', msg);
            }
          }}
        />
      )}

      {pwdManager && (
        <ChangePasswordModal
          manager={pwdManager}
          onClose={() => setPwdManager(null)}
          onSubmit={async (newPassword) => {
            try {
              await resetPassword({ id: pwdManager.id, new_password: newPassword }).unwrap();
              Alert.alert('Thành công', `Đã đặt lại mật khẩu cho ${pwdManager.name}.`);
              setPwdManager(null);
            } catch (err) {
              const msg =
                err instanceof Error ? err.message : 'Không thể đổi mật khẩu.';
              Alert.alert('Lỗi', msg);
            }
          }}
        />
      )}
    </Screen>
  );
}

// ─── Form Modal ────────────────────────────────────────────────────────────────
function GarageManagerFormModal({
  title,
  initialValues,
  garages,
  onClose,
  onSave,
}: {
  title: string;
  initialValues?: Partial<MappedManager>;
  garages: MappedGarage[];
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => Promise<void>;
}) {
  const isEdit = Boolean(initialValues?.id);
  const [name, setName] = useState(initialValues?.name || '');
  const [phone, setPhone] = useState(initialValues?.phone || '');
  const [password, setPassword] = useState('');
  const [garageId, setGarageId] = useState<string | number | null>(
    initialValues?.garage_id ?? null,
  );
  const [status, setStatus] = useState(initialValues?.status || 'active');
  const [showGaragePicker, setShowGaragePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên.');
      return;
    }
    if (!isEdit && !phone.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại.');
      return;
    }
    if (!isEdit && !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu.');
      return;
    }
    if (!isEdit && password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    if (!garageId) {
      Alert.alert('Lỗi', 'Vui lòng chọn gara.');
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        await onSave({ name: name.trim(), garage_id: garageId, status });
      } else {
        await onSave({
          name: name.trim(),
          phone: phone.trim(),
          password,
          garage_id: garageId,
          status,
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Không thể lưu.';
      Alert.alert('Lỗi', msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal transparent animationType="slide" visible onRequestClose={onClose}>
      <Pressable style={modalStyles.overlay} onPress={onClose}>
        <Pressable style={modalStyles.sheet} onPress={() => {}}>
          <View style={modalStyles.header}>
            <Text style={modalStyles.title}>{title}</Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={22} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>

          <View style={modalStyles.field}>
            <Text style={modalStyles.label}>Tên *</Text>
            <TextInput
              style={modalStyles.input}
              value={name}
              onChangeText={setName}
              placeholder="Nhập tên"
              placeholderTextColor={Colors.text.secondary}
            />
          </View>

          <View style={modalStyles.field}>
            <Text style={modalStyles.label}>
              Số điện thoại {isEdit ? '(không thể đổi)' : '*'}
            </Text>
            <TextInput
              style={[modalStyles.input, isEdit && modalStyles.inputDisabled]}
              value={phone}
              onChangeText={setPhone}
              placeholder="VD: 0901234567"
              placeholderTextColor={Colors.text.secondary}
              keyboardType="phone-pad"
              editable={!isEdit}
            />
          </View>

          {!isEdit && (
            <View style={modalStyles.field}>
              <Text style={modalStyles.label}>Mật khẩu *</Text>
              <TextInput
                style={modalStyles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Tối thiểu 6 ký tự"
                placeholderTextColor={Colors.text.secondary}
                secureTextEntry
              />
            </View>
          )}

          <View style={modalStyles.field}>
            <Text style={modalStyles.label}>Gara *</Text>
            <TouchableOpacity
              style={modalStyles.input}
              onPress={() => setShowGaragePicker((v) => !v)}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  modalStyles.inputText,
                  !garageId && modalStyles.inputPlaceholder,
                ]}
              >
                {garageId
                  ? garages.find((g) => String(g.id) === String(garageId))?.name +
                    ' (' +
                    (garages.find((g) => String(g.id) === String(garageId))?.code || '') +
                    ')'
                  : 'Chọn gara'}
              </Text>
              <Ionicons name="chevron-down" size={16} color={Colors.text.secondary} />
            </TouchableOpacity>
            {showGaragePicker ? (
              <View style={modalStyles.pickerList}>
                {garages.length === 0 ? (
                  <Text style={modalStyles.emptyText}>Không có gara nào.</Text>
                ) : (
                  garages.map((g) => (
                    <TouchableOpacity
                      key={String(g.id)}
                      style={[
                        modalStyles.pickerItem,
                        String(garageId) === String(g.id) &&
                          modalStyles.pickerItemActive,
                      ]}
                      onPress={() => {
                        setGarageId(g.id);
                        setShowGaragePicker(false);
                      }}
                    >
                      <Ionicons
                        name={
                          String(garageId) === String(g.id)
                            ? 'radio-button-on'
                            : 'radio-button-off'
                        }
                        size={16}
                        color={Colors.primary}
                      />
                      <Text style={modalStyles.pickerItemText}>
                        {g.name} ({g.code})
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            ) : null}
          </View>

          <View style={modalStyles.switchRow}>
            <Text style={modalStyles.label}>Đang hoạt động</Text>
            <Switch
              value={status === 'active'}
              onValueChange={(v) => setStatus(v ? 'active' : 'inactive')}
              trackColor={{ false: Colors.border.light, true: Colors.primarySoft }}
              thumbColor={status === 'active' ? Colors.primary : Colors.background.light}
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
              {saving ? (
                <ActivityIndicator size="small" color={Colors.background.light} />
              ) : (
                <Text style={modalStyles.saveText}>Lưu</Text>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Change Password Modal ─────────────────────────────────────────────────────
function ChangePasswordModal({
  manager,
  onClose,
  onSubmit,
}: {
  manager: MappedManager;
  onClose: () => void;
  onSubmit: (newPassword: string) => Promise<void>;
}) {
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [show, setShow] = useState(false);

  const handleSubmit = async () => {
    if (newPassword.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    if (newPassword !== confirm) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp.');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(newPassword);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Không thể đổi mật khẩu.';
      Alert.alert('Lỗi', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal transparent animationType="slide" visible onRequestClose={onClose}>
      <Pressable style={modalStyles.overlay} onPress={onClose}>
        <Pressable style={modalStyles.sheet} onPress={() => {}}>
          <View style={modalStyles.header}>
            <Text style={modalStyles.title}>Đổi mật khẩu</Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={22} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>

          <Text style={modalStyles.subtitle}>
            Đặt lại mật khẩu cho tài khoản{' '}
            <Text style={{ fontWeight: Typography.weight.bold }}>{manager.name}</Text> (
            {manager.phone}).
          </Text>

          <View style={modalStyles.field}>
            <Text style={modalStyles.label}>Mật khẩu mới *</Text>
            <View style={modalStyles.passwordRow}>
              <TextInput
                style={[modalStyles.input, { flex: 1 }]}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Tối thiểu 6 ký tự"
                placeholderTextColor={Colors.text.secondary}
                secureTextEntry={!show}
              />
              <TouchableOpacity
                onPress={() => setShow((v) => !v)}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                style={modalStyles.eyeBtn}
              >
                <Ionicons
                  name={show ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={Colors.text.secondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={modalStyles.field}>
            <Text style={modalStyles.label}>Xác nhận mật khẩu *</Text>
            <TextInput
              style={modalStyles.input}
              value={confirm}
              onChangeText={setConfirm}
              placeholder="Nhập lại mật khẩu"
              placeholderTextColor={Colors.text.secondary}
              secureTextEntry={!show}
            />
          </View>

          <View style={modalStyles.actions}>
            <TouchableOpacity style={modalStyles.cancelBtn} onPress={onClose}>
              <Text style={modalStyles.cancelText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[modalStyles.saveBtn, submitting && { opacity: 0.6 }]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={Colors.background.light} />
              ) : (
                <Text style={modalStyles.saveText}>Đổi mật khẩu</Text>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

const styles = StyleSheet.create({
  listContent: {
    padding: spacing.base,
    gap: spacing.base,
    paddingBottom: 100,
  },
  headerBlock: {
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  screenTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size['2xl'],
    color: Colors.text.primary,
    fontWeight: Typography.weight.bold,
  },
  screenSubtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.light,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border.light,
    marginTop: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.base,
    color: Colors.text.primary,
    paddingVertical: 0,
  },
  statRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.background.light,
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  statValue: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.xl,
    color: Colors.primary,
    fontWeight: Typography.weight.bold,
  },
  statLabel: {
    marginTop: spacing.xs,
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.xs,
    color: Colors.text.secondary,
  },
  card: {
    backgroundColor: Colors.background.light,
    borderRadius: borderRadius['2xl'],
    padding: spacing.base,
    borderWidth: 1,
    borderColor: Colors.border.light,
    gap: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardMeta: {
    flex: 1,
    gap: 2,
  },
  managerName: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.base,
    color: Colors.text.primary,
    fontWeight: Typography.weight.bold,
  },
  managerPhone: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.text.secondary,
  },
  managerGarage: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.xs,
    color: Colors.primary,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: Colors.background.secondary,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  statusBadgeActive: {
    backgroundColor: Colors.primarySoft,
    borderColor: Colors.primary,
  },
  statusText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.xs,
    color: Colors.text.secondary,
  },
  statusTextActive: {
    color: Colors.primary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.text.secondary,
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.primarySoft,
  },
  actionBtnDanger: {
    borderColor: Colors.status.error,
    backgroundColor: '#FEF2F2',
  },
  actionBtnText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.xs,
    color: Colors.primary,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
  },
  loadingText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.text.secondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['4xl'],
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  emptyTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.lg,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.text.secondary,
    lineHeight: 20,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.background.light,
    borderTopLeftRadius: borderRadius['3xl'],
    borderTopRightRadius: borderRadius['3xl'],
    padding: spacing.lg,
    gap: spacing.base,
    paddingBottom: spacing['3xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.lg,
    color: Colors.text.primary,
    fontWeight: Typography.weight.bold,
  },
  subtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.text.secondary,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background.secondary,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.base,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border.light,
    minHeight: 48,
  },
  inputText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.base,
    color: Colors.text.primary,
    flex: 1,
  },
  inputPlaceholder: {
    color: Colors.text.secondary,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  pickerList: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border.light,
    backgroundColor: Colors.background.light,
    maxHeight: 220,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  pickerItemActive: {
    backgroundColor: Colors.primarySoft,
  },
  pickerItemText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.text.primary,
    flex: 1,
  },
  emptyText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
    padding: spacing.base,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  eyeBtn: {
    padding: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border.light,
    alignItems: 'center',
  },
  cancelText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.base,
    color: Colors.text.secondary,
  },
  saveBtn: {
    flex: 2,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  saveText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.base,
    color: Colors.background.light,
    fontWeight: Typography.weight.bold,
  },
});