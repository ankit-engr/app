import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock } from 'lucide-react-native';
import { ProductWithDeal } from '@/types/database';

interface DealCardProps {
  item: ProductWithDeal;
  onPress: () => void;
}

export default function DealCard({ item, onPress }: DealCardProps) {
  const deal = item.deals?.[0];

  if (!deal) return null;

  const timeLeft = new Date(deal.end_date).getTime() - Date.now();
  const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image
        source={{ uri: item.image_url || 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=400' }}
        style={styles.image}
      />
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{deal.discount_percentage}% OFF</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.brandName}>{item.vendors?.name}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.originalPrice}>${item.price}</Text>
          <Text style={styles.discountedPrice}>${deal.discounted_price}</Text>
        </View>
        <View style={styles.timeRow}>
          <Clock size={14} color="#DC2626" />
          <Text style={styles.timeText}>{hoursLeft}h left</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#DC2626',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  content: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  brandName: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  originalPrice: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  discountedPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#DC2626',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: '#DC2626',
    marginLeft: 4,
    fontWeight: '600',
  },
});
