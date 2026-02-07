import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { ProductWithDeal } from '@/types/database';
import DealCard from './DealCard';

interface DealSectionProps {
  title: string;
  subtitle?: string;
  deals: ProductWithDeal[];
  loading?: boolean;
  onProductPress: (productId: string) => void;
}

export default function DealSection({ title, subtitle, deals, loading, onProductPress }: DealSectionProps) {
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#DC2626" />
        </View>
      </View>
    );
  }

  if (deals.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {deals.map((deal) => (
          <DealCard
            key={deal.id}
            item={deal}
            onPress={() => onProductPress(deal.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  loadingContainer: {
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
