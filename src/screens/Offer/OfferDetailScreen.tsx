// src/screens/Offer/OfferDetailScreen.tsx
import React, { useState, useMemo, useRef, useCallback } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  Image, 
  Dimensions,
  TouchableOpacity,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl
} from "react-native";
import Screen from "../../components/layout/Screen/Screen";
import { Colors } from "../../constants/colors";
import { useRoute, RouteProp, useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppStackParamList } from "../../navigation/AppNavigator";
import { useGetOfferByIdQuery, useGetOfferImagesQuery } from "../../services/offerApi";
import { QueryWrapper, ScreenLoader } from "../../components/Loading";
import { styles } from "./styles";
import { Ionicons } from '@react-native-vector-icons/ionicons';
import ConfirmButton from "../../components/ConfirmButton";
import { useAppDispatch } from "../../redux/hooks/useAppDispatch";
import { offerApi } from "../../services/offerApi";

type OfferDetailRouteProp = RouteProp<AppStackParamList, 'OfferDetail'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = SCREEN_WIDTH * 0.8;

// Placeholder image URL
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/400x400/cccccc/666666?text=No+Image';

const OfferDetailScreen = () => {
  const route = useRoute<OfferDetailRouteProp>();
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const { offerId } = route.params;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [imageTimestamp, setImageTimestamp] = useState(Date.now());
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Fetch offer details from API
  const offerQuery = useGetOfferByIdQuery(offerId);
  const offerImagesQuery = useGetOfferImagesQuery(offerId);
  
  const offer = offerQuery.data?.data;
  
  // Avoid refetch/invalidate on every focus to prevent too many requests.
  // Freshness is handled globally by API_CONFIG.refetchOnMountOrArgChange (30s).
  useFocusEffect(
    useCallback(() => {
      setImageTimestamp(Date.now());
    }, [])
  );

  // Handle pull-to-refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Invalidate offer tags to clear cache first
      dispatch(offerApi.util.invalidateTags([{ type: 'Offer', id: offerId.toString() }, 'Offer', 'OfferImage']));
      // Wait a bit for cache invalidation to take effect
      await new Promise<void>(resolve => setTimeout(() => resolve(), 100));
      // Refetch offer data
      const [offerResult, imagesResult] = await Promise.all([
        offerQuery.refetch(),
        offerImagesQuery.refetch(),
      ]);
      // Update image timestamp to force reload after refetch completes
      setImageTimestamp(Date.now());
    } catch (error) {
      console.error('Error refreshing offer:', error);
    } finally {
      // Ensure refreshing is set to false
      setTimeout(() => setRefreshing(false), 100);
    }
  }, [offerQuery, offerImagesQuery, dispatch, offerId]);
  
  // Prepare images array with cache busting - prioritize offer images query, then offer.images, then primary_image, then image_url
  const images = useMemo(() => {
    let imageUrls: string[] = [];
    
    // Nếu có offerImagesQuery data (từ endpoint riêng)
    if (offerImagesQuery.data && offerImagesQuery.data.length > 0) {
      imageUrls = offerImagesQuery.data.map(img => img.image_url);
    }
    // Nếu offer có images array (từ getOfferById response)
    else if (offer?.images && offer.images.length > 0) {
      imageUrls = offer.images.map(img => img.image_url);
    }
    // Nếu có primary_image
    else if (offer?.primary_image?.image_url) {
      imageUrls = [offer.primary_image.image_url];
    }
    // Nếu có image_url cũ (backward compatibility)
    else if (offer?.image_url) {
      imageUrls = [offer.image_url];
    } else {
      return [PLACEHOLDER_IMAGE];
    }
    
    // Add cache busting timestamp to all image URLs
    return imageUrls.map(url => 
      url === PLACEHOLDER_IMAGE 
        ? url 
        : `${url}${url.includes('?') ? '&' : '?'}_t=${imageTimestamp}`
    );
  }, [offerImagesQuery.data, offer?.images, offer?.primary_image, offer?.image_url, imageTimestamp]);
  
  // Lấy danh sách images objects để check is_primary
  const imagesObjects = useMemo(() => {
    if (offerImagesQuery.data && offerImagesQuery.data.length > 0) {
      return offerImagesQuery.data;
    }
    if (offer?.images && offer.images.length > 0) {
      return offer.images;
    }
    return [];
  }, [offerImagesQuery.data, offer?.images]);

  // Handle scroll để cập nhật currentImageIndex khi swipe
  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    // RN types sometimes disagree on nativeEvent for ScrollView callbacks,
    // but runtime always provides it.
    const scrollPosition = (event as unknown as { nativeEvent: NativeScrollEvent }).nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / SCREEN_WIDTH);
    if (index >= 0 && index < images.length) {
      setCurrentImageIndex(index);
    }
  };

  // Scroll đến ảnh khi click thumbnail
  const scrollToImage = (index: number) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: index * SCREEN_WIDTH,
        animated: true,
      });
    }
    setCurrentImageIndex(index);
  };

  return (
    <Screen
      headerTitle="Chi tiết ưu đãi"
      showBackButton
      safeAreaTopColor={Colors.primary}
      statusBarStyle="light-content"
    >
      
      <QueryWrapper
        query={offerQuery}
        errorMessage="Lỗi tải chi tiết ưu đãi"
        checkEmpty={(data: any) => !data?.data}
        emptyMessage="Không tìm thấy ưu đãi"
        emptyIcon="pricetag-outline"
        loadingComponent={
          <View style={[styles.body, { justifyContent: 'center', alignItems: 'center', flex: 1 }]}>
            <ScreenLoader />
          </View>
        }
        children={(response: any) => {
          const offer = response?.data;
          if (!offer) return null;
          
          return (
            <View style={styles.container}>
              <ScrollView 
                style={styles.whiteSection} 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
              >
                <View style={styles.body}>
                {/* Image Carousel với Swipe */}
                <View style={styles.imageCarouselContainer}>
                  <ScrollView
                    ref={scrollViewRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={handleScrollEnd}
                    decelerationRate="fast"
                    style={styles.imageCarouselScroll}
                    contentContainerStyle={styles.imageCarouselContent}
                  >
                    {images.map((imageUrl, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.imageCarousel}
                        onPress={() => setSelectedImage(imageUrl)}
                        activeOpacity={0.9}
                      >
                        <Image 
                          source={{ uri: imageUrl }}
                          style={styles.offerImage}
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  
                  {/* Image Indicators */}
                  {images.length > 1 && (
                    <View style={styles.imageIndicators}>
                      {images.map((_, index) => (
                        <View
                          key={index}
                          style={[
                            styles.indicator,
                            index === currentImageIndex && styles.indicatorActive
                          ]}
                        />
                      ))}
                    </View>
                  )}
                </View>

                {/* Divider giữa ảnh to và list ảnh */}
                {images.length > 1 && (
                  <View style={styles.divider} />
                )}

                {/* Image Gallery Thumbnails - Ngay dưới ảnh chính */}
                {images.length > 1 && (
                  <View style={styles.thumbnailSection}>
                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false}
                      style={styles.thumbnailScroll}
                      contentContainerStyle={styles.thumbnailScrollContent}
                    >
                      {images.map((imageUrl, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => {
                            scrollToImage(index);
                          }}
                          activeOpacity={0.8}
                          style={[
                            styles.thumbnail,
                            index === currentImageIndex && styles.thumbnailActive
                          ]}
                        >
                          <Image 
                            source={{ uri: imageUrl }}
                            style={styles.thumbnailImage}
                            resizeMode="cover"
                          />
                          {/* Badge ảnh chính */}
                          {imagesObjects[index]?.is_primary === 1 && (
                            <View style={styles.primaryBadge}>
                              <Text style={styles.primaryBadgeText}>Chính</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* Offer Info */}
                <View style={styles.infoSection}>
                  <Text style={styles.offerName}>{offer.name}</Text>
                  
                  {/* Service Name */}
                  {offer.service_name && (
                    <View style={styles.metadataRow}>
                      <Ionicons name="construct-outline" size={20} color={Colors.text.secondary} />
                      <Text style={styles.metadataText}>
                        Dịch vụ: {offer.service_name}
                      </Text>
                    </View>
                  )}

                  {/* Offer Content */}
                  {offer.content && (
                    <View style={styles.contentSection}>
                      <Text style={styles.sectionTitle}>Nội dung ưu đãi</Text>
                      <Text style={styles.contentText}>{offer.content}</Text>
                    </View>
                  )}

                  {/* Description (fallback nếu không có content) */}
                  {!offer.content && offer.description && (
                    <View style={styles.contentSection}>
                      <Text style={styles.sectionTitle}>Mô tả ưu đãi</Text>
                      <Text style={styles.contentText}>{offer.description}</Text>
                    </View>
                  )}

                  {/* Offer Metadata */}
                  <View style={styles.metadataSection}>
                    {offer.discount && (
                      <View style={styles.metadataRow}>
                        <Ionicons name="ticket-outline" size={20} color={Colors.text.secondary} />
                        <Text style={styles.metadataText}>
                          Giảm giá: {offer.discount}%
                        </Text>
                      </View>
                    )}
                    
                    {offer.valid_from && offer.valid_to && (
                      <View style={styles.metadataRow}>
                        <Ionicons name="calendar-outline" size={20} color={Colors.text.secondary} />
                        <Text style={styles.metadataText}>
                          Áp dụng: {new Date(offer.valid_from).toLocaleDateString('vi-VN')} - {new Date(offer.valid_to).toLocaleDateString('vi-VN')}
                        </Text>
                      </View>
                    )}
                    
                    {images.length === 1 && images[0] === PLACEHOLDER_IMAGE && (
                      <View style={styles.noImageNotice}>
                        <Ionicons name="information-circle-outline" size={20} color={Colors.status.warning} />
                        <Text style={styles.noImageText}>
                          Ưu đãi chưa có hình ảnh
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
              </ScrollView>
              
              {/* Nút Áp dụng ưu đãi - Cố định ở đáy */}
              <View style={styles.actionSectionFixed}>
                <ConfirmButton
                  title="Áp dụng ưu đãi"
                  onPress={() => {
                    navigation.navigate('Booking' as never);
                  }}
                  buttonColor={Colors.primary}
                  textColor={Colors.text.inverted}
                />
              </View>
            </View>
          );
        }}
      />

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

export default OfferDetailScreen;

