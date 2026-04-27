import React, { useMemo, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Button } from "../../components/ui";
import { AuthStackParamList } from "../../navigation/AuthNavigator";
import { CheckPhoneRole } from "../../services/authApi";
import { useLoginCustomerMutation } from "../../services";
import { useAppDispatch } from "../../redux/hooks/useAppDispatch";
import { saveAndSetActiveGarage, upsertSavedGarage } from "../../redux/slices/garageContextSlice";
import { createCustomerLoginContract } from "./loginFlowService";
import AuthShell from "./AuthShell";
import { loginSharedStyles } from "./loginSharedStyles";

type RoleSelectRouteProp = RouteProp<AuthStackParamList, "RoleSelect">;
type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

const roleTitles: Record<CheckPhoneRole, string> = {
  garage_manager: "Quan ly gara",
  garage_admin: "Admin gara",
  dealer: "Dai ly",
  employee: "Nhan vien",
  customer: "Khach hang",
};

const rolePriority: Record<CheckPhoneRole, number> = {
  garage_manager: 1,
  garage_admin: 2,
  dealer: 3,
  employee: 4,
  customer: 5,
};

export default function RoleSelectScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoleSelectRouteProp>();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [loginCustomer] = useLoginCustomerMutation();

  const { phone, roles, accounts } = route.params;

  const sortedRoles = useMemo(
    () => [...roles].sort((a, b) => rolePriority[a] - rolePriority[b]),
    [roles]
  );

  const completeCustomerLogin = async () => {
    const loginResult = await loginCustomer({ phone }).unwrap();
    const contract = createCustomerLoginContract(loginResult, phone);

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

  const onSelectRole = async (role: CheckPhoneRole) => {
    if (isLoading) return;

    if (role === "customer") {
      setIsLoading(true);
      try {
        await completeCustomerLogin();
      } catch (error: any) {
        Alert.alert("Loi", error?.data?.error || error?.data?.message || "Dang nhap khach hang that bai.");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (role === "employee") {
      const employee = accounts?.employee;
      navigation.navigate("EmployeePassword", {
        phone,
        employeeData: employee
          ? {
              id: Number(employee.id || 0),
              name: employee.name || "Employee",
              phone,
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
        phone,
        garageCode: dealer?.garage_code,
      });
      return;
    }

    navigation.navigate("ManagerPassword", {
      phone,
      expectedRole: role === "garage_admin" ? "garage_admin" : "garage_manager",
    });
  };

  return (
    <AuthShell title="Chon vai tro dang nhap" subtitle={`So ${phone} co nhieu vai tro. Hay chon vai tro de tiep tuc.`}>
      <Text style={loginSharedStyles.roleIntroText}>Thong tin tai khoan:</Text>

      <View style={loginSharedStyles.roleList}>
        {sortedRoles.map((role) => (
          <TouchableOpacity
            key={role}
            onPress={() => onSelectRole(role)}
            style={loginSharedStyles.roleCard}
            activeOpacity={0.8}
          >
            <Text style={loginSharedStyles.roleTitle}>{roleTitles[role]}</Text>
            {!!accounts?.[role]?.name && <Text style={loginSharedStyles.roleMeta}>Ten: {accounts[role].name}</Text>}
            {!!accounts?.[role]?.garage_id && <Text style={loginSharedStyles.roleMeta}>Garage ID: {accounts[role].garage_id}</Text>}
          </TouchableOpacity>
        ))}
      </View>

      <View style={loginSharedStyles.secondaryAction}>
        <Button title="Quay lai" onPress={() => navigation.goBack()} variant="secondary" fullWidth disabled={isLoading} />
      </View>
    </AuthShell>
  );
}
