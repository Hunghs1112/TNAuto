// src/components/MultiImagePicker/MultiImagePicker.tsx
import React, { useCallback, useState } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Text,
  Alert,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Colors } from '../../constants/colors';
import { useUploadSingleImageMutation } from '../../services/imageApi';

export interface ImageItem {
  id: string;
  uri: string;
  uploadedUrl?: string;
  status: 'idle' | 'uploading' | 'success' | 'error';
  progress?: number;
  fileName?: string;
}

interface MultiImagePickerProps {
  images: ImageItem[];
  onImagesChange: (images: ImageItem[]) => void;
  maxImages?: number;
  singleMode?: boolean;
  disabled?: boolean;
}

const THUMBNAIL_SIZE = 100;
const COLUMNS = 3;

let _idCounter = 0;
const generateId = () => `img_${Date.now()}_${++_idCounter}`;

export const MultiImagePicker: React.FC<MultiImagePickerProps> = ({
  images,
  onImagesChange,
  maxImages = 10,
  singleMode = false,
  disabled = false,
}) => {
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [uploadSingleImage] = useUploadSingleImageMutation();

  const effectiveMax = singleMode ? 1 : maxImages;
  const canAddMore = images.length < effectiveMax;

  // ── Upload một ảnh ──────────────────────────────────────────────────────────

  const uploadImage = useCallback(
    async (item: ImageItem, allImages: ImageItem[], setImages: (imgs: ImageItem[]) => void) => {
      const formData = new FormData();
      formData.append('image', {
        uri: item.uri,
        type: 'image/jpeg',
        name: item.fileName || `upload_${Date.now()}.jpg`,
      } as any);

      try {
        const response = await uploadSingleImage(formData).unwrap();
        setImages(
          allImages.map((img) =>
            img.id === item.id
              ? { ...img, status: 'success', uploadedUrl: response.url }
              : img,
          ),
        );
      } catch {
        setImages(
          allImages.map((img) =>
            img.id === item.id ? { ...img, status: 'error' } : img,
          ),
        );
      }
    },
    [uploadSingleImage],
  );

  // ── Chọn ảnh từ thư viện ────────────────────────────────────────────────────

  const handleAddPress = useCallback(async () => {
    if (disabled || !canAddMore) return;

    const selectionLimit = singleMode ? 1 : effectiveMax - images.length;

    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit,
      quality: 0.85,
    });

    if (result.didCancel || !result.assets?.length) return;

    const newItems: ImageItem[] = result.assets.map((asset) => ({
      id: generateId(),
      uri: asset.uri || '',
      status: 'uploading' as const,
      fileName: asset.fileName || `upload_${Date.now()}.jpg`,
    }));

    // Nếu singleMode, thay thế ảnh cũ
    const updatedImages = singleMode ? newItems : [...images, ...newItems];
    onImagesChange(updatedImages);

    // Upload song song
    await Promise.all(
      newItems.map((item) => uploadImage(item, updatedImages, onImagesChange)),
    );
  }, [disabled, canAddMore, singleMode, effectiveMax, images, onImagesChange, uploadImage]);

  // ── Retry upload ────────────────────────────────────────────────────────────

  const handleRetry = useCallback(
    async (item: ImageItem) => {
      const updatedImages = images.map((img) =>
        img.id === item.id ? { ...img, status: 'uploading' as const } : img,
      );
      onImagesChange(updatedImages);
      await uploadImage({ ...item, status: 'uploading' }, updatedImages, onImagesChange);
    },
    [images, onImagesChange, uploadImage],
  );

  // ── Xóa ảnh ─────────────────────────────────────────────────────────────────

  const handleRemove = useCallback(
    (id: string) => {
      onImagesChange(images.filter((img) => img.id !== id));
    },
    [images, onImagesChange],
  );

  // ── Render thumbnail ─────────────────────────────────────────────────────────

  const renderThumbnail = useCallback(
    (item: ImageItem) => (
      <View key={item.id} style={styles.thumbnailWrapper}>
        <TouchableOpacity
          style={styles.thumbnail}
          onLongPress={() => setPreviewUri(item.uri)}
          activeOpacity={0.85}
        >
          <Image source={{ uri: item.uri }} style={styles.thumbnailImage} resizeMode="cover" />

          {/* Uploading overlay */}
          {item.status === 'uploading' && (
            <View style={styles.overlay}>
              <ActivityIndicator size="small" color={Colors.background.light} />
            </View>
          )}

          {/* Error overlay */}
          {item.status === 'error' && (
            <TouchableOpacity style={styles.overlay} onPress={() => handleRetry(item)}>
              <Ionicons name="alert-circle" size={24} color="#FF4444" />
              <Text style={styles.retryText}>Thử lại</Text>
            </TouchableOpacity>
          )}

          {/* Success badge */}
          {item.status === 'success' && (
            <View style={styles.successBadge}>
              <Ionicons name="checkmark-circle" size={18} color="#22C55E" />
            </View>
          )}
        </TouchableOpacity>

        {/* Nút xóa */}
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemove(item.id)}
          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        >
          <Ionicons name="close-circle" size={20} color={Colors.alpha?.black60 ?? 'rgba(0,0,0,0.6)'} />
        </TouchableOpacity>
      </View>
    ),
    [handleRemove, handleRetry],
  );

  // ── Render nút thêm ──────────────────────────────────────────────────────────

  const renderAddButton = () => {
    if (!canAddMore) return null;
    return (
      <TouchableOpacity
        key="add-button"
        style={[styles.thumbnailWrapper, styles.addButton, disabled && styles.addButtonDisabled]}
        onPress={handleAddPress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Ionicons name="add-outline" size={32} color={disabled ? Colors.text.secondary : Colors.primary} />
      </TouchableOpacity>
    );
  };

  // ── Tính padding để grid đều ─────────────────────────────────────────────────

  const allCells = [...images.map(renderThumbnail), renderAddButton()].filter(Boolean);

  return (
    <View>
      <View style={styles.grid}>
        {allCells}
      </View>

      {/* Full-screen preview modal */}
      <Modal
        visible={!!previewUri}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewUri(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalClose}
            onPress={() => setPreviewUri(null)}
          >
            <Ionicons name="close-outline" size={30} color={Colors.background.light} />
          </TouchableOpacity>
          {previewUri && (
            <Image
              source={{ uri: previewUri }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  thumbnailWrapper: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    position: 'relative',
  },
  thumbnail: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  retryText: {
    color: Colors.background.light,
    fontSize: 10,
    fontWeight: '600',
  },
  successBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: Colors.background.light,
    borderRadius: 999,
  },
  removeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: Colors.background.light,
    borderRadius: 999,
    zIndex: 10,
  },
  addButton: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    borderColor: Colors.text.secondary,
    backgroundColor: '#F3F4F6',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 10,
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
});
