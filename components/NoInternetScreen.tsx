import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { WifiOff, RefreshCcw } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';

const QUOTES = [
  {
    text: "Oops! Looks like the internet took a coffee break ☕",
    author: "— Network Status",
  },
  {
    text: "No Wi-Fi? No worries! We'll be back when you're connected.",
    author: "— DealRush Team",
  },
  {
    text: "Lost in the digital wilderness? Check your connection!",
    author: "— Tech Explorer",
  },
  {
    text: "Great deals need great connections. Let's get you back online!",
    author: "— Shopping Guru",
  },
  {
    text: "Even the best shoppers need internet. Reconnect and resume!",
    author: "— Deal Hunter",
  },
];

interface NoInternetScreenProps {
  onRetry: () => void;
}

export default function NoInternetScreen({ onRetry }: NoInternetScreenProps) {
  const [currentQuote, setCurrentQuote] = useState(0);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * QUOTES.length);
    setCurrentQuote(randomIndex);
  }, []);

  const quote = QUOTES[currentQuote];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F9FAFB', '#FFFFFF', '#F9FAFB']}
        style={styles.gradient}>
        <View style={styles.content}>
          <View style={styles.iconWrap}>
            <View style={styles.iconCircle}>
              <WifiOff size={64} color="#DC2626" strokeWidth={2} />
            </View>
          </View>

          <Text style={styles.title}>No Internet Connection</Text>
          <Text style={styles.subtitle}>
            Please check your network settings and try again
          </Text>

          <View style={styles.quoteBox}>
            <View style={styles.quoteIcon}>
              <Text style={styles.quoteSymbol}>"</Text>
            </View>
            <Text style={styles.quoteText}>{quote.text}</Text>
            <Text style={styles.quoteAuthor}>{quote.author}</Text>
          </View>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={onRetry}
            activeOpacity={0.8}>
            <RefreshCcw size={20} color="#FFFFFF" />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>

          <View style={styles.tipsBox}>
            <Text style={styles.tipsTitle}>Quick Tips:</Text>
            <Text style={styles.tipItem}>• Turn off Airplane mode</Text>
            <Text style={styles.tipItem}>• Check your Wi-Fi connection</Text>
            <Text style={styles.tipItem}>• Try mobile data if available</Text>
            <Text style={styles.tipItem}>• Restart your router</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>DealRush</Text>
          <Text style={styles.footerSubtext}>Your shopping companion</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconWrap: {
    marginBottom: 32,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FECACA',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  quoteBox: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    width: '100%',
  },
  quoteIcon: {
    marginBottom: 12,
  },
  quoteSymbol: {
    fontSize: 48,
    color: '#DC2626',
    fontWeight: '800',
    lineHeight: 48,
  },
  quoteText: {
    fontSize: 17,
    color: '#374151',
    fontStyle: 'italic',
    marginBottom: 12,
    lineHeight: 26,
  },
  quoteAuthor: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '600',
    textAlign: 'right',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 10,
    marginBottom: 32,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  tipsBox: {
    backgroundColor: '#F0F9FF',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    width: '100%',
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 10,
  },
  tipItem: {
    fontSize: 13,
    color: '#3B82F6',
    marginBottom: 6,
    lineHeight: 20,
  },
  footer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#DC2626',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
