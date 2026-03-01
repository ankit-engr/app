import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Search, Star, RefreshCcw, Headphones, HelpCircle, MapPin } from 'lucide-react-native';

type Tab = 'All' | 'Ongoing' | 'Completed';

const ORDERS = [
  {
    id: 'DR-9942',
    status: 'ongoing',
    deliveryLabel: 'ESTIMATED DELIVERY: TOMORROW',
    transitLabel: 'IN TRANSIT',
    step: 1, // 0=placed, 1=shipped, 2=out for delivery
    items: [
      { id: '1', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200' },
      { id: '2', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200' },
      { id: '3', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200' },
    ],
    extra: 1,
  },
  {
    id: 'DR-8821',
    status: 'completed',
    deliveredOn: 'Delivered Oct 24, 2023',
    itemImage: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=200',
    itemName: 'Ray-Ban Wayfarer Classic + 2 o...',
    itemPrice: '₹17,850',
  },
  {
    id: 'DR-7714',
    status: 'completed',
    deliveredOn: 'Delivered Oct 12, 2023',
    itemImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200',
    itemName: 'Nike ZoomX Vaporfly Next% 2',
    itemPrice: '₹20,999',
  },
];

const STEPS = ['PLACED', 'SHIPPED', 'OUT FOR DELIVERY'];

export default function OrderHistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<Tab>('Ongoing');

  const filtered = ORDERS.filter((o) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Ongoing') return o.status === 'ongoing';
    return o.status === 'completed';
  });

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
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}>

        {filtered.map((order) => {
          if (order.status === 'ongoing') {
            return (
              <View key={order.id} style={styles.card}>
                {/* Top row */}
                <View style={styles.ongoingTopRow}>
                  <Text style={styles.deliveryLabel}>{order.deliveryLabel}</Text>
                  <View style={styles.transitBadge}>
                    <Text style={styles.transitText}>{order.transitLabel}</Text>
                  </View>
                </View>

                <Text style={styles.orderNum}>Order #{order.id}</Text>

                {/* Thumbnails */}
                <View style={styles.thumbRow}>
                  {order.items?.map((item) => (
                    <View key={item.id} style={styles.thumb}>
                      <Image source={{ uri: item.image }} style={styles.thumbImg} resizeMode="cover" />
                    </View>
                  ))}
                  {(order.extra ?? 0) > 0 && (
                    <View style={[styles.thumb, styles.thumbExtra]}>
                      <Text style={styles.thumbExtraText}>+{order.extra}</Text>
                    </View>
                  )}
                </View>

                {/* Progress */}
                <View style={styles.progressWrap}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${((order.step ?? 0) / (STEPS.length - 1)) * 100}%` }]} />
                  </View>
                  <View style={styles.progressLabels}>
                    {STEPS.map((s, i) => (
                      <Text key={s} style={[styles.progressLabel, i <= (order.step ?? 0) && styles.progressLabelActive]}>
                        {s}
                      </Text>
                    ))}
                  </View>
                </View>

                {/* Buttons */}
                <View style={styles.btnRow}>
                  <TouchableOpacity style={styles.outlineBtn} activeOpacity={0.85}>
                    <HelpCircle size={15} color="#374151" strokeWidth={2} />
                    <Text style={styles.outlineBtnText}>Need Help?</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.outlineBtn} activeOpacity={0.85}>
                    <MapPin size={15} color="#374151" strokeWidth={2} />
                    <Text style={styles.outlineBtnText}>Track Order</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }

          return (
            <View key={order.id} style={styles.card}>
              {/* Date + badge */}
              <View style={styles.completedTopRow}>
                <Text style={styles.deliveredOn}>{order.deliveredOn}</Text>
                <View style={styles.completedBadge}>
                  <Text style={styles.completedBadgeText}>COMPLETED</Text>
                </View>
              </View>

              <Text style={styles.orderNum}>Order #{order.id}</Text>

              {/* Item row */}
              <View style={styles.completedItemRow}>
                <View style={styles.completedImgWrap}>
                  <Image source={{ uri: order.itemImage }} style={styles.completedImg} resizeMode="cover" />
                </View>
                <View style={styles.completedItemInfo}>
                  <Text style={styles.completedItemName} numberOfLines={2}>{order.itemName}</Text>
                  <Text style={styles.completedItemPrice}>{order.itemPrice}</Text>
                </View>
              </View>

              {/* Buttons */}
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
  headerIcon: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },

  /* Tabs */
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

  /* Card */
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

  /* Ongoing */
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

  /* Completed */
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

  /* Buttons */
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

  /* Empty */
  emptyWrap: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 15, color: '#9CA3AF', fontWeight: '600' },
});
