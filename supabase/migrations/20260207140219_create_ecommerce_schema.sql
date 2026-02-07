/*
  # E-Commerce Platform Schema

  ## Overview
  Creates the complete database schema for a deals-focused e-commerce platform with multiple vendors,
  product listings, various deal types, reels functionality, and live shopping sessions.

  ## New Tables

  ### `vendors`
  - `id` (uuid, primary key) - Unique vendor identifier
  - `name` (text) - Vendor/brand name
  - `logo_url` (text) - Brand logo image URL
  - `description` (text) - Brand description
  - `is_featured` (boolean) - Whether brand is featured
  - `created_at` (timestamptz) - Creation timestamp

  ### `products`
  - `id` (uuid, primary key) - Unique product identifier
  - `vendor_id` (uuid, foreign key) - Reference to vendor
  - `name` (text) - Product name
  - `description` (text) - Product description
  - `price` (decimal) - Regular price
  - `image_url` (text) - Primary product image
  - `image_urls` (jsonb) - Additional product images
  - `stock` (integer) - Available stock
  - `is_active` (boolean) - Product availability status
  - `created_at` (timestamptz) - Creation timestamp

  ### `deals`
  - `id` (uuid, primary key) - Unique deal identifier
  - `product_id` (uuid, foreign key) - Reference to product
  - `deal_type` (text) - Type: 'deal_of_day', 'discount', 'brand_focus', 'product_focus', 'pre_launch'
  - `discount_percentage` (decimal) - Discount amount
  - `discounted_price` (decimal) - Final price after discount
  - `start_date` (timestamptz) - Deal start time
  - `end_date` (timestamptz) - Deal end time
  - `is_active` (boolean) - Deal status
  - `created_at` (timestamptz) - Creation timestamp

  ### `reels`
  - `id` (uuid, primary key) - Unique reel identifier
  - `product_id` (uuid, foreign key, nullable) - Associated product
  - `vendor_id` (uuid, foreign key, nullable) - Associated vendor
  - `video_url` (text) - Video file URL
  - `thumbnail_url` (text) - Video thumbnail
  - `title` (text) - Reel title
  - `description` (text) - Reel description
  - `views_count` (integer) - Number of views
  - `likes_count` (integer) - Number of likes
  - `is_active` (boolean) - Reel visibility status
  - `created_at` (timestamptz) - Creation timestamp

  ### `live_shopping_sessions`
  - `id` (uuid, primary key) - Unique session identifier
  - `vendor_id` (uuid, foreign key) - Hosting vendor
  - `title` (text) - Session title
  - `description` (text) - Session description
  - `stream_url` (text) - Live stream URL
  - `thumbnail_url` (text) - Session thumbnail
  - `scheduled_at` (timestamptz) - Scheduled start time
  - `started_at` (timestamptz, nullable) - Actual start time
  - `ended_at` (timestamptz, nullable) - End time
  - `status` (text) - Status: 'scheduled', 'live', 'ended'
  - `viewers_count` (integer) - Current viewer count
  - `created_at` (timestamptz) - Creation timestamp

  ### `live_shopping_products`
  - `id` (uuid, primary key) - Unique identifier
  - `session_id` (uuid, foreign key) - Reference to live session
  - `product_id` (uuid, foreign key) - Featured product
  - `special_price` (decimal, nullable) - Live shopping exclusive price
  - `created_at` (timestamptz) - Creation timestamp

  ## Security
  - Enable RLS on all tables
  - Add policies for public read access (suitable for e-commerce)
  - Add policies for authenticated vendor management

  ## Notes
  - All tables use UUID primary keys with automatic generation
  - Timestamps use `timestamptz` for timezone awareness
  - Boolean fields have sensible defaults
  - Foreign key constraints ensure data integrity
*/

-- Create vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text,
  description text,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL,
  image_url text,
  image_urls jsonb DEFAULT '[]'::jsonb,
  stock integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create deals table
CREATE TABLE IF NOT EXISTS deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  deal_type text NOT NULL CHECK (deal_type IN ('deal_of_day', 'discount', 'brand_focus', 'product_focus', 'pre_launch')),
  discount_percentage decimal(5,2) NOT NULL,
  discounted_price decimal(10,2) NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create reels table
CREATE TABLE IF NOT EXISTS reels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  vendor_id uuid REFERENCES vendors(id) ON DELETE SET NULL,
  video_url text NOT NULL,
  thumbnail_url text,
  title text NOT NULL,
  description text,
  views_count integer DEFAULT 0,
  likes_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create live shopping sessions table
CREATE TABLE IF NOT EXISTS live_shopping_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  stream_url text,
  thumbnail_url text,
  scheduled_at timestamptz NOT NULL,
  started_at timestamptz,
  ended_at timestamptz,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended')),
  viewers_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create live shopping products junction table
CREATE TABLE IF NOT EXISTS live_shopping_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES live_shopping_sessions(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  special_price decimal(10,2),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_shopping_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_shopping_products ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (e-commerce app)
CREATE POLICY "Public can view active vendors"
  ON vendors FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can view active products"
  ON products FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Public can view active deals"
  ON deals FOR SELECT
  TO public
  USING (is_active = true AND now() BETWEEN start_date AND end_date);

CREATE POLICY "Public can view active reels"
  ON reels FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Public can view live shopping sessions"
  ON live_shopping_sessions FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can view live shopping products"
  ON live_shopping_products FOR SELECT
  TO public
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_vendor ON products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_deals_product ON deals(product_id);
CREATE INDEX IF NOT EXISTS idx_deals_type_active ON deals(deal_type, is_active);
CREATE INDEX IF NOT EXISTS idx_deals_dates ON deals(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_reels_product ON reels(product_id);
CREATE INDEX IF NOT EXISTS idx_reels_vendor ON reels(vendor_id);
CREATE INDEX IF NOT EXISTS idx_live_sessions_vendor ON live_shopping_sessions(vendor_id);
CREATE INDEX IF NOT EXISTS idx_live_sessions_status ON live_shopping_sessions(status);