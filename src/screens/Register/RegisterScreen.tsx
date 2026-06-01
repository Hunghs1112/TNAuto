import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, Alert } from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";
import Screen from "../../components/layout/Screen/Screen";
import { FormContainer } from "../../components/layout/FormContainer";
import { Colors } from "../../constants/colors";
import { Button } from "../../components/ui/Button";
import TextInputComponent from "../../components/TextInput/TextInput";
import { styles } from "./styles";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useRegisterCustomerMutation } from "../../services";
import {
  validateName,
  validatePhone,
  validateLicensePlate,
  cleanPhone,
  formatLicensePlate,
} from "../../utils/validation";

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

export default function RegisterScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Error states
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [plateError, setPlateError] = useState("");

  const [registerCustomer] = useRegisterCustomerMutation();

  // Real-time validation
  const handleNameChange = (text: string) => {
    setName(text);
    if (text.trim().length === 0) {
      setNameError("");
    } else {
      const result = validateName(text);
      setNameError(result.isValid ? "" : (result.error || "Họ và tên không hợp lệ"));
    }
  };

  const handlePhoneChange = (text: string) => {
    setPhone(text);
    if (text.trim().length === 0) {
      setPhoneError("");
    } else if (!/^[0-9]{10,11}$/.test(text)) {
      setPhoneError("Số điện thoại phải có 10–11 chữ số");
    } else {
      setPhoneError("");
    }
  };

  const handlePlateChange = (text: string) => {
    const upper = text.toUpperCase();
    setLicensePlate(upper);
    if (upper.trim().length === 0) {
      setPlateError("");
    } else {
      const result = validateLicensePlate(upper);
      setPlateError(result.isValid ? "" : (result.error || "Biển số phải có cả chữ và số (VD: 29A-12345)"));
    }
  };

  const showError = (msg: string) => {
    if (msg) Alert.alert("Lỗi nhập liệu", msg);
  };

  // Form valid when name + plate filled and no errors
  const isFormValid =
    name.trim().length > 0 &&
    licensePlate.trim().length > 0 &&
    !nameError &&
    !plateError &&
    !phoneError;

  const handleRegister = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert("Lỗi xác thực", "Vui lòng nhập họ và tên.");
      return;
    }

    const nameValidation = validateName(name);
    if (!nameValidation.isValid) {
      Alert.alert("Lỗi xác thực", nameValidation.error || "Họ và tên không hợp lệ");
      return;
    }

    const hasPhone = phone.trim().length > 0;
    if (hasPhone) {
      const phoneValidation = validatePhone(phone);
      if (!phoneValidation.isValid) {
        Alert.alert("Lỗi xác thực", phoneValidation.error || "Số điện thoại không hợp lệ");
        return;
      }
    }

    const trimmedPlate = licensePlate.trim();
    if (!trimmedPlate) {
      Alert.alert("Lỗi xác thực", "Vui lòng nhập biển số xe.");
      return;
    }

    const plateValidation = validateLicensePlate(licensePlate);
    if (!plateValidation.isValid) {
      Alert.alert("Lỗi xác thực", plateValidation.error || "Biển số xe không hợp lệ");
      return;
    }

    setIsLoading(true);
    try {
      const cleanedPhone = hasPhone ? cleanPhone(phone) : undefined;
      const formattedPlate = formatLicensePlate(licensePlate);

      const requestBody: { name: string; phone?: string; license_plate?: string } = {
        name: trimmedName,
      };
      if (cleanedPhone) requestBody.phone = cleanedPhone;
      requestBody.license_plate = formattedPlate;

      const result = await registerCustomer(requestBody).unwrap();

      if (result.success) {
        Alert.alert(
          "Đăng ký thành công! 🎉",
          result.message || "Bạn có thể đăng nhập ngay bây giờ",
          [{ text: "OK", onPress: () => navigation.navigate("Login") }]
        );
      } else {
        Alert.alert("Lỗi", "Đăng ký thất bại!");
      }
    } catch (error: any) {
      let errorMessage = "Đăng ký thất bại! Vui lòng thử lại.";
      if (error?.data?.error || error?.message) {
        const errorText = error?.data?.error || error?.message || '';
        if (errorText.toLowerCase().includes('phone') &&
          (errorText.toLowerCase().includes('exist') || errorText.toLowerCase().includes('duplicate'))) {
          errorMessage = "Số điện thoại này đã được đăng ký.";
        } else if (errorText.toLowerCase().includes('license') &&
          (errorText.toLowerCase().includes('exist') || errorText.toLowerCase().includes('duplicate'))) {
          errorMessage = "Biển số xe này đã được đăng ký.";
        } else if (errorText.toLowerCase().includes('duplicate')) {
          errorMessage = "Thông tin đã tồn tại trong hệ thống.";
        } else {
          errorMessage = errorText;
        }
      }
      Alert.alert("Lỗi đăng ký", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Screen statusBarStyle="light-content">
      <FormContainer
        keyboardAvoiding
        withScroll
        paddingCustom={{ horizontal: 'xl', top: 'lg', bottom: 'xl' }}
        dismissKeyboardOnPress
      >
        <View style={{ marginTop: 20 }}>
          <Text style={styles.welcomeText}>Chào mừng đến với GaraOne</Text>

          <View style={styles.logoFrame}>
            <Image
              style={styles.logo}
              source={require('../../assets/logo.png')}
              resizeMode="contain"
            />
          </View>

          <View style={styles.inputContainer}>
            {/* Họ và tên */}
            <TextInputComponent
              value={name}
              onChangeText={handleNameChange}
              placeholder="Họ và tên"
              placeholderTextColor={Colors.text.placeholder}
              iconLeft={<Ionicons name="person" size={20} color="#006DB6" />}
              iconRight={
                nameError && name.length > 0 ? (
                  <TouchableOpacity onPress={() => showError(nameError)}>
                    <View style={styles.errorIcon}>
                      <Text style={styles.errorIconText}>!</Text>
                    </View>
                  </TouchableOpacity>
                ) : undefined
              }
            />

            {/* Số điện thoại */}
            <TextInputComponent
              value={phone}
              onChangeText={handlePhoneChange}
              placeholder="Số điện thoại"
              placeholderTextColor={Colors.text.placeholder}
              keyboardType="phone-pad"
              maxLength={11}
              iconLeft={<Ionicons name="call" size={20} color="#006DB6" />}
              iconRight={
                phoneError && phone.length > 0 ? (
                  <TouchableOpacity onPress={() => showError(phoneError)}>
                    <View style={styles.errorIcon}>
                      <Text style={styles.errorIconText}>!</Text>
                    </View>
                  </TouchableOpacity>
                ) : undefined
              }
            />

            {/* Biển số xe */}
            <TextInputComponent
              value={licensePlate}
              onChangeText={handlePlateChange}
              placeholder="Biển số xe (VD: 29A-12345)"
              placeholderTextColor={Colors.text.placeholder}
              autoCapitalize="characters"
              iconLeft={<Ionicons name="car" size={20} color="#006DB6" />}
              iconRight={
                plateError && licensePlate.length > 0 ? (
                  <TouchableOpacity onPress={() => showError(plateError)}>
                    <View style={styles.errorIcon}>
                      <Text style={styles.errorIconText}>!</Text>
                    </View>
                  </TouchableOpacity>
                ) : undefined
              }
            />
          </View>

          <View style={styles.actions}>
            <Button
              title="Đăng ký"
              onPress={handleRegister}
              loading={isLoading}
              disabled={!isFormValid || isLoading}
              variant="primary"
              fullWidth
              style={{
                backgroundColor: isFormValid && !isLoading ? Colors.primary : '#a9a9a9',
                opacity: isFormValid && !isLoading ? 1 : 0.6,
              }}
            />
          </View>

          <View style={styles.signup}>
            <Text style={styles.registerPrompt}>Bạn đã có tài khoản?</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.registerLink}>Đăng nhập</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.signup}>
            <TouchableOpacity
              style={styles.dealerBanner}
              onPress={() => navigation.navigate('DealerRegister' as any)}
            >
              <Ionicons name="storefront-outline" size={18} color="#fff" />
              <Text style={styles.dealerBannerText}>Làm đại lý · Nhận thêm ưu đãi</Text>
              <Ionicons name="chevron-forward" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </FormContainer>
    </Screen>
  );
}
