import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Search, Heart, Bell } from 'lucide-react-native';
import { useAppState } from '@/contexts/AppStateContext';

type FilterTab = 'All Items' | 'Active' | 'Brands' | 'Expired';
type DealBadge = 'ENDS IN 2H' | 'HOURLY DEAL' | 'FLASH SALE' | 'DEAL EXPIRED' | null;

interface WishlistItem {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice: number;
  badge: DealBadge;
  expired: boolean;
}

const ITEMS: WishlistItem[] = [
  {
    id: '1',
    name: 'Wireless Headphones',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    price: 4999,
    originalPrice: 9999,
    badge: 'ENDS IN 2H',
    expired: false,
  },
  {
    id: '2',
    name: 'Designer Watch',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    price: 12000,
    originalPrice: 18000,
    badge: 'HOURLY DEAL',
    expired: false,
  },
  {
    id: '3',
    name: 'Pro Gaming Mouse',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
    price: 2500,
    originalPrice: 2500,
    badge: 'DEAL EXPIRED',
    expired: true,
  },
  {
    id: '4',
    name: 'Smart TV 55"',
    image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=400',
    price: 39900,
    originalPrice: 69900,
    badge: 'FLASH SALE',
    expired: false,
  },
];

const TABS: FilterTab[] = ['All Items', 'Active', 'Brands', 'Expired'];

const BADGE_STYLE: Record<string, { bg: string; text: string }> = {
  'ENDS IN 2H':   { bg: '#DC2626', text: '#FFFFFF' },
  'HOURLY DEAL':  { bg: 'rgba(0,0,0,0.65)', text: '#FFFFFF' },
  'FLASH SALE':   { bg: '#DC2626', text: '#FFFFFF' },
  'DEAL EXPIRED': { bg: 'rgba(0,0,0,0.65)', text: '#FFFFFF' },
};

const fmt = (n: number) =>
  '₹' + (n / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function WishlistScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addToCart } = useAppState();
  const [activeTab, setActiveTab] = useState<FilterTab>('All Items');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set(ITEMS.map((i) => i.id)));

  const toggleSave = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filtered = ITEMS.filter((item) => {
    if (activeTab === 'All Items') return true;
    if (activeTab === 'Active') return !item.expired;
    if (activeTab === 'Expired') return item.expired;
    if (activeTab === 'Brands') return false;
    return true;
  });

  const moveToCart = (item: WishlistItem) => {
    addToCart({
      id: `wishlist-${item.id}`,
      name: item.name,
      image: item.image,
      price: item.price,
      originalPrice: item.originalPrice,
      quantity: 1,
      dealType: item.badge === 'HOURLY DEAL' ? 'hourly' : 'daily',
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <ChevronLeft size={22} color="#111827" strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Saved Deals</Text>
        <TouchableOpacity style={styles.headerBtn} activeOpacity={0.8}>
          <Search size={20} color="#111827" strokeWidth={2.2} />
        </TouchableOpacity>
      </View>

      {/* ── Filter tabs ── */}
      <View style={styles.tabsRow}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={styles.tabBtn}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.8}>
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
            {activeTab === tab && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}>

        {/* ── Grid ── */}
        <View style={styles.grid}>
          {filtered.map((item) => (
            <View key={item.id} style={[styles.card, item.expired && styles.cardExpired]}>
              {/* Image */}
              <View style={styles.imgWrap}>
                <Image
                  source={{ uri: item.image }}
                  style={[styles.img, item.expired && styles.imgExpired]}
                  resizeMode="cover"
                />
                {/* Badge */}
                {item.badge && (
                  <View style={[styles.badge, { backgroundColor: BADGE_STYLE[item.badge].bg }]}>
                    <Text style={[styles.badgeText, { color: BADGE_STYLE[item.badge].text }]}>
                      {item.badge}
                    </Text>
                  </View>
                )}
                {/* Heart */}
                <TouchableOpacity
                  style={styles.heartBtn}
                  onPress={() => toggleSave(item.id)}
                  activeOpacity={0.8}>
                  <Heart
                    size={16}
                    color="#DC2626"
                    strokeWidth={2}
                    fill={savedIds.has(item.id) ? '#DC2626' : 'transparent'}
                  />
                </TouchableOpacity>
              </View>

              {/* Body */}
              <View style={styles.cardBody}>
                <Text style={[styles.itemName, item.expired && styles.itemNameExpired]} numberOfLines={2}>
                  {item.name}
                </Text>
                <View style={styles.priceRow}>
                  <Text style={[styles.price, item.expired && styles.priceExpired]}>
                    {fmt(item.price)}
                  </Text>
                  {item.originalPrice > item.price && (
                    <Text style={styles.originalPrice}>{fmt(item.originalPrice)}</Text>
                  )}
                </View>

                {item.expired ? (
                  <View style={styles.expiredBtn}>
                    <Text style={styles.expiredBtnText}>EXPIRED</Text>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.cartBtn} activeOpacity={0.9} onPress={() => moveToCart(item)}>
                    <Text style={styles.cartBtnText}>MOVE TO CART</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* ── Price Drop Alert ── */}
        <View style={styles.alertCard}>
          <View style={styles.alertIconWrap}>
            <Bell size={20} color="#DC2626" strokeWidth={2} fill="rgba(220,38,38,0.15)" />
          </View>
          <View style={styles.alertText}>
            <Text style={styles.alertTitle}>Price Drop Alert</Text>
            <Text style={styles.alertBody}>
              Smartphone Z is now{' '}
              <Text style={styles.alertPrice}>₹69,900.00</Text>
              {' '}(Save 15%). Deal ends at midnight!
            </Text>
          </View>
        </View>

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

  /* Filter tabs */
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tabBtn: { paddingVertical: 14, marginRight: 24, alignItems: 'center', position: 'relative' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#9CA3AF' },
  tabTextActive: { color: '#DC2626', fontWeight: '800' },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2.5,
    backgroundColor: '#DC2626',
    borderRadius: 2,
  },

  /* Scroll */
  scroll: { flex: 1 },
  scrollContent: { padding: 12, gap: 12 },

  /* Grid */
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },

  /* Card */
  card: {
    width: '47.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
  },
  cardExpired: { opacity: 0.75 },
  imgWrap: { position: 'relative', width: '100%', height: 155 },
  img: { width: '100%', height: '100%', resizeMode: 'cover' },
  imgExpired: { opacity: 0.5 },

  /* Badge */
  badge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },

  /* Heart */
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

  /* Card body */
  cardBody: { padding: 12 },
  itemName: { fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 6, lineHeight: 18 },
  itemNameExpired: { color: '#9CA3AF' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  price: { fontSize: 16, fontWeight: '900', color: '#DC2626' },
  priceExpired: { color: '#9CA3AF' },
  originalPrice: { fontSize: 11, color: '#9CA3AF', textDecorationLine: 'line-through', fontWeight: '500' },

  /* Buttons */
  cartBtn: {
    backgroundColor: '#DC2626',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  cartBtnText: { color: '#FFFFFF', fontWeight: '900', fontSize: 11, letterSpacing: 0.5 },
  expiredBtn: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  expiredBtnText: { color: '#9CA3AF', fontWeight: '800', fontSize: 11, letterSpacing: 0.5 },

  /* Price Drop Alert */
  alertCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#FFF5F5',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginTop: 4,
  },
  alertIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertText: { flex: 1 },
  alertTitle: { fontSize: 14, fontWeight: '800', color: '#111827', marginBottom: 4 },
  alertBody: { fontSize: 13, color: '#6B7280', lineHeight: 19 },
  alertPrice: { color: '#DC2626', fontWeight: '800' },
});
