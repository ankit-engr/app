import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Home, Video, Tv, User, ShoppingBag } from 'lucide-react-native';

const TABS = [
  { name: 'index',   label: 'Home',    Icon: Home        },
  { name: 'shop',    label: 'Shop',    Icon: ShoppingBag },
  { name: 'reels',   label: 'Reels',   Icon: Video       },
  { name: 'live',    label: 'Live',    Icon: Tv          },
  { name: 'profile', label: 'Profile', Icon: User        },
];

const VISIBLE_ROUTES = new Set(['index', 'shop', 'reels', 'live', 'profile']);

export default function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  const activeRouteName = state.routes[state.index].name;
  if (!VISIBLE_ROUTES.has(activeRouteName)) return null;

  const iconSize       = Platform.OS === 'android' ? 24 : 20;
  const iconSizeActive = Platform.OS === 'android' ? 22 : 20;

  // Pill floats just above the home indicator on iOS; fixed gap on Android.
  const pillBottom = Platform.OS === 'ios' ? Math.max(insets.bottom - 12, 4) : 16;

  return (
    <View style={styles.outerWrap}>
      <View style={[styles.pill, { bottom: pillBottom }]}>
        {TABS.map(({ name, label, Icon }) => {
          const route = state.routes.find((r) => r.name === name);
          if (!route) return null;

          const isFocused = state.routes[state.index].name === name;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(name);
            }
          };

          return (
            <TouchableOpacity
              key={name}
              onPress={onPress}
              activeOpacity={0.8}
              style={styles.tabBtn}>
              {isFocused ? (
                <View style={styles.activePill}>
                  <Icon size={iconSizeActive} color="#FFFFFF" strokeWidth={2.3} />
                  <Text style={styles.activeLabel}>{label}</Text>
                </View>
              ) : (
                <Icon size={iconSize} color="#9CA3AF" strokeWidth={1.9} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

}

const styles = StyleSheet.create({
  outerWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  pill: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
    paddingVertical: Platform.OS === 'android' ? 12 : 9,
    paddingHorizontal: Platform.OS === 'android' ? 14 : 12,
    gap: Platform.OS === 'android' ? 6 : 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: { elevation: 12 },
    }),
  },
  tabBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: Platform.OS === 'android' ? 56 : 52,
    paddingHorizontal: Platform.OS === 'android' ? 6 : 4,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    borderRadius: 50,
    paddingVertical: Platform.OS === 'android' ? 12 : 10,
    paddingHorizontal: Platform.OS === 'android' ? 18 : 16,
    gap: Platform.OS === 'android' ? 7 : 6,
  },
  activeLabel: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: Platform.OS === 'android' ? 14 : 13,
    letterSpacing: 0.2,
  },
});
