// src/screens/ProductDetail/ProductDetailScreen.tsx
import React, { useState } from "react";
import { 
  View, 
  Text, 
  StatusBar, 
  ScrollView, 
  Image, 
  Dimensions,
  TouchableOpacity 
} from "react-native";
import { RootView } from "../../components/layout";
import { Colors } from "../../constants/colors";
import Header from "../../components/Header";
import ConfirmButton from "../../components/ConfirmButton";
import { useRoute, RouteProp } from "@react-navigation/native";
import { AppStackParamList } from "../../navigation/AppNavigator";
import { useGetCategoriesQuery } from "../../services/categoryApi";
import { styles } from "./styles";
import Ionicons from 'react-native-vector-icons/Ionicons';

type ProductDetailRouteProp = RouteProp<AppStackParamList, 'ProductDetail'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = SCREEN_WIDTH * 0.8;

// Placeholder image URL
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/400x400/cccccc/666666?text=No+Image';

const ProductDetailScreen = () => {
  const route = useRoute<ProductDetailRouteProp>();
  const { product } = route.params;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Fetch categories to get category name
  const { data: categories = [] } = useGetCategoriesQuery();
  
  // Find category name by ID
  const categoryName = product.category_id
    ? categories.find(cat => cat.id === product.category_id)?.name
    : undefined;

  // Prepare images array (use placeholder if no images)
  const images = product.images && product.images.length > 0
    ? product.images.map(img => img.image_url)
    : [product.primary_image || PLACEHOLDER_IMAGE];

  const handleImageChange = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      setCurrentImageIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
    } else {
      setCurrentImageIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
    }
  };

  return (
    <RootView style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <Header title="Chi tiết sản phẩm" />
      
      <ScrollView style={styles.whiteSection} showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          {/* Image Carousel */}
          <View style={styles.imageCarousel}>
            <Image 
              source={{ uri: images[currentImageIndex] }}
              style={styles.productImage}
              resizeMode="cover"
            />
            
            {/* Image Navigation */}
            {images.length > 1 && (
              <>
                <TouchableOpacity 
                  style={[styles.imageNav, styles.imageNavLeft]}
                  onPress={() => handleImageChange('left')}
                >
                  <Ionicons name="chevron-back" size={24} color={Colors.background.light} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.imageNav, styles.imageNavRight]}
                  onPress={() => handleImageChange('right')}
                >
                  <Ionicons name="chevron-forward" size={24} color={Colors.background.light} />
                </TouchableOpacity>
                
                {/* Image Indicators */}
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
              </>
            )}
          </View>

          {/* Product Info */}
          <View style={styles.infoSection}>
            <Text style={styles.productName}>{product.name}</Text>

            {/* Product Description */}
            {product.description && (
              <View style={styles.descriptionSection}>
                <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
                <Text style={styles.descriptionText}>{product.description}</Text>
              </View>
            )}

            {/* Image Gallery Thumbnails */}
            {images.length > 1 && (
              <View style={styles.thumbnailSection}>
                <Text style={styles.sectionTitle}>Hình ảnh ({images.length})</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.thumbnailScroll}
                >
                  {images.map((imageUrl, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setCurrentImageIndex(index)}
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
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Product Metadata */}
            <View style={styles.metadataSection}>
              <View style={styles.metadataRow}>
                <Ionicons name="cube-outline" size={20} color={Colors.text.secondary} />
                <Text style={styles.metadataText}>
                  Mã sản phẩm: #{product.id}
                </Text>
              </View>
              
              {categoryName && (
                <View style={styles.metadataRow}>
                  <Ionicons name="grid-outline" size={20} color={Colors.text.secondary} />
                  <Text style={styles.metadataText}>
                    Danh mục: {categoryName}
                  </Text>
                </View>
              )}
              
              {images.length === 1 && images[0] === PLACEHOLDER_IMAGE && (
                <View style={styles.noImageNotice}>
                  <Ionicons name="information-circle-outline" size={20} color={Colors.status.warning} />
                  <Text style={styles.noImageText}>
                    Sản phẩm chưa có hình ảnh
                  </Text>
                </View>
              )}
            </View>

            {/* Contact Button */}
            <View style={styles.actionSection}>
              <ConfirmButton
                title="Liên hệ để đặt hàng"
                onPress={() => {
                  // TODO: Implement contact functionality
                  console.log('Contact for product:', product.id);
                }}
                buttonColor={Colors.primary}
                textColor={Colors.text.inverted}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </RootView>
  );
};

export default ProductDetailScreen;

