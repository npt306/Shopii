import { http, HttpResponse } from 'msw';

// Base URLs for different services
const VOUCHER_API_BASE = '/api/vouchers';
const PRODUCT_API_BASE = '/api/product/admin/products';
const CATEGORY_API_BASE = 'http://34.58.241.34:3001/categories'; // Use full URL if external
const ACCOUNT_API_BASE = '/api/accounts';
const LOGIN_API_BASE = 'http://34.58.241.34:3003/Users/login-admin'; // Use full URL if external

// --- Mock Data ---
const mockVouchers = [
  {
    id: 1,
    name: 'Test Voucher 1',
    code: 'TEST1',
    starts_at: new Date().toISOString(),
    ends_at: new Date(Date.now() + 86400000 * 7).toISOString(), // + 7 days
    per_customer_limit: 1,
    total_usage_limit: 100,
    condition_type: 'min_order',
    action_type: 'fixed_amount',
    discount_amount: 10000,
    min_order_amount: 50000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Expired Voucher',
    code: 'EXPIRED',
    starts_at: new Date(Date.now() - 86400000 * 14).toISOString(), // - 14 days
    ends_at: new Date(Date.now() - 86400000 * 7).toISOString(),   // - 7 days
    per_customer_limit: 1,
    total_usage_limit: 50,
    condition_type: 'none',
    action_type: 'percentage',
    discount_percentage: 10,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const mockProducts = {
  products: [
    {
      id: 101,
      name: 'Product A',
      status: 'Approved',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      minPrice: 50000,
      maxPrice: 60000,
    },
    {
      id: 102,
      name: 'Product B Pending',
      status: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      minPrice: 150000,
      maxPrice: 160000,
    },
  ],
  total: 2,
  page: 1,
  limit: 10,
};

const mockProductDetail = {
    id: 101,
    name: 'Product A',
    description: 'Detailed description for Product A.',
    categories: ['Electronics', 'Gadgets'],
    images: ['img1.jpg', 'img2.jpg'],
    soldQuantity: 150,
    rating: 4.5,
    coverImage: 'cover.jpg',
    video: 'video.mp4',
    quantity: 500,
    reviews: 25,
    classifications: [
      { classTypeName: 'Color', level: 1 },
      { classTypeName: 'Size', level: 1 }
    ],
    details: [
      { type_id: 1, type_1: 'Red', type_2: 'M', image: 'red_m.jpg', price: 55000, quantity: 200 },
      { type_id: 2, type_1: 'Blue', type_2: 'L', image: 'blue_l.jpg', price: 60000, quantity: 300 }
    ],
     status: 'Approved',
     createdAt: new Date().toISOString(),
     updatedAt: new Date().toISOString(),
     minPrice: 50000,
     maxPrice: 60000,
  };


const mockCategories = [
    { CategoryID: 1, CategoryName: 'Electronics', ParentID: null, isActive: true, children: [
        { CategoryID: 3, CategoryName: 'Mobile Phones', ParentID: 1, isActive: true },
        { CategoryID: 4, CategoryName: 'Laptops', ParentID: 1, isActive: false }
    ]},
    { CategoryID: 2, CategoryName: 'Fashion', ParentID: null, isActive: true }
];

const mockUsers = {
    seller: [
        { AccountId: 1, Username: 'seller1', Email: 'seller1@test.com', Status: 'active', roles: ['seller'], DoB: '1990-01-01', PhoneNumber: '123456789', Sex: true, CreatedAt: new Date().toISOString(), UpdatedAt: new Date().toISOString() },
        { AccountId: 2, Username: 'seller2_inactive', Email: 'seller2@test.com', Status: 'inactive', roles: ['seller'], DoB: '1992-05-10', PhoneNumber: '987654321', Sex: false, CreatedAt: new Date().toISOString(), UpdatedAt: new Date().toISOString() },
    ],
    buyer: [
        { AccountId: 3, Username: 'buyer1', Email: 'buyer1@test.com', Status: 'active', roles: ['buyer'], DoB: '1995-03-15', PhoneNumber: '112233445', Sex: true, CreatedAt: new Date().toISOString(), UpdatedAt: new Date().toISOString() },
    ],
    admin: [
        { AccountId: 4, Username: 'admin1', Email: 'admin1@test.com', Status: 'active', roles: ['admin'], DoB: '1988-11-20', PhoneNumber: '556677889', Sex: false, CreatedAt: new Date().toISOString(), UpdatedAt: new Date().toISOString() },
    ]
};

const mockUserDetail = {
  AccountId: 1,
  Email: 'seller1@test.com',
  Username: 'seller1',
  Avatar: null,
  DoB: '1990-01-01T00:00:00.000Z',
  PhoneNumber: '123456789',
  Sex: true,
  Status: 'active',
  CreatedAt: new Date().toISOString(),
  UpdatedAt: new Date().toISOString(),
  seller: {
    id: 10,
    ShopName: 'Seller One Shop',
    TaxCode: 12345,
    SellerType: 'Official',
    Email: ['shop@seller1.com'],
    Followers: 1000,
    CreatedAt: new Date().toISOString(),
    UpdatedAt: new Date().toISOString(),
  },
  address: {
    AddressId: 100,
    Fullname: 'Seller One',
    PhoneNumber: '123456789',
    Province: 'Test Province',
    District: 'Test District',
    Ward: 'Test Ward',
    SpecificAddress: '123 Test St',
    CreatedAt: new Date().toISOString(),
    UpdatedAt: new Date().toISOString(),
    AccountId: 1,
    IsDefault: true,
  },
  roles: ['seller'], // Added roles for completeness if needed in detail view logic
};


// --- Handlers ---
export const handlers = [
  // === Login ===
  http.post(LOGIN_API_BASE, async ({ request }) => {
    const body = await request.json();
    // Basic validation for mock
    if (body.username === 'admin@test.com' && body.password === 'password' && body.otpCode === '123456') {
      return HttpResponse.json({ message: 'Login successful', token: 'fake-token' }, { status: 200 });
    } else if (body.username === 'admin@test.com' && body.password === 'password' && body.otpCode !== '123456'){
        return HttpResponse.json({ message: 'Invalid OTP' }, { status: 401 });
    }
     else {
      return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
  }),

  // === Vouchers ===
  http.get(VOUCHER_API_BASE, () => {
    return HttpResponse.json(mockVouchers);
  }),

  http.get(`${VOUCHER_API_BASE}/:id`, ({ params }) => {
    const voucher = mockVouchers.find(v => v.id === Number(params.id));
    if (voucher) {
      return HttpResponse.json(voucher);
    }
    return new HttpResponse(null, { status: 404 });
  }),

  http.post(VOUCHER_API_BASE, async ({ request }) => {
    const newVoucher = await request.json();
    // Basic validation for mock
    if (newVoucher.name && newVoucher.code && newVoucher.starts_at && newVoucher.ends_at) {
      const createdVoucher = { ...newVoucher, id: Date.now() }; // Assign a mock ID
      mockVouchers.push(createdVoucher); // Add to mock list (won't persist between tests)
      return HttpResponse.json(createdVoucher, { status: 201 });
    }
    return HttpResponse.json({ message: 'Missing required fields' }, { status: 400 });
  }),

  http.patch(`${VOUCHER_API_BASE}/:id`, async ({ params, request }) => {
    const index = mockVouchers.findIndex(v => v.id === Number(params.id));
    if (index !== -1) {
      const updatedData = await request.json();
      // In a real scenario, you'd merge carefully, here we just simulate success
       mockVouchers[index] = { ...mockVouchers[index], ...updatedData };
       return HttpResponse.json(mockVouchers[index]); // Return updated voucher
    }
    return new HttpResponse(null, { status: 404 });
  }),

  http.delete(`${VOUCHER_API_BASE}/:id`, ({ params }) => {
    const index = mockVouchers.findIndex(v => v.id === Number(params.id));
    if (index !== -1) {
      // Simulate deletion (doesn't actually modify the array for other tests)
      return new HttpResponse(null, { status: 204 });
    }
    return new HttpResponse(null, { status: 404 });
  }),

  // === Products ===
   http.get(PRODUCT_API_BASE, ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');

    let filteredProducts = [...mockProducts.products];

    if (status) {
        filteredProducts = filteredProducts.filter(p => p.status === status);
    }
    if (search) {
        filteredProducts = filteredProducts.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    }

    // Simple pagination mock - doesn't fully implement page/limit logic here
    return HttpResponse.json({
        products: filteredProducts,
        total: filteredProducts.length, // Adjust total based on filter for mock
        page: 1, // Keep page/limit simple for mock
        limit: 10
    });
  }),

  http.get(`${PRODUCT_API_BASE}/:id`, ({ params }) => {
    if (Number(params.id) === mockProductDetail.id) {
        return HttpResponse.json(mockProductDetail);
    }
    return new HttpResponse(null, { status: 404 });
  }),

  http.patch(`${PRODUCT_API_BASE}/:id/approve`, ({ params }) => {
     const product = mockProducts.products.find(p => p.id === Number(params.id));
     if (product) {
        // Simulate approval
        return HttpResponse.json({ ...product, status: 'Approved' });
     }
     return new HttpResponse(null, { status: 404 });
  }),

  http.patch(`${PRODUCT_API_BASE}/:id/block`, async ({ params, request }) => {
    const product = mockProducts.products.find(p => p.id === Number(params.id));
    if (product) {
        const body = await request.json();
        console.log("Mock Block Reason:", body.reason); // Log reason if needed
        // Simulate blocking
        return HttpResponse.json({ ...product, status: 'Violated' });
    }
     return new HttpResponse(null, { status: 404 });
  }),

  http.delete(`${PRODUCT_API_BASE}/:id`, async ({ params, request }) => {
     const index = mockProducts.products.findIndex(p => p.id === Number(params.id));
     if (index !== -1) {
        const body = await request.json();
        console.log("Mock Delete Reason:", body.reason); // Log reason if needed
        // Simulate deletion
        return new HttpResponse(null, { status: 204 });
     }
     return new HttpResponse(null, { status: 404 });
  }),

  // === Categories === (Using full URL)
  http.get(CATEGORY_API_BASE, () => {
      return HttpResponse.json(mockCategories);
  }),

   http.get(`${CATEGORY_API_BASE}/:id`, ({ params }) => {
     // Need a function to find category recursively if needed, or flatten first
     const findCat = (cats: any[], id: number): any | null => {
        for (const cat of cats) {
            if (cat.CategoryID === id) return cat;
            if (cat.children) {
                const found = findCat(cat.children, id);
                if (found) return found;
            }
        }
        return null;
     }
     const category = findCat(mockCategories, Number(params.id));
     if (category) {
         return HttpResponse.json(category);
     }
     return new HttpResponse(null, { status: 404 });
   }),

   http.post(CATEGORY_API_BASE, async ({ request }) => {
     const newCategory = await request.json();
     if (newCategory.CategoryName) {
         const created = { ...newCategory, CategoryID: Date.now(), isActive: true };
         // Add to mock list (simple, doesn't handle parent/child correctly here)
         return HttpResponse.json(created, { status: 201 });
     }
     return HttpResponse.json({ message: 'Missing CategoryName' }, { status: 400 });
   }),

   http.put(`${CATEGORY_API_BASE}/:id`, async ({ params, request }) => {
     const categoryId = Number(params.id);
     const updatedData = await request.json();
     // Simulate update - finding and updating in a nested structure is complex for a mock
     // Just return success if name exists
     if (updatedData.CategoryName) {
        return HttpResponse.json({ CategoryID: categoryId, ...updatedData });
     }
     return HttpResponse.json({ message: 'Update failed' }, { status: 400 });
   }),

    http.patch(`${CATEGORY_API_BASE}/:id/toggle`, async ({ params, request }) => {
        const categoryId = Number(params.id);
        const body = await request.json();
        // Simulate toggle success
        return HttpResponse.json({ CategoryID: categoryId, isActive: body.isActive });
    }),

   http.delete(`${CATEGORY_API_BASE}/:id`, ({ params }) => {
      // Simulate delete success
      return new HttpResponse(null, { status: 204 });
   }),

  // === Accounts ===
   http.get(`${ACCOUNT_API_BASE}/role/:role`, ({ params }) => {
     const role = params.role as keyof typeof mockUsers;
     if (mockUsers[role]) {
       return HttpResponse.json(mockUsers[role]);
     }
     return HttpResponse.json([]); // Return empty array if role not found
   }),

   http.get(`${ACCOUNT_API_BASE}/:id/details`, ({ params }) => {
      if (Number(params.id) === mockUserDetail.AccountId) {
          return HttpResponse.json(mockUserDetail);
      }
      return new HttpResponse(null, { status: 404 });
   }),

    http.patch(`${ACCOUNT_API_BASE}/:id/status`, async ({ params, request }) => {
        const accountId = Number(params.id);
        const { status } = await request.json();
        // Simulate success
        return HttpResponse.json({ AccountId: accountId, Status: status });
    }),

    http.delete(`${ACCOUNT_API_BASE}/:id`, ({ params }) => {
        const accountId = Number(params.id);
        // Simulate delete success
        return new HttpResponse(null, { status: 204 });
    }),

];
