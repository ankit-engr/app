import { View, Text, StyleSheet, Image, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, Star, TrendingUp, ArrowRight, Heart, Share2 } from 'lucide-react-native';
import { useAppState } from '@/contexts/AppStateContext';
import { useToast } from '@/contexts/ToastContext';

const { width } = Dimensions.get('window');

const DUMMY_IMAGE = require('@/assets/images/daily_space_header_1770529735437.png');

const DAILY_PICKS = [
    {
        id: '1',
        name: 'Cosmic Headphones',
        price: '₹2,499',
        oldPrice: '₹4,999',
        discount: '50% OFF',
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop',
    },
    {
        id: '2',
        name: 'Galaxy Smart Watch',
        price: '₹3,999',
        oldPrice: '₹7,999',
        discount: '50% OFF',
        rating: 4.6,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop',
    },
    {
        id: '3',
        name: 'Nebula Sneakers',
        price: '₹1,299',
        oldPrice: '₹2,599',
        discount: '50% OFF',
        rating: 4.5,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop',
    },
];

export default function DailySpaceSection() {
    const { addToCart, cartItems, updateCartItemQuantity } = useAppState();
    const { showToast } = useToast();

    const getCartId = (itemId: string) => `daily-pick-${itemId}`;
    const getQty = (itemId: string) => cartItems.find((x) => x.id === getCartId(itemId))?.quantity ?? 0;

    const handleAddToCart = (item: (typeof DAILY_PICKS)[number]) => {
        const price = Number(item.price.replace(/[^\d]/g, '')) || 0;
        const originalPrice = Number(item.oldPrice.replace(/[^\d]/g, '')) || price;

        addToCart({
            id: getCartId(item.id),
            name: item.name,
            image: item.image,
            price,
            originalPrice,
            quantity: 1,
            dealType: 'daily',
        });

        showToast({
            title: 'Added to cart',
            message: `${item.name} added`,
            type: 'success',
        });
    };

    const handleDecrement = (itemId: string) => {
        const currentQty = getQty(itemId);
        if (currentQty <= 0) return;
        updateCartItemQuantity(getCartId(itemId), currentQty - 1);
    };

    return (
        <View style={styles.container}>
            {/* Header Section */}
            <View style={styles.headerContainer}>
                <LinearGradient
                    colors={['#4F46E5', '#7C3AED']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.headerGradient}
                >
                    <View style={styles.headerContent}>
                        <View>
                            <Text style={styles.headerTitle}>Daily Space</Text>
                            <Text style={styles.headerSubtitle}>Curated picks just for you</Text>
                        </View>
                        <View style={styles.timerContainer}>
                            <Clock size={14} color="#FFFFFF" />
                            <Text style={styles.timerText}>Ends in 08:45:12</Text>
                        </View>
                    </View>
                </LinearGradient>

                {/* Featured Banner */}
                <View style={styles.bannerContainer}>
                    <Image source={DUMMY_IMAGE} style={styles.bannerImage} resizeMode="cover" />
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.7)']}
                        style={styles.bannerOverlay}
                    >
                        <Text style={styles.bannerText}>Today's Exclusive Collection</Text>
                        <TouchableOpacity style={styles.exploreBtn}>
                            <Text style={styles.exploreBtnText}>Explore Now</Text>
                            <ArrowRight size={16} color="#4F46E5" />
                        </TouchableOpacity>
                    </LinearGradient>
                </View>
            </View>

            {/* Daily Picks Grid */}
            <View style={styles.picksContainer}>
                <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitleRow}>
                        <Star size={20} color="#F59E0B" fill="#F59E0B" />
                        <Text style={styles.sectionTitle}>Top Picks</Text>
                    </View>
                    <TouchableOpacity>
                        <Text style={styles.seeAllText}>See All</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.picksScroll}>
                    {DAILY_PICKS.map((item) => (
                        <View key={item.id} style={styles.productCard}>
                            <View style={styles.imageContainer}>
                                <Image source={{ uri: item.image }} style={styles.productImage} />
                                <View style={styles.discountBadge}>
                                    <Text style={styles.discountText}>{item.discount}</Text>
                                </View>
                                <TouchableOpacity style={styles.heartBtn}>
                                    <Heart size={16} color="#DC2626" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.productInfo}>
                                <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                                <View style={styles.ratingRow}>
                                    <Star size={12} color="#F59E0B" fill="#F59E0B" />
                                    <Text style={styles.ratingText}>{item.rating}</Text>
                                </View>
                                <View style={styles.priceRow}>
                                    <Text style={styles.price}>{item.price}</Text>
                                    <Text style={styles.oldPrice}>{item.oldPrice}</Text>
                                </View>

                                {getQty(item.id) === 0 ? (
                                    <TouchableOpacity style={styles.addToCartBtn} onPress={() => handleAddToCart(item)}>
                                        <Text style={styles.addToCartText}>Add to Cart</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <View style={styles.qtyWrap}>
                                        <TouchableOpacity style={styles.qtyBtn} onPress={() => handleDecrement(item.id)}>
                                            <Text style={styles.qtyBtnText}>−</Text>
                                        </TouchableOpacity>
                                        <Text style={styles.qtyText}>{getQty(item.id)}</Text>
                                        <TouchableOpacity style={styles.qtyBtn} onPress={() => handleAddToCart(item)}>
                                            <Text style={styles.qtyBtnText}>+</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </View>
                    ))}
                </ScrollView>
            </View>

            {/* Trending Category */}
            <View style={styles.trendingContainer}>
                <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitleRow}>
                        <TrendingUp size={20} color="#10B981" />
                        <Text style={styles.sectionTitle}>Trending Now</Text>
                    </View>
                </View>

                <View style={styles.trendingCard}>
                    <LinearGradient
                        colors={['#1F2937', '#111827']}
                        style={styles.trendingGradient}
                    >
                        <View style={styles.trendingContent}>
                            <Text style={styles.trendingTitle}>Space Age Tech</Text>
                            <Text style={styles.trendingDesc}>Discover the future of gadgets today.</Text>
                            <TouchableOpacity style={styles.trendingBtn}>
                                <Text style={styles.trendingBtnText}>View Collection</Text>
                            </TouchableOpacity>
                        </View>
                        <Image
                            source={{ uri: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=1000&auto=format&fit=crop' }}
                            style={styles.trendingImage}
                        />
                    </LinearGradient>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 16,
        backgroundColor: '#FFFFFF',
        paddingBottom: 16,
    },
    headerContainer: {
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    headerGradient: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
    },
    timerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 6,
    },
    timerText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    bannerContainer: {
        height: 180,
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
        marginTop: -8, // slight overlap if desired, or keep as separate block
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    bannerImage: {
        width: '100%',
        height: '100%',
    },
    bannerOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        paddingTop: 40,
    },
    bannerText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 10,
    },
    exploreBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        alignSelf: 'flex-start',
        gap: 6,
    },
    exploreBtnText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#4F46E5',
    },
    picksContainer: {
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    seeAllText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4F46E5',
    },
    picksScroll: {
        paddingHorizontal: 16,
        gap: 12,
    },
    productCard: {
        width: 150,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        overflow: 'hidden',
    },
    imageContainer: {
        position: 'relative',
        height: 150,
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    discountBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: '#DC2626',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    discountText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    heartBtn: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(255,255,255,0.9)',
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    productInfo: {
        padding: 10,
    },
    productName: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 4,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 4,
    },
    ratingText: {
        fontSize: 11,
        color: '#6B7280',
        fontWeight: '500',
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 6,
        marginBottom: 8,
    },
    price: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111827',
    },
    oldPrice: {
        fontSize: 11,
        color: '#9CA3AF',
        textDecorationLine: 'line-through',
    },
    addToCartBtn: {
        backgroundColor: '#F3F4F6',
        paddingVertical: 6,
        borderRadius: 6,
        alignItems: 'center',
    },
    addToCartText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#374151',
    },
    qtyWrap: {
        height: 30,
        backgroundColor: '#F3F4F6',
        borderRadius: 6,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        overflow: 'hidden',
    },
    qtyBtn: {
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    qtyBtnText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#374151',
        lineHeight: 20,
    },
    qtyText: {
        minWidth: 22,
        textAlign: 'center',
        fontSize: 13,
        fontWeight: '700',
        color: '#111827',
    },
    trendingContainer: {
        paddingHorizontal: 16,
    },
    trendingCard: {
        height: 140,
        borderRadius: 16,
        overflow: 'hidden',
    },
    trendingGradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    trendingContent: {
        flex: 1,
        zIndex: 1,
    },
    trendingTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    trendingDesc: {
        fontSize: 12,
        color: '#D1D5DB',
        marginBottom: 12,
    },
    trendingBtn: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    trendingBtnText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#111827',
    },
    trendingImage: {
        width: 120,
        height: 120,
        borderRadius: 12,
        transform: [{ rotate: '15deg' }, { translateX: 20 }],
    },
});
