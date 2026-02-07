export interface Vendor {
  id: string;
  name: string;
  logo_url: string | null;
  description: string | null;
  is_featured: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  vendor_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  image_urls: string[];
  stock: number;
  is_active: boolean;
  created_at: string;
}

export interface Deal {
  id: string;
  product_id: string;
  deal_type: 'deal_of_day' | 'discount' | 'brand_focus' | 'product_focus' | 'pre_launch';
  discount_percentage: number;
  discounted_price: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

export interface Reel {
  id: string;
  product_id: string | null;
  vendor_id: string | null;
  video_url: string;
  thumbnail_url: string | null;
  title: string;
  description: string | null;
  views_count: number;
  likes_count: number;
  is_active: boolean;
  created_at: string;
}

export interface LiveShoppingSession {
  id: string;
  vendor_id: string;
  title: string;
  description: string | null;
  stream_url: string | null;
  thumbnail_url: string | null;
  scheduled_at: string;
  started_at: string | null;
  ended_at: string | null;
  status: 'scheduled' | 'live' | 'ended';
  viewers_count: number;
  created_at: string;
}

export interface ProductWithDeal extends Product {
  deals: Deal[];
  vendors: Vendor;
}

export interface ReelWithDetails extends Reel {
  products: Product | null;
  vendors: Vendor | null;
}

export interface LiveSessionWithVendor extends LiveShoppingSession {
  vendors: Vendor;
}
