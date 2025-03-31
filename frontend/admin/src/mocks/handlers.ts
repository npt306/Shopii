import { http, HttpResponse } from 'msw';

const VOUCHER_API_BASE = '/api/vouchers';
const PRODUCT_API_BASE = '/api/product/admin/products';
const CATEGORY_API_BASE = 'http://34.58.241.34:3001/categories'; 
const ACCOUNT_API_BASE = '/api/accounts';
const LOGIN_API_BASE = 'http://34.58.241.34:3003/Users/login-admin'; 

let mockVouchers = [

   {
    id: 1,
    name: 'Test Voucher 1',
    code: 'TEST1',
    starts_at: new Date().toISOString(),
    ends_at: new Date(Date.now() + 86400000 * 7).toISOString(), 
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
    starts_at: new Date(Date.now() - 86400000 * 14).toISOString(), 
    ends_at: new Date(Date.now() - 86400000 * 7).toISOString(),   
    per_customer_limit: 1,
    total_usage_limit: 50,
    condition_type: 'none',
    action_type: 'percentage',
    discount_percentage: 10,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

let mockApiProducts = [ 
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
];

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
      { classTypeName: 'Size', level: 2 }   
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
  roles: ['seller'],
};

export const handlers = [

   http.post(LOGIN_API_BASE, async ({ request }) => {
    const body = await request.json();

    if (body.username === 'admin@test.com' && body.password === 'password' && body.otpCode === '123456') {
      return HttpResponse.json({ message: 'Login successful', token: 'fake-token' }, { status: 200 });
    } else if (body.username === 'admin@test.com' && body.password === 'password' && body.otpCode !== '123456'){
        return HttpResponse.json({ message: 'Invalid OTP' }, { status: 401 });
    }
     else {
      return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
  }),

   http.get(VOUCHER_API_BASE, ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');
    let page = parseInt(url.searchParams.get('page') || '1', 10);
    let limit = parseInt(url.searchParams.get('limit') || '10', 10);

    let filteredVouchers = [...mockVouchers];

    const now = new Date();
    if (status === 'active') {
        filteredVouchers = filteredVouchers.filter(v => new Date(v.starts_at) <= now && new Date(v.ends_at) >= now);
    } else if (status === 'upcoming') {
        filteredVouchers = filteredVouchers.filter(v => new Date(v.starts_at) > now);
    } else if (status === 'expired') {
        filteredVouchers = filteredVouchers.filter(v => new Date(v.ends_at) < now);
    }

    if (search) {
        filteredVouchers = filteredVouchers.filter(v =>
            v.name.toLowerCase().includes(search.toLowerCase()) ||
            v.code.toLowerCase().includes(search.toLowerCase())
        );
    }

    const total = filteredVouchers.length;
    const paginatedVouchers = filteredVouchers.slice((page - 1) * limit, page * limit);

    return HttpResponse.json({ data: paginatedVouchers, total });
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

    if (newVoucher.name && newVoucher.code && newVoucher.starts_at && newVoucher.ends_at) {
      const createdVoucher = { ...newVoucher, id: Date.now(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() }; 
      mockVouchers.push(createdVoucher); 
      return HttpResponse.json(createdVoucher, { status: 201 });
    }
    return HttpResponse.json({ message: 'Missing required fields' }, { status: 400 });
  }),

  http.patch(`${VOUCHER_API_BASE}/:id`, async ({ params, request }) => {
    const index = mockVouchers.findIndex(v => v.id === Number(params.id));
    if (index !== -1) {
      const updatedData = await request.json();
       mockVouchers[index] = { ...mockVouchers[index], ...updatedData, updated_at: new Date().toISOString() }; 
       return HttpResponse.json(mockVouchers[index]); 
    }
    return new HttpResponse(null, { status: 404 });
  }),

  http.delete(`${VOUCHER_API_BASE}/:id`, ({ params }) => {
    const index = mockVouchers.findIndex(v => v.id === Number(params.id));
    if (index !== -1) {
      mockVouchers.splice(index, 1); 
      return new HttpResponse(null, { status: 204 });
    }
    return new HttpResponse(null, { status: 404 });
  }),

   http.get(PRODUCT_API_BASE, ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);

    let filteredProducts = [...mockApiProducts]; 

    if (status) {
        filteredProducts = filteredProducts.filter(p => p.status === status);
    }
    if (search) {
        filteredProducts = filteredProducts.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    }

    const total = filteredProducts.length;
    const paginatedProducts = filteredProducts.slice((page - 1) * limit, page * limit);

    console.log(`[MSW] GET ${PRODUCT_API_BASE} (page: ${page}, limit: ${limit}, status: ${status}, search: ${search}) -> Returning ${paginatedProducts.length} of ${total}`);

    return HttpResponse.json({
        products: paginatedProducts,
        total: total,
        page: page,
        limit: limit
    });
  }),

  http.get(`${PRODUCT_API_BASE}/:id`, ({ params }) => {

    const product = mockApiProducts.find(p => p.id === Number(params.id));
    if (product && product.id === mockProductDetail.id) { 
        return HttpResponse.json(mockProductDetail);
    } else if (product) {

         return HttpResponse.json(product);
    }
    return new HttpResponse(null, { status: 404 });
  }),

  http.patch(`${PRODUCT_API_BASE}/:id/approve`, ({ params }) => {
     const product = mockApiProducts.find(p => p.id === Number(params.id));
     if (product) {
        product.status = 'Approved'; 
        return HttpResponse.json({ ...product });
     }
     return new HttpResponse(null, { status: 404 });
  }),

  http.patch(`${PRODUCT_API_BASE}/:id/block`, async ({ params, request }) => {
    const product = mockApiProducts.find(p => p.id === Number(params.id));
    if (product) {
        const body = await request.json();
        console.log("[MSW] Mock Block Reason:", body.reason); 
        product.status = 'Violated'; 
        return HttpResponse.json({ ...product });
    }
     return new HttpResponse(null, { status: 404 });
  }),

  http.delete(`${PRODUCT_API_BASE}/:id`, async ({ params, request }) => {
     const index = mockApiProducts.findIndex(p => p.id === Number(params.id));
     if (index !== -1) {
        const body = await request.json().catch(() => ({})); 
        console.log("[MSW] Mock Delete Reason:", body.reason);
        mockApiProducts.splice(index, 1); 
        console.log(`[MSW] DELETE ${PRODUCT_API_BASE}/${params.id} -> Success. Remaining products: ${mockApiProducts.length}`);
        return new HttpResponse(null, { status: 204 }); 
     }
     console.log(`[MSW] DELETE ${PRODUCT_API_BASE}/${params.id} -> Not Found.`);
     return new HttpResponse(null, { status: 404 }); 
  }),

   http.get(CATEGORY_API_BASE, () => {
      return HttpResponse.json(mockCategories);
  }),

   http.get(`${CATEGORY_API_BASE}/:id`, ({ params }) => {

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

         return HttpResponse.json(created, { status: 201 });
     }
     return HttpResponse.json({ message: 'Missing CategoryName' }, { status: 400 });
   }),

   http.put(`${CATEGORY_API_BASE}/:id`, async ({ params, request }) => {
     const categoryId = Number(params.id);
     const updatedData = await request.json();

     if (updatedData.CategoryName) {
        return HttpResponse.json({ CategoryID: categoryId, ...updatedData });
     }
     return HttpResponse.json({ message: 'Update failed' }, { status: 400 });
   }),

    http.patch(`${CATEGORY_API_BASE}/:id/toggle`, async ({ params, request }) => {
        const categoryId = Number(params.id);
        const body = await request.json();

        return HttpResponse.json({ CategoryID: categoryId, isActive: body.isActive });
    }),

   http.delete(`${CATEGORY_API_BASE}/:id`, ({ params }) => {

      return new HttpResponse(null, { status: 204 });
   }),

  http.get(`${ACCOUNT_API_BASE}/role/:role`, ({ params }) => {
     const role = params.role as keyof typeof mockUsers;
     if (mockUsers[role]) {
       return HttpResponse.json(mockUsers[role]);
     }
     return HttpResponse.json([]); 
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

        return HttpResponse.json({ AccountId: accountId, Status: status });
    }),

    http.delete(`${ACCOUNT_API_BASE}/:id`, ({ params }) => {
        const accountId = Number(params.id);

        return new HttpResponse(null, { status: 204 });
    }),

];