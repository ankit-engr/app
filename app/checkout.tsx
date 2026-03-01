import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, MapPin, Tag, ChevronRight, ArrowRight, Gift } from 'lucide-react-native';

type Step = 1 | 2 | 3;

export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [currentStep] = useState<Step>(2);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  const subtotal = 15600;
  const deliveryFee = 0;
  const taxRate = 0.08;
  const tax = Math.round(subtotal * taxRate);
  const saved = 2400;
  const total = subtotal + deliveryFee + tax;

  const fmt = (n: number) =>
    '₹' + (n / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleApplyPromo = () => {
    if (!promoCode.trim()) return;
    setPromoApplied(true);
    Alert.alert('Promo Applied', `Code "${promoCode}" applied successfully!`);
  };

  const steps: { id: Step; label: string }[] = [
    { id: 1, label: 'Shipping' },
    { id: 2, label: 'Payment' },
    { id: 3, label: 'Review' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <ChevronLeft size={22} color="#111827" strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={styles.headerBtn} />
      </View>

      {/* ── Step indicator ── */}
      <View style={styles.stepperWrap}>
        {steps.map((step, idx) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          const isDone = isCompleted || isActive;
          return (
            <View key={step.id} style={styles.stepItem}>
              <View style={[styles.stepCircle, isDone ? styles.stepCircleActive : styles.stepCircleInactive]}>
                <Text style={[styles.stepNum, isDone ? styles.stepNumActive : styles.stepNumInactive]}>
                  {step.id}
                </Text>
              </View>
              <Text style={[styles.stepLabel, isDone ? styles.stepLabelActive : styles.stepLabelInactive]}>
                {step.label}
              </Text>
              {idx < steps.length - 1 && (
                <View style={[styles.stepLine, isCompleted ? styles.stepLineActive : styles.stepLineInactive]} />
              )}
            </View>
          );
        })}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* ── Delivery Address ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <TouchableOpacity activeOpacity={0.8}>
              <Text style={styles.editLink}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.addressCard}>
            <View style={styles.addressIconWrap}>
              <MapPin size={18} color="#DC2626" strokeWidth={2.2} fill="rgba(220,38,38,0.12)" />
            </View>
            <View style={styles.addressDetails}>
              <Text style={styles.addressLabel}>Home</Text>
              <Text style={styles.addressText}>123 Maple Street, Apartment 4B, New York, NY 10001, United States</Text>
              <Text style={styles.addressPhone}>+1 (555) 000-1234</Text>
            </View>
          </View>
        </View>

        {/* ── Promo Code ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Promo Code</Text>
          <View style={styles.promoRow}>
            <View style={styles.promoInputWrap}>
              <Tag size={16} color="#9CA3AF" strokeWidth={2} />
              <TextInput
                style={styles.promoInput}
                placeholder="Enter promo code"
                placeholderTextColor="#9CA3AF"
                value={promoCode}
                onChangeText={setPromoCode}
                autoCapitalize="characters"
              />
            </View>
            <TouchableOpacity
              style={[styles.applyBtn, promoApplied && styles.applyBtnApplied]}
              onPress={handleApplyPromo}
              activeOpacity={0.85}>
              <Text style={styles.applyBtnText}>{promoApplied ? 'Applied ✓' : 'Apply'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Payment Method ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>

          <TouchableOpacity style={styles.paymentCard} activeOpacity={0.9}>
            <View style={styles.payuLogoBox}>
              <Text style={styles.payuLogoText}>
                <Text style={styles.payuPay}>Pay</Text>
                <Text style={styles.payuU}>U</Text>
              </Text>
            </View>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentName}>Secure Payment via PayU</Text>
              <Text style={styles.paymentSub}>Redirects to secure PayU gateway</Text>
            </View>
            <View style={styles.radioSelected}>
              <View style={styles.radioInner} />
            </View>
          </TouchableOpacity>

          <Text style={styles.paymentNote}>
            By clicking "Place Order", you will be redirected to PayU to complete your purchase securely.
          </Text>
        </View>

        {/* ── Order Summary ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            <View style={styles.itemsBadge}>
              <Text style={styles.itemsBadgeText}>3 Items</Text>
            </View>
          </View>

          <View style={styles.summaryWrap}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{fmt(subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryFree}>FREE</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax (8%)</Text>
              <Text style={styles.summaryValue}>{fmt(tax)}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>{fmt(total)}</Text>
            </View>
          </View>
        </View>

        {/* ── Final price + savings ── */}
        <View style={styles.finalPriceWrap}>
          <View>
            <Text style={styles.finalPriceCaption}>Final Price</Text>
            <Text style={styles.finalPriceValue}>{fmt(total)}</Text>
          </View>
          <View style={styles.savedBadge}>
            <Gift size={12} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.savedBadgeText}>Saved {fmt(saved)}</Text>
          </View>
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ── Place Order Button ── */}
      <View style={[styles.placeOrderWrap, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={styles.placeOrderBtn}
          activeOpacity={0.9}
          onPress={() => router.push('/order-success')}>
          <Text style={styles.placeOrderText}>PLACE ORDER</Text>
          <ArrowRight size={20} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },

  /* Stepper */
  stepperWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  stepItem: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  stepCircleActive: { backgroundColor: '#DC2626' },
  stepCircleInactive: { backgroundColor: '#F3F4F6', borderWidth: 1.5, borderColor: '#D1D5DB' },
  stepNum: { fontSize: 12, fontWeight: '900' },
  stepNumActive: { color: '#FFFFFF' },
  stepNumInactive: { color: '#9CA3AF' },
  stepLabel: { fontSize: 12, fontWeight: '600', marginRight: 6 },
  stepLabelActive: { color: '#111827' },
  stepLabelInactive: { color: '#9CA3AF' },
  stepLine: { flex: 1, height: 1.5, marginHorizontal: 4 },
  stepLineActive: { backgroundColor: '#DC2626' },
  stepLineInactive: { backgroundColor: '#E5E7EB' },

  /* Scroll */
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 6 },

  /* Section */
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  editLink: { fontSize: 14, fontWeight: '700', color: '#DC2626' },

  /* Address */
  addressCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  addressIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(220,38,38,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressDetails: { flex: 1 },
  addressLabel: { fontSize: 14, fontWeight: '800', color: '#111827', marginBottom: 4 },
  addressText: { fontSize: 13, color: '#6B7280', lineHeight: 19, marginBottom: 6 },
  addressPhone: { fontSize: 13, color: '#DC2626', fontWeight: '600' },

  /* Promo */
  promoRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  promoInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
  },
  promoInput: { flex: 1, fontSize: 14, color: '#111827', padding: 0 },
  applyBtn: {
    backgroundColor: '#111827',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
  },
  applyBtnApplied: { backgroundColor: '#16A34A' },
  applyBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },

  /* Payment */
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#DC2626',
    borderRadius: 14,
    padding: 14,
    gap: 12,
    marginBottom: 12,
  },
  payuLogoBox: {
    width: 52,
    height: 36,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  payuLogoText: { fontSize: 15, fontWeight: '900' },
  payuPay: { color: '#00A651' },
  payuU: { color: '#F37021' },
  paymentInfo: { flex: 1 },
  paymentName: { fontSize: 13, fontWeight: '800', color: '#111827', marginBottom: 3 },
  paymentSub: { fontSize: 11, color: '#9CA3AF', fontWeight: '500' },
  radioSelected: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: { width: 11, height: 11, borderRadius: 6, backgroundColor: '#DC2626' },
  paymentNote: { fontSize: 11, color: '#9CA3AF', textAlign: 'center', lineHeight: 16 },

  /* Order summary */
  itemsBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  itemsBadgeText: { fontSize: 12, fontWeight: '800', color: '#DC2626' },
  summaryWrap: { gap: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  summaryValue: { fontSize: 14, fontWeight: '700', color: '#111827' },
  summaryFree: { fontSize: 14, fontWeight: '800', color: '#16A34A' },
  summaryDivider: { height: 1, backgroundColor: '#F3F4F6' },
  totalLabel: { fontSize: 15, fontWeight: '800', color: '#111827' },
  totalValue: { fontSize: 16, fontWeight: '900', color: '#111827' },

  /* Final price */
  finalPriceWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  finalPriceCaption: { fontSize: 12, color: '#9CA3AF', fontWeight: '500', marginBottom: 4 },
  finalPriceValue: { fontSize: 24, fontWeight: '900', color: '#111827' },
  savedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  savedBadgeText: { color: '#FFFFFF', fontWeight: '800', fontSize: 12 },

  /* Place order */
  placeOrderWrap: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  placeOrderBtn: {
    backgroundColor: '#DC2626',
    borderRadius: 16,
    paddingVertical: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  placeOrderText: { color: '#FFFFFF', fontWeight: '900', fontSize: 15, letterSpacing: 1 },
});
