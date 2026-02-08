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
- DealRush backend API (`https://backend.dealrushs.com`)
- Pull-to-refresh functionality
- Search and filter capabilities
- Responsive design with red theme

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

## Backend API

The app uses the DealRush backend API. See `DEALRUSH_BACKEND_API.md` for full endpoint reference. Key endpoints:
- **Home** – `GET /api/home-page` (banners, deal sections)
- **Deals** – `GET /api/products/deals/*` (day-of-deals, heavy-discount, etc.)
- **Reels** – `GET /api/products/reels`
- **Vendors** – `GET /api/public/vendors`
- **Product detail** – `GET /api/products/{id}` or `GET /api/products/slug/{slug}`

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
  api.ts             # DealRush backend API client
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
