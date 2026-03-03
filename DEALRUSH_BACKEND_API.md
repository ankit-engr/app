# DealRush Backend API Reference

This document lists the backend APIs used by the DealRush website so your Android app can consume the same data. All endpoints are relative to the base URL:

**Base URL:** `https://backend.dealrushs.com`

**Image base URL:** For product/banner images that come as relative paths (e.g. `/uploads/...`), prefix with `https://backend.dealrushs.com`.

---

## Table of Contents

1. [Home Page APIs](#1-home-page-apis)
2. [Shop Page APIs](#2-shop-page-apis)
3. [Product Listing & Filtering APIs](#3-product-listing--filtering-apis)
4. [Product Details API](#4-product-details-api)
5. [Search APIs](#5-search-apis)
6. [Deals APIs](#6-deals-apis)
7. [Categories & Filters](#7-categories--filters)
8. [Reels / Real Dress Section](#8-reels--real-dress-section)
9. [Brand / Vendor APIs](#9-brand--vendor-apis)

---

## 1. Home Page APIs

The home page loads all section data in a single call.

### GET `/api/home-page`

Fetches all home page data: banners and product sections.

**Request:**

- **Method:** `GET`
- **Headers:** `Content-Type: application/json` (optional)
- **Query params:** None

**Example:**

```http
GET https://backend.dealrushs.com/api/home-page
```

**Example response:**

```json
{
  "success": true,
  "data": {
    "banners": {
      "hourly": {
        "image": "/uploads/banners/hourly.jpg",
        "title": "Hourly Sale",
        "subtitle": "Limited time offers"
      },
      "premium": {
        "image": "/uploads/banners/premium.jpg",
        "title": "Premium Brands",
        "subtitle": "Top brands at best prices"
      }
    },
    "sections": {
      "featured": [
        {
          "id": "prod-1",
          "name": "Product Name",
          "slug": "product-name",
          "image": "/uploads/products/1.jpg",
          "price": 499,
          "comparePrice": 799,
          "effectivePrice": 499,
          "vendors": { "name": "Brand Name" },
          "categories": { "name": "Category" }
        }
      ],
      "hero": [],
      "deal99": [],
      "hourly": [],
      "dealOfDay": [],
      "heavyDiscount": [],
      "brandInFocus": [],
      "productsInFocus": [],
      "preOrder": []
    }
  }
}
```

**Product object (in sections):** `id`, `name`, `slug`, `image` (relative path), `price`, `comparePrice`, `effectivePrice`, `vendors.name`, `categories.name`, `stock`, `averageRating`, etc. Prefix `image` with base URL if it starts with `/`.

---

## 2. Shop Page APIs

The shop landing page loads its layout and sections in one call.

### GET `/api/shop-page`

Fetches shop page hero, categories, banners, and product sections.

**Request:**

- **Method:** `GET`
- **Query params:** None

**Example:**

```http
GET https://backend.dealrushs.com/api/shop-page
```

**Example response:**

```json
{
  "success": true,
  "data": {
    "hero": {
      "image": "/uploads/shop/hero.jpg",
      "title": "Shop All",
      "subtitle": "Discover deals"
    },
    "categories": [
      {
        "id": "cat-1",
        "name": "Electronics",
        "slug": "electronics",
        "image": "/uploads/categories/elec.jpg"
      }
    ],
    "trendingBanners": [],
    "spotlight": {
      "product": {},
      "title": "Spotlight"
    },
    "crazyDeals": [],
    "midSeasonSale": {},
    "bestSellers": [],
    "categoryFocus": []
  }
}
```

---

## 3. Product Listing & Filtering APIs

Used on the **Shop** and **Products** pages for grids/lists with filters and pagination.

### GET `/api/products`

General product list with optional category filter and pagination.

**Request:**

- **Method:** `GET`
- **Query params:**
  - `page` (optional, default `1`)
  - `limit` (optional, default `10`)
  - `categoryIds` (optional) – comma-separated category IDs

**Example:**

```http
GET https://backend.dealrushs.com/api/products?page=1&limit=12
GET https://backend.dealrushs.com/api/products?page=1&limit=12&categoryIds=cat1,cat2
```

**Example response:**

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "prod-1",
        "name": "Product Name",
        "slug": "product-slug",
        "sku": "SKU001",
        "price": 999,
        "basePrice": 999,
        "comparePrice": 1299,
        "effectivePrice": 999,
        "stock": 50,
        "status": "active",
        "averageRating": 4.5,
        "categories": { "name": "Electronics" },
        "vendors": { "name": "Brand Name" },
        "brands": { "name": "Brand Name" },
        "product_images": [
          { "imageUrl": "/uploads/products/1.jpg" }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 12,
      "total": 100,
      "pages": 9
    }
  }
}
```

### GET `/api/products/category/{categoryId}`

Products in a specific category. `categoryId` can be ID or slug (backend may resolve slug).

**Request:**

- **Method:** `GET`
- **Path:** `categoryId` – category ID or slug
- **Query params:**
  - `page` (optional, default `1`)
  - `limit` (optional, default `12`)
  - `brands` (optional) – filter by brand names

**Example:**

```http
GET https://backend.dealrushs.com/api/products/category/electronics?page=1&limit=12
GET https://backend.dealrushs.com/api/products/category/electronics?page=1&limit=12&brands=BrandA,BrandB
```

**Example response:** Same structure as `GET /api/products` (`data.products`, `data.pagination`).

### POST `/api/shopitem` (used by website for filtered listing)

The website uses this for sidebar filters (categories, brands, price range, sort). You can replicate the same filters on Android using the same body.

**Request:**

- **Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Body:**

| Field             | Type   | Description                          |
|-------------------|--------|--------------------------------------|
| searchTerm        | string | Text search in title/category/brand  |
| sortOption        | string | `1`=position, `3`=name A–Z, `4`=Z–A, `5`=price low–high, `6`=price high–low |
| page              | number | Page number                          |
| limit             | number | Items per page                       |
| selectedCategory  | string[] | Category names (sidebar)          |
| categoryIds       | string[] | Category IDs (preferred if available) |
| selectedBrands   | string[] | Brand names                         |
| selectedWeight    | string[] | Weight filter                       |
| selectedColor     | string[] | Color filter                        |
| range             | object | `{ "min": 0, "max": 100000 }` price range |

**Example body:**

```json
{
  "searchTerm": "",
  "sortOption": "1",
  "page": 1,
  "limit": 12,
  "selectedCategory": [],
  "categoryIds": ["cat-id-1"],
  "selectedBrands": [],
  "selectedWeight": [],
  "selectedColor": [],
  "range": { "min": 0, "max": 100000 }
}
```

**Example response:**

```json
{
  "data": [
    {
      "id": "prod-1",
      "title": "Product Name",
      "category": "Electronics",
      "newPrice": 999,
      "oldPrice": 1299,
      "image": "https://backend.dealrushs.com/uploads/products/1.jpg",
      "imageTwo": "https://backend.dealrushs.com/uploads/products/1.jpg",
      "href": "/product/product-slug",
      "weight": "1kg",
      "rating": 4.5,
      "status": "Available",
      "location": "Online",
      "brand": "Brand Name",
      "sku": "SKU001",
      "quantity": 50,
      "sale": "Sale"
    }
  ],
  "totalItems": 100,
  "currentPage": 1,
  "totalPages": 9
}
```

---

## 4. Product Details API

Used on the **product detail page** (by slug or id). The website calls a Next.js route that proxies to the backend; for Android you can call the backend directly.

### By slug (recommended for URLs)

**GET** `/api/products/slug/{slug}`

- **Path:** `slug` – product slug (e.g. from URL `/product/product-name` → `product-name`)
- **Query (optional):** `brand` – brand slug if needed for disambiguation

**Example:**

```http
GET https://backend.dealrushs.com/api/products/slug/product-name
```

### By ID

**GET** `/api/products/{productId}`

**Example:**

```http
GET https://backend.dealrushs.com/api/products/prod-123
```

**Example response (product details):**

```json
{
  "success": true,
  "data": {
    "product": {
      "id": "prod-1",
      "name": "Product Name",
      "slug": "product-slug",
      "description": "Full description",
      "shortDescription": "Short desc",
      "price": 999,
      "basePrice": 999,
      "comparePrice": 1299,
      "effectivePrice": 999,
      "stock": 50,
      "status": "active",
      "averageRating": 4.5,
      "weight": "0.5",
      "dimensions": {},
      "material": "Cotton",
      "features": ["Feature 1", "Feature 2"],
      "product_images": [
        { "imageUrl": "/uploads/products/1.jpg" },
        { "imageUrl": "/uploads/products/1_2.jpg" }
      ],
      "product_variants": [
        {
          "id": "var-1",
          "sku": "SKU-V1",
          "name": "Size M",
          "price": 999,
          "comparePrice": 1299,
          "stock": 10,
          "attributes": { "Size": "M" },
          "isDefault": true
        }
      ],
      "vendors": { "name": "Brand Name" },
      "categories": { "name": "Category" }
    },
    "similarProducts": [],
    "sameVendorProducts": []
  }
}
```

For images, prefix `imageUrl` with `https://backend.dealrushs.com` when it is a path like `/uploads/...`.

---

## 5. Search APIs

Used in the **header search** and **product listing** when the user types a search query.

### Full search – GET `/api/products/search/{query}`

Backend path is **search/{query}**, not `?q=`. The website’s Next.js route accepts `?q=...` and forwards to this.

**Request:**

- **Method:** `GET`
- **Path:** `query` – URL-encoded search term
- **Query params:**
  - `page` (optional, default `1`)
  - `limit` (optional, default `20`)
  - `sortBy` (optional) – e.g. `createdAt`, `name`, `price`
  - `sortOrder` (optional) – `asc` or `desc`

**Example:**

```http
GET https://backend.dealrushs.com/api/products/search/headphones?page=1&limit=20&sortBy=createdAt&sortOrder=desc
```

**Example response:**

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "prod-1",
        "name": "Wireless Headphones",
        "slug": "wireless-headphones",
        "price": 1999,
        "effectivePrice": 1999,
        "comparePrice": 2499,
        "product_images": [{ "imageUrl": "/uploads/products/1.jpg" }],
        "categories": { "name": "Electronics" },
        "vendors": { "name": "Brand" },
        "averageRating": 4.5,
        "totalReviews": 10
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "pages": 1
    }
  }
}
```

### Search autocomplete – GET `/api/products/search/autocomplete`

For search-as-you-type suggestions (products, categories, etc.).

**Request:**

- **Method:** `GET`
- **Query params:**
  - `q` – search string (min 2 characters)
  - `limit` (optional, default `10`)

**Example:**

```http
GET https://backend.dealrushs.com/api/products/search/autocomplete?q=head&limit=10
```

**Example response:**

```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "type": "product",
        "id": "prod-1",
        "name": "Wireless Headphones",
        "slug": "wireless-headphones",
        "price": 1999,
        "image": "/uploads/products/1.jpg",
        "category": "Electronics",
        "brand": "Brand Name"
      }
    ],
    "variants": [],
    "total": 1
  },
  "message": "Suggestions retrieved successfully"
}
```

Prefix `image` with base URL when it is a path.

---

## 6. Deals APIs

Used in **Home** sections: Deal 99 Store, Hourly Deals, Deal of the Day, Heavy Discount.

### Deal 99 (₹99 store)

**GET** `/api/products/deals/99rs`

**Example:**

```http
GET https://backend.dealrushs.com/api/products/deals/99rs
```

**Example response:** Same product array format as other product list APIs (`success`, `data.products` or similar).

### Hourly deals

**GET** `/api/products/deals/hourly`

**Query params:** `page`, `limit` (optional)

**Example:**

```http
GET https://backend.dealrushs.com/api/products/deals/hourly?page=1&limit=20
```

### Deal of the day

**GET** `/api/products/deals/day-of-deals`

**Query params:** `page`, `limit` (optional)

**Example:**

```http
GET https://backend.dealrushs.com/api/products/deals/day-of-deals?page=1&limit=20
```

### Heavy discount

**GET** `/api/products/deals/heavy-discount`

**Query params:** `page`, `limit` (optional)

**Example:**

```http
GET https://backend.dealrushs.com/api/products/deals/heavy-discount?page=1&limit=20
```

---

## 7. Categories & Filters

Used in **header**, **shop sidebar**, and **Products** page.

### GET `/api/categories`

List all categories (for nav and filters).

**Example:**

```http
GET https://backend.dealrushs.com/api/categories
```

**Example response:**

```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "cat-1",
        "name": "Electronics",
        "title": "Electronics",
        "slug": "electronics",
        "description": null,
        "parentId": null
      }
    ],
    "total": 10
  }
}
```

### GET `/api/shopcategory` (categories with product count)

Used on the Products/Shop page for sidebar. Returns category name and count.

**Example:**

```http
GET https://backend.dealrushs.com/api/shopcategory
```

**Example response:**

```json
[
  { "category": "Electronics", "count": 42 },
  { "category": "Fashion", "count": 128 }
]
```

### GET `/api/shopbrand` (brands with product count)

**Example:**

```http
GET https://backend.dealrushs.com/api/shopbrand
```

**Example response:**

```json
[
  { "brand": "Brand A", "count": 15 },
  { "brand": "Brand B", "count": 8 }
]
```

Backend source: `GET https://backend.dealrushs.com/api/brands?page=1&limit=1000`; counts are derived from products.

---

## 8. Reels / Real Dress Section

Used in the **Home** “Real Dress” / reels section.

### GET `/api/products/reels`

**Query params:** `page` (optional), `limit` (optional, default `50`)

**Example:**

```http
GET https://backend.dealrushs.com/api/products/reels?page=1&limit=50
```

**Example response:** Same pattern as other product lists: `success`, `data` with products and optional pagination. Products may include video/reel-related fields.

---

## 9. Brand / Vendor APIs

### Brand products (by slug)

Used on **Brand** page: `/brands/[slug]`.

**GET** `/api/brands/{slug}/products`

**Query params:** `page`, `limit`, `sortBy`, `sortOrder` (optional)

**Example:**

```http
GET https://backend.dealrushs.com/api/brands/nike/products?page=1&limit=20&sortBy=createdAt&sortOrder=desc
```

**Example response:**

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "brand": {
      "id": "brand-1",
      "name": "Nike",
      "slug": "nike",
      "description": null,
      "logoUrl": "/uploads/brands/nike.png"
    },
    "products": [
      {
        "id": "prod-1",
        "name": "Product Name",
        "slug": "product-slug",
        "price": 2999,
        "comparePrice": 3999,
        "effectivePrice": 2999,
        "stock": 10,
        "product_images": [{ "imageUrl": "/uploads/products/1.jpg" }],
        "vendors": { "name": "Nike" },
        "categories": { "name": "Footwear" }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "pages": 3
    }
  }
}
```

### Public vendors list (optional)

Used by the website for vendor/brand listing in some flows.

**GET** `/api/public/vendors`

**Query params:** `page`, `limit` (e.g. `page=1&limit=12`)

**Example:**

```http
GET https://backend.dealrushs.com/api/public/vendors?page=1&limit=12
```

---

## Image URL handling

- If the API returns an image field that **starts with `http://` or `https://`**, use it as-is.
- If it is a **path** (e.g. `/uploads/products/1.jpg`), use:
  - `https://backend.dealrushs.com` + path  
  - e.g. `https://backend.dealrushs.com/uploads/products/1.jpg`

---

## Summary table (Android quick reference)

| Page / Feature   | Method | Endpoint |
|------------------|--------|----------|
| Home             | GET    | `/api/home-page` |
| Shop             | GET    | `/api/shop-page` |
| Product list     | GET    | `/api/products?page=&limit=&categoryIds=` |
| Product by category | GET | `/api/products/category/{categoryId}?page=&limit=&brands=` |
| Filtered list    | POST   | `/api/shopitem` (body: filters, sort, page, limit) |
| Product details  | GET    | `/api/products/slug/{slug}` or `/api/products/{id}` |
| Search           | GET    | `/api/products/search/{query}?page=&limit=&sortBy=&sortOrder=` |
| Search suggestions | GET  | `/api/products/search/autocomplete?q=&limit=` |
| Deals 99         | GET    | `/api/products/deals/99rs` |
| Hourly deals     | GET    | `/api/products/deals/hourly?page=&limit=` |
| Deal of the day  | GET    | `/api/products/deals/day-of-deals?page=&limit=` |
| Heavy discount   | GET    | `/api/products/deals/heavy-discount?page=&limit=` |
| Categories       | GET    | `/api/categories` |
| Shop categories (with count) | GET | `/api/shopcategory` |
| Shop brands (with count) | GET | `/api/shopbrand` |
| Reels            | GET    | `/api/products/reels?page=&limit=` |
| Brand products   | GET    | `/api/brands/{slug}/products?page=&limit=&sortBy=&sortOrder=` |

**Base URL:** `https://backend.dealrushs.com`

Use this document to mirror the same APIs and response structures in your Android app so the data matches the website.

---

## 10. User & Auth APIs (for logged-in features)

These require authentication (e.g. session cookie or Bearer token). Use the same base URL. Request/response bodies depend on your backend; below are the paths and methods used by the website.

| Feature | Method | Endpoint |
|--------|--------|----------|
| Login | POST | `/api/auth/login` |
| Register | POST | `/api/auth/register` |
| Google login | POST | `/api/auth/google-login` |
| Verify OTP | POST | `/api/auth/verify-otp` |
| Logout | POST | `/api/auth/logout` |
| User profile | GET / PUT | `/api/users/profile` |
| Change password | POST | `/api/users/change-password` |
| Addresses | GET / POST | `/api/users/addresses` |
| Address by ID | GET / PUT / DELETE | `/api/users/addresses/{id}` |
| Cart | GET / POST | `/api/users/cart` |
| Cart item | PUT / DELETE | `/api/users/cart/{cartItemId}` |
| Cart sync | POST | `/api/users/cart/sync` |
| Wishlist | GET / POST | `/api/users/wishlist` |
| Wishlist item | DELETE | `/api/users/wishlist/{productId}` |
| Orders | GET / POST | `/api/users/orders` |
| Order by ID | GET | `/api/users/orders/{id}` |
| Order cancel | POST | `/api/users/orders/{id}/cancel` |
| Order status history | GET | `/api/users/orders/{id}/status-history` |
| Create order (PayU) | POST | `/api/users/payu/create-order` |
| Verify payment (PayU) | POST | `/api/users/payu/verify-payment` |

Vendor/partner flows use `/api/auth/vendor-login`, `/api/auth/vendor-quick-register`, `/api/auth/vendor-complete-register`, `/api/auth/vendor-verify-token`, etc. All of these proxy to the same backend base URL.
