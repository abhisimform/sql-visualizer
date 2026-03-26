export const EMPLOYEES = [
  { id: 1, name: "Amit", age: 20, city: "Ahmedabad", salary: 25000, dept: "IT", dept_id: 1 },
  { id: 2, name: "Bhavya", age: 30, city: "Surat", salary: 40000, dept: "HR", dept_id: 2 },
  { id: 3, name: "Chirag", age: 40, city: "Ahmedabad", salary: 55000, dept: "IT", dept_id: 1 },
  { id: 4, name: "Dhruv", age: 22, city: "Vadodara", salary: 28000, dept: "Sales", dept_id: 3 },
  { id: 5, name: "Esha", age: 28, city: "Surat", salary: 35000, dept: "HR", dept_id: 2 },
  { id: 6, name: "Farhan", age: 35, city: "Ahmedabad", salary: 60000, dept: "Sales", dept_id: 3 },
  { id: 7, name: "Gauri", age: 26, city: "Rajkot", salary: 32000, dept: "IT", dept_id: 1 },
  { id: 8, name: "Harsh", age: 31, city: "Surat", salary: 45000, dept: "Sales", dept_id: 3 },
  { id: 9, name: "Isha", age: 29, city: "Rajkot", salary: 38000, dept: "HR", dept_id: 2 },
  { id: 10, name: "Jatin", age: 33, city: "Vadodara", salary: 42000, dept: "IT", dept_id: 1 },
  { id: 11, name: "Kavya", age: 24, city: "Surat", salary: 30000, dept: "Sales", dept_id: 3 },
  { id: 12, name: "Lalit", age: 37, city: "Rajkot", salary: 65000, dept: "HR", dept_id: 2 },
  { id: 13, name: "Meera", age: 27, city: "Vadodara", salary: 34000, dept: "IT", dept_id: 1 },
  { id: 14, name: "Nikhil", age: 32, city: "Surat", salary: 47000, dept: "Sales", dept_id: 3 },
  { id: 15, name: "Ojas", age: 23, city: "Ahmedabad", salary: 29000, dept: "IT", dept_id: 1 },
  { id: 16, name: "Priya", age: 36, city: "Vadodara", salary: 58000, dept: "HR", dept_id: 2 },
  { id: 17, name: "Rohan", age: 25, city: "Rajkot", salary: 31000, dept: "Sales", dept_id: 3 },
  { id: 18, name: "Sana", age: 34, city: "Ahmedabad", salary: 54000, dept: "IT", dept_id: 1 },
  { id: 19, name: "Tanish", age: 30, city: "Vadodara", salary: 40000, dept: "Sales", dept_id: 3 },
  { id: 20, name: "Usha", age: 28, city: "Rajkot", salary: 36000, dept: "HR", dept_id: 2 }
];

export const CUSTOMERS = [
  { id: 1, name: "Riya Shah", city: "Ahmedabad" },
  { id: 2, name: "Karan Mehta", city: "Surat" },
  { id: 3, name: "Neha Patel", city: "Vadodara" },
  { id: 4, name: "Manav Joshi", city: "Rajkot" },
  { id: 5, name: "Asha Desai", city: "Ahmedabad" }
];

export const CATEGORIES = [
  { id: 1, name: "Electronics" },
  { id: 2, name: "Furniture" },
  { id: 3, name: "Stationery" },
  { id: 4, name: "Kitchen" }
];

export const PRODUCTS = [
  { id: 1, name: "Laptop", price: 72000, category: "Electronics", category_id: 1 },
  { id: 2, name: "Desk Chair", price: 8500, category: "Furniture", category_id: 2 },
  { id: 3, name: "Headphones", price: 3200, category: "Electronics", category_id: 1 },
  { id: 4, name: "Notebook", price: 120, category: "Stationery", category_id: 3 },
  { id: 5, name: "Coffee Mug", price: 450, category: "Kitchen", category_id: 3 }
];

export const ORDERS = [
  { id: 1, customer_id: 1, order_date: "2026-03-01", status: "Delivered" },
  { id: 2, customer_id: 2, order_date: "2026-03-03", status: "Packed" },
  { id: 3, customer_id: 3, order_date: "2026-03-08", status: "Shipped" },
  { id: 4, customer_id: 4, order_date: "2026-03-09", status: "Delivered" },
  { id: 5, customer_id: 5, order_date: "2026-03-12", status: "Pending" }
];

export const ORDER_ITEMS = [
  { id: 1, order_id: 1, product_id: 1, quantity: 2 },
  { id: 2, order_id: 2, product_id: 3, quantity: 4 },
  { id: 3, order_id: 3, product_id: 2, quantity: 1 },
  { id: 4, order_id: 4, product_id: 5, quantity: 6 },
  { id: 5, order_id: 5, product_id: 4, quantity: 10 }
];

export const PAYMENTS = [
  { id: 1, order_id: 1, amount: 144000, method: "Card", status: "Paid" },
  { id: 2, order_id: 2, amount: 12800, method: "UPI", status: "Paid" },
  { id: 3, order_id: 3, amount: 8500, method: "Card", status: "Processing" },
  { id: 4, order_id: 4, amount: 2700, method: "Cash", status: "Paid" }
];

export const DEPARTMENTS = [
  { id: 1, name: "IT" },
  { id: 2, name: "Sales" },
  { id: 3, name: "HR" }
];

export const DATABASE = {
  EMPLOYEES,
  CUSTOMERS,
  CATEGORIES,
  PRODUCTS,
  ORDERS,
  ORDER_ITEMS,
  PAYMENTS,
  DEPARTMENTS
};

export const QUERY_SCHEMA = {
  EMPLOYEES: ["id", "name", "age", "city", "salary", "dept", "dept_id"],
  CUSTOMERS: ["id", "name", "city"],
  CATEGORIES: ["id", "name"],
  PRODUCTS: ["id", "name", "price", "category", "category_id"],
  ORDERS: ["id", "customer_id", "order_date", "status"],
  ORDER_ITEMS: ["id", "order_id", "product_id", "quantity"],
  PAYMENTS: ["id", "order_id", "amount", "method", "status"],
  DEPARTMENTS: ["id", "name"]
};
