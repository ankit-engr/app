import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ShoppingBag, Shirt, Sparkles, Home as HomeIcon, Watch, Smartphone, Baby } from 'lucide-react-native';

const CATEGORIES = [
  { id: '1', name: 'Fashion', icon: Shirt, color: '#EC4899' },
  { id: '2', name: 'Beauty', icon: Sparkles, color: '#8B5CF6' },
  { id: '3', name: 'Home', icon: HomeIcon, color: '#10B981' },
  { id: '4', name: 'Watches', icon: Watch, color: '#F59E0B' },
  { id: '5', name: 'Electronics', icon: Smartphone, color: '#3B82F6' },
  { id: '6', name: 'Kids', icon: Baby, color: '#F97316' },
  { id: '7', name: 'All', icon: ShoppingBag, color: '#6B7280' },
];

interface CategoryPillsProps {
  onCategoryPress?: (categoryId: string) => void;
}

export default function CategoryPills({ onCategoryPress }: CategoryPillsProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <TouchableOpacity
              key={cat.id}
              style={styles.pill}
              onPress={() => onCategoryPress?.(cat.id)}
              activeOpacity={0.7}>
              <View style={[styles.iconWrap, { backgroundColor: `${cat.color}15` }]}>
                <Icon size={18} color={cat.color} strokeWidth={2.5} />
              </View>
              <Text style={styles.pillText}>{cat.name}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    marginBottom: 4,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
});
