export const JOIN_PATHS = {
  EMPLOYEES: {
    DEPARTMENTS: [
      {
        from_table: "EMPLOYEES",
        from_column: "dept_id",
        to_table: "DEPARTMENTS",
        to_column: "id",
        join_type: "INNER JOIN",
        label: "Employees belong to departments"
      }
    ],
    ROLES: [
      {
        from_table: "EMPLOYEES",
        from_column: "role_id",
        to_table: "ROLES",
        to_column: "id",
        join_type: "INNER JOIN",
        label: "Employees belong to roles"
      }
    ],
    EMPLOYEE_DETAILS: [
      {
        from_table: "EMPLOYEES",
        from_column: "id",
        to_table: "EMPLOYEE_DETAILS",
        to_column: "employee_id",
        join_type: "INNER JOIN",
        label: "Employee one-to-one details"
      }
    ],
    ATTENDANCE: [
      {
        from_table: "EMPLOYEES",
        from_column: "id",
        to_table: "ATTENDANCE",
        to_column: "employee_id",
        join_type: "LEFT JOIN",
        label: "Employee attendance records"
      }
    ],
    LEAVES: [
      {
        from_table: "EMPLOYEES",
        from_column: "id",
        to_table: "LEAVES",
        to_column: "employee_id",
        join_type: "LEFT JOIN",
        label: "Employee leave records"
      }
    ],
    PROJECTS: [
      {
        from_table: "EMPLOYEES",
        from_column: "id",
        to_table: "EMPLOYEE_PROJECTS",
        to_column: "employee_id",
        join_type: "INNER JOIN",
        label: "Employees assigned to project bridge"
      },
      {
        from_table: "EMPLOYEE_PROJECTS",
        from_column: "project_id",
        to_table: "PROJECTS",
        to_column: "id",
        join_type: "INNER JOIN",
        label: "Bridge to projects"
      }
    ],
    EMPLOYEES: [
      {
        from_table: "EMPLOYEES",
        from_column: "manager_id",
        to_table: "EMPLOYEES",
        to_column: "id",
        join_type: "LEFT JOIN",
        label: "Employee to manager self join"
      }
    ]
  },

  DEPARTMENTS: {
    EMPLOYEES: [
      {
        from_table: "DEPARTMENTS",
        from_column: "id",
        to_table: "EMPLOYEES",
        to_column: "dept_id",
        join_type: "LEFT JOIN",
        label: "Departments to employees"
      }
    ],
    PROJECTS: [
      {
        from_table: "DEPARTMENTS",
        from_column: "id",
        to_table: "PROJECTS",
        to_column: "dept_id",
        join_type: "LEFT JOIN",
        label: "Departments to projects"
      }
    ]
  },

  ROLES: {
    EMPLOYEES: [
      {
        from_table: "ROLES",
        from_column: "id",
        to_table: "EMPLOYEES",
        to_column: "role_id",
        join_type: "LEFT JOIN",
        label: "Roles to employees"
      }
    ],
    PERMISSIONS: [
      {
        from_table: "ROLES",
        from_column: "id",
        to_table: "ROLE_PERMISSIONS",
        to_column: "role_id",
        join_type: "INNER JOIN",
        label: "Roles to role-permission bridge"
      },
      {
        from_table: "ROLE_PERMISSIONS",
        from_column: "permission_id",
        to_table: "PERMISSIONS",
        to_column: "id",
        join_type: "INNER JOIN",
        label: "Bridge to permissions"
      }
    ]
  },

  CUSTOMERS: {
    CUSTOMER_ADDRESSES: [
      {
        from_table: "CUSTOMERS",
        from_column: "id",
        to_table: "CUSTOMER_ADDRESSES",
        to_column: "customer_id",
        join_type: "LEFT JOIN",
        label: "Customers to addresses"
      }
    ],
    ORDERS: [
      {
        from_table: "CUSTOMERS",
        from_column: "id",
        to_table: "ORDERS",
        to_column: "customer_id",
        join_type: "LEFT JOIN",
        label: "Customers to orders"
      }
    ],
    REVIEWS: [
      {
        from_table: "CUSTOMERS",
        from_column: "id",
        to_table: "REVIEWS",
        to_column: "customer_id",
        join_type: "LEFT JOIN",
        label: "Customers to reviews"
      }
    ],
    CUSTOMERS: [
      {
        from_table: "CUSTOMERS",
        from_column: "referred_by_customer_id",
        to_table: "CUSTOMERS",
        to_column: "id",
        join_type: "LEFT JOIN",
        label: "Customer referral self join"
      }
    ],
    PRODUCTS: [
      {
        from_table: "CUSTOMERS",
        from_column: "id",
        to_table: "ORDERS",
        to_column: "customer_id",
        join_type: "INNER JOIN",
        label: "Customers to orders"
      },
      {
        from_table: "ORDERS",
        from_column: "id",
        to_table: "ORDER_ITEMS",
        to_column: "order_id",
        join_type: "INNER JOIN",
        label: "Orders to order items"
      },
      {
        from_table: "ORDER_ITEMS",
        from_column: "product_id",
        to_table: "PRODUCTS",
        to_column: "id",
        join_type: "INNER JOIN",
        label: "Order items to products"
      }
    ]
  },

  PRODUCTS: {
    CATEGORIES: [
      {
        from_table: "PRODUCTS",
        from_column: "category_id",
        to_table: "CATEGORIES",
        to_column: "id",
        join_type: "INNER JOIN",
        label: "Products belong to categories"
      }
    ],
    SUPPLIERS: [
      {
        from_table: "PRODUCTS",
        from_column: "supplier_id",
        to_table: "SUPPLIERS",
        to_column: "id",
        join_type: "INNER JOIN",
        label: "Products belong to suppliers"
      }
    ],
    ORDERS: [
      {
        from_table: "PRODUCTS",
        from_column: "id",
        to_table: "ORDER_ITEMS",
        to_column: "product_id",
        join_type: "INNER JOIN",
        label: "Products to order items"
      },
      {
        from_table: "ORDER_ITEMS",
        from_column: "order_id",
        to_table: "ORDERS",
        to_column: "id",
        join_type: "INNER JOIN",
        label: "Order items to orders"
      }
    ],
    REVIEWS: [
      {
        from_table: "PRODUCTS",
        from_column: "id",
        to_table: "REVIEWS",
        to_column: "product_id",
        join_type: "LEFT JOIN",
        label: "Products to reviews"
      }
    ],
    WAREHOUSES: [
      {
        from_table: "PRODUCTS",
        from_column: "id",
        to_table: "INVENTORY",
        to_column: "product_id",
        join_type: "INNER JOIN",
        label: "Products to inventory"
      },
      {
        from_table: "INVENTORY",
        from_column: "warehouse_id",
        to_table: "WAREHOUSES",
        to_column: "id",
        join_type: "INNER JOIN",
        label: "Inventory to warehouses"
      }
    ]
  },

  ORDERS: {
    CUSTOMERS: [
      {
        from_table: "ORDERS",
        from_column: "customer_id",
        to_table: "CUSTOMERS",
        to_column: "id",
        join_type: "INNER JOIN",
        label: "Orders belong to customers"
      }
    ],
    CUSTOMER_ADDRESSES: [
      {
        from_table: "ORDERS",
        from_column: "shipping_address_id",
        to_table: "CUSTOMER_ADDRESSES",
        to_column: "id",
        join_type: "LEFT JOIN",
        label: "Orders use shipping addresses"
      }
    ],
    COUPONS: [
      {
        from_table: "ORDERS",
        from_column: "coupon_id",
        to_table: "COUPONS",
        to_column: "id",
        join_type: "LEFT JOIN",
        label: "Orders may use coupons"
      }
    ],
    ORDER_ITEMS: [
      {
        from_table: "ORDERS",
        from_column: "id",
        to_table: "ORDER_ITEMS",
        to_column: "order_id",
        join_type: "LEFT JOIN",
        label: "Orders to items"
      }
    ],
    PAYMENTS: [
      {
        from_table: "ORDERS",
        from_column: "id",
        to_table: "PAYMENTS",
        to_column: "order_id",
        join_type: "LEFT JOIN",
        label: "Orders to payments"
      }
    ],
    SHIPMENTS: [
      {
        from_table: "ORDERS",
        from_column: "id",
        to_table: "SHIPMENTS",
        to_column: "order_id",
        join_type: "LEFT JOIN",
        label: "Orders to shipments"
      }
    ],
    INVOICES: [
      {
        from_table: "ORDERS",
        from_column: "id",
        to_table: "INVOICES",
        to_column: "order_id",
        join_type: "LEFT JOIN",
        label: "Orders to invoices"
      }
    ],
    PRODUCTS: [
      {
        from_table: "ORDERS",
        from_column: "id",
        to_table: "ORDER_ITEMS",
        to_column: "order_id",
        join_type: "INNER JOIN",
        label: "Orders to order items"
      },
      {
        from_table: "ORDER_ITEMS",
        from_column: "product_id",
        to_table: "PRODUCTS",
        to_column: "id",
        join_type: "INNER JOIN",
        label: "Order items to products"
      }
    ]
  },

  WAREHOUSES: {
    INVENTORY: [
      {
        from_table: "WAREHOUSES",
        from_column: "id",
        to_table: "INVENTORY",
        to_column: "warehouse_id",
        join_type: "LEFT JOIN",
        label: "Warehouses to inventory"
      }
    ],
    SHIPMENTS: [
      {
        from_table: "WAREHOUSES",
        from_column: "id",
        to_table: "SHIPMENTS",
        to_column: "warehouse_id",
        join_type: "LEFT JOIN",
        label: "Warehouses to shipments"
      }
    ],
    PRODUCTS: [
      {
        from_table: "WAREHOUSES",
        from_column: "id",
        to_table: "INVENTORY",
        to_column: "warehouse_id",
        join_type: "INNER JOIN",
        label: "Warehouses to inventory"
      },
      {
        from_table: "INVENTORY",
        from_column: "product_id",
        to_table: "PRODUCTS",
        to_column: "id",
        join_type: "INNER JOIN",
        label: "Inventory to products"
      }
    ]
  }
};