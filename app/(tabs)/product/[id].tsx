import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Heart, Share2, ShoppingCart, Star } from 'lucide-react-native';
import { getProductById, getProductBySlug, getImageUrl, type ProductDetailResponse } from '@/lib/api';
import ProductImageGallery from '@/components/ProductImageGallery';
import { useAppState } from '@/contexts/AppStateContext';
import { useToast } from '@/contexts/ToastContext';

type ProductDetailData = NonNullable<ProductDetailResponse['data']>;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function formatTwo(n: number) {
  return String(clamp(Math.floor(n), 0, 99)).padStart(2, '0');
}

function extractColorName(label: string): string | null {
  const clean = label.replace(/\s+/g, ' ').trim();
  if (!clean) return null;
  const parts = clean.split(/[-|/]/g).map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return null;
  return parts[parts.length - 1] ?? null;
}

function colorToHex(name: string): string | null {
  const n = name.toLowerCase().trim();
  const map: Record<string, string> = {
    black: '#0B1220',
    white: '#FFFFFF',
    red: '#EF4444',
    blue: '#3B82F6',
    green: '#22C55E',
    yellow: '#F59E0B',
    orange: '#F97316',
    purple: '#8B5CF6',
    pink: '#EC4899',
    gray: '#9CA3AF',
    grey: '#9CA3AF',
    silver: '#C0C0C0',
    gold: '#D4AF37',
    brown: '#8B5E34',
    navy: '#1E3A8A',
  };
  return map[n] ?? null;
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { addToCart, cartItems, updateCartItemQuantity } = useAppState();
  const { showToast } = useToast();
  const [detail, setDetail] = useState<ProductDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [pendingQuantity, setPendingQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const dealEndsAtRef = useRef<Date>(new Date(Date.now() + 24 * 60 * 60 * 1000));
  const [, forceTick] = useState(0);

  const images = useMemo(() => {
    const list = (detail?.product?.product_images ?? [])
      .map((i) => getImageUrl(i.imageUrl))
      .filter(Boolean);
    return list.length > 0 ? list : [];
  }, [detail?.product?.product_images]);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  useEffect(() => {
    const timer = setInterval(() => forceTick((t) => (t + 1) % 1000000), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchProduct = async () => {
    if (!id) return;

    try {
      let data = await getProductById(id);
      if (!data && id && !id.includes('-')) {
        data = await getProductBySlug(id);
      }
      setDetail(data ?? null);
      const variants = data?.product?.product_variants ?? [];
      const defaultVariant = variants.find((v) => v.isDefault) ?? variants[0];
      setSelectedVariantId(defaultVariant?.id ?? null);
    } catch (error) {
      console.error('Error fetching product:', error);
      setDetail(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#DC2626" />
        </View>
      </SafeAreaView>
    );
  }

  if (!detail) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.simpleHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <ArrowLeft size={22} color="#111827" />
          </TouchableOpacity>
        </View>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Product not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const p = detail.product;
  const vendorName = p.vendors?.name ?? '';
  const categoryName = p.categories?.name ?? '';

  const comparePrice = p.comparePrice ?? p.price;
  const effectivePrice = p.effectivePrice ?? p.price;
  const discountPct =
    comparePrice > 0 ? Math.round(((comparePrice - effectivePrice) / comparePrice) * 100) : 0;

  const variants = p.product_variants ?? [];
  const selectedVariant = variants.find((v) => v.id === selectedVariantId) ?? null;

  const endsAt = dealEndsAtRef.current;
  const remainingMs = Math.max(0, endsAt.getTime() - Date.now());
  const remainingSec = Math.floor(remainingMs / 1000);
  const hours = Math.floor(remainingSec / 3600);
  const minutes = Math.floor((remainingSec % 3600) / 60);
  const seconds = remainingSec % 60;

  const subtitle = (categoryName || vendorName).toUpperCase();
  const displayRating = clamp(p.averageRating ?? 4.9, 0, 5);
  const ratingStars = Math.round(displayRating);
  const primaryImage = images[0] ?? getImageUrl(p.product_images?.[0]?.imageUrl ?? '');
  const cartItemId = selectedVariant ? `${p.id}:${selectedVariant.id}` : p.id;
  const cartQuantity = cartItems.find((item) => item.id === cartItemId)?.quantity ?? 0;
  const displayQuantity = cartQuantity > 0 ? cartQuantity : pendingQuantity;

  const incrementQuantity = () => {
    if (cartQuantity > 0) {
      updateCartItemQuantity(cartItemId, cartQuantity + 1);
      return;
    }
    setPendingQuantity((q) => Math.min(99, q + 1));
  };

  const decrementQuantity = () => {
    if (cartQuantity > 0) {
      updateCartItemQuantity(cartItemId, cartQuantity - 1);
      return;
    }
    setPendingQuantity((q) => Math.max(1, q - 1));
  };

  const handleAddToCart = () => {
    const variantSuffix = selectedVariant ? ` (${selectedVariant.name})` : '';

    addToCart({
      id: cartItemId,
      name: `${p.name}${variantSuffix}`,
      image: primaryImage || 'https://picsum.photos/300',
      price: Math.round(effectivePrice),
      originalPrice: Math.round(comparePrice),
      quantity: pendingQuantity,
      dealType: null,
    });

    showToast({
      title: 'Added to cart',
      message: `${pendingQuantity} item${pendingQuantity > 1 ? 's' : ''}${selectedVariant ? ` • ${selectedVariant.name}` : ''}`,
      type: 'success',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <ProductImageGallery images={images} initialIndex={0} />

          <View style={styles.heroTopBar}>
            <TouchableOpacity onPress={() => router.back()} style={styles.heroIconBtn}>
              <ArrowLeft size={22} color="#111827" />
            </TouchableOpacity>
            <View style={styles.heroActions}>
              <TouchableOpacity
                onPress={() => Alert.alert('Share', 'Share link coming soon.')}
                style={styles.heroIconBtn}>
                <Share2 size={20} color="#111827" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddToCart}
                style={styles.heroIconBtn}>
                <ShoppingCart size={20} color="#111827" />
              </TouchableOpacity>
            </View>
          </View>

          {discountPct > 0 ? (
            <View style={styles.heroBadges}>
              <View style={styles.badgeRed}>
                <Text style={styles.badgeRedText}>-{discountPct}% OFF</Text>
              </View>
            </View>
          ) : null}
        </View>

        <View style={styles.content}>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          <Text style={styles.title}>{p.name}</Text>

          <View style={styles.priceBlock}>
            <View style={styles.priceRowNew}>
              <Text style={styles.priceNow}>₹{Math.round(effectivePrice)}</Text>
              {comparePrice > effectivePrice ? (
                <Text style={styles.priceWas}>₹{Math.round(comparePrice)}</Text>
              ) : null}
            </View>
            <Text style={styles.priceHint}>LIMITED RELEASE PRICING</Text>

            {discountPct > 0 ? (
              <View style={styles.endsInRow}>
                <Text style={styles.endsInLabel}>ENDS IN</Text>
                <View style={styles.timer}>
                  <View style={styles.timerBox}>
                    <Text style={styles.timerVal}>{formatTwo(hours)}</Text>
                  </View>
                  <Text style={styles.timerSep}>:</Text>
                  <View style={styles.timerBox}>
                    <Text style={styles.timerVal}>{formatTwo(minutes)}</Text>
                  </View>
                  <Text style={styles.timerSep}>:</Text>
                  <View style={styles.timerBox}>
                    <Text style={styles.timerVal}>{formatTwo(seconds)}</Text>
                  </View>
                </View>
              </View>
            ) : null}
          </View>

          {variants.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>SELECT OPTION</Text>
              <View style={styles.swatchRow}>
                {variants.slice(0, 6).map((v) => {
                  const colorName = extractColorName(v.name) ?? v.name;
                  const hex = colorName ? colorToHex(colorName) : null;
                  const active = v.id === selectedVariantId;
                  const bg = hex ?? '#F3F4F6';
                  const textColor = hex ? (hex === '#FFFFFF' ? '#111827' : '#FFFFFF') : '#111827';
                  return (
                    <TouchableOpacity
                      key={v.id}
                      onPress={() => setSelectedVariantId(v.id)}
                      style={[styles.swatchWrap, active && styles.swatchWrapActive]}
                      activeOpacity={0.85}>
                      <View style={[styles.swatch, { backgroundColor: bg, borderColor: hex ? '#E5E7EB' : '#D1D5DB' }]}>
                        {!hex ? (
                          <Text style={[styles.swatchLetter, { color: textColor }]}>
                            {(colorName ?? 'O').slice(0, 1).toUpperCase()}
                          </Text>
                        ) : null}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {selectedVariant ? (
                <Text style={styles.selectedVariantText}>{selectedVariant.name}</Text>
              ) : null}
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>QUANTITY</Text>
            <View style={styles.qtyRow}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={decrementQuantity}
                activeOpacity={0.8}>
                <Text style={styles.qtyBtnText}>–</Text>
              </TouchableOpacity>
              <View style={styles.qtyVal}>
                <Text style={styles.qtyValText}>{displayQuantity}</Text>
              </View>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={incrementQuantity}
                activeOpacity={0.8}>
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider} />

          {(p.shortDescription || p.description) ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitleItalic}>PRODUCT DESCRIPTION</Text>
              <Text style={styles.bodyText} numberOfLines={descriptionExpanded ? undefined : 4}>
                {p.shortDescription ?? p.description ?? ''}
              </Text>
              {(p.description ?? '').length > 160 ? (
                <TouchableOpacity
                  onPress={() => setDescriptionExpanded((v) => !v)}
                  style={styles.seeMoreBtn}
                  activeOpacity={0.85}>
                  <Text style={styles.seeMoreText}>{descriptionExpanded ? 'See less' : 'See more'}</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitleItalic}>TECHNICAL SPECS</Text>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Vendor</Text>
              <Text style={styles.specValue}>{vendorName || '—'}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Category</Text>
              <Text style={styles.specValue}>{categoryName || '—'}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Material</Text>
              <Text style={styles.specValue}>{p.material || '—'}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Weight</Text>
              <Text style={styles.specValue}>{p.weight || '—'}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Stock</Text>
              <Text style={styles.specValue}>{String(selectedVariant?.stock ?? p.stock ?? '—')}</Text>
            </View>
            {selectedVariant?.sku ? (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>SKU</Text>
                <Text style={styles.specValue}>{selectedVariant.sku}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitleItalic}>SELLER RATING</Text>
            <View style={styles.sellerRow}>
              <View style={styles.sellerStars}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star
                    key={i}
                    size={14}
                    color={i < ratingStars ? '#F59E0B' : '#E5E7EB'}
                    fill={i < ratingStars ? '#F59E0B' : '#E5E7EB'}
                  />
                ))}
              </View>
              <Text style={styles.sellerRatingText}>{displayRating.toFixed(1)}</Text>
              <Text style={styles.sellerReviewsText}>(— reviews)</Text>
            </View>
            <Text style={styles.sellerHint}>
              {vendorName ? `${vendorName} · ` : ''}Official DealRush Authorized Store
            </Text>
          </View>

          <View style={styles.bottomPadding} />
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          onPress={() => setIsFavorite((v) => !v)}
          style={styles.favBtn}
          activeOpacity={0.85}>
          <Heart
            size={20}
            color={isFavorite ? '#DC2626' : '#9CA3AF'}
            fill={isFavorite ? '#DC2626' : 'transparent'}
          />
        </TouchableOpacity>
        {cartQuantity > 0 ? (
          <View style={styles.ctaQtyWrap}>
            <TouchableOpacity style={styles.ctaQtyBtn} onPress={decrementQuantity} activeOpacity={0.85}>
              <Text style={styles.ctaQtyBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.ctaQtyText}>{cartQuantity}</Text>
            <TouchableOpacity style={styles.ctaQtyBtn} onPress={incrementQuantity} activeOpacity={0.85}>
              <Text style={styles.ctaQtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.ctaBtn}
            activeOpacity={0.9}
            onPress={handleAddToCart}>
            <Text style={styles.ctaText}>ADD TO CART</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  simpleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: 16,
    color: '#6B7280',
  },
  scrollView: {
    flex: 1,
  },
  hero: {
    position: 'relative',
    backgroundColor: '#FFFFFF',
  },
  heroTopBar: {
    position: 'absolute',
    top: 10,
    left: 16,
    right: 16,
    zIndex: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroActions: {
    flexDirection: 'row',
    gap: 10,
  },
  heroIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  heroBadges: {
    position: 'absolute',
    top: 58,
    left: 16,
    zIndex: 5,
    gap: 8,
  },
  badgeDark: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.78)',
  },
  badgeDarkText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.6,
  },
  badgeRed: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#EF4444',
  },
  badgeRedText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.4,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  subtitle: {
    color: '#DC2626',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 3,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 10,
  },
  priceBlock: {
    paddingBottom: 14,
  },
  priceRowNew: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    marginBottom: 4,
  },
  priceNow: {
    color: '#DC2626',
    fontSize: 30,
    fontWeight: '900',
  },
  priceWas: {
    color: '#9CA3AF',
    fontSize: 16,
    textDecorationLine: 'line-through',
    paddingBottom: 4,
  },
  priceHint: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  endsInRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  endsInLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: 0.8,
  },
  timer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timerBox: {
    minWidth: 34,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  timerVal: {
    fontWeight: '900',
    color: '#EF4444',
    fontSize: 14,
  },
  timerSep: {
    fontWeight: '900',
    color: '#EF4444',
    fontSize: 14,
    paddingBottom: 2,
  },
  section: {
    marginTop: 18,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: 0.9,
    marginBottom: 10,
  },
  sectionTitleItalic: {
    fontSize: 12,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: 1.1,
    fontStyle: 'italic',
    marginBottom: 10,
  },
  swatchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  swatchWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchWrapActive: {
    borderColor: '#111827',
  },
  swatch: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  swatchLetter: {
    fontSize: 10,
    fontWeight: '900',
  },
  selectedVariantText: {
    marginTop: 10,
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '600',
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    overflow: 'hidden',
  },
  qtyBtn: {
    width: 44,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#DC2626',
  },
  qtyVal: {
    minWidth: 44,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  qtyValText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginTop: 20,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4B5563',
  },
  seeMoreBtn: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  seeMoreText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#DC2626',
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  specLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '700',
  },
  specValue: {
    fontSize: 12,
    color: '#111827',
    fontWeight: '800',
    textAlign: 'right',
    maxWidth: '62%',
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  sellerStars: {
    flexDirection: 'row',
    gap: 3,
  },
  sellerRatingText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#EF4444',
  },
  sellerReviewsText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '700',
  },
  sellerHint: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '700',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  favBtn: {
    width: 46,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  ctaBtn: {
    flex: 1,
    height: 46,
    backgroundColor: '#DC2626',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaText: {
    color: '#FFFFFF',
    fontWeight: '900',
    letterSpacing: 1.0,
    fontSize: 14,
  },
  ctaQtyWrap: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  ctaQtyBtn: {
    width: 54,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaQtyBtnText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 28,
  },
  ctaQtyText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    minWidth: 32,
    textAlign: 'center',
  },
  bottomPadding: {
    height: 26,
  },
});
