import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Modal, SafeAreaView, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { ChevronLeft, MapPin, Tag, ChevronRight, ArrowRight, Gift } from 'lucide-react-native';
import { useAppState } from '@/contexts/AppStateContext';
import { getAddresses, ApiAddress, createOrder, createPayUOrder, PayUOrderResponse, verifyPayUPayment } from '@/lib/api';
import { useEffect, useState, useCallback } from 'react';

type Step = 1 | 2 | 3;

export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { cartItems, session, isLoggedIn, clearCart } = useAppState();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  const [addresses, setAddresses] = useState<ApiAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<ApiAddress | null>(null);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [payuData, setPayuData] = useState<PayUOrderResponse | null>(null);
  const [verifying, setVerifying] = useState(false);

  const fetchAddresses = async () => {
    if (!session?.token) return;
    try {
      setLoading(true);
      const data = await getAddresses(session.token);
      setAddresses(data);
      if (data.length > 0) {
        const def = data.find(a => a.isDefault) || data[0];
        setSelectedAddress(def);
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAddresses();
    }, [session?.token])
  );

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = 0;
  // Price is tax-inclusive - no tax added to total
  const total = Math.round(subtotal + deliveryFee);
  const gstPercentages = [...new Set(cartItems.map(item => item.gst).filter((g): g is number => typeof g === 'number' && g > 0))];
  const saved = cartItems.reduce((sum, item) => sum + (item.originalPrice - item.price) * item.quantity, 0);

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      Alert.alert('Address Required', 'Please select or add a delivery address.');
      return;
    }

    if (!session?.token) return;

    setPlacingOrder(true);
    try {
      const orderItems = cartItems.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      // 1. Create Order
      const order = await createOrder(session.token, {
        shippingAddressId: selectedAddress.id,
        shippingMethodId: 'default',
        paymentMethodId: 'payu',
        items: orderItems,
      });

      // 2. Initiate PayU Payment
      const payu = await createPayUOrder(session.token, {
        orderId: order.id,
        amount: order.totalAmount,
      });

      setPayuData(payu);
      setShowPaymentModal(true);

    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Order placement failed';
      Alert.alert('Order Failed', msg);
    } finally {
      setPlacingOrder(false);
    }
  };

  const onPaymentNavigationChange = async (navState: any) => {
    const { url } = navState;
    console.log('WebView URL:', url);

    // Check for success/failure redirects
    // The backend redirects to FRONTEND_URL/orders/:id?payment_status=...
    if (url.includes('payment_status=success')) {
      setShowPaymentModal(false);

      // Optional: Verify on backend
      setVerifying(true);
      try {
        if (session?.token && payuData) {
          await verifyPayUPayment(session.token, {
            orderId: payuData.orderId,
            txnid: payuData.txnid,
            // Other fields might be needed if not fully handled by callback
          });
        }
      } catch (e) {
        console.error('Final verification error:', e);
      } finally {
        setVerifying(false);
        // Clear local cart on success
        clearCart && clearCart();
        router.push({
          pathname: '/order-history' as any,
          params: { refresh: 'true' }
        });
        Alert.alert('Success', 'Order placed successfully!');
      }
    } else if (url.includes('payment_status=failure')) {
      setShowPaymentModal(false);
      Alert.alert('Payment Failed', 'Your payment was unsuccessful. Please try again.');
    }
  };

  const getPayUFormHtml = () => {
    if (!payuData) return '';
    const { payuPaymentUrl, formData } = payuData;

    return `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif; }
            .loader { border: 4px solid #f3f3f3; border-top: 4px solid #DC2626; border-radius: 50%; width: 40px; height: 40px; animation: spin 2s linear infinite; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          </style>
        </head>
        <body onload="document.forms[0].submit()">
          <div style="text-align: center;">
            <div class="loader"></div>
            <p style="margin-top: 20px; color: #666;">Redirecting to PayU...</p>
          </div>
          <form action="${payuPaymentUrl}" method="post">
            ${Object.entries(formData).map(([k, v]) => `<input type="hidden" name="${k}" value="${v}" />`).join('\n')}
          </form>
        </body>
      </html>
    `;
  };

  const fmt = (n: number) =>
    '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#DC2626" />
      </View>
    );
  }

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

          {selectedAddress ? (
            <View style={styles.addressCard}>
              <View style={styles.addressIconWrap}>
                <MapPin size={18} color="#DC2626" strokeWidth={2.2} fill="rgba(220,38,38,0.12)" />
              </View>
              <View style={styles.addressDetails}>
                <Text style={styles.addressLabel}>{selectedAddress.name || 'Default Address'}</Text>
                <Text style={styles.addressText}>
                  {selectedAddress.addressLine1}, {selectedAddress.addressLine2 ? selectedAddress.addressLine2 + ', ' : ''}
                  {selectedAddress.city}, {selectedAddress.state} {selectedAddress.zipCode}
                </Text>
                <Text style={styles.addressPhone}>{selectedAddress.phone || 'No phone provided'}</Text>
              </View>
            </View>
          ) : (
            <TouchableOpacity style={styles.addAddressBtn} onPress={() => router.push('/address-management')}>
              <Text style={styles.addAddressText}>+ Add New Address</Text>
            </TouchableOpacity>
          )}
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
              <Text style={styles.itemsBadgeText}>{cartItems.length} Items</Text>
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
            {gstPercentages.length > 0 && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { fontSize: 12, opacity: 0.8 }]}>
                  Price includes GST ({gstPercentages.map(g => `${g}%`).join(', ')})
                </Text>
              </View>
            )}
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
          style={[styles.placeOrderBtn, placingOrder && { opacity: 0.7 }]}
          activeOpacity={0.9}
          onPress={handlePlaceOrder}
          disabled={placingOrder}>
          {placingOrder ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.placeOrderText}>PLACE ORDER</Text>
              <ArrowRight size={20} color="#FFFFFF" strokeWidth={2.5} />
            </>
          )}
        </TouchableOpacity>
      </View>
      {/* ── PayU Payment Modal ── */}
      <Modal
        visible={showPaymentModal}
        animationType="slide"
        onRequestClose={() => {
          if (!verifying) setShowPaymentModal(false);
        }}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowPaymentModal(false)}
              disabled={verifying}
              style={styles.closeBtn}
            >
              <Text style={styles.closeBtnText}>Cancel Payment</Text>
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Secure Payment</Text>
            <View style={{ width: 80 }} />
          </View>

          <WebView
            source={{ html: getPayUFormHtml() }}
            onNavigationStateChange={onPaymentNavigationChange}
            style={{ flex: 1 }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }]}>
                <ActivityIndicator size="large" color="#DC2626" />
              </View>
            )}
          />

          {verifying && (
            <View style={styles.verifyingOverlay}>
              <ActivityIndicator size="large" color="#FFFFFF" />
              <Text style={styles.verifyingText}>Verifying Payment...</Text>
            </View>
          )}
        </SafeAreaView>
      </Modal>
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

  addAddressBtn: {
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#DC2626',
    borderStyle: 'dashed',
    borderRadius: 12,
    alignItems: 'center',
  },
  addAddressText: { color: '#DC2626', fontWeight: '700' },

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

  /* Modal & WebView */
  modalHeader: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  modalHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  closeBtn: {
    paddingVertical: 8,
  },
  closeBtnText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  verifyingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  verifyingText: {
    color: '#FFFFFF',
    marginTop: 15,
    fontSize: 16,
    fontWeight: '700',
  },
});
