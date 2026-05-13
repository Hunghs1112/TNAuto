import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Screen } from '../../components/layout';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typo';
import { borderRadius } from '../../design-system/borders';
import { spacing } from '../../design-system/spacing';
import { AppStackParamList } from '../../navigation/AppNavigator';
import { isManagerRole } from '../../navigation/rolePolicy';
import { useAppSelector } from '../../redux/hooks/useAppSelector';
import {
  AdminEmployee,
  useDeleteAdminResourceMutation,
  useGetAdminResourceDetailQuery,
  useGetAdminResourceListQuery,
  useUpdateAdminResourceMutation,
  useUploadAdminEntityAssetMutation,
  useAssignAdminServiceOrderMutation,
} from '../../services/adminGarageApi';
import {
  createImageFormData,
  pickImageFromCamera,
  pickImageFromGallery,
  showImagePickerOptions,
  validateImageSize,
} from '../../utils/imageUpload';

type EmployeeDetailRouteProp = RouteProp<AppStackParamList, 'EmployeeDetail'>;
type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

export default function EmployeeDetailScreen() {
  const route = useRoute<EmployeeDetailRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { employeeId, employeeName } = route.params;

  const userType = useAppSelector((s) => s.auth.userType);
  const canAccess = isManagerRole(userType);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const detailQuery = useGetAdminResourceDetailQuery(
    { resource: 'employees', id: employeeId },
    { skip: !canAccess },
  );
  // Pending orders to assign
  const ordersQuery = useGetAdminResourceListQuery(
    { resource: 'service-orders', params: { status: 'received' } },
    { skip: !canAccess || !showAssignModal },
  );

  const [updateEmployee] = useUpdateAdminResourceMutation();
  const [deleteEmployee] = useDeleteAdminResourceMutation();
  const [uploadAvatar] = useUploadAdminEntityAssetMutation();
  const [assignOrder] = useAssignAdminServiceOrderMutation();

  const employee = detailQuery.data as unknown as AdminEmployee | undefined;

  const handleRefresh = useCallback(async () => {
    await detailQuery.refetch();
  }, [detailQuery]);

  const handleEdit = useCallback(async (data: Record<string, string>) => {
    await updateEmployee({ resource: 'employees', id: employeeId, body: data }).unwrap();
    await detailQuery.refetch();
  }, [detailQuery, employeeId, updateEmployee]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Xóa nhân viên',
      `Bạn có chắc muốn xóa nhân viên "${employeeName}"? Hành động này không thể hoàn tác.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteEmployee({ resource: 'employees', id: employeeId }).unwrap();
              Alert.alert('Thành công', 'Đã xóa nhân viên.');
              navigation.goBack();
            } catch {
              Alert.alert('Lỗi', 'Không thể xóa nhân viên. Vui lòng thử lại.');
            }
          },
        },
      ],
    );
  }, [deleteEmployee, employeeId, employeeName, navigation]);

  const handleUploadAvatar = useCallback(() => {
    const doUpload = async (asset: any) => {
      if (!asset || !validateImageSize(asset)) return;
      setUploadingAvatar(true);
      try {
        const formData = createImageFormData(asset, 'image');
        await uploadAvatar({ resource: 'employees', id: employeeId, action: 'upload-avatar', body: formData }).unwrap();
        await detailQuery.refetch();
        Alert.alert('Thành công', 'Đã cập nhật ảnh đại diện.');
      } catch {
        Alert.alert('Lỗi', 'Không thể upload ảnh. Vui lòng thử lại.');
      } finally {
        setUploadingAvatar(false);
      }
    };
    showImagePickerOptions(
      async () => doUpload(await pickImageFromCamera()),
      async () => { const assets = await pickImageFromGallery(); doUpload(assets[0]); },
    );
  }, [detailQuery, employeeId, uploadAvatar]);

  const handleAssignOrder = useCallback(async (orderId: string | number) => {
    try {
      await assignOrder({ id: orderId, body: { employee_id: employeeId } }).unwrap();
      setShowAssignModal(false);
      Alert.alert('Thành công', 'Đã gán đơn cho nhân viên.');
    } catch {
      Alert.alert('Lỗi', 'Không thể gán đơn. Vui lòng thử lại.');
    }
  }, [assignOrder, employeeId]);

  if (detailQuery.isLoading && !employee) {
    return (
      <Screen headerTitle={employeeName} showBackButton safeAreaTopColor={Colors.primary} statusBarStyle="light-content">
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </Screen>
    );
  }

  const avatarUrl = String(employee?.avatar_url || '');

  return (
    <Screen
      headerTitle={employeeName}
      showBackButton
      safeAreaTopColor={Colors.primary}
      statusBarStyle="light-content"
      useScrollView={false}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={detailQuery.isFetching} onRefresh={handleRefresh} />}
      >
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <TouchableOpacity style={styles.avatarWrapper} onPress={handleUploadAvatar} activeOpacity={0.8}>
            {avatarUrl
              ? <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
              : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={40} color={Colors.primary} />
                </View>
              )}
            <View style={styles.avatarEditBadge}>
              {uploadingAvatar
                ? <ActivityIndicator size="small" color={Colors.background.light} />
                : <Ionicons name="camera" size={14} color={Colors.background.light} />}
            </View>
          </TouchableOpacity>
          <Text style={styles.empName}>{employee?.name || employeeName}</Text>
          {employee?.position ? <Text style={styles.empPosition}>{String(employee.position)}</Text> : null}
        </View>

        {/* Info */}
        <View style={styles.infoCard}>
          <InfoRow icon="call-outline" label="Điện thoại" value={employee?.phone || 'Chưa có'} />
          {employee?.garage_name ? <InfoRow icon="business-outline" label="Gara" value={String(employee.garage_name)} /> : null}
          <InfoRow icon="receipt-outline" label="Tổng đơn" value={String(employee?.total_orders ?? 0)} />
          <InfoRow icon="time-outline" label="Đang xử lý" value={String(employee?.active_order_count ?? 0)} highlight />
          {employee?.status ? <InfoRow icon="ellipse-outline" label="Trạng thái" value={String(employee.status)} /> : null}
        </View>

        {/* Actions */}
        <View style={styles.actionsCard}>
          <TouchableOpacity style={styles.actionRow} onPress={() => setShowEditModal(true)}>
            <Ionicons name="create-outline" size={20} color={Colors.primary} />
            <Text style={styles.actionText}>Sửa thông tin</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.text.secondary} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.actionRow} onPress={handleUploadAvatar}>
            <Ionicons name="camera-outline" size={20} color={Colors.primary} />
            <Text style={styles.actionText}>Cập nhật ảnh đại diện</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.text.secondary} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.actionRow} onPress={() => setShowAssignModal(true)}>
            <Ionicons name="clipboard-outline" size={20} color={Colors.primary} />
            <Text style={styles.actionText}>Gán đơn hàng</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.text.secondary} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={[styles.actionRow]} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color={Colors.status.error} />
            <Text style={[styles.actionText, { color: Colors.status.error }]}>Xóa nhân viên</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.status.error} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit modal */}
      {showEditModal && employee && (
        <EditEmployeeModal
          employee={employee}
          onClose={() => setShowEditModal(false)}
          onSave={handleEdit}
        />
      )}

      {/* Assign order modal */}
      {showAssignModal && (
        <AssignOrderModal
          orders={(ordersQuery.data || []) as any[]}
          loading={ordersQuery.isLoading}
          onClose={() => setShowAssignModal(false)}
          onAssign={handleAssignOrder}
        />
      )}
    </Screen>
  );
}

// ─── InfoRow ──────────────────────────────────────────────────────────────────
function InfoRow({ icon, label, value, highlight }: { icon: string; label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon as any} size={16} color={highlight ? Colors.primary : Colors.text.secondary} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, highlight && { color: Colors.primary, fontFamily: Typography.fontFamily.bold }]}>{value}</Text>
    </View>
  );
}

// ─── Edit Employee Modal ──────────────────────────────────────────────────────
function EditEmployeeModal({
  employee,
  onClose,
  onSave,
}: {
  employee: AdminEmployee;
  onClose: () => void;
  onSave: (data: Record<string, string>) => Promise<void>;
}) {
  const [name, setName] = useState(employee.name || '');
  const [phone, setPhone] = useState(employee.phone || '');
  const [position, setPosition] = useState(String(employee.position || ''));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Lỗi', 'Tên không được để trống.'); return; }
    setSaving(true);
    try {
      await onSave({ name: name.trim(), phone: phone.trim(), position: position.trim() });
      Alert.alert('Thành công', 'Đã cập nhật thông tin nhân viên.');
      onClose();
    } catch {
      Alert.alert('Lỗi', 'Không thể cập nhật. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={modalStyles.overlay}>
      <View style={modalStyles.sheet}>
        <View style={modalStyles.header}>
          <Text style={modalStyles.title}>Sửa nhân viên</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={22} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>
        {[
          { label: 'Tên *', value: name, set: setName, placeholder: 'Nhập tên' },
          { label: 'Số điện thoại', value: phone, set: setPhone, placeholder: 'Nhập SĐT', keyboard: 'phone-pad' as const },
          { label: 'Chức vụ', value: position, set: setPosition, placeholder: 'VD: Kỹ thuật viên' },
        ].map((f) => (
          <View key={f.label} style={modalStyles.field}>
            <Text style={modalStyles.label}>{f.label}</Text>
            <TextInput
              style={modalStyles.input}
              value={f.value}
              onChangeText={f.set}
              placeholder={f.placeholder}
              placeholderTextColor={Colors.text.secondary}
              keyboardType={f.keyboard}
            />
          </View>
        ))}
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

// ─── Assign Order Modal ───────────────────────────────────────────────────────
function AssignOrderModal({
  orders,
  loading,
  onClose,
  onAssign,
}: {
  orders: any[];
  loading: boolean;
  onClose: () => void;
  onAssign: (orderId: string | number) => Promise<void>;
}) {
  const [assigning, setAssigning] = useState<string | null>(null);

  return (
    <View style={modalStyles.overlay}>
      <View style={[modalStyles.sheet, { maxHeight: '70%' }]}>
        <View style={modalStyles.header}>
          <Text style={modalStyles.title}>Gán đơn hàng</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={22} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginVertical: spacing.xl }} />
        ) : orders.length === 0 ? (
          <Text style={{ textAlign: 'center', color: Colors.text.secondary, paddingVertical: spacing.xl, fontFamily: Typography.fontFamily.regular }}>
            Không có đơn mới nhận nào.
          </Text>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {orders.map((order) => (
              <TouchableOpacity
                key={String(order.id)}
                style={modalStyles.orderRow}
                disabled={assigning === String(order.id)}
                onPress={async () => {
                  setAssigning(String(order.id));
                  await onAssign(order.id);
                  setAssigning(null);
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={modalStyles.orderTitle}>
                    {String(order.service_name || `Đơn #${order.id}`)}
                  </Text>
                  <Text style={modalStyles.orderSub}>
                    {String(order.customer_name || order.license_plate || '')}
                  </Text>
                </View>
                {assigning === String(order.id)
                  ? <ActivityIndicator size="small" color={Colors.primary} />
                  : <Ionicons name="add-circle-outline" size={22} color={Colors.primary} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  content: { padding: spacing.base, gap: spacing.base, paddingBottom: spacing['3xl'] },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  avatarSection: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.base },
  avatarWrapper: { position: 'relative' },
  avatarImage: { width: 80, height: 80, borderRadius: 40 },
  avatarPlaceholder: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primarySoft, alignItems: 'center', justifyContent: 'center',
  },
  avatarEditBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.background.light,
  },
  empName: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.xl,
    color: Colors.text.primary,
    fontWeight: Typography.weight.bold,
  },
  empPosition: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.primary,
  },
  infoCard: {
    backgroundColor: Colors.background.light,
    borderRadius: borderRadius['2xl'],
    borderWidth: 1,
    borderColor: Colors.border.light,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingHorizontal: spacing.base, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border.light,
  },
  infoLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.text.secondary,
    flex: 1,
  },
  infoValue: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.text.primary,
    textAlign: 'right',
  },
  actionsCard: {
    backgroundColor: Colors.background.light,
    borderRadius: borderRadius['2xl'],
    borderWidth: 1,
    borderColor: Colors.border.light,
    overflow: 'hidden',
  },
  actionRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingHorizontal: spacing.base, paddingVertical: spacing.md,
  },
  actionText: {
    flex: 1,
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.base,
    color: Colors.text.primary,
  },
  divider: { height: 1, backgroundColor: Colors.border.light, marginLeft: spacing.base + 20 + spacing.sm },
});

const modalStyles = StyleSheet.create({
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end', zIndex: 100,
  },
  sheet: {
    backgroundColor: Colors.background.light,
    borderTopLeftRadius: borderRadius['3xl'], borderTopRightRadius: borderRadius['3xl'],
    padding: spacing.lg, gap: spacing.base, paddingBottom: spacing['3xl'],
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.lg,
    color: Colors.text.primary,
    fontWeight: Typography.weight.bold,
  },
  field: { gap: spacing.xs },
  label: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.text.secondary,
  },
  input: {
    backgroundColor: Colors.background.secondary,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.base, paddingVertical: spacing.md,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.base,
    color: Colors.text.primary,
    borderWidth: 1, borderColor: Colors.border.light,
  },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  cancelBtn: {
    flex: 1, paddingVertical: spacing.md, borderRadius: borderRadius.xl,
    borderWidth: 1, borderColor: Colors.border.light, alignItems: 'center',
  },
  cancelText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.base,
    color: Colors.text.secondary,
  },
  saveBtn: {
    flex: 2, paddingVertical: spacing.md, borderRadius: borderRadius.xl,
    backgroundColor: Colors.primary, alignItems: 'center',
  },
  saveText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.base,
    color: Colors.background.light,
    fontWeight: Typography.weight.bold,
  },
  orderRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border.light,
  },
  orderTitle: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.base,
    color: Colors.text.primary,
  },
  orderSub: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.text.secondary,
    marginTop: 2,
  },
});
