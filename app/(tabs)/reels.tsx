import { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, ViewToken } from 'react-native';
import { supabase } from '@/lib/supabase';
import { ReelWithDetails } from '@/types/database';
import ReelItem from '@/components/ReelItem';

export default function ReelsScreen() {
  const [reels, setReels] = useState<ReelWithDetails[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  });

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index || 0);
    }
  });

  const fetchReels = async () => {
    try {
      const { data } = await supabase
        .from('reels')
        .select('*, products(*), vendors(*)')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(20);

      setReels((data as ReelWithDetails[]) || []);
    } catch (error) {
      console.error('Error fetching reels:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReels();
  }, []);

  const renderItem = ({ item, index }: { item: ReelWithDetails; index: number }) => (
    <ReelItem item={item} isActive={index === activeIndex} />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={reels}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={StyleSheet.absoluteFill.height}
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
});
