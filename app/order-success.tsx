import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X, Truck, MapPin, ShoppingCart, Check } from 'lucide-react-native';
import { useAppState } from '@/contexts/AppStateContext';
import { getOrderByIdApi, ApiOrder, getImageUrl } from '@/lib/api';
import { useEffect, useState } from 'react';

export default function OrderSuccessScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session, isLoggedIn } = useAppState();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();

  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoggedIn && session?.token && orderId) {
      fetchOrder();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn, session?.token, orderId]);

  const fetchOrder = async () => {
    if (!session?.token || !orderId) return;
    try {
      const data = await getOrderByIdApi(session.token, orderId);
      setOrder(data);
    } catch (error) {
      console.error('Failed to fetch order details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n: number) =>
    '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#DC2626" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Text style={{ fontSize: 18, fontWeight: '800', marginBottom: 10 }}>Order not found</Text>
        <TouchableOpacity style={styles.shopBtn} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.shopBtnText}>Go to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.replace('/(tabs)')} activeOpacity={0.8}>
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
            <Text style={styles.giftIcon}>🎁</Text>
            <View style={styles.checkBadge}>
              <Check size={10} color="#FFFFFF" strokeWidth={3} />
            </View>
          </View>

          <Text style={styles.successTitle}>Success! Your Deal is Secured</Text>
          <Text style={styles.successSub}>
            Your order #{order.orderNumber} has been placed{'\n'}successfully and is being processed.
          </Text>
        </View>

        {/* ── Estimated Delivery ── */}
        <View style={styles.deliveryCard}>
          <View style={styles.deliveryIconWrap}>
            <Truck size={20} color="#DC2626" strokeWidth={2} />
          </View>
          <View>
            <Text style={styles.deliveryLabel}>ESTIMATED DELIVERY</Text>
            <Text style={styles.deliveryTime}>Within 3-5 Business Days</Text>
          </View>
        </View>

        {/* ── Items ── */}
        <View style={styles.itemsCard}>
          <Text style={styles.itemsHeader}>Items ({order.order_items.length})</Text>

          {order.order_items.map((item, idx) => (
            <View key={item.id}>
              <View style={styles.itemRow}>
                <View style={styles.itemImgWrap}>
                  <Image source={{ uri: getImageUrl(item.products.product_images?.[0]?.imageUrl) }} style={styles.itemImg} resizeMode="cover" />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={1}>{item.products.name}</Text>
                  <Text style={styles.itemDetail}>Qty: {item.quantity}</Text>
                </View>
                <Text style={styles.itemPrice}>{fmt(item.totalPrice)}</Text>
              </View>
              {idx < order.order_items.length - 1 && <View style={styles.itemDivider} />}
            </View>
          ))}

          {/* Price breakdown */}
          <View style={styles.priceDivider} />
          <View style={[styles.priceRow, { marginTop: 4 }]}>
            <Text style={styles.totalLabel}>Total Charged</Text>
            <Text style={styles.totalValue}>{fmt(order.totalAmount)}</Text>
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* ── Action buttons ── */}
      <View style={[styles.actionsWrap, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={styles.trackBtn}
          activeOpacity={0.9}
          onPress={() => router.push({ pathname: '/order-history' as any })}>
          <MapPin size={18} color="#FFFFFF" strokeWidth={2.2} fill="rgba(255,255,255,0.25)" />
          <Text style={styles.trackBtnText}>My Orders</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.shopBtn}
          activeOpacity={0.9}
          onPress={() => router.replace('/(tabs)')}>
          <ShoppingCart size={18} color="#FFFFFF" strokeWidth={2.2} />
          <Text style={styles.shopBtnText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
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
  scroll: { flex: 1, backgroundColor: '#FFF5F5' },
  scrollContent: { paddingHorizontal: 16, paddingTop: 32, paddingBottom: 24 },
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
  priceDivider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 14 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  totalLabel: { fontSize: 15, fontWeight: '800', color: '#111827' },
  totalValue: { fontSize: 15, fontWeight: '900', color: '#111827' },
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
    paddingHorizontal: 20
  },
  shopBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
});
