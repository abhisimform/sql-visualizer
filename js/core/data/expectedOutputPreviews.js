export const EXPECTED_OUTPUT_PREVIEWS = {
  1: {
    columns: ["id", "name", "age", "gender", "city", "salary", "email", "phone", "dept_id", "role_id", "manager_id", "hire_date", "status", "created_at"],
    sample_rows: [
      [1, "Amit", 20, "Male", "Ahmedabad", 25000, "amit@company.com", "9000000001", 1, 1, 3, "2025-06-10", "Active", "2025-06-10"],
      [2, "Bhavya", 30, "Female", "Surat", 40000, "bhavya@company.com", "9000000002", 2, 3, 12, "2024-11-15", "Active", "2024-11-15"]
    ],
    note: "All employees with all columns."
  },

  5: {
    columns: ["id", "name", "salary"],
    sample_rows: [
      [12, "Lalit", 65000],
      [6, "Farhan", 60000],
      [16, "Priya", 58000]
    ],
    note: "Highest salary rows appear first."
  },

  18: {
    columns: ["total_employees"],
    sample_rows: [
      [20]
    ],
    note: "Single-row aggregate result."
  },

  23: {
    columns: ["city", "total_employees"],
    sample_rows: [
      ["Ahmedabad", 5],
      ["Surat", 5],
      ["Rajkot", 5],
      ["Vadodara", 5]
    ],
    note: "Grouped city counts."
  },

  31: {
    columns: ["name", "salary", "department_name"],
    sample_rows: [
      ["Amit", 25000, "IT"],
      ["Bhavya", 40000, "HR"],
      ["Dhruv", 28000, "Sales"]
    ],
    note: "Employee rows enriched with department names."
  },

  33: {
    columns: ["employee_name", "manager_name"],
    sample_rows: [
      ["Amit", "Chirag"],
      ["Bhavya", "Lalit"],
      ["Chirag", null]
    ],
    note: "Employees with manager names; top managers may show null."
  },

  36: {
    columns: ["employee_name", "project_name", "role"],
    sample_rows: [
      ["Amit", "ERP Upgrade", "Developer"],
      ["Chirag", "ERP Upgrade", "Team Lead"],
      ["Gauri", "ERP Upgrade", "QA Engineer"]
    ],
    note: "Many-to-many join result."
  },

  40: {
    columns: ["order_id", "customer_name", "order_date", "status"],
    sample_rows: [
      [1, "Riya Shah", "2026-03-01", "Delivered"],
      [2, "Karan Mehta", "2026-03-03", "Packed"],
      [3, "Neha Patel", "2026-03-08", "Shipped"]
    ],
    note: "Orders combined with customer names."
  },

  42: {
    columns: ["order_id", "product_name", "quantity", "total_price"],
    sample_rows: [
      [1, "Laptop", 2, 144000],
      [2, "Headphones", 4, 12800],
      [3, "Desk Chair", 1, 8500]
    ],
    note: "Order lines with readable product names."
  },

  46: {
    columns: ["name", "order_id"],
    sample_rows: [
      ["Riya Shah", 1],
      ["Riya Shah", 6],
      ["Dev Rana", 7]
    ],
    note: "Because this is a LEFT JOIN, customers without orders would still appear with null order_id."
  },

  49: {
    columns: ["department_name", "employee_count"],
    sample_rows: [
      ["IT", 6],
      ["HR", 5],
      ["Sales", 5],
      ["Finance", 2],
      ["Operations", 2]
    ],
    note: "Department-wise employee counts."
  },

  54: {
    columns: ["month_no", "total_orders"],
    sample_rows: [
      [1, 1],
      [2, 1],
      [3, 8]
    ],
    note: "Month-wise order count."
  },

  56: {
    columns: ["name", "avg_rating"],
    sample_rows: [
      ["Laptop", 5.0],
      ["Headphones", 4.0],
      ["Mouse", 3.5],
      ["Desk Chair", null]
    ],
    note: "Products with no reviews may show null average."
  },

  57: {
    columns: ["name", "total_stock"],
    sample_rows: [
      ["Ahmedabad Central", 548],
      ["Surat Hub", 175],
      ["Rajkot Storage", 122]
    ],
    note: "Warehouse stock totals."
  },

  59: {
    columns: ["name", "total_orders"],
    sample_rows: [
      ["Riya Shah", 2],
      ["Neha Patel", 2]
    ],
    note: "Only customers with more than one order remain after HAVING."
  },

  66: {
    columns: ["id", "courier", "delivery_days"],
    sample_rows: [
      [1, "BlueDart", 2],
      [3, "XpressBees", 1],
      [4, "EcomExpress", 2]
    ],
    note: "Delivered shipments only."
  },

  71: {
    columns: ["id", "name", "salary"],
    sample_rows: [
      [3, "Chirag", 55000],
      [6, "Farhan", 60000],
      [12, "Lalit", 65000]
    ],
    note: "Employees above average salary."
  },

  78: {
    columns: ["order_id", "customer_name", "product_name", "quantity", "total_price"],
    sample_rows: [
      [1, "Riya Shah", "Laptop", 2, 144000],
      [2, "Karan Mehta", "Headphones", 4, 12800],
      [8, "Mitali Trivedi", "Bottle", 3, 1800]
    ],
    note: "Expanded order-line report."
  },

  82: {
    columns: ["name", "total_spent"],
    sample_rows: [
      ["Riya Shah", 132900],
      ["Neha Patel", 9200],
      ["Karan Mehta", 12800]
    ],
    note: "Customers ranked by total spending."
  },

  89: {
    columns: ["employee_id", "present_days", "late_days", "absent_days"],
    sample_rows: [
      [1, 1, 1, 0],
      [4, 0, 0, 1],
      [7, 0, 1, 0]
    ],
    note: "Attendance summary built using CASE expressions."
  },

  97: {
    columns: ["id", "customer_id", "shipping_address_id", "coupon_id", "order_date", "status", "total_amount", "discount_amount", "final_amount", "created_at"],
    sample_rows: [
      [2, 2, 3, null, "2026-03-03", "Packed", 12800, 0, 12800, "2026-03-03"],
      [5, 5, 6, 1, "2026-03-12", "Pending", 1200, 120, 1080, "2026-03-12"]
    ],
    note: "Orders without matching shipment rows."
  },

  100: {
    columns: ["name", "total_units_sold", "total_sales", "total_cost", "estimated_profit"],
    sample_rows: [
      ["Laptop", 2, 144000, 120000, 24000],
      ["Headphones", 4, 12800, 8800, 4000],
      ["Mouse", 3, 2700, 1500, 1200]
    ],
    note: "Profit estimation per product."
  }
};