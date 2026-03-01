import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, Truck, MapPin, ShoppingCart, Check } from 'lucide-react-native';

const ORDER_ITEMS = [
  {
    id: '1',
    name: 'Nike Air Zoom Pegasus...',
    detail: 'Size: 10 • Qty: 1',
    price: 8900,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200',
  },
  {
    id: '2',
    name: 'Ray-Ban Wayfarer...',
    detail: 'Color: Polarized • Qty: 1',
    price: 12000,
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=200',
  },
];

const ORDER_ID = 'DR-882941';
const subtotal = ORDER_ITEMS.reduce((s, i) => s + i.price, 0);
const discount = 4180;
const total = subtotal - discount;

const fmt = (n: number) =>
  '₹' + (n / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function OrderSuccessScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.push('/(tabs)')} activeOpacity={0.8}>
          <X size={20} color="#111827" strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Status</Text>
        <View style={styles.closeBtn} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* ── Success hero ── */}
        <View style={styles.heroWrap}>
          <View style={styles.iconCircle}>
            {/* Gift box SVG-style using text/emoji alternative */}
            <Text style={styles.giftIcon}>🎁</Text>
            {/* Green check badge */}
            <View style={styles.checkBadge}>
              <Check size={10} color="#FFFFFF" strokeWidth={3} />
            </View>
          </View>

          <Text style={styles.successTitle}>Success! Your Deal is Secured</Text>
          <Text style={styles.successSub}>
            Your order #{ORDER_ID} has been placed{'\n'}successfully and is being processed.
          </Text>
        </View>

        {/* ── Estimated Delivery ── */}
        <View style={styles.deliveryCard}>
          <View style={styles.deliveryIconWrap}>
            <Truck size={20} color="#DC2626" strokeWidth={2} />
          </View>
          <View>
            <Text style={styles.deliveryLabel}>ESTIMATED DELIVERY</Text>
            <Text style={styles.deliveryTime}>Tomorrow, by 8:00 PM</Text>
          </View>
        </View>

        {/* ── Items ── */}
        <View style={styles.itemsCard}>
          <Text style={styles.itemsHeader}>Items ({ORDER_ITEMS.length})</Text>

          {ORDER_ITEMS.map((item, idx) => (
            <View key={item.id}>
              <View style={styles.itemRow}>
                <View style={styles.itemImgWrap}>
                  <Image source={{ uri: item.image }} style={styles.itemImg} resizeMode="cover" />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.itemDetail}>{item.detail}</Text>
                </View>
                <Text style={styles.itemPrice}>{fmt(item.price)}</Text>
              </View>
              {idx < ORDER_ITEMS.length - 1 && <View style={styles.itemDivider} />}
            </View>
          ))}

          {/* Price breakdown */}
          <View style={styles.priceDivider} />
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Subtotal</Text>
            <Text style={styles.priceValue}>{fmt(subtotal)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.discountLabel}>Flash Deal Discount</Text>
            <Text style={styles.discountValue}>−{fmt(discount)}</Text>
          </View>
          <View style={[styles.priceRow, { marginTop: 4 }]}>
            <Text style={styles.totalLabel}>Total Charged</Text>
            <Text style={styles.totalValue}>{fmt(total)}</Text>
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* ── Action buttons ── */}
      <View style={[styles.actionsWrap, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity style={styles.trackBtn} activeOpacity={0.9}>
          <MapPin size={18} color="#FFFFFF" strokeWidth={2.2} fill="rgba(255,255,255,0.25)" />
          <Text style={styles.trackBtnText}>Track Order</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.shopBtn}
          activeOpacity={0.9}
          onPress={() => router.push('/(tabs)')}>
          <ShoppingCart size={18} color="#FFFFFF" strokeWidth={2.2} />
          <Text style={styles.shopBtnText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  closeBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },

  /* Scroll */
  scroll: { flex: 1, backgroundColor: '#FFF5F5' },
  scrollContent: { paddingHorizontal: 16, paddingTop: 32, paddingBottom: 24 },

  /* Hero */
  heroWrap: { alignItems: 'center', marginBottom: 24 },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 6,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  giftIcon: { fontSize: 38 },
  checkBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 28,
  },
  successSub: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: 8,
  },

  /* Delivery card */
  deliveryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  deliveryIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deliveryLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#DC2626',
    letterSpacing: 1,
    marginBottom: 4,
  },
  deliveryTime: { fontSize: 15, fontWeight: '800', color: '#111827' },

  /* Items card */
  itemsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  itemsHeader: { fontSize: 15, fontWeight: '800', color: '#111827', marginBottom: 16 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  itemImgWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
  },
  itemImg: { width: '100%', height: '100%' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 4 },
  itemDetail: { fontSize: 12, color: '#9CA3AF', fontWeight: '500' },
  itemPrice: { fontSize: 15, fontWeight: '800', color: '#111827' },
  itemDivider: { height: 1, backgroundColor: '#F9FAFB', marginHorizontal: -4 },

  /* Price breakdown */
  priceDivider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 14 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  priceLabel: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  priceValue: { fontSize: 14, fontWeight: '700', color: '#111827' },
  discountLabel: { fontSize: 14, color: '#DC2626', fontWeight: '500' },
  discountValue: { fontSize: 14, fontWeight: '700', color: '#DC2626' },
  totalLabel: { fontSize: 15, fontWeight: '800', color: '#111827' },
  totalValue: { fontSize: 15, fontWeight: '900', color: '#111827' },

  /* Action buttons */
  actionsWrap: {
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  trackBtn: {
    backgroundColor: '#111827',
    borderRadius: 50,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  trackBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
  shopBtn: {
    backgroundColor: '#DC2626',
    borderRadius: 50,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  shopBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
});
