import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Screen, FormContainer } from '../../components/layout';
import TextInput from '../../components/TextInput/TextInput';
import DateInput from '../../components/TextInput/DateInput';
import { Button } from '../../components/ui';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typo';
import { spacing } from '../../design-system/spacing';
import { textStyles } from '../../design-system/typography';
import { AppStackParamList } from '../../navigation/AppNavigator';
import { useAppSelector } from '../../redux/hooks/useAppSelector';
import { useGetVehicleByIdQuery, useUpdateVehicleMutation } from '../../services/vehicleApi';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

interface VehicleEditScreenProps {
  route: {
    params: {
      vehicleId: string;
      licensePlate: string;
    };
  };
}

const formatDisplayDate = (value?: string | null) => {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString('vi-VN');
};

const toBackendDate = (value: string): string | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmed);
  if (match) {
    const [, dd, mm, yyyy] = match;
    return `${yyyy}-${mm}-${dd}`;
  }

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    const yyyy = parsed.getFullYear();
    const mm = String(parsed.getMonth() + 1).padStart(2, '0');
    const dd = String(parsed.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  return trimmed;
};

const normalizeText = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

const VEHICLE_DOCUMENT_MIN_DATE = new Date(2000, 0, 1);
const VEHICLE_DOCUMENT_MAX_DATE = new Date(2100, 11, 31);

const VehicleEditScreen: React.FC<VehicleEditScreenProps> = ({ route }) => {
  const { vehicleId, licensePlate } = route.params;
  const navigation = useNavigation<NavigationProp>();
  const userId = useAppSelector((state) => state.auth.userId || '');
  const hasGarageContext = useAppSelector(
    (state) => Boolean(state.garageContext.garageCode && state.garageContext.resolved),
  );
  const garageCode = useAppSelector((state) => state.garageContext.garageCode || '');
  const garageId = useAppSelector((state) => state.garageContext.garageId || '');

  const { data: vehicle, isLoading } = useGetVehicleByIdQuery(vehicleId, {
    skip: !hasGarageContext,
  });
  const [updateVehicle, { isLoading: isSaving }] = useUpdateVehicleMutation();

  const [model, setModel] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseExpiryDate, setLicenseExpiryDate] = useState('');
  const [inspectionCertificateNumber, setInspectionCertificateNumber] = useState('');
  const [inspectionDate, setInspectionDate] = useState('');
  const [inspectionExpiryDate, setInspectionExpiryDate] = useState('');
  const [insuranceCompany, setInsuranceCompany] = useState('');
  const [insuranceStartDate, setInsuranceStartDate] = useState('');
  const [insuranceExpiryDate, setInsuranceExpiryDate] = useState('');

  useEffect(() => {
    if (!hasGarageContext) {
      navigation.replace('SelectGarage');
    }
  }, [hasGarageContext, navigation]);

  useEffect(() => {
    if (!vehicle) return;

    setModel(vehicle.model || '');
    setLicenseNumber(vehicle.license_number || '');
    setLicenseExpiryDate(formatDisplayDate(vehicle.license_expiry_date));
    setInspectionCertificateNumber(vehicle.inspection_certificate_number || '');
    setInspectionDate(formatDisplayDate(vehicle.inspection_date));
    setInspectionExpiryDate(formatDisplayDate(vehicle.inspection_expiry_date));
    setInsuranceCompany(vehicle.insurance_company || '');
    setInsuranceStartDate(formatDisplayDate(vehicle.insurance_start_date));
    setInsuranceExpiryDate(formatDisplayDate(vehicle.insurance_expiry_date));
  }, [vehicle]);

  const handleSave = async () => {
    if (!vehicle) return;
    if (!userId) {
      Alert.alert('Lỗi', 'Không tìm thấy customer_id để cập nhật xe.');
      return;
    }
    if (!garageCode && !garageId) {
      Alert.alert('Lỗi', 'Không tìm thấy gara hiện tại để cập nhật xe.');
      return;
    }

    try {
      if (!toBackendDate(licenseExpiryDate)) {
        Alert.alert('Lỗi', 'Vui lòng nhập ngày hết hạn bằng lái xe.');
        return;
      }

      if (!inspectionCertificateNumber.trim() || !toBackendDate(inspectionDate) || !toBackendDate(inspectionExpiryDate)) {
        Alert.alert('Lỗi', 'Vui lòng nhập đủ thông tin đăng kiểm.');
        return;
      }

      if (!insuranceCompany.trim() || !toBackendDate(insuranceStartDate) || !toBackendDate(insuranceExpiryDate)) {
        Alert.alert('Lỗi', 'Vui lòng nhập đủ thông tin bảo hiểm.');
        return;
      }

      await updateVehicle({
        id: vehicle.id.toString(),
        garageCode,
        customer_id: userId,
        garage_code: garageCode || null,
        garage_id: garageId || null,
        model: normalizeText(model),
        license_number: normalizeText(licenseNumber),
        license_expiry_date: toBackendDate(licenseExpiryDate),
        inspection_certificate_number: normalizeText(inspectionCertificateNumber),
        inspection_date: toBackendDate(inspectionDate),
        inspection_expiry_date: toBackendDate(inspectionExpiryDate),
        insurance_company: normalizeText(insuranceCompany),
        insurance_start_date: toBackendDate(insuranceStartDate),
        insurance_expiry_date: toBackendDate(insuranceExpiryDate),
      }).unwrap();

      Alert.alert('Thành công', 'Đã cập nhật thông tin xe.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      console.error('VehicleEditScreen: update failed', error);
      Alert.alert('Lỗi', error?.data?.error || error?.message || 'Không thể cập nhật thông tin xe.');
    }
  };

  if (!hasGarageContext) {
    return null;
  }

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
    <Screen
      headerTitle="Cập nhật thông tin xe"
      showBackButton
      backgroundColor={Colors.background.muted}
      statusBarStyle="light-content"
      useScrollView={false}
    >
      <FormContainer
        keyboardAvoiding
        withScroll={false}
        paddingCustom={{ horizontal: 0, top: 0, bottom: 0 }}
        backgroundColor={Colors.background.muted}
        contentContainerStyle={styles.formContent}
        dismissKeyboardOnPress={false}
      >
        <View style={styles.screenContent}>
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            showsVerticalScrollIndicator={false}
            bounces
          >
            <View style={styles.heroContainer}>
              <View style={styles.heroSurface}>
                <View style={styles.heroDecorativeContainer}>
                  <View style={[styles.heroDecorativeCircle, styles.heroCircle1]} />
                  <View style={[styles.heroDecorativeCircle, styles.heroCircle2]} />
                </View>
                <View style={styles.heroContent}>
                  <View style={styles.heroIconWrap}>
                    <Ionicons name="car-sport-outline" size={34} color={Colors.background.light} />
                  </View>
                  <View style={styles.heroText}>
                    <Text style={styles.heroTitle}>{vehicle.license_plate || licensePlate}</Text>
                    <Text style={styles.heroSubtitle}>{vehicle.model || 'Chưa cập nhật model'}</Text>
                  </View>
                </View>
              </View>
            </View>

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

                  <View style={styles.fieldBlock}>
                    <Text style={styles.fieldLabel}>Model</Text>
                    <TextInput
                      value={model}
                      onChangeText={setModel}
                      placeholder="Nhập model xe"
                      style={styles.input}
                    />
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
                    <TextInput
                      value={licenseNumber}
                      onChangeText={setLicenseNumber}
                      placeholder="Nhập số bằng lái xe"
                      style={styles.input}
                    />
                  </View>

                  <View style={styles.fieldBlockLast}>
                    <DateInput
                      value={licenseExpiryDate}
                      onChangeText={setLicenseExpiryDate}
                      placeholder="Chọn ngày hết hạn bằng lái"
                      label="Ngày hết hạn bằng lái"
                      fullWidth
                      style={styles.dateInput}
                      minimumDate={VEHICLE_DOCUMENT_MIN_DATE}
                      maximumDate={VEHICLE_DOCUMENT_MAX_DATE}
                    />
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
                    <TextInput
                      value={inspectionCertificateNumber}
                      onChangeText={setInspectionCertificateNumber}
                      placeholder="Nhập số chứng nhận đăng kiểm"
                      style={styles.input}
                    />
                  </View>

                  <View style={styles.fieldBlock}>
                    <DateInput
                      value={inspectionDate}
                      onChangeText={setInspectionDate}
                      placeholder="Chọn ngày đăng kiểm"
                      label="Ngày đăng kiểm"
                      fullWidth
                      style={styles.dateInput}
                      minimumDate={VEHICLE_DOCUMENT_MIN_DATE}
                      maximumDate={VEHICLE_DOCUMENT_MAX_DATE}
                    />
                  </View>

                  <View style={styles.fieldBlockLast}>
                    <DateInput
                      value={inspectionExpiryDate}
                      onChangeText={setInspectionExpiryDate}
                      placeholder="Chọn ngày hết hạn đăng kiểm"
                      label="Ngày hết hạn đăng kiểm"
                      fullWidth
                      style={styles.dateInput}
                      minimumDate={VEHICLE_DOCUMENT_MIN_DATE}
                      maximumDate={VEHICLE_DOCUMENT_MAX_DATE}
                    />
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
                    <TextInput
                      value={insuranceCompany}
                      onChangeText={setInsuranceCompany}
                      placeholder="Nhập đơn vị bảo hiểm"
                      style={styles.input}
                    />
                  </View>

                  <View style={styles.fieldBlock}>
                    <DateInput
                      value={insuranceStartDate}
                      onChangeText={setInsuranceStartDate}
                      placeholder="Chọn ngày bắt đầu bảo hiểm"
                      label="Ngày bắt đầu bảo hiểm"
                      fullWidth
                      style={styles.dateInput}
                      minimumDate={VEHICLE_DOCUMENT_MIN_DATE}
                      maximumDate={VEHICLE_DOCUMENT_MAX_DATE}
                    />
                  </View>

                  <View style={styles.fieldBlockLast}>
                    <DateInput
                      value={insuranceExpiryDate}
                      onChangeText={setInsuranceExpiryDate}
                      placeholder="Chọn ngày hết hạn bảo hiểm"
                      label="Ngày hết hạn bảo hiểm"
                      fullWidth
                      style={styles.dateInput}
                      minimumDate={VEHICLE_DOCUMENT_MIN_DATE}
                      maximumDate={VEHICLE_DOCUMENT_MAX_DATE}
                    />
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.stickyFooter}>
            <Button
              title={isSaving ? 'Đang lưu...' : 'Cập nhật thông tin xe'}
              onPress={handleSave}
              loading={isSaving}
              disabled={isSaving}
              variant="primary"
              fullWidth
            />
          </View>
        </View>
      </FormContainer>
    </Screen>
  );
};

const styles = StyleSheet.create({
  loadingRoot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.muted,
  },
  emptyText: {
    ...textStyles.body,
    color: Colors.text.secondary,
  },
  formContent: {
    flex: 1,
  },
  screenContent: {
    flex: 1,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  heroContainer: {
    minHeight: 180,
  },
  heroSurface: {
    backgroundColor: Colors.primary,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: 52,
    overflow: 'hidden',
  },
  heroDecorativeContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.12,
  },
  heroDecorativeCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: Colors.background.light,
  },
  heroCircle1: {
    width: 180,
    height: 180,
    top: -70,
    right: -46,
  },
  heroCircle2: {
    width: 120,
    height: 120,
    bottom: 10,
    left: -34,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  heroIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.alpha.white18,
    borderWidth: 1,
    borderColor: Colors.alpha.white20,
    marginRight: spacing.lg,
  },
  heroText: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 28,
    lineHeight: 32,
    color: Colors.background.light,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: '700',
  },
  heroSubtitle: {
    ...textStyles.body,
    color: Colors.alpha.white85,
    marginTop: 4,
  },
  sheet: {
    marginTop: -28,
    backgroundColor: Colors.background.light,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    minHeight: 420,
  },
  sheetContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing['2xl'],
    gap: spacing.lg,
  },
  sectionCard: {
    backgroundColor: Colors.surface.elevated,
    borderRadius: 24,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: Colors.alpha.primary12,
    shadowColor: Colors.shadow.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    backgroundColor: Colors.primarySoft,
    borderWidth: 1,
    borderColor: Colors.alpha.primary12,
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 22,
    fontFamily: Typography.fontFamily.semibold,
    fontWeight: Typography.weight.semibold,
    color: Colors.text.primary,
  },
  readonlyRow: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: Colors.primarySoft,
    marginBottom: spacing.lg,
  },
  readonlyLabel: {
    ...textStyles.bodySmall,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  readonlyValue: {
    ...textStyles.bodyStrong,
    fontFamily: Typography.fontFamily.semibold,
    fontWeight: Typography.weight.semibold,
    color: Colors.primary,
  },
  fieldBlock: {
    marginBottom: spacing.md,
  },
  fieldBlockLast: {
    marginBottom: 0,
  },
  fieldLabel: {
    ...textStyles.bodySmall,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: Typography.weight.medium,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  input: {
    marginBottom: 0,
  },
  dateInput: {
    marginBottom: 0,
  },
  stickyFooter: {
    backgroundColor: Colors.background.muted,
    borderTopWidth: 1,
    borderTopColor: Colors.alpha.primary12,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
});

export default VehicleEditScreen;
