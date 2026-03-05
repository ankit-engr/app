/**
 * DealRush Backend API client
 * Base URL: https://backend.dealrushs.com
 */

const BASE_URL = 'https://backend.dealrushs.com';

export function getImageUrl(path: string | null | undefined): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export interface GuestCartSyncItem {
  productId: string;
  quantity: number;
}

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

  // Headers with Auth if available
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export interface GoogleLoginRequest {
  credential: string;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  profilePictureUrl?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface GoogleLoginResponse {
  user: AuthUser;
  token: string;
  isNewUser: boolean;
}

export async function googleLogin(payload: GoogleLoginRequest): Promise<GoogleLoginResponse> {
  const res = await fetchApi<{ success: boolean; data: GoogleLoginResponse; message?: string }>('/api/auth/google-login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!res?.data?.token || !res?.data?.user?.email) {
    throw new Error(res?.message || 'Google login failed');
  }

  return res.data;
}

export interface SendEmailOTPResponse {
  email: string;
  isNewUser: boolean;
  tempToken: string;
}

export async function sendEmailOTP(email: string): Promise<SendEmailOTPResponse> {
  const res = await fetchApi<{ success: boolean; data: SendEmailOTPResponse; message?: string }>(
    '/api/auth/send-email-otp',
    {
      method: 'POST',
      body: JSON.stringify({ email }),
    }
  );

  if (!res.success || !res.data) {
    throw new Error(res.message || 'Failed to send OTP');
  }

  return res.data;
}

export interface VerifyEmailOTPRequest {
  tempToken: string;
  otp: string;
  firstName?: string;
  lastName?: string;
  username?: string;
}

export async function verifyEmailOTP(
  payload: VerifyEmailOTPRequest
): Promise<GoogleLoginResponse> {
  const res = await fetchApi<{ success: boolean; data: GoogleLoginResponse; message?: string }>(
    '/api/auth/verify-email-otp',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );

  if (!res.success || !res.data) {
    throw new Error(res.message || 'OTP verification failed');
  }

  return res.data;
}

// --- Home (matches actual API response) ---
export interface HomePageBanner {
  image: string;
  title: string;
  subtitle: string;
}

/** Product item in home sections (price/oldPrice can be string in JSON) */
export interface HomePageSectionProduct {
  id: string;
  name: string;
  slug?: string | null;
  price: number | string;
  oldPrice?: number | string;
  image: string;
  category?: string;
  rating?: number;
  discount?: number;
  dealTime?: string;
  vendors?: { name: string };
  categories?: { name: string };
  comparePrice?: number;
  effectivePrice?: number;
  stock?: number;
  averageRating?: number;
}

/** Brand/vendor item in brandInFocus section */
export interface HomePageBrand {
  id: string;
  name: string;
  slug: string | null;
  price: number;
  oldPrice: number;
  image: string;
  category: string;
  rating: number;
  discount: number;
  isBrand: boolean;
  description: string | null;
}

export interface HomePageData {
  banners?: {
    hourly?: HomePageBanner;
    premium?: HomePageBanner;
    gaming?: HomePageBanner;
    [key: string]: HomePageBanner | undefined;
  };
  sections?: {
    hero?: HomePageSectionProduct[];
    deal99?: HomePageSectionProduct[];
    hourly?: HomePageSectionProduct[];
    dealOfDay?: HomePageSectionProduct[];
    heavyDiscount?: HomePageSectionProduct[];
    brandInFocus?: HomePageBrand[];
    hotDeals?: HomePageSectionProduct[];
    trending?: HomePageSectionProduct[];
    featured?: HomePageSectionProduct[];
    productsInFocus?: HomePageSectionProduct[];
    preOrder?: HomePageSectionProduct[];
    [key: string]: HomePageSectionProduct[] | HomePageBrand[] | undefined;
  };
}

export async function getHomePage(): Promise<HomePageData> {
  const res = await fetchApi<{ success: boolean; data: HomePageData }>('/api/home-page');
  return res.data || {};
}

export async function syncGuestCartToDatabase(
  items: GuestCartSyncItem[],
  authToken?: string
): Promise<boolean> {
  if (items.length === 0) return true;

  try {
    await fetchApi('/api/users/cart/sync', {
      method: 'POST',
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
      body: JSON.stringify({ items }),
    });
    return true;
  } catch (error) {
    console.warn('Guest cart sync skipped:', error);
    return false;
  }
}

// --- Products & Deals ---
export interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  basePrice?: number;
  comparePrice?: number;
  effectivePrice: number;
  stock?: number;
  image?: string;
  product_images?: { imageUrl: string }[];
  categories?: { name: string };
  vendors?: { name: string };
  brands?: { name: string };
  averageRating?: number;
  title?: string;
  newPrice?: number;
  oldPrice?: number;
  imageTwo?: string;
  href?: string;
  brand?: string;
  reelLink?: string;
  reelFileName?: string;
  [key: string]: unknown;
}

export interface ProductsResponse {
  success: boolean;
  data: {
    products: ApiProduct[];
    pagination?: { page: number; limit: number; total: number; pages: number };
  };
}

export async function getDealOfDay(page = 1, limit = 20): Promise<ApiProduct[]> {
  const res = await fetchApi<ProductsResponse>(
    `/api/products/deals/day-of-deals?page=${page}&limit=${limit}`
  );
  return res.data?.products ?? [];
}

export async function getHeavyDiscount(page = 1, limit = 20): Promise<ApiProduct[]> {
  const res = await fetchApi<ProductsResponse>(
    `/api/products/deals/heavy-discount?page=${page}&limit=${limit}`
  );
  return res.data?.products ?? [];
}

export async function getDeal99(): Promise<ApiProduct[]> {
  const res = await fetchApi<ProductsResponse>('/api/products/deals/99rs');
  return res.data?.products ?? [];
}

export async function getHourlyDeals(page = 1, limit = 20): Promise<ApiProduct[]> {
  const res = await fetchApi<ProductsResponse>(
    `/api/products/deals/hourly?page=${page}&limit=${limit}`
  );
  return res.data?.products ?? [];
}

// --- Reels ---
export async function getReels(page = 1, limit = 50): Promise<ApiProduct[]> {
  const res = await fetchApi<ProductsResponse>(
    `/api/products/reels?page=${page}&limit=${limit}`
  );
  return res.data?.products ?? [];
}

// --- Product detail ---
export interface ProductDetailResponse {
  success: boolean;
  data: {
    product: {
      id: string;
      name: string;
      slug: string;
      description?: string;
      shortDescription?: string;
      price: number;
      basePrice?: number;
      comparePrice?: number;
      effectivePrice: number;
      stock?: number;
      status?: string;
      averageRating?: number;
      weight?: string;
      material?: string;
      features?: string[];
      product_images: { imageUrl: string }[];
      product_variants?: Array<{
        id: string;
        sku: string;
        name: string;
        price: number;
        comparePrice?: number;
        stock?: number;
        isDefault?: boolean;
      }>;
      vendors?: { name: string; logoUrl?: string };
      categories?: { name: string };
    };
    similarProducts?: ApiProduct[];
    sameVendorProducts?: ApiProduct[];
  };
}

export async function getProductById(id: string): Promise<ProductDetailResponse['data'] | null> {
  try {
    const res = await fetchApi<ProductDetailResponse>(`/api/products/${id}`);
    return res.data ?? null;
  } catch {
    return null;
  }
}

export async function getProductBySlug(slug: string): Promise<ProductDetailResponse['data'] | null> {
  try {
    const res = await fetchApi<ProductDetailResponse>(`/api/products/slug/${encodeURIComponent(slug)}`);
    return res.data ?? null;
  } catch {
    return null;
  }
}

// --- Vendors (public) ---
export interface ApiVendor {
  id: string;
  name: string;
  slug?: string;
  description?: string | null;
  logoUrl?: string | null;
  logo_url?: string | null;
  is_featured?: boolean;
  [key: string]: unknown;
}

export async function getVendors(page = 1, limit = 100): Promise<ApiVendor[]> {
  const res = await fetchApi<{ data?: ApiVendor[]; vendors?: ApiVendor[] }>(
    `/api/public/vendors?page=${page}&limit=${limit}`
  );
  const list = res.data ?? res.vendors;
  return Array.isArray(list) ? list : [];
}

// --- Shop filters (for Deals "all" or filtered) ---
export async function getShopItems(body: {
  searchTerm?: string;
  sortOption?: string;
  page?: number;
  limit?: number;
  selectedCategory?: string[];
  categoryIds?: string[];
  selectedBrands?: string[];
  range?: { min: number; max: number };
}): Promise<{ data: ApiProduct[]; totalItems: number; currentPage: number; totalPages: number }> {
  const res = await fetchApi<{
    data: ApiProduct[];
    totalItems: number;
    currentPage: number;
    totalPages: number;
  }>('/api/shopitem', {
    method: 'POST',
    body: JSON.stringify({
      searchTerm: '',
      sortOption: '1',
      page: 1,
      limit: 50,
      selectedCategory: [],
      categoryIds: [],
      selectedBrands: [],
      selectedWeight: [],
      selectedColor: [],
      range: { min: 0, max: 100000 },
      ...body,
    }),
  });
  return {
    data: res.data ?? [],
    totalItems: res.totalItems ?? 0,
    currentPage: res.currentPage ?? 1,
    totalPages: res.totalPages ?? 0,
  };
}

export function toNum(v: number | string | undefined): number {
  if (v === undefined || v === null) return 0;
  return typeof v === 'string' ? parseFloat(v) || 0 : v;
}

/**
 * Map API product (home/deals response) to ProductWithDeal shape for DealCard/DealSection
 */
export function apiProductToProductWithDeal(p: ApiProduct | HomePageSectionProduct): import('@/types/database').ProductWithDeal {
  const apiP = p as ApiProduct;
  const homeP = p as HomePageSectionProduct;
  const imagePath = typeof homeP.image === 'string'
    ? homeP.image
    : (apiP.product_images?.[0]?.imageUrl ?? apiP.image);
  const imageUrl = getImageUrl(imagePath);
  const comparePrice = toNum(apiP.comparePrice ?? apiP.oldPrice ?? homeP.oldPrice ?? homeP.price);
  const effectivePrice = toNum(apiP.effectivePrice ?? apiP.newPrice ?? homeP.price);
  const discountPct = homeP.discount ?? (comparePrice > 0 ? Math.round(((comparePrice - effectivePrice) / comparePrice) * 100) : 0);
  return {
    id: p.id,
    vendor_id: '',
    name: homeP.name ?? apiP.title ?? '',
    description: null,
    price: comparePrice || effectivePrice,
    image_url: imageUrl || null,
    image_urls: apiP.product_images?.map((i) => getImageUrl(i.imageUrl)) ?? (imageUrl ? [imageUrl] : []),
    stock: (apiP as ApiProduct).stock ?? 0,
    is_active: true,
    created_at: '',
    deals: [
      {
        id: `${p.id}-deal`,
        product_id: p.id,
        deal_type: 'discount',
        discount_percentage: discountPct,
        discounted_price: effectivePrice,
        start_date: '',
        end_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        is_active: true,
        created_at: '',
      },
    ],
    vendors: {
      id: '',
      name: (apiP.vendors?.name ?? homeP.vendors?.name ?? apiP.brand ?? '') as string,
      logo_url: null,
      description: null,
      is_featured: false,
      created_at: '',
    },
  };
}

/** Map home-page brand (brandInFocus) to Vendor for VendorCard */
export function homePageBrandToVendor(b: HomePageBrand): import('@/types/database').Vendor {
  return {
    id: b.id,
    name: b.name,
    logo_url: b.image ? getImageUrl(b.image) : null,
    description: b.description ?? null,
    is_featured: false,
    created_at: '',
  };
}

// --- Shop Page ---
export interface ShopPageProduct {
  id: string;
  title: string;
  newPrice: number | string;
  oldPrice: number | string;
  image: string;
  brand: string;
  sale: string;
  rating: number | null;
  slug: string;
  category: string;
}

export interface ShopPageSection {
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  products: ShopPageProduct[];
  categoryName?: string;
}

export interface ShopPageBanner {
  desktopBanner: string;
  mobileBanner: string;
}

export interface ShopPageCategory {
  id: number;
  name: string;
  image: string;
  count: number;
  slug: string;
}

export interface ShopPageData {
  banner: ShopPageBanner;
  bestSellers?: ShopPageSection;
  categoryFocus?: ShopPageSection;
  categories?: ShopPageCategory[];
  [key: string]: unknown;
}

export async function getShopPage(): Promise<ShopPageData> {
  const res = await fetchApi<{ success: boolean; data: ShopPageData }>('/api/shop-page');
  return res.data;
}

export function shopPageProductToProductWithDeal(p: ShopPageProduct): import('@/types/database').ProductWithDeal {
  const price = typeof p.newPrice === 'string' ? parseFloat(p.newPrice) : p.newPrice;
  const oldPrice = typeof p.oldPrice === 'string' ? parseFloat(p.oldPrice) : p.oldPrice;
  const discountPct = oldPrice > 0 ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;

  return {
    id: p.id,
    vendor_id: '',
    name: p.title,
    description: null,
    price: toNum(oldPrice || price),
    image_url: getImageUrl(p.image),
    image_urls: [getImageUrl(p.image)],
    stock: 100,
    is_active: true,
    created_at: '',
    deals: [
      {
        id: `${p.id}-deal`,
        product_id: p.id,
        deal_type: 'discount',
        discount_percentage: discountPct,
        discounted_price: toNum(price),
        start_date: '',
        end_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        is_active: true,
        created_at: '',
      },
    ],
    vendors: {
      id: '',
      name: p.brand,
      logo_url: null,
      description: null,
      is_featured: false,
      created_at: '',
    },
  };
}

// --- Protected API Utilities ---
function getAuthHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

// --- Profile API ---
export interface CompleteProfileResponse {
  user: AuthUser;
  totalOrders: number;
  wishlistCount: number;
  cartCount: number;
}

export async function getProfile(token: string): Promise<CompleteProfileResponse> {
  const res = await fetchApi<{ success: boolean; data: any }>('/api/users/profile/complete', {
    headers: getAuthHeaders(token),
  });

  // Mapping backend structure to match ProfileScreen needs
  const d = res.data;
  return {
    user: d.user,
    totalOrders: d.orders?.total || 0,
    wishlistCount: d.wishlist?.count || 0,
    cartCount: d.cart?.itemCount || 0,
  };
}

export async function updateProfile(token: string, payload: Partial<AuthUser>): Promise<AuthUser> {
  const res = await fetchApi<{ success: boolean; data: { user: AuthUser } }>('/api/users/profile', {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  });
  return res.data.user;
}

// --- Address API ---
export interface ApiAddress {
  id: string;
  userId: string;
  name?: string;
  phone?: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  latitude?: number | null;
  longitude?: number | null;
}

export async function getAddresses(token: string): Promise<ApiAddress[]> {
  const res = await fetchApi<{ success: boolean; data: { addresses: ApiAddress[] } }>('/api/users/addresses', {
    headers: getAuthHeaders(token),
  });
  return res.data.addresses;
}

export async function createAddress(token: string, address: Omit<ApiAddress, 'id' | 'userId'>): Promise<ApiAddress> {
  const res = await fetchApi<{ success: boolean; data: { address: ApiAddress } }>('/api/users/addresses', {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(address),
  });
  return res.data.address;
}

export async function updateAddress(token: string, id: string, address: Partial<ApiAddress>): Promise<ApiAddress> {
  const res = await fetchApi<{ success: boolean; data: { address: ApiAddress } }>(`/api/users/addresses/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify(address),
  });
  return res.data.address;
}

export async function deleteAddress(token: string, id: string): Promise<void> {
  await fetchApi(`/api/users/addresses/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  });
}

// --- Cart API ---
export interface BackendCartItem {
  id: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  products: {
    id: string;
    name: string;
    price: number;
    effectivePrice?: number;
    basePrice?: number;
    originalPrice?: number;
    activeDealType?: string | null;
    gst?: number;
    product_images?: { imageUrl: string }[];
    vendors?: { name: string };
  };
  product_variants?: {
    id: string;
    name: string;
    additionalPrice: number;
  };
  unitPrice: number;
  itemTotal: number;
}

export async function getCart(token: string): Promise<{ cartItems: BackendCartItem[]; total: number }> {
  const res = await fetchApi<{ success: boolean; data: { cartItems: BackendCartItem[]; total: number } }>(
    '/api/users/cart',
    {
      headers: getAuthHeaders(token),
    }
  );
  return res.data;
}

export async function addToCartApi(
  token: string,
  payload: { productId: string; variantId?: string | null; quantity: number }
): Promise<BackendCartItem> {
  const res = await fetchApi<{ success: boolean; data: { cartItem: BackendCartItem } }>('/api/users/cart', {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  });
  return res.data.cartItem;
}

export async function updateCartItemQuantityApi(token: string, id: string, quantity: number): Promise<void> {
  await fetchApi(`/api/users/cart/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ quantity }),
  });
}

export async function removeCartItemApi(token: string, id: string): Promise<void> {
  await fetchApi(`/api/users/cart/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  });
}

// --- Orders API ---
export interface ApiOrder {
  id: string;
  orderNumber: string;
  totalAmount: number;
  orderStatus: string;
  createdAt: string;
  order_items: Array<{
    id: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    products: {
      name: string;
      product_images?: { imageUrl: string }[];
    };
  }>;
  order_addresses?: ApiAddress;
}

export async function getOrders(token: string): Promise<ApiOrder[]> {
  const res = await fetchApi<{ success: boolean; data: { orders: ApiOrder[] } }>('/api/users/orders', {
    headers: getAuthHeaders(token),
  });
  return res.data.orders;
}

export async function getOrderByIdApi(token: string, id: string): Promise<ApiOrder> {
  const res = await fetchApi<{ success: boolean; data: { order: ApiOrder } }>(`/api/users/orders/${id}`, {
    headers: getAuthHeaders(token),
  });
  return res.data.order;
}

export async function createOrder(
  token: string,
  payload: any
): Promise<ApiOrder> {
  const res = await fetchApi<{ success: boolean; data: { order: ApiOrder } }>('/api/users/orders', {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  });
  return res.data.order;
}

// --- Wishlist API ---
export async function getWishlist(token: string): Promise<any[]> {
  const res = await fetchApi<{ success: boolean; data: { wishlistItems: any[] } }>('/api/users/wishlist', {
    headers: getAuthHeaders(token),
  });
  return res.data.wishlistItems;
}

export async function toggleWishlist(token: string, productId: string): Promise<void> {
  // Logic usually involves checking if in wishlist, but the backend uses upsert/delete
  // For simplicity, we just provide the add call here.
  await fetchApi('/api/users/wishlist', {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ productId }),
  });
}

// --- PayU Payment API ---
export interface PayUOrderResponse {
  payuPaymentUrl: string;
  formData: {
    key: string;
    txnid: string;
    amount: string;
    productinfo: string;
    firstname: string;
    email: string;
    phone: string;
    surl: string;
    furl: string;
    hash: string;
    udf1: string;
    service_provider: string;
  };
  txnid: string;
  amount: number;
  currency: string;
  orderId: string;
}

export async function createPayUOrder(
  token: string,
  payload: { orderId: string, amount: number, currency?: string }
): Promise<PayUOrderResponse> {
  const res = await fetchApi<{ success: boolean; data: PayUOrderResponse }>('/api/users/payu/create-order', {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function verifyPayUPayment(
  token: string,
  payload: any
): Promise<any> {
  const res = await fetchApi<{ success: boolean; data: any }>('/api/users/payu/verify-payment', {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  });
  return res.data;
}
