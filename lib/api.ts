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

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  return res.json();
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

function toNum(v: number | string | undefined): number {
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
