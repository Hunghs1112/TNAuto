// src/screens/Booking/BookingScreen.tsx
import React, { useState, useEffect } from "react";
import { View, Text, StatusBar, ScrollView, Alert, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typo";
import Header from "../../components/Header";
import TextInputComponent from "../../components/TextInput/TextInput";
import DateInput from "../../components/TextInput/DateInput";
import NoteInput from "../../components/TextInput/NoteInput";
import SelectInput from "../../components/TextInput/SelectInput";
import ConfirmButton from "../../components/ConfirmButton";
import { AppStackParamList } from "../../navigation/AppNavigator";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppSelector } from "../../redux/hooks/useAppSelector";
import { useAppDispatch } from "../../redux/hooks/useAppDispatch";
import { RootState } from "../../redux/types";
import { setServices } from "../../redux/slices/servicesSlice";
import { useGetServicesQuery, useCreateOrderMutation } from "../../services/customerApi";
import { styles } from "./styles";
import { useAutoRefresh } from "../../redux/hooks/useAutoRefresh";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

interface ServiceItem {
  id: number;
  name: string;
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

const InputFieldWithLabel: React.FC<InputFieldWithLabelProps> = ({
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
);

const BookingScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const { refreshing, onRefresh } = useAutoRefresh();
  const { userName, userPhone, userLicensePlate } = useAppSelector((state: RootState) => state.auth);
  const { services, isFetching: servicesLoading } = useAppSelector((state: RootState) => state.services);
  const { data: servicesData, isLoading: servicesIsLoading, error: servicesError } = useGetServicesQuery();
  const [createOrder] = useCreateOrderMutation();

  const [licensePlate, setLicensePlate] = useState(userLicensePlate || '');
  const [vehicleType, setVehicleType] = useState('');
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [deliveryDate, setDeliveryDate] = useState('11/11/1111');
  const [receiveDate, setReceiveDate] = useState('11/11/1111');
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log('BookingScreen: Auth data:', { userName, userPhone, userLicensePlate });
    if (servicesData?.success && servicesData.data) {
      dispatch(setServices({ data: servicesData.data, count: servicesData.data.length }));
      console.log('BookingScreen: Services loaded:', servicesData.data.length);
    }
  }, [servicesData, dispatch]);

  if (servicesIsLoading) {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.background.red} />
        <View style={styles.redSection}>
          <Header title="Đặt lịch dịch vụ" />
        </View>
        <View style={[styles.whiteSection, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={Colors.text.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (servicesError || !servicesData?.success) {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.background.red} />
        <View style={styles.redSection}>
          <Header title="Đặt lịch dịch vụ" />
        </View>
        <View style={styles.whiteSection}>
          <View style={styles.body}>
            <Text style={styles.errorText}>Lỗi tải dịch vụ</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const formatDate = (dateStr: string): string => {
    if (!dateStr || dateStr === '11/11/1111') return new Date().toISOString().split('T')[0];
    const [d, m, y] = dateStr.split('/').map(Number);
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  };

  // Moved InputFieldWithLabel outside component to prevent re-creation

  const handleServiceSelect = (option: ServiceItem) => {
    setSelectedService(option);
    console.log('BookingScreen: Service selected:', option);
  };

  const handleConfirm = async () => {
    if (!licensePlate || !vehicleType || !selectedService || !receiveDate) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin bắt buộc!');
      return;
    }
    setIsLoading(true);
    try {
      const formattedReceiveDate = formatDate(receiveDate);
      const formattedDeliveryDate = formatDate(deliveryDate);
      const body = {
        receiver_name: userName,
        receiver_phone: userPhone,
        license_plate: licensePlate,
        vehicle_type: vehicleType,
        service_id: selectedService.id,
        receive_date: formattedReceiveDate,
        delivery_date: formattedDeliveryDate,
        note,
      };
      console.log('BookingScreen: Booking data:', body);
      const result = await createOrder(body).unwrap();
      if (result.success) {
        Alert.alert('Thành công', 'Đặt lịch thành công!');
        try {
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation.navigate('Home');
          }
        } catch (navError) {
          console.error('BookingScreen: Navigation error after booking:', navError);
          navigation.navigate('Home');
        }
      } else {
        Alert.alert('Lỗi', 'Đặt lịch thất bại!');
      }
    } catch (error) {
      console.error('BookingScreen: Booking error:', error);
      Alert.alert('Lỗi', 'Đặt lịch thất bại!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background.red} />
      
      <View style={styles.redSection}>
        <Header title="Đặt lịch dịch vụ" />
      </View>
      
      <View style={styles.whiteSection}>
        <View style={styles.body}>
          <ScrollView
            style={styles.form}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
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
            <InputFieldWithLabel
              value={licensePlate}
              onChangeText={setLicensePlate}
              placeholder="Biển số xe"
              label="Biển số xe"
              icon="car-outline"
            />
            <InputFieldWithLabel
              value={vehicleType}
              onChangeText={setVehicleType}
              placeholder="Loại xe"
              label="Loại xe"
              icon="car-sport-outline"
            />
            <SelectInput
              value={selectedService?.name || ''}
              placeholder="Chọn dịch vụ"
              label="Loại dịch vụ"
              icon="construct-outline"
              options={services}
              onSelect={handleServiceSelect}
              disabled={servicesLoading}
            />
            <View style={styles.dateRowContainer}>
              <DateInput value={deliveryDate} onChangeText={setDeliveryDate} placeholder="11/11/1111" label="Ngày giao" />
              <DateInput value={receiveDate} onChangeText={setReceiveDate} placeholder="11/11/1111" label="Ngày nhận" />
            </View>
            <NoteInput value={note} onChangeText={setNote} placeholder="Nhập ghi chú (tùy chọn)" />
          </ScrollView>
          <View style={styles.confirmButtonContainer}>
            <ConfirmButton
              title="Xác nhận đặt lịch"
              onPress={handleConfirm}
              loading={isLoading}
              disabled={isLoading}
              height={44}
              borderRadius={15}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default BookingScreen;