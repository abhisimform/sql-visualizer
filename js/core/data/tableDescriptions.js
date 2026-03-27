export const TABLE_DESCRIPTIONS = {
  DEPARTMENTS: {
    purpose: "Stores company departments like IT, HR, Sales, etc.",
    primary_key: "id",
    important_columns: ["name", "location", "budget", "created_at"],
    relationships: [
      "One department has many employees",
      "One department has many projects"
    ]
  },

  ROLES: {
    purpose: "Stores employee job roles like Developer, Manager, HR Executive.",
    primary_key: "id",
    important_columns: ["name", "level", "base_salary", "created_at"],
    relationships: [
      "One role can be assigned to many employees",
      "Many-to-many with permissions through ROLE_PERMISSIONS"
    ]
  },

  EMPLOYEES: {
    purpose: "Stores employee master data.",
    primary_key: "id",
    important_columns: ["name", "salary", "city", "dept_id", "role_id", "manager_id", "hire_date", "status"],
    relationships: [
      "Many employees belong to one department",
      "Many employees belong to one role",
      "Self relationship through manager_id",
      "One employee has one employee detail row",
      "One employee can have many attendance rows",
      "One employee can have many leave rows",
      "Many-to-many with projects through EMPLOYEE_PROJECTS"
    ]
  },

  EMPLOYEE_DETAILS: {
    purpose: "Stores extra personal or HR-related details for employees.",
    primary_key: "id",
    important_columns: ["employee_id", "pan_no", "blood_group", "marital_status"],
    relationships: [
      "One-to-one with EMPLOYEES"
    ]
  },

  ATTENDANCE: {
    purpose: "Stores daily employee attendance records.",
    primary_key: "id",
    important_columns: ["employee_id", "attendance_date", "check_in", "check_out", "status", "work_mode"],
    relationships: [
      "Many attendance records belong to one employee"
    ]
  },

  LEAVES: {
    purpose: "Stores leave applications of employees.",
    primary_key: "id",
    important_columns: ["employee_id", "leave_type", "start_date", "end_date", "total_days", "status", "applied_at"],
    relationships: [
      "Many leave records belong to one employee"
    ]
  },

  PROJECTS: {
    purpose: "Stores projects handled by departments.",
    primary_key: "id",
    important_columns: ["name", "dept_id", "start_date", "end_date", "budget", "status"],
    relationships: [
      "Many projects belong to one department",
      "Many-to-many with employees through EMPLOYEE_PROJECTS"
    ]
  },

  EMPLOYEE_PROJECTS: {
    purpose: "Bridge table connecting employees and projects.",
    primary_key: "id",
    important_columns: ["employee_id", "project_id", "role", "hours_allocated", "assigned_at"],
    relationships: [
      "Many-to-one to employees",
      "Many-to-one to projects"
    ]
  },

  CUSTOMERS: {
    purpose: "Stores customer master data.",
    primary_key: "id",
    important_columns: ["name", "email", "phone", "city", "gender", "created_at", "referred_by_customer_id"],
    relationships: [
      "One customer can have many addresses",
      "One customer can place many orders",
      "One customer can write many reviews",
      "Self relationship through referred_by_customer_id"
    ]
  },

  CUSTOMER_ADDRESSES: {
    purpose: "Stores multiple addresses for each customer.",
    primary_key: "id",
    important_columns: ["customer_id", "type", "line1", "city", "state", "pincode", "created_at"],
    relationships: [
      "Many addresses belong to one customer",
      "One address can be used in many orders"
    ]
  },

  CATEGORIES: {
    purpose: "Stores product categories and subcategories.",
    primary_key: "id",
    important_columns: ["name", "parent_category_id", "created_at"],
    relationships: [
      "One category has many products",
      "Self relationship through parent_category_id"
    ]
  },

  SUPPLIERS: {
    purpose: "Stores supplier/vendor information.",
    primary_key: "id",
    important_columns: ["name", "city", "contact_email", "joined_at", "rating"],
    relationships: [
      "One supplier can supply many products"
    ]
  },

  WAREHOUSES: {
    purpose: "Stores warehouse information.",
    primary_key: "id",
    important_columns: ["name", "city", "capacity", "created_at"],
    relationships: [
      "One warehouse can hold many inventory rows",
      "One warehouse can dispatch many shipments"
    ]
  },

  PRODUCTS: {
    purpose: "Stores product master data.",
    primary_key: "id",
    important_columns: ["name", "sku", "price", "cost_price", "stock", "category_id", "supplier_id", "launch_date", "status"],
    relationships: [
      "Many products belong to one category",
      "Many products belong to one supplier",
      "Many-to-many with orders through ORDER_ITEMS",
      "Many-to-many with warehouses through INVENTORY",
      "One product can have many reviews"
    ]
  },

  INVENTORY: {
    purpose: "Stores stock quantity of products in warehouses.",
    primary_key: "id",
    important_columns: ["product_id", "warehouse_id", "quantity", "last_restocked_at"],
    relationships: [
      "Many inventory rows belong to one product",
      "Many inventory rows belong to one warehouse"
    ]
  },

  COUPONS: {
    purpose: "Stores discount coupon details.",
    primary_key: "id",
    important_columns: ["code", "discount_type", "discount_value", "min_order_amount", "valid_from", "valid_to", "status"],
    relationships: [
      "One coupon can be used in many orders"
    ]
  },

  ORDERS: {
    purpose: "Stores customer order headers.",
    primary_key: "id",
    important_columns: ["customer_id", "shipping_address_id", "coupon_id", "order_date", "status", "total_amount", "discount_amount", "final_amount"],
    relationships: [
      "Many orders belong to one customer",
      "Many orders can use one address",
      "Many orders can use one coupon",
      "One order has many order items",
      "One order can have many payments",
      "One order has one shipment in this dataset",
      "One order has one invoice"
    ]
  },

  ORDER_ITEMS: {
    purpose: "Stores line items for each order.",
    primary_key: "id",
    important_columns: ["order_id", "product_id", "quantity", "unit_price", "total_price"],
    relationships: [
      "Many order items belong to one order",
      "Many order items belong to one product",
      "Acts as bridge table for orders and products",
      "One order item can have one return in this dataset"
    ]
  },

  PAYMENTS: {
    purpose: "Stores payment records for orders.",
    primary_key: "id",
    important_columns: ["order_id", "amount", "method", "status", "payment_date", "transaction_ref"],
    relationships: [
      "Many payments belong to one order"
    ]
  },

  SHIPMENTS: {
    purpose: "Stores shipment details of orders.",
    primary_key: "id",
    important_columns: ["order_id", "warehouse_id", "courier", "tracking_no", "shipped_date", "expected_delivery_date", "delivered_date", "status"],
    relationships: [
      "One-to-one with orders in this dataset",
      "Many shipments can come from one warehouse"
    ]
  },

  RETURNS: {
    purpose: "Stores product return information.",
    primary_key: "id",
    important_columns: ["order_item_id", "reason", "return_date", "refund_amount", "status"],
    relationships: [
      "One-to-one with ORDER_ITEMS in this dataset"
    ]
  },

  REVIEWS: {
    purpose: "Stores customer reviews on products.",
    primary_key: "id",
    important_columns: ["customer_id", "product_id", "rating", "comment", "review_date"],
    relationships: [
      "Many reviews belong to one customer",
      "Many reviews belong to one product"
    ]
  },

  INVOICES: {
    purpose: "Stores invoice data for orders.",
    primary_key: "id",
    important_columns: ["order_id", "invoice_no", "issue_date", "due_date", "subtotal", "tax_amount", "total_amount", "status"],
    relationships: [
      "One-to-one with ORDERS"
    ]
  },

  PERMISSIONS: {
    purpose: "Stores available permission names for roles.",
    primary_key: "id",
    important_columns: ["name", "module", "created_at"],
    relationships: [
      "Many-to-many with ROLES through ROLE_PERMISSIONS"
    ]
  },

  ROLE_PERMISSIONS: {
    purpose: "Bridge table connecting roles and permissions.",
    primary_key: "id",
    important_columns: ["role_id", "permission_id", "granted_at"],
    relationships: [
      "Many-to-one to ROLES",
      "Many-to-one to PERMISSIONS"
    ]
  }
};