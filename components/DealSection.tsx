import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { ProductWithDeal } from '@/types/database';
import DealCard from './DealCard';
import SectionHeader from './SectionHeader';
import type { DealCardVariant } from './DealCard';
import type { LucideIcon } from 'lucide-react-native';

export type SectionVariant = 'red' | 'amber' | 'teal' | 'violet' | 'orange' | 'emerald' | 'slate';

const VARIANT_COLORS: Record<SectionVariant, string> = {
  red: '#DC2626',
  amber: '#D97706',
  teal: '#0D9488',
  violet: '#7C3AED',
  orange: '#EA580C',
  emerald: '#059669',
  slate: '#475569',
};

interface DealSectionProps {
  title: string;
  subtitle?: string;
  deals: ProductWithDeal[];
  loading?: boolean;
  onProductPress: (productId: string) => void;
  variant?: SectionVariant;
  layout?: 'horizontal' | 'grid';
  cardVariant?: DealCardVariant;
  icon?: LucideIcon;
  hideTime?: boolean;
}

export default function DealSection({
  title,
  subtitle,
  deals,
  loading,
  onProductPress,
  variant = 'red',
  layout = 'horizontal',
  cardVariant = 'default',
  icon,
  hideTime,
}: DealSectionProps) {
  const accentColor = VARIANT_COLORS[variant];

  if (loading) {
    return (
      <View style={[styles.container, styles.sectionBg]}>
        <SectionHeader title={title} subtitle={subtitle} accentColor={accentColor} icon={icon} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={accentColor} />
        </View>
      </View>
    );
  }

  if (deals.length === 0) {
    return null;
  }

  if (layout === 'grid') {
    return (
      <View style={[styles.container, styles.sectionBg]}>
        <SectionHeader title={title} subtitle={subtitle} accentColor={accentColor} icon={icon} />
        <View style={styles.grid}>
          {deals.slice(0, 6).map((deal) => (
            <View key={deal.id} style={styles.gridItem}>
              <DealCard
                item={deal}
                onPress={() => onProductPress(deal.id)}
                variant="compact"
                accentColor={accentColor}
                fullWidth
              />
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, styles.sectionBg]}>
      <SectionHeader title={title} subtitle={subtitle} accentColor={accentColor} icon={icon} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {deals.map((deal) => (
          <DealCard
            key={deal.id}
            item={deal}
            onPress={() => onProductPress(deal.id)}
            variant={cardVariant}
            accentColor={accentColor}
            hideTime={hideTime}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
    borderTopWidth: 6,
    borderTopColor: '#F1F5F9',
  },
  sectionBg: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 20,
    marginHorizontal: 0,
    marginBottom: 12,
    borderRadius: 0,
    overflow: 'hidden',
  },
  scrollContent: {
    paddingHorizontal: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
  },
  gridItem: {
    width: '50%',
    paddingHorizontal: 4,
    paddingBottom: 8,
    alignItems: 'center',
  },
  loadingContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
