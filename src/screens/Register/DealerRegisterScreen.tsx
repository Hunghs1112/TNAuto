// src/screens/Register/DealerRegisterScreen.tsx
import React, { useState } from "react";
import { View, Text, Alert, Image, TouchableOpacity } from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";
import { Screen, FormContainer } from "../../components/layout";
import { Button } from "../../components/ui";
import TextInputComponent from "../../components/TextInput/TextInput";
import { Colors } from "../../constants/colors";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useDealerRegisterMutation, useLazyResolveGarageByCodeQuery } from "../../services/authApi";
import { AuthStackParamList } from "../../navigation/AuthNavigator";
import { validatePhone, validateEmail } from "../../utils/validation";
import { useAppSelector } from "../../redux/hooks/useAppSelector";
import { StyleSheet } from "react-native";
import { Typography } from "../../constants/typo";
import { spacing } from "../../design-system/spacing";

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
    avatar_url: "",
  });

  // Error states
  const [errors, setErrors] = useState({
    garage_code: "",
    name: "",
    phone: "",
    password: "",
    email: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [dealerRegister] = useDealerRegisterMutation();
  const [resolveGarageByCode] = useLazyResolveGarageByCodeQuery();

  const showError = (msg: string) => {
    if (msg) Alert.alert("Lỗi nhập liệu", msg);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Real-time validation
    let error = "";
    if (field === "garage_code" && value.trim().length > 0 && value.trim().length < 3) {
      error = "Mã gara phải có ít nhất 3 ký tự";
    }
    if (field === "name" && value.trim().length > 0 && value.trim().length < 2) {
      error = "Tên đại lý phải có ít nhất 2 ký tự";
    }
    if (field === "phone" && value.trim().length > 0) {
      if (!/^[0-9]{10,11}$/.test(value)) {
        error = "Số điện thoại phải có 10–11 chữ số";
      }
    }
    if (field === "password" && value.trim().length > 0 && value.length < 6) {
      error = "Mật khẩu phải có ít nhất 6 ký tự";
    }
    if (field === "email" && value.trim().length > 0) {
      const emailResult = validateEmail(value);
      if (!emailResult.isValid) error = emailResult.error || "Email không hợp lệ";
    }

    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const isFormValid =
    formData.garage_code.trim().length >= 3 &&
    formData.name.trim().length >= 2 &&
    /^[0-9]{10,11}$/.test(formData.phone) &&
    formData.password.length >= 6 &&
    !errors.garage_code &&
    !errors.name &&
    !errors.phone &&
    !errors.password &&
    !errors.email;

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
      Alert.alert(
        "Lỗi",
        error?.data?.message || "Không thể kết nối đến máy chủ. Vui lòng thử lại sau."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderErrorIcon = (field: keyof typeof errors, value: string) =>
    errors[field] && value.length > 0 ? (
      <TouchableOpacity onPress={() => showError(errors[field])}>
        <View style={styles.errorIcon}>
          <Text style={styles.errorIconText}>!</Text>
        </View>
      </TouchableOpacity>
    ) : undefined;

  // Smaller text and height for all inputs on this screen
  const smallInput = { fontSize: 13, minHeight: 44, paddingVertical: 10, textAlignVertical: 'center' as const };

  return (
    <Screen
      showBackButton
      statusBarStyle="light-content"
    >
      <FormContainer
        keyboardAvoiding
        withScroll
        paddingCustom={{ horizontal: 'xl', top: 'lg', bottom: 'xl' }}
        dismissKeyboardOnPress
      >
        <View style={{ marginTop: 30 }}>
          <Text style={styles.welcomeText}>Trở thành Đối tác</Text>

          <View style={styles.logoFrame}>
            <Image
              style={styles.logo}
              source={require('../../assets/logo.png')}
              resizeMode="contain"
            />
          </View>

          <View style={styles.inputContainer}>
            {/* Hàng 1: Mã gara (nhỏ) + Tên đại lý (lớn) */}
            <View style={styles.row}>
              <View style={styles.colSmall}>
                <TextInputComponent
                  value={formData.garage_code}
                  onChangeText={(v) => handleInputChange('garage_code', v.toUpperCase())}
                  placeholder="Mã gara"
                  autoCapitalize="characters"
                  maxLength={10}
                  focusBorderColor={Colors.accent.yellow}
                  style={{ marginBottom: 0 }}
                  inputStyle={smallInput}
                  iconLeft={<Ionicons name="qr-code" size={18} color="#006DB6" />}
                  iconRight={renderErrorIcon('garage_code', formData.garage_code)}
                />
              </View>
              <View style={styles.colLarge}>
                <TextInputComponent
                  value={formData.name}
                  onChangeText={(v) => handleInputChange('name', v)}
                  placeholder="Tên đại lý"
                  focusBorderColor={Colors.accent.yellow}
                  style={{ marginBottom: 0 }}
                  inputStyle={smallInput}
                  iconLeft={<Ionicons name="person" size={18} color="#006DB6" />}
                  iconRight={renderErrorIcon('name', formData.name)}
                />
              </View>
            </View>

            <TextInputComponent
              value={formData.phone}
              onChangeText={(v) => handleInputChange('phone', v)}
              placeholder="Số điện thoại"
              keyboardType="phone-pad"
              maxLength={11}
              focusBorderColor={Colors.accent.yellow}
              inputStyle={smallInput}
              iconLeft={<Ionicons name="call" size={20} color="#006DB6" />}
              iconRight={renderErrorIcon('phone', formData.phone)}
            />
            <TextInputComponent
              value={formData.password}
              onChangeText={(v) => handleInputChange('password', v)}
              placeholder="Mật khẩu"
              secureTextEntry
              focusBorderColor={Colors.accent.yellow}
              inputStyle={smallInput}
              iconLeft={<Ionicons name="lock-closed" size={20} color="#006DB6" />}
              iconRight={renderErrorIcon('password', formData.password)}
            />
            <TextInputComponent
              value={formData.email}
              onChangeText={(v) => handleInputChange('email', v)}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              focusBorderColor={Colors.accent.yellow}
              inputStyle={smallInput}
              iconLeft={<Ionicons name="mail" size={20} color="#006DB6" />}
              iconRight={renderErrorIcon('email', formData.email)}
            />
            <TextInputComponent
              value={formData.address}
              onChangeText={(v) => handleInputChange('address', v)}
              placeholder="Địa chỉ"
              focusBorderColor={Colors.accent.yellow}
              inputStyle={smallInput}
              iconLeft={<Ionicons name="location" size={20} color="#006DB6" />}
            />
          </View>

          <View style={styles.actions}>
            <Button
              title="Đăng ký Đại lý"
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
            <Text style={styles.registerPrompt}>Đã có tài khoản?</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.registerLink}>Đăng nhập</Text>
            </TouchableOpacity>
          </View>
        </View>
      </FormContainer>
    </Screen>
  );
}

const styles = StyleSheet.create({
  welcomeText: {
    fontSize: 24,
    lineHeight: 28,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.primary,
    marginBottom: spacing.sm,
  },
  logoFrame: {
    width: 160,
    height: 120,
    alignSelf: "center",
    marginVertical: spacing.lg,
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  inputContainer: {
    width: "100%",
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  colSmall: {
    flex: 4,
  },
  colLarge: {
    flex: 6,
  },
  errorIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ff4d4f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorIconText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    lineHeight: 15,
  },
  actions: {
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  signup: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.lg,
  },
  registerPrompt: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.text.secondary,
  },
  registerLink: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.primary,
    marginLeft: 5,
  },
});
