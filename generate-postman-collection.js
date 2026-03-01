const fs = require('fs');

// Base collection structure
const collection = {
  info: {
    _postman_id: "dealrush-api-collection",
    name: "DealRush API Collection",
    description: "Complete API collection for DealRush backend with Admin, Vendor, and Customer endpoints",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  variable: [
    {
      key: "base_url",
      value: "https://backend.dealrushs.com",
      type: "string"
    },
    {
      key: "admin_token",
      value: "",
      type: "string"
    },
    {
      key: "vendor_token",
      value: "",
      type: "string"
    },
    {
      key: "customer_token",
      value: "",
      type: "string"
    }
  ],
  item: []
};

// Helper function to create request
function createRequest(name, method, path, folder, authType = null, body = null, params = []) {
  const request = {
    name: name,
    request: {
      method: method,
      header: [
        {
          key: "Content-Type",
          value: "application/json",
          type: "text"
        }
      ],
      url: {
        raw: "{{base_url}}" + path,
        host: ["{{base_url}}"],
        path: path.split('/').filter(p => p && !p.startsWith(':'))
      }
    }
  };

  // Add authentication header
  if (authType) {
    request.request.header.push({
      key: "Authorization",
      value: `Bearer {{${authType}_token}}`,
      type: "text"
    });
  }

  // Add path variables
  const pathVars = path.match(/:\w+/g);
  if (pathVars) {
    request.request.url.variable = pathVars.map(v => ({
      key: v.substring(1),
      value: "",
      type: "string"
    }));
  }

  // Add query parameters
  if (params && params.length > 0) {
    request.request.url.query = params.map(p => ({
      key: p,
      value: "",
      description: p === 'page' ? 'Page number (default: 1)' : 
                   p === 'limit' ? 'Items per page' :
                   p === 'sortBy' ? 'Sort field' :
                   p === 'sortOrder' ? 'Sort order (asc/desc)' :
                   p === 'status' ? 'Filter by status' : ''
    }));
  }

  // Add body for POST/PUT/PATCH
  if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
    request.request.body = {
      mode: "raw",
      raw: JSON.stringify(body, null, 2),
      options: {
        raw: {
          language: "json"
        }
      }
    };
  }

  return request;
}

// AUTHENTICATION FOLDER
const authFolder = {
  name: "Authentication",
  item: [
    createRequest("Send OTP", "POST", "/api/auth/send-otp", "auth", null, {
      phone: "9876543210"
    }),
    createRequest("Verify OTP", "POST", "/api/auth/verify-otp", "auth", null, {
      tempToken: "temp_token_here",
      otp: "123456",
      username: "john_doe",
      firstName: "John",
      lastName: "Doe"
    }),
    createRequest("Google Login", "POST", "/api/auth/google-login", "auth", null, {
      credential: "google_credential_token"
    }),
    createRequest("Vendor Quick Register", "POST", "/api/auth/vendor/quick-register", "auth", null, {
      brandName: "My Brand",
      email: "vendor@example.com",
      phone: "9876543210",
      category: "Electronics"
    }),
    createRequest("Vendor Verify Token", "GET", "/api/auth/vendor/verify-token", "auth", null, null, ["token"]),
    createRequest("Vendor Complete Register", "POST", "/api/auth/vendor/complete-register", "auth", null, {
      token: "verification_token",
      password: "password123",
      legalBrandName: "Legal Brand Name",
      email: "vendor@example.com",
      tradeName: "Trade Name",
      websiteLink: "https://example.com",
      productCategories: ["Electronics", "Accessories"],
      brandDescription: "Brand description",
      primaryContactName: "John Doe",
      phone: "9876543210",
      gstNumber: "GST123456789",
      pan: "ABCDE1234F",
      fssaiLicense: "FSSAI123456",
      trademarkConfirmation: true,
      bankAccount: {
        bankName: "Bank Name",
        accountNumber: "1234567890",
        ifscCode: "IFSC0001234",
        accountHolderName: "Account Holder",
        branchName: "Branch Name"
      },
      declarationConfirmed: true
    }),
    createRequest("Vendor Login", "POST", "/api/auth/vendor/login", "auth", null, {
      email: "vendor@example.com",
      password: "password123"
    }),
    createRequest("Vendor Forgot Password", "POST", "/api/auth/vendor/forgot-password", "auth", null, {
      email: "vendor@example.com"
    }),
    createRequest("Vendor Reset Password", "POST", "/api/auth/vendor/reset-password", "auth", null, {
      email: "vendor@example.com",
      otp: "123456",
      newPassword: "newpassword123"
    }),
    createRequest("Admin Login", "POST", "/api/auth/admin/login", "auth", null, {
      email: "admin@example.com",
      password: "password123"
    }),
    createRequest("Get Current User", "GET", "/api/auth/me", "auth", "customer", null),
    createRequest("Refresh Token", "POST", "/api/auth/refresh", "auth", "customer", null),
    createRequest("Logout", "POST", "/api/auth/logout", "auth", "customer", null)
  ]
};

// ADMIN FOLDER
const adminFolder = {
  name: "Admin",
  item: [
    // Dashboard
    {
      name: "Dashboard",
      item: [
        createRequest("Get Dashboard Stats", "GET", "/api/admin/dashboard", "admin", "admin")
      ]
    },
    // Users
    {
      name: "Users",
      item: [
        createRequest("Get All Users", "GET", "/api/admin/users", "admin", "admin", null, ["page", "limit", "sortBy", "sortOrder"]),
        createRequest("Get User By ID", "GET", "/api/admin/users/:id", "admin", "admin"),
        createRequest("Update User Status", "PATCH", "/api/admin/users/:id/status", "admin", "admin", {
          isActive: true
        })
      ]
    },
    // Vendors
    {
      name: "Vendors",
      item: [
        createRequest("Get All Vendors", "GET", "/api/admin/vendors", "admin", "admin", null, ["page", "limit"]),
        createRequest("Get Pending Vendors", "GET", "/api/admin/vendors/pending", "admin", "admin", null, ["page", "limit"]),
        createRequest("Get Vendor By ID", "GET", "/api/admin/vendors/:id", "admin", "admin"),
        createRequest("Approve Vendor", "PATCH", "/api/admin/vendors/:id/approve", "admin", "admin"),
        createRequest("Reject Vendor", "PATCH", "/api/admin/vendors/:id/reject", "admin", "admin", {
          rejectionReason: "Reason for rejection"
        }),
        createRequest("Complete Vendor Form", "PATCH", "/api/admin/vendors/:id/complete-form", "admin", "admin"),
        createRequest("Update Vendor Details", "PUT", "/api/admin/vendors/:id", "admin", "admin"),
        createRequest("Delete Vendor", "DELETE", "/api/admin/vendors/:id", "admin", "admin")
      ]
    },
    // Products
    {
      name: "Products",
      item: [
        createRequest("Get All Products", "GET", "/api/admin/products", "admin", "admin", null, ["page", "limit"]),
        createRequest("Get Pending Products", "GET", "/api/admin/products/pending", "admin", "admin", null, ["page", "limit"]),
        createRequest("Get Approval Stats", "GET", "/api/admin/products/approval-stats", "admin", "admin"),
        createRequest("Approve Product", "PATCH", "/api/admin/products/:id/approve", "admin", "admin"),
        createRequest("Reject Product", "PATCH", "/api/admin/products/:id/reject", "admin", "admin", {
          rejectionReason: "Reason for rejection"
        })
      ]
    },
    // Orders
    {
      name: "Orders",
      item: [
        createRequest("Get All Orders", "GET", "/api/admin/orders", "admin", "admin", null, ["page", "limit"]),
        createRequest("Get Order By ID", "GET", "/api/admin/orders/:id", "admin", "admin"),
        createRequest("Get Order Status History", "GET", "/api/admin/orders/:id/status-history", "admin", "admin"),
        createRequest("Update Order Status", "PATCH", "/api/admin/orders/:id/status", "admin", "admin", {
          orderStatus: "confirmed",
          trackingNumber: "TRACK123456"
        })
      ]
    },
    // Categories
    {
      name: "Categories",
      item: [
        createRequest("Get All Categories", "GET", "/api/admin/categories", "admin", "admin"),
        createRequest("Get Category By ID", "GET", "/api/admin/categories/:id", "admin", "admin"),
        createRequest("Create Category", "POST", "/api/admin/categories", "admin", "admin", {
          name: "Category Name",
          description: "Category description",
          parentCategoryId: null
        }),
        createRequest("Update Category", "PUT", "/api/admin/categories/:id", "admin", "admin", {
          name: "Updated Category Name",
          description: "Updated description"
        }),
        createRequest("Delete Category", "DELETE", "/api/admin/categories/:id", "admin", "admin")
      ]
    },
    // Brands
    {
      name: "Brands",
      item: [
        createRequest("Get All Brands", "GET", "/api/admin/brands", "admin", "admin"),
        createRequest("Create Brand", "POST", "/api/admin/brands", "admin", "admin", {
          name: "Brand Name",
          description: "Brand description",
          logoUrl: "https://example.com/logo.png"
        })
      ]
    },
    // Deals
    {
      name: "Deals",
      item: [
        createRequest("Get All Deals", "GET", "/api/admin/deals", "admin", "admin", null, ["page", "limit"]),
        createRequest("Create Deal", "POST", "/api/admin/deals", "admin", "admin", {
          productId: "product_id",
          dealTypeId: "deal_type_id",
          discountPercentage: 20,
          startDate: "2024-01-01T00:00:00Z",
          endDate: "2024-12-31T23:59:59Z",
          status: "active"
        }),
        createRequest("Update Deal", "PUT", "/api/admin/deals/:id", "admin", "admin", {
          discountPercentage: 25,
          status: "active"
        }),
        createRequest("Delete Deal", "DELETE", "/api/admin/deals/:id", "admin", "admin")
      ]
    },
    // Special Deals - Deal 99Rs
    {
      name: "Special Deals - Deal 99Rs",
      item: [
        createRequest("Get All Deal 99Rs", "GET", "/api/admin/special-deals/deal-99rs", "admin", "admin", null, ["page", "limit", "status", "vendorId"]),
        createRequest("Approve Deal 99Rs", "PATCH", "/api/admin/special-deals/deal-99rs/:id/approve", "admin", "admin"),
        createRequest("Reject Deal 99Rs", "PATCH", "/api/admin/special-deals/deal-99rs/:id/reject", "admin", "admin"),
        createRequest("Delete Deal 99Rs", "DELETE", "/api/admin/special-deals/deal-99rs/:id", "admin", "admin")
      ]
    },
    // Special Deals - Day of Deals
    {
      name: "Special Deals - Day of Deals",
      item: [
        createRequest("Get All Day of Deals", "GET", "/api/admin/special-deals/day-of-deals", "admin", "admin", null, ["page", "limit", "status", "vendorId"]),
        createRequest("Approve Day of Deal", "PATCH", "/api/admin/special-deals/day-of-deals/:id/approve", "admin", "admin"),
        createRequest("Reject Day of Deal", "PATCH", "/api/admin/special-deals/day-of-deals/:id/reject", "admin", "admin"),
        createRequest("Delete Day of Deal", "DELETE", "/api/admin/special-deals/day-of-deals/:id", "admin", "admin")
      ]
    },
    // Special Deals - Hourly Deals
    {
      name: "Special Deals - Hourly Deals",
      item: [
        createRequest("Get All Hourly Deals", "GET", "/api/admin/special-deals/hourly-deals", "admin", "admin", null, ["page", "limit", "status", "vendorId"]),
        createRequest("Approve Hourly Deal", "PATCH", "/api/admin/special-deals/hourly-deals/:id/approve", "admin", "admin"),
        createRequest("Reject Hourly Deal", "PATCH", "/api/admin/special-deals/hourly-deals/:id/reject", "admin", "admin"),
        createRequest("Delete Hourly Deal", "DELETE", "/api/admin/special-deals/hourly-deals/:id", "admin", "admin")
      ]
    },
    // Special Deals - Heavy Discount Deals
    {
      name: "Special Deals - Heavy Discount Deals",
      item: [
        createRequest("Get All Heavy Discount Deals", "GET", "/api/admin/special-deals/heavy-discount-deals", "admin", "admin", null, ["page", "limit", "status", "vendorId"]),
        createRequest("Approve Heavy Discount Deal", "PATCH", "/api/admin/special-deals/heavy-discount-deals/:id/approve", "admin", "admin"),
        createRequest("Reject Heavy Discount Deal", "PATCH", "/api/admin/special-deals/heavy-discount-deals/:id/reject", "admin", "admin"),
        createRequest("Delete Heavy Discount Deal", "DELETE", "/api/admin/special-deals/heavy-discount-deals/:id", "admin", "admin")
      ]
    },
    // Cache Management
    {
      name: "Cache Management",
      item: [
        createRequest("Clear All Product Cache", "POST", "/api/admin/cache/clear", "admin", "admin"),
        createRequest("Get Product Cache Stats", "GET", "/api/admin/cache/stats", "admin", "admin")
      ]
    },
    // Ledger
    {
      name: "Ledger",
      item: [
        createRequest("Get Vendor Ledger Summary", "GET", "/api/admin/ledger/vendors", "admin", "admin", null, ["page", "limit"]),
        createRequest("Get Vendor Ledger Detail", "GET", "/api/admin/ledger/vendors/:id", "admin", "admin", null, ["page", "limit"])
      ]
    },
    // Emails
    {
      name: "Emails",
      item: [
        createRequest("Send Admin Email", "POST", "/api/admin/emails/send", "admin", "admin", {
          to: "recipient@example.com",
          subject: "Email Subject",
          html: "<p>Email content</p>",
          text: "Email content"
        }),
        createRequest("Send Admin Email Bulk", "POST", "/api/admin/emails/send-bulk", "admin", "admin", {
          to: ["email1@example.com", "email2@example.com"],
          subject: "Bulk Email Subject",
          html: "<p>Email content</p>",
          text: "Email content"
        })
      ]
    },
    // Page Content
    {
      name: "Page Content",
      item: [
        createRequest("Get All Page Content", "GET", "/api/admin/content", "admin", "admin"),
        createRequest("Create Page Content", "POST", "/api/admin/content", "admin", "admin"),
        createRequest("Update Page Content", "PUT", "/api/admin/content/:id", "admin", "admin"),
        createRequest("Delete Page Content", "DELETE", "/api/admin/content/:id", "admin", "admin")
      ]
    },
    // Admin Actions
    {
      name: "Admin Actions",
      item: [
        createRequest("Get Admin Actions", "GET", "/api/admin/actions", "admin", "admin", null, ["page", "limit"])
      ]
    }
  ]
};

// VENDOR FOLDER
const vendorFolder = {
  name: "Vendor",
  item: [
    // Dashboard
    {
      name: "Dashboard",
      item: [
        createRequest("Get Dashboard", "GET", "/api/vendors/dashboard", "vendor", "vendor"),
        createRequest("Get Sales Analytics", "GET", "/api/vendors/analytics/sales", "vendor", "vendor"),
        createRequest("Get Product Analytics", "GET", "/api/vendors/analytics/products", "vendor", "vendor")
      ]
    },
    // Products
    {
      name: "Products",
      item: [
        createRequest("Get All Products", "GET", "/api/vendors/products", "vendor", "vendor", null, ["page", "limit"]),
        createRequest("Get Products By Category", "GET", "/api/vendors/products/by-category", "vendor", "vendor"),
        createRequest("Get Product By ID", "GET", "/api/vendors/products/:id", "vendor", "vendor"),
        createRequest("Create Product", "POST", "/api/vendors/products", "vendor", "vendor", {
          name: "Product Name",
          description: "Product description",
          sku: "SKU123",
          price: 999.99,
          stock: 100,
          brandId: "brand_id",
          categoryId: "category_id",
          status: "active"
        }),
        createRequest("Update Product", "PUT", "/api/vendors/products/:id", "vendor", "vendor", {
          name: "Updated Product Name",
          price: 899.99,
          stock: 50
        }),
        createRequest("Delete Product", "DELETE", "/api/vendors/products/:id", "vendor", "vendor"),
        createRequest("Add Product Image", "POST", "/api/vendors/products/:id/images", "vendor", "vendor"),
        createRequest("Delete Product Image", "DELETE", "/api/vendors/products/:productId/images/:imageId", "vendor", "vendor")
      ]
    },
    // Product Variants
    {
      name: "Product Variants",
      item: [
        createRequest("Create Product Variant", "POST", "/api/vendors/products/:id/variants", "vendor", "vendor", {
          name: "Variant Name",
          sku: "VARIANT-SKU",
          price: 99.99,
          stock: 50
        }),
        createRequest("Update Product Variant", "PUT", "/api/vendors/products/:productId/variants/:variantId", "vendor", "vendor", {
          price: 89.99,
          stock: 40
        }),
        createRequest("Delete Product Variant", "DELETE", "/api/vendors/products/:productId/variants/:variantId", "vendor", "vendor")
      ]
    },
    // Variant Options
    {
      name: "Variant Options",
      item: [
        createRequest("Get Variant Options", "GET", "/api/vendors/variant-options", "vendor", "vendor"),
        createRequest("Get Variant Options By Type", "GET", "/api/vendors/variant-options/:type", "vendor", "vendor")
      ]
    },
    // Deals
    {
      name: "Deals",
      item: [
        createRequest("Get All Deals", "GET", "/api/vendors/deals", "vendor", "vendor", null, ["page", "limit", "status"]),
        createRequest("Create Deal", "POST", "/api/vendors/deals", "vendor", "vendor", {
          productId: "product_id",
          dealTypeId: "deal_type_id",
          discountPercentage: 20,
          startDate: "2024-01-01T00:00:00Z",
          endDate: "2024-12-31T23:59:59Z",
          status: "active"
        }),
        createRequest("Update Deal", "PUT", "/api/vendors/deals/:id", "vendor", "vendor", {
          discountPercentage: 25
        }),
        createRequest("Delete Deal", "DELETE", "/api/vendors/deals/:id", "vendor", "vendor")
      ]
    },
    // Special Deals - Deal 99Rs
    {
      name: "Special Deals - Deal 99Rs",
      item: [
        createRequest("Create Deal 99Rs", "POST", "/api/vendors/special-deals/deal-99rs", "vendor", "vendor", {
          productId: "product_id",
          price: 99
        }),
        createRequest("Get Vendor Deal 99Rs", "GET", "/api/vendors/special-deals/deal-99rs", "vendor", "vendor", null, ["page", "limit", "status"]),
        createRequest("Update Deal 99Rs", "PUT", "/api/vendors/special-deals/deal-99rs/:id", "vendor", "vendor", {
          price: 89
        }),
        createRequest("Delete Deal 99Rs", "DELETE", "/api/vendors/special-deals/deal-99rs/:id", "vendor", "vendor")
      ]
    },
    // Special Deals - Day of Deals
    {
      name: "Special Deals - Day of Deals",
      item: [
        createRequest("Create Day of Deal", "POST", "/api/vendors/special-deals/day-of-deals", "vendor", "vendor"),
        createRequest("Get Vendor Day of Deals", "GET", "/api/vendors/special-deals/day-of-deals", "vendor", "vendor", null, ["page", "limit", "status"]),
        createRequest("Update Day of Deal", "PUT", "/api/vendors/special-deals/day-of-deals/:id", "vendor", "vendor"),
        createRequest("Delete Day of Deal", "DELETE", "/api/vendors/special-deals/day-of-deals/:id", "vendor", "vendor")
      ]
    },
    // Special Deals - Hourly Deals
    {
      name: "Special Deals - Hourly Deals",
      item: [
        createRequest("Create Hourly Deal", "POST", "/api/vendors/special-deals/hourly-deals", "vendor", "vendor"),
        createRequest("Get Vendor Hourly Deals", "GET", "/api/vendors/special-deals/hourly-deals", "vendor", "vendor", null, ["page", "limit", "status"]),
        createRequest("Update Hourly Deal", "PUT", "/api/vendors/special-deals/hourly-deals/:id", "vendor", "vendor"),
        createRequest("Delete Hourly Deal", "DELETE", "/api/vendors/special-deals/hourly-deals/:id", "vendor", "vendor")
      ]
    },
    // Special Deals - Heavy Discount Deals
    {
      name: "Special Deals - Heavy Discount Deals",
      item: [
        createRequest("Create Heavy Discount Deal", "POST", "/api/vendors/special-deals/heavy-discount-deals", "vendor", "vendor"),
        createRequest("Get Vendor Heavy Discount Deals", "GET", "/api/vendors/special-deals/heavy-discount-deals", "vendor", "vendor", null, ["page", "limit", "status"]),
        createRequest("Update Heavy Discount Deal", "PUT", "/api/vendors/special-deals/heavy-discount-deals/:id", "vendor", "vendor"),
        createRequest("Delete Heavy Discount Deal", "DELETE", "/api/vendors/special-deals/heavy-discount-deals/:id", "vendor", "vendor")
      ]
    },
    // Orders
    {
      name: "Orders",
      item: [
        createRequest("Get All Orders", "GET", "/api/vendors/orders", "vendor", "vendor", null, ["page", "limit"]),
        createRequest("Get Order By ID", "GET", "/api/vendors/orders/:id", "vendor", "vendor"),
        createRequest("Get Order Status History", "GET", "/api/vendors/orders/:id/status-history", "vendor", "vendor"),
        createRequest("Update Order Status", "PATCH", "/api/vendors/orders/:id/status", "vendor", "vendor", {
          orderStatus: "shipped",
          trackingNumber: "TRACK123456"
        }),
        createRequest("Mark Order Ready", "PATCH", "/api/vendors/orders/:id/mark-ready", "vendor", "vendor"),
        createRequest("Generate Invoice", "GET", "/api/vendors/orders/:id/invoice", "vendor", "vendor"),
        createRequest("Generate Label", "GET", "/api/vendors/orders/:id/label", "vendor", "vendor")
      ]
    },
    // Profile & Settings
    {
      name: "Profile & Settings",
      item: [
        createRequest("Get Profile", "GET", "/api/vendors/profile", "vendor", "vendor"),
        createRequest("Update Profile", "PUT", "/api/vendors/profile", "vendor", "vendor", {
          name: "Updated Name",
          phone: "9876543210"
        }),
        createRequest("Get Settings", "GET", "/api/vendors/profile/settings", "vendor", "vendor"),
        createRequest("Update Settings", "PATCH", "/api/vendors/profile/settings", "vendor", "vendor", {
          autoAcceptOrders: true,
          emailNotifications: true
        })
      ]
    },
    // Earnings & Payouts
    {
      name: "Earnings & Payouts",
      item: [
        createRequest("Get Earnings", "GET", "/api/vendors/earnings", "vendor", "vendor"),
        createRequest("Get Earnings History", "GET", "/api/vendors/earnings/history", "vendor", "vendor"),
        createRequest("Update Payout Settings", "PUT", "/api/vendors/earnings/payout-settings", "vendor", "vendor", {
          payoutMethod: "bank_transfer",
          payoutSchedule: "weekly"
        })
      ]
    },
    // Reviews
    {
      name: "Reviews",
      item: [
        createRequest("Get Reviews", "GET", "/api/vendors/reviews", "vendor", "vendor", null, ["page", "limit"]),
        createRequest("Get Review Stats", "GET", "/api/vendors/reviews/stats", "vendor", "vendor")
      ]
    },
    // Brands
    {
      name: "Brands",
      item: [
        createRequest("Get All Brands", "GET", "/api/vendors/brands", "vendor", "vendor", null, ["page", "limit"]),
        createRequest("Get Brand By ID", "GET", "/api/vendors/brands/:id", "vendor", "vendor"),
        createRequest("Create Brand", "POST", "/api/vendors/brands", "vendor", "vendor", {
          name: "Brand Name",
          description: "Brand description",
          logoUrl: "https://example.com/logo.png"
        }),
        createRequest("Update Brand", "PUT", "/api/vendors/brands/:id", "vendor", "vendor", {
          name: "Updated Brand Name"
        }),
        createRequest("Delete Brand", "DELETE", "/api/vendors/brands/:id", "vendor", "vendor"),
        createRequest("Get Available Brands", "GET", "/api/vendors/available-brands", "vendor", "vendor")
      ]
    },
    // Categories & Deal Types
    {
      name: "Categories & Deal Types",
      item: [
        createRequest("Get Categories", "GET", "/api/vendors/categories", "vendor", "vendor"),
        createRequest("Get Deal Types", "GET", "/api/vendors/deal-types", "vendor", "vendor")
      ]
    }
  ]
};

// CUSTOMER FOLDER
const customerFolder = {
  name: "Customer",
  item: [
    // Profile
    {
      name: "Profile",
      item: [
        createRequest("Get Profile", "GET", "/api/users/profile", "customer", "customer"),
        createRequest("Get Complete Profile", "GET", "/api/users/profile/complete", "customer", "customer"),
        createRequest("Update Profile", "PUT", "/api/users/profile", "customer", "customer", {
          firstName: "John",
          lastName: "Doe",
          phone: "9876543210",
          profilePictureUrl: "https://example.com/profile.jpg"
        }),
        createRequest("Change Password", "PUT", "/api/users/change-password", "customer", "customer", {
          currentPassword: "oldpassword",
          newPassword: "newpassword"
        })
      ]
    },
    // Addresses
    {
      name: "Addresses",
      item: [
        createRequest("Get All Addresses", "GET", "/api/users/addresses", "customer", "customer"),
        createRequest("Create Address", "POST", "/api/users/addresses", "customer", "customer", {
          addressLine1: "123 Main Street",
          addressLine2: "Apt 4B",
          city: "Mumbai",
          state: "Maharashtra",
          zipCode: "400001",
          country: "India",
          name: "Home",
          phone: "9876543210",
          isDefault: true,
          latitude: 19.0760,
          longitude: 72.8777
        }),
        createRequest("Update Address", "PUT", "/api/users/addresses/:id", "customer", "customer", {
          addressLine1: "456 Updated Street",
          city: "Delhi",
          state: "Delhi"
        }),
        createRequest("Delete Address", "DELETE", "/api/users/addresses/:id", "customer", "customer")
      ]
    },
    // Cart
    {
      name: "Cart",
      item: [
        createRequest("Get Cart", "GET", "/api/users/cart", "customer", "customer"),
        createRequest("Add to Cart", "POST", "/api/users/cart", "customer", "customer", {
          productId: "product_id",
          variantId: "variant_id",
          quantity: 2
        }),
        createRequest("Sync Guest Cart", "POST", "/api/users/cart/sync", "customer", "customer", {
          items: [
            {
              productId: "product_id",
              variantId: null,
              quantity: 1
            }
          ]
        }),
        createRequest("Update Cart Item", "PUT", "/api/users/cart/:id", "customer", "customer", {
          quantity: 3
        }),
        createRequest("Remove from Cart", "DELETE", "/api/users/cart/:id", "customer", "customer"),
        createRequest("Clear Cart", "DELETE", "/api/users/cart", "customer", "customer")
      ]
    },
    // Wishlist
    {
      name: "Wishlist",
      item: [
        createRequest("Get Wishlist", "GET", "/api/users/wishlist", "customer", "customer"),
        createRequest("Add to Wishlist", "POST", "/api/users/wishlist", "customer", "customer", {
          productId: "product_id"
        }),
        createRequest("Remove from Wishlist", "DELETE", "/api/users/wishlist/:productId", "customer", "customer")
      ]
    },
    // Orders
    {
      name: "Orders",
      item: [
        createRequest("Get All Orders", "GET", "/api/users/orders", "customer", "customer", null, ["page", "limit"]),
        createRequest("Get Order By ID", "GET", "/api/users/orders/:id", "customer", "customer"),
        createRequest("Get Order Status History", "GET", "/api/users/orders/:id/status-history", "customer", "customer"),
        createRequest("Create Order", "POST", "/api/users/orders", "customer", "customer", {
          shippingAddressId: "address_id",
          shippingMethodId: "shipping_method_id",
          paymentMethodId: "payment_method_id",
          items: [
            {
              productId: "product_id",
              variantId: "variant_id",
              quantity: 2,
              price: 999.99
            }
          ],
          subtotal: 1999.98,
          tax: 360.00,
          shipping: 50.00,
          total: 2409.98
        }),
        createRequest("Cancel Order", "PATCH", "/api/users/orders/:id/cancel", "customer", "customer")
      ]
    },
    // Reviews
    {
      name: "Reviews",
      item: [
        createRequest("Get Reviews", "GET", "/api/users/reviews", "customer", "customer", null, ["page", "limit"]),
        createRequest("Create Review", "POST", "/api/users/reviews", "customer", "customer", {
          productId: "product_id",
          rating: 5,
          title: "Great Product",
          comment: "Really satisfied with the purchase"
        }),
        createRequest("Update Review", "PUT", "/api/users/reviews/:id", "customer", "customer", {
          rating: 4,
          comment: "Updated comment"
        }),
        createRequest("Delete Review", "DELETE", "/api/users/reviews/:id", "customer", "customer")
      ]
    },
    // Payment Methods
    {
      name: "Payment Methods",
      item: [
        createRequest("Get Payment Methods", "GET", "/api/users/payment-methods", "customer", "customer"),
        createRequest("Create Payment Method", "POST", "/api/users/payment-methods", "customer", "customer", {
          methodType: "credit_card",
          cardNumberLast4: "1234",
          expiryDate: "12/25",
          isDefault: true
        }),
        createRequest("Delete Payment Method", "DELETE", "/api/users/payment-methods/:id", "customer", "customer")
      ]
    },
    // Cashfree Payments
    {
      name: "Cashfree Payments",
      item: [
        createRequest("Create Cashfree Order", "POST", "/api/users/cashfree/create-order", "customer", "customer", {
          amount: 1000.00,
          currency: "INR",
          orderId: "order_id"
        }),
        createRequest("Verify Cashfree Payment", "POST", "/api/users/cashfree/verify-payment", "customer", "customer", {
          order_id: "cashfree_order_id",
          payment_session_id: "payment_session_id",
          orderId: "order_id"
        })
      ]
    }
  ]
};

// PUBLIC/SHARED FOLDER
const publicFolder = {
  name: "Public",
  item: [
    // Products
    {
      name: "Products",
      item: [
        createRequest("Get All Products", "GET", "/api/products", "public", null, null, ["page", "limit", "sortBy", "sortOrder"]),
        createRequest("Get Product By ID", "GET", "/api/products/:id", "public", null),
        createRequest("Get Product By Slug", "GET", "/api/products/slug/:slug", "public", null),
        createRequest("Get Product Price", "GET", "/api/products/:id/price", "public", null),
        createRequest("Get Products By Category", "GET", "/api/products/category/:id", "public", null, null, ["page", "limit"]),
        createRequest("Search Products", "GET", "/api/products/search/:query", "public", null, null, ["page", "limit"]),
        createRequest("Search Autocomplete", "GET", "/api/products/search/autocomplete", "public", null, null, ["q", "limit"]),
        createRequest("Get Featured Products", "GET", "/api/products/featured/list", "public", null, null, ["page", "limit"]),
        createRequest("Get Pre-order Products", "GET", "/api/products/pre-order/list", "public", null, null, ["page", "limit"]),
        createRequest("Get Deals", "GET", "/api/products/deals/list", "public", null, null, ["page", "limit"]),
        createRequest("Get 99Rs Deals", "GET", "/api/products/deals/99rs", "public", null),
        createRequest("Get Day of Deals", "GET", "/api/products/deals/day-of-deals", "public", null),
        createRequest("Get Hourly Deals", "GET", "/api/products/deals/hourly", "public", null),
        createRequest("Get Heavy Discount Deals", "GET", "/api/products/deals/heavy-discount", "public", null),
        createRequest("Get Products with Reels", "GET", "/api/products/reels", "public", null, null, ["page", "limit"]),
        createRequest("Download Reel", "POST", "/api/products/reels/download", "public", "customer"),
        createRequest("Get Bulk Prices", "POST", "/api/products/prices/bulk", "public", null, {
          productIds: ["product_id_1", "product_id_2"]
        })
      ]
    },
    // Categories
    {
      name: "Categories",
      item: [
        createRequest("Get All Categories", "GET", "/api/categories", "public", null),
        createRequest("Get All Categories Flat", "GET", "/api/categories/flat", "public", null),
        createRequest("Get All Subcategories", "GET", "/api/categories/subcategories", "public", null),
        createRequest("Get Subcategories", "GET", "/api/categories/:id/subcategories", "public", null),
        createRequest("Get Category By ID", "GET", "/api/categories/:id", "public", null)
      ]
    },
    // Brands
    {
      name: "Brands",
      item: [
        createRequest("Get All Brands", "GET", "/api/brands", "public", null, null, ["page", "limit", "vendorId"]),
        createRequest("Get Brands By Vendor", "GET", "/api/brands/vendor/:vendorId", "public", null, null, ["page", "limit"]),
        createRequest("Get Products By Brand Slug", "GET", "/api/brands/:slug/products", "public", null),
        createRequest("Get Brand By Slug", "GET", "/api/brands/slug/:slug", "public", null),
        createRequest("Get Brand By ID", "GET", "/api/brands/:id", "public", null)
      ]
    },
    // Vendors
    {
      name: "Vendors",
      item: [
        createRequest("Get Public Vendors", "GET", "/api/public/vendors", "public", null),
        createRequest("Get Vendor Products", "GET", "/api/public/vendors/:vendorId/products", "public", null)
      ]
    },
    // Orders
    {
      name: "Orders",
      item: [
        createRequest("Track Order", "GET", "/api/orders/track/:orderNumber", "public", null)
      ]
    },
    // Deals
    {
      name: "Deals",
      item: [
        createRequest("Get Active Deals", "GET", "/api/deals", "public", null)
      ]
    },
    // Home Page
    {
      name: "Home Page",
      item: [
        createRequest("Get Home Page Data", "GET", "/api/home-page", "public", null)
      ]
    },
    // Shop Page
    {
      name: "Shop Page",
      item: [
        createRequest("Get Shop Page Data", "GET", "/api/shop-page", "public", null)
      ]
    },
    // Product Details
    {
      name: "Product Details",
      item: [
        createRequest("Get Product Details", "GET", "/api/product-details", "public", null, null, ["slug"])
      ]
    },
    // Brand Details
    {
      name: "Brand Details",
      item: [
        createRequest("Get Brand Details", "GET", "/api/brand-details", "public", null, null, ["slug"])
      ]
    }
  ]
};

// Add all folders to collection
collection.item = [
  authFolder,
  adminFolder,
  vendorFolder,
  customerFolder,
  publicFolder
];

// Write collection to file
fs.writeFileSync(
  'DealRush_API_Collection.postman_collection.json',
  JSON.stringify(collection, null, 2)
);

console.log('✅ Postman collection generated successfully!');
console.log('📁 File: DealRush_API_Collection.postman_collection.json');
