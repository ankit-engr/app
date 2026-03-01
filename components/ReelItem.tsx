import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated as RNAnimated,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { Heart, ShoppingCart, Plus, Minus, Volume2, VolumeX } from 'lucide-react-native';
import { ReelListItem } from '@/types/database';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppState } from '@/contexts/AppStateContext';

const { width, height } = Dimensions.get('window');

interface ReelItemProps {
  item: ReelListItem;
  isActive: boolean;
}

export default function ReelItem({ item, isActive }: ReelItemProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [quantity, setQuantity] = useState(0);
  const [showProductCard, setShowProductCard] = useState(true);
  const videoRef = useRef<Video>(null);
  const router = useRouter();
  const slideAnim = useRef(new RNAnimated.Value(0)).current;
  const { addToCart, cartItems, updateCartItemQuantity } = useAppState();

  useEffect(() => {
    if (isActive && videoRef.current) {
      videoRef.current.playAsync();
    } else if (videoRef.current) {
      videoRef.current.pauseAsync();
    }
  }, [isActive]);

  useEffect(() => {
    RNAnimated.spring(slideAnim, {
      toValue: showProductCard ? 0 : 150,
      useNativeDriver: true,
      friction: 8,
    }).start();
  }, [showProductCard]);

  const handleProductPress = () => {
    if (item.products) {
      router.push(`/(tabs)/product/${item.products.id}`);
    }
  };

  const cartItemId = item.products?.id ?? null;

  useEffect(() => {
    if (!cartItemId) return;
    const existing = cartItems.find((p) => p.id === cartItemId);
    setQuantity(existing?.quantity ?? 0);
  }, [cartItemId, cartItems]);

  const incrementQuantity = () => {
    if (!item.products) return;

    addToCart({
      id: item.products.id,
      name: item.products.name,
      image: item.products.image_url || item.thumbnail_url || fallbackImage,
      price: discountedPrice,
      originalPrice,
      quantity: 1,
      dealType: null,
    });
  };

  const decrementQuantity = () => {
    if (!cartItemId || quantity <= 0) return;
    updateCartItemQuantity(cartItemId, quantity - 1);
  };

  const fallbackImage = 'https://images.pexels.com/photos/264905/pexels-photo-264905.jpeg?auto=compress&cs=tinysrgb&w=600';
  const hasVideo = !!item.video_url;

  const discount = item.products?.deals?.[0]?.discount_percentage ?? 0;
  const originalPrice = item.products?.price ?? 0;
  const discountedPrice = item.products?.deals?.[0]?.discounted_price ?? item.products?.price ?? 0;

  return (
    <View style={styles.container}>
      {hasVideo ? (
        <Video
          ref={videoRef}
          source={{ uri: item.video_url! }}
          posterSource={item.thumbnail_url ? { uri: item.thumbnail_url } : { uri: fallbackImage }}
          posterStyle={{ resizeMode: 'cover' }}
          usePoster
          style={styles.media}
          resizeMode={ResizeMode.COVER}
          isLooping
          isMuted={isMuted}
          shouldPlay={isActive}
        />
      ) : (
        <Image
          source={{ uri: item.thumbnail_url || fallbackImage }}
          style={styles.media}
          resizeMode="cover"
        />
      )}

      {/* Gradient Overlays */}
      <LinearGradient
        colors={['rgba(0,0,0,0.6)', 'transparent']}
        style={styles.topGradient}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.bottomGradient}
      />

      {/* Mute/Unmute Button - Top Left */}
      <TouchableOpacity
        style={styles.muteButton}
        onPress={() => setIsMuted(!isMuted)}
        activeOpacity={0.8}>
        {isMuted ? (
          <VolumeX size={24} color="#FFFFFF" strokeWidth={2.5} />
        ) : (
          <Volume2 size={24} color="#FFFFFF" strokeWidth={2.5} />
        )}
      </TouchableOpacity>

      {/* Product Card - Top Right */}
      {item.products && (
        <RNAnimated.View
          style={[
            styles.productCard,
            {
              transform: [{ translateX: slideAnim }],
            },
          ]}>
          <TouchableOpacity
            onPress={handleProductPress}
            activeOpacity={0.9}
            style={styles.productCardContent}>
            <Image
              source={{ uri: item.products.image_url || item.thumbnail_url || '' }}
              style={styles.productImage}
              resizeMode="cover"
            />
            <View style={styles.productDetails}>
              <Text style={styles.productName} numberOfLines={2}>
                {item.products.name}
              </Text>
              <View style={styles.priceRow}>
                {discount > 0 ? (
                  <>
                    <Text style={styles.productPrice}>₹{discountedPrice.toFixed(0)}</Text>
                    <Text style={styles.originalPrice}>₹{originalPrice.toFixed(0)}</Text>
                  </>
                ) : (
                  <Text style={styles.productPrice}>₹{originalPrice.toFixed(0)}</Text>
                )}
              </View>
              {discount > 0 && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{discount}% OFF</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          {/* Quantity Controls */}
          <View style={styles.quantityControls}>
            {quantity === 0 ? (
              <TouchableOpacity
                style={styles.addToCartBtn}
                onPress={incrementQuantity}
                activeOpacity={0.8}>
                <ShoppingCart size={18} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.addToCartText}>Add</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.quantityAdjuster}>
                <TouchableOpacity
                  style={styles.quantityBtn}
                  onPress={decrementQuantity}
                  activeOpacity={0.8}>
                  <Minus size={16} color="#FFFFFF" strokeWidth={3} />
                </TouchableOpacity>
                <View style={styles.quantityDisplay}>
                  <Text style={styles.quantityText}>{quantity}</Text>
                </View>
                <TouchableOpacity
                  style={styles.quantityBtn}
                  onPress={incrementQuantity}
                  activeOpacity={0.8}>
                  <Plus size={16} color="#FFFFFF" strokeWidth={3} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </RNAnimated.View>
      )}

      {/* Side Actions - Right Side */}
      <View style={styles.sideActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setIsLiked(!isLiked)}
          activeOpacity={0.8}>
          <View style={styles.actionIconWrapper}>
            <Heart
              size={28}
              color={isLiked ? '#DC2626' : '#FFFFFF'}
              fill={isLiked ? '#DC2626' : 'transparent'}
              strokeWidth={2}
            />
          </View>
          <Text style={styles.actionText}>{item.likes_count || 0}</Text>
        </TouchableOpacity>

        {item.products && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleProductPress}
            activeOpacity={0.8}>
            <View style={styles.actionIconWrapper}>
              <ShoppingCart size={28} color="#FFFFFF" strokeWidth={2} />
            </View>
            <Text style={styles.actionText}>Shop</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Bottom Info */}
      <View style={styles.bottomInfo}>
        {item.vendors && (
          <Text style={styles.vendorName}>@{item.vendors.name}</Text>
        )}
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        {item.description && (
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width,
    height,
    backgroundColor: '#000000',
    position: 'relative',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 250,
  },
  muteButton: {
    position: 'absolute',
    top: 60,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  productCard: {
    position: 'absolute',
    top: 60,
    right: 16,
    width: 140,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  productCardContent: {
    width: '100%',
  },
  productImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#F3F4F6',
  },
  productDetails: {
    padding: 10,
  },
  productName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
    lineHeight: 16,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#DC2626',
  },
  originalPrice: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  quantityControls: {
    width: '100%',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  addToCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#DC2626',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addToCartText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  quantityAdjuster: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#DC2626',
    borderRadius: 8,
    overflow: 'hidden',
  },
  quantityBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  quantityDisplay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sideActions: {
    position: 'absolute',
    right: 16,
    bottom: 140,
    alignItems: 'center',
    gap: 20,
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
  },
  actionIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  bottomInfo: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 180,
  },
  vendorName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
    lineHeight: 22,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  description: {
    fontSize: 13,
    color: '#E5E7EB',
    lineHeight: 18,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
