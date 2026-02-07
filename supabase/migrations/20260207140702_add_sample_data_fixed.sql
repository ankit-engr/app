/*
  # Add Sample Data

  ## Overview
  Populates the database with sample vendors, products, deals, reels, and live shopping sessions
  to demonstrate the e-commerce platform functionality.

  ## Sample Data Includes
  - 5 featured vendors (brands)
  - 15+ products across different categories
  - Various deal types (deal of day, discounts, brand focus, product focus, pre-launch)
  - Sample reels with product links
  - Live shopping sessions (scheduled)

  ## Notes
  - Uses realistic product images from Pexels
  - Includes diverse product categories (electronics, fashion, home, beauty)
  - Sets up active deals with proper date ranges
*/

-- Insert sample vendors
INSERT INTO vendors (name, logo_url, description, is_featured) VALUES
  ('TechZone', 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=200', 'Premium electronics and gadgets', true),
  ('Fashion Hub', 'https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg?auto=compress&cs=tinysrgb&w=200', 'Trendy fashion for everyone', true),
  ('HomeStyle', 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=200', 'Beautiful home decor and furniture', true),
  ('BeautyBox', 'https://images.pexels.com/photos/3373736/pexels-photo-3373736.jpeg?auto=compress&cs=tinysrgb&w=200', 'Premium beauty and skincare', true),
  ('SportsPro', 'https://images.pexels.com/photos/2385477/pexels-photo-2385477.jpeg?auto=compress&cs=tinysrgb&w=200', 'Professional sports equipment', true);

-- Get vendor IDs for reference
DO $$
DECLARE
  v_techzone uuid;
  v_fashion uuid;
  v_home uuid;
  v_beauty uuid;
  v_sports uuid;
  p_headphones uuid;
  p_watch uuid;
  p_stand uuid;
  p_handbag uuid;
  p_dress uuid;
  p_jacket uuid;
  p_lamp uuid;
  p_cushions uuid;
  p_art uuid;
  p_skincare uuid;
  p_makeup uuid;
  p_yoga uuid;
  p_dumbbell uuid;
  p_speaker uuid;
  p_sneakers uuid;
BEGIN
  -- Get vendor IDs
  SELECT id INTO v_techzone FROM vendors WHERE name = 'TechZone' LIMIT 1;
  SELECT id INTO v_fashion FROM vendors WHERE name = 'Fashion Hub' LIMIT 1;
  SELECT id INTO v_home FROM vendors WHERE name = 'HomeStyle' LIMIT 1;
  SELECT id INTO v_beauty FROM vendors WHERE name = 'BeautyBox' LIMIT 1;
  SELECT id INTO v_sports FROM vendors WHERE name = 'SportsPro' LIMIT 1;

  -- Insert products
  INSERT INTO products (vendor_id, name, description, price, image_url, stock, is_active) VALUES
    (v_techzone, 'Wireless Headphones Pro', 'Premium noise-cancelling wireless headphones', 299.99, 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=600', 50, true),
    (v_techzone, 'Smart Watch X', 'Advanced fitness tracking smartwatch', 399.99, 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=600', 30, true),
    (v_techzone, 'Laptop Stand Aluminum', 'Ergonomic laptop stand for better posture', 89.99, 'https://images.pexels.com/photos/2047905/pexels-photo-2047905.jpeg?auto=compress&cs=tinysrgb&w=600', 100, true),
    (v_fashion, 'Designer Handbag', 'Luxury leather handbag', 249.99, 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=600', 25, true),
    (v_fashion, 'Summer Dress Collection', 'Elegant summer dress', 129.99, 'https://images.pexels.com/photos/1055691/pexels-photo-1055691.jpeg?auto=compress&cs=tinysrgb&w=600', 40, true),
    (v_fashion, 'Leather Jacket', 'Premium leather jacket', 349.99, 'https://images.pexels.com/photos/1124468/pexels-photo-1124468.jpeg?auto=compress&cs=tinysrgb&w=600', 20, true),
    (v_home, 'Modern Table Lamp', 'Stylish LED table lamp', 79.99, 'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&w=600', 60, true),
    (v_home, 'Decorative Cushions Set', 'Set of 4 decorative cushions', 59.99, 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=600', 80, true),
    (v_home, 'Wall Art Canvas', 'Abstract wall art canvas', 149.99, 'https://images.pexels.com/photos/1143758/pexels-photo-1143758.jpeg?auto=compress&cs=tinysrgb&w=600', 35, true),
    (v_beauty, 'Skincare Essentials Kit', 'Complete skincare routine kit', 89.99, 'https://images.pexels.com/photos/3762879/pexels-photo-3762879.jpeg?auto=compress&cs=tinysrgb&w=600', 45, true),
    (v_beauty, 'Makeup Palette Pro', 'Professional makeup palette', 129.99, 'https://images.pexels.com/photos/2113855/pexels-photo-2113855.jpeg?auto=compress&cs=tinysrgb&w=600', 55, true),
    (v_sports, 'Yoga Mat Premium', 'Extra thick yoga mat', 49.99, 'https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg?auto=compress&cs=tinysrgb&w=600', 90, true),
    (v_sports, 'Dumbbell Set', 'Adjustable dumbbell set', 199.99, 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=600', 30, true),
    (v_techzone, 'Bluetooth Speaker', 'Portable waterproof speaker', 79.99, 'https://images.pexels.com/photos/1279169/pexels-photo-1279169.jpeg?auto=compress&cs=tinysrgb&w=600', 70, true),
    (v_fashion, 'Sneakers Limited Edition', 'Premium limited edition sneakers', 189.99, 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=600', 15, true);

  -- Get product IDs for deals
  SELECT id INTO p_headphones FROM products WHERE name = 'Wireless Headphones Pro' LIMIT 1;
  SELECT id INTO p_watch FROM products WHERE name = 'Smart Watch X' LIMIT 1;
  SELECT id INTO p_stand FROM products WHERE name = 'Laptop Stand Aluminum' LIMIT 1;
  SELECT id INTO p_handbag FROM products WHERE name = 'Designer Handbag' LIMIT 1;
  SELECT id INTO p_dress FROM products WHERE name = 'Summer Dress Collection' LIMIT 1;
  SELECT id INTO p_jacket FROM products WHERE name = 'Leather Jacket' LIMIT 1;
  SELECT id INTO p_lamp FROM products WHERE name = 'Modern Table Lamp' LIMIT 1;
  SELECT id INTO p_cushions FROM products WHERE name = 'Decorative Cushions Set' LIMIT 1;
  SELECT id INTO p_art FROM products WHERE name = 'Wall Art Canvas' LIMIT 1;
  SELECT id INTO p_skincare FROM products WHERE name = 'Skincare Essentials Kit' LIMIT 1;
  SELECT id INTO p_makeup FROM products WHERE name = 'Makeup Palette Pro' LIMIT 1;
  SELECT id INTO p_yoga FROM products WHERE name = 'Yoga Mat Premium' LIMIT 1;
  SELECT id INTO p_dumbbell FROM products WHERE name = 'Dumbbell Set' LIMIT 1;
  SELECT id INTO p_speaker FROM products WHERE name = 'Bluetooth Speaker' LIMIT 1;
  SELECT id INTO p_sneakers FROM products WHERE name = 'Sneakers Limited Edition' LIMIT 1;

  -- Insert deals
  INSERT INTO deals (product_id, deal_type, discount_percentage, discounted_price, start_date, end_date, is_active) VALUES
    (p_headphones, 'deal_of_day', 40, 179.99, now() - interval '1 hour', now() + interval '23 hours', true),
    (p_watch, 'discount', 25, 299.99, now() - interval '1 day', now() + interval '6 days', true),
    (p_stand, 'discount', 30, 62.99, now() - interval '2 hours', now() + interval '5 days', true),
    (p_handbag, 'brand_focus', 35, 162.49, now() - interval '3 hours', now() + interval '4 days', true),
    (p_dress, 'brand_focus', 40, 77.99, now() - interval '1 hour', now() + interval '3 days', true),
    (p_jacket, 'product_focus', 20, 279.99, now() - interval '2 hours', now() + interval '7 days', true),
    (p_lamp, 'product_focus', 35, 51.99, now() - interval '30 minutes', now() + interval '2 days', true),
    (p_cushions, 'discount', 25, 44.99, now() - interval '1 hour', now() + interval '5 days', true),
    (p_art, 'brand_focus', 30, 104.99, now() - interval '2 hours', now() + interval '6 days', true),
    (p_skincare, 'pre_launch', 50, 44.99, now() - interval '1 hour', now() + interval '10 days', true),
    (p_makeup, 'pre_launch', 45, 71.49, now() - interval '30 minutes', now() + interval '9 days', true),
    (p_yoga, 'deal_of_day', 35, 32.49, now() - interval '2 hours', now() + interval '22 hours', true),
    (p_dumbbell, 'discount', 30, 139.99, now() - interval '1 day', now() + interval '4 days', true),
    (p_speaker, 'product_focus', 40, 47.99, now() - interval '3 hours', now() + interval '3 days', true),
    (p_sneakers, 'pre_launch', 25, 142.49, now() - interval '1 hour', now() + interval '14 days', true);

  -- Insert reels
  INSERT INTO reels (product_id, vendor_id, video_url, thumbnail_url, title, description, views_count, likes_count, is_active) VALUES
    (p_headphones, v_techzone, 'https://example.com/reel1.mp4', 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=600', 'Unboxing Wireless Headphones Pro', 'Check out these amazing wireless headphones!', 1250, 340, true),
    (p_dress, v_fashion, 'https://example.com/reel2.mp4', 'https://images.pexels.com/photos/1055691/pexels-photo-1055691.jpeg?auto=compress&cs=tinysrgb&w=600', 'Summer Dress Styling Tips', 'How to style your summer dress for any occasion', 2100, 580, true),
    (p_skincare, v_beauty, 'https://example.com/reel3.mp4', 'https://images.pexels.com/photos/3762879/pexels-photo-3762879.jpeg?auto=compress&cs=tinysrgb&w=600', 'Complete Skincare Routine', 'My morning skincare routine with these essentials', 3450, 920, true),
    (null, v_sports, 'https://example.com/reel4.mp4', 'https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg?auto=compress&cs=tinysrgb&w=600', 'Home Workout Tips', 'Quick home workout routine for beginners', 1890, 450, true);

  -- Insert live shopping sessions
  INSERT INTO live_shopping_sessions (vendor_id, title, description, thumbnail_url, scheduled_at, status, viewers_count) VALUES
    (v_techzone, 'TechZone Flash Sale', 'Join us for exclusive tech deals and live demos!', 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=600', now() + interval '2 hours', 'scheduled', 0),
    (v_fashion, 'Fashion Hub Spring Collection', 'Discover our new spring collection live!', 'https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg?auto=compress&cs=tinysrgb&w=600', now() + interval '1 day', 'scheduled', 0),
    (v_beauty, 'BeautyBox Masterclass', 'Live makeup tutorial with exclusive discounts', 'https://images.pexels.com/photos/3373736/pexels-photo-3373736.jpeg?auto=compress&cs=tinysrgb&w=600', now() + interval '3 hours', 'scheduled', 0);

END $$;
