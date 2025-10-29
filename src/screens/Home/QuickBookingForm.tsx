import React, { useState, useEffect, useCallback } from "react"
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"
import { useSelector, useDispatch } from "react-redux"
import TextInputComponent from "../../components/TextInput/TextInput"
import DateInput from "../../components/TextInput/DateInput"
import NoteInput from "../../components/TextInput/NoteInput"
import SelectInput from "../../components/TextInput/SelectInput"
import ConfirmButton from "../../components/ConfirmButton"
import { Colors } from "../../constants/colors"
import { Typography } from "../../constants/typo"
import type { RootState } from "../../redux/types"
import { setServices } from "../../redux/slices/servicesSlice"
import { useGetServicesQuery, useCreateOrderMutation } from "../../services"
import { getCurrentDate, getDateAfterDays, formatDateForAPI } from "../../utils/dateHelpers"

interface QuickBookingFormProps {
  onConfirm?: () => void
}

interface ServiceItem {
  id: number
  name: string
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
  const { userName, userPhone, userLicensePlate } = useSelector((state: RootState) => state.auth)
  const { services, isFetching: servicesLoading } = useSelector((state: RootState) => state.services)
  const [licensePlate, setLicensePlate] = useState(userLicensePlate)
  const [vehicleType, setVehicleType] = useState("")
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null)
  const [deliveryDate, setDeliveryDate] = useState(getCurrentDate()) // Ngày hiện tại
  const [receiveDate, setReceiveDate] = useState(getDateAfterDays(7)) // 7 ngày sau
  const [note, setNote] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const { data: servicesData } = useGetServicesQuery()
  const [createOrder] = useCreateOrderMutation()

  useEffect(() => {
    if (servicesData?.success && servicesData.data) {
      dispatch(setServices({ data: servicesData.data, count: servicesData.count }))
    }
  }, [servicesData, dispatch])

  const handleServiceSelect = useCallback((option: ServiceItem) => {
    setSelectedService(option)
  }, [])

  const handleConfirm = useCallback(async () => {
    if (!licensePlate || !vehicleType || !selectedService || !receiveDate) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin bắt buộc!")
      return
    }
    setIsLoading(true)
    try {
      const formattedReceiveDate = formatDateForAPI(receiveDate)
      const formattedDeliveryDate = formatDateForAPI(deliveryDate)
      const body = {
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
  }, [licensePlate, vehicleType, selectedService, receiveDate, deliveryDate, note, userName, userPhone, createOrder, onConfirm])

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Đặt lịch dịch vụ nhanh</Text>
        <ScrollView
          style={styles.formContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
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
            value={selectedService?.name || ""}
            placeholder="Chọn dịch vụ"
            label="Loại dịch vụ"
            icon="construct-outline"
            options={services}
            onSelect={handleServiceSelect}
            disabled={servicesLoading}
          />
          <View style={styles.dateRowContainer}>
            <DateInput value={deliveryDate} onChangeText={setDeliveryDate} placeholder={getCurrentDate()} label="Ngày giao" />
            <DateInput value={receiveDate} onChangeText={setReceiveDate} placeholder={getDateAfterDays(7)} label="Ngày nhận" />
          </View>
          <NoteInput value={note} onChangeText={setNote} placeholder="Nhập ghi chú (tùy chọn)" />
        </ScrollView>
        <View style={styles.confirmButtonContainer}>
          <ConfirmButton
            title="Xác nhận"
            onPress={handleConfirm}
            loading={isLoading}
            disabled={isLoading}
            height={44}
            borderRadius={15}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  title: {
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    fontSize: Typography.size.lg,
    lineHeight: 28,
    marginBottom: 4,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  formContainer: {
    width: "100%",
    flex: 1,
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
})

export default React.memo(QuickBookingForm)
