import { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Play, Pause, Heart, ShoppingBag } from 'lucide-react-native';
import { ReelWithDetails } from '@/types/database';

const { width, height } = Dimensions.get('window');

interface ReelItemProps {
  item: ReelWithDetails;
  isActive: boolean;
}

export default function ReelItem({ item, isActive }: ReelItemProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: item.thumbnail_url || 'https://images.pexels.com/photos/264905/pexels-photo-264905.jpeg?auto=compress&cs=tinysrgb&w=600' }}
        style={styles.video}
      />

      <TouchableOpacity
        style={styles.playButton}
        onPress={() => setIsPlaying(!isPlaying)}>
        {!isPlaying ? (
          <Play size={48} color="#FFFFFF" fill="#FFFFFF" />
        ) : (
          <Pause size={48} color="#FFFFFF" fill="#FFFFFF" />
        )}
      </TouchableOpacity>

      <View style={styles.overlay}>
        <View style={styles.sideActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setIsLiked(!isLiked)}>
            <Heart
              size={32}
              color={isLiked ? '#DC2626' : '#FFFFFF'}
              fill={isLiked ? '#DC2626' : 'transparent'}
            />
            <Text style={styles.actionText}>{item.likes_count}</Text>
          </TouchableOpacity>

          {item.products && (
            <TouchableOpacity style={styles.actionButton}>
              <ShoppingBag size={32} color="#FFFFFF" />
              <Text style={styles.actionText}>Shop</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.bottomInfo}>
          <Text style={styles.title}>{item.title}</Text>
          {item.description && (
            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>
          )}
          {item.products && (
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{item.products.name}</Text>
              <Text style={styles.productPrice}>${item.products.price}</Text>
            </View>
          )}
          {item.vendors && (
            <Text style={styles.vendorName}>by {item.vendors.name}</Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width,
    height,
    backgroundColor: '#000000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -24 }, { translateY: -24 }],
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  sideActions: {
    position: 'absolute',
    right: 16,
    bottom: 100,
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
    marginBottom: 24,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  bottomInfo: {
    padding: 16,
    paddingBottom: 100,
    backgroundColor: 'linear-gradient(transparent, rgba(0, 0, 0, 0.8))',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#E5E7EB',
    marginBottom: 12,
  },
  productInfo: {
    backgroundColor: 'rgba(220, 38, 38, 0.9)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  vendorName: {
    fontSize: 12,
    color: '#D1D5DB',
  },
});
