import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Image, TouchableOpacity } from 'react-native';

import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Screen, FormContainer } from '../../components/layout';
import TextInput from '../../components/TextInput/TextInput';
import DateInput from '../../components/TextInput/DateInput';
import { Button } from '../../components/ui';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typo';
import { spacing } from '../../design-system/spacing';
import { textStyles } from '../../design-system/typography';
import { VEHICLE_DOCUMENT_MAX_DATE, VEHICLE_DOCUMENT_MIN_DATE, useVehicleEditScreen } from './useVehicleEditScreen';

interface VehicleEditScreenProps {
  route: {
    params: {
      vehicleId: string;
      licensePlate: string;
    };
  };
}

const VehicleEditScreen: React.FC<VehicleEditScreenProps> = ({ route }) => {
  const { vehicleId } = route.params;
  const {
    vehicle,
    isLoading,
    isSaving,
    hasGarageContext,
    model,
    setModel,
    licenseNumber,
    setLicenseNumber,
    licenseExpiryDate,
    setLicenseExpiryDate,
    inspectionCertificateNumber,
    setInspectionCertificateNumber,
    inspectionDate,
    setInspectionDate,
    inspectionExpiryDate,
    setInspectionExpiryDate,
    insuranceCompany,
    setInsuranceCompany,
    insuranceStartDate,
    setInsuranceStartDate,
    insuranceExpiryDate,
    setInsuranceExpiryDate,
    vehicleImageUri,
    handlePickVehicleImage,
    handleSave,
  } = useVehicleEditScreen(vehicleId);

  if (!hasGarageContext) return null;

  if (isLoading && !vehicle) {
    return (
      <View style={styles.loadingRoot}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!vehicle) {
    return (
      <View style={styles.loadingRoot}>
        <Text style={styles.emptyText}>Không tìm thấy thông tin xe</Text>
      </View>
    );
  }

  return (
    <Screen headerTitle="Cập nhật thông tin xe" showBackButton backgroundColor={Colors.background.muted} statusBarStyle="light-content" useScrollView={false}>
      <FormContainer keyboardAvoiding withScroll={false} paddingCustom={{ horizontal: 0, top: 0, bottom: 0 }} backgroundColor={Colors.background.muted} contentContainerStyle={styles.formContent} dismissKeyboardOnPress={false}>
        <View style={styles.screenContent}>
          <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive" showsVerticalScrollIndicator={false} bounces>
            <View style={styles.sheet}>
              <View style={styles.sheetContent}>
                <View style={styles.sectionCard}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionIconWrap}>
                      <Ionicons name="car-outline" size={20} color={Colors.primary} />
                    </View>
                    <Text style={styles.sectionTitle}>Thông tin xe</Text>
                  </View>

                  <View style={styles.readonlyRow}>
                    <Text style={styles.readonlyLabel}>Biển số xe</Text>
                    <Text style={styles.readonlyValue}>{vehicle.license_plate}</Text>
                  </View>

                  <View style={styles.vehicleImageSection}>
                    <Text style={styles.fieldLabel}>Ảnh xe</Text>
                    <TouchableOpacity style={styles.vehicleImagePicker} onPress={handlePickVehicleImage} activeOpacity={0.85}>
                      {vehicleImageUri ? (
                        <Image source={{ uri: vehicleImageUri }} style={styles.vehicleImagePreview} resizeMode="cover" />
                      ) : (
                        <View style={styles.vehicleImagePlaceholder}>
                          <Ionicons name="image-outline" size={28} color={Colors.primary} />
                          <Text style={styles.vehicleImagePlaceholderText}>Thêm ảnh xe</Text>
                        </View>
                      )}
                      <View style={styles.vehicleImageEditBadge}>
                        <Ionicons name="camera-outline" size={14} color={Colors.background.light} />
                        <Text style={styles.vehicleImageEditBadgeText}>Đổi ảnh</Text>
                      </View>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.fieldBlock}>
                    <Text style={styles.fieldLabel}>Model</Text>
                    <TextInput value={model} onChangeText={setModel} placeholder="Nhập model xe" style={styles.input} />
                  </View>
                </View>

                <View style={styles.sectionCard}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionIconWrap}>
                      <Ionicons name="document-text-outline" size={20} color={Colors.primary} />
                    </View>
                    <Text style={styles.sectionTitle}>Bằng lái xe</Text>
                  </View>

                  <View style={styles.fieldBlock}>
                    <Text style={styles.fieldLabel}>Số bằng lái xe</Text>
                    <TextInput value={licenseNumber} onChangeText={setLicenseNumber} placeholder="Nhập số bằng lái xe" style={styles.input} />
                  </View>

                  <View style={styles.fieldBlockLast}>
                    <DateInput value={licenseExpiryDate} onChangeText={setLicenseExpiryDate} placeholder="Chọn ngày hết hạn bằng lái" label="Ngày hết hạn bằng lái" fullWidth style={styles.dateInput} minimumDate={VEHICLE_DOCUMENT_MIN_DATE} maximumDate={VEHICLE_DOCUMENT_MAX_DATE} />
                  </View>
                </View>

                <View style={styles.sectionCard}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionIconWrap}>
                      <Ionicons name="shield-checkmark-outline" size={20} color={Colors.primary} />
                    </View>
                    <Text style={styles.sectionTitle}>Đăng kiểm</Text>
                  </View>

                  <View style={styles.fieldBlock}>
                    <Text style={styles.fieldLabel}>Số chứng nhận đăng kiểm</Text>
                    <TextInput value={inspectionCertificateNumber} onChangeText={setInspectionCertificateNumber} placeholder="Nhập số chứng nhận đăng kiểm" style={styles.input} />
                  </View>

                  <View style={styles.fieldBlock}>
                    <DateInput value={inspectionDate} onChangeText={setInspectionDate} placeholder="Chọn ngày đăng kiểm" label="Ngày đăng kiểm" fullWidth style={styles.dateInput} minimumDate={VEHICLE_DOCUMENT_MIN_DATE} maximumDate={VEHICLE_DOCUMENT_MAX_DATE} />
                  </View>

                  <View style={styles.fieldBlockLast}>
                    <DateInput value={inspectionExpiryDate} onChangeText={setInspectionExpiryDate} placeholder="Chọn ngày hết hạn đăng kiểm" label="Ngày hết hạn đăng kiểm" fullWidth style={styles.dateInput} minimumDate={VEHICLE_DOCUMENT_MIN_DATE} maximumDate={VEHICLE_DOCUMENT_MAX_DATE} />
                  </View>
                </View>

                <View style={styles.sectionCard}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionIconWrap}>
                      <Ionicons name="card-outline" size={20} color={Colors.primary} />
                    </View>
                    <Text style={styles.sectionTitle}>Bảo hiểm</Text>
                  </View>

                  <View style={styles.fieldBlock}>
                    <Text style={styles.fieldLabel}>Đơn vị bảo hiểm</Text>
                    <TextInput value={insuranceCompany} onChangeText={setInsuranceCompany} placeholder="Nhập đơn vị bảo hiểm" style={styles.input} />
                  </View>

                  <View style={styles.fieldBlock}>
                    <DateInput value={insuranceStartDate} onChangeText={setInsuranceStartDate} placeholder="Chọn ngày bắt đầu bảo hiểm" label="Ngày bắt đầu bảo hiểm" fullWidth style={styles.dateInput} minimumDate={VEHICLE_DOCUMENT_MIN_DATE} maximumDate={VEHICLE_DOCUMENT_MAX_DATE} />
                  </View>

                  <View style={styles.fieldBlockLast}>
                    <DateInput value={insuranceExpiryDate} onChangeText={setInsuranceExpiryDate} placeholder="Chọn ngày hết hạn bảo hiểm" label="Ngày hết hạn bảo hiểm" fullWidth style={styles.dateInput} minimumDate={VEHICLE_DOCUMENT_MIN_DATE} maximumDate={VEHICLE_DOCUMENT_MAX_DATE} />
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.stickyFooter}>
            <Button title={isSaving ? 'Đang lưu...' : 'Cập nhật thông tin xe'} onPress={handleSave} loading={isSaving} disabled={isSaving} variant="primary" fullWidth />
          </View>
        </View>
      </FormContainer>
    </Screen>
  );
};

const styles = StyleSheet.create({
  loadingRoot: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background.muted },
  emptyText: { ...textStyles.body, color: Colors.text.secondary },
  formContent: { flex: 1 },
  screenContent: { flex: 1 },
  scrollArea: { flex: 1 },
  scrollContent: { paddingBottom: spacing.xl },
  sheet: { marginTop: -28, backgroundColor: Colors.background.light, borderTopLeftRadius: 28, borderTopRightRadius: 28, minHeight: 420 },
  sheetContent: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing['2xl'], gap: spacing.lg },
  sectionCard: { backgroundColor: Colors.surface.elevated, borderRadius: 24, padding: spacing.lg, borderWidth: 1, borderColor: Colors.alpha.primary12, shadowColor: Colors.shadow.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  sectionIconWrap: { width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md, backgroundColor: Colors.primarySoft, borderWidth: 1, borderColor: Colors.alpha.primary12 },
  sectionTitle: { fontSize: 18, lineHeight: 22, fontFamily: Typography.fontFamily.semibold, fontWeight: Typography.weight.semibold, color: Colors.text.primary },
  readonlyRow: { paddingVertical: 12, paddingHorizontal: 14, borderRadius: 16, backgroundColor: Colors.primarySoft, marginBottom: spacing.lg },
  readonlyLabel: { ...textStyles.bodySmall, color: Colors.text.secondary, marginBottom: 4 },
  readonlyValue: { ...textStyles.bodyStrong, fontFamily: Typography.fontFamily.semibold, fontWeight: Typography.weight.semibold, color: Colors.primary },
  fieldBlock: { marginBottom: spacing.md },
  fieldBlockLast: { marginBottom: 0 },
  vehicleImageSection: { marginBottom: spacing.lg },
  vehicleImagePicker: { position: 'relative', borderRadius: 18, overflow: 'hidden', backgroundColor: Colors.neutral[50], borderWidth: 1, borderColor: Colors.alpha.primary12, minHeight: 180 },
  vehicleImagePreview: { width: '100%', height: 180 },
  vehicleImagePlaceholder: { height: 180, alignItems: 'center', justifyContent: 'center', gap: 8 },
  vehicleImagePlaceholderText: { ...textStyles.bodySmall, color: Colors.text.secondary, fontFamily: Typography.fontFamily.medium, fontWeight: Typography.weight.medium },
  vehicleImageEditBadge: { position: 'absolute', right: 12, bottom: 12, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: Colors.alpha.black60 },
  vehicleImageEditBadgeText: { fontSize: 11, fontWeight: '700', color: Colors.background.light },
  fieldLabel: { ...textStyles.bodySmall, fontFamily: Typography.fontFamily.medium, fontWeight: Typography.weight.medium, color: Colors.text.secondary, marginBottom: 8 },
  input: { marginBottom: 0 },
  dateInput: { marginBottom: 0 },
  stickyFooter: { backgroundColor: Colors.background.muted, borderTopWidth: 1, borderTopColor: Colors.alpha.primary12, paddingHorizontal: spacing.xl, paddingTop: spacing.md },
});

export default VehicleEditScreen;
