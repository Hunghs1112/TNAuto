// src/screens/Login/ChangePasswordScreen.tsx
import React, { useState } from "react";
import { View, Text, Alert, StyleSheet } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Colors } from "../../constants/colors";
import { Button } from "../../components/ui";
import TextInputComponent from "../../components/TextInput/TextInput";
import { useChangePasswordMutation } from "../../services/employeeApi";
import AuthShell from "./AuthShell";
import { loginSharedStyles } from "./loginSharedStyles";
import { AppStackParamList } from "../../navigation/AppNavigator";

type ChangePasswordRouteProp = RouteProp<AppStackParamList, "ChangePassword">;
type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

interface ValidationErrors {
  current?: string;
  new?: string;
  confirm?: string;
}

export default function ChangePasswordScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ChangePasswordRouteProp>();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<ValidationErrors>({});

  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const validate = (): boolean => {
    const nextErrors: ValidationErrors = {};

    if (!currentPassword) {
      nextErrors.current = "Vui lòng nhập mật khẩu hiện tại";
    }

    if (newPassword.length < 6 || newPassword.length > 50) {
      nextErrors.new = "Mật khẩu mới phải từ 6 đến 50 ký tự";
    } else if (newPassword === currentPassword) {
      nextErrors.new = "Mật khẩu mới không được trùng mật khẩu hiện tại";
    }

    if (confirmPassword !== newPassword) {
      nextErrors.confirm = "Mật khẩu xác nhận không khớp với mật khẩu mới";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      }).unwrap();

      Alert.alert("Thành công", "Đổi mật khẩu thành công", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      const message =
        error?.data?.error ||
        error?.data?.message ||
        "Đổi mật khẩu thất bại. Vui lòng thử lại.";
      Alert.alert("Lỗi", message);
    }
  };

  return (
    <AuthShell
      title="Đổi mật khẩu"
      subtitle="Nhập mật khẩu hiện tại và mật khẩu mới"
    >
      <View style={loginSharedStyles.inputContainer}>
        {/* Mật khẩu hiện tại */}
        <View>
          <TextInputComponent
            value={currentPassword}
            onChangeText={(text) => {
              setCurrentPassword(text);
              if (errors.current) setErrors((prev) => ({ ...prev, current: undefined }));
            }}
            placeholder="Mật khẩu hiện tại"
            placeholderTextColor={Colors.text.placeholder}
            secureTextEntry
            autoFocus
            focusBorderColor={Colors.accent.yellow}
          />
          {!!errors.current && (
            <Text style={styles.errorText}>{errors.current}</Text>
          )}
        </View>

        {/* Mật khẩu mới */}
        <View>
          <TextInputComponent
            value={newPassword}
            onChangeText={(text) => {
              setNewPassword(text);
              if (errors.new) setErrors((prev) => ({ ...prev, new: undefined }));
            }}
            placeholder="Mật khẩu mới"
            placeholderTextColor={Colors.text.placeholder}
            secureTextEntry
            focusBorderColor={Colors.accent.yellow}
          />
          {!!errors.new && (
            <Text style={styles.errorText}>{errors.new}</Text>
          )}
        </View>

        {/* Xác nhận mật khẩu mới */}
        <View>
          <TextInputComponent
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (errors.confirm) setErrors((prev) => ({ ...prev, confirm: undefined }));
            }}
            placeholder="Xác nhận mật khẩu mới"
            placeholderTextColor={Colors.text.placeholder}
            secureTextEntry
            focusBorderColor={Colors.accent.yellow}
          />
          {!!errors.confirm && (
            <Text style={styles.errorText}>{errors.confirm}</Text>
          )}
        </View>
      </View>

      <View style={loginSharedStyles.actions}>
        <Button
          title="Xác nhận đổi mật khẩu"
          onPress={handleSubmit}
          loading={isLoading}
          disabled={isLoading}
          variant="primary"
          fullWidth
        />
      </View>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  errorText: {
    color: Colors.status.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});
