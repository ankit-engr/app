# Deals E-Commerce App

A modern React Native e-commerce application built with Expo, focused on deals and live shopping experiences.

## Features

### Deal Types
- **Deal of the Day** - Limited time offers with countdown timers
- **Flash Discounts** - Up to 70% off on selected items
- **Brand Focus** - Exclusive deals from featured brands
- **Product in Focus** - Handpicked products with special pricing
- **Pre-Launch Exclusive** - Early access to new products

### App Sections
- **Home** - Browse all deal categories with horizontal scrolling sections
- **Deals** - Filtered view of all active deals with category tabs
- **Reels** - TikTok-style vertical video feed featuring products
- **Live Shopping** - Real-time shopping sessions with vendors
- **Brands** - Discover and browse all vendor brands

### Technical Features
- Tab-based navigation with 5 main sections
- Supabase backend with PostgreSQL database
- Real-time data synchronization
- Pull-to-refresh functionality
- Search and filter capabilities
- Responsive design with red theme

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
Create a `.env` file in the root directory:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Run the development server:
```bash
npm run dev
```

## Database Schema

The app uses Supabase with the following tables:
- `vendors` - Brand/vendor information
- `products` - Product catalog
- `deals` - Active deals with types and discounts
- `reels` - Video content linked to products
- `live_shopping_sessions` - Live shopping events
- `live_shopping_products` - Products featured in live sessions

Sample data is included to demonstrate functionality.

## Theme

The app uses a red color scheme:
- Primary color: `#DC2626` (Red 600)
- Background: `#F9FAFB` (Gray 50)
- Cards: `#FFFFFF` (White)
- Text: `#111827` (Gray 900)

## Project Structure

```
app/
  (tabs)/
    index.tsx        # Home screen with deal sections
    deals.tsx        # All deals with filters
    reels.tsx        # Vertical scrolling video feed
    live.tsx         # Live shopping sessions
    vendors.tsx      # Brand directory
components/
  DealCard.tsx       # Product card with deal info
  DealSection.tsx    # Horizontal scrolling section
  ReelItem.tsx       # Individual reel video component
  LiveSessionCard.tsx # Live session card
  VendorCard.tsx     # Vendor/brand card
lib/
  supabase.ts        # Supabase client configuration
types/
  database.ts        # TypeScript type definitions
```

## Next Steps

To enhance the app further, consider adding:
- Product detail pages with full information
- Shopping cart functionality
- User authentication and profiles
- Order management
- Payment integration
- Push notifications for deal alerts
- Favorites and wishlists
- Product reviews and ratings
