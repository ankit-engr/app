import { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, ViewToken, Dimensions } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { getReels, getImageUrl, apiProductToProductWithDeal, ApiProduct } from '@/lib/api';
import { ReelListItem } from '@/types/database';
import ReelItem from '@/components/ReelItem';

function mapReelProductToItem(p: ApiProduct): ReelListItem {
  const productWithDeal = apiProductToProductWithDeal(p);
  return {
    id: p.id,
    thumbnail_url: productWithDeal.image_url,
    video_url: p.reelLink ? getImageUrl(p.reelLink) : null,
    title: productWithDeal.name || 'Reel',
    description: productWithDeal.description,
    likes_count: 0,
    products: productWithDeal,
    vendors: productWithDeal.vendors,
  };
}

const { height: screenHeight } = Dimensions.get('window');

export default function ReelsScreen() {
  const [reels, setReels] = useState<ReelListItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  });

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index ?? 0);
    }
  });

  const fetchReels = async () => {
    try {
      const data = await getReels(1, 50);
      setReels(data.map(mapReelProductToItem));
    } catch (error) {
      console.error('Error fetching reels:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReels();
  }, []);

  const renderItem = ({ item, index }: { item: ReelListItem; index: number }) => (
    <ReelItem item={item} isActive={index === activeIndex && isFocused} />
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <View style={styles.loadingBox} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={reels}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={screenHeight}
        snapToAlignment="start"
        decelerationRate="fast"
        viewabilityConfig={viewabilityConfig.current}
        onViewableItemsChanged={onViewableItemsChanged.current}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBox: {
    width: 40,
    height: 40,
    backgroundColor: '#333',
    borderRadius: 8,
  },
});
