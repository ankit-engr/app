import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Vendor } from '@/types/database';
import { Store } from 'lucide-react-native';
import SectionHeader from './SectionHeader';

interface BrandSectionProps {
  title: string;
  subtitle?: string;
  brands: Vendor[];
  loading?: boolean;
  onBrandPress: (vendorId: string) => void;
}

export default function BrandSection({ title, subtitle, brands, loading, onBrandPress }: BrandSectionProps) {
  if (loading) {
    return (
      <View style={[styles.container, styles.sectionBg]}>
        <SectionHeader title={title} subtitle={subtitle} accentColor="#7C3AED" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7C3AED" />
        </View>
      </View>
    );
  }

  if (brands.length === 0) return null;

  return (
    <View style={[styles.container, styles.sectionBg]}>
      <SectionHeader title={title} subtitle={subtitle} accentColor="#7C3AED" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {brands.map((vendor) => (
          <TouchableOpacity
            key={vendor.id}
            style={styles.brandChip}
            onPress={() => onBrandPress(vendor.id)}
            activeOpacity={0.8}>
            <View style={styles.avatarWrap}>
              {vendor.logo_url ? (
                <Image source={{ uri: vendor.logo_url }} style={styles.avatarImage} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Store size={28} color="#7C3AED" />
                </View>
              )}
            </View>
            <Text style={styles.brandName} numberOfLines={1}>{vendor.name}</Text>
          </TouchableOpacity>
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
    paddingHorizontal: 16,
    gap: 16,
  },
  loadingContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandChip: {
    alignItems: 'center',
    width: 88,
  },
  avatarWrap: {
    marginBottom: 8,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F5F3FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  avatarPlaceholder: {
    backgroundColor: '#EDE9FE',
  },
  brandName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
});
