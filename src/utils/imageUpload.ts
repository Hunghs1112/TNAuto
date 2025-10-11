// src/utils/imageUpload.ts
import { launchCamera, launchImageLibrary, ImagePickerResponse, Asset } from 'react-native-image-picker';
import { Alert, Platform } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

export interface ImageUploadOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  includeBase64?: boolean;
  mediaType?: 'photo' | 'video' | 'mixed';
  selectionLimit?: number;
}

const DEFAULT_OPTIONS: ImageUploadOptions = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.8,
  includeBase64: false,
  mediaType: 'photo',
  selectionLimit: 1,
};

/**
 * Check and request camera permission
 */
export const requestCameraPermission = async (): Promise<boolean> => {
  try {
    const permission = Platform.select({
      android: PERMISSIONS.ANDROID.CAMERA,
      ios: PERMISSIONS.IOS.CAMERA,
    });

    if (!permission) return false;

    const result = await check(permission);
    
    if (result === RESULTS.GRANTED) {
      return true;
    }

    if (result === RESULTS.DENIED) {
      const requestResult = await request(permission);
      return requestResult === RESULTS.GRANTED;
    }

    return false;
  } catch (error) {
    console.error('Error requesting camera permission:', error);
    return false;
  }
};

/**
 * Check and request photo library permission
 */
export const requestPhotoLibraryPermission = async (): Promise<boolean> => {
  try {
    const permission = Platform.select({
      android: Platform.Version >= 33 
        ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES 
        : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
      ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
    });

    if (!permission) return false;

    const result = await check(permission);
    
    if (result === RESULTS.GRANTED) {
      return true;
    }

    if (result === RESULTS.DENIED) {
      const requestResult = await request(permission);
      return requestResult === RESULTS.GRANTED;
    }

    return false;
  } catch (error) {
    console.error('Error requesting photo library permission:', error);
    return false;
  }
};

/**
 * Pick image from camera
 */
export const pickImageFromCamera = async (
  options: ImageUploadOptions = {}
): Promise<Asset | null> => {
  try {
    const hasPermission = await requestCameraPermission();
    
    if (!hasPermission) {
      Alert.alert(
        'Quyền truy cập camera',
        'Vui lòng cấp quyền truy cập camera trong cài đặt để sử dụng tính năng này.',
        [{ text: 'OK' }]
      );
      return null;
    }

    const mergedOptions = { ...DEFAULT_OPTIONS, ...options, selectionLimit: 1 };
    
    const response: ImagePickerResponse = await launchCamera({
      mediaType: mergedOptions.mediaType,
      maxWidth: mergedOptions.maxWidth,
      maxHeight: mergedOptions.maxHeight,
      quality: mergedOptions.quality,
      includeBase64: mergedOptions.includeBase64,
    });

    if (response.didCancel) {
      console.log('User cancelled camera picker');
      return null;
    }

    if (response.errorCode) {
      console.error('Camera Error:', response.errorMessage);
      Alert.alert('Lỗi', 'Không thể chụp ảnh. Vui lòng thử lại.');
      return null;
    }

    if (response.assets && response.assets.length > 0) {
      return response.assets[0];
    }

    return null;
  } catch (error) {
    console.error('Error picking image from camera:', error);
    Alert.alert('Lỗi', 'Không thể chụp ảnh. Vui lòng thử lại.');
    return null;
  }
};

/**
 * Pick image(s) from gallery
 */
export const pickImageFromGallery = async (
  options: ImageUploadOptions = {}
): Promise<Asset[]> => {
  try {
    const hasPermission = await requestPhotoLibraryPermission();
    
    if (!hasPermission) {
      Alert.alert(
        'Quyền truy cập thư viện ảnh',
        'Vui lòng cấp quyền truy cập thư viện ảnh trong cài đặt để sử dụng tính năng này.',
        [{ text: 'OK' }]
      );
      return [];
    }

    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    
    const response: ImagePickerResponse = await launchImageLibrary({
      mediaType: mergedOptions.mediaType,
      maxWidth: mergedOptions.maxWidth,
      maxHeight: mergedOptions.maxHeight,
      quality: mergedOptions.quality,
      includeBase64: mergedOptions.includeBase64,
      selectionLimit: mergedOptions.selectionLimit || 1,
    });

    if (response.didCancel) {
      console.log('User cancelled gallery picker');
      return [];
    }

    if (response.errorCode) {
      console.error('Gallery Error:', response.errorMessage);
      Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại.');
      return [];
    }

    if (response.assets && response.assets.length > 0) {
      return response.assets;
    }

    return [];
  } catch (error) {
    console.error('Error picking image from gallery:', error);
    Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại.');
    return [];
  }
};

/**
 * Show image picker options (Camera or Gallery)
 */
export const showImagePickerOptions = (
  onCameraSelected: () => void,
  onGallerySelected: () => void
): void => {
  Alert.alert(
    'Chọn ảnh',
    'Bạn muốn lấy ảnh từ đâu?',
    [
      {
        text: 'Chụp ảnh',
        onPress: onCameraSelected,
      },
      {
        text: 'Chọn từ thư viện',
        onPress: onGallerySelected,
      },
      {
        text: 'Hủy',
        style: 'cancel',
      },
    ],
    { cancelable: true }
  );
};

/**
 * Create FormData for single image upload
 */
export const createImageFormData = (asset: Asset, fieldName: string = 'image'): FormData => {
  const formData = new FormData();
  
  const file = {
    uri: Platform.OS === 'ios' ? asset.uri?.replace('file://', '') : asset.uri,
    type: asset.type || 'image/jpeg',
    name: asset.fileName || `photo_${Date.now()}.jpg`,
  };

  formData.append(fieldName, file as any);
  
  return formData;
};

/**
 * Create FormData for multiple images upload
 */
export const createMultipleImagesFormData = (assets: Asset[], fieldName: string = 'images'): FormData => {
  const formData = new FormData();
  
  assets.forEach((asset, index) => {
    const file = {
      uri: Platform.OS === 'ios' ? asset.uri?.replace('file://', '') : asset.uri,
      type: asset.type || 'image/jpeg',
      name: asset.fileName || `photo_${Date.now()}_${index}.jpg`,
    };

    formData.append(fieldName, file as any);
  });
  
  return formData;
};

/**
 * Validate image file size (in bytes)
 */
export const validateImageSize = (asset: Asset, maxSizeInMB: number = 5): boolean => {
  if (!asset.fileSize) return true;
  
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  
  if (asset.fileSize > maxSizeInBytes) {
    Alert.alert(
      'Kích thước file quá lớn',
      `File ảnh không được vượt quá ${maxSizeInMB}MB. File hiện tại: ${(asset.fileSize / (1024 * 1024)).toFixed(2)}MB`,
      [{ text: 'OK' }]
    );
    return false;
  }
  
  return true;
};

/**
 * Validate multiple images total size
 */
export const validateMultipleImagesSize = (assets: Asset[], maxSizeInMB: number = 5): boolean => {
  for (const asset of assets) {
    if (!validateImageSize(asset, maxSizeInMB)) {
      return false;
    }
  }
  return true;
};

/**
 * Get filename from URL
 */
export const getFilenameFromUrl = (url: string): string => {
  const parts = url.split('/');
  return parts[parts.length - 1];
};

