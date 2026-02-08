import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, SafeAreaView, TextInput } from 'react-native';
import { Search } from 'lucide-react-native';
import { getVendors, getImageUrl } from '@/lib/api';
import { Vendor } from '@/types/database';
import VendorCard from '@/components/VendorCard';

function mapApiVendorToVendor(v: import('@/lib/api').ApiVendor): Vendor {
  return {
    id: v.id,
    name: v.name,
    logo_url: v.logoUrl ?? v.logo_url ? getImageUrl(v.logoUrl ?? v.logo_url) : null,
    description: v.description ?? null,
    is_featured: v.is_featured ?? false,
    created_at: '',
  };
}

export default function VendorsScreen() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchVendors = async () => {
    try {
      const data = await getVendors(1, 200);
      const list = data.map(mapApiVendorToVendor);
      setVendors(list);
      setFilteredVendors(list);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredVendors(vendors);
    } else {
      const filtered = vendors.filter((vendor) =>
        vendor.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredVendors(filtered);
    }
  }, [searchQuery, vendors]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchVendors();
  };

  const handleVendorPress = (vendorId: string) => {
    // Could navigate to /brands/[slug] when you have slug from API
    console.log('Vendor pressed:', vendorId);
  };

  const featuredVendors = filteredVendors.filter((v) => v.is_featured);
  const regularVendors = filteredVendors.filter((v) => !v.is_featured);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Brands</Text>
          <Text style={styles.headerSubtitle}>Discover amazing brands</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading brands...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Brands</Text>
        <Text style={styles.headerSubtitle}>Discover amazing brands</Text>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#6B7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search brands..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
        />
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
        {featuredVendors.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Featured Brands</Text>
            {featuredVendors.map((vendor) => (
              <VendorCard
                key={vendor.id}
                vendor={vendor}
                onPress={() => handleVendorPress(vendor.id)}
              />
            ))}
          </View>
        )}

        {regularVendors.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>All Brands</Text>
            {regularVendors.map((vendor) => (
              <VendorCard
                key={vendor.id}
                vendor={vendor}
                onPress={() => handleVendorPress(vendor.id)}
              />
            ))}
          </View>
        )}

        {filteredVendors.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No brands found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search</Text>
          </View>
        )}

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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  bottomPadding: {
    height: 20,
  },
});
