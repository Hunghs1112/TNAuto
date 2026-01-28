// src/screens/AccountInfo/AccountInfoScreen.tsx
import React, { useState } from "react";
import { 
  View, 
  Text, 
  Pressable, 
  Image, 
  ScrollView, 
  Alert, 
  ActivityIndicator, 
  Modal,
  TouchableOpacity
} from "react-native";
import { Screen, FormContainer } from "../../components/layout";
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typo";
import TextInput from "../../components/TextInput/TextInput";
import { Button } from "../../components/ui";
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { styles } from "./styles";
import { useAppSelector } from "../../redux/hooks/useAppSelector";
import { RootState } from "../../redux/stores";
import { useAppDispatch } from "../../redux/hooks/useAppDispatch";
import { logout, updateUserProfile } from "../../redux/slices/authSlice";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { AppStackParamList } from "../../navigation/AppNavigator";
import { useUpdateProfileMutation } from "../../services/customerApi";
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

  // Upload state
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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

  const isLoading = isUpdating || isUploadingAvatar;
  const PLACEHOLDER_AVATAR = 'https://i.pravatar.cc/150?img=12';

  return (
    <Screen
      headerTitle="Thông tin tài khoản"
      showBackButton
      safeAreaTopColor={Colors.primary}
      statusBarStyle="light-content"
    >
      <FormContainer
        keyboardAvoiding
        withScroll
        padding={0}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        dismissKeyboardOnPress
      >
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <Pressable 
              onPress={handleAvatarPress} 
              onLongPress={() => {
                if (!isUploadingAvatar && (selectedAvatar || PLACEHOLDER_AVATAR)) {
                  setSelectedImage(selectedAvatar || PLACEHOLDER_AVATAR);
                }
                }}
              style={styles.avatarPressable}
              disabled={isUploadingAvatar}
            >
              <View style={styles.avatarContainer}>
                {isUploadingAvatar ? (
                  <View style={styles.avatarLoading}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                  </View>
                ) : (
                  <>
                    <Image 
                      source={{ uri: selectedAvatar || PLACEHOLDER_AVATAR }} 
                      style={styles.avatar}
                      resizeMode="cover"
                    />
                    <View style={styles.avatarEditBadge}>
                      <Ionicons name="camera" size={18} color={Colors.background.light} />
                    </View>
                  </>
                )}
              </View>
            </Pressable>
            <Text style={styles.avatarHint}>Nhấn để thay đổi ảnh đại diện</Text>
          </View>

          {/* Profile Card */}
          <View style={styles.profileCard}>
            <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
            
            {/* Phone Field */}
            <View style={styles.fieldContainer}>
              <View style={styles.fieldLabelRow}>
                <Ionicons name="call-outline" size={18} color={Colors.text.secondary} />
                <Text style={styles.fieldLabel}>Số điện thoại</Text>
              </View>
              <View style={styles.disabledField}>
                <Text style={styles.disabledFieldText}>{userPhone}</Text>
              </View>
              <Text style={styles.fieldHint}>Số điện thoại không thể thay đổi</Text>
            </View>

            {/* Name Field */}
            <View style={styles.fieldContainer}>
              <View style={styles.fieldLabelRow}>
                <Ionicons name="person-outline" size={18} color={Colors.text.secondary} />
                <Text style={styles.fieldLabel}>Họ và tên</Text>
              </View>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Nhập họ và tên"
                style={styles.input}
              />
            </View>

            {/* Email Field */}
            <View style={styles.fieldContainer}>
              <View style={styles.fieldLabelRow}>
                <Ionicons name="mail-outline" size={18} color={Colors.text.secondary} />
                <Text style={styles.fieldLabel}>Email (tùy chọn)</Text>
              </View>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Nhập email"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>
          </View>

          {/* Save Button */}
          <View style={styles.actionSection}>
            <Button
              title={isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
              onPress={handleSaveProfile}
              disabled={isLoading}
              loading={isUpdating}
              variant="primary"
              fullWidth
            />
          </View>
      </FormContainer>

      {/* Full Screen Image Modal */}
      <Modal
        visible={!!selectedImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalCloseButton} 
            onPress={() => setSelectedImage(null)}
          >
            <Ionicons name="close-outline" size={30} color={Colors.background.light} />
          </TouchableOpacity>
          {selectedImage && (
            <Image source={{ uri: selectedImage }} style={styles.fullScreenImage} resizeMode="contain" />
          )}
        </View>
      </Modal>
    </Screen>
  );
};

export default AccountInfoScreen;
