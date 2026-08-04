import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppStackParamList } from '../../navigation/AppNavigator';
import { useAppSelector } from '../../redux/hooks/useAppSelector';
import { useGetVehicleByIdQuery, useUpdateVehicleMutation } from '../../services/vehicleApi';
import type { ImageItem } from '../../components/MultiImagePicker';

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

const TIME_INPUT_REGEX = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

const formatTimeInput = (value?: string | null) => {
  if (!value) return '';
  const trimmed = value.trim();
  if (!TIME_INPUT_REGEX.test(trimmed)) return '';
  return trimmed.slice(0, 5); // HH:mm
};

const isValidTimeInput = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return true;
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(trimmed);
};

const toBackendTime = (value: string): string | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(trimmed)) {
    throw new Error('invalid_time');
  }
  return `${trimmed}:00`;
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

  const [model, setModel] = useState('');
  const [productionYear, setProductionYear] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseExpiryDate, setLicenseExpiryDate] = useState('');
  const [inspectionCertificateNumber, setInspectionCertificateNumber] = useState('');
  const [inspectionDate, setInspectionDate] = useState('');
  const [inspectionExpiryDate, setInspectionExpiryDate] = useState('');
  const [insuranceCompany, setInsuranceCompany] = useState('');
  const [insuranceStartDate, setInsuranceStartDate] = useState('');
  const [insuranceRegisterTime, setInsuranceRegisterTime] = useState('');
  const [insuranceExpiryDate, setInsuranceExpiryDate] = useState('');
  const [insuranceExpiryTime, setInsuranceExpiryTime] = useState('');

  // Thay thế vehicleImageUri/vehicleImageFileName bằng ImageItem[]
  // MultiImagePicker xử lý upload nội bộ, hook chỉ cần đọc kết quả
  const [vehicleImages, setVehicleImages] = useState<ImageItem[]>([]);

  useEffect(() => {
    if (!hasGarageContext) navigation.replace('SelectGarage');
  }, [hasGarageContext, navigation]);

  useEffect(() => {
    if (!vehicle) return;
    setModel(vehicle.model || '');
    setProductionYear(vehicle.production_year?.toString() || '');
    setLicenseNumber(vehicle.license_number || '');
    setLicenseExpiryDate(formatDisplayDate(vehicle.license_expiry_date));
    setInspectionCertificateNumber(vehicle.inspection_certificate_number || '');
    setInspectionDate(formatDisplayDate(vehicle.inspection_date));
    setInspectionExpiryDate(formatDisplayDate(vehicle.inspection_expiry_date));
    setInsuranceCompany(vehicle.insurance_company || '');
    setInsuranceStartDate(formatDisplayDate(vehicle.insurance_start_date));
    setInsuranceRegisterTime(vehicle.insurance_register_time ? formatTimeInput(vehicle.insurance_register_time) : '');
    setInsuranceExpiryDate(formatDisplayDate(vehicle.insurance_expiry_date));
    setInsuranceExpiryTime(vehicle.insurance_expiry_time ? formatTimeInput(vehicle.insurance_expiry_time) : '');

    // Khởi tạo vehicleImages từ image_url hiện tại (nếu có)
    if (vehicle.image_url) {
      setVehicleImages([{
        id: `existing_${vehicle.id}`,
        uri: vehicle.image_url,
        uploadedUrl: vehicle.image_url,
        status: 'success',
      }]);
    } else {
      setVehicleImages([]);
    }
  }, [vehicle]);

  const handleSave = async () => {
    if (!vehicle) return;
    if (!userId) return Alert.alert('Lỗi', 'Không tìm thấy customer_id để cập nhật xe.');
    if (!garageCode && !garageId) return Alert.alert('Lỗi', 'Không tìm thấy gara hiện tại để cập nhật xe.');

    // Kiểm tra nếu có ảnh đang upload thì chờ
    const hasUploading = vehicleImages.some((img) => img.status === 'uploading');
    if (hasUploading) {
      return Alert.alert('Thông báo', 'Vui lòng chờ ảnh tải lên xong.');
    }

    // Lấy URL ảnh từ MultiImagePicker (uploadedUrl ưu tiên, fallback uri nếu là remote URL)
    const imageItem = vehicleImages[0];
    const uploadedImageUrl = imageItem?.uploadedUrl ?? imageItem?.uri ?? vehicle.image_url ?? null;

    // Tất cả trường tùy chọn — null khi rỗng, không bắt buộc
    const currentProductionYear = productionYear.trim() ? Number(productionYear.trim()) : null;
    const currentLicenseExpiryDate = toBackendDate(licenseExpiryDate);
    const currentInspectionCertificateNumber = normalizeText(inspectionCertificateNumber);
    const currentInspectionDate = toBackendDate(inspectionDate);
    const currentInspectionExpiryDate = toBackendDate(inspectionExpiryDate);
    const currentInsuranceCompany = normalizeText(insuranceCompany);
    const currentInsuranceStartDate = toBackendDate(insuranceStartDate);
    const currentInsuranceExpiryDate = toBackendDate(insuranceExpiryDate);

    if (productionYear.trim()) {
      const year = Number(productionYear.trim());
      const currentYear = new Date().getFullYear();
      if (!Number.isInteger(year) || year < 1886 || year > currentYear) {
        return Alert.alert('Lỗi', 'Năm sản xuất không hợp lệ.');
      }
    }

    if (!isValidTimeInput(insuranceRegisterTime)) {
      return Alert.alert('Lỗi', 'Giờ đăng ký bảo hiểm không hợp lệ. Định dạng HH:mm.');
    }
    if (!isValidTimeInput(insuranceExpiryTime)) {
      return Alert.alert('Lỗi', 'Giờ hết hạn bảo hiểm không hợp lệ. Định dạng HH:mm.');
    }

    let currentInsuranceRegisterTime: string | null;
    let currentInsuranceExpiryTime: string | null;
    try {
      currentInsuranceRegisterTime = toBackendTime(insuranceRegisterTime);
      currentInsuranceExpiryTime = toBackendTime(insuranceExpiryTime);
    } catch {
      return Alert.alert('Lỗi', 'Giờ bảo hiểm không hợp lệ. Định dạng HH:mm.');
    }

    try {
      await updateVehicle({
        id: vehicle.id.toString(),
        garageCode,
        customer_id: userId,
        garage_code: garageCode || null,
        garage_id: garageId || null,
        model: normalizeText(model) ?? null,
        production_year: currentProductionYear,
        image_url: uploadedImageUrl,
        license_number: normalizeText(licenseNumber) ?? null,
        license_expiry_date: currentLicenseExpiryDate,
        inspection_certificate_number: currentInspectionCertificateNumber,
        inspection_date: currentInspectionDate,
        inspection_expiry_date: currentInspectionExpiryDate,
        insurance_company: currentInsuranceCompany,
        insurance_start_date: currentInsuranceStartDate,
        insurance_register_time: currentInsuranceRegisterTime,
        insurance_expiry_date: currentInsuranceExpiryDate,
        insurance_expiry_time: currentInsuranceExpiryTime,
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
    productionYear,
    setProductionYear,
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
    insuranceRegisterTime,
    setInsuranceRegisterTime,
    insuranceExpiryDate,
    setInsuranceExpiryDate,
    insuranceExpiryTime,
    setInsuranceExpiryTime,
    vehicleImages,
    setVehicleImages,
    handleSave,
  };
};
