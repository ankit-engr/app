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
import { ChevronLeft, ClipboardList, Zap, CalendarDays, X } from 'lucide-react-native';

type DealType = 'hourly' | 'daily' | null;

interface CartItem {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice: number;
  quantity: number;
  dealType: DealType;
}

const INITIAL_CART: CartItem[] = [
  {
    id: '1',
    name: 'Wireless Pro Headphones',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
    price: 4999,
    originalPrice: 12999,
    quantity: 1,
    dealType: 'hourly',
  },
  {
    id: '2',
    name: 'Smart Watch Series X',
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300',
    price: 15999,
    originalPrice: 24999,
    quantity: 1,
    dealType: 'daily',
  },
  {
    id: '3',
    name: 'Speed Runner Neo',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300',
    price: 6999,
    originalPrice: 6999,
    quantity: 1,
    dealType: null,
  },
];

export default function CartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [cartItems, setCartItems] = useState<CartItem[]>(INITIAL_CART);

  const updateQty = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = cartItems.reduce(
    (sum, item) => sum + (item.originalPrice - item.price) * item.quantity,
    0
  );
  const total = subtotal;

  const fmt = (n: number) =>
    '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <ChevronLeft size={22} color="#111827" strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart</Text>
        <TouchableOpacity style={styles.headerBtn} activeOpacity={0.8}>
          <ClipboardList size={22} color="#111827" strokeWidth={2.2} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* ── Items header ── */}
        <View style={styles.itemsHeaderRow}>
          <Text style={styles.itemsCount}>Items ({cartItems.length})</Text>
          <TouchableOpacity activeOpacity={0.8}>
            <Text style={styles.viewHistory}>View History</Text>
          </TouchableOpacity>
        </View>

        {/* ── Cart items ── */}
        {cartItems.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySubtitle}>Add items to get started</Text>
            <TouchableOpacity style={styles.shopBtn} onPress={() => router.push('/(tabs)')} activeOpacity={0.9}>
              <Text style={styles.shopBtnText}>SHOP NOW</Text>
            </TouchableOpacity>
          </View>
        ) : (
          cartItems.map((item) => (
            <View key={item.id} style={styles.cartCard}>
              {/* Remove button */}
              <TouchableOpacity style={styles.removeBtn} onPress={() => removeItem(item.id)} activeOpacity={0.8}>
                <X size={14} color="#9CA3AF" strokeWidth={2.5} />
              </TouchableOpacity>

              <View style={styles.cardInner}>
                {/* Image */}
                <View style={styles.imgWrap}>
                  <Image source={{ uri: item.image }} style={styles.productImg} />
                </View>

                {/* Details */}
                <View style={styles.cardDetails}>
                  <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>

                  {/* Deal badge */}
                  {item.dealType === 'hourly' && (
                    <View style={[styles.dealBadge, styles.dealBadgeHourly]}>
                      <Zap size={10} color="#FFFFFF" strokeWidth={2.5} fill="#FFFFFF" />
                      <Text style={styles.dealBadgeText}>HOURLY DEAL</Text>
                    </View>
                  )}
                  {item.dealType === 'daily' && (
                    <View style={[styles.dealBadge, styles.dealBadgeDaily]}>
                      <CalendarDays size={10} color="#FFFFFF" strokeWidth={2.2} />
                      <Text style={styles.dealBadgeText}>DAILY DEAL</Text>
                    </View>
                  )}

                  {/* Price row */}
                  <View style={styles.priceRow}>
                    <Text style={styles.currentPrice}>{fmt(item.price)}</Text>
                    {item.originalPrice > item.price && (
                      <Text style={styles.originalPrice}>{fmt(item.originalPrice)}</Text>
                    )}
                  </View>

                  {/* Quantity */}
                  <View style={styles.qtyRow}>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => updateQty(item.id, -1)}
                      activeOpacity={0.8}>
                      <Text style={styles.qtyBtnText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyValue}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => updateQty(item.id, 1)}
                      activeOpacity={0.8}>
                      <Text style={styles.qtyBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))
        )}

        {/* ── Order Summary ── */}
        {cartItems.length > 0 && (
          <View style={styles.summaryWrap}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{fmt(subtotal + discount)}</Text>
            </View>
            {discount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Deal Discounts</Text>
                <Text style={styles.summaryDiscount}>−{fmt(discount)}</Text>
              </View>
            )}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryFree}>FREE</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{fmt(total)}</Text>
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Checkout button ── */}
      {cartItems.length > 0 && (
        <View style={[styles.checkoutWrap, { paddingBottom: insets.bottom + 12 }]}>
          <TouchableOpacity style={styles.checkoutBtn} activeOpacity={0.9} onPress={() => router.push('/checkout')}>
            <Text style={styles.checkoutText}>Proceed to Checkout</Text>
            <Text style={styles.checkoutArrow}>→</Text>
          </TouchableOpacity>
        </View>
      )}
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
  headerBtn: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },

  /* Scroll */
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },

  /* Items header */
  itemsHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  itemsCount: { fontSize: 18, fontWeight: '800', color: '#111827' },
  viewHistory: { fontSize: 14, fontWeight: '700', color: '#DC2626' },

  /* Empty state */
  emptyWrap: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 6 },
  emptySubtitle: { fontSize: 14, color: '#6B7280', marginBottom: 24 },
  shopBtn: { backgroundColor: '#DC2626', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
  shopBtnText: { color: '#FFFFFF', fontWeight: '900', fontSize: 13, letterSpacing: 0.8 },

  /* Cart card */
  cartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 14,
    padding: 14,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    position: 'relative',
  },
  removeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  cardInner: { flexDirection: 'row', gap: 14 },
  imgWrap: {
    width: 88,
    height: 88,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
  },
  productImg: { width: '100%', height: '100%', resizeMode: 'cover' },

  /* Details */
  cardDetails: { flex: 1, paddingRight: 20 },
  productName: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 6, lineHeight: 20 },

  /* Deal badge */
  dealBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  dealBadgeHourly: { backgroundColor: '#DC2626' },
  dealBadgeDaily: { backgroundColor: '#DC2626' },
  dealBadgeText: { color: '#FFFFFF', fontWeight: '900', fontSize: 10, letterSpacing: 0.6 },

  /* Price */
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  currentPrice: { fontSize: 17, fontWeight: '900', color: '#DC2626' },
  originalPrice: { fontSize: 13, color: '#9CA3AF', textDecorationLine: 'line-through', fontWeight: '500' },

  /* Quantity */
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
  qtyBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  qtyBtnText: { fontSize: 18, fontWeight: '600', color: '#374151' },
  qtyValue: { minWidth: 30, textAlign: 'center', fontSize: 15, fontWeight: '700', color: '#111827' },

  /* Order Summary */
  summaryWrap: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginTop: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  summaryLabel: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  summaryValue: { fontSize: 14, fontWeight: '700', color: '#111827' },
  summaryDiscount: { fontSize: 14, fontWeight: '700', color: '#DC2626' },
  summaryFree: { fontSize: 14, fontWeight: '800', color: '#16A34A' },
  summaryDivider: { height: 1, backgroundColor: '#F3F4F6', marginBottom: 14 },
  totalLabel: { fontSize: 16, fontWeight: '800', color: '#111827' },
  totalValue: { fontSize: 22, fontWeight: '900', color: '#DC2626' },

  /* Checkout */
  checkoutWrap: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  checkoutBtn: {
    backgroundColor: '#DC2626',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  checkoutText: { color: '#FFFFFF', fontWeight: '900', fontSize: 16, letterSpacing: 0.3 },
  checkoutArrow: { color: '#FFFFFF', fontWeight: '900', fontSize: 18 },
});
