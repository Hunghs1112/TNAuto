import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, Alert } from "react-native";
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

  const [registerCustomer] = useRegisterCustomerMutation();

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

    // Validate phone (optional)
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
      // Clean and format data before sending
      const cleanedPhone = hasPhone ? cleanPhone(phone) : undefined;
      const formattedPlate = formatLicensePlate(licensePlate);
      
      const requestBody: { name: string; phone?: string; license_plate?: string; avatar_url?: string } = {
        name: trimmedName,
      };

      if (cleanedPhone) {
        requestBody.phone = cleanedPhone;
      }

      requestBody.license_plate = formattedPlate;

      const result = await registerCustomer(requestBody).unwrap();
      
      if (result.success) {
        Alert.alert(
          "Đăng ký thành công! 🎉", 
          result.message || "Bạn có thể đăng nhập ngay bây giờ",
          [
            {
              text: "OK",
              onPress: () => navigation.navigate("Login")
            }
          ]
        );
      } else {
        Alert.alert("Lỗi", "Đăng ký thất bại!");
      }
    } catch (error: any) {
      console.error('RegisterScreen: Registration error:', error);
      
      // Handle specific error cases from backend
      let errorMessage = "Đăng ký thất bại! Vui lòng thử lại.";
      
      if (error?.data?.error || error?.message) {
        const errorText = error?.data?.error || error?.message || '';
        
        // Phone already exists
        if (errorText.toLowerCase().includes('phone') && 
            (errorText.toLowerCase().includes('exist') || errorText.toLowerCase().includes('duplicate'))) {
          errorMessage = "Số điện thoại này đã được đăng ký.\nVui lòng sử dụng số điện thoại khác hoặc đăng nhập.";
        }
        // License plate already exists
        else if (errorText.toLowerCase().includes('license') && 
                 (errorText.toLowerCase().includes('exist') || errorText.toLowerCase().includes('duplicate'))) {
          errorMessage = "Biển số xe này đã được đăng ký.\nVui lòng kiểm tra lại biển số xe.";
        }
        // Duplicate entry (generic)
        else if (errorText.toLowerCase().includes('duplicate')) {
          errorMessage = "Thông tin này đã tồn tại trong hệ thống.\nVui lòng kiểm tra lại số điện thoại hoặc biển số xe.";
        }
        // Missing required fields
        else if (errorText.toLowerCase().includes('required') ||
                 errorText.toLowerCase().includes('missing')) {
          errorMessage = "Vui lòng cung cấp thông tin hợp lệ.";
        }
        // Invalid format
        else if (errorText.toLowerCase().includes('format') || 
                 errorText.toLowerCase().includes('invalid')) {
          errorMessage = "Định dạng thông tin không hợp lệ.\nVui lòng kiểm tra lại số điện thoại hoặc biển số xe.";
        }
        // Server error
        else if (errorText.toLowerCase().includes('server') || 
                 errorText.toLowerCase().includes('internal')) {
          errorMessage = "Lỗi hệ thống. Vui lòng thử lại sau.";
        }
        // Default: show backend error message
        else {
          errorMessage = errorText;
        }
      }
      
      Alert.alert("Lỗi đăng ký", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    navigation.navigate("Login");
  };

  return (
    <Screen
      statusBarStyle="light-content"
    >
      <FormContainer
        keyboardAvoiding
        withScroll
        paddingCustom={{ horizontal: 'xl', top: 'lg', bottom: 'xl' }}
        dismissKeyboardOnPress
      >
        <Text style={styles.welcomeText}>Chào mừng đến với GaraOne</Text>
        <Text style={styles.subtitle}>Đăng ký tại đây</Text>

        <View style={styles.logoFrame}>
          <Image
            style={styles.logo}
            source={require('../../assets/logo.png')}
            resizeMode="contain"
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInputComponent
            value={name}
            onChangeText={setName}
            placeholder="Họ và tên *"
            placeholderTextColor={Colors.text.placeholder}
          />
          <TextInputComponent
            value={phone}
            onChangeText={setPhone}
            placeholder="Số điện thoại (không bắt buộc)"
            placeholderTextColor={Colors.text.placeholder}
            keyboardType="phone-pad"
          />
          <TextInputComponent
            value={licensePlate}
            onChangeText={(text) => setLicensePlate(text.toUpperCase())}
            placeholder="Biển số xe * (VD: 29A-12345)"
            placeholderTextColor={Colors.text.placeholder}
          />
          <Text style={styles.helperText}>Các trường có dấu * là bắt buộc.</Text>
        </View>

        <View style={styles.actions}>
          <Button
            title="Đăng ký"
            onPress={handleRegister}
            loading={isLoading}
            disabled={isLoading}
            variant="primary"
            fullWidth
          />
        </View>

        <View style={styles.signup}>
          <Text style={styles.registerPrompt}>Bạn đã có tài khoản?</Text>
          <TouchableOpacity onPress={handleLogin}>
            <Text style={styles.registerLink}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.signup}>
          <Text style={styles.registerPrompt}>Bạn muốn làm đại lí để nhận thêm nhiều ưu đãi?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('DealerRegister' as any)}>
            <Text style={styles.registerLink}>Đăng ký đại lí</Text>
          </TouchableOpacity>
        </View>
      </FormContainer>
    </Screen>
  );
}
