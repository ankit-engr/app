import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  Settings,
  ShoppingBag,
  Heart,
  RefreshCcw,
  MapPin,
  CreditCard,
  Store,
  Megaphone,
  LogOut,
  ChevronRight,
} from 'lucide-react-native';

const MENU_TOP = [
  { Icon: ShoppingBag,  label: 'My Orders',         route: '/order-history' },
  { Icon: Heart,        label: 'Wishlist',           route: '/wishlist' },
  { Icon: RefreshCcw,   label: 'Refunds & Returns',  route: null },
  { Icon: MapPin,       label: 'Saved Addresses',    route: null },
  { Icon: CreditCard,   label: 'Payment Methods',    route: null },
];

const MENU_BOTTOM = [
  { Icon: Settings, label: 'Account Settings', route: null, iconBg: '#F3F4F6', iconColor: '#6B7280' },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <ChevronLeft size={22} color="#111827" strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.headerBtn} activeOpacity={0.8}>
          <Settings size={20} color="#111827" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}>

        {/* ── Avatar ── */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrap}>
            <Image
              source={{ uri: 'https://i.pravatar.cc/150?img=11' }}
              style={styles.avatar}
            />
          </View>

          <Text style={styles.userName}>Alex Johnson</Text>
          <Text style={styles.memberSince}>Member since July 2023</Text>
        </View>

        {/* ── Divider ── */}
        <View style={styles.divider} />

        {/* ── Stats ── */}
        <View style={styles.statsRow}>
          {[
            { value: '124', label: 'ORDERS' },
            { value: '12',  label: 'WISHLIST' },
            { value: '3',   label: 'IN CART' },
          ].map((stat, idx, arr) => (
            <View key={stat.label} style={[styles.statItem, idx < arr.length - 1 && styles.statBorder]}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        {/* ── Main menu ── */}
        <View style={styles.menuCard}>
          {MENU_TOP.map((item, idx) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.menuRow, idx < MENU_TOP.length - 1 && styles.menuRowBorder]}
              activeOpacity={0.75}
              onPress={() => item.route && router.push(item.route as never)}>
              <View style={styles.menuIconWrap}>
                <item.Icon size={18} color="#DC2626" strokeWidth={2} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <ChevronRight size={18} color="#D1D5DB" strokeWidth={2} />
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Register as a Brand ── */}
        <TouchableOpacity style={styles.brandBanner} activeOpacity={0.9}>
          <View style={styles.brandBannerIcon}>
            <Store size={20} color="#FFFFFF" strokeWidth={2} />
          </View>
          <View style={styles.brandBannerText}>
            <Text style={styles.brandBannerTitle}>Register as a Brand</Text>
            <Text style={styles.brandBannerSub}>Start selling on DealRush today</Text>
          </View>
          <Megaphone size={22} color="rgba(255,255,255,0.85)" strokeWidth={1.8} />
        </TouchableOpacity>

        {/* ── Bottom menu ── */}
        <View style={styles.menuCard}>
          {MENU_BOTTOM.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.menuRow}
              activeOpacity={0.75}
              onPress={() => item.route && router.push(item.route as never)}>
              <View style={[styles.menuIconWrap, { backgroundColor: item.iconBg }]}>
                <item.Icon size={18} color={item.iconColor} strokeWidth={2} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <ChevronRight size={18} color="#D1D5DB" strokeWidth={2} />
            </TouchableOpacity>
          ))}

          {/* Logout */}
          <TouchableOpacity style={[styles.menuRow, styles.menuRowBorderTop]} activeOpacity={0.75}>
            <View style={[styles.menuIconWrap, { backgroundColor: '#FEE2E2' }]}>
              <LogOut size={18} color="#DC2626" strokeWidth={2} />
            </View>
            <Text style={[styles.menuLabel, { color: '#DC2626' }]}>Logout</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
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
  },
  headerBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },

  /* Scroll */
  scrollContent: { paddingHorizontal: 20 },

  /* Avatar */
  avatarSection: { alignItems: 'center', paddingTop: 12, paddingBottom: 24 },
  avatarWrap: { position: 'relative', marginBottom: 16 },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: '#F3F4F6',
  },
  userName: { fontSize: 22, fontWeight: '900', color: '#111827', marginBottom: 6 },
  memberSince: { fontSize: 13, color: '#9CA3AF', fontWeight: '500' },

  /* Divider */
  divider: { height: 1, backgroundColor: '#F3F4F6', marginHorizontal: -20 },

  /* Stats */
  statsRow: {
    flexDirection: 'row',
    paddingVertical: 20,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statBorder: { borderRightWidth: 1, borderRightColor: '#F3F4F6' },
  statValue: { fontSize: 22, fontWeight: '900', color: '#111827', marginBottom: 4 },
  statLabel: { fontSize: 11, fontWeight: '700', color: '#9CA3AF', letterSpacing: 0.6 },

  /* Menu cards */
  menuCard: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 14,
    backgroundColor: '#FFFFFF',
  },
  menuRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  menuRowBorderTop: { borderTopWidth: 1, borderTopColor: '#F9FAFB' },
  menuIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: '#111827' },

  /* Brand banner */
  brandBanner: {
    marginTop: 16,
    backgroundColor: '#DC2626',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  brandBannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandBannerText: { flex: 1 },
  brandBannerTitle: { color: '#FFFFFF', fontWeight: '900', fontSize: 15, marginBottom: 3 },
  brandBannerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '500' },
});
