import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import NetInfo from '@react-native-community/netinfo';
import {
  Sparkles,
  Zap,
  Clock,
  Flame,
  Percent,
  TrendingUp,
  Star,
  Calendar,
  Search,
  ShoppingCart,
  Bell,
} from 'lucide-react-native';
import { ProductWithDeal } from '@/types/database';
import { Vendor } from '@/types/database';
import {
  getHomePage,
  apiProductToProductWithDeal,
  homePageBrandToVendor,
  getImageUrl,
} from '@/lib/api';
import DealSection from '@/components/DealSection';
import BrandSection from '@/components/BrandSection';
import BannerSlider from '@/components/BannerSlider';
import CategoryPills from '@/components/CategoryPills';
import NoInternetScreen from '@/components/NoInternetScreen';
import { SkeletonBanner, SkeletonSection } from '@/components/SkeletonLoaders';
import DailySpaceSection from '@/components/DailySpaceSection';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [banners, setBanners] = useState<{ id: string; image: string; title: string; subtitle: string }[]>([]);

  const [hero, setHero] = useState<ProductWithDeal[]>([]);
  const [deal99, setDeal99] = useState<ProductWithDeal[]>([]);
  const [hourly, setHourly] = useState<ProductWithDeal[]>([]);
  const [dealOfDay, setDealOfDay] = useState<ProductWithDeal[]>([]);
  const [heavyDiscount, setHeavyDiscount] = useState<ProductWithDeal[]>([]);
  const [hotDeals, setHotDeals] = useState<ProductWithDeal[]>([]);
  const [trending, setTrending] = useState<ProductWithDeal[]>([]);
  const [productsInFocus, setProductsInFocus] = useState<ProductWithDeal[]>([]);
  const [preOrder, setPreOrder] = useState<ProductWithDeal[]>([]);
  const [brandInFocus, setBrandInFocus] = useState<Vendor[]>([]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected ?? false);
    });

    return () => unsubscribe();
  }, []);

  const fetchHome = async () => {
    try {
      setHasError(false);
      const data = await getHomePage();
      const sections = data.sections ?? {};
      const toDeals = (arr: unknown[]) =>
        (arr ?? []).map((p) => apiProductToProductWithDeal(p as import('@/lib/api').HomePageSectionProduct));

      setHero(toDeals(sections.hero ?? []));
      setDeal99(toDeals(sections.deal99 ?? []));
      setHourly(toDeals(sections.hourly ?? []));
      setDealOfDay(toDeals(sections.dealOfDay ?? []));
      setHeavyDiscount(toDeals(sections.heavyDiscount ?? []));
      setHotDeals(toDeals(sections.hotDeals ?? []));
      setTrending(toDeals(sections.trending ?? []));
      setProductsInFocus(toDeals(sections.productsInFocus ?? []));
      setPreOrder(toDeals(sections.preOrder ?? []));

      const brands = (sections.brandInFocus ?? []) as import('@/lib/api').HomePageBrand[];
      setBrandInFocus(brands.map(homePageBrandToVendor));

      const b = data.banners;
      if (b) {
        const list: { id: string; image: string; title: string; subtitle: string }[] = [];
        Object.entries(b).forEach(([key, v]) => {
          if (v?.image) {
            list.push({
              id: key,
              image: getImageUrl(v.image),
              title: v.title ?? '',
              subtitle: v.subtitle ?? '',
            });
          }
        });
        if (list.length > 0) setBanners(list);
      }
    } catch (error) {
      console.error('Error fetching home:', error);
      setHasError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isConnected) {
      fetchHome();
    }
  }, [isConnected]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHome();
  };

  const handleRetry = () => {
    setLoading(true);
    fetchHome();
  };

  const handleProductPress = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  const handleBrandPress = () => {
    router.push('/(tabs)/vendors');
  };

  // No Internet Screen
  if (!isConnected || (hasError && !loading)) {
    return <NoInternetScreen onRetry={handleRetry} />;
  }

  // Skeleton Loading Screen
  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <View style={[styles.stickyHeader, { paddingTop: insets.top }]}>
          <LinearGradient colors={['#FFFFFF', '#F9FAFB']} style={styles.headerGradient}>
            <View style={styles.headerContent}>
              <Text style={styles.logo}>DealRush</Text>
              <View style={styles.headerIcons}>
                <TouchableOpacity style={styles.iconBtn}>
                  <Bell size={22} color="#374151" strokeWidth={2} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn}>
                  <ShoppingCart size={22} color="#374151" strokeWidth={2} />
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity style={styles.searchBar} activeOpacity={0.7}>
              <Search size={18} color="#9CA3AF" />
              <Text style={styles.searchPlaceholder}>Search products, brands...</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

          <CategoryPills onCategoryPress={() => { }} />
          <SkeletonBanner />
          <SkeletonSection cardVariant="featured" />
          <SkeletonSection />
          <SkeletonBanner />
          <SkeletonSection />
          <SkeletonSection />
          <SkeletonBanner />
          <View style={styles.bottomPadding} />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Fixed Top Header */}
      <View style={[styles.stickyHeader, { paddingTop: insets.top }]}>
        <LinearGradient colors={['#FFFFFF', '#F9FAFB']} style={styles.headerGradient}>
          <View style={styles.headerContent}>
            <Text style={styles.logo}>DealRush</Text>
            <View style={styles.headerIcons}>
              <TouchableOpacity style={styles.iconBtn}>
                <Bell size={22} color="#374151" strokeWidth={2} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn}>
                <ShoppingCart size={22} color="#374151" strokeWidth={2} />
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity style={styles.searchBar} activeOpacity={0.7}>
            <Search size={18} color="#9CA3AF" />
            <Text style={styles.searchPlaceholder}>Search products, brands...</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#DC2626" />
        }
        showsVerticalScrollIndicator={false}>


        <CategoryPills onCategoryPress={(id) => console.log('Category:', id)} />

        <BannerSlider />

        <DailySpaceSection />

        <DealSection
          title="Hero picks"
          subtitle="Curated for you"
          deals={hero}
          loading={false}
          onProductPress={handleProductPress}
          variant="violet"
          cardVariant="featured"
          icon={Sparkles}
        />

        <DealSection
          title="Deal 99"
          subtitle="Everything at ₹99"
          deals={deal99}
          loading={false}
          onProductPress={handleProductPress}
          variant="amber"
          icon={Zap}
        />

        <BannerSlider />

        <DealSection
          title="Hourly deals"
          subtitle="New deals every hour"
          deals={hourly}
          loading={false}
          onProductPress={handleProductPress}
          variant="teal"
          icon={Clock}
          hideTime
        />

        <DealSection
          title="Deal of the day"
          subtitle="Limited time – grab them now"
          deals={dealOfDay}
          loading={false}
          onProductPress={handleProductPress}
          variant="red"
          icon={Flame}
        />

        <DealSection
          title="Heavy discount"
          subtitle="Up to 50% off and more"
          deals={heavyDiscount}
          loading={false}
          onProductPress={handleProductPress}
          variant="orange"
          icon={Percent}
        />

        <BannerSlider />

        <BrandSection
          title="Brand in focus"
          subtitle="Shop by brand"
          brands={brandInFocus}
          loading={false}
          onBrandPress={handleBrandPress}
        />

        <DealSection
          title="Hot deals"
          subtitle="Trending at great prices"
          deals={hotDeals}
          loading={false}
          onProductPress={handleProductPress}
          variant="red"
          layout="grid"
          icon={Flame}
        />

        <BannerSlider />

        <DealSection
          title="Trending"
          subtitle="What others are buying"
          deals={trending}
          loading={false}
          onProductPress={handleProductPress}
          variant="emerald"
          icon={TrendingUp}
        />

        <DealSection
          title="Products in focus"
          subtitle="Handpicked for you"
          deals={productsInFocus}
          loading={false}
          onProductPress={handleProductPress}
          variant="slate"
          icon={Star}
        />

        <DealSection
          title="Pre-order"
          subtitle="Coming soon – book now"
          deals={preOrder}
          loading={false}
          onProductPress={handleProductPress}
          variant="violet"
          icon={Calendar}
        />

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
    marginBottom: 12,
  },
  logo: {
    fontSize: 24,
    fontWeight: '800',
    color: '#DC2626',
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 10,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 14,
    color: '#9CA3AF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  bottomPadding: {
    height: 20,
  },
});
