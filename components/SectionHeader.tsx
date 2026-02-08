import { View, Text, StyleSheet } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  accentColor: string;
  backgroundColor?: string;
}

export default function SectionHeader({ title, subtitle, icon: Icon, accentColor, backgroundColor }: SectionHeaderProps) {
  return (
    <View style={[styles.wrap, backgroundColor ? { backgroundColor } : undefined]}>
      <View style={[styles.bar, { backgroundColor: accentColor }]} />
      <View style={styles.content}>
        {Icon && (
          <View style={[styles.iconWrap, { backgroundColor: `${accentColor}18` }]}>
            <Icon size={22} color={accentColor} strokeWidth={2.5} />
          </View>
        )}
        <View style={styles.textWrap}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 14,
    position: 'relative',
  },
  bar: {
    position: 'absolute',
    left: 0,
    top: 24,
    bottom: 18,
    width: 4,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
});
