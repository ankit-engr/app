import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { ProductWithDeal } from '@/types/database';
import DealSection from '@/components/DealSection';
import BannerSlider from '@/components/BannerSlider';
import { Flame } from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const [dealOfDay, setDealOfDay] = useState<ProductWithDeal[]>([]);
  const [discountDeals, setDiscountDeals] = useState<ProductWithDeal[]>([]);
  const [brandFocus, setBrandFocus] = useState<ProductWithDeal[]>([]);
  const [productFocus, setProductFocus] = useState<ProductWithDeal[]>([]);
  const [preLaunch, setPreLaunch] = useState<ProductWithDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDeals = async () => {
    try {
      const { data: dealOfDayData } = await supabase
        .from('products')
        .select('*, deals!inner(*), vendors(*)')
        .eq('deals.deal_type', 'deal_of_day')
        .eq('deals.is_active', true)
        .eq('is_active', true)
        .limit(10);

      const { data: discountData } = await supabase
        .from('products')
        .select('*, deals!inner(*), vendors(*)')
        .eq('deals.deal_type', 'discount')
        .eq('deals.is_active', true)
        .eq('is_active', true)
        .limit(10);

      const { data: brandData } = await supabase
        .from('products')
        .select('*, deals!inner(*), vendors(*)')
        .eq('deals.deal_type', 'brand_focus')
        .eq('deals.is_active', true)
        .eq('is_active', true)
        .limit(10);

      const { data: productData } = await supabase
        .from('products')
        .select('*, deals!inner(*), vendors(*)')
        .eq('deals.deal_type', 'product_focus')
        .eq('deals.is_active', true)
        .eq('is_active', true)
        .limit(10);

      const { data: preLaunchData } = await supabase
        .from('products')
        .select('*, deals!inner(*), vendors(*)')
        .eq('deals.deal_type', 'pre_launch')
        .eq('deals.is_active', true)
        .eq('is_active', true)
        .limit(10);

      setDealOfDay((dealOfDayData as ProductWithDeal[]) || []);
      setDiscountDeals((discountData as ProductWithDeal[]) || []);
      setBrandFocus((brandData as ProductWithDeal[]) || []);
      setProductFocus((productData as ProductWithDeal[]) || []);
      setPreLaunch((preLaunchData as ProductWithDeal[]) || []);
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDeals();
  };

  const handleProductPress = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Flame size={32} color="#DC2626" />
          <Text style={styles.headerTitle}>Hot Deals</Text>
        </View>
        <Text style={styles.headerSubtitle}>Grab the best deals today!</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#DC2626"
          />
        }>
        <BannerSlider />

        <DealSection
          title="Deal of the Day"
          subtitle="Limited time offer - Hurry up!"
          deals={dealOfDay}
          loading={loading}
          onProductPress={handleProductPress}
        />

        <DealSection
          title="Flash Discounts"
          subtitle="Up to 70% off on selected items"
          deals={discountDeals}
          loading={loading}
          onProductPress={handleProductPress}
        />

        <DealSection
          title="Brand Focus"
          subtitle="Exclusive deals from top brands"
          deals={brandFocus}
          loading={loading}
          onProductPress={handleProductPress}
        />

        <DealSection
          title="Product in Focus"
          subtitle="Handpicked products just for you"
          deals={productFocus}
          loading={loading}
          onProductPress={handleProductPress}
        />

        <DealSection
          title="Pre-Launch Exclusive"
          subtitle="Be the first to get these products"
          deals={preLaunch}
          loading={loading}
          onProductPress={handleProductPress}
        />

        <View style={styles.bottomPadding} />
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
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 40,
  },
  scrollView: {
    flex: 1,
  },
  bottomPadding: {
    height: 20,
  },
});
