// src/screens/Register/DealerRegisterScreen.tsx
import React, { useState } from "react";
import { View, Text, Alert, Image, TouchableOpacity } from "react-native";
import { Screen, FormContainer } from "../../components/layout";
import { Button } from "../../components/ui";
import TextInputComponent from "../../components/TextInput/TextInput";
import { styles } from "../Login/styles";
import { Colors } from "../../constants/colors";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useDealerRegisterMutation, useLazyResolveGarageByCodeQuery } from "../../services/authApi";
import { AuthStackParamList } from "../../navigation/AuthNavigator";
import { validatePhone, validateEmail } from "../../utils/validation";
import { useAppSelector } from "../../redux/hooks/useAppSelector";

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

export default function DealerRegisterScreen() {
  const navigation = useNavigation<NavigationProp>();
  const currentGarageCode = useAppSelector((state) => state.garageContext.garageCode || '');
  
  const [formData, setFormData] = useState({
    garage_code: currentGarageCode,
    name: "",
    phone: "",
    password: "",
    email: "",
    address: "",
    avatar_url: ""
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [dealerRegister] = useDealerRegisterMutation();
  const [resolveGarageByCode] = useLazyResolveGarageByCodeQuery();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    const { garage_code, name, phone, password, email } = formData;

    if (!garage_code.trim() || !name.trim() || !phone.trim() || !password.trim()) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ Mã gara, Tên, Số điện thoại và Mật khẩu!");
      return;
    }

    const phoneValidation = validatePhone(phone);
    if (!phoneValidation.isValid) {
      Alert.alert("Lỗi", phoneValidation.error || "Số điện thoại không hợp lệ");
      return;
    }

    if (email.trim()) {
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        Alert.alert("Lỗi", emailValidation.error || "Email không hợp lệ");
        return;
      }
    }

    setIsLoading(true);
    try {
      await resolveGarageByCode(garage_code.trim()).unwrap();
      const result = await dealerRegister(formData).unwrap();
      
      if (result.success) {
        Alert.alert(
          "Đăng ký thành công! 🎉",
          "Tài khoản đại lý của bạn đã được tạo. Vui lòng đăng nhập để tiếp tục.",
          [{ text: "OK", onPress: () => navigation.navigate("Login") }]
        );
      } else {
        Alert.alert("Lỗi", result.message || "Đăng ký thất bại!");
      }
    } catch (error: any) {
      console.error('Dealer register error:', error);
      Alert.alert(
        "Lỗi",
        error?.data?.message || "Không thể kết nối đến máy chủ. Vui lòng thử lại sau."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Screen
      headerTitle="Đăng ký Đại lý"
      showBackButton
      statusBarStyle="light-content"
    >
      <FormContainer
        keyboardAvoiding
        withScroll
        paddingCustom={{ horizontal: 'xl', top: 'lg', bottom: 'xl' }}
        dismissKeyboardOnPress
      >
        <Text style={styles.welcomeText}>Trở thành Đối tác</Text>

        <View style={styles.logoFrame}>
          <Image
            style={styles.logo}
            source={require('../../assets/logo.png')}
            resizeMode="contain"
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInputComponent
            value={formData.garage_code}
            onChangeText={(v) => handleInputChange('garage_code', v.toUpperCase())}
            placeholder="Mã gara *"
            autoCapitalize="characters"
            focusBorderColor={Colors.accent.yellow}
          />
          <TextInputComponent
            value={formData.name}
            onChangeText={(v) => handleInputChange('name', v)}
            placeholder="Tên đại lý *"
            focusBorderColor={Colors.accent.yellow}
          />
          <TextInputComponent
            value={formData.phone}
            onChangeText={(v) => handleInputChange('phone', v)}
            placeholder="Số điện thoại *"
            keyboardType="phone-pad"
            focusBorderColor={Colors.accent.yellow}
          />
          <TextInputComponent
            value={formData.password}
            onChangeText={(v) => handleInputChange('password', v)}
            placeholder="Mật khẩu (plain-text) *"
            secureTextEntry={true}
            focusBorderColor={Colors.accent.yellow}
          />
          <TextInputComponent
            value={formData.email}
            onChangeText={(v) => handleInputChange('email', v)}
            placeholder="Email"
            keyboardType="email-address"
            focusBorderColor={Colors.accent.yellow}
          />
          <TextInputComponent
            value={formData.address}
            onChangeText={(v) => handleInputChange('address', v)}
            placeholder="Địa chỉ"
            multiline
            focusBorderColor={Colors.accent.yellow}
          />
        </View>

        <View style={styles.actions}>
          <Button
            title="Đăng ký Đại lý"
            onPress={handleRegister}
            loading={isLoading}
            disabled={isLoading}
            variant="primary"
            fullWidth
          />
        </View>

        <View style={styles.signup}>
          <Text style={styles.registerPrompt}>Đã có tài khoản?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.registerLink}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </FormContainer>
    </Screen>
  );
}
