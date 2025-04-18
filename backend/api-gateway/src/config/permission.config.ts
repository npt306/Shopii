export const PERMISSIONS_MAPPING: { [route: string]: string | string[] } = {
    //product
    '/api/admin/products': 'Product#View',
    'GET /api/admin/products/:id': 'Product#ViewDetail',
    'DELETE /api/admin/products/:id': 'Product#Delete',
    '/api/product/:id/approve': 'Product#Approve',
    '/api/product/:id/block': 'Product#Ban',

    //account
    '/api/accounts/:id/ban': 'Accounts#Ban',
    '/api/accounts/unban': 'Accounts#Unban',
    '/api/accounts/delete': 'Accounts#Delete',

    //voucher
    

    //order

    //users ?
};