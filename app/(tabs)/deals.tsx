import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { supabase } from '@/lib/supabase';
import { ProductWithDeal } from '@/types/database';
import DealCard from '@/components/DealCard';

const DEAL_TYPES = [
  { id: 'all', label: 'All Deals' },
  { id: 'deal_of_day', label: 'Deal of Day' },
  { id: 'discount', label: 'Discounts' },
  { id: 'brand_focus', label: 'Brand Focus' },
  { id: 'product_focus', label: 'Product Focus' },
  { id: 'pre_launch', label: 'Pre-Launch' },
];

export default function DealsScreen() {
  const [deals, setDeals] = useState<ProductWithDeal[]>([]);
  const [selectedType, setSelectedType] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchDeals = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('products')
        .select('*, deals!inner(*), vendors(*)')
        .eq('deals.is_active', true)
        .eq('is_active', true);

      if (selectedType !== 'all') {
        query = query.eq('deals.deal_type', selectedType);
      }

      const { data } = await query.limit(50);
      setDeals((data as ProductWithDeal[]) || []);
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, [selectedType]);

  const handleProductPress = (productId: string) => {
    console.log('Product pressed:', productId);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Deals</Text>
        <Text style={styles.headerSubtitle}>Find amazing deals</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}>
        {DEAL_TYPES.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.filterButton,
              selectedType === type.id && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedType(type.id)}>
            <Text
              style={[
                styles.filterButtonText,
                selectedType === type.id && styles.filterButtonTextActive,
              ]}>
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.scrollView}>
        <View style={styles.grid}>
          {deals.map((deal) => (
            <View key={deal.id} style={styles.gridItem}>
              <DealCard item={deal} onPress={() => handleProductPress(deal.id)} />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#DC2626',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  gridItem: {
    width: '50%',
    padding: 8,
  },
});
