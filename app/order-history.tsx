import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Search, Star, RefreshCcw, HelpCircle, MapPin } from 'lucide-react-native';
import { useAppState } from '@/contexts/AppStateContext';
import { getOrders, ApiOrder, getImageUrl, toNum } from '@/lib/api';

type Tab = 'All' | 'Ongoing' | 'Completed';

const STEPS = ['PLACED', 'SHIPPED', 'OUT FOR DELIVERY'];

export default function OrderHistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session, isLoggedIn } = useAppState();

  const [activeTab, setActiveTab] = useState<Tab>('All');
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoggedIn && session?.token) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn, session?.token]);

  const fetchOrders = async () => {
    if (!session?.token) return;
    try {
      const data = await getOrders(session.token);
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders();
  }, [session?.token]);

  const getFilteredOrders = () => {
    if (activeTab === 'All') return orders;
    if (activeTab === 'Ongoing') {
      return orders.filter(o => ['pending', 'confirmed', 'processing', 'shipped'].includes(o.orderStatus.toLowerCase()));
    }
    return orders.filter(o => ['delivered', 'completed', 'cancelled', 'refunded'].includes(o.orderStatus.toLowerCase()));
  };

  const filtered = getFilteredOrders();

  const fmt = (n: number) =>
    '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const getOrderStatusStep = (status: string) => {
    status = status.toLowerCase();
    if (status === 'pending' || status === 'confirmed') return 0;
    if (status === 'shipped') return 1;
    if (status === 'out_for_delivery') return 2;
    return 3;
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#DC2626" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon} onPress={() => router.back()} activeOpacity={0.8}>
          <ArrowLeft size={22} color="#111827" strokeWidth={2.2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order History</Text>
        <TouchableOpacity style={styles.headerIcon} activeOpacity={0.8}>
          <Search size={20} color="#111827" strokeWidth={2.2} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {(['All', 'Ongoing', 'Completed'] as Tab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={styles.tab}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.8}>
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
            {activeTab === tab && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#DC2626" />}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}>

        {filtered.map((order) => {
          const isOngoing = !['delivered', 'cancelled', 'completed'].includes(order.orderStatus.toLowerCase());
          const step = getOrderStatusStep(order.orderStatus);

          if (isOngoing) {
            return (
              <View key={order.id} style={styles.card}>
                <View style={styles.ongoingTopRow}>
                  <Text style={styles.deliveryLabel}>STATUS: {order.orderStatus.toUpperCase()}</Text>
                  <View style={styles.transitBadge}>
                    <Text style={styles.transitText}>{step >= 1 ? 'IN TRANSIT' : 'PROCESSING'}</Text>
                  </View>
                </View>

                <Text style={styles.orderNum}>Order #{order.orderNumber}</Text>

                <View style={styles.thumbRow}>
                  {order.order_items.slice(0, 3).map((item) => (
                    <View key={item.id} style={styles.thumb}>
                      <Image
                        source={{ uri: getImageUrl(item.products.product_images?.[0]?.imageUrl) }}
                        style={styles.thumbImg}
                        resizeMode="cover"
                      />
                    </View>
                  ))}
                  {order.order_items.length > 3 && (
                    <View style={[styles.thumb, styles.thumbExtra]}>
                      <Text style={styles.thumbExtraText}>+{order.order_items.length - 3}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.progressWrap}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${(Math.min(step, 2) / 2) * 100}%` }]} />
                  </View>
                  <View style={styles.progressLabels}>
                    {STEPS.map((s, i) => (
                      <Text key={s} style={[styles.progressLabel, i <= step && styles.progressLabelActive]}>
                        {s}
                      </Text>
                    ))}
                  </View>
                </View>

                <View style={styles.btnRow}>
                  <TouchableOpacity style={styles.outlineBtn} activeOpacity={0.85}>
                    <HelpCircle size={15} color="#374151" strokeWidth={2} />
                    <Text style={styles.outlineBtnText}>Need Help?</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.outlineBtn}
                    activeOpacity={0.85}
                    onPress={() => router.push({ pathname: '/order-success' as any, params: { orderId: order.id } })}>
                    <MapPin size={15} color="#374151" strokeWidth={2} />
                    <Text style={styles.outlineBtnText}>Track Order</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }

          const firstItem = order.order_items[0];

          return (
            <View key={order.id} style={styles.card}>
              <View style={styles.completedTopRow}>
                <Text style={styles.deliveredOn}>{new Date(order.createdAt).toLocaleDateString()}</Text>
                <View style={[styles.completedBadge, order.orderStatus.toLowerCase() === 'cancelled' && { backgroundColor: '#FEE2E2' }]}>
                  <Text style={[styles.completedBadgeText, order.orderStatus.toLowerCase() === 'cancelled' && { color: '#DC2626' }]}>
                    {order.orderStatus.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={styles.orderNum}>Order #{order.orderNumber}</Text>

              {firstItem && (
                <View style={styles.completedItemRow}>
                  <View style={styles.completedImgWrap}>
                    <Image
                      source={{ uri: getImageUrl(firstItem.products.product_images?.[0]?.imageUrl) }}
                      style={styles.completedImg}
                      resizeMode="cover"
                    />
                  </View>
                  <View style={styles.completedItemInfo}>
                    <Text style={styles.completedItemName} numberOfLines={2}>{firstItem.products.name}</Text>
                    <Text style={styles.completedItemPrice}>{fmt(toNum(order.totalAmount))}</Text>
                  </View>
                </View>
              )}

              <View style={styles.btnRow}>
                <TouchableOpacity style={styles.outlineBtn} activeOpacity={0.85}>
                  <Star size={14} color="#374151" strokeWidth={2} fill="#374151" />
                  <Text style={styles.outlineBtnText}>Rate Products</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.redBtn} activeOpacity={0.85}>
                  <RefreshCcw size={14} color="#FFFFFF" strokeWidth={2.2} />
                  <Text style={styles.redBtnText}>Re-order</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {filtered.length === 0 && (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>No orders found</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
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
  headerIcon: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  tabText: { fontSize: 14, fontWeight: '600', color: '#9CA3AF' },
  tabTextActive: { color: '#DC2626', fontWeight: '800' },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    height: 2,
    backgroundColor: '#DC2626',
    borderRadius: 2,
  },
  scrollContent: { padding: 14, gap: 14 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  ongoingTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  deliveryLabel: { fontSize: 11, fontWeight: '800', color: '#DC2626', letterSpacing: 0.3 },
  transitBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  transitText: { fontSize: 11, fontWeight: '700', color: '#374151' },
  orderNum: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 14 },
  thumbRow: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  thumbImg: { width: '100%', height: '100%' },
  thumbExtra: { justifyContent: 'center', alignItems: 'center' },
  thumbExtraText: { fontSize: 16, fontWeight: '800', color: '#374151' },
  progressWrap: { marginBottom: 18 },
  progressBar: {
    height: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#DC2626', borderRadius: 4 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontSize: 10, fontWeight: '600', color: '#9CA3AF' },
  progressLabelActive: { color: '#DC2626', fontWeight: '800' },
  completedTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  deliveredOn: { fontSize: 12, color: '#9CA3AF', fontWeight: '500' },
  completedBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  completedBadgeText: { fontSize: 11, fontWeight: '800', color: '#16A34A' },
  completedItemRow: { flexDirection: 'row', gap: 12, alignItems: 'center', marginVertical: 14 },
  completedImgWrap: { width: 72, height: 72, borderRadius: 10, overflow: 'hidden', backgroundColor: '#F3F4F6' },
  completedImg: { width: '100%', height: '100%' },
  completedItemInfo: { flex: 1 },
  completedItemName: { fontSize: 13, fontWeight: '600', color: '#111827', marginBottom: 6, lineHeight: 18 },
  completedItemPrice: { fontSize: 16, fontWeight: '800', color: '#111827' },
  btnRow: { flexDirection: 'row', gap: 10 },
  outlineBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  outlineBtnText: { fontSize: 13, fontWeight: '700', color: '#374151' },
  redBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: '#DC2626',
  },
  redBtnText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  emptyWrap: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 15, color: '#9CA3AF', fontWeight: '600' },
});
