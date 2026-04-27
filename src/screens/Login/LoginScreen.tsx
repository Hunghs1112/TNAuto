import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { Colors } from "../../constants/colors";
import { Button } from "../../components/ui/Button";
import TextInputComponent from "../../components/TextInput/TextInput";
import AuthShell from "./AuthShell";
import { loginSharedStyles } from "./loginSharedStyles";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useLoginCustomerMutation } from "../../services";
import { useCheckPhoneMutation, CheckPhoneRole } from "../../services/authApi";
import { useAppDispatch } from "../../redux/hooks/useAppDispatch";
import { saveAndSetActiveGarage, upsertSavedGarage } from "../../redux/slices/garageContextSlice";
import { AuthStackParamList } from "../../navigation/AuthNavigator";
import { createCustomerLoginContract, mapCustomerLoginFailure } from "./loginFlowService";
import { cleanPhone } from "../../utils/validation";

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, "Login">;

function sortRolesByPriority(roles: CheckPhoneRole[]): CheckPhoneRole[] {
  const priority: Record<CheckPhoneRole, number> = {
    garage_manager: 1,
    garage_admin: 2,
    dealer: 3,
    employee: 4,
    customer: 5,
  };

  return [...roles].sort((a, b) => priority[a] - priority[b]);
}

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [loginCustomer] = useLoginCustomerMutation();
  const [checkPhone] = useCheckPhoneMutation();

  const completeCustomerLogin = async (normalizedPhone: string) => {
    const loginResult = await loginCustomer({ phone: normalizedPhone }).unwrap();
    const contract = createCustomerLoginContract(loginResult, normalizedPhone);

    if (!contract || !contract.state.isReady) {
      Alert.alert("Loi", "Dang nhap that bai. Vui long thu lai.");
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

  const routeByRole = async (role: CheckPhoneRole, normalizedPhone: string, accounts?: Record<string, any>) => {
    if (role === "customer") {
      await completeCustomerLogin(normalizedPhone);
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
              avatar_url: employee.avatar_url,
              position: employee.position,
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

    navigation.navigate("ManagerPassword", {
      phone: normalizedPhone,
      expectedRole: role === "garage_admin" ? "garage_admin" : "garage_manager",
    });
  };

  const handleLogin = async () => {
    const normalizedPhone = cleanPhone(phone || "");

    if (!normalizedPhone) {
      Alert.alert("Loi", "Vui long nhap so dien thoai.");
      return;
    }

    setIsLoading(true);
    try {
      const checkResult = await checkPhone({ phone: normalizedPhone }).unwrap();
      const roles = sortRolesByPriority(Array.isArray(checkResult.roles) ? checkResult.roles : []);

      if (roles.length === 0) {
        Alert.alert(
          "Chua co tai khoan",
          "So dien thoai nay chua co tai khoan. Ban co muon dang ky khach hang?",
          [
            { text: "Dong", style: "cancel" },
            { text: "Dang ky", onPress: () => navigation.navigate("Register") },
          ]
        );
        return;
      }

      if (roles.length === 1) {
        await routeByRole(roles[0], normalizedPhone, checkResult.accounts as Record<string, any> | undefined);
        return;
      }

      navigation.navigate("RoleSelect", {
        phone: normalizedPhone,
        roles,
        accounts: checkResult.accounts as Record<string, any> | undefined,
      });
    } catch (error: any) {
      if (error?.status === 404) {
        Alert.alert(
          "Chua co tai khoan",
          "So dien thoai nay chua co tai khoan. Ban co muon dang ky khach hang?",
          [
            { text: "Dong", style: "cancel" },
            { text: "Dang ky", onPress: () => navigation.navigate("Register") },
          ]
        );
      } else {
        const failure = mapCustomerLoginFailure(error);
        Alert.alert(failure.title, failure.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    navigation.navigate("Register");
  };

  return (
    <AuthShell
      title="Chao mung tro lai"
      subtitle="Nhap so dien thoai de tiep tuc"
      footer={
        <View style={loginSharedStyles.signup}>
          <Text style={loginSharedStyles.registerPrompt}>Ban chua co tai khoan?</Text>
          <TouchableOpacity onPress={handleRegister}>
            <Text style={loginSharedStyles.registerLink}>Dang ky</Text>
          </TouchableOpacity>
        </View>
      }
    >
      <View style={loginSharedStyles.inputContainer}>
        <TextInputComponent
          value={phone}
          onChangeText={setPhone}
          placeholder="So dien thoai"
          placeholderTextColor={Colors.text.placeholder}
          keyboardType="phone-pad"
          focusBorderColor={Colors.accent.yellow}
        />
      </View>

      <View style={loginSharedStyles.actions}>
        <Button title="Tiep tuc" onPress={handleLogin} loading={isLoading} disabled={isLoading} variant="primary" fullWidth />
      </View>
    </AuthShell>
  );
}
