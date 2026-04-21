// src/screens/AccountInfo/AccountInfoScreen.tsx
import React, { useState } from "react";
import { 
  View, 
  Text, 
  Pressable, 
  Image, 
  Alert, 
  ActivityIndicator, 
  Modal,
  TouchableOpacity
} from "react-native";
import { Screen, FormContainer } from "../../components/layout";
import { Colors } from "../../constants/colors";
import TextInput from "../../components/TextInput/TextInput";
import DateInput from "../../components/TextInput/DateInput";
import { Button } from "../../components/ui";
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { styles } from "./styles";
import { useAppSelector } from "../../redux/hooks/useAppSelector";
import { RootState } from "../../redux/stores";
import { useAppDispatch } from "../../redux/hooks/useAppDispatch";
import { updateUserProfile } from "../../redux/slices/authSlice";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { AppStackParamList } from "../../navigation/AppNavigator";
import { 
  useUpdateProfileMutation,
  useGetCustomerDriverLicenseQuery,
  useUpsertCustomerDriverLicenseMutation,
  useDeleteCustomerDriverLicenseMutation,
  useGetUiVisibilityQuery,
} from "../../services/customerApi";
import { pickImageFromGallery, pickImageFromCamera, showImagePickerOptions, validateImageSize, createImageFormData } from "../../utils/imageUpload";
import { Asset } from 'react-native-image-picker';
import { API_BASE_URL } from "../../constants/config";
import limitedFetch from '../../utils/limitedFetch';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

const AccountInfoScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();

  // Get current user data from Redux
  const userName = useAppSelector((state: RootState) => state.auth.userName || '');
  const userPhone = useAppSelector((state: RootState) => state.auth.userPhone || '');
  const avatarUrl = useAppSelector((state: RootState) => state.auth.avatarUrl || '');
  const userEmail = useAppSelector((state: RootState) => state.auth.userEmail || '');
  const userId = useAppSelector((state: RootState) => state.auth.userId || '');
  const userType = useAppSelector((state: RootState) => state.auth.userType || '');

  // Form state
  const [name, setName] = useState(userName);
  const [email, setEmail] = useState(userEmail);
  const [selectedAvatar, setSelectedAvatar] = useState<string>(avatarUrl);
  const [avatarAsset, setAvatarAsset] = useState<Asset | null>(null);

  // Driver license state
  const [driverLicenseNumber, setDriverLicenseNumber] = useState<string>('');
  const [driverLicenseExpiry, setDriverLicenseExpiry] = useState<string>('');

  // API mutations
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const { data: driverLicense, isLoading: isLoadingDriverLicense } = useGetCustomerDriverLicenseQuery(undefined, {
    skip: !userId,
  });
  const [upsertCustomerDriverLicense, { isLoading: isSavingDriverLicense }] =
    useUpsertCustomerDriverLicenseMutation();
  const [deleteCustomerDriverLicense, { isLoading: isDeletingDriverLicense }] =
    useDeleteCustomerDriverLicenseMutation();

  // UI visibility (admin-controlled)
  const { data: uiVisibility } = useGetUiVisibilityQuery();

  // Upload state
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Helper: convert date string to 'YYYY-MM-DD' for backend (accepts 'DD/MM/YYYY' or 'YYYY-MM-DD')
  const toBackendDate = (value: string): string | null => {
    const trimmed = value.trim();
    if (!trimmed) return null;

    // Nếu đã là dạng YYYY-MM-DD thì dùng luôn
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }

    // Dạng DD/MM/YYYY -> chuyển sang YYYY-MM-DD
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmed);
    if (match) {
      const [, dd, mm, yyyy] = match;
      return `${yyyy}-${mm}-${dd}`;
    }

    // Fallback: để backend tự parse, hoặc null nếu không hợp lệ
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      const yyyy = parsed.getFullYear();
      const mm = String(parsed.getMonth() + 1).padStart(2, '0');
      const dd = String(parsed.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }

    return null;
  };

  // Sync driver license from API to local state when loaded
  React.useEffect(() => {
    console.log('AccountInfoScreen - userId:', userId);
    console.log('AccountInfoScreen - driverLicense from API:', driverLicense);

    // Ưu tiên dùng đúng field backend: license_no / expires_at
    if (driverLicense) {
      const numberFromApi = driverLicense.license_no ?? driverLicense.license_number ?? '';
      setDriverLicenseNumber(numberFromApi || '');

      // Hạn GPLX
      const rawExpiry = driverLicense.expires_at ?? driverLicense.expiry_date ?? '';
      if (rawExpiry) {
        // Ưu tiên hiển thị dạng DD/MM/YYYY cho người dùng
        let display = rawExpiry;

        // Nếu đã ở dạng có "/" (ví dụ 31/12/2026) thì dùng luôn
        if (!rawExpiry.includes("/")) {
          const parsed = new Date(rawExpiry);
          if (!isNaN(parsed.getTime())) {
            display = parsed.toLocaleDateString("vi-VN");
          }
        }

        setDriverLicenseExpiry(display);
      } else {
        setDriverLicenseExpiry('');
      }
    }
  }, [driverLicense, userId]);

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

      const response = await limitedFetch(`${API_BASE_URL}/upload/single`, {
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
      const updateData: any = {};
      
      if (name !== userName) {
        updateData.name = name;
      }
      if (email !== userEmail) {
        updateData.email = email;
      }
      if (avatarUrlToUpdate !== avatarUrl) {
        updateData.avatar_url = avatarUrlToUpdate;
      }

      // Track whether anything changed
      const hasProfileChanges = Object.keys(updateData).length > 0;
      const trimmedLicenseNumber = driverLicenseNumber.trim();
      const trimmedExpiry = driverLicenseExpiry.trim();
      const hadDriverLicense = !!driverLicense;
      const backendExpiryFromForm = toBackendDate(trimmedExpiry) || '';
      const currentBackendExpiry = driverLicense?.expires_at ?? driverLicense?.expiry_date ?? '';
      const currentNumber = driverLicense?.license_no ?? driverLicense?.license_number ?? '';

      const hasDriverLicenseChange =
        trimmedLicenseNumber !== (currentNumber || '') ||
        backendExpiryFromForm !== (currentBackendExpiry || '');

      if (!hasProfileChanges && !hasDriverLicenseChange) {
        Alert.alert('Thông báo', 'Không có thay đổi nào để cập nhật.');
        return;
      }

      // 1. Update profile if needed
      let profileResult: any = null;
      if (hasProfileChanges) {
        profileResult = await updateProfile(updateData).unwrap();

        if (profileResult.success) {
          // Update Redux store
          dispatch(updateUserProfile({
            userName: profileResult.customer.name,
            userEmail: profileResult.customer.email,
            avatarUrl: profileResult.customer.avatar_url,
          }));
        }
      }

      // 2. Update or delete driver license if needed
      if (hasDriverLicenseChange && userId) {
        if (trimmedLicenseNumber) {
          await upsertCustomerDriverLicense({
            license_no: trimmedLicenseNumber,
            // Backend expects 'YYYY-MM-DD' cho ngày, có thể null nếu không có
            expires_at: toBackendDate(trimmedExpiry),
          }).unwrap();
        } else if (hadDriverLicense) {
          await deleteCustomerDriverLicense().unwrap();
        }
      }

      Alert.alert(
        'Thành công',
        profileResult?.message || 'Cập nhật thông tin thành công!',
        [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]
      );
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert('Lỗi', error.message || 'Không thể cập nhật thông tin. Vui lòng thử lại.');
    }
  };

  const isLoading =
    isUpdating ||
    isUploadingAvatar ||
    isLoadingDriverLicense ||
    isSavingDriverLicense ||
    isDeletingDriverLicense;
  const PLACEHOLDER_AVATAR = 'https://i.pravatar.cc/150?img=12';
  const displayName = name.trim() || userName || "Người dùng";
  const heroEmailText = email.trim();
  const canManageVehicles = userType === 'customer' && Boolean(userId && userPhone);
  const saveButtonTitle = isUploadingAvatar
    ? "Đang tải ảnh..."
    : isUpdating || isSavingDriverLicense || isDeletingDriverLicense
      ? "Đang lưu..."
      : "Lưu thay đổi";

  return (
    <Screen
      headerTitle="Thông tin tài khoản"
      showBackButton
      backgroundColor={Colors.background.muted}
      statusBarStyle="light-content"
      useScrollView={false}
    >
      <FormContainer
        keyboardAvoiding
        withScroll
        paddingCustom={{ horizontal: 0, top: 0, bottom: 0 }}
        backgroundColor={Colors.background.muted}
        contentContainerStyle={styles.scrollContent}
        dismissKeyboardOnPress
      >
        <View style={styles.heroContainer}>
          <View style={styles.heroSurface}>
            <View style={styles.heroDecorativeContainer}>
              <View style={[styles.heroDecorativeCircle, styles.heroCircle1]} />
              <View style={[styles.heroDecorativeCircle, styles.heroCircle2]} />
              <View style={[styles.heroDecorativeCircle, styles.heroCircle3]} />
            </View>

            <View style={styles.heroContent}>
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
                <View style={styles.avatarShell}>
                  <View style={styles.avatarContainer}>
                    {isUploadingAvatar ? (
                      <View style={styles.avatarLoading}>
                        <ActivityIndicator size="large" color={Colors.background.light} />
                      </View>
                    ) : (
                      <>
                        <Image
                          source={{ uri: selectedAvatar || PLACEHOLDER_AVATAR }}
                          style={styles.avatar}
                          resizeMode="cover"
                        />
                        <View style={styles.avatarEditBadge}>
                          <Ionicons name="camera" size={16} color={Colors.background.light} />
                        </View>
                      </>
                    )}
                  </View>
                </View>
              </Pressable>

              <View style={styles.heroTextBlock}>
                <Text style={styles.heroName}>{displayName}</Text>
                <Text style={styles.heroPhone}>{userPhone}</Text>
                {!!heroEmailText && (
                  <Text style={styles.heroEmail} numberOfLines={2}>
                    {heroEmailText}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.sheet}>
          <View style={styles.sheetContent}>
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconWrap}>
                  <Ionicons name="person-outline" size={20} color={Colors.primary} />
                </View>
                <View style={styles.sectionHeaderText}>
                  <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>
                </View>
              </View>

              <View style={styles.lockedInfoRow}>
                <View style={styles.lockedInfoIconWrap}>
                  <Ionicons name="call-outline" size={18} color={Colors.primary} />
                </View>
                <View style={styles.lockedInfoText}>
                  <Text style={styles.lockedInfoLabel}>Số điện thoại</Text>
                  <Text style={styles.lockedInfoValue}>{userPhone}</Text>
                </View>
              </View>

              <View style={styles.fieldBlock}>
                <View style={styles.fieldLabelRow}>
                  <Ionicons name="person-circle-outline" size={18} color={Colors.text.secondary} />
                  <Text style={styles.fieldLabel}>Họ và tên</Text>
                </View>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Nhập họ và tên"
                  style={styles.input}
                />
              </View>

              <View style={[styles.fieldBlock, styles.fieldBlockLast]}>
                <View style={styles.fieldLabelRow}>
                  <Ionicons name="mail-outline" size={18} color={Colors.text.secondary} />
                  <Text style={styles.fieldLabel}>Email</Text>
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

            {uiVisibility?.is_hidden === 0 && (
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconWrap}>
                    <Ionicons name="card-outline" size={20} color={Colors.primary} />
                  </View>
                  <View style={styles.sectionHeaderText}>
                    <Text style={styles.sectionTitle}>Giấy phép lái xe</Text>
                  </View>
                </View>

                <View style={styles.fieldBlock}>
                  <View style={styles.fieldLabelRow}>
                    <Ionicons name="document-text-outline" size={18} color={Colors.text.secondary} />
                    <Text style={styles.fieldLabel}>Số GPLX</Text>
                  </View>
                  <TextInput
                    value={driverLicenseNumber}
                    onChangeText={setDriverLicenseNumber}
                    placeholder="Nhập số giấy phép lái xe"
                    style={styles.input}
                  />
                </View>

                <View style={[styles.fieldBlock, styles.fieldBlockLast]}>
                  <DateInput
                    value={driverLicenseExpiry}
                    onChangeText={setDriverLicenseExpiry}
                    placeholder="Chọn hạn GPLX"
                    label="Hạn GPLX"
                    fullWidth
                    style={styles.dateInput}
                  />
                </View>
              </View>
            )}

            {canManageVehicles && (
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconWrap}>
                    <Ionicons name="car-outline" size={20} color={Colors.primary} />
                  </View>
                  <View style={styles.sectionHeaderText}>
                    <Text style={styles.sectionTitle}>Thông tin xe</Text>
                  </View>
                </View>

                <Pressable
                  style={({ pressed }) => [styles.vehicleManageRow, pressed && styles.vehicleManageRowPressed]}
                  onPress={() => navigation.navigate('VehicleList', { userId, userPhone })}
                >
                  <View style={styles.vehicleManageIconWrap}>
                    <Ionicons name="create-outline" size={18} color={Colors.primary} />
                  </View>
                  <View style={styles.vehicleManageText}>
                    <Text style={styles.vehicleManageTitle}>Cập nhật thông tin xe</Text>
                    <Text style={styles.vehicleManageSubtitle}>Chỉnh sửa xe và giấy tờ xe</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
                </Pressable>
              </View>
            )}

            <View style={styles.actionSection}>
              <Button
                title={saveButtonTitle}
                onPress={handleSaveProfile}
                disabled={isLoading}
                loading={isUpdating || isSavingDriverLicense || isDeletingDriverLicense}
                variant="primary"
                fullWidth
              />
            </View>
          </View>
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
