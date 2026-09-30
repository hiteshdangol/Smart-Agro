const PERMISSIONS = {
  'products:view':        'View shop products',
  'products:create':      'Create own listings',
  'products:edit_own':    'Edit own products',
  'products:delete_own':  'Delete own products',
  'products:manage_all':  'CRUD any product',
  'orders:create':        'Place orders',
  'orders:view_own':      'View own orders',
  'orders:manage_all':    'View/update any order',
  'users:view':           'See user list',
  'users:manage_role':    'Change user roles',
  'users:manage_permissions': 'Toggle individual permissions',
  'users:delete':         'Delete users',
  'records:add':          'Add crop records',
  'records:view_own':     'View own records',
  'records:view_all':     'View all records',
  'records:delete':       'Delete crop records',
  'medicines:view':       'View medicine suggestions',
  'medicines:manage':     'CRUD medicine database',
  'admin:access':         'Access admin dashboard',
};

const PERMISSION_LIST = Object.entries(PERMISSIONS).map(([key, label]) => ({ key, label }));

const DEFAULT_ROLES = [
  {
    name: 'Admin',
    description: 'Full system access',
    permissions: Object.keys(PERMISSIONS),
    isDefault: false,
  },
  {
    name: 'Farmer',
    description: 'Standard farmer account',
    permissions: [
      'products:view',
      'products:create',
      'products:edit_own',
      'products:delete_own',
      'orders:create',
      'orders:view_own',
      'records:add',
      'records:view_own',
    ],
    isDefault: true,
  },
];

module.exports = { PERMISSIONS, PERMISSION_LIST, DEFAULT_ROLES };
