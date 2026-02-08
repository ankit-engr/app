import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, ShoppingCart, Bell, Star, Flame, ArrowRight } from 'lucide-react-native';
import { ProductWithDeal } from '@/types/database';
import {
  shopPageProductToProductWithDeal,
  ShopPageData,
  getImageUrl as getApiImageUrl,
  getShopPage,
} from '@/lib/api';
import DealSection from '@/components/DealSection';
import { SkeletonBanner, SkeletonSection } from '@/components/SkeletonLoaders';

const { width } = Dimensions.get('window');

const SHOP_BANNER_IMG = require('@/assets/images/shop_banner.png');
const HEADER_LOGO = require('@/assets/images/logo.png');

const SHOP_BASE_URL = 'https://dealrush.co.in';

function getShopImageUrl(path: string | undefined | null) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${SHOP_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export default function ShopScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<ShopPageData | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await getShopPage();
      setData(response);
    } catch (error) {
      console.error('Error fetching shop page:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleProductPress = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  const mapProduct = (p: any) => {
    const product = shopPageProductToProductWithDeal(p);
    // Override image URL to use SHOP_BASE_URL
    const correctImage = getShopImageUrl(p.image);
    return {
      ...product,
      image_url: correctImage,
      image_urls: [correctImage],
    };
  };

  // Derived state
  const bestSellerProducts = data?.bestSellers?.products.map(mapProduct) || [];
  const categoryFocusProducts = data?.categoryFocus?.products.map(mapProduct) || [];

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <View style={[styles.stickyHeader, { paddingTop: insets.top }]}>
          <LinearGradient colors={['#FFFFFF', '#F9FAFB']} style={styles.headerGradient}>
            <View style={styles.headerContent}>
              <Image source={HEADER_LOGO} style={styles.headerLogoImage} resizeMode="contain" />
            </View>
          </LinearGradient>
        </View>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <SkeletonBanner />
          <SkeletonSection />
          <SkeletonSection cardVariant="featured" />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Sticky Header */}
      <View style={[styles.stickyHeader, { paddingTop: insets.top }]}>
        <LinearGradient colors={['#FFFFFF', '#F9FAFB']} style={styles.headerGradient}>
          <View style={styles.headerContent}>
            <Image source={HEADER_LOGO} style={styles.headerLogoImage} resizeMode="contain" />
            <View style={styles.headerIcons}>
              <TouchableOpacity style={styles.iconBtn}>
                <Search size={22} color="#374151" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn}>
                <ShoppingCart size={22} color="#374151" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#DC2626" />
        }
      >

        {/* Hero Banner */}
        <View style={styles.bannerContainer}>
          <Image
            source={SHOP_BANNER_IMG}
            style={styles.bannerImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.6)']}
            style={styles.bannerOverlay}
          >
            <Text style={styles.bannerText}>TRENDING NOW</Text>
            <Text style={styles.bannerSubText}>Discover the best deals</Text>
          </LinearGradient>
        </View>

        {/* Categories Section */}
        {data?.categories && data.categories.length > 0 && (
          <View style={styles.categoriesContainer}>
            <View style={styles.categoriesHeader}>
              <Text style={styles.categoriesTitle}>Shop by Category</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesList}>
              {data.categories.map((cat) => (
                <TouchableOpacity key={cat.id} style={styles.categoryCodeItem}>
                  <View style={styles.categoryImageContainer}>
                    <Image
                      source={{ uri: getShopImageUrl(cat.image) }}
                      style={styles.categoryImage}
                      resizeMode="cover"
                    />
                  </View>
                  <Text style={styles.categoryName} numberOfLines={1}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Best Sellers Section */}
        {data?.bestSellers && (
          <DealSection
            title={data.bestSellers.title}
            subtitle={data.bestSellers.subtitle}
            deals={bestSellerProducts}
            loading={false}
            onProductPress={handleProductPress}
            variant="violet"
            icon={Star}
          />
        )}

        {/* Category Focus Section (Hot Deals) */}
        {data?.categoryFocus && (
          <DealSection
            title={data.categoryFocus.title}
            subtitle="Don't miss out on these"
            deals={categoryFocusProducts}
            loading={false}
            onProductPress={handleProductPress}
            variant="orange"
            cardVariant="default"
            layout="grid"
            icon={Flame}
          />
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  stickyHeader: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    zIndex: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  headerGradient: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  headerLogoImage: {
    width: 140,
    height: 40,
  },
  logo: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: 0.5,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  bannerContainer: {
    width: '100%',
    height: 220,
    marginBottom: 24,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingTop: 60,
  },
  bannerText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  bannerSubText: {
    color: '#E5E7EB',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  categoriesHeader: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  categoriesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  categoriesList: {
    paddingHorizontal: 12,
  },
  categoryCodeItem: {
    alignItems: 'center',
    marginHorizontal: 8,
    width: 76,
  },
  categoryImageContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#fff',
    overflow: 'hidden',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
    textAlign: 'center',
  },
  bottomPadding: {
    height: 40,
  },
});
