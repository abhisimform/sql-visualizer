export const RELATIONS = [
  { from_table: "EMPLOYEES", from_column: "dept_id", to_table: "DEPARTMENTS", to_column: "id", type: "Many-to-One" },
  { from_table: "EMPLOYEES", from_column: "role_id", to_table: "ROLES", to_column: "id", type: "Many-to-One" },
  { from_table: "EMPLOYEES", from_column: "manager_id", to_table: "EMPLOYEES", to_column: "id", type: "Self" },

  { from_table: "EMPLOYEE_DETAILS", from_column: "employee_id", to_table: "EMPLOYEES", to_column: "id", type: "One-to-One" },

  { from_table: "ATTENDANCE", from_column: "employee_id", to_table: "EMPLOYEES", to_column: "id", type: "Many-to-One" },
  { from_table: "LEAVES", from_column: "employee_id", to_table: "EMPLOYEES", to_column: "id", type: "Many-to-One" },

  { from_table: "PROJECTS", from_column: "dept_id", to_table: "DEPARTMENTS", to_column: "id", type: "Many-to-One" },
  { from_table: "EMPLOYEE_PROJECTS", from_column: "employee_id", to_table: "EMPLOYEES", to_column: "id", type: "Many-to-One" },
  { from_table: "EMPLOYEE_PROJECTS", from_column: "project_id", to_table: "PROJECTS", to_column: "id", type: "Many-to-One" },

  { from_table: "CUSTOMERS", from_column: "referred_by_customer_id", to_table: "CUSTOMERS", to_column: "id", type: "Self" },
  { from_table: "CUSTOMER_ADDRESSES", from_column: "customer_id", to_table: "CUSTOMERS", to_column: "id", type: "Many-to-One" },

  { from_table: "CATEGORIES", from_column: "parent_category_id", to_table: "CATEGORIES", to_column: "id", type: "Self" },
  { from_table: "PRODUCTS", from_column: "category_id", to_table: "CATEGORIES", to_column: "id", type: "Many-to-One" },
  { from_table: "PRODUCTS", from_column: "supplier_id", to_table: "SUPPLIERS", to_column: "id", type: "Many-to-One" },

  { from_table: "INVENTORY", from_column: "product_id", to_table: "PRODUCTS", to_column: "id", type: "Many-to-One" },
  { from_table: "INVENTORY", from_column: "warehouse_id", to_table: "WAREHOUSES", to_column: "id", type: "Many-to-One" },

  { from_table: "ORDERS", from_column: "customer_id", to_table: "CUSTOMERS", to_column: "id", type: "Many-to-One" },
  { from_table: "ORDERS", from_column: "shipping_address_id", to_table: "CUSTOMER_ADDRESSES", to_column: "id", type: "Many-to-One" },
  { from_table: "ORDERS", from_column: "coupon_id", to_table: "COUPONS", to_column: "id", type: "Many-to-One" },

  { from_table: "ORDER_ITEMS", from_column: "order_id", to_table: "ORDERS", to_column: "id", type: "Many-to-One" },
  { from_table: "ORDER_ITEMS", from_column: "product_id", to_table: "PRODUCTS", to_column: "id", type: "Many-to-One" },

  { from_table: "PAYMENTS", from_column: "order_id", to_table: "ORDERS", to_column: "id", type: "Many-to-One" },
  { from_table: "SHIPMENTS", from_column: "order_id", to_table: "ORDERS", to_column: "id", type: "One-to-One" },
  { from_table: "SHIPMENTS", from_column: "warehouse_id", to_table: "WAREHOUSES", to_column: "id", type: "Many-to-One" },

  { from_table: "RETURNS", from_column: "order_item_id", to_table: "ORDER_ITEMS", to_column: "id", type: "One-to-One" },

  { from_table: "REVIEWS", from_column: "customer_id", to_table: "CUSTOMERS", to_column: "id", type: "Many-to-One" },
  { from_table: "REVIEWS", from_column: "product_id", to_table: "PRODUCTS", to_column: "id", type: "Many-to-One" },

  { from_table: "INVOICES", from_column: "order_id", to_table: "ORDERS", to_column: "id", type: "One-to-One" },

  { from_table: "ROLE_PERMISSIONS", from_column: "role_id", to_table: "ROLES", to_column: "id", type: "Many-to-One" },
  { from_table: "ROLE_PERMISSIONS", from_column: "permission_id", to_table: "PERMISSIONS", to_column: "id", type: "Many-to-One" }
];