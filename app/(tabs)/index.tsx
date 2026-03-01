import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Image, ImageBackground } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import NetInfo from '@react-native-community/netinfo';
import {
  Clock,
  Search,
  ShoppingCart,
  User,
  ChevronRight,
  Tag,
  Flame,
  Zap,
} from 'lucide-react-native';
import { ProductWithDeal, Vendor } from '@/types/database';
import {
  getHomePage,
  apiProductToProductWithDeal,
  homePageBrandToVendor,
  getImageUrl,
  HomePageSectionProduct,
  HomePageBrand,
} from '@/lib/api';
import NoInternetScreen from '@/components/NoInternetScreen';
import { SkeletonBanner, SkeletonSection } from '@/components/SkeletonLoaders';
import { useAppState } from '@/contexts/AppStateContext';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isLoggedIn } = useAppState();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [banners, setBanners] = useState<{ id: string; image: string; title: string; subtitle: string }[]>([]);

  const [hero, setHero] = useState<ProductWithDeal[]>([]);
  const [deal99, setDeal99] = useState<ProductWithDeal[]>([]);
  const [hourlyRaw, setHourlyRaw] = useState<HomePageSectionProduct[]>([]);
  const [dealOfDay, setDealOfDay] = useState<ProductWithDeal[]>([]);
  const [heavyDiscount, setHeavyDiscount] = useState<ProductWithDeal[]>([]);
  const [hotDeals, setHotDeals] = useState<ProductWithDeal[]>([]);
  const [trending, setTrending] = useState<ProductWithDeal[]>([]);
  const [productsInFocus, setProductsInFocus] = useState<ProductWithDeal[]>([]);
  const [preOrder, setPreOrder] = useState<ProductWithDeal[]>([]);
  const [brandInFocus, setBrandInFocus] = useState<Vendor[]>([]);
  const [nowTick, setNowTick] = useState(0);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected ?? false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNowTick((n) => (n + 1) % 1000000), 1000);
    return () => clearInterval(t);
  }, []);

  const fetchHome = async () => {
    try {
      setHasError(false);
      const data = await getHomePage();
      const sections = data.sections ?? {};
      const toDeals = (arr: unknown[]) =>
        (arr ?? []).map((p) => apiProductToProductWithDeal(p as HomePageSectionProduct));

      setHero(toDeals(sections.hero ?? []));
      setDeal99(toDeals(sections.deal99 ?? []));
      setHourlyRaw((sections.hourly ?? []) as HomePageSectionProduct[]);
      setDealOfDay(toDeals(sections.dealOfDay ?? []));
      setHeavyDiscount(toDeals(sections.heavyDiscount ?? []));
      setHotDeals(toDeals(sections.hotDeals ?? []));
      setTrending(toDeals(sections.trending ?? []));
      setProductsInFocus(toDeals(sections.productsInFocus ?? []));
      setPreOrder(toDeals(sections.preOrder ?? []));

      const brands = (sections.brandInFocus ?? []) as HomePageBrand[];
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
    if (isConnected) fetchHome();
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

  const firstBanner = banners[0] ?? null;
  const dailyDealsBg =
    firstBanner?.image
      ? { uri: firstBanner.image }
      : require('@/assets/images/hero_banner_super_sale_1770529956779.png');

  // Countdown timer – use first hourly item's dealTime
  void nowTick;
  const now = new Date();
  const nextHourMs = (60 - now.getMinutes()) * 60 * 1000 - now.getSeconds() * 1000;
  const tls = Math.floor(nextHourMs / 1000);
  const tlH = Math.floor(tls / 3600);
  const tlM = Math.floor((tls % 3600) / 60);
  const tlS = tls % 60;
  const timeLabel = `${String(tlH).padStart(2, '0')}:${String(tlM).padStart(2, '0')}:${String(tlS).padStart(2, '0')}`;

  const featuredProduct = hotDeals[0] ?? hero[0] ?? trending[0] ?? null;
  const featuredOriginalPrice = featuredProduct?.price ?? 0;
  const featuredDiscountedPrice = featuredProduct?.deals?.[0]?.discounted_price ?? featuredOriginalPrice;
  const brandProducts = (heavyDiscount.length > 0 ? heavyDiscount : trending).slice(0, 3);
  const gridItems = (preOrder.length > 0 ? preOrder : productsInFocus).slice(0, 4);

  if (!isConnected || (hasError && !loading)) {
    return <NoInternetScreen onRetry={handleRetry} />;
  }

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <View style={[styles.stickyHeader, { paddingTop: insets.top }]}>
          <View style={styles.headerGradient}>
            <View style={styles.headerContent}>
              <Text style={styles.logo}>DEALRUSH</Text>
              <View style={styles.headerIcons}>
                <TouchableOpacity
                  style={styles.loginBtn}
                  activeOpacity={0.85}
                  onPress={() => router.push(isLoggedIn ? '/(tabs)/profile' : '/login')}>
                  <User size={15} color="#FFFFFF" strokeWidth={2.2} />
                  <Text style={styles.loginBtnText}>{isLoggedIn ? 'Profile' : 'Login'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.iconBtn, styles.iconBtnDark]} activeOpacity={0.8}>
                  <ShoppingCart size={20} color="#FFFFFF" strokeWidth={2.2} />
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity style={styles.searchBar} activeOpacity={0.8}>
              <Search size={18} color="rgba(255,255,255,0.75)" />
              <Text style={styles.searchPlaceholder}>Search brands and deals...</Text>
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
      {/* Header */}
      <View style={[styles.stickyHeader, { paddingTop: insets.top }]}>
        <View style={styles.headerGradient}>
          <View style={styles.headerContent}>
            <Text style={styles.logo}>DEALRUSH</Text>
            <View style={styles.headerIcons}>
              <TouchableOpacity
                style={styles.loginBtn}
                activeOpacity={0.85}
                onPress={() => router.push(isLoggedIn ? '/(tabs)/profile' : '/login')}>
                <User size={15} color="#FFFFFF" strokeWidth={2.2} />
                <Text style={styles.loginBtnText}>{isLoggedIn ? 'Profile' : 'Login'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.iconBtn, styles.iconBtnDark]} activeOpacity={0.8} onPress={() => router.push('/(tabs)/cart')}>
                <ShoppingCart size={20} color="#FFFFFF" strokeWidth={2.2} />
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity style={styles.searchBar} activeOpacity={0.8}>
            <Search size={18} color="rgba(255,255,255,0.75)" />
            <Text style={styles.searchPlaceholder}>Search brands and deals...</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#DC2626" />}
        showsVerticalScrollIndicator={false}>

        {/* ── Daily Deals Banner ── */}
        <TouchableOpacity
          style={styles.dailyDealsWrap}
          activeOpacity={0.9}
          onPress={() => {
            const first = dealOfDay[0] ?? hero[0] ?? null;
            if (first) handleProductPress(first.id);
          }}>
          <ImageBackground source={dailyDealsBg} style={styles.dailyDealsBg} resizeMode="cover">
            <View style={styles.dailyDealsOverlay} />
            <View style={styles.dailyDealsContent}>
              <View style={styles.dailyDynamicRow}>
                <View style={styles.dailyDealsTag}>
                  <Text style={styles.dailyDealsTagText}>DYNAMIC</Text>
                </View>
                <View style={styles.limitedTimeBadge}>
                  <Text style={styles.limitedTimeText}>LIMITED TIME</Text>
                </View>
              </View>
              <Text style={styles.dailyDealsTitle}>DAILY DEALS</Text>
              <Text style={styles.dailyDealsSubtitle}>Save up to 80% every day</Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>

        {/* ── 1. Deal 99 – Red section ── */}
        <View style={styles.deal99Section}>
          <View style={styles.deal99HeaderRow}>
            <View>
              <Text style={styles.deal99Title}>DEAL 99</Text>
              <Text style={styles.deal99Subtitle}>EVERYTHING AT EXACTLY ₹99</Text>
            </View>
            <Tag size={28} color="rgba(255,255,255,0.7)" strokeWidth={1.8} />
          </View>
          <View style={styles.deal99Row}>
            {deal99.slice(0, 3).map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.deal99Card}
                activeOpacity={0.9}
                onPress={() => handleProductPress(item.id)}>
                <View style={styles.deal99CircleBg}>
                  <Image source={{ uri: item.image_url || 'https://picsum.photos/200' }} style={styles.deal99Img} resizeMode="contain" />
                </View>
                <View style={styles.deal99CardBody}>
                  <Text style={styles.deal99Name} numberOfLines={2}>{item.name.toUpperCase()}</Text>
                  <Text style={styles.deal99Price}>₹99</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── 2. Hourly Deals ── */}
        <View style={styles.hourlySection}>
          {/* Header */}
          <View style={styles.hourlyHeaderRow}>
            <View style={styles.hourlyHeaderLeft}>
              <Text style={styles.hourlyLabel}>HOURLY DEALS</Text>
              <Text style={styles.hourlyBigTitle}>LIMITED TIME</Text>
            </View>
            <View style={styles.hourlyTimerBox}>
              <Clock size={14} color="#DC2626" strokeWidth={2.5} />
              <Text style={styles.hourlyTimerText}>{timeLabel}</Text>
            </View>
          </View>

          {/* Product grid */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hourlyScroll}>
            {hourlyRaw.slice(0, 10).map((item) => {
              const imgUrl = getImageUrl(item.image);
              const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
              const discountPct = item.discount ?? 0;
              const label = item.dealTime
                ? item.dealTime
                : discountPct > 0
                ? `SAVE ${discountPct}%`
                : `₹${Math.round(price)}`;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.hourlyCard}
                  activeOpacity={0.88}
                  onPress={() => handleProductPress(item.id)}>
                  <View style={styles.hourlyImgWrap}>
                    <Image source={{ uri: imgUrl || 'https://picsum.photos/150' }} style={styles.hourlyImg} resizeMode="cover" />
                  </View>
                  <Text style={styles.hourlyCardLabel} numberOfLines={1}>{label}</Text>
                  <Text style={styles.hourlyCardName} numberOfLines={2}>{item.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* See All */}
          <TouchableOpacity style={styles.hourlyFooterBtn} onPress={() => router.push('/(tabs)/deals')} activeOpacity={0.85}>
            <Text style={styles.hourlyFooterText}>SEE ALL HOURLY DEALS</Text>
            <ChevronRight size={14} color="#DC2626" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* ── 3. Deal of Day ── */}
        {dealOfDay.length > 0 && (
          <>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionLeft}>
                <Flame size={14} color="#EF4444" strokeWidth={2.5} />
                <Text style={styles.sectionTitle}>DEAL OF THE DAY</Text>
              </View>
              <TouchableOpacity style={styles.seeAllBtn} onPress={() => router.push('/(tabs)/deals')} activeOpacity={0.85}>
                <Text style={styles.seeAllText}>SEE ALL</Text>
                <ChevronRight size={14} color="#EF4444" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dealOfDayScroll}>
              {dealOfDay.slice(0, 8).map((item) => {
                const discountPct = item.deals?.[0]?.discount_percentage ?? 0;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.dodCard}
                    activeOpacity={0.9}
                    onPress={() => handleProductPress(item.id)}>
                    <View style={styles.dodImgWrap}>
                      <Image source={{ uri: item.image_url || 'https://picsum.photos/200' }} style={styles.dodImg} />
                      {discountPct > 0 && (
                        <View style={styles.dodBadge}>
                          <Text style={styles.dodBadgeText}>{discountPct}% OFF</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.dodBody}>
                      <Text style={styles.dodName} numberOfLines={2}>{item.name}</Text>
                      <View style={styles.dodPriceRow}>
                        {item.price > (item.deals?.[0]?.discounted_price ?? item.price) && (
                          <Text style={styles.dodOldPrice}>₹{Math.round(item.price)}</Text>
                        )}
                        <Text style={styles.dodPrice}>₹{Math.round(item.deals?.[0]?.discounted_price ?? item.price)}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </>
        )}

        {/* ── 4. Heavy Discount – Horizontal strip ── */}
        {heavyDiscount.length > 0 && (
          <>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionLeft}>
                <Zap size={14} color="#EF4444" strokeWidth={2.5} />
                <Text style={styles.sectionTitle}>HEAVY DISCOUNT</Text>
              </View>
              <TouchableOpacity style={styles.seeAllBtn} onPress={() => router.push('/(tabs)/deals')} activeOpacity={0.85}>
                <Text style={styles.seeAllText}>SEE ALL</Text>
                <ChevronRight size={14} color="#EF4444" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hdScroll}>
              {heavyDiscount.map((item) => {
                const discountPct = item.deals?.[0]?.discount_percentage ?? 0;
                const discountedPrice = item.deals?.[0]?.discounted_price ?? item.price;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.hdCard}
                    activeOpacity={0.9}
                    onPress={() => handleProductPress(item.id)}>
                    <View style={styles.hdImgWrap}>
                      <Image source={{ uri: item.image_url || 'https://picsum.photos/200' }} style={styles.hdImg} />
                      {discountPct > 0 && (
                        <View style={styles.hdBadge}>
                          <Text style={styles.hdBadgeText}>{discountPct}% OFF</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.hdBody}>
                      <Text style={styles.hdName} numberOfLines={2}>{item.name}</Text>
                      <Text style={styles.hdPrice}>₹{Math.round(discountedPrice)}</Text>
                      {item.price > discountedPrice && (
                        <Text style={styles.hdOldPrice}>₹{Math.round(item.price)}</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </>
        )}

        {/* ── 5. Global Brands ── */}
        {brandInFocus.length > 0 && (
          <View style={styles.globalBrandsWrap}>
            <View style={styles.globalBrandsHeader}>
              <View style={styles.fpLeft}>
                <Text style={styles.fpLabel}>EXPLORE</Text>
                <Text style={styles.fpBrandName}>GLOBAL BRANDS</Text>
              </View>
              <TouchableOpacity style={styles.globalBrandsSeeAll} onPress={handleBrandPress} activeOpacity={0.85}>
                <Text style={styles.globalBrandsSeeAllText}>SEE ALL</Text>
                <ChevronRight size={13} color="rgba(255,255,255,0.8)" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.globalBrandsScroll}>
              {brandInFocus.filter(b => b.logo_url).slice(0, 12).map((brand) => (
                <TouchableOpacity
                  key={brand.id}
                  style={styles.globalBrandPill}
                  activeOpacity={0.85}
                  onPress={handleBrandPress}>
                  <View style={styles.globalBrandLogoWrap}>
                    <Image source={{ uri: brand.logo_url || '' }} style={styles.globalBrandLogo} />
                  </View>
                  <Text style={styles.globalBrandName} numberOfLines={1}>{brand.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── Hot Deal – Big Featured Card ── */}
        {featuredProduct && (
          <TouchableOpacity style={styles.bigCard} activeOpacity={0.92} onPress={() => handleProductPress(featuredProduct.id)}>
            <Image source={{ uri: featuredProduct.image_url || 'https://picsum.photos/600/400' }} style={styles.bigCardImg} />
            <View style={styles.bigCardOverlay} />
            <View style={styles.bigCardContent}>
              <View style={styles.bigCardTagWrap}>
                <Zap size={10} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.bigCardTag}>HOT DEAL</Text>
              </View>
              <Text style={styles.bigCardName} numberOfLines={3}>{featuredProduct.name}</Text>
              <Text style={styles.bigCardPrice}>₹{Math.round(featuredDiscountedPrice).toLocaleString()}</Text>
              {featuredOriginalPrice > featuredDiscountedPrice && (
                <Text style={styles.bigCardOriginalPrice}>₹{Math.round(featuredOriginalPrice).toLocaleString()}</Text>
              )}
            </View>
            <View style={styles.buyNowPill}>
              <Text style={styles.buyNowText}>BUY NOW</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* ── 6. Trending ── */}
        {trending.length > 0 && (
          <>
            <View style={[styles.sectionHeaderRow, { marginTop: 18 }]}>
              <Text style={styles.sectionTitle}>TRENDING NOW</Text>
              <TouchableOpacity style={styles.seeAllBtn} onPress={() => router.push('/(tabs)/deals')} activeOpacity={0.85}>
                <Text style={styles.seeAllText}>SEE ALL</Text>
                <ChevronRight size={14} color="#EF4444" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trendingScroll}>
              {trending.slice(0, 8).map((item) => {
                const discountPct = item.deals?.[0]?.discount_percentage ?? 0;
                const discountedPrice = item.deals?.[0]?.discounted_price ?? item.price;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.trendCard}
                    activeOpacity={0.9}
                    onPress={() => handleProductPress(item.id)}>
                    <Image source={{ uri: item.image_url || 'https://picsum.photos/200' }} style={styles.trendImg} />
                    {discountPct > 0 && (
                      <View style={styles.trendBadge}>
                        <Text style={styles.trendBadgeText}>{discountPct}% OFF</Text>
                      </View>
                    )}
                    <View style={styles.trendBody}>
                      <Text style={styles.trendName} numberOfLines={2}>{item.name}</Text>
                      <Text style={styles.trendPrice}>₹{Math.round(discountedPrice)}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </>
        )}

        {/* ── 7. Pre-booking Specials (grid) ── */}
        <View style={styles.prebookHeader}>
          <Text style={styles.sectionTitle}>PRE-BOOKING SPECIALS</Text>
          <Text style={styles.prebookSubtitle}>BE THE FIRST TO OWN THE FUTURE</Text>
        </View>

        <View style={styles.gridWrap}>
          {gridItems.map((item) => {
            const discountedPrice = item.deals?.[0]?.discounted_price ?? item.price ?? 0;
            const discountPct = item.deals?.[0]?.discount_percentage ?? 0;
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.gridCard}
                activeOpacity={0.9}
                onPress={() => handleProductPress(item.id)}>
                <View style={styles.gridImgWrap}>
                  <Image source={{ uri: item.image_url || 'https://picsum.photos/300' }} style={styles.gridImg} />
                  <View style={styles.preOrderBadge}>
                    <Text style={styles.preOrderBadgeText}>PRE-ORDER</Text>
                  </View>
                  {discountPct > 0 && (
                    <View style={styles.gridDiscountBadge}>
                      <Text style={styles.gridDiscountText}>{discountPct}% OFF</Text>
                    </View>
                  )}
                </View>
                <View style={styles.gridBody}>
                  <Text style={styles.gridName} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.gridPrice}>₹{Math.round(discountedPrice).toLocaleString()}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },

  /* Header */
  stickyHeader: {
    backgroundColor: '#DC2626',
    zIndex: 10,
    elevation: 6,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  headerGradient: { paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#DC2626' },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  logo: { fontSize: 22, fontWeight: '900', color: '#FFFFFF', letterSpacing: 1 },
  headerIcons: { flexDirection: 'row', gap: 10 },
  iconBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  iconBtnDark: { backgroundColor: 'rgba(0,0,0,0.25)' },
  loginBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  loginBtnText: { fontSize: 13, fontWeight: '800', color: '#FFFFFF' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, gap: 10 },
  searchPlaceholder: { flex: 1, fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 24 },

  /* Daily Deals Banner */
  dailyDealsWrap: { paddingHorizontal: 14, paddingTop: 12 },
  dailyDealsBg: { height: 140, borderRadius: 16, overflow: 'hidden', justifyContent: 'flex-end' },
  dailyDealsOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.38)' },
  dailyDealsContent: { padding: 14 },
  dailyDynamicRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  dailyDealsTag: { backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.30)' },
  dailyDealsTagText: { color: '#FFFFFF', fontWeight: '800', fontSize: 10, letterSpacing: 1 },
  limitedTimeBadge: { backgroundColor: '#DC2626', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  limitedTimeText: { color: '#FFFFFF', fontWeight: '900', fontSize: 10, letterSpacing: 0.8 },
  dailyDealsTitle: { color: '#FFFFFF', fontWeight: '900', fontSize: 26, letterSpacing: 0.5, lineHeight: 30 },
  dailyDealsSubtitle: { color: 'rgba(255,255,255,0.85)', fontWeight: '600', marginTop: 4, fontSize: 12 },

  /* Section header */
  sectionHeaderRow: { paddingHorizontal: 14, marginTop: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 12, fontWeight: '900', color: '#111827', letterSpacing: 0.8 },
  timerPill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#FEE2E2', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 10 },
  timerText: { fontWeight: '900', color: '#EF4444', fontSize: 11, letterSpacing: 0.5 },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  seeAllText: { fontSize: 11, fontWeight: '900', color: '#EF4444', letterSpacing: 0.6 },

  /* Hourly Deals – dark inspired section */
  hourlySection: { marginTop: 16, marginHorizontal: 14, borderRadius: 20, backgroundColor: '#111827', overflow: 'hidden', paddingTop: 18, paddingBottom: 16 },
  hourlyHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 16 },
  hourlyHeaderLeft: { flex: 1 },
  hourlyLabel: { color: '#DC2626', fontWeight: '900', fontSize: 11, letterSpacing: 1.5, marginBottom: 4, textTransform: 'uppercase' },
  hourlyBigTitle: { color: '#FFFFFF', fontWeight: '900', fontSize: 28, letterSpacing: 0.5, fontStyle: 'italic', lineHeight: 32 },
  hourlyTimerBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 2, borderColor: '#DC2626' },
  hourlyTimerText: { fontWeight: '900', color: '#111827', fontSize: 13, letterSpacing: 0.5 },
  hourlyScroll: { paddingHorizontal: 14, paddingBottom: 4, gap: 12 },
  hourlyCard: { width: 155, alignItems: 'flex-start' },
  hourlyImgWrap: { width: 155, height: 155, borderRadius: 14, overflow: 'hidden', backgroundColor: '#1F2937' },
  hourlyImg: { width: '100%', height: '100%' },
  hourlyCardLabel: { marginTop: 10, fontSize: 13, fontWeight: '900', color: '#DC2626', fontStyle: 'italic', letterSpacing: 0.5, textTransform: 'uppercase' },
  hourlyCardName: { marginTop: 3, fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.75)', lineHeight: 15 },
  hourlyFooterBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 14, gap: 4, paddingVertical: 10, marginHorizontal: 16, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.07)' },
  hourlyFooterText: { fontSize: 11, fontWeight: '900', color: '#DC2626', letterSpacing: 0.8 },

  /* Deal 99 – red section */
  deal99Section: { marginTop: 16, marginHorizontal: 14, borderRadius: 20, backgroundColor: '#DC2626', paddingTop: 18, paddingHorizontal: 16, paddingBottom: 20, overflow: 'hidden' },
  deal99HeaderRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 },
  deal99Title: { color: '#FFFFFF', fontWeight: '900', fontSize: 32, letterSpacing: 0.5, fontStyle: 'italic', lineHeight: 36 },
  deal99Subtitle: { color: '#FFFFFF', fontWeight: '800', fontSize: 11, letterSpacing: 0.8, marginTop: 4, textTransform: 'uppercase' },
  deal99Row: { flexDirection: 'row', gap: 10 },
  deal99Card: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 6 },
  deal99CircleBg: { width: '100%', aspectRatio: 1, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  deal99Img: { width: '80%', height: '80%' },
  deal99CardBody: { paddingHorizontal: 8, paddingVertical: 10 },
  deal99Name: { fontSize: 9, fontWeight: '900', color: '#111827', marginBottom: 5, lineHeight: 13, letterSpacing: 0.2 },
  deal99Price: { fontSize: 18, fontWeight: '900', color: '#DC2626', letterSpacing: 0.2 },

  /* Deal of Day */
  dealOfDayScroll: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 4, gap: 10 },
  dodCard: { width: 130, backgroundColor: '#FFFFFF', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#F3F4F6', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
  dodImgWrap: { width: '100%', height: 110, backgroundColor: '#F3F4F6', position: 'relative' },
  dodImg: { width: '100%', height: '100%' },
  dodBadge: { position: 'absolute', top: 6, right: 6, backgroundColor: '#DC2626', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  dodBadgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '900' },
  dodBody: { padding: 8 },
  dodName: { fontSize: 11, fontWeight: '600', color: '#111827', marginBottom: 5, lineHeight: 15 },
  dodPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dodOldPrice: { fontSize: 10, color: '#9CA3AF', textDecorationLine: 'line-through' },
  dodPrice: { fontSize: 13, fontWeight: '900', color: '#DC2626' },

  /* Global Brands */
  globalBrandsWrap: { marginTop: 16, marginHorizontal: 14, borderRadius: 16, backgroundColor: '#DC2626', overflow: 'hidden', paddingBottom: 16 },
  globalBrandsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingBottom: 12 },
  globalBrandsSeeAll: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  globalBrandsSeeAllText: { fontSize: 11, fontWeight: '900', color: 'rgba(255,255,255,0.85)', letterSpacing: 0.6 },
  globalBrandsScroll: { paddingHorizontal: 14, gap: 12 },
  globalBrandPill: { alignItems: 'center', width: 70 },
  globalBrandLogoWrap: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#FFFFFF', overflow: 'hidden', borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)' },
  globalBrandLogo: { width: '100%', height: '100%', resizeMode: 'cover' },
  globalBrandName: { marginTop: 6, fontSize: 9, fontWeight: '800', color: 'rgba(255,255,255,0.9)', textAlign: 'center', letterSpacing: 0.2 },

  /* Featured Partner (kept for style refs) */
  featuredPartnerWrap: { marginTop: 16, marginHorizontal: 14, borderRadius: 16, backgroundColor: '#DC2626', overflow: 'hidden' },
  fpTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingBottom: 12 },
  fpLeft: { flex: 1 },
  fpLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginBottom: 4 },
  fpBrandName: { color: '#FFFFFF', fontWeight: '900', fontSize: 22, letterSpacing: 0.8 },
  fpLogoBox: { width: 48, height: 48, borderRadius: 10, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  fpLogoImg: { width: 48, height: 48, resizeMode: 'cover' },
  fpLogoLetter: { fontSize: 22, fontWeight: '900', color: '#DC2626' },
  fpProductsRow: { flexDirection: 'row', backgroundColor: '#111827', paddingHorizontal: 12, paddingVertical: 12, gap: 10 },
  fpProductCard: { flex: 1, borderRadius: 10, overflow: 'hidden', backgroundColor: '#1F2937' },
  fpProductImg: { width: '100%', height: 70, backgroundColor: '#374151' },
  fpProductLabel: { color: '#FFFFFF', fontWeight: '800', fontSize: 9, letterSpacing: 0.6, textAlign: 'center', paddingVertical: 5, backgroundColor: 'rgba(0,0,0,0.5)' },

  /* Hot Deal Big Card */
  bigCard: { marginTop: 16, marginHorizontal: 14, borderRadius: 16, overflow: 'hidden', backgroundColor: '#111827' },
  bigCardImg: { width: '100%', height: 240, backgroundColor: '#1F2937' },
  bigCardOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.30)' },
  bigCardContent: { position: 'absolute', top: 14, left: 14, right: 110 },
  bigCardTagWrap: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: '#DC2626', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, marginBottom: 10 },
  bigCardTag: { color: '#FFFFFF', fontWeight: '900', fontSize: 10, letterSpacing: 1 },
  bigCardName: { color: '#FFFFFF', fontWeight: '900', fontSize: 20, lineHeight: 24, marginBottom: 10 },
  bigCardPrice: { color: '#FFFFFF', fontWeight: '900', fontSize: 22 },
  bigCardOriginalPrice: { color: 'rgba(255,255,255,0.55)', fontWeight: '700', fontSize: 13, textDecorationLine: 'line-through', marginTop: 3 },
  buyNowPill: { position: 'absolute', right: 12, bottom: 12, backgroundColor: 'rgba(0,0,0,0.75)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  buyNowText: { color: '#FFFFFF', fontWeight: '900', fontSize: 11, letterSpacing: 1 },

  /* Heavy Discount */
  hdScroll: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 4, gap: 10 },
  hdCard: { width: 140, backgroundColor: '#FFFFFF', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#F3F4F6', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
  hdImgWrap: { width: '100%', height: 120, backgroundColor: '#F3F4F6', position: 'relative' },
  hdImg: { width: '100%', height: '100%' },
  hdBadge: { position: 'absolute', top: 6, left: 6, backgroundColor: '#111827', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  hdBadgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '900' },
  hdBody: { padding: 8 },
  hdName: { fontSize: 11, fontWeight: '600', color: '#111827', marginBottom: 4, lineHeight: 15 },
  hdPrice: { fontSize: 14, fontWeight: '900', color: '#DC2626' },
  hdOldPrice: { fontSize: 10, color: '#9CA3AF', textDecorationLine: 'line-through', marginTop: 1 },

  /* Pre-booking grid */
  prebookHeader: { paddingHorizontal: 14, marginTop: 20, marginBottom: 2 },
  prebookSubtitle: { fontSize: 10, fontWeight: '700', color: '#9CA3AF', letterSpacing: 0.5, marginTop: 3 },
  gridWrap: { paddingHorizontal: 14, paddingTop: 10, flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridCard: { width: '47.5%', backgroundColor: '#FFFFFF', borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#F3F4F6' },
  gridImgWrap: { position: 'relative' },
  gridImg: { width: '100%', height: 120, backgroundColor: '#F3F4F6' },
  preOrderBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: '#111827', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  preOrderBadgeText: { color: '#FFFFFF', fontWeight: '900', fontSize: 8, letterSpacing: 0.8 },
  gridDiscountBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: '#DC2626', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  gridDiscountText: { color: '#FFFFFF', fontSize: 8, fontWeight: '900' },
  gridBody: { padding: 10 },
  gridName: { fontSize: 11, fontWeight: '800', color: '#111827', marginBottom: 5, lineHeight: 15 },
  gridPrice: { fontSize: 14, fontWeight: '900', color: '#111827' },

  /* Trending */
  trendingScroll: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 4, gap: 10 },
  trendCard: { width: 130, backgroundColor: '#FFFFFF', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#F3F4F6', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
  trendImg: { width: '100%', height: 110, backgroundColor: '#F3F4F6' },
  trendBadge: { position: 'absolute', top: 6, right: 6, backgroundColor: '#DC2626', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5 },
  trendBadgeText: { color: '#FFFFFF', fontSize: 8, fontWeight: '900' },
  trendBody: { padding: 8 },
  trendName: { fontSize: 11, fontWeight: '600', color: '#111827', marginBottom: 4, lineHeight: 15 },
  trendPrice: { fontSize: 13, fontWeight: '900', color: '#DC2626' },

  bottomPadding: { height: 24 },
});
