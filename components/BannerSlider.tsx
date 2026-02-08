import { useState, useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, FlatList, Dimensions, ViewToken } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

export interface Banner {
  id: string;
  image: any;
  title: string;
  subtitle: string;
  color?: string;
}

const DEFAULT_BANNERS: Banner[] = [
  {
    id: '1',
    image: require('@/assets/images/hero_banner_super_sale_1770529956779.png'),
    title: 'Super Sale',
    subtitle: 'High-end deals for you',
  },
  {
    id: '2',
    image: require('@/assets/images/hourly_deals_banner_1770529970822.png'),
    title: 'Hourly Deals',
    subtitle: 'Limited time offers',
  },
  {
    id: '3',
    image: require('@/assets/images/electronics_gaming_banner_1770529989726.png'),
    title: 'Gaming Zone',
    subtitle: 'Level up your gear',
  },
  {
    id: '4',
    image: require('@/assets/images/fashion_trends_banner_1770530008544.png'),
    title: 'Fashion Trends',
    subtitle: 'Stay stylish and chic',
  },
];

const { width } = Dimensions.get('window');
const BANNER_HEIGHT = 200;

interface BannerSliderProps {
  banners?: any[];
}

export default function BannerSlider({ banners }: BannerSliderProps) {
  // If banners are passed (API data), map them to match Banner interface if needed.
  // But here we assume API banners have 'image' as uri string.
  // We need to handle both string URI and require() number.

  const BANNERS = banners && banners.length > 0 ? banners : DEFAULT_BANNERS;
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollIntervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    scrollIntervalRef.current = setInterval(() => {
      const nextIndex = (activeIndex + 1) % BANNERS.length;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }, 5000);
    return () => {
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    };
  }, [activeIndex, BANNERS.length]);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setActiveIndex(viewableItems[0].index);
    }
  });

  const handlePrev = () => {
    const next = (activeIndex - 1 + BANNERS.length) % BANNERS.length;
    flatListRef.current?.scrollToIndex({ index: next, animated: true });
  };
  const handleNext = () => {
    const next = (activeIndex + 1) % BANNERS.length;
    flatListRef.current?.scrollToIndex({ index: next, animated: true });
  };

  const renderBanner = ({ item }: { item: any }) => {
    const source = typeof item.image === 'string' ? { uri: item.image } : item.image;
    return (
      <View style={[styles.bannerWrap, { width }]}>
        <Image source={source} style={styles.bannerImage} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>{item.title}</Text>
          <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
          <View style={styles.ctaPill}>
            <Text style={styles.ctaText}>Shop now</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={BANNERS}
        renderItem={renderBanner}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        onViewableItemsChanged={onViewableItemsChanged.current}
      />
      <View style={styles.footer}>
        <View style={styles.dots}>
          {BANNERS.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === activeIndex && styles.dotActive]}
            />
          ))}
        </View>
        <View style={styles.nav}>
          <View style={styles.navBtn} onTouchEnd={handlePrev}>
            <ChevronLeft size={22} color="#fff" />
          </View>
          <View style={styles.navBtn} onTouchEnd={handleNext}>
            <ChevronRight size={22} color="#fff" />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: BANNER_HEIGHT,
    marginHorizontal: 0,
    marginTop: 0,
    marginBottom: 8,
    borderRadius: 0,
    overflow: 'hidden',
    backgroundColor: '#1f2937',
    borderTopWidth: 6,
    borderTopColor: '#F1F5F9',
    borderBottomWidth: 6,
    borderBottomColor: '#F1F5F9',
  },
  bannerWrap: {
    height: BANNER_HEIGHT,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bannerContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 12,
  },
  ctaPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#DC2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  ctaText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  footer: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotActive: {
    width: 20,
    backgroundColor: '#DC2626',
  },
  nav: {
    flexDirection: 'row',
    gap: 8,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
