// src/screens/Booking/BookingScreen.tsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, Text, Alert, ActivityIndicator, RefreshControl } from "react-native";
import { Screen, FormContainer } from "../../components/layout";
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typo";
import ErrorView from "../../components/Loading/ErrorView";
import TextInputComponent from "../../components/TextInput/TextInput";
import DateInput from "../../components/TextInput/DateInput";
import NoteInput from "../../components/TextInput/NoteInput";
import SelectInput from "../../components/TextInput/SelectInput";
import { Button } from "../../components/ui";
import { AppStackParamList } from "../../navigation/AppNavigator";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppSelector } from "../../redux/hooks/useAppSelector";
import { useAppDispatch } from "../../redux/hooks/useAppDispatch";
import { RootState } from "../../redux/types";
import { setServices } from "../../redux/slices/servicesSlice";
import { useGetServicesQuery, useCreateOrderMutation } from "../../services/customerApi";
import { useGetCustomerVehiclesQuery } from "../../services/vehicleApi";
import { getCurrentDate, formatDateForAPI, formatSecondsToDaysHours } from "../../utils/dateHelpers";
import { styles } from "./styles";
import { useAutoRefresh } from "../../redux/hooks/useAutoRefresh";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;
type BookingScreenRouteProp = RouteProp<AppStackParamList, 'Booking'>;

interface ServiceItem {
  id: number;
  name: string;
  estimated_time?: number; // giây
  description?: string;
  image_url?: string | null;
}

interface InputFieldWithLabelProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  label: string;
  icon: string;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad" | "number-pad";
  editable?: boolean;
}

const InputFieldWithLabel: React.FC<InputFieldWithLabelProps> = React.memo(({
  value,
  onChangeText,
  placeholder,
  label,
  icon,
  keyboardType,
  editable = true,
}) => (
  <View style={styles.inputFieldContainer}>
    <View style={styles.labelRow}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={14} color={Colors.text.placeholder} />
      </View>
      <Text style={styles.label} numberOfLines={1}>{label}</Text>
    </View>
    <View style={styles.inputWrapper}>
      <TextInputComponent
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        placeholderTextColor={Colors.text.placeholder}
        textColor={Colors.text.primary}
        borderColor={Colors.neutral[300]}
        editable={editable}
      />
    </View>
  </View>
));

const BookingScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<BookingScreenRouteProp>();
  const dispatch = useAppDispatch();
  const { refreshing, onRefresh } = useAutoRefresh();
  const { isLoggedIn, userName, userPhone, userLicensePlate, userId } = useAppSelector((state: RootState) => state.auth);
  const { services, isFetching: servicesLoading } = useAppSelector((state: RootState) => state.services);
  const { data: servicesData, isLoading: servicesIsLoading, error: servicesError, refetch: refetchServices } = useGetServicesQuery();
  const { data: vehiclesData, isLoading: vehiclesLoading } = useGetCustomerVehiclesQuery({ phone: userPhone }, { skip: !userPhone });
  const [createOrder] = useCreateOrderMutation();

  // Get serviceId from route params
  const serviceIdFromRoute = route.params?.serviceId;

  const [licensePlate, setLicensePlate] = useState(userLicensePlate || '');
  const [vehicleType, setVehicleType] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [deliveryDate, setDeliveryDate] = useState(getCurrentDate()); // Ngày hiện tại
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Kiểm tra xem khách hàng có xe hay không
  const hasVehicles = vehiclesData?.success && vehiclesData.data && vehiclesData.data.length > 0;
  const vehicles = vehiclesData?.data || [];

  // Redirect to Login if not authenticated
  useEffect(() => {
    if (!isLoggedIn) {
      navigation.replace('Login');
    }
  }, [isLoggedIn, navigation]);

  useEffect(() => {
    if (servicesData?.success && servicesData.data) {
      dispatch(setServices({ data: servicesData.data, count: servicesData.data.length }));
    }
  }, [servicesData, dispatch]);

  // Auto-select service from route params
  useEffect(() => {
    if (serviceIdFromRoute && servicesData?.success && servicesData.data) {
      const service = servicesData.data.find((s: ServiceItem) => s.id === serviceIdFromRoute);
      if (service) {
        setSelectedService(service);
      }
    }
  }, [serviceIdFromRoute, servicesData]);

  // Auto-fill license plate and vehicle type when vehicle is selected
  useEffect(() => {
    if (selectedVehicle) {
      setLicensePlate(selectedVehicle.license_plate || '');
      setVehicleType(selectedVehicle.model || '');
    }
  }, [selectedVehicle]);

  const handleServiceSelect = useCallback((option: ServiceItem) => {
    setSelectedService(option);
  }, []);
  
  const handleVehicleSelect = useCallback((vehicle: any) => {
    setSelectedVehicle(vehicle);
  }, []);

  const handleDeliveryDateChange = useCallback((date: string) => {
    setDeliveryDate(date);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!licensePlate || !vehicleType || !selectedService) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin bắt buộc!');
      return;
    }
    setIsLoading(true);
    try {
      const formattedDeliveryDate = formatDateForAPI(deliveryDate);
      const body = {
        receiver_name: userName,
        receiver_phone: userPhone,
        license_plate: licensePlate,
        vehicle_type: vehicleType,
        service_id: selectedService.id,
        receive_date: formattedDeliveryDate, // Sử dụng delivery_date làm receive_date
        delivery_date: formattedDeliveryDate,
        note,
      };
      const result = await createOrder(body).unwrap();
      if (result.success) {
        // Clear fields with default empty string values
        setVehicleType('');
        setNote('');
        // Clear licensePlate if it was originally empty (not from userLicensePlate)
        if (!userLicensePlate) {
          setLicensePlate('');
        }
        Alert.alert('Thành công', 'Đặt lịch thành công!');
        try {
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation.navigate('Home');
          }
        } catch (navError) {
          navigation.navigate('Home');
        }
      } else {
        Alert.alert('Lỗi', 'Đặt lịch thất bại!');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Đặt lịch thất bại!');
    } finally {
      setIsLoading(false);
    }
  }, [licensePlate, vehicleType, selectedService, deliveryDate, note, userName, userPhone, createOrder, navigation, userLicensePlate]);

  // Don't render if not logged in (will redirect)
  if (!isLoggedIn) {
    return null;
  }

  if (servicesIsLoading) {
    return (
      <Screen
        headerTitle="Đặt lịch dịch vụ"
        showBackButton
        safeAreaTopColor={Colors.primary}
        statusBarStyle="light-content"
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.text.primary} />
        </View>
      </Screen>
    );
  }

  if (servicesError || !servicesData?.success) {
    return (
      <Screen
        headerTitle="Đặt lịch dịch vụ"
        showBackButton
        safeAreaTopColor={Colors.primary}
        statusBarStyle="light-content"
      >
        <View style={{ flex: 1 }}>
          <ErrorView 
            message="Lỗi tải dịch vụ"
            onRetry={refetchServices}
            icon="calendar-outline"
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      headerTitle="Đặt lịch dịch vụ"
      showBackButton
      statusBarStyle="light-content"
    >
      <FormContainer
        keyboardAvoiding
        withScroll
        padding="xl"
        dismissKeyboardOnPress
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{
          paddingBottom: 20,
        }}
      >
        <InputFieldWithLabel
          value={userName || ''}
          onChangeText={() => {}}
          placeholder="Tên khách hàng"
          label="Tên khách hàng"
          icon="person-outline"
          editable={false}
        />
        <InputFieldWithLabel
          value={userPhone || ''}
          onChangeText={() => {}}
          placeholder="Số điện thoại"
          label="Số điện thoại"
          icon="call-outline"
          keyboardType="phone-pad"
          editable={false}
        />
        {/* Chọn xe hoặc nhập thông tin xe */}
        {hasVehicles ? (
          <>
            <SelectInput
              value={selectedVehicle ? `${selectedVehicle.license_plate}${selectedVehicle.model ? ` - ${selectedVehicle.model}` : ''}` : ''}
              placeholder="Chọn xe"
              label="Chọn xe"
              icon="car-outline"
              options={vehicles.map((v: any) => ({
                id: v.id,
                name: `${v.license_plate}${v.model ? ` - ${v.model}` : ''}`,
                image_url: v.image_url || null,
                description: v.model || undefined,
              }))}
              onSelect={(option) => {
                const vehicle = vehicles.find((v: any) => v.id === option.id);
                if (vehicle) {
                  handleVehicleSelect(vehicle);
                }
              }}
              disabled={vehiclesLoading}
              useCategories={false}
            />
            {selectedVehicle && (
              <View style={styles.vehicleInfoContainer}>
                <View style={styles.vehicleInfoRow}>
                  <Ionicons name="car-outline" size={16} color={Colors.primary} />
                  <Text style={styles.vehicleInfoLabel}>Biển số:</Text>
                  <Text style={styles.vehicleInfoValue}>{selectedVehicle.license_plate}</Text>
                </View>
                {selectedVehicle.model && (
                  <View style={styles.vehicleInfoRow}>
                    <Ionicons name="car-sport-outline" size={16} color={Colors.primary} />
                    <Text style={styles.vehicleInfoLabel}>Loại xe:</Text>
                    <Text style={styles.vehicleInfoValue}>{selectedVehicle.model}</Text>
                  </View>
                )}
              </View>
            )}
          </>
        ) : (
          <>
            <InputFieldWithLabel
              value={licensePlate}
              onChangeText={setLicensePlate}
              placeholder="Nhập biển số xe"
              label="Biển số xe"
              icon="car-outline"
            />
            <InputFieldWithLabel
              value={vehicleType}
              onChangeText={setVehicleType}
              placeholder="Nhập loại xe (ví dụ: Honda Wave, Yamaha Sirius)"
              label="Loại xe"
              icon="car-sport-outline"
            />
          </>
        )}
        <SelectInput
          value={selectedService?.name || ''}
          placeholder="Chọn dịch vụ"
          label="Loại dịch vụ"
          icon="construct-outline"
          options={services}
          onSelect={handleServiceSelect}
          disabled={servicesLoading}
          useCategories={true}
        />
        {selectedService && selectedService.estimated_time && (
          <View style={styles.estimatedTimeContainer}>
            <View style={styles.estimatedTimeRow}>
              <Ionicons name="time-outline" size={16} color={Colors.primary} />
              <Text style={styles.estimatedTimeLabel}>Thời gian ước tính:</Text>
              <Text style={styles.estimatedTimeValue}>
                {formatSecondsToDaysHours(selectedService.estimated_time)}
              </Text>
            </View>
          </View>
        )}
        <DateInput 
          value={deliveryDate} 
          onChangeText={handleDeliveryDateChange} 
          placeholder={getCurrentDate()} 
          label="Ngày đặt lịch" 
          fullWidth
        />
        <NoteInput value={note} onChangeText={setNote} placeholder="Nhập ghi chú (tùy chọn)" />
        
        <View style={styles.confirmButtonContainer}>
          <Button
            title="Xác nhận đặt lịch"
            onPress={handleConfirm}
            loading={isLoading}
            disabled={isLoading}
            variant="primary"
            fullWidth
          />
        </View>
      </FormContainer>
    </Screen>
  );
};

export default React.memo(BookingScreen);