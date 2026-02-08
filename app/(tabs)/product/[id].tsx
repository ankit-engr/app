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
import { getProductById, getProductBySlug, getImageUrl } from '@/lib/api';
import { ProductWithDeal } from '@/types/database';
import ProductImageGallery from '@/components/ProductImageGallery';

function mapDetailToProductWithDeal(data: NonNullable<Awaited<ReturnType<typeof getProductById>>>): ProductWithDeal {
  const p = data.product;
  const images = (p.product_images ?? []).map((i) => getImageUrl(i.imageUrl));
  const imageUrl = images[0] || null;
  const comparePrice = p.comparePrice ?? p.price;
  const effectivePrice = p.effectivePrice ?? p.price;
  const discountPct = comparePrice > 0 ? Math.round(((comparePrice - effectivePrice) / comparePrice) * 100) : 0;
  return {
    id: p.id,
    vendor_id: '',
    name: p.name,
    description: p.description ?? null,
    price: p.price,
    image_url: imageUrl,
    image_urls: images,
    stock: p.stock ?? 0,
    is_active: (p.status ?? 'active') === 'active',
    created_at: '',
    deals: discountPct > 0
      ? [
          {
            id: `${p.id}-deal`,
            product_id: p.id,
            deal_type: 'discount',
            discount_percentage: discountPct,
            discounted_price: effectivePrice,
            start_date: '',
            end_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            is_active: true,
            created_at: '',
          },
        ]
      : [],
    vendors: p.vendors
      ? {
          id: '',
          name: p.vendors.name,
          logo_url: p.vendors.logoUrl ? getImageUrl(p.vendors.logoUrl) : null,
          description: null,
          is_featured: false,
          created_at: '',
        }
      : { id: '', name: '', logo_url: null, description: null, is_featured: false, created_at: '' },
  };
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<ProductWithDeal | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    if (!id) return;

    try {
      let data = await getProductById(id);
      if (!data && id && !id.includes('-')) {
        data = await getProductBySlug(id);
      }
      setProduct(data ? mapDetailToProductWithDeal(data) : null);
    } catch (error) {
      console.error('Error fetching product:', error);
      setProduct(null);
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

  const images =
    product.image_urls && product.image_urls.length > 0
      ? product.image_urls
      : product.image_url
        ? [product.image_url]
        : [];

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
        <ProductImageGallery images={images} initialIndex={0} />

        <View style={styles.contentContainer}>
          {vendor && vendor.name && (
            <View style={styles.vendorSection}>
              {vendor.logo_url ? (
                <Image source={{ uri: vendor.logo_url }} style={styles.vendorLogo} />
              ) : null}
              <Text style={styles.vendorName}>{vendor.name}</Text>
            </View>
          )}

          <Text style={styles.productName}>{product.name}</Text>
          
          {product.description && (
            <View style={styles.descriptionPreview}>
              <Text
                style={styles.productDescription}
                numberOfLines={descriptionExpanded ? undefined : 2}>
                {product.description}
              </Text>
              {product.description.length > 80 && (
                <TouchableOpacity
                  onPress={() => setDescriptionExpanded(!descriptionExpanded)}
                  style={styles.seeMoreBtn}>
                  <Text style={styles.seeMoreText}>
                    {descriptionExpanded ? 'See less' : 'See more'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

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
                  <Text style={styles.originalPrice}>₹{product.price.toFixed(0)}</Text>
                  <Text style={styles.finalPrice}>₹{deal.discounted_price.toFixed(0)}</Text>
                </View>
                <Text style={styles.dealType}>{deal.deal_type.replace(/_/g, ' ').toUpperCase()}</Text>
              </View>
            ) : (
              <Text style={styles.finalPrice}>₹{product.price.toFixed(0)}</Text>
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
    marginBottom: 12,
  },
  descriptionPreview: {
    marginBottom: 16,
  },
  productDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  seeMoreBtn: {
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  seeMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
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
