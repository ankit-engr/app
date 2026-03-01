# DealRush API Postman Collection

Complete Postman collection for DealRush backend API with all endpoints organized by Admin, Vendor, and Customer modules.

## 📁 Collection Structure

The collection is organized into the following folders:

### 1. **Authentication** (Public)
- Send OTP
- Verify OTP
- Google Login
- Vendor Quick Register
- Vendor Verify Token
- Vendor Complete Register
- Vendor Login
- Vendor Forgot Password
- Vendor Reset Password
- Admin Login
- Get Current User
- Refresh Token
- Logout

### 2. **Admin** Folder
Contains all admin endpoints organized by modules:

#### Dashboard
- Get Dashboard Stats

#### Users
- Get All Users
- Get User By ID
- Update User Status

#### Vendors
- Get All Vendors
- Get Pending Vendors
- Get Vendor By ID
- Approve Vendor
- Reject Vendor
- Complete Vendor Form
- Update Vendor Details
- Delete Vendor

#### Products
- Get All Products
- Get Pending Products
- Get Approval Stats
- Approve Product
- Reject Product

#### Orders
- Get All Orders
- Get Order By ID
- Get Order Status History
- Update Order Status

#### Categories
- Get All Categories
- Get Category By ID
- Create Category
- Update Category
- Delete Category

#### Brands
- Get All Brands
- Create Brand

#### Deals
- Get All Deals
- Create Deal
- Update Deal
- Delete Deal

#### Special Deals
- **Deal 99Rs**: Get All, Approve, Reject, Delete
- **Day of Deals**: Get All, Approve, Reject, Delete
- **Hourly Deals**: Get All, Approve, Reject, Delete
- **Heavy Discount Deals**: Get All, Approve, Reject, Delete

#### Cache Management
- Clear All Product Cache
- Get Product Cache Stats

#### Ledger
- Get Vendor Ledger Summary
- Get Vendor Ledger Detail

#### Emails
- Send Admin Email
- Send Admin Email Bulk

#### Page Content
- Get All Page Content
- Create Page Content
- Update Page Content
- Delete Page Content

#### Admin Actions
- Get Admin Actions

### 3. **Vendor** Folder
Contains all vendor endpoints organized by modules:

#### Dashboard
- Get Dashboard
- Get Sales Analytics
- Get Product Analytics

#### Products
- Get All Products
- Get Products By Category
- Get Product By ID
- Create Product
- Update Product
- Delete Product
- Add Product Image
- Delete Product Image

#### Product Variants
- Create Product Variant
- Update Product Variant
- Delete Product Variant

#### Variant Options
- Get Variant Options
- Get Variant Options By Type

#### Deals
- Get All Deals
- Create Deal
- Update Deal
- Delete Deal

#### Special Deals
- **Deal 99Rs**: Create, Get, Update, Delete
- **Day of Deals**: Create, Get, Update, Delete
- **Hourly Deals**: Create, Get, Update, Delete
- **Heavy Discount Deals**: Create, Get, Update, Delete

#### Orders
- Get All Orders
- Get Order By ID
- Get Order Status History
- Update Order Status
- Mark Order Ready
- Generate Invoice
- Generate Label

#### Profile & Settings
- Get Profile
- Update Profile
- Get Settings
- Update Settings

#### Earnings & Payouts
- Get Earnings
- Get Earnings History
- Update Payout Settings

#### Reviews
- Get Reviews
- Get Review Stats

#### Brands
- Get All Brands
- Get Brand By ID
- Create Brand
- Update Brand
- Delete Brand
- Get Available Brands

#### Categories & Deal Types
- Get Categories
- Get Deal Types

### 4. **Customer** Folder
Contains all customer/user endpoints organized by modules:

#### Profile
- Get Profile
- Get Complete Profile
- Update Profile
- Change Password

#### Addresses
- Get All Addresses
- Create Address
- Update Address
- Delete Address

#### Cart
- Get Cart
- Add to Cart
- Sync Guest Cart
- Update Cart Item
- Remove from Cart
- Clear Cart

#### Wishlist
- Get Wishlist
- Add to Wishlist
- Remove from Wishlist

#### Orders
- Get All Orders
- Get Order By ID
- Get Order Status History
- Create Order
- Cancel Order

#### Reviews
- Get Reviews
- Create Review
- Update Review
- Delete Review

#### Payment Methods
- Get Payment Methods
- Create Payment Method
- Delete Payment Method

#### Cashfree Payments
- Create Cashfree Order
- Verify Cashfree Payment

### 5. **Public** Folder
Contains all public/shared endpoints:

#### Products
- Get All Products
- Get Product By ID
- Get Product By Slug
- Get Product Price
- Get Products By Category
- Search Products
- Search Autocomplete
- Get Featured Products
- Get Pre-order Products
- Get Deals
- Get 99Rs Deals
- Get Day of Deals
- Get Hourly Deals
- Get Heavy Discount Deals
- Get Products with Reels
- Download Reel
- Get Bulk Prices

#### Categories
- Get All Categories
- Get All Categories Flat
- Get All Subcategories
- Get Subcategories
- Get Category By ID

#### Brands
- Get All Brands
- Get Brands By Vendor
- Get Products By Brand Slug
- Get Brand By Slug
- Get Brand By ID

#### Vendors
- Get Public Vendors
- Get Vendor Products

#### Orders
- Track Order

#### Deals
- Get Active Deals

#### Home Page
- Get Home Page Data

#### Shop Page
- Get Shop Page Data

#### Product Details
- Get Product Details

#### Brand Details
- Get Brand Details

## 🔧 Setup Instructions

### 1. Import Collection
1. Open Postman
2. Click **Import** button
3. Select `DealRush_API_Collection.postman_collection.json`
4. Click **Import**

### 2. Configure Environment Variables
The collection uses the following variables:
- `base_url`: API base URL (default: `https://backend.dealrushs.com`)
- `admin_token`: Admin authentication token
- `vendor_token`: Vendor authentication token
- `customer_token`: Customer authentication token

### 3. Set Up Authentication

#### For Admin:
1. Use **Admin Login** endpoint to get token
2. Copy the token from response
3. Set `admin_token` variable in Postman

#### For Vendor:
1. Use **Vendor Login** endpoint to get token
2. Copy the token from response
3. Set `vendor_token` variable in Postman

#### For Customer:
1. Use **Send OTP** endpoint
2. Use **Verify OTP** endpoint to get token
3. Copy the token from response
4. Set `customer_token` variable in Postman

## 📝 Notes

1. **Authentication**: Most endpoints require authentication. Make sure to set the appropriate token variable before making requests.

2. **File Uploads**: Some endpoints (like product creation, vendor registration) support file uploads. In Postman, you'll need to:
   - Change body type to `form-data`
   - Add file fields manually

3. **Query Parameters**: Many GET endpoints support pagination and filtering. Check the query parameters section in each request.

4. **Path Variables**: Replace path variables (like `:id`, `:slug`) with actual values in the URL.

5. **Request Bodies**: All POST/PUT/PATCH requests include example request bodies with all available fields. Modify as needed for your use case.

## 🚀 Quick Start

1. **Test Authentication**:
   - Start with **Send OTP** (for customer) or **Admin Login** / **Vendor Login**
   - Save the token to the appropriate variable

2. **Explore Endpoints**:
   - Browse folders by role (Admin/Vendor/Customer)
   - Each module contains related endpoints

3. **Test Requests**:
   - Click on any request
   - Review the example body/parameters
   - Click **Send** to test

## 📊 Collection Statistics

- **Total Endpoints**: 200+
- **Modules**: 5 main folders (Auth, Admin, Vendor, Customer, Public)
- **Authentication Methods**: Bearer Token (JWT)

## 🔄 Updates

This collection includes all endpoints from the DealRush backend API. If new endpoints are added to the API, update this collection accordingly.

---

**Generated**: 2026-02-23
**API Version**: 1.0.0
**Base URL**: https://backend.dealrushs.com
