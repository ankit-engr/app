import { Tabs } from 'expo-router';
import CustomTabBar from '@/components/CustomTabBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}>

      {/* ── Visible tabs (shown in custom bar) ── */}
      <Tabs.Screen name="index"   options={{ title: 'Home' }} />
      <Tabs.Screen name="shop"    options={{ title: 'Shop' }} />
      <Tabs.Screen name="reels"   options={{ title: 'Reels' }} />
      <Tabs.Screen name="live"    options={{ title: 'Live' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />

      {/* ── Hidden tabs (still navigable, not in bar) ── */}
      <Tabs.Screen name="deals"   options={{ href: null }} />
      <Tabs.Screen name="cart"    options={{ href: null }} />
      <Tabs.Screen name="vendors" options={{ href: null }} />
    </Tabs>
  );
}
