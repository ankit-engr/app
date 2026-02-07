import { useState, useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, FlatList, Dimensions, ViewToken } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

interface Banner {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  color: string;
}

const BANNERS: Banner[] = [
  {
    id: '1',
    image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=1000',
    title: 'Deal of the Day',
    subtitle: 'Up to 40% off on tech products',
    color: '#DC2626',
  },
  {
    id: '2',
    image: 'https://images.pexels.com/photos/1055691/pexels-photo-1055691.jpeg?auto=compress&cs=tinysrgb&w=1000',
    title: 'Summer Collection',
    subtitle: 'Fresh styles for the season',
    color: '#DC2626',
  },
  {
    id: '3',
    image: 'https://images.pexels.com/photos/3762879/pexels-photo-3762879.jpeg?auto=compress&cs=tinysrgb&w=1000',
    title: 'Beauty Essentials',
    subtitle: 'Premium skincare collection',
    color: '#DC2626',
  },
  {
    id: '4',
    image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1000',
    title: 'Home Decor',
    subtitle: 'Transform your space',
    color: '#DC2626',
  },
];

const { width } = Dimensions.get('window');

export default function BannerSlider() {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollIntervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    scrollIntervalRef.current = setInterval(() => {
      const nextIndex = (activeIndex + 1) % BANNERS.length;
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }, 5000);

    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    };
  }, [activeIndex]);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setActiveIndex(viewableItems[0].index);
    }
  });

  const handlePrevious = () => {
    const newIndex = (activeIndex - 1 + BANNERS.length) % BANNERS.length;
    flatListRef.current?.scrollToIndex({
      index: newIndex,
      animated: true,
    });
  };

  const handleNext = () => {
    const newIndex = (activeIndex + 1) % BANNERS.length;
    flatListRef.current?.scrollToIndex({
      index: newIndex,
      animated: true,
    });
  };

  const renderBanner = ({ item }: { item: Banner }) => (
    <View style={[styles.bannerContainer, { width }]}>
      <Image source={{ uri: item.image }} style={styles.bannerImage} />
      <View style={styles.overlayGradient} />
      <View style={styles.bannerContent}>
        <Text style={styles.bannerTitle}>{item.title}</Text>
        <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
      </View>
    </View>
  );

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
        scrollEventThrottle={16}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
        }}
        onViewableItemsChanged={onViewableItemsChanged.current}
      />

      <View style={styles.navigation}>
        <View style={styles.dots}>
          {BANNERS.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, index === activeIndex && styles.activeDot]}
            />
          ))}
        </View>

        <View style={styles.buttons}>
          <View style={styles.navButton} onTouchEnd={handlePrevious}>
            <ChevronLeft size={20} color="#FFFFFF" />
          </View>
          <View style={styles.navButton} onTouchEnd={handleNext}>
            <ChevronRight size={20} color="#FFFFFF" />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 280,
    width: '100%',
    position: 'relative',
    marginBottom: 24,
  },
  bannerContainer: {
    height: 280,
    position: 'relative',
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlayGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  bannerContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  bannerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: '#F3F4F6',
  },
  navigation: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeDot: {
    backgroundColor: '#DC2626',
    width: 24,
  },
  buttons: {
    flexDirection: 'row',
    gap: 8,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(220, 38, 38, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
