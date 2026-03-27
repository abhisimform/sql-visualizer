export const SAMPLE_QUERIES = [
  // =====================================================
  // EASY (1 - 30)
  // =====================================================
  {
    id: 1,
    difficulty: "Easy",
    topic: "SELECT",
    title: "Show all employees",
    query: `SELECT * FROM EMPLOYEES;`
  },
  {
    id: 2,
    difficulty: "Easy",
    topic: "SELECT",
    title: "Show only employee names and salaries",
    query: `SELECT name, salary FROM EMPLOYEES;`
  },
  {
    id: 3,
    difficulty: "Easy",
    topic: "WHERE",
    title: "Employees with salary greater than 40000",
    query: `SELECT * FROM EMPLOYEES WHERE salary > 40000;`
  },
  {
    id: 4,
    difficulty: "Easy",
    topic: "WHERE",
    title: "Employees from Ahmedabad",
    query: `SELECT * FROM EMPLOYEES WHERE city = 'Ahmedabad';`
  },
  {
    id: 5,
    difficulty: "Easy",
    topic: "ORDER BY",
    title: "Employees sorted by salary high to low",
    query: `SELECT * FROM EMPLOYEES ORDER BY salary DESC;`
  },
  {
    id: 6,
    difficulty: "Easy",
    topic: "ORDER BY",
    title: "Customers sorted by name",
    query: `SELECT * FROM CUSTOMERS ORDER BY name ASC;`
  },
  {
    id: 7,
    difficulty: "Easy",
    topic: "LIMIT",
    title: "Top 5 most expensive products",
    query: `SELECT * FROM PRODUCTS ORDER BY price DESC LIMIT 5;`
  },
  {
    id: 8,
    difficulty: "Easy",
    topic: "DISTINCT",
    title: "Distinct employee cities",
    query: `SELECT DISTINCT city FROM EMPLOYEES;`
  },
  {
    id: 9,
    difficulty: "Easy",
    topic: "LIKE",
    title: "Customers whose name starts with R",
    query: `SELECT * FROM CUSTOMERS WHERE name LIKE 'R%';`
  },
  {
    id: 10,
    difficulty: "Easy",
    topic: "IN",
    title: "Employees from Ahmedabad, Surat, or Rajkot",
    query: `SELECT * FROM EMPLOYEES WHERE city IN ('Ahmedabad', 'Surat', 'Rajkot');`
  },
  {
    id: 11,
    difficulty: "Easy",
    topic: "BETWEEN",
    title: "Employees with salary between 30000 and 50000",
    query: `SELECT * FROM EMPLOYEES WHERE salary BETWEEN 30000 AND 50000;`
  },
  {
    id: 12,
    difficulty: "Easy",
    topic: "NULL",
    title: "Employees without a manager",
    query: `SELECT * FROM EMPLOYEES WHERE manager_id IS NULL;`
  },
  {
    id: 13,
    difficulty: "Easy",
    topic: "WHERE",
    title: "Products that are active",
    query: `SELECT * FROM PRODUCTS WHERE status = 'Active';`
  },
  {
    id: 14,
    difficulty: "Easy",
    topic: "WHERE",
    title: "Orders with status Delivered",
    query: `SELECT * FROM ORDERS WHERE status = 'Delivered';`
  },
  {
    id: 15,
    difficulty: "Easy",
    topic: "DATE",
    title: "Employees hired in 2025",
    query: `SELECT * FROM EMPLOYEES WHERE YEAR(hire_date) = 2025;`
  },
  {
    id: 16,
    difficulty: "Easy",
    topic: "DATE",
    title: "Orders placed in March 2026",
    query: `SELECT * FROM ORDERS WHERE YEAR(order_date) = 2026 AND MONTH(order_date) = 3;`
  },
  {
    id: 17,
    difficulty: "Easy",
    topic: "DATE",
    title: "Products launched after September 2025",
    query: `SELECT * FROM PRODUCTS WHERE launch_date > '2025-09-30';`
  },
  {
    id: 18,
    difficulty: "Easy",
    topic: "AGGREGATE",
    title: "Total number of employees",
    query: `SELECT COUNT(*) AS total_employees FROM EMPLOYEES;`
  },
  {
    id: 19,
    difficulty: "Easy",
    topic: "AGGREGATE",
    title: "Average employee salary",
    query: `SELECT AVG(salary) AS avg_salary FROM EMPLOYEES;`
  },
  {
    id: 20,
    difficulty: "Easy",
    topic: "AGGREGATE",
    title: "Maximum product price",
    query: `SELECT MAX(price) AS max_price FROM PRODUCTS;`
  },
  {
    id: 21,
    difficulty: "Easy",
    topic: "AGGREGATE",
    title: "Minimum product price",
    query: `SELECT MIN(price) AS min_price FROM PRODUCTS;`
  },
  {
    id: 22,
    difficulty: "Easy",
    topic: "AGGREGATE",
    title: "Total payment amount",
    query: `SELECT SUM(amount) AS total_payment_amount FROM PAYMENTS;`
  },
  {
    id: 23,
    difficulty: "Easy",
    topic: "GROUP BY",
    title: "Count employees by city",
    query: `SELECT city, COUNT(*) AS total_employees FROM EMPLOYEES GROUP BY city;`
  },
  {
    id: 24,
    difficulty: "Easy",
    topic: "GROUP BY",
    title: "Count products by status",
    query: `SELECT status, COUNT(*) AS total_products FROM PRODUCTS GROUP BY status;`
  },
  {
    id: 25,
    difficulty: "Easy",
    topic: "GROUP BY",
    title: "Count orders by status",
    query: `SELECT status, COUNT(*) AS total_orders FROM ORDERS GROUP BY status;`
  },
  {
    id: 26,
    difficulty: "Easy",
    topic: "GROUP BY",
    title: "Average rating per product",
    query: `SELECT product_id, AVG(rating) AS avg_rating FROM REVIEWS GROUP BY product_id;`
  },
  {
    id: 27,
    difficulty: "Easy",
    topic: "HAVING",
    title: "Cities having more than 3 employees",
    query: `SELECT city, COUNT(*) AS total_employees FROM EMPLOYEES GROUP BY city HAVING COUNT(*) > 3;`
  },
  {
    id: 28,
    difficulty: "Easy",
    topic: "STRING",
    title: "Show customer names in uppercase",
    query: `SELECT UPPER(name) AS customer_name FROM CUSTOMERS;`
  },
  {
    id: 29,
    difficulty: "Easy",
    topic: "STRING",
    title: "Show employee name lengths",
    query: `SELECT name, LENGTH(name) AS name_length FROM EMPLOYEES;`
  },
  {
    id: 30,
    difficulty: "Easy",
    topic: "DATE",
    title: "Show month from payment date",
    query: `SELECT id, payment_date, MONTH(payment_date) AS payment_month FROM PAYMENTS;`
  },

  // =====================================================
  // MEDIUM (31 - 70)
  // =====================================================
  {
    id: 31,
    difficulty: "Medium",
    topic: "JOIN",
    title: "Employees with department names",
    query: `SELECT e.name, e.salary, d.name AS department_name
FROM EMPLOYEES e
JOIN DEPARTMENTS d ON e.dept_id = d.id;`
  },
  {
    id: 32,
    difficulty: "Medium",
    topic: "JOIN",
    title: "Employees with role names",
    query: `SELECT e.name, r.name AS role_name, e.salary
FROM EMPLOYEES e
JOIN ROLES r ON e.role_id = r.id;`
  },
  {
    id: 33,
    difficulty: "Medium",
    topic: "SELF JOIN",
    title: "Employees and their managers",
    query: `SELECT e.name AS employee_name, m.name AS manager_name
FROM EMPLOYEES e
LEFT JOIN EMPLOYEES m ON e.manager_id = m.id;`
  },
  {
    id: 34,
    difficulty: "Medium",
    topic: "JOIN",
    title: "Employee personal details",
    query: `SELECT e.name, ed.blood_group, ed.marital_status
FROM EMPLOYEES e
JOIN EMPLOYEE_DETAILS ed ON e.id = ed.employee_id;`
  },
  {
    id: 35,
    difficulty: "Medium",
    topic: "JOIN",
    title: "Projects with department names",
    query: `SELECT p.name AS project_name, d.name AS department_name, p.budget
FROM PROJECTS p
JOIN DEPARTMENTS d ON p.dept_id = d.id;`
  },
  {
    id: 36,
    difficulty: "Medium",
    topic: "MANY-TO-MANY",
    title: "Employees working on projects",
    query: `SELECT e.name AS employee_name, p.name AS project_name, ep.role
FROM EMPLOYEE_PROJECTS ep
JOIN EMPLOYEES e ON ep.employee_id = e.id
JOIN PROJECTS p ON ep.project_id = p.id;`
  },
  {
    id: 37,
    difficulty: "Medium",
    topic: "JOIN",
    title: "Customers and their addresses",
    query: `SELECT c.name, a.type, a.city, a.pincode
FROM CUSTOMERS c
JOIN CUSTOMER_ADDRESSES a ON c.id = a.customer_id;`
  },
  {
    id: 38,
    difficulty: "Medium",
    topic: "JOIN",
    title: "Products with categories",
    query: `SELECT p.name AS product_name, c.name AS category_name, p.price
FROM PRODUCTS p
JOIN CATEGORIES c ON p.category_id = c.id;`
  },
  {
    id: 39,
    difficulty: "Medium",
    topic: "JOIN",
    title: "Products with suppliers",
    query: `SELECT p.name AS product_name, s.name AS supplier_name, s.city
FROM PRODUCTS p
JOIN SUPPLIERS s ON p.supplier_id = s.id;`
  },
  {
    id: 40,
    difficulty: "Medium",
    topic: "JOIN",
    title: "Orders with customer names",
    query: `SELECT o.id AS order_id, c.name AS customer_name, o.order_date, o.status
FROM ORDERS o
JOIN CUSTOMERS c ON o.customer_id = c.id;`
  },
  {
    id: 41,
    difficulty: "Medium",
    topic: "JOIN",
    title: "Orders with coupon codes",
    query: `SELECT o.id AS order_id, cp.code AS coupon_code, o.final_amount
FROM ORDERS o
LEFT JOIN COUPONS cp ON o.coupon_id = cp.id;`
  },
  {
    id: 42,
    difficulty: "Medium",
    topic: "MANY-TO-MANY",
    title: "Order items with product names",
    query: `SELECT oi.order_id, p.name AS product_name, oi.quantity, oi.total_price
FROM ORDER_ITEMS oi
JOIN PRODUCTS p ON oi.product_id = p.id;`
  },
  {
    id: 43,
    difficulty: "Medium",
    topic: "JOIN",
    title: "Payments with order status",
    query: `SELECT p.id, p.amount, p.method, p.status, o.status AS order_status
FROM PAYMENTS p
JOIN ORDERS o ON p.order_id = o.id;`
  },
  {
    id: 44,
    difficulty: "Medium",
    topic: "JOIN",
    title: "Shipments with warehouse names",
    query: `SELECT s.id, s.courier, w.name AS warehouse_name, s.status
FROM SHIPMENTS s
JOIN WAREHOUSES w ON s.warehouse_id = w.id;`
  },
  {
    id: 45,
    difficulty: "Medium",
    topic: "JOIN",
    title: "Reviews with customer and product",
    query: `SELECT r.id, c.name AS customer_name, p.name AS product_name, r.rating
FROM REVIEWS r
JOIN CUSTOMERS c ON r.customer_id = c.id
JOIN PRODUCTS p ON r.product_id = p.id;`
  },
  {
    id: 46,
    difficulty: "Medium",
    topic: "LEFT JOIN",
    title: "Customers with or without orders",
    query: `SELECT c.name, o.id AS order_id
FROM CUSTOMERS c
LEFT JOIN ORDERS o ON c.id = o.customer_id;`
  },
  {
    id: 47,
    difficulty: "Medium",
    topic: "LEFT JOIN",
    title: "Products with or without reviews",
    query: `SELECT p.name, r.rating
FROM PRODUCTS p
LEFT JOIN REVIEWS r ON p.id = r.product_id;`
  },
  {
    id: 48,
    difficulty: "Medium",
    topic: "LEFT JOIN",
    title: "Employees with or without leave records",
    query: `SELECT e.name, l.leave_type, l.status
FROM EMPLOYEES e
LEFT JOIN LEAVES l ON e.id = l.employee_id;`
  },
  {
    id: 49,
    difficulty: "Medium",
    topic: "GROUP BY",
    title: "Department-wise employee count",
    query: `SELECT d.name AS department_name, COUNT(e.id) AS employee_count
FROM DEPARTMENTS d
LEFT JOIN EMPLOYEES e ON d.id = e.dept_id
GROUP BY d.name;`
  },
  {
    id: 50,
    difficulty: "Medium",
    topic: "GROUP BY",
    title: "Department-wise average salary",
    query: `SELECT d.name AS department_name, AVG(e.salary) AS avg_salary
FROM DEPARTMENTS d
JOIN EMPLOYEES e ON d.id = e.dept_id
GROUP BY d.name;`
  },
  {
    id: 51,
    difficulty: "Medium",
    topic: "GROUP BY",
    title: "Total orders per customer",
    query: `SELECT c.name, COUNT(o.id) AS total_orders
FROM CUSTOMERS c
LEFT JOIN ORDERS o ON c.id = o.customer_id
GROUP BY c.name;`
  },
  {
    id: 52,
    difficulty: "Medium",
    topic: "GROUP BY",
    title: "Total revenue per customer",
    query: `SELECT c.name, SUM(o.final_amount) AS total_revenue
FROM CUSTOMERS c
JOIN ORDERS o ON c.id = o.customer_id
GROUP BY c.name;`
  },
  {
    id: 53,
    difficulty: "Medium",
    topic: "GROUP BY",
    title: "Total payments by method",
    query: `SELECT method, SUM(amount) AS total_amount
FROM PAYMENTS
GROUP BY method;`
  },
  {
    id: 54,
    difficulty: "Medium",
    topic: "GROUP BY",
    title: "Orders per month",
    query: `SELECT MONTH(order_date) AS month_no, COUNT(*) AS total_orders
FROM ORDERS
GROUP BY MONTH(order_date);`
  },
  {
    id: 55,
    difficulty: "Medium",
    topic: "GROUP BY",
    title: "Revenue per month",
    query: `SELECT MONTH(order_date) AS month_no, SUM(final_amount) AS monthly_revenue
FROM ORDERS
GROUP BY MONTH(order_date);`
  },
  {
    id: 56,
    difficulty: "Medium",
    topic: "GROUP BY",
    title: "Average product rating",
    query: `SELECT p.name, AVG(r.rating) AS avg_rating
FROM PRODUCTS p
LEFT JOIN REVIEWS r ON p.id = r.product_id
GROUP BY p.name;`
  },
  {
    id: 57,
    difficulty: "Medium",
    topic: "GROUP BY",
    title: "Total stock per warehouse",
    query: `SELECT w.name, SUM(i.quantity) AS total_stock
FROM WAREHOUSES w
JOIN INVENTORY i ON w.id = i.warehouse_id
GROUP BY w.name;`
  },
  {
    id: 58,
    difficulty: "Medium",
    topic: "GROUP BY",
    title: "Total stock per product",
    query: `SELECT p.name, SUM(i.quantity) AS total_stock
FROM PRODUCTS p
JOIN INVENTORY i ON p.id = i.product_id
GROUP BY p.name;`
  },
  {
    id: 59,
    difficulty: "Medium",
    topic: "HAVING",
    title: "Customers with more than one order",
    query: `SELECT c.name, COUNT(o.id) AS total_orders
FROM CUSTOMERS c
JOIN ORDERS o ON c.id = o.customer_id
GROUP BY c.name
HAVING COUNT(o.id) > 1;`
  },
  {
    id: 60,
    difficulty: "Medium",
    topic: "HAVING",
    title: "Departments with average salary above 40000",
    query: `SELECT d.name, AVG(e.salary) AS avg_salary
FROM DEPARTMENTS d
JOIN EMPLOYEES e ON d.id = e.dept_id
GROUP BY d.name
HAVING AVG(e.salary) > 40000;`
  },
  {
    id: 61,
    difficulty: "Medium",
    topic: "HAVING",
    title: "Products reviewed more than once",
    query: `SELECT p.name, COUNT(r.id) AS total_reviews
FROM PRODUCTS p
JOIN REVIEWS r ON p.id = r.product_id
GROUP BY p.name
HAVING COUNT(r.id) > 1;`
  },
  {
    id: 62,
    difficulty: "Medium",
    topic: "DATE",
    title: "Attendance records in March 2026",
    query: `SELECT * FROM ATTENDANCE
WHERE YEAR(attendance_date) = 2026 AND MONTH(attendance_date) = 3;`
  },
  {
    id: 63,
    difficulty: "Medium",
    topic: "DATE",
    title: "Employees hired by year",
    query: `SELECT YEAR(hire_date) AS hire_year, COUNT(*) AS total_hired
FROM EMPLOYEES
GROUP BY YEAR(hire_date);`
  },
  {
    id: 64,
    difficulty: "Medium",
    topic: "DATE",
    title: "Reviews written in March 2026",
    query: `SELECT * FROM REVIEWS
WHERE YEAR(review_date) = 2026 AND MONTH(review_date) = 3;`
  },
  {
    id: 65,
    difficulty: "Medium",
    topic: "DATE",
    title: "Coupon validity periods",
    query: `SELECT code, DATEDIFF(valid_to, valid_from) AS valid_days
FROM COUPONS;`
  },
  {
    id: 66,
    difficulty: "Medium",
    topic: "DATE",
    title: "Shipment delivery duration",
    query: `SELECT id, courier, DATEDIFF(delivered_date, shipped_date) AS delivery_days
FROM SHIPMENTS
WHERE delivered_date IS NOT NULL;`
  },
  {
    id: 67,
    difficulty: "Medium",
    topic: "JOIN + DATE",
    title: "Orders with customer name and month",
    query: `SELECT o.id, c.name, MONTH(o.order_date) AS order_month
FROM ORDERS o
JOIN CUSTOMERS c ON o.customer_id = c.id;`
  },
  {
    id: 68,
    difficulty: "Medium",
    topic: "SELF JOIN",
    title: "Customers and who referred them",
    query: `SELECT c.name AS customer_name, ref.name AS referred_by
FROM CUSTOMERS c
LEFT JOIN CUSTOMERS ref ON c.referred_by_customer_id = ref.id;`
  },
  {
    id: 69,
    difficulty: "Medium",
    topic: "SELF JOIN",
    title: "Categories and parent categories",
    query: `SELECT c.name AS category_name, p.name AS parent_category
FROM CATEGORIES c
LEFT JOIN CATEGORIES p ON c.parent_category_id = p.id;`
  },
  {
    id: 70,
    difficulty: "Medium",
    topic: "FUNCTIONS",
    title: "Profit per product",
    query: `SELECT name, price, cost_price, (price - cost_price) AS unit_profit
FROM PRODUCTS;`
  },

  // =====================================================
  // ADVANCED (71 - 100)
  // =====================================================
  {
    id: 71,
    difficulty: "Advanced",
    topic: "SUBQUERY",
    title: "Employees earning above average salary",
    query: `SELECT *
FROM EMPLOYEES
WHERE salary > (SELECT AVG(salary) FROM EMPLOYEES);`
  },
  {
    id: 72,
    difficulty: "Advanced",
    topic: "SUBQUERY",
    title: "Products priced above average product price",
    query: `SELECT *
FROM PRODUCTS
WHERE price > (SELECT AVG(price) FROM PRODUCTS);`
  },
  {
    id: 73,
    difficulty: "Advanced",
    topic: "SUBQUERY",
    title: "Customers who placed at least one order",
    query: `SELECT *
FROM CUSTOMERS
WHERE id IN (SELECT DISTINCT customer_id FROM ORDERS);`
  },
  {
    id: 74,
    difficulty: "Advanced",
    topic: "SUBQUERY",
    title: "Customers who never placed an order",
    query: `SELECT *
FROM CUSTOMERS
WHERE id NOT IN (SELECT DISTINCT customer_id FROM ORDERS);`
  },
  {
    id: 75,
    difficulty: "Advanced",
    topic: "SUBQUERY",
    title: "Products that were never ordered",
    query: `SELECT *
FROM PRODUCTS
WHERE id NOT IN (SELECT DISTINCT product_id FROM ORDER_ITEMS);`
  },
  {
    id: 76,
    difficulty: "Advanced",
    topic: "CORRELATED SUBQUERY",
    title: "Highest paid employee in each department",
    query: `SELECT e.*
FROM EMPLOYEES e
WHERE salary = (
  SELECT MAX(e2.salary)
  FROM EMPLOYEES e2
  WHERE e2.dept_id = e.dept_id
);`
  },
  {
    id: 77,
    difficulty: "Advanced",
    topic: "CORRELATED SUBQUERY",
    title: "Most expensive product in each category",
    query: `SELECT p.*
FROM PRODUCTS p
WHERE price = (
  SELECT MAX(p2.price)
  FROM PRODUCTS p2
  WHERE p2.category_id = p.category_id
);`
  },
  {
    id: 78,
    difficulty: "Advanced",
    topic: "MULTI JOIN",
    title: "Full order details with customer and products",
    query: `SELECT o.id AS order_id, c.name AS customer_name, p.name AS product_name, oi.quantity, oi.total_price
FROM ORDERS o
JOIN CUSTOMERS c ON o.customer_id = c.id
JOIN ORDER_ITEMS oi ON o.id = oi.order_id
JOIN PRODUCTS p ON oi.product_id = p.id;`
  },
  {
    id: 79,
    difficulty: "Advanced",
    topic: "MULTI JOIN",
    title: "Order, payment, and shipment summary",
    query: `SELECT o.id AS order_id, o.status AS order_status, p.status AS payment_status, s.status AS shipment_status
FROM ORDERS o
LEFT JOIN PAYMENTS p ON o.id = p.order_id
LEFT JOIN SHIPMENTS s ON o.id = s.order_id;`
  },
  {
    id: 80,
    difficulty: "Advanced",
    topic: "MULTI JOIN",
    title: "Invoice details with customer",
    query: `SELECT i.invoice_no, c.name AS customer_name, i.total_amount, i.status
FROM INVOICES i
JOIN ORDERS o ON i.order_id = o.id
JOIN CUSTOMERS c ON o.customer_id = c.id;`
  },
  {
    id: 81,
    difficulty: "Advanced",
    topic: "MULTI JOIN",
    title: "Products, categories, and suppliers together",
    query: `SELECT p.name AS product_name, c.name AS category_name, s.name AS supplier_name, p.price
FROM PRODUCTS p
JOIN CATEGORIES c ON p.category_id = c.id
JOIN SUPPLIERS s ON p.supplier_id = s.id;`
  },
  {
    id: 82,
    difficulty: "Advanced",
    topic: "AGGREGATE + JOIN",
    title: "Total revenue generated by each customer",
    query: `SELECT c.name, SUM(o.final_amount) AS total_spent
FROM CUSTOMERS c
JOIN ORDERS o ON c.id = o.customer_id
GROUP BY c.name
ORDER BY total_spent DESC;`
  },
  {
    id: 83,
    difficulty: "Advanced",
    topic: "AGGREGATE + JOIN",
    title: "Total quantity sold per product",
    query: `SELECT p.name, SUM(oi.quantity) AS total_quantity_sold
FROM PRODUCTS p
JOIN ORDER_ITEMS oi ON p.id = oi.product_id
GROUP BY p.name
ORDER BY total_quantity_sold DESC;`
  },
  {
    id: 84,
    difficulty: "Advanced",
    topic: "AGGREGATE + JOIN",
    title: "Revenue generated per product",
    query: `SELECT p.name, SUM(oi.total_price) AS total_revenue
FROM PRODUCTS p
JOIN ORDER_ITEMS oi ON p.id = oi.product_id
GROUP BY p.name
ORDER BY total_revenue DESC;`
  },
  {
    id: 85,
    difficulty: "Advanced",
    topic: "AGGREGATE + JOIN",
    title: "Average rating and number of reviews per product",
    query: `SELECT p.name, AVG(r.rating) AS avg_rating, COUNT(r.id) AS total_reviews
FROM PRODUCTS p
LEFT JOIN REVIEWS r ON p.id = r.product_id
GROUP BY p.name;`
  },
  {
    id: 86,
    difficulty: "Advanced",
    topic: "AGGREGATE + JOIN",
    title: "Department budget vs total salary payout",
    query: `SELECT d.name, d.budget, SUM(e.salary) AS total_salary
FROM DEPARTMENTS d
JOIN EMPLOYEES e ON d.id = e.dept_id
GROUP BY d.name, d.budget;`
  },
  {
    id: 87,
    difficulty: "Advanced",
    topic: "DATE + AGGREGATE",
    title: "Monthly payment collection",
    query: `SELECT YEAR(payment_date) AS year_no, MONTH(payment_date) AS month_no, SUM(amount) AS total_collection
FROM PAYMENTS
GROUP BY YEAR(payment_date), MONTH(payment_date);`
  },
  {
    id: 88,
    difficulty: "Advanced",
    topic: "DATE + AGGREGATE",
    title: "Orders count by month and status",
    query: `SELECT MONTH(order_date) AS month_no, status, COUNT(*) AS total_orders
FROM ORDERS
GROUP BY MONTH(order_date), status;`
  },
  {
    id: 89,
    difficulty: "Advanced",
    topic: "DATE + AGGREGATE",
    title: "Attendance summary by employee",
    query: `SELECT employee_id,
       SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) AS present_days,
       SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END) AS late_days,
       SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) AS absent_days
FROM ATTENDANCE
GROUP BY employee_id;`
  },
  {
    id: 90,
    difficulty: "Advanced",
    topic: "CASE",
    title: "Categorize employees by salary range",
    query: `SELECT name, salary,
       CASE
         WHEN salary < 30000 THEN 'Low'
         WHEN salary BETWEEN 30000 AND 50000 THEN 'Medium'
         ELSE 'High'
       END AS salary_category
FROM EMPLOYEES;`
  },
  {
    id: 91,
    difficulty: "Advanced",
    topic: "CASE",
    title: "Categorize orders by final amount",
    query: `SELECT id, final_amount,
       CASE
         WHEN final_amount < 2000 THEN 'Small'
         WHEN final_amount BETWEEN 2000 AND 10000 THEN 'Medium'
         ELSE 'Large'
       END AS order_size
FROM ORDERS;`
  },
  {
    id: 92,
    difficulty: "Advanced",
    topic: "CASE + GROUP BY",
    title: "Count products by price bucket",
    query: `SELECT
  CASE
    WHEN price < 500 THEN 'Budget'
    WHEN price BETWEEN 500 AND 5000 THEN 'Mid'
    ELSE 'Premium'
  END AS price_bucket,
  COUNT(*) AS total_products
FROM PRODUCTS
GROUP BY
  CASE
    WHEN price < 500 THEN 'Budget'
    WHEN price BETWEEN 500 AND 5000 THEN 'Mid'
    ELSE 'Premium'
  END;`
  },
  {
    id: 93,
    difficulty: "Advanced",
    topic: "EXISTS",
    title: "Customers who have reviews",
    query: `SELECT *
FROM CUSTOMERS c
WHERE EXISTS (
  SELECT 1
  FROM REVIEWS r
  WHERE r.customer_id = c.id
);`
  },
  {
    id: 94,
    difficulty: "Advanced",
    topic: "EXISTS",
    title: "Products that have been reviewed",
    query: `SELECT *
FROM PRODUCTS p
WHERE EXISTS (
  SELECT 1
  FROM REVIEWS r
  WHERE r.product_id = p.id
);`
  },
  {
    id: 95,
    difficulty: "Advanced",
    topic: "NOT EXISTS",
    title: "Employees not assigned to any project",
    query: `SELECT *
FROM EMPLOYEES e
WHERE NOT EXISTS (
  SELECT 1
  FROM EMPLOYEE_PROJECTS ep
  WHERE ep.employee_id = e.id
);`
  },
  {
    id: 96,
    difficulty: "Advanced",
    topic: "NOT EXISTS",
    title: "Customers with no reviews",
    query: `SELECT *
FROM CUSTOMERS c
WHERE NOT EXISTS (
  SELECT 1
  FROM REVIEWS r
  WHERE r.customer_id = c.id
);`
  },
  {
    id: 97,
    difficulty: "Advanced",
    topic: "LEFT JOIN + NULL",
    title: "Orders without shipments",
    query: `SELECT o.*
FROM ORDERS o
LEFT JOIN SHIPMENTS s ON o.id = s.order_id
WHERE s.id IS NULL;`
  },
  {
    id: 98,
    difficulty: "Advanced",
    topic: "LEFT JOIN + NULL",
    title: "Products without inventory rows",
    query: `SELECT p.*
FROM PRODUCTS p
LEFT JOIN INVENTORY i ON p.id = i.product_id
WHERE i.id IS NULL;`
  },
  {
    id: 99,
    difficulty: "Advanced",
    topic: "DATE LOGIC",
    title: "Late deliveries",
    query: `SELECT *
FROM SHIPMENTS
WHERE delivered_date IS NOT NULL
  AND delivered_date > expected_delivery_date;`
  },
  {
    id: 100,
    difficulty: "Advanced",
    topic: "PROFIT ANALYSIS",
    title: "Estimated profit earned per product",
    query: `SELECT p.name,
       SUM(oi.quantity) AS total_units_sold,
       SUM(oi.total_price) AS total_sales,
       SUM(oi.quantity * p.cost_price) AS total_cost,
       SUM(oi.total_price) - SUM(oi.quantity * p.cost_price) AS estimated_profit
FROM PRODUCTS p
JOIN ORDER_ITEMS oi ON p.id = oi.product_id
GROUP BY p.name
ORDER BY estimated_profit DESC;`
  }
];