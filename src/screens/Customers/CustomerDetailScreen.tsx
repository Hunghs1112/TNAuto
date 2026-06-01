// src/screens/Customers/CustomerDetailScreen.tsx
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
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
  AdminCustomer,
  useDeleteAdminCustomerDriverLicenseMutation,
  useDeleteAdminResourceMutation,
  useGetAdminCustomerVehiclesQuery,
  useGetAdminCustomerDriverLicenseQuery,
  useGetAdminResourceDetailQuery,
  useGetAdminResourceListQuery,
  useUpdateAdminResourceMutation,
  useUploadAdminEntityAssetMutation,
  useUpsertAdminCustomerDriverLicenseMutation,
  useCreateAdminResourceMutation,
} from '../../services/adminGarageApi';
import { Vehicle } from '../../types/api.types';
import {
  createImageFormData,
  showImagePickerOptions,
  pickImageFromCamera,
  pickImageFromGallery,
  validateImageSize,
} from '../../utils/imageUpload';
import { useGetAssignedOrdersQuery } from '../../services/employeeApi';
import ServiceOrderCard from '../../components/ServiceOrderCard';
import { PerformanceConfig } from '../../config/performance';
import { useAutoRefresh } from '../../redux/hooks/useAutoRefresh';
import { useRefreshQueries } from '../../hooks/useRefreshQueries';
import { styles as sharedStyles } from './styles';

type CustomerDetailRouteProp = RouteProp<AppStackParamList, 'CustomerDetail'>;
type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

// ─── Tab type ────────────────────────────────────────────────────────────────
type TabKey = 'info' | 'vehicles' | 'license' | 'orders';

const TABS: Array<{ key: TabKey; label: string; icon: string }> = [
  { key: 'info', label: 'Thông tin', icon: 'person-outline' },
  { key: 'vehicles', label: 'Xe', icon: 'car-outline' },
  { key: 'license', label: 'Bằng lái', icon: 'card-outline' },
  { key: 'orders', label: 'Đơn hàng', icon: 'receipt-outline' },
];

// ─── Edit Customer Modal ──────────────────────────────────────────────────────
interface EditCustomerModalProps {
  customer: AdminCustomer;
  onClose: () => void;
  onSave: (data: Record<string, string>) => Promise<void>;
}

function EditCustomerModal({ customer, onClose, onSave }: EditCustomerModalProps) {
  const [name, setName] = useState(customer.name || '');
  const [phone, setPhone] = useState(customer.phone || '');
  const [email, setEmail] = useState(String(customer.email || ''));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Tên khách hàng không được để trống.');
      return;
    }
    setSaving(true);
    try {
      await onSave({ name: name.trim(), phone: phone.trim(), email: email.trim() });
      onClose();
    } catch {
      Alert.alert('Lỗi', 'Không thể cập nhật khách hàng. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={modalStyles.overlay}>
      <View style={modalStyles.sheet}>
        <View style={modalStyles.header}>
          <Text style={modalStyles.title}>Sửa khách hàng</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={22} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>

        <View style={modalStyles.field}>
          <Text style={modalStyles.label}>Tên *</Text>
          <TextInput
            style={modalStyles.input}
            value={name}
            onChangeText={setName}
            placeholder="Nhập tên khách hàng"
            placeholderTextColor={Colors.text.secondary}
          />
        </View>
        <View style={modalStyles.field}>
          <Text style={modalStyles.label}>Số điện thoại</Text>
          <TextInput
            style={modalStyles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Nhập số điện thoại"
            placeholderTextColor={Colors.text.secondary}
            keyboardType="phone-pad"
          />
        </View>
        <View style={modalStyles.field}>
          <Text style={modalStyles.label}>Email</Text>
          <TextInput
            style={modalStyles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Nhập email"
            placeholderTextColor={Colors.text.secondary}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={modalStyles.actions}>
          <TouchableOpacity style={modalStyles.cancelBtn} onPress={onClose}>
            <Text style={modalStyles.cancelText}>Hủy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[modalStyles.saveBtn, saving && modalStyles.saveBtnDisabled]}
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
      </View>
    </View>
  );
}

// ─── Add Vehicle Modal ────────────────────────────────────────────────────────
interface AddVehicleModalProps {
  onClose: () => void;
  onSave: (data: Record<string, string>) => Promise<void>;
}

function AddVehicleModal({ onClose, onSave }: AddVehicleModalProps) {
  const [plate, setPlate] = useState('');
  const [model, setModel] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!plate.trim()) {
      Alert.alert('Lỗi', 'Biển số xe không được để trống.');
      return;
    }
    setSaving(true);
    try {
      await onSave({ license_plate: plate.trim().toUpperCase(), model: model.trim() });
      onClose();
    } catch {
      Alert.alert('Lỗi', 'Không thể thêm xe. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={modalStyles.overlay}>
      <View style={modalStyles.sheet}>
        <View style={modalStyles.header}>
          <Text style={modalStyles.title}>Thêm xe</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={22} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>

        <View style={modalStyles.field}>
          <Text style={modalStyles.label}>Biển số xe *</Text>
          <TextInput
            style={modalStyles.input}
            value={plate}
            onChangeText={setPlate}
            placeholder="VD: 51A-12345"
            placeholderTextColor={Colors.text.secondary}
            autoCapitalize="characters"
          />
        </View>
        <View style={modalStyles.field}>
          <Text style={modalStyles.label}>Mẫu xe</Text>
          <TextInput
            style={modalStyles.input}
            value={model}
            onChangeText={setModel}
            placeholder="VD: Toyota Vios"
            placeholderTextColor={Colors.text.secondary}
          />
        </View>

        <View style={modalStyles.actions}>
          <TouchableOpacity style={modalStyles.cancelBtn} onPress={onClose}>
            <Text style={modalStyles.cancelText}>Hủy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[modalStyles.saveBtn, saving && modalStyles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color={Colors.background.light} />
            ) : (
              <Text style={modalStyles.saveText}>Thêm</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ─── Driver License Modal ─────────────────────────────────────────────────────
interface DriverLicenseModalProps {
  existing: Record<string, unknown> | null;
  onClose: () => void;
  onSave: (data: Record<string, string>) => Promise<void>;
}

function DriverLicenseModal({ existing, onClose, onSave }: DriverLicenseModalProps) {
  const [number, setNumber] = useState(String(existing?.license_number || existing?.number || ''));
  const [expiry, setExpiry] = useState(String(existing?.expiry_date || existing?.license_expiry_date || ''));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!number.trim()) {
      Alert.alert('Lỗi', 'Số bằng lái không được để trống.');
      return;
    }
    setSaving(true);
    try {
      await onSave({ license_number: number.trim(), expiry_date: expiry.trim() });
      onClose();
    } catch {
      Alert.alert('Lỗi', 'Không thể cập nhật bằng lái. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={modalStyles.overlay}>
      <View style={modalStyles.sheet}>
        <View style={modalStyles.header}>
          <Text style={modalStyles.title}>{existing ? 'Cập nhật bằng lái' : 'Thêm bằng lái'}</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={22} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>

        <View style={modalStyles.field}>
          <Text style={modalStyles.label}>Số bằng lái *</Text>
          <TextInput
            style={modalStyles.input}
            value={number}
            onChangeText={setNumber}
            placeholder="Nhập số bằng lái"
            placeholderTextColor={Colors.text.secondary}
          />
        </View>
        <View style={modalStyles.field}>
          <Text style={modalStyles.label}>Ngày hết hạn (YYYY-MM-DD)</Text>
          <TextInput
            style={modalStyles.input}
            value={expiry}
            onChangeText={setExpiry}
            placeholder="VD: 2028-12-31"
            placeholderTextColor={Colors.text.secondary}
          />
        </View>

        <View style={modalStyles.actions}>
          <TouchableOpacity style={modalStyles.cancelBtn} onPress={onClose}>
            <Text style={modalStyles.cancelText}>Hủy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[modalStyles.saveBtn, saving && modalStyles.saveBtnDisabled]}
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
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
const CustomerDetailScreen: React.FC = () => {
  const route = useRoute<CustomerDetailRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { customerId, customerName, customerPhone } = route.params;

  const userType = useAppSelector((state) => state.auth.userType);
  const userId = useAppSelector((state) => state.auth.userId);
  const currentEmployee = useAppSelector((state) => state.employee.currentEmployee);
  const services = useAppSelector((state) => state.services.services);
  const isAdminManager = isManagerRole(userType);

  const [activeTab, setActiveTab] = useState<TabKey>('info');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // ── Queries ────────────────────────────────────────────────────────────────
  const adminCustomerQuery = useGetAdminResourceDetailQuery(
    { resource: 'customers', id: customerId },
    { skip: !isAdminManager },
  );
  const adminVehiclesQuery = useGetAdminCustomerVehiclesQuery(customerId, {
    skip: !isAdminManager,
  });
  const adminLicenseQuery = useGetAdminCustomerDriverLicenseQuery(customerId, {
    skip: !isAdminManager,
  });
  // Admin orders for this customer
  const adminOrdersQuery = useGetAdminResourceListQuery(
    { resource: 'service-orders', params: { customer_id: customerId } },
    { skip: !isAdminManager },
  );

  // Employee fallback (non-admin)
  const employeeId = currentEmployee?.id || userId;
  const { data: assignedResponse, isLoading: empLoading, refetch: empRefetch, isFetching: empFetching } =
    useGetAssignedOrdersQuery(
      { employee_id: employeeId || '' },
      { skip: isAdminManager || !employeeId },
    );

  // ── Mutations ──────────────────────────────────────────────────────────────
  const [updateCustomer] = useUpdateAdminResourceMutation();
  const [deleteCustomer] = useDeleteAdminResourceMutation();
  const [uploadAvatar] = useUploadAdminEntityAssetMutation();
  const [upsertLicense] = useUpsertAdminCustomerDriverLicenseMutation();
  const [deleteLicense] = useDeleteAdminCustomerDriverLicenseMutation();
  const [addVehicle] = useCreateAdminResourceMutation();

  // ── Derived data ───────────────────────────────────────────────────────────
  const adminCustomer = adminCustomerQuery.data as unknown as AdminCustomer | undefined;
  const adminVehicles = (adminVehiclesQuery.data || []) as Vehicle[];
  const adminLicense = (adminLicenseQuery.data || null) as Record<string, unknown> | null;
  const adminOrders = useMemo(() => adminOrdersQuery.data || [], [adminOrdersQuery.data]);

  const customerOrders = useMemo(() => {
    if (isAdminManager) return [];
    const orders = assignedResponse?.success && assignedResponse.data
      ? assignedResponse.data
      : Array.isArray(assignedResponse) ? assignedResponse : [];
    return orders.filter((o: any) => o.customer_id === customerId);
  }, [assignedResponse, customerId, isAdminManager]);

  const customerInfo = useMemo(() => {
    if (isAdminManager) {
      const rec = (adminCustomer || {}) as Record<string, unknown>;
      return {
        name: adminCustomer?.name || customerName || 'Khách hàng không tên',
        phone: adminCustomer?.phone || customerPhone || '',
        email: String(rec.email || ''),
        avatarUrl: String(rec.avatar_url || ''),
        totalOrders: Number(rec.total_orders || 0),
        activeOrders: Number(rec.active_order_count || 0),
        vehicles: adminVehicles.length || Number(rec.vehicle_count || 0),
      };
    }
    // Employee view: dùng route params làm fallback khi chưa có orders
    const first = customerOrders[0];
    return {
      name: customerName || first?.customer_name || 'Khách hàng không tên',
      phone: customerPhone || first?.customer_phone || '',
      email: '',
      avatarUrl: '',
      totalOrders: customerOrders.length,
      activeOrders: customerOrders.filter((o: any) => o.status !== 'completed' && o.status !== 'cancelled').length,
      vehicles: new Set(customerOrders.map((o: any) => o.license_plate)).size,
    };
  }, [adminCustomer, adminVehicles.length, customerOrders, customerName, customerPhone, isAdminManager]);

  // ── Refresh ────────────────────────────────────────────────────────────────
  const { refreshing: autoRefreshing, onRefresh: baseOnRefresh } = useAutoRefresh();
  const { refreshing: queryRefreshing, onRefresh: queryOnRefresh } = useRefreshQueries(
    isAdminManager
      ? [
          { refetch: adminCustomerQuery.refetch, isFetching: adminCustomerQuery.isFetching },
          { refetch: adminVehiclesQuery.refetch, isFetching: adminVehiclesQuery.isFetching },
          { refetch: adminLicenseQuery.refetch, isFetching: adminLicenseQuery.isFetching },
          { refetch: adminOrdersQuery.refetch, isFetching: adminOrdersQuery.isFetching },
        ]
      : [{ refetch: empRefetch, isFetching: empFetching }],
  );
  const handleRefresh = useCallback(async () => {
    baseOnRefresh();
    await queryOnRefresh();
  }, [baseOnRefresh, queryOnRefresh]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleEdit = useCallback(async (data: Record<string, string>) => {
    await updateCustomer({ resource: 'customers', id: customerId, body: data }).unwrap();
  }, [customerId, updateCustomer]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Xóa khách hàng',
      `Xóa khách hàng khỏi gara này? Tài khoản khách hàng vẫn được giữ nguyên trên hệ thống.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCustomer({ resource: 'customers', id: customerId }).unwrap();
              Alert.alert('Thành công', 'Đã xóa khách hàng khỏi gara');
              navigation.goBack();
            } catch {
              Alert.alert('Lỗi', 'Không thể xóa khách hàng. Vui lòng thử lại.');
            }
          },
        },
      ],
    );
  }, [customerId, customerInfo?.name, deleteCustomer, navigation]);

  const handleUploadAvatar = useCallback(() => {
    showImagePickerOptions(
      async () => {
        const asset = await pickImageFromCamera();
        if (!asset || !validateImageSize(asset)) return;
        setUploadingAvatar(true);
        try {
          const formData = createImageFormData(asset, 'image');
          await uploadAvatar({ resource: 'customers', id: customerId, action: 'upload-avatar', body: formData }).unwrap();
          await adminCustomerQuery.refetch();
          Alert.alert('Thành công', 'Đã cập nhật ảnh đại diện.');
        } catch {
          Alert.alert('Lỗi', 'Không thể upload ảnh. Vui lòng thử lại.');
        } finally {
          setUploadingAvatar(false);
        }
      },
      async () => {
        const assets = await pickImageFromGallery();
        if (!assets.length || !validateImageSize(assets[0])) return;
        setUploadingAvatar(true);
        try {
          const formData = createImageFormData(assets[0], 'image');
          await uploadAvatar({ resource: 'customers', id: customerId, action: 'upload-avatar', body: formData }).unwrap();
          await adminCustomerQuery.refetch();
          Alert.alert('Thành công', 'Đã cập nhật ảnh đại diện.');
        } catch {
          Alert.alert('Lỗi', 'Không thể upload ảnh. Vui lòng thử lại.');
        } finally {
          setUploadingAvatar(false);
        }
      },
    );
  }, [adminCustomerQuery, customerId, uploadAvatar]);

  const handleSaveLicense = useCallback(async (data: Record<string, string>) => {
    await upsertLicense({ id: customerId, body: data }).unwrap();
    await adminLicenseQuery.refetch();
  }, [adminLicenseQuery, customerId, upsertLicense]);

  const handleDeleteLicense = useCallback(() => {
    Alert.alert(
      'Xóa bằng lái',
      'Bạn có chắc muốn xóa thông tin bằng lái của khách hàng này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteLicense(customerId).unwrap();
              await adminLicenseQuery.refetch();
              Alert.alert('Thành công', 'Đã xóa thông tin bằng lái.');
            } catch {
              Alert.alert('Lỗi', 'Không thể xóa bằng lái. Vui lòng thử lại.');
            }
          },
        },
      ],
    );
  }, [adminLicenseQuery, customerId, deleteLicense]);

  const handleAddVehicle = useCallback(async (data: Record<string, string>) => {
    await addVehicle({
      resource: 'customers',
      body: { ...data, customer_id: customerId },
    }).unwrap();
    // The API is POST /customers/:id/vehicles — use a workaround via the generic endpoint
    await adminVehiclesQuery.refetch();
  }, [addVehicle, adminVehiclesQuery, customerId]);

  const handleOrderPress = useCallback((orderId: string) => {
    navigation.navigate(isAdminManager ? 'OrderDetail' : 'EmployeeOrderDetail', { id: orderId });
  }, [isAdminManager, navigation]);

  const getServiceName = useCallback((item: any) => {
    if (item.service_name) return item.service_name;
    if (item.service_id && services) {
      const svc = services.find((s) => s.id === Number(item.service_id));
      if (svc) return svc.name;
    }
    return 'Dịch vụ không xác định';
  }, [services]);

  // ── Loading state ──────────────────────────────────────────────────────────
  const isScreenLoading = isAdminManager
    ? adminCustomerQuery.isLoading && !adminCustomer
    : empLoading && customerOrders.length === 0;

  if (isScreenLoading) {
    return (
      <Screen headerTitle="Chi tiết khách hàng" showBackButton safeAreaTopColor={Colors.primary} statusBarStyle="light-content">
        <View style={sharedStyles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={sharedStyles.loadingText}>Đang tải thông tin...</Text>
        </View>
      </Screen>
    );
  }

  // ── Render tabs ────────────────────────────────────────────────────────────
  const renderInfoTab = () => (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={localStyles.tabContent}
      refreshControl={<RefreshControl refreshing={autoRefreshing || queryRefreshing} onRefresh={handleRefresh} />}
    >
      {/* Avatar */}
      <View style={localStyles.avatarSection}>
        <TouchableOpacity
          style={localStyles.avatarWrapper}
          onPress={isAdminManager ? handleUploadAvatar : undefined}
          activeOpacity={isAdminManager ? 0.8 : 1}
        >
          {customerInfo?.avatarUrl ? (
            <Image source={{ uri: customerInfo.avatarUrl }} style={localStyles.avatarImage} />
          ) : (
            <View style={localStyles.avatarPlaceholder}>
              <Ionicons name="person" size={40} color={Colors.primary} />
            </View>
          )}
          {isAdminManager && (
            <View style={localStyles.avatarEditBadge}>
              {uploadingAvatar
                ? <ActivityIndicator size="small" color={Colors.background.light} />
                : <Ionicons name="camera" size={14} color={Colors.background.light} />}
            </View>
          )}
        </TouchableOpacity>
        <Text style={localStyles.avatarName}>{customerInfo?.name}</Text>
        {customerInfo?.phone ? <Text style={localStyles.avatarPhone}>{customerInfo.phone}</Text> : null}
      </View>

      {/* Info rows */}
      <View style={localStyles.infoCard}>
        <InfoRow icon="call-outline" label="Điện thoại" value={customerInfo?.phone || 'Chưa có'} />
        {customerInfo?.email ? <InfoRow icon="mail-outline" label="Email" value={customerInfo.email} /> : null}
        <InfoRow icon="receipt-outline" label="Tổng đơn" value={String(customerInfo?.totalOrders ?? 0)} />
        <InfoRow icon="time-outline" label="Đang xử lý" value={String(customerInfo?.activeOrders ?? 0)} highlight />
        <InfoRow icon="car-outline" label="Số xe" value={String(customerInfo?.vehicles ?? 0)} />
      </View>

      {/* Admin actions */}
      {isAdminManager && (
        <View style={localStyles.actionsCard}>
          <TouchableOpacity style={localStyles.actionRow} onPress={() => setShowEditModal(true)}>
            <Ionicons name="create-outline" size={20} color={Colors.primary} />
            <Text style={localStyles.actionText}>Sửa thông tin</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.text.secondary} />
          </TouchableOpacity>
          <View style={localStyles.actionDivider} />
          <TouchableOpacity style={localStyles.actionRow} onPress={handleUploadAvatar}>
            <Ionicons name="camera-outline" size={20} color={Colors.primary} />
            <Text style={localStyles.actionText}>Cập nhật ảnh đại diện</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.text.secondary} />
          </TouchableOpacity>
          <View style={localStyles.actionDivider} />
          <TouchableOpacity style={[localStyles.actionRow, localStyles.actionRowDanger]} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color={Colors.status.error} />
            <Text style={[localStyles.actionText, localStyles.actionTextDanger]}>Xóa khách hàng</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.status.error} />
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );

  const renderVehiclesTab = () => (
    <FlatList
      data={adminVehicles}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={localStyles.tabContent}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={autoRefreshing || queryRefreshing} onRefresh={handleRefresh} />}
      ListHeaderComponent={
        isAdminManager ? (
          <TouchableOpacity style={localStyles.addBtn} onPress={() => setShowAddVehicleModal(true)}>
            <Ionicons name="add-circle-outline" size={18} color={Colors.primary} />
            <Text style={localStyles.addBtnText}>Thêm xe mới</Text>
          </TouchableOpacity>
        ) : null
      }
      ListEmptyComponent={
        <View style={localStyles.emptyState}>
          <Ionicons name="car-outline" size={40} color={Colors.text.secondary} />
          <Text style={localStyles.emptyTitle}>Chưa có xe nào</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={localStyles.vehicleCard}>
          <View style={localStyles.vehicleHeader}>
            <Ionicons name="car-sport-outline" size={20} color={Colors.primary} />
            <Text style={localStyles.vehiclePlate}>{item.license_plate}</Text>
          </View>
          {item.model ? <Text style={localStyles.vehicleMeta}>Mẫu xe: {item.model}</Text> : null}
          <Text style={localStyles.vehicleMeta}>
            Ngày tạo: {item.created_at ? new Date(item.created_at).toLocaleDateString('vi-VN') : 'N/A'}
          </Text>
        </View>
      )}
      initialNumToRender={PerformanceConfig.flatList.initialNumToRender}
      maxToRenderPerBatch={PerformanceConfig.flatList.maxToRenderPerBatch}
      windowSize={PerformanceConfig.flatList.windowSize}
      removeClippedSubviews={PerformanceConfig.flatList.removeClippedSubviews}
    />
  );

  const renderLicenseTab = () => {
    const licenseNumber = String(adminLicense?.license_number || adminLicense?.number || '');
    const expiryDate = String(adminLicense?.expiry_date || adminLicense?.license_expiry_date || '');

    return (
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={localStyles.tabContent}
        refreshControl={<RefreshControl refreshing={autoRefreshing || queryRefreshing} onRefresh={handleRefresh} />}
      >
        {adminLicenseQuery.isLoading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: spacing['3xl'] }} />
        ) : adminLicense ? (
          <View style={localStyles.infoCard}>
            <InfoRow icon="card-outline" label="Số bằng lái" value={licenseNumber || 'Chưa có'} />
            {expiryDate ? <InfoRow icon="calendar-outline" label="Ngày hết hạn" value={expiryDate} /> : null}
          </View>
        ) : (
          <View style={localStyles.emptyState}>
            <Ionicons name="card-outline" size={40} color={Colors.text.secondary} />
            <Text style={localStyles.emptyTitle}>Chưa có thông tin bằng lái</Text>
          </View>
        )}

        {isAdminManager && (
          <View style={localStyles.actionsCard}>
            <TouchableOpacity style={localStyles.actionRow} onPress={() => setShowLicenseModal(true)}>
              <Ionicons name="create-outline" size={20} color={Colors.primary} />
              <Text style={localStyles.actionText}>{adminLicense ? 'Cập nhật bằng lái' : 'Thêm bằng lái'}</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.text.secondary} />
            </TouchableOpacity>
            {adminLicense && (
              <>
                <View style={localStyles.actionDivider} />
                <TouchableOpacity style={[localStyles.actionRow, localStyles.actionRowDanger]} onPress={handleDeleteLicense}>
                  <Ionicons name="trash-outline" size={20} color={Colors.status.error} />
                  <Text style={[localStyles.actionText, localStyles.actionTextDanger]}>Xóa bằng lái</Text>
                  <Ionicons name="chevron-forward" size={16} color={Colors.status.error} />
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </ScrollView>
    );
  };

  const renderOrdersTab = () => {
    const orders = isAdminManager ? adminOrders : customerOrders;
    return (
      <FlatList
        data={orders as any[]}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={localStyles.tabContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={autoRefreshing || queryRefreshing} onRefresh={handleRefresh} />}
        ListEmptyComponent={
          <View style={localStyles.emptyState}>
            <Ionicons name="receipt-outline" size={40} color={Colors.text.secondary} />
            <Text style={localStyles.emptyTitle}>Chưa có đơn hàng nào</Text>
          </View>
        }
        renderItem={({ item }) => (
          <ServiceOrderCard
            serviceName={getServiceName(item)}
            secondaryName={`Ngày nhận: ${new Date(item.receive_date).toLocaleDateString('vi-VN')}`}
            receiveDate={item.receive_date}
            scheduleDate={item.delivery_date || 'Chưa xác định'}
            status={item.status}
            onPress={() => handleOrderPress(String(item.id))}
          />
        )}
        initialNumToRender={PerformanceConfig.flatList.initialNumToRender}
        maxToRenderPerBatch={PerformanceConfig.flatList.maxToRenderPerBatch}
        windowSize={PerformanceConfig.flatList.windowSize}
        removeClippedSubviews={PerformanceConfig.flatList.removeClippedSubviews}
      />
    );
  };

  return (
    <Screen
      headerTitle="Chi tiết khách hàng"
      showBackButton
      safeAreaTopColor={Colors.primary}
      statusBarStyle="light-content"
      useScrollView={false}
    >
      {/* Tab bar */}
      <View style={localStyles.tabBar}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[localStyles.tabItem, isActive && localStyles.tabItemActive]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={tab.icon as any}
                size={16}
                color={isActive ? Colors.primary : Colors.text.secondary}
              />
              <Text style={[localStyles.tabLabel, isActive && localStyles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Tab content */}
      <View style={{ flex: 1 }}>
        {activeTab === 'info' && renderInfoTab()}
        {activeTab === 'vehicles' && renderVehiclesTab()}
        {activeTab === 'license' && renderLicenseTab()}
        {activeTab === 'orders' && renderOrdersTab()}
      </View>

      {/* Modals */}
      {showEditModal && adminCustomer && (
        <EditCustomerModal
          customer={adminCustomer}
          onClose={() => setShowEditModal(false)}
          onSave={handleEdit}
        />
      )}
      {showAddVehicleModal && (
        <AddVehicleModal
          onClose={() => setShowAddVehicleModal(false)}
          onSave={handleAddVehicle}
        />
      )}
      {showLicenseModal && (
        <DriverLicenseModal
          existing={adminLicense}
          onClose={() => setShowLicenseModal(false)}
          onSave={handleSaveLicense}
        />
      )}
    </Screen>
  );
};

export default CustomerDetailScreen;

// ─── InfoRow helper ───────────────────────────────────────────────────────────
function InfoRow({
  icon,
  label,
  value,
  highlight,
}: {
  icon: string;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={localStyles.infoRow}>
      <Ionicons name={icon as any} size={16} color={highlight ? Colors.primary : Colors.text.secondary} />
      <Text style={localStyles.infoLabel}>{label}</Text>
      <Text style={[localStyles.infoValue, highlight && localStyles.infoValueHighlight]}>{value}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const localStyles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.background.light,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    gap: 2,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: Colors.primary,
  },
  tabLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.xs,
    color: Colors.text.secondary,
  },
  tabLabelActive: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.bold,
  },
  tabContent: {
    padding: spacing.base,
    gap: spacing.base,
    paddingBottom: spacing['3xl'],
  },
  // Avatar
  avatarSection: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.base,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.background.light,
  },
  avatarName: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.xl,
    color: Colors.text.primary,
    fontWeight: Typography.weight.bold,
  },
  avatarPhone: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.text.secondary,
  },
  // Info card
  infoCard: {
    backgroundColor: Colors.background.light,
    borderRadius: borderRadius['2xl'],
    borderWidth: 1,
    borderColor: Colors.border.light,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
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
    flexShrink: 1,
  },
  infoValueHighlight: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.bold,
  },
  // Actions card
  actionsCard: {
    backgroundColor: Colors.background.light,
    borderRadius: borderRadius['2xl'],
    borderWidth: 1,
    borderColor: Colors.border.light,
    overflow: 'hidden',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  actionRowDanger: {},
  actionText: {
    flex: 1,
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.base,
    color: Colors.text.primary,
  },
  actionTextDanger: {
    color: Colors.status.error,
  },
  actionDivider: {
    height: 1,
    backgroundColor: Colors.border.light,
    marginLeft: spacing.base + 20 + spacing.sm,
  },
  // Add button
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: Colors.primarySoft,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    marginBottom: spacing.sm,
  },
  addBtnText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.primary,
  },
  // Vehicle card
  vehicleCard: {
    backgroundColor: Colors.background.light,
    borderRadius: borderRadius['2xl'],
    padding: spacing.base,
    borderWidth: 1,
    borderColor: Colors.border.light,
    gap: spacing.xs,
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  vehiclePlate: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.base,
    color: Colors.text.primary,
    fontWeight: Typography.weight.bold,
  },
  vehicleMeta: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.text.secondary,
  },
  // Empty state
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['4xl'],
    gap: spacing.sm,
  },
  emptyTitle: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.base,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});

// ─── Modal styles ─────────────────────────────────────────────────────────────
const modalStyles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  sheet: {
    backgroundColor: Colors.background.light,
    borderTopLeftRadius: borderRadius['3xl'] ?? 24,
    borderTopRightRadius: borderRadius['3xl'] ?? 24,
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
  field: {
    gap: spacing.xs,
  },
  label: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.text.secondary,
  },
  input: {
    backgroundColor: Colors.background.secondary,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.base,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border.light,
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
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.base,
    color: Colors.background.light,
    fontWeight: Typography.weight.bold,
  },
});
