// src/screens/AccountInfo/AccountInfoScreen.tsx
import React, { useState, useEffect } from "react";
import { View, Text, Pressable, Image, StatusBar, ScrollView, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typo";
import Header from "../../components/Header";
import TextInput from "../../components/TextInput/TextInput";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from "./styles";
import { useAppSelector } from "../../redux/hooks/useAppSelector";
import { RootState } from "../../redux/stores";
import { useAppDispatch } from "../../redux/hooks/useAppDispatch";
import { logout, updateUserProfile } from "../../redux/slices/authSlice";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { AppStackParamList } from "../../navigation/AppNavigator";
import { useUpdateProfileMutation, useDeleteAccountMutation } from "../../services/customerApi";
import { pickImageFromGallery, pickImageFromCamera, showImagePickerOptions, validateImageSize, createImageFormData } from "../../utils/imageUpload";
import { Asset } from 'react-native-image-picker';
import { API_BASE_URL } from "../../constants/config";
import { clearAuthStorage } from "../../utils/authStorage";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

const AccountInfoScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();

  // Get current user data from Redux
  const userName = useAppSelector((state: RootState) => state.auth.userName || '');
  const userPhone = useAppSelector((state: RootState) => state.auth.userPhone || '');
  const avatarUrl = useAppSelector((state: RootState) => state.auth.avatarUrl || '');
  const userEmail = useAppSelector((state: RootState) => state.auth.userEmail || '');

  // Form state
  const [name, setName] = useState(userName);
  const [email, setEmail] = useState(userEmail);
  const [selectedAvatar, setSelectedAvatar] = useState<string>(avatarUrl);
  const [avatarAsset, setAvatarAsset] = useState<Asset | null>(null);

  // API mutations
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();

  // Upload state
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Handle avatar selection
  const handleAvatarPress = () => {
    showImagePickerOptions(
      async () => {
        const image = await pickImageFromCamera();
        if (image && validateImageSize(image, 5)) {
          setAvatarAsset(image);
          setSelectedAvatar(image.uri || '');
        }
      },
      async () => {
        const images = await pickImageFromGallery({ selectionLimit: 1 });
        if (images.length > 0 && validateImageSize(images[0], 5)) {
          setAvatarAsset(images[0]);
          setSelectedAvatar(images[0].uri || '');
        }
      }
    );
  };

  // Upload avatar to server
  const uploadAvatar = async (asset: Asset): Promise<string | null> => {
    try {
      setIsUploadingAvatar(true);
      const formData = createImageFormData(asset, 'image');

      const response = await fetch(`${API_BASE_URL}/upload/single`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();
      
      if (data.success && data.image_url) {
        return data.image_url;
      } else {
        throw new Error(data.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      Alert.alert('Lỗi', 'Không thể tải ảnh lên. Vui lòng thử lại.');
      return null;
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Handle save profile
  const handleSaveProfile = async () => {
    try {
      let avatarUrlToUpdate = selectedAvatar;

      // Upload new avatar if changed
      if (avatarAsset) {
        const uploadedUrl = await uploadAvatar(avatarAsset);
        if (!uploadedUrl) {
          return; // Upload failed
        }
        avatarUrlToUpdate = uploadedUrl;
      }

      // Prepare update data
      const updateData: any = { phone: userPhone };
      
      if (name !== userName) {
        updateData.name = name;
      }
      if (email !== userEmail) {
        updateData.email = email;
      }
      if (avatarUrlToUpdate !== avatarUrl) {
        updateData.avatar_url = avatarUrlToUpdate;
      }

      // Check if there's anything to update
      if (Object.keys(updateData).length === 1) { // Only has phone
        Alert.alert('Thông báo', 'Không có thay đổi nào để cập nhật.');
        return;
      }

      // Call API to update profile
      const result = await updateProfile(updateData).unwrap();

      if (result.success) {
        // Update Redux store
        dispatch(updateUserProfile({
          userName: result.customer.name,
          userEmail: result.customer.email,
          avatarUrl: result.customer.avatar_url,
        }));

        Alert.alert('Thành công', result.message || 'Cập nhật thông tin thành công!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert('Lỗi', error.message || 'Không thể cập nhật thông tin. Vui lòng thử lại.');
    }
  };

  // Handle delete account with confirmation
  const handleDeleteAccount = () => {
    Alert.alert(
      'Xác nhận xóa tài khoản',
      'Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác và sẽ xóa toàn bộ dữ liệu của bạn bao gồm:\n\n• Thông tin tài khoản\n• Danh sách xe\n• Lịch sử đơn hàng\n• Bảo hành\n• Thông báo\n\nLưu ý: Nếu bạn có đơn hàng đang xử lý, bạn không thể xóa tài khoản.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa tài khoản',
          style: 'destructive',
          onPress: () => confirmDeleteAccount(),
        },
      ]
    );
  };

  const confirmDeleteAccount = async () => {
    try {
      const result = await deleteAccount({ phone: userPhone, confirm: true }).unwrap();

      if (result.success) {
        Alert.alert(
          'Tài khoản đã bị xóa',
          `Tài khoản của bạn đã được xóa thành công.\n\nDữ liệu đã xóa:\n• Xe: ${result.deleted_data.vehicles_deleted}\n• Đơn hàng: ${result.deleted_data.orders_deleted}\n• Bảo hành: ${result.deleted_data.warranties_deleted}\n• Thông báo: ${result.deleted_data.notifications_deleted}`,
          [
            {
              text: 'OK',
              onPress: async () => {
                await clearAuthStorage(); // Xóa dữ liệu persist
                dispatch(logout());
              },
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('Error deleting account:', error);
      
      // Parse error message
      const errorMessage = error.message || error.data?.error || 'Không thể xóa tài khoản.';
      
      if (errorMessage.includes('đơn hàng đang hoạt động') || errorMessage.includes('active orders')) {
        Alert.alert(
          'Không thể xóa tài khoản',
          'Bạn có đơn hàng đang được xử lý. Vui lòng hoàn thành hoặc hủy các đơn hàng này trước khi xóa tài khoản.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Lỗi', errorMessage);
      }
    }
  };

  const isLoading = isUpdating || isDeleting || isUploadingAvatar;

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background.red} />
      
      <Header title="Thông tin tài khoản" showBackButton />
      
      <ScrollView style={styles.body} contentContainerStyle={styles.scrollContent}>
        <View style={styles.form}>
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <Pressable onPress={handleAvatarPress} style={styles.avatarContainer}>
              <Image 
                source={{ uri: selectedAvatar || 'https://i.pravatar.cc/150?img=12' }} 
                style={styles.avatar}
                resizeMode="cover"
              />
              <View style={styles.avatarEditIcon}>
                <Ionicons name="camera" size={20} color={Colors.background.light} />
              </View>
            </Pressable>
            <Text style={styles.avatarHint}>Nhấn để thay đổi ảnh đại diện</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formSection}>
            <Text style={styles.label}>Số điện thoại</Text>
            <TextInput
              value={userPhone}
              editable={false}
              placeholder="Số điện thoại"
              style={styles.disabledInput}
            />
            <Text style={styles.hint}>Số điện thoại không thể thay đổi</Text>

            <Text style={styles.label}>Họ và tên</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Nhập họ và tên"
            />

            <Text style={styles.label}>Email (tùy chọn)</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Nhập email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Save Button */}
          <Pressable
            style={({ pressed }) => [
              styles.saveButton,
              pressed && styles.saveButtonPressed,
              isLoading && styles.saveButtonDisabled,
            ]}
            onPress={handleSaveProfile}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.background.light} />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color={Colors.background.light} />
                <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
              </>
            )}
          </Pressable>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Delete Account Section */}
          <View style={styles.dangerZone}>
            <Text style={styles.dangerZoneTitle}>Vùng nguy hiểm</Text>
            <Text style={styles.dangerZoneDescription}>
              Xóa tài khoản sẽ xóa vĩnh viễn toàn bộ dữ liệu của bạn. Hành động này không thể hoàn tác.
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.deleteButton,
                pressed && styles.deleteButtonPressed,
                isLoading && styles.deleteButtonDisabled,
              ]}
              onPress={handleDeleteAccount}
              disabled={isLoading}
            >
              {isDeleting ? (
                <ActivityIndicator color={Colors.error} />
              ) : (
                <>
                  <Ionicons name="trash-outline" size={20} color={Colors.error} />
                  <Text style={styles.deleteButtonText}>Xóa tài khoản</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AccountInfoScreen;

