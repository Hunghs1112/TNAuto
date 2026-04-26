import { useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { launchImageLibrary } from 'react-native-image-picker';

import { AppStackParamList } from '../../navigation/AppNavigator';
import { useAppSelector } from '../../redux/hooks/useAppSelector';
import { useGetVehicleByIdQuery, useUpdateVehicleMutation } from '../../services/vehicleApi';
import { useUploadSingleImageMutation } from '../../services/imageApi';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

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

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

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

export const VEHICLE_DOCUMENT_MIN_DATE = new Date(2000, 0, 1);
export const VEHICLE_DOCUMENT_MAX_DATE = new Date(2100, 11, 31);

export const useVehicleEditScreen = (vehicleId: string) => {
  const navigation = useNavigation<NavigationProp>();
  const userId = useAppSelector((state) => state.auth.userId || '');
  const hasGarageContext = useAppSelector((state) => Boolean(state.garageContext.garageCode && state.garageContext.resolved));
  const garageCode = useAppSelector((state) => state.garageContext.garageCode || '');
  const garageId = useAppSelector((state) => state.garageContext.garageId || '');

  const { data: vehicle, isLoading } = useGetVehicleByIdQuery(vehicleId, { skip: !hasGarageContext });
  const [updateVehicle, { isLoading: isSaving }] = useUpdateVehicleMutation();
  const [uploadSingleImage] = useUploadSingleImageMutation();

  const [model, setModel] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseExpiryDate, setLicenseExpiryDate] = useState('');
  const [inspectionCertificateNumber, setInspectionCertificateNumber] = useState('');
  const [inspectionDate, setInspectionDate] = useState('');
  const [inspectionExpiryDate, setInspectionExpiryDate] = useState('');
  const [insuranceCompany, setInsuranceCompany] = useState('');
  const [insuranceStartDate, setInsuranceStartDate] = useState('');
  const [insuranceExpiryDate, setInsuranceExpiryDate] = useState('');
  const [vehicleImageUri, setVehicleImageUri] = useState('');
  const [vehicleImageFileName, setVehicleImageFileName] = useState('');

  useEffect(() => {
    if (!hasGarageContext) navigation.replace('SelectGarage');
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
    setVehicleImageUri(vehicle.image_url || '');
    setVehicleImageFileName('');
  }, [vehicle]);

  const handlePickVehicleImage = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 1, quality: 0.85 });
    if (result.didCancel) return;

    const asset = result.assets?.[0];
    if (!asset?.uri) {
      Alert.alert('Lỗi', 'Không thể chọn ảnh xe.');
      return;
    }

    setVehicleImageUri(asset.uri);
    setVehicleImageFileName(asset.fileName || `vehicle-${Date.now()}.jpg`);
  };

  const uploadVehicleImage = async () => {
    if (!vehicle || !vehicleImageUri || vehicleImageUri === vehicle.image_url) return vehicle?.image_url || null;
    const formData = new FormData();
    formData.append('image', { uri: vehicleImageUri, type: 'image/jpeg', name: vehicleImageFileName || `vehicle-${Date.now()}.jpg` } as any);
    const response = await uploadSingleImage(formData).unwrap();
    return response.url;
  };

  const handleSave = async () => {
    if (!vehicle) return;
    if (!userId) return Alert.alert('Lỗi', 'Không tìm thấy customer_id để cập nhật xe.');
    if (!garageCode && !garageId) return Alert.alert('Lỗi', 'Không tìm thấy gara hiện tại để cập nhật xe.');

    const currentLicenseExpiryDate = toBackendDate(licenseExpiryDate);
    const currentInspectionCertificateNumber = normalizeText(inspectionCertificateNumber);
    const currentInspectionDate = toBackendDate(inspectionDate);
    const currentInspectionExpiryDate = toBackendDate(inspectionExpiryDate);
    const currentInsuranceCompany = normalizeText(insuranceCompany);
    const currentInsuranceStartDate = toBackendDate(insuranceStartDate);
    const currentInsuranceExpiryDate = toBackendDate(insuranceExpiryDate);

    if (!currentLicenseExpiryDate) return Alert.alert('Lỗi', 'Vui lòng nhập ngày hết hạn bằng lái xe.');
    if (!currentInspectionCertificateNumber || !currentInspectionDate || !currentInspectionExpiryDate) return Alert.alert('Lỗi', 'Vui lòng nhập đủ thông tin đăng kiểm.');
    if (!currentInsuranceCompany || !currentInsuranceStartDate || !currentInsuranceExpiryDate) return Alert.alert('Lỗi', 'Vui lòng nhập đủ thông tin bảo hiểm.');

    try {
      const uploadedImageUrl = await uploadVehicleImage();
      await updateVehicle({
        id: vehicle.id.toString(),
        garageCode,
        customer_id: userId,
        garage_code: garageCode || null,
        garage_id: garageId || null,
        model: normalizeText(model) ?? vehicle.model ?? null,
        image_url: uploadedImageUrl ?? vehicle.image_url ?? null,
        license_number: normalizeText(licenseNumber) ?? vehicle.license_number ?? null,
        license_expiry_date: currentLicenseExpiryDate ?? vehicle.license_expiry_date ?? null,
        inspection_certificate_number: currentInspectionCertificateNumber ?? vehicle.inspection_certificate_number ?? null,
        inspection_date: currentInspectionDate ?? vehicle.inspection_date ?? null,
        inspection_expiry_date: currentInspectionExpiryDate ?? vehicle.inspection_expiry_date ?? null,
        insurance_company: currentInsuranceCompany ?? vehicle.insurance_company ?? null,
        insurance_start_date: currentInsuranceStartDate ?? vehicle.insurance_start_date ?? null,
        insurance_expiry_date: currentInsuranceExpiryDate ?? vehicle.insurance_expiry_date ?? null,
      }).unwrap();
      Alert.alert('Thành công', 'Đã cập nhật thông tin xe.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (error: any) {
      console.error('VehicleEditScreen: update failed', error);
      Alert.alert('Lỗi', error?.data?.error || error?.message || 'Không thể cập nhật thông tin xe.');
    }
  };

  return {
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
  };
};
