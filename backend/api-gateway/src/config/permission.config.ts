export const PERMISSIONS_MAPPING: { [route: string]: string | string[] } = {
    '/Users/profile': 'Accounts#View',
    '/product/view': 'Product#View',
    '/product/edit': 'Product#Edit',
    '/product/delete': 'Product#Delete',
    '/product/add': 'Product#Add',
};