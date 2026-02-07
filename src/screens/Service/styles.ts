// src/screens/Service/styles.ts
import { StyleSheet, Dimensions } from "react-native";
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typo";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.light,
  },
  root: {
    flex: 1,
    backgroundColor: Colors.gradients.primary[0],
  },
  whiteSection: {
    flex: 1,
    backgroundColor: Colors.background.light,
  },
  scrollContent: {
    paddingBottom: 100, // Padding để không bị che bởi nút cố định
  },
  body: {
    flex: 1,
  },
  
  // Image Container
  imageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH - 20 + 20,
    position: 'relative',
    backgroundColor: Colors.background.light,
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  imageCarousel: {
    width: '100%',
    height: SCREEN_WIDTH - 20, // Hình vuông
    backgroundColor: Colors.neutral[100],
    borderRadius: 12, // Bo góc nhỏ
    overflow: 'hidden',
  },
  serviceImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  
  // Info Section
  infoSection: {
    padding: 16,
  },
  serviceName: {
    fontSize: Typography.size['2xl'],
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  
  // Content Section
  contentSection: {
    marginBottom: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  sectionTitle: {
    fontSize: Typography.size.lg,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.text.primary,
    marginBottom: 12,
  },
  contentText: {
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.text.secondary,
    lineHeight: 24,
  },
  
  // Metadata
  metadataSection: {
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  metadataText: {
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.text.secondary,
  },
  
  // No Image Notice
  noImageNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[50],
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  noImageText: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.status.warning,
  },
  
  // Action Section - Cố định ở đáy
  actionSectionFixed: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 24,
    backgroundColor: Colors.background.light,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  
  // Modal styles for full screen image
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 10,
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
});


