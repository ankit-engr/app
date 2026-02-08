import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

function ShimmerEffect() {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 300],
  });

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        { transform: [{ translateX }] },
      ]}>
      <LinearGradient
        colors={['#E5E7EB', '#F3F4F6', '#E5E7EB'] as const}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}

export function SkeletonProductCard({ variant = 'default' }: { variant?: 'default' | 'compact' | 'featured' }) {
  if (variant === 'featured') {
    return (
      <View style={styles.featuredCard}>
        <View style={styles.featuredImage}>
          <ShimmerEffect />
        </View>
        <View style={styles.featuredContent}>
          <View style={styles.featuredTitleSkeleton}>
            <ShimmerEffect />
          </View>
          <View style={styles.featuredPriceSkeleton}>
            <ShimmerEffect />
          </View>
        </View>
      </View>
    );
  }

  if (variant === 'compact') {
    return (
      <View style={styles.compactCard}>
        <View style={styles.compactImage}>
          <ShimmerEffect />
        </View>
        <View style={styles.compactContent}>
          <View style={styles.compactTitleSkeleton}>
            <ShimmerEffect />
          </View>
          <View style={styles.compactPriceSkeleton}>
            <ShimmerEffect />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.image}>
        <ShimmerEffect />
      </View>
      <View style={styles.content}>
        <View style={styles.titleSkeleton}>
          <ShimmerEffect />
        </View>
        <View style={styles.titleSmallSkeleton}>
          <ShimmerEffect />
        </View>
        <View style={styles.priceSkeleton}>
          <ShimmerEffect />
        </View>
      </View>
    </View>
  );
}

export function SkeletonBanner() {
  return (
    <View style={styles.banner}>
      <ShimmerEffect />
    </View>
  );
}

export function SkeletonSection({ cardVariant = 'default' }: { cardVariant?: 'default' | 'compact' | 'featured' }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.iconSkeleton}>
          <ShimmerEffect />
        </View>
        <View style={styles.textGroup}>
          <View style={styles.titleLargeSkeleton}>
            <ShimmerEffect />
          </View>
          <View style={styles.subtitleSkeleton}>
            <ShimmerEffect />
          </View>
        </View>
      </View>
      <View style={styles.cardRow}>
        {[1, 2, 3].map((i) => (
          <SkeletonProductCard key={i} variant={cardVariant} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 132,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginRight: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  image: {
    width: '100%',
    height: 132,
    backgroundColor: '#E5E7EB',
  },
  content: {
    padding: 8,
  },
  titleSkeleton: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 6,
    width: '90%',
    overflow: 'hidden',
  },
  titleSmallSkeleton: {
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 6,
    width: '60%',
    overflow: 'hidden',
  },
  priceSkeleton: {
    height: 13,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    width: '50%',
    overflow: 'hidden',
  },
  compactCard: {
    width: 150,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginRight: 8,
    marginBottom: 8,
    overflow: 'hidden',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  compactImage: {
    width: 64,
    height: 64,
    backgroundColor: '#E5E7EB',
  },
  compactContent: {
    flex: 1,
    padding: 6,
    justifyContent: 'center',
  },
  compactTitleSkeleton: {
    height: 11,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 4,
    width: '80%',
    overflow: 'hidden',
  },
  compactPriceSkeleton: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    width: '50%',
    overflow: 'hidden',
  },
  featuredCard: {
    width: 160,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  featuredImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#E5E7EB',
  },
  featuredContent: {
    padding: 10,
  },
  featuredTitleSkeleton: {
    height: 13,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 6,
    width: '85%',
    overflow: 'hidden',
  },
  featuredPriceSkeleton: {
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    width: '60%',
    overflow: 'hidden',
  },
  banner: {
    height: 200,
    backgroundColor: '#E5E7EB',
    marginBottom: 8,
    overflow: 'hidden',
  },
  section: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 20,
    marginBottom: 8,
    borderTopWidth: 6,
    borderTopColor: '#F1F5F9',
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconSkeleton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    marginRight: 12,
    overflow: 'hidden',
  },
  textGroup: {
    flex: 1,
  },
  titleLargeSkeleton: {
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    width: '40%',
    marginBottom: 6,
    overflow: 'hidden',
  },
  subtitleSkeleton: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    width: '60%',
    overflow: 'hidden',
  },
  cardRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
  },
});
