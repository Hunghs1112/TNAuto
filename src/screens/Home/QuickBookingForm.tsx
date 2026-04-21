import React, { useState, useEffect, useCallback } from "react"
import { View, Text, StyleSheet, Alert } from "react-native"
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useSelector, useDispatch } from "react-redux"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { FormContainer } from "../../components/layout"
import TextInputComponent from "../../components/TextInput/TextInput"
import DateInput from "../../components/TextInput/DateInput"
import NoteInput from "../../components/TextInput/NoteInput"
import SelectInput from "../../components/TextInput/SelectInput"
import { Button } from "../../components/ui"
import { Colors } from "../../constants/colors"
import { Typography } from "../../constants/typo"
import SectionHeader from "./SectionHeader"
import type { RootState } from "../../redux/types"
import { setServices } from "../../redux/slices/servicesSlice"
import { useGetServicesQuery, useCreateOrderMutation } from "../../services"
import { useGetCustomerVehiclesQuery } from "../../services/vehicleApi";
import { getCurrentDate, formatDateForAPI, formatSecondsToDaysHours } from "../../utils/dateHelpers"
import { AppStackParamList } from "../../navigation/AppNavigator"
import { selectGarageCode } from "../../redux/selectors"

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

interface QuickBookingFormProps {
  onConfirm?: () => void
}

interface ServiceItem {
  id: number
  name: string
  estimated_time?: number // giây
}

interface InputFieldWithLabelProps {
  value: string
  onChangeText: (text: string) => void
  placeholder: string
  label: string
  icon: string
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad" | "number-pad"
  editable?: boolean
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
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
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

const QuickBookingForm: React.FC<QuickBookingFormProps> = ({ onConfirm }) => {
  const dispatch = useDispatch()
  const navigation = useNavigation<NavigationProp>()
  const { isLoggedIn, userName, userPhone, userLicensePlate } = useSelector((state: RootState) => state.auth)
  const activeGarageCode = useSelector(selectGarageCode)
  const hasGarageContext = useSelector(
    (state: RootState) => Boolean(state.garageContext.garageCode && state.garageContext.resolved),
  )
  const { services, isFetching: servicesLoading } = useSelector((state: RootState) => state.services)
  const { data: vehiclesData, isLoading: vehiclesLoading } = useGetCustomerVehiclesQuery(
    { phone: userPhone },
    { skip: !userPhone || !hasGarageContext },
  );
  const [licensePlate, setLicensePlate] = useState(userLicensePlate)
  const [vehicleType, setVehicleType] = useState("")
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null)
  const [deliveryDate, setDeliveryDate] = useState(getCurrentDate()) // Ngày hiện tại
  const [receiveDate, setReceiveDate] = useState(getCurrentDate()) // dùng chung với deliveryDate (không hiển thị)
  const [note, setNote] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Kiểm tra xem khách hàng có xe hay không
  const hasVehicles = vehiclesData?.success && vehiclesData.data && vehiclesData.data.length > 0;
  const vehicles = vehiclesData?.data || [];

  const { data: servicesData } = useGetServicesQuery({ garageCode: activeGarageCode }, { skip: !hasGarageContext })
  const [createOrder] = useCreateOrderMutation()

  useEffect(() => {
    if (servicesData?.success && servicesData.data) {
      dispatch(setServices({ data: servicesData.data, count: servicesData.count }))
    }
  }, [servicesData, dispatch])

  // Auto-fill license plate and vehicle type when vehicle is selected
  useEffect(() => {
    if (selectedVehicle) {
      setLicensePlate(selectedVehicle.license_plate || '')
      setVehicleType(selectedVehicle.model || '')
    }
  }, [selectedVehicle])

  // Đồng bộ receiveDate = deliveryDate (không hiển thị "Ngày ước tính nhận" trong form nhanh)
  useEffect(() => {
    setReceiveDate(deliveryDate)
  }, [deliveryDate])

  const handleServiceSelect = useCallback((option: ServiceItem) => {
    setSelectedService(option)
  }, [])

  const handleVehicleSelect = useCallback((vehicle: any) => {
    setSelectedVehicle(vehicle)
  }, [])

  const handleDeliveryDateChange = useCallback((date: string) => {
    setDeliveryDate(date)
  }, [])

  const handleConfirm = useCallback(async () => {
    // Check if user is logged in
    if (!isLoggedIn) {
      Alert.alert(
        "Cần đăng nhập",
        "Vui lòng đăng nhập để đặt lịch dịch vụ.",
        [
          { text: "Hủy", style: "cancel" },
          { 
            text: "Đăng nhập", 
            onPress: () => navigation.navigate('Login')
          }
        ]
      )
      return
    }

    if (!licensePlate || !vehicleType || !selectedService || !receiveDate) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin bắt buộc!")
      return
    }
    if (!hasGarageContext) {
      Alert.alert("Chưa chọn gara", "Vui lòng chọn gara trước khi đặt lịch.", [
        { text: "Đóng", style: "cancel" },
        { text: "Chọn gara", onPress: () => navigation.navigate("SelectGarage") },
      ])
      return
    }
    setIsLoading(true)
    try {
      const formattedReceiveDate = formatDateForAPI(receiveDate)
      const formattedDeliveryDate = formatDateForAPI(deliveryDate)
      const body = {
        garageCode: activeGarageCode,
        receiver_name: userName,
        receiver_phone: userPhone,
        license_plate: licensePlate,
        vehicle_type: vehicleType,
        service_id: selectedService.id,
        receive_date: formattedReceiveDate,
        delivery_date: formattedDeliveryDate,
        note,
      }
      const result = await createOrder(body).unwrap()
      if (result.success) {
        // Reset form after successful booking
        setSelectedService(null)
        setNote("")
        setDeliveryDate(getCurrentDate())
        setReceiveDate(getCurrentDate())

        if (hasVehicles) {
          setSelectedVehicle(null)
          setLicensePlate("")
          setVehicleType("")
        } else {
          setVehicleType("")
          if (!userLicensePlate) {
            setLicensePlate("")
          }
        }

        Alert.alert("Thành công", "Đặt lịch thành công!")
        if (onConfirm) onConfirm()
      } else {
        Alert.alert("Lỗi", "Đặt lịch thất bại!")
      }
    } catch (error) {
      Alert.alert("Lỗi", "Đặt lịch thất bại!")
    } finally {
      setIsLoading(false)
    }
  }, [isLoggedIn, navigation, licensePlate, vehicleType, selectedService, receiveDate, deliveryDate, note, userName, userPhone, createOrder, onConfirm, hasGarageContext, userLicensePlate, hasVehicles])

  return (
    <View style={styles.container}>
      <SectionHeader title="Đặt lịch dịch vụ nhanh" />
      <FormContainer
        keyboardAvoiding
        withScroll={false}
        padding="base"
        dismissKeyboardOnPress
      >
          <InputFieldWithLabel
            value={userName}
            onChangeText={() => {}}
            placeholder="Tên khách hàng"
            label="Tên khách hàng"
            icon="person-outline"
            editable={false}
          />
          <InputFieldWithLabel
            value={userPhone}
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
                  const vehicle = vehicles.find((v: any) => v.id === option.id)
                  if (vehicle) {
                    handleVehicleSelect(vehicle)
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
            value={selectedService?.name || ""}
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
            title="Xác nhận"
            onPress={handleConfirm}
            loading={isLoading}
            disabled={isLoading}
            variant="primary"
            fullWidth
          />
        </View>
      </FormContainer>
    </View>
  )
}

const styles = StyleSheet.create({
  vehicleInfoContainer: {
    width: "100%",
    marginBottom: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.primarySoft,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.alpha.primary12,
    gap: 8,
  },
  vehicleInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  vehicleInfoLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontWeight: Typography.weight.medium,
    fontSize: 14,
    color: Colors.text.secondary,
  },
  vehicleInfoValue: {
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    fontSize: 14,
    color: Colors.primary,
    flex: 1,
  },

  container: {
    width: "100%",
  },
  formContainer: {
    width: "100%",
  },
  scrollContent: {
    paddingBottom: 4,
  },
  inputFieldContainer: {
    width: "100%",
    marginBottom: 4,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background.light,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 4,
    borderRadius: 8,
    maxWidth: 240,
    shadowColor: Colors.neutral[300],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  iconContainer: {
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  label: {
    fontFamily: Typography.fontFamily.medium,
    fontWeight: Typography.weight.medium,
    fontSize: 13,
    lineHeight: 18,
    color: Colors.text.secondary,
    flex: 1,
    letterSpacing: 0.2,
  },
  inputWrapper: {
    width: "100%",
    marginTop: 4,
  },
  dateRowContainer: {
    width: "100%",
    marginBottom: 4,
    flexDirection: "row",
    gap: 0,
  },
  confirmButtonContainer: {
    width: "100%",
    marginTop: 4,
    paddingHorizontal: 4,
  },
  estimatedTimeContainer: {
    width: "100%",
    marginBottom: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.primarySoft,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.alpha.primary12,
  },
  estimatedTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  estimatedTimeLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontWeight: Typography.weight.medium,
    fontSize: 14,
    color: Colors.text.primary,
  },
  estimatedTimeValue: {
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    fontSize: 14,
    color: Colors.primary,
  },
})

export default React.memo(QuickBookingForm)
