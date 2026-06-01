// src/screens/Auth/LoginScreen.tsx - Unified login screen with automatic user type detection
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
import { useCheckPhoneMutation, useLoginCustomerMutation } from "../../services";
import { useAppDispatch } from "../../redux/hooks/useAppDispatch";
import { saveAndSetActiveGarage, upsertSavedGarage } from "../../redux/slices/garageContextSlice";
import { createCustomerLoginContract } from "./loginFlowService";
import { AuthStackParamList } from "../../navigation/AuthNavigator";

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, "Login">;


export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [checkPhone] = useCheckPhoneMutation();
  const [loginCustomer] = useLoginCustomerMutation();

  // Validate phone number
  const validatePhone = (phoneNumber: string) => {
    if (!phoneNumber.trim()) {
      setPhoneError("");
      return false;
    }
    if (!/^[0-9]{10,11}$/.test(phoneNumber)) {
      setPhoneError("Số điện thoại phải có 10 hoặc 11 chữ số");
      return false;
    }
    setPhoneError("");
    return true;
  };

  // Check if form is valid
  const isFormValid = phone.trim().length >= 10 && !phoneError;

  const showError = (errorMsg: string) => {
    if (errorMsg) {
      Alert.alert("Lỗi nhập liệu", errorMsg);
    }
  };

  // Handle single-role customer login directly from this screen
  const handleCustomerLogin = async (normalizedPhone: string) => {
    const loginResult = await loginCustomer({ phone: normalizedPhone }).unwrap();
    const contract = createCustomerLoginContract(loginResult, normalizedPhone);

    if (!contract || !contract.state.isReady) {
      Alert.alert("Lỗi", "Đăng nhập thất bại. Vui lòng thử lại.");
      return;
    }

    contract.content.linkedGarages.forEach((payload, index) => {
      if (index === 0) {
        dispatch(saveAndSetActiveGarage(payload));
      } else {
        dispatch(upsertSavedGarage(payload));
      }
    });

    contract.actions.complete({ dispatch, navigation });
  };

  const handleLogin = async () => {
    const normalizedPhone = phone.trim();

    if (!normalizedPhone) {
      Alert.alert("Lỗi", "Vui lòng nhập số điện thoại!");
      return;
    }

    if (!validatePhone(normalizedPhone)) {
      Alert.alert("Lỗi", phoneError || "Số điện thoại không hợp lệ!");
      return;
    }

    setIsLoading(true);
    try {
      // Step 1: check phone to determine which roles this number has
      const checkResult = await checkPhone({ phone: normalizedPhone }).unwrap();

      if (!checkResult.success || !checkResult.roles || checkResult.roles.length === 0) {
        Alert.alert(
          "Số điện thoại chưa đăng ký",
          "Số điện thoại này chưa có tài khoản. Bạn có muốn đăng ký không?",
          [
            { text: "Đóng", style: "cancel" },
            { text: "Đăng ký", onPress: () => navigation.navigate("Register") },
          ],
        );
        return;
      }

      const { roles, accounts } = checkResult;

      // Step 2: if multiple roles → let user pick
      if (roles.length > 1) {
        navigation.navigate("RoleSelect", { phone: normalizedPhone, roles, accounts });
        return;
      }

      // Step 3: single role — route directly
      const role = roles[0];

      if (role === "customer") {
        await handleCustomerLogin(normalizedPhone);
        return;
      }

      if (role === "employee") {
        const employee = accounts?.employee;
        navigation.navigate("EmployeePassword", {
          phone: normalizedPhone,
          employeeData: employee
            ? {
                id: Number(employee.id || 0),
                name: employee.name || "Employee",
                phone: normalizedPhone,
                avatar_url: (employee as any).avatar_url,
                position: (employee as any).position,
              }
            : undefined,
        });
        return;
      }

      if (role === "dealer") {
        const dealer = accounts?.dealer;
        navigation.navigate("DealerLogin", {
          phone: normalizedPhone,
          garageCode: dealer?.garage_code,
        });
        return;
      }

      // garage_manager or garage_admin
      navigation.navigate("ManagerPassword", {
        phone: normalizedPhone,
        expectedRole: role === "garage_admin" ? "garage_admin" : "garage_manager",
      });
    } catch (error: any) {
      const backendMessage = error?.data?.error || error?.data?.message || error?.error;
      const message =
        backendMessage ||
        "Không thể đăng nhập. Vui lòng kiểm tra số điện thoại hoặc thử lại.";

      Alert.alert(
        "Đăng nhập thất bại",
        message,
        [
          { text: "Đóng", style: "cancel" },
          {
            text: "Đăng ký",
            onPress: () => navigation.navigate("Register"),
          },
        ],
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    navigation.navigate("Register");
  };

  return (
    <Screen
      statusBarStyle="light-content"
      showBackButton
    >
      <FormContainer
        keyboardAvoiding={false}
        withScroll
        paddingCustom={{ horizontal: 'xl', top: 'lg', bottom: 'xl' }}
        dismissKeyboardOnPress
      >
        <View style={{ marginTop: 20 }}>
        <Text style={styles.welcomeText}>Chào mừng trở lại</Text>
        <Text style={styles.subtitle}>Nhập số điện thoại để tiếp tục</Text>

        <View style={styles.logoFrame}>
          <Image
            style={styles.logo}
            source={require('../../assets/logo.png')}
            resizeMode="contain"
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInputComponent
            value={phone}
            onChangeText={(text: string) => {
              setPhone(text);
              validatePhone(text);
            }}
            placeholder="Số điện thoại"
            placeholderTextColor={Colors.text.placeholder}
            keyboardType="phone-pad"
            focusBorderColor={Colors.accent.yellow}
            maxLength={11}
            iconLeft={
              <Ionicons name="call" size={20} color="#006DB6" />
            }
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
        </View>

        <View style={styles.actions}>
          <Button
            title="Tiếp tục"
            onPress={handleLogin}
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
          <Text style={styles.registerPrompt}>Bạn chưa có tài khoản?</Text>
          <TouchableOpacity onPress={handleRegister}>
            <Text style={styles.registerLink}>Đăng ký</Text>
          </TouchableOpacity>
        </View>
        </View>
      </FormContainer>
    </Screen>
  );
}
