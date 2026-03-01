import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, SlidersHorizontal, Heart, ChevronDown, ChevronRight, Zap } from 'lucide-react-native';
import { getShopPage } from '@/lib/api';
import type { ShopPageProduct } from '@/lib/api';
import { SkeletonBanner, SkeletonSection } from '@/components/SkeletonLoaders';

type SortOption = 'default' | 'low-high' | 'high-low' | 'discount';
const SORT_LABELS: Record<SortOption, string> = {
  default:   'Default',
  'low-high':'Price: Low to High',
  'high-low':'Price: High to Low',
  discount:  'Huge Deals',
};

interface Category { id: string; name: string; image: string; offer: string }
interface ShopSection { title?: string; products: ShopPageProduct[] }

const BASE = 'https://backend.dealrushs.com';
function imgUrl(path: string) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${BASE}${path.startsWith('/') ? path : '/' + path}`;
}

function fmtPrice(v: string | number) {
  const n = typeof v === 'string' ? parseFloat(v) : v;
  return isNaN(n) ? '₹0' : '₹' + n.toLocaleString('en-IN');
}

export default function ShopScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [sort, setSort] = useState<SortOption>('default');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [selectedCat, setSelectedCat] = useState<string | null>(null);

  const [heroBg, setHeroBg] = useState('');
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSub, setHeroSub] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [bestSellers, setBestSellers] = useState<ShopPageProduct[]>([]);
  const [hotDeals, setHotDeals] = useState<ShopPageProduct[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const data = await getShopPage();
      const hero = data.hero as { title?: string; subtitle?: string; image?: string; fallbackImage?: string } | undefined;
      if (hero) {
        setHeroBg(imgUrl(hero.fallbackImage ?? hero.image ?? ''));
        setHeroTitle(hero.title ?? 'SHOP ALL DEALS');
        setHeroSub(hero.subtitle ?? 'Up to 70% Off Today');
      }
      const cats = data.categories as Category[] | undefined;
      if (cats) setCategories(cats);

      const bs = data.bestSellers as ShopSection | undefined;
      if (bs?.products) setBestSellers(bs.products);

      const cf = data.categoryFocus as ShopSection | undefined;
      if (cf?.products) setHotDeals(cf.products);
    } catch (e) {
      console.error('Shop fetch error', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleSave = (id: string) =>
    setSavedIds((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const allProducts = [...bestSellers, ...hotDeals];

  const filteredProducts = allProducts
    .filter((p) => !searchText || p.title.toLowerCase().includes(searchText.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'low-high') return parseFloat(String(a.newPrice)) - parseFloat(String(b.newPrice));
      if (sort === 'high-low') return parseFloat(String(b.newPrice)) - parseFloat(String(a.newPrice));
      if (sort === 'discount') {
        const da = parseFloat(String(a.oldPrice)) - parseFloat(String(a.newPrice));
        const db = parseFloat(String(b.oldPrice)) - parseFloat(String(b.newPrice));
        return db - da;
      }
      return 0;
    });

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View style={styles.headerBtn} />
          <Text style={styles.headerTitle}>Shop Categories</Text>
          <View style={styles.headerBtn} />
        </View>
        <ScrollView>
          <SkeletonBanner />
          <SkeletonSection />
          <SkeletonSection />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()} activeOpacity={0.8}>
          {/* intentionally empty — shop is a tab root */}
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shop Categories</Text>
        <TouchableOpacity style={styles.headerBtn} activeOpacity={0.8}>
          <Search size={20} color="#111827" strokeWidth={2.2} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 110 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor="#DC2626" />}>

        {/* ── Hero Banner ── */}
        <View style={styles.heroBannerWrap}>
          <ImageBackground
            source={heroBg ? { uri: heroBg } : require('@/assets/images/hero_banner_super_sale_1770529956779.png')}
            style={styles.heroBanner}
            resizeMode="cover"
            imageStyle={styles.heroBannerImg}>
            <View style={styles.heroOverlay} />
            <View style={styles.heroContent}>
              <Text style={styles.heroSmall}>Modern Electronics & Gadgets</Text>
              <Text style={styles.heroTitle}>{heroTitle}</Text>
              <Text style={styles.heroSub}>{heroSub}</Text>
            </View>
            <View style={styles.heroRight}>
              <TouchableOpacity style={styles.shopNowBtn} activeOpacity={0.9}>
                <Text style={styles.shopNowText}>SHOP NOW</Text>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </View>

        {/* ── Search bar ── */}
        <View style={styles.searchWrap}>
          <Search size={16} color="#9CA3AF" strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor="#9CA3AF"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* ── Categories ── */}
        {categories.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catsScroll}>
            <TouchableOpacity
              style={[styles.catPill, selectedCat === null && styles.catPillActive]}
              onPress={() => setSelectedCat(null)}
              activeOpacity={0.8}>
              <View style={[styles.catIconCircle, selectedCat === null && styles.catIconCircleActive]}>
                <Text style={styles.catIconText}>🛍</Text>
              </View>
              <Text style={[styles.catLabel, selectedCat === null && styles.catLabelActive]}>All</Text>
            </TouchableOpacity>

            {categories.slice(0, 10).map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catPill, selectedCat === cat.id && styles.catPillActive]}
                onPress={() => setSelectedCat(cat.id === selectedCat ? null : cat.id)}
                activeOpacity={0.8}>
                <View style={[styles.catIconCircle, selectedCat === cat.id && styles.catIconCircleActive]}>
                  <Image source={{ uri: imgUrl(cat.image) }} style={styles.catIcon} />
                </View>
                <Text style={[styles.catLabel, selectedCat === cat.id && styles.catLabelActive]} numberOfLines={1}>
                  {cat.name.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* ── Filter row ── */}
        <View style={styles.filterRow}>
          <TouchableOpacity style={styles.filterBtn} activeOpacity={0.85}>
            <SlidersHorizontal size={14} color="#374151" strokeWidth={2} />
            <Text style={styles.filterBtnText}>Filter</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sortBtn}
            onPress={() => setShowSortMenu((v) => !v)}
            activeOpacity={0.85}>
            <Text style={styles.sortBtnText}>{SORT_LABELS[sort]}</Text>
            <ChevronDown size={14} color="#374151" strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.hugeDealChip, sort === 'discount' && styles.hugeDealChipActive]}
            onPress={() => setSort(sort === 'discount' ? 'default' : 'discount')}
            activeOpacity={0.85}>
            <Zap size={12} color={sort === 'discount' ? '#FFFFFF' : '#DC2626'} strokeWidth={2.5} fill={sort === 'discount' ? '#FFFFFF' : 'transparent'} />
            <Text style={[styles.hugeDealChipText, sort === 'discount' && styles.hugeDealChipTextActive]}>
              Huge Deals
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sort dropdown */}
        {showSortMenu && (
          <View style={styles.sortMenu}>
            {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
              <TouchableOpacity
                key={key}
                style={[styles.sortMenuItem, sort === key && styles.sortMenuItemActive]}
                onPress={() => { setSort(key); setShowSortMenu(false); }}
                activeOpacity={0.8}>
                <Text style={[styles.sortMenuItemText, sort === key && styles.sortMenuItemTextActive]}>
                  {SORT_LABELS[key]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── Hot Deals banner ── */}
        {hotDeals.length > 0 && (
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionLeft}>
              <Zap size={14} color="#DC2626" strokeWidth={2.5} fill="#DC2626" />
              <Text style={styles.sectionTitle}>HOT DEALS</Text>
            </View>
            <TouchableOpacity style={styles.seeAllBtn} activeOpacity={0.85}>
              <Text style={styles.seeAllText}>SEE ALL</Text>
              <ChevronRight size={13} color="#DC2626" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        )}

        {/* ── Product Grid ── */}
        <View style={styles.grid}>
          {filteredProducts.map((p) => {
            const newPrice = parseFloat(String(p.newPrice));
            const oldPrice = parseFloat(String(p.oldPrice));
            const discountPct = oldPrice > newPrice ? Math.round(((oldPrice - newPrice) / oldPrice) * 100) : 0;
            const isSaved = savedIds.has(p.id);
            return (
              <TouchableOpacity
                key={p.id}
                style={styles.productCard}
                activeOpacity={0.9}
                onPress={() => router.push(`/product/${p.id}`)}>
                {/* Image */}
                <View style={styles.productImgWrap}>
                  <Image
                    source={{ uri: imgUrl(p.image) }}
                    style={styles.productImg}
                    resizeMode="cover"
                  />
                  {/* Discount badge */}
                  {discountPct > 0 && (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountBadgeText}>-{discountPct}%</Text>
                    </View>
                  )}
                  {/* Heart */}
                  <TouchableOpacity
                    style={styles.heartBtn}
                    onPress={() => toggleSave(p.id)}
                    activeOpacity={0.8}>
                    <Heart
                      size={15}
                      color="#DC2626"
                      strokeWidth={2}
                      fill={isSaved ? '#DC2626' : 'transparent'}
                    />
                  </TouchableOpacity>
                </View>
                {/* Body */}
                <View style={styles.productBody}>
                  {p.brand ? <Text style={styles.brandName} numberOfLines={1}>{p.brand.toUpperCase()}</Text> : null}
                  <Text style={styles.productName} numberOfLines={2}>{p.title}</Text>
                  <View style={styles.productPriceRow}>
                    <Text style={styles.productPrice}>{fmtPrice(newPrice)}</Text>
                    {discountPct > 0 && (
                      <Text style={styles.productOriginalPrice}>{fmtPrice(oldPrice)}</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {filteredProducts.length === 0 && (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>No products found</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },

  scrollContent: { paddingBottom: 24 },

  /* Hero */
  heroBannerWrap: { paddingHorizontal: 14, paddingTop: 14 },
  heroBanner: {
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    padding: 16,
  },
  heroBannerImg: { borderRadius: 16 },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 16 },
  heroContent: { flex: 1 },
  heroSmall: { color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: '700', letterSpacing: 0.5, marginBottom: 4 },
  heroTitle: { color: '#FFFFFF', fontWeight: '900', fontSize: 22, lineHeight: 26, marginBottom: 4 },
  heroSub: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '600' },
  heroRight: { justifyContent: 'flex-end' },
  shopNowBtn: { backgroundColor: '#DC2626', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  shopNowText: { color: '#FFFFFF', fontWeight: '900', fontSize: 12, letterSpacing: 0.5 },

  /* Search */
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 14,
    marginTop: 12,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  searchInput: { flex: 1, fontSize: 14, color: '#111827', padding: 0 },

  /* Categories */
  catsScroll: { paddingHorizontal: 12, paddingTop: 14, paddingBottom: 4, gap: 6 },
  catPill: { alignItems: 'center', width: 70 },
  catPillActive: {},
  catIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  catIconCircleActive: { borderColor: '#DC2626' },
  catIcon: { width: '100%', height: '100%' },
  catIconText: { fontSize: 22 },
  catLabel: { marginTop: 5, fontSize: 10, fontWeight: '600', color: '#6B7280', textAlign: 'center' },
  catLabelActive: { color: '#DC2626', fontWeight: '800' },

  /* Filter row */
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  filterBtnText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  sortBtnText: { flex: 1, fontSize: 12, fontWeight: '600', color: '#374151' },
  hugeDealChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFF5F5',
  },
  hugeDealChipActive: { backgroundColor: '#DC2626', borderColor: '#DC2626' },
  hugeDealChipText: { fontSize: 12, fontWeight: '700', color: '#DC2626' },
  hugeDealChipTextActive: { color: '#FFFFFF' },

  /* Sort dropdown */
  sortMenu: {
    marginHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    overflow: 'hidden',
    marginBottom: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  sortMenuItem: { paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  sortMenuItemActive: { backgroundColor: '#FFF5F5' },
  sortMenuItemText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  sortMenuItemTextActive: { color: '#DC2626', fontWeight: '800' },

  /* Section header */
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingBottom: 10,
    paddingTop: 4,
  },
  sectionLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: { fontSize: 12, fontWeight: '900', color: '#111827', letterSpacing: 0.8 },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  seeAllText: { fontSize: 11, fontWeight: '800', color: '#DC2626', letterSpacing: 0.5 },

  /* Product grid */
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10, gap: 12 },
  productCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
  },
  productImgWrap: { position: 'relative', width: '100%', height: 170 },
  productImg: { width: '100%', height: '100%' },
  discountBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: '#DC2626',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900' },
  heartBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  productBody: { padding: 12 },
  brandName: { fontSize: 10, fontWeight: '700', color: '#9CA3AF', marginBottom: 4, letterSpacing: 0.5 },
  productName: { fontSize: 12, fontWeight: '700', color: '#111827', marginBottom: 8, lineHeight: 17 },
  productPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  productPrice: { fontSize: 16, fontWeight: '900', color: '#DC2626' },
  productOriginalPrice: { fontSize: 11, color: '#9CA3AF', textDecorationLine: 'line-through' },

  /* Empty */
  emptyWrap: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 15, color: '#9CA3AF', fontWeight: '600' },
});
