// src/components/ProductVideo/ProductVideo.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Ionicons } from '@react-native-vector-icons/ionicons';

interface ProductVideoProps {
  videoUrl: string | null | undefined;
}

const ProductVideo: React.FC<ProductVideoProps> = ({ videoUrl }) => {
  if (!videoUrl) {
    return null;
  }

  const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
  const isVimeo = videoUrl.includes('vimeo.com');
  const isTikTok = videoUrl.includes('tiktok.com');
  const isFacebook = videoUrl.includes('facebook.com') || videoUrl.includes('fb.com');
  const isInstagram = videoUrl.includes('instagram.com');
  const isDirectVideo = /\.(mp4|webm|ogg|mov|avi|mkv|flv|wmv)(\?.*)?$/i.test(videoUrl);

  // For TikTok, Facebook, Instagram - open in browser
  if (isTikTok || isFacebook || isInstagram) {
    const platformName = isTikTok ? 'TikTok' : isFacebook ? 'Facebook' : 'Instagram';
    
    return (
      <TouchableOpacity
        onPress={() => Linking.openURL(videoUrl)}
        style={styles.externalVideoButton}
        activeOpacity={0.7}
      >
        <Ionicons name="play-circle-outline" size={24} color={Colors.primary} />
        <Text style={styles.externalVideoText}>
          📹 Xem video trên {platformName}
        </Text>
      </TouchableOpacity>
    );
  }

  // For YouTube and Vimeo - show message to open in browser
  // Note: WebView embedding can be complex, so we'll use browser for now
  if (isYouTube || isVimeo) {
    const platformName = isYouTube ? 'YouTube' : 'Vimeo';
    
    return (
      <TouchableOpacity
        onPress={() => Linking.openURL(videoUrl)}
        style={styles.externalVideoButton}
        activeOpacity={0.7}
      >
        <Ionicons name="play-circle-outline" size={24} color={Colors.primary} />
        <Text style={styles.externalVideoText}>
          📹 Xem video trên {platformName}
        </Text>
      </TouchableOpacity>
    );
  }

  // For direct video files - show message to open in browser
  // Note: To play direct videos, you would need react-native-video library
  if (isDirectVideo) {
    return (
      <TouchableOpacity
        onPress={() => Linking.openURL(videoUrl)}
        style={styles.externalVideoButton}
        activeOpacity={0.7}
      >
        <Ionicons name="play-circle-outline" size={24} color={Colors.primary} />
        <Text style={styles.externalVideoText}>
          📹 Xem video
        </Text>
      </TouchableOpacity>
    );
  }

  // Fallback for unknown video URLs
  return (
    <TouchableOpacity
      onPress={() => Linking.openURL(videoUrl)}
      style={styles.externalVideoButton}
      activeOpacity={0.7}
    >
      <Ionicons name="play-circle-outline" size={24} color={Colors.primary} />
      <Text style={styles.externalVideoText}>
        📹 Xem video
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  externalVideoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: Colors.neutral[100],
    borderRadius: 8,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: Colors.neutral[300],
  },
  externalVideoText: {
    marginLeft: 8,
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
  },
});

export default ProductVideo;


