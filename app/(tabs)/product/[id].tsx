import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Heart, Share2, ShoppingCart, Star, Truck, Shield } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { ProductWithDeal } from '@/types/database';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<ProductWithDeal | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    if (!id) return;

    try {
      const { data } = await supabase
        .from('products')
        .select('*, deals(*), vendors(*)')
        .eq('id', id)
        .maybeSingle();

      setProduct((data as ProductWithDeal) || null);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#DC2626" />
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
        </View>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Product not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const deal = product.deals?.[0];
  const vendor = product.vendors;

  const images = product.image_urls && product.image_urls.length > 0
    ? (product.image_urls as string[])
    : [product.image_url || ''];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Details</Text>
        <TouchableOpacity onPress={() => setIsFavorite(!isFavorite)}>
          <Heart
            size={24}
            color={isFavorite ? '#DC2626' : '#D1D5DB'}
            fill={isFavorite ? '#DC2626' : 'transparent'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.imageSection}>
          <Image
            source={{ uri: images[imageIndex] }}
            style={styles.mainImage}
            defaultSource={require('@/assets/images/icon.png')}
          />
          {images.length > 1 && (
            <View style={styles.imageIndicators}>
              {images.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.imageIndicator,
                    index === imageIndex && styles.activeIndicator,
                  ]}
                  onPress={() => setImageIndex(index)}
                />
              ))}
            </View>
          )}
        </View>

        <View style={styles.contentContainer}>
          {vendor && (
            <View style={styles.vendorSection}>
              <Image
                source={{ uri: vendor.logo_url || '' }}
                style={styles.vendorLogo}
              />
              <Text style={styles.vendorName}>{vendor.name}</Text>
            </View>
          )}

          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productDescription}>{product.description}</Text>

          <View style={styles.ratingSection}>
            <View style={styles.stars}>
              {[0, 1, 2, 3, 4].map((index) => (
                <Star
                  key={index}
                  size={16}
                  color="#FCD34D"
                  fill="#FCD34D"
                />
              ))}
            </View>
            <Text style={styles.ratingText}>(142 reviews)</Text>
          </View>

          <View style={styles.priceSection}>
            {deal ? (
              <View style={styles.priceWithDeal}>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{deal.discount_percentage}% OFF</Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.originalPrice}>${product.price.toFixed(2)}</Text>
                  <Text style={styles.finalPrice}>${deal.discounted_price.toFixed(2)}</Text>
                </View>
                <Text style={styles.dealType}>{deal.deal_type.replace(/_/g, ' ').toUpperCase()}</Text>
              </View>
            ) : (
              <Text style={styles.finalPrice}>${product.price.toFixed(2)}</Text>
            )}
          </View>

          <View style={styles.featuresSection}>
            <View style={styles.featureItem}>
              <Truck size={20} color="#DC2626" />
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Free Shipping</Text>
                <Text style={styles.featureSubtitle}>On orders above $50</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Shield size={20} color="#DC2626" />
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Secure Payment</Text>
                <Text style={styles.featureSubtitle}>100% safe transactions</Text>
              </View>
            </View>
          </View>

          <View style={styles.stockSection}>
            <Text style={styles.stockLabel}>In Stock</Text>
            <Text style={styles.stockValue}>{product.stock} items available</Text>
          </View>

          <View style={styles.descriptionBox}>
            <Text style={styles.descriptionTitle}>About this product</Text>
            <Text style={styles.descriptionText}>
              Premium quality product sourced from {vendor?.name}. Manufactured with high-quality materials and
              tested for durability. Perfect for your needs with excellent customer support.
            </Text>
          </View>

          <View style={styles.bottomPadding} />
        </View>
      </ScrollView>

      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.shareButton}>
          <Share2 size={20} color="#DC2626" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.addToCartButton}>
          <ShoppingCart size={20} color="#FFFFFF" />
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: 16,
    color: '#6B7280',
  },
  scrollView: {
    flex: 1,
  },
  imageSection: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  mainImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  imageIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  imageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
  },
  activeIndicator: {
    backgroundColor: '#DC2626',
    width: 24,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  vendorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  vendorLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  vendorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
  },
  productName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  stars: {
    flexDirection: 'row',
    gap: 4,
    marginRight: 12,
  },
  ratingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  priceSection: {
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  priceWithDeal: {
    gap: 12,
  },
  discountBadge: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  discountText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  originalPrice: {
    fontSize: 16,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  finalPrice: {
    fontSize: 28,
    fontWeight: '700',
    color: '#DC2626',
  },
  dealType: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  featuresSection: {
    gap: 16,
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  featureSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  stockSection: {
    backgroundColor: '#ECFDF5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#BBEAD5',
  },
  stockLabel: {
    fontSize: 12,
    color: '#047857',
    fontWeight: '600',
    marginBottom: 4,
  },
  stockValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#047857',
  },
  descriptionBox: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  actionBar: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  shareButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: '#DC2626',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    height: 48,
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bottomPadding: {
    height: 20,
  },
});
