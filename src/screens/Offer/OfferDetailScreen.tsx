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
  RefreshControl,
  FlatList,
} from "react-native";
import Screen from "../../components/layout/Screen/Screen";
import { Colors } from "../../constants/colors";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppStackParamList } from "../../navigation/AppNavigator";
import { useGetOfferByIdQuery, useGetOfferImagesQuery } from "../../services/offerApi";
import { QueryWrapper, ScreenLoader } from "../../components/Loading";
import { styles } from "./styles";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import ConfirmButton from "../../components/ConfirmButton";
import { offerApi } from "../../services/offerApi";
import { useAppDispatch } from "../../redux/hooks/useAppDispatch";
import { useAppSelector } from "../../redux/hooks/useAppSelector";

type OfferDetailRouteProp = RouteProp<AppStackParamList, "OfferDetail">;
type OfferDetailNavigationProp = NativeStackNavigationProp<AppStackParamList, "OfferDetail">;

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Placeholder image URL
const PLACEHOLDER_IMAGE = "https://via.placeholder.com/400x400/cccccc/666666?text=No+Image";

const OfferDetailScreen = () => {
  const route = useRoute<OfferDetailRouteProp>();
  const navigation = useNavigation<OfferDetailNavigationProp>();
  const dispatch = useAppDispatch();
  const { offerId } = route.params;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const flatListRef = useRef<FlatList<string>>(null);
  const customerId = useAppSelector((s) => s.auth.userId);
  const userType = useAppSelector((s) => s.auth.userType);

  // Fetch offer details using customer aggregate context.
  const offerQuery = useGetOfferByIdQuery({ id: offerId, customer_id: customerId ? Number(customerId) : undefined }, {
    skip: userType !== 'customer' || !customerId,
  });
  const offerImagesQuery = useGetOfferImagesQuery({ offerId, customer_id: customerId ? Number(customerId) : undefined }, {
    skip: userType !== 'customer' || !customerId,
  });

  const offer = offerQuery.data?.data;

  // Handle pull-to-refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([offerQuery.refetch(), offerImagesQuery.refetch()]);
    } catch (error) {
      if (__DEV__) console.warn('Error refreshing offer:', error);
    } finally {
      setRefreshing(false);
    }
  }, [offerQuery, offerImagesQuery]);

  // Merge images + imagesObjects từ cùng 1 useMemo để tránh tính toán 2 lần
  const { images, imagesObjects } = useMemo(() => {
    let imageUrls: string[] = [];
    let objects: typeof offerImagesQuery.data = [];

    if (offerImagesQuery.data && offerImagesQuery.data.length > 0) {
      objects = offerImagesQuery.data;
      imageUrls = offerImagesQuery.data.map((img) => img.image_url);
    } else if (offer?.images && offer.images.length > 0) {
      objects = offer.images as any;
      imageUrls = offer.images.map((img) => img.image_url);
    } else if (offer?.primary_image?.image_url) {
      imageUrls = [offer.primary_image.image_url];
    } else if (offer?.image_url) {
      imageUrls = [offer.image_url];
    }

    return {
      images: imageUrls.length > 0 ? imageUrls : [PLACEHOLDER_IMAGE],
      imagesObjects: objects ?? [],
    };
  }, [offerImagesQuery.data, offer?.images, offer?.primary_image, offer?.image_url]);

  // Handle scroll để cập nhật currentImageIndex khi swipe
  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = (event as unknown as { nativeEvent: NativeScrollEvent }).nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / SCREEN_WIDTH);
    if (index >= 0 && index < images.length) {
      setCurrentImageIndex(index);
    }
  };

  // Scroll đến ảnh khi click thumbnail
  const scrollToImage = (index: number) => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({ index, animated: true });
    }
    setCurrentImageIndex(index);
  };

  return (
    <Screen headerTitle="Chi tiết ưu đãi" showBackButton safeAreaTopColor={Colors.primary} statusBarStyle="light-content">
      <QueryWrapper
        query={offerQuery}
        errorMessage="Lỗi tải chi tiết ưu đãi"
        checkEmpty={(data: any) => !data?.data}
        emptyMessage="Không tìm thấy ưu đãi"
        emptyIcon="pricetag-outline"
        loadingComponent={
          <View style={[styles.body, { justifyContent: "center", alignItems: "center", flex: 1 }]}>
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
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
              >
                <View style={styles.body}>
                  {/* Image Carousel — FlatList horizontal để virtualize ảnh lớn */}
                  <View style={styles.imageCarouselContainer}>
                    <FlatList
                      ref={flatListRef}
                      data={images}
                      horizontal
                      pagingEnabled
                      showsHorizontalScrollIndicator={false}
                      onMomentumScrollEnd={handleScrollEnd}
                      decelerationRate="fast"
                      style={styles.imageCarouselScroll}
                      keyExtractor={(_, index) => index.toString()}
                      getItemLayout={(_, index) => ({
                        length: SCREEN_WIDTH,
                        offset: SCREEN_WIDTH * index,
                        index,
                      })}
                      renderItem={({ item: imageUrl, index }) => (
                        <TouchableOpacity
                          style={styles.imageCarousel}
                          onPress={() => setSelectedImage(imageUrl)}
                          activeOpacity={0.9}
                        >
                          <Image source={{ uri: imageUrl }} style={styles.offerImage} resizeMode="cover" />
                        </TouchableOpacity>
                      )}
                    />

                    {/* Image Indicators */}
                    {images.length > 1 && (
                      <View style={styles.imageIndicators}>
                        {images.map((_, index) => (
                          <View
                            key={index}
                            style={[styles.indicator, index === currentImageIndex && styles.indicatorActive]}
                          />
                        ))}
                      </View>
                    )}
                  </View>

                  {/* Divider giữa ảnh to và list ảnh */}
                  {images.length > 1 && <View style={styles.divider} />}

                  {/* Image Gallery Thumbnails */}
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
                            onPress={() => scrollToImage(index)}
                            activeOpacity={0.8}
                            style={[styles.thumbnail, index === currentImageIndex && styles.thumbnailActive]}
                          >
                            <Image source={{ uri: imageUrl }} style={styles.thumbnailImage} resizeMode="cover" />
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
                        <Text style={styles.metadataText}>Dịch vụ: {offer.service_name}</Text>
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
                          <Text style={styles.metadataText}>Giảm giá: {offer.discount}%</Text>
                        </View>
                      )}

                      {offer.valid_from && offer.valid_to && (
                        <View style={styles.metadataRow}>
                          <Ionicons name="calendar-outline" size={20} color={Colors.text.secondary} />
                          <Text style={styles.metadataText}>
                            Áp dụng: {new Date(offer.valid_from).toLocaleDateString("vi-VN")} -{" "}
                            {new Date(offer.valid_to).toLocaleDateString("vi-VN")}
                          </Text>
                        </View>
                      )}

                      {images.length === 1 && images[0] === PLACEHOLDER_IMAGE && (
                        <View style={styles.noImageNotice}>
                          <Ionicons name="information-circle-outline" size={20} color={Colors.status.warning} />
                          <Text style={styles.noImageText}>Ưu đãi chưa có hình ảnh</Text>
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
                    navigation.navigate("Booking");
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
      <Modal visible={!!selectedImage} transparent={true} animationType="fade" onRequestClose={() => setSelectedImage(null)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalCloseButton} onPress={() => setSelectedImage(null)}>
            <Ionicons name="close-outline" size={30} color={Colors.background.light} />
          </TouchableOpacity>
          {selectedImage && <Image source={{ uri: selectedImage }} style={styles.fullScreenImage} resizeMode="contain" />}
        </View>
      </Modal>
    </Screen>
  );
};

export default OfferDetailScreen;
