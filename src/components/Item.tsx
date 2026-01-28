import React, { useCallback, useRef, useState, useMemo } from "react";
import { View, Text, Pressable, StyleSheet, Animated, Modal, TouchableOpacity, Image } from "react-native";
import LinearGradient from 'react-native-linear-gradient';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Colors } from "../constants/colors";
import { Typography } from "../constants/typo";
import { OptimizedImage } from "./OptimizedImage";
import { spacing } from "../design-system/spacing";
import { borderRadius } from "../design-system/borders";
import { getShadowStyle } from "../design-system/shadows";
import { textStyles } from "../design-system/typography";

const AnimatedView = Animated.createAnimatedComponent(View) as typeof View;

type ItemProps = {
  title: string;
  description: string;
  imageUri?: string;
  onPress?: () => void;
  isPressable?: boolean;
};

const Item = ({ title, description, imageUri, onPress, isPressable = true }: ItemProps) => {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const opacityValue = useRef(new Animated.Value(1)).current;
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Normalize imageUri to ensure it's a valid string
  const normalizedImageUri = useMemo(() => {
    if (!imageUri) return null;
    
    // If imageUri is already a string, use it directly
    if (typeof imageUri === 'string') {
      return imageUri.trim().length > 0 ? imageUri : null;
    }
    
    // If imageUri is an object, try to extract the URI
    if (typeof imageUri === 'object' && imageUri !== null) {
      const uri = (imageUri as any).uri || (imageUri as any).image_url || (imageUri as any).url;
      if (uri && typeof uri === 'string' && uri.trim().length > 0) {
        return uri;
      }
    }
    
    return null;
  }, [imageUri]);

  const handlePressIn = useCallback(() => {
    if (isPressable) {
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 0.96,
          useNativeDriver: true,
          speed: 50,
          bounciness: 8,
        }),
        Animated.timing(opacityValue, {
          toValue: 0.7,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isPressable, scaleValue, opacityValue]);

  const handlePressOut = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 8,
      }),
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleValue, opacityValue]);

  const content = (
    <AnimatedView 
      style={[
        styles.card, 
        { 
          transform: [{ scale: scaleValue }],
          opacity: opacityValue,
        }
      ]}
    >
      <View style={styles.cardContent}>
        {/* Image Section */}
        <View style={styles.imageSection}>
          {normalizedImageUri ? (
            <Pressable 
              onPress={() => normalizedImageUri && setSelectedImage(normalizedImageUri)}
              style={styles.imageContainer}
            >
              <OptimizedImage 
                source={{ uri: normalizedImageUri }} 
                width={80}
                height={80}
                borderRadius={20}
                style={styles.image}
              />
              <View style={styles.imageBorder} />
            </Pressable>
          ) : (
            <View style={styles.imagePlaceholder}>
              <LinearGradient
                colors={[Colors.primarySoft, '#FFF9F9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.placeholderGradient}
              />
              <View style={styles.placeholderIcon}>
                <View style={styles.iconCircle} />
              </View>
            </View>
          )}
        </View>

        {/* Text Section */}
        <View style={styles.textSection}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <Text style={styles.description} numberOfLines={2}>{description}</Text>
        </View>
      </View>
    </AnimatedView>
  );

  return (
    <>
      {isPressable ? (
        <Pressable 
          onPress={onPress} 
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          accessible={true} 
          accessibilityRole="button"
          accessibilityLabel={`${title}. ${description}`}
        >
          {content}
        </Pressable>
      ) : (
        content
      )}

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
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "100%",
    minHeight: 110,
    borderRadius: borderRadius['2xl'],
    backgroundColor: Colors.background.light,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: Colors.neutral[200],
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.base,
    paddingRight: spacing.lg,
  },
  imageSection: {
    marginRight: spacing.base,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: borderRadius['2xl'],
    overflow: 'hidden',
  },
  image: {
    borderRadius: borderRadius['2xl'],
  },
  imageBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: borderRadius['2xl'],
    borderWidth: 2,
    borderColor: Colors.primary,
    opacity: 0.3,
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: borderRadius['2xl'],
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: `${Colors.primary}40`, // 0.25 opacity với hex
  },
  placeholderGradient: {
    position: 'absolute',
    width: "100%",
    height: "100%",
  },
  placeholderIcon: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.md,
    backgroundColor: Colors.primary,
    opacity: 0.15,
  },
  textSection: {
    flex: 1,
    justifyContent: "center",
    paddingRight: spacing.sm,
  },
  title: {
    ...textStyles.bodyLarge,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.text.primary,
    marginBottom: spacing.xs,
    letterSpacing: -0.3,
  },
  description: {
    ...textStyles.bodySmall,
    color: Colors.text.secondary,
    letterSpacing: -0.1,
  },
  // Modal styles for full screen image
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackButton: {
    position: 'absolute',
    top: 50,
    left: spacing.lg,
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: borderRadius['2xl'],
    padding: spacing.base,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 50,
    right: spacing.lg,
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: borderRadius['2xl'],
    padding: spacing.base,
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
});

export default React.memo(Item);