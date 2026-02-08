import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock } from 'lucide-react-native';
import { ProductWithDeal } from '@/types/database';

export type DealCardVariant = 'default' | 'compact' | 'featured';

interface DealCardProps {
  item: ProductWithDeal;
  onPress: () => void;
  variant?: DealCardVariant;
  accentColor?: string;
  hideTime?: boolean;
  /** When true and variant is compact, card fills container (for grid) */
  fullWidth?: boolean;
}

const DEFAULT_IMAGE = 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=400';

export default function DealCard({ item, onPress, variant = 'default', accentColor = '#DC2626', hideTime, fullWidth }: DealCardProps) {
  const deal = item.deals?.[0];
  if (!deal) return null;

  const timeLeft = new Date(deal.end_date).getTime() - Date.now();
  const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
  const showBadge = deal.discount_percentage > 0;

  if (variant === 'featured') {
    return (
      <TouchableOpacity style={[styles.featuredCard, { borderColor: accentColor }]} onPress={onPress} activeOpacity={0.9}>
        <Image source={{ uri: item.image_url || DEFAULT_IMAGE }} style={styles.featuredImage} />
        {showBadge && (
          <View style={[styles.featuredBadge, { backgroundColor: accentColor }]}>
            <Text style={styles.featuredBadgeText}>{deal.discount_percentage}% OFF</Text>
          </View>
        )}
        <View style={styles.featuredContent}>
          <Text style={styles.featuredName} numberOfLines={2}>{item.name}</Text>
          <View style={styles.featuredPriceRow}>
            {deal.discount_percentage > 0 && (
              <Text style={styles.featuredOriginal}>₹{item.price}</Text>
            )}
            <Text style={[styles.featuredPrice, { color: accentColor }]}>₹{deal.discounted_price}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === 'compact') {
    return (
      <TouchableOpacity style={[styles.compactCard, fullWidth && styles.compactCardFullWidth, { borderLeftColor: accentColor }]} onPress={onPress} activeOpacity={0.9}>
        <Image source={{ uri: item.image_url || DEFAULT_IMAGE }} style={styles.compactImage} />
        {showBadge && (
          <View style={[styles.compactBadge, { backgroundColor: accentColor }]}>
            <Text style={styles.compactBadgeText}>{deal.discount_percentage}%</Text>
          </View>
        )}
        <View style={styles.compactContent}>
          <Text style={styles.compactName} numberOfLines={2}>{item.name}</Text>
          <Text style={[styles.compactPrice, { color: accentColor }]}>₹{deal.discounted_price}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={[styles.card, { shadowColor: accentColor }]} onPress={onPress} activeOpacity={0.9}>
      <Image source={{ uri: item.image_url || DEFAULT_IMAGE }} style={styles.image} />
      {showBadge && (
        <View style={[styles.badge, { backgroundColor: accentColor }]}>
          <Text style={styles.badgeText}>{deal.discount_percentage}% OFF</Text>
        </View>
      )}
      <View style={styles.content}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        {item.vendors?.name ? <Text style={styles.brandName}>{item.vendors.name}</Text> : null}
        <View style={styles.priceRow}>
          {deal.discount_percentage > 0 && (
            <Text style={styles.originalPrice}>₹{item.price}</Text>
          )}
          <Text style={[styles.discountedPrice, { color: accentColor }]}>₹{deal.discounted_price}</Text>
        </View>
        {!hideTime && (
          <View style={styles.timeRow}>
            <Clock size={14} color={accentColor} />
            <Text style={[styles.timeText, { color: accentColor }]}>{hoursLeft}h left</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const CARD_BORDER = { borderWidth: 1, borderColor: '#E2E8F0' };

const styles = StyleSheet.create({
  card: {
    width: 132,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginRight: 10,
    overflow: 'hidden',
    ...CARD_BORDER,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 132,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  content: {
    padding: 8,
  },
  productName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  brandName: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  originalPrice: {
    fontSize: 10,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  discountedPrice: {
    fontSize: 13,
    fontWeight: '800',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 10,
    marginLeft: 4,
    fontWeight: '600',
  },
  // Compact (for grid / strip)
  compactCard: {
    width: 150,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginRight: 8,
    marginBottom: 8,
    overflow: 'hidden',
    flexDirection: 'row',
    borderLeftWidth: 4,
    ...CARD_BORDER,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  compactCardFullWidth: {
    width: '100%',
    marginRight: 0,
  },
  compactImage: {
    width: 64,
    height: 64,
  },
  compactBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  compactBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  compactContent: {
    flex: 1,
    padding: 6,
    justifyContent: 'center',
  },
  compactName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  compactPrice: {
    fontSize: 12,
    fontWeight: '800',
  },
  // Featured (hero – smaller than before)
  featuredCard: {
    width: 160,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  featuredImage: {
    width: '100%',
    height: 140,
  },
  featuredBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  featuredBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  featuredContent: {
    padding: 10,
  },
  featuredName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  featuredPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featuredOriginal: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  featuredPrice: {
    fontSize: 16,
    fontWeight: '800',
  },
});
