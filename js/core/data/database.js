// =====================================================
// DEPARTMENTS
// One Department -> Many Employees / Projects
// =====================================================
export const DEPARTMENTS = [
  { id: 1, name: "IT", location: "Ahmedabad", budget: 500000, created_at: "2025-01-01" },
  { id: 2, name: "HR", location: "Surat", budget: 200000, created_at: "2025-01-03" },
  { id: 3, name: "Sales", location: "Vadodara", budget: 350000, created_at: "2025-01-05" },
  { id: 4, name: "Finance", location: "Rajkot", budget: 300000, created_at: "2025-01-07" },
  { id: 5, name: "Operations", location: "Ahmedabad", budget: 450000, created_at: "2025-01-10" }
];

// =====================================================
// ROLES
// One Role -> Many Employees
// =====================================================
export const ROLES = [
  { id: 1, name: "Developer", level: "L1", base_salary: 30000, created_at: "2025-01-01" },
  { id: 2, name: "Senior Developer", level: "L2", base_salary: 50000, created_at: "2025-01-01" },
  { id: 3, name: "HR Executive", level: "L1", base_salary: 28000, created_at: "2025-01-01" },
  { id: 4, name: "Sales Executive", level: "L1", base_salary: 32000, created_at: "2025-01-01" },
  { id: 5, name: "Manager", level: "L3", base_salary: 65000, created_at: "2025-01-01" },
  { id: 6, name: "Accountant", level: "L2", base_salary: 45000, created_at: "2025-01-01" },
  { id: 7, name: "Operations Executive", level: "L1", base_salary: 35000, created_at: "2025-01-01" }
];

// =====================================================
// EMPLOYEES
// Many Employees -> One Department
// Many Employees -> One Role
// Self reference via manager_id
// =====================================================
export const EMPLOYEES = [
  { id: 1, name: "Amit", age: 20, gender: "Male", city: "Ahmedabad", salary: 25000, email: "amit@company.com", phone: "9000000001", dept_id: 1, role_id: 1, manager_id: 3, hire_date: "2025-06-10", status: "Active", created_at: "2025-06-10" },
  { id: 2, name: "Bhavya", age: 30, gender: "Female", city: "Surat", salary: 40000, email: "bhavya@company.com", phone: "9000000002", dept_id: 2, role_id: 3, manager_id: 12, hire_date: "2024-11-15", status: "Active", created_at: "2024-11-15" },
  { id: 3, name: "Chirag", age: 40, gender: "Male", city: "Ahmedabad", salary: 55000, email: "chirag@company.com", phone: "9000000003", dept_id: 1, role_id: 5, manager_id: null, hire_date: "2023-04-01", status: "Active", created_at: "2023-04-01" },
  { id: 4, name: "Dhruv", age: 22, gender: "Male", city: "Vadodara", salary: 28000, email: "dhruv@company.com", phone: "9000000004", dept_id: 3, role_id: 4, manager_id: 6, hire_date: "2025-07-20", status: "Active", created_at: "2025-07-20" },
  { id: 5, name: "Esha", age: 28, gender: "Female", city: "Surat", salary: 35000, email: "esha@company.com", phone: "9000000005", dept_id: 2, role_id: 3, manager_id: 12, hire_date: "2025-01-10", status: "Active", created_at: "2025-01-10" },
  { id: 6, name: "Farhan", age: 35, gender: "Male", city: "Ahmedabad", salary: 60000, email: "farhan@company.com", phone: "9000000006", dept_id: 3, role_id: 5, manager_id: null, hire_date: "2023-08-08", status: "Active", created_at: "2023-08-08" },
  { id: 7, name: "Gauri", age: 26, gender: "Female", city: "Rajkot", salary: 32000, email: "gauri@company.com", phone: "9000000007", dept_id: 1, role_id: 1, manager_id: 3, hire_date: "2025-02-14", status: "Active", created_at: "2025-02-14" },
  { id: 8, name: "Harsh", age: 31, gender: "Male", city: "Surat", salary: 45000, email: "harsh@company.com", phone: "9000000008", dept_id: 3, role_id: 4, manager_id: 6, hire_date: "2024-09-12", status: "Active", created_at: "2024-09-12" },
  { id: 9, name: "Isha", age: 29, gender: "Female", city: "Rajkot", salary: 38000, email: "isha@company.com", phone: "9000000009", dept_id: 2, role_id: 3, manager_id: 12, hire_date: "2024-12-01", status: "Active", created_at: "2024-12-01" },
  { id: 10, name: "Jatin", age: 33, gender: "Male", city: "Vadodara", salary: 42000, email: "jatin@company.com", phone: "9000000010", dept_id: 1, role_id: 2, manager_id: 3, hire_date: "2024-03-14", status: "Active", created_at: "2024-03-14" },
  { id: 11, name: "Kavya", age: 24, gender: "Female", city: "Surat", salary: 30000, email: "kavya@company.com", phone: "9000000011", dept_id: 3, role_id: 4, manager_id: 6, hire_date: "2025-09-01", status: "Active", created_at: "2025-09-01" },
  { id: 12, name: "Lalit", age: 37, gender: "Male", city: "Rajkot", salary: 65000, email: "lalit@company.com", phone: "9000000012", dept_id: 2, role_id: 5, manager_id: null, hire_date: "2023-01-18", status: "Active", created_at: "2023-01-18" },
  { id: 13, name: "Meera", age: 27, gender: "Female", city: "Vadodara", salary: 34000, email: "meera@company.com", phone: "9000000013", dept_id: 1, role_id: 1, manager_id: 3, hire_date: "2025-04-05", status: "Active", created_at: "2025-04-05" },
  { id: 14, name: "Nikhil", age: 32, gender: "Male", city: "Surat", salary: 47000, email: "nikhil@company.com", phone: "9000000014", dept_id: 3, role_id: 4, manager_id: 6, hire_date: "2024-06-23", status: "Resigned", created_at: "2024-06-23" },
  { id: 15, name: "Ojas", age: 23, gender: "Male", city: "Ahmedabad", salary: 29000, email: "ojas@company.com", phone: "9000000015", dept_id: 1, role_id: 1, manager_id: 3, hire_date: "2025-10-10", status: "Active", created_at: "2025-10-10" },
  { id: 16, name: "Priya", age: 36, gender: "Female", city: "Vadodara", salary: 58000, email: "priya@company.com", phone: "9000000016", dept_id: 4, role_id: 6, manager_id: null, hire_date: "2023-02-11", status: "Active", created_at: "2023-02-11" },
  { id: 17, name: "Rohan", age: 25, gender: "Male", city: "Rajkot", salary: 31000, email: "rohan@company.com", phone: "9000000017", dept_id: 5, role_id: 7, manager_id: 18, hire_date: "2025-03-17", status: "Active", created_at: "2025-03-17" },
  { id: 18, name: "Sana", age: 34, gender: "Female", city: "Ahmedabad", salary: 54000, email: "sana@company.com", phone: "9000000018", dept_id: 5, role_id: 5, manager_id: null, hire_date: "2023-05-09", status: "Active", created_at: "2023-05-09" },
  { id: 19, name: "Tanish", age: 30, gender: "Male", city: "Vadodara", salary: 40000, email: "tanish@company.com", phone: "9000000019", dept_id: 3, role_id: 4, manager_id: 6, hire_date: "2024-08-20", status: "On Leave", created_at: "2024-08-20" },
  { id: 20, name: "Usha", age: 28, gender: "Female", city: "Rajkot", salary: 36000, email: "usha@company.com", phone: "9000000020", dept_id: 2, role_id: 3, manager_id: 12, hire_date: "2025-01-28", status: "Active", created_at: "2025-01-28" }
];

// =====================================================
// EMPLOYEE_DETAILS
// One-to-One with Employees
// =====================================================
export const EMPLOYEE_DETAILS = [
  { id: 1, employee_id: 1, pan_no: "PAN1001", aadhaar_last4: "1111", marital_status: "Single", blood_group: "B+", emergency_contact: "9898000001", created_at: "2025-06-10" },
  { id: 2, employee_id: 2, pan_no: "PAN1002", aadhaar_last4: "2222", marital_status: "Married", blood_group: "O+", emergency_contact: "9898000002", created_at: "2024-11-15" },
  { id: 3, employee_id: 3, pan_no: "PAN1003", aadhaar_last4: "3333", marital_status: "Married", blood_group: "A+", emergency_contact: "9898000003", created_at: "2023-04-01" },
  { id: 4, employee_id: 4, pan_no: "PAN1004", aadhaar_last4: "4444", marital_status: "Single", blood_group: "AB+", emergency_contact: "9898000004", created_at: "2025-07-20" },
  { id: 5, employee_id: 5, pan_no: "PAN1005", aadhaar_last4: "5555", marital_status: "Single", blood_group: "O-", emergency_contact: "9898000005", created_at: "2025-01-10" }
];

// =====================================================
// ATTENDANCE
// Many Attendance rows -> One Employee
// Great for DATE functions + aggregates
// =====================================================
export const ATTENDANCE = [
  { id: 1, employee_id: 1, attendance_date: "2026-03-01", check_in: "09:11", check_out: "18:02", status: "Present", work_mode: "Office", created_at: "2026-03-01" },
  { id: 2, employee_id: 2, attendance_date: "2026-03-01", check_in: "09:02", check_out: "18:15", status: "Present", work_mode: "Office", created_at: "2026-03-01" },
  { id: 3, employee_id: 3, attendance_date: "2026-03-01", check_in: "08:55", check_out: "18:40", status: "Present", work_mode: "Office", created_at: "2026-03-01" },
  { id: 4, employee_id: 1, attendance_date: "2026-03-02", check_in: "09:25", check_out: "18:03", status: "Late", work_mode: "Office", created_at: "2026-03-02" },
  { id: 5, employee_id: 4, attendance_date: "2026-03-02", check_in: null, check_out: null, status: "Absent", work_mode: "N/A", created_at: "2026-03-02" },
  { id: 6, employee_id: 5, attendance_date: "2026-03-02", check_in: "09:05", check_out: "17:58", status: "Present", work_mode: "WFH", created_at: "2026-03-02" },
  { id: 7, employee_id: 6, attendance_date: "2026-03-03", check_in: "09:15", check_out: "18:10", status: "Present", work_mode: "Office", created_at: "2026-03-03" },
  { id: 8, employee_id: 7, attendance_date: "2026-03-03", check_in: "09:32", check_out: "18:00", status: "Late", work_mode: "Office", created_at: "2026-03-03" },
  { id: 9, employee_id: 8, attendance_date: "2026-03-04", check_in: "09:08", check_out: "18:01", status: "Present", work_mode: "Office", created_at: "2026-03-04" },
  { id: 10, employee_id: 9, attendance_date: "2026-03-04", check_in: null, check_out: null, status: "Leave", work_mode: "N/A", created_at: "2026-03-04" },
  { id: 11, employee_id: 10, attendance_date: "2026-03-05", check_in: "09:00", check_out: "18:05", status: "Present", work_mode: "WFH", created_at: "2026-03-05" },
  { id: 12, employee_id: 11, attendance_date: "2026-03-05", check_in: "09:18", check_out: "18:08", status: "Present", work_mode: "Office", created_at: "2026-03-05" }
];

// =====================================================
// LEAVES
// Many Leaves -> One Employee
// =====================================================
export const LEAVES = [
  { id: 1, employee_id: 9, leave_type: "Sick", start_date: "2026-03-04", end_date: "2026-03-05", total_days: 2, status: "Approved", applied_at: "2026-03-03" },
  { id: 2, employee_id: 19, leave_type: "Casual", start_date: "2026-03-10", end_date: "2026-03-12", total_days: 3, status: "Pending", applied_at: "2026-03-08" },
  { id: 3, employee_id: 5, leave_type: "Vacation", start_date: "2026-02-20", end_date: "2026-02-25", total_days: 6, status: "Approved", applied_at: "2026-02-01" },
  { id: 4, employee_id: 1, leave_type: "Sick", start_date: "2026-01-10", end_date: "2026-01-11", total_days: 2, status: "Rejected", applied_at: "2026-01-09" }
];

// =====================================================
// PROJECTS
// One Department -> Many Projects
// =====================================================
export const PROJECTS = [
  { id: 1, name: "ERP Upgrade", dept_id: 1, start_date: "2026-01-01", end_date: "2026-06-30", budget: 150000, status: "In Progress", created_at: "2025-12-15" },
  { id: 2, name: "Recruitment Drive", dept_id: 2, start_date: "2026-02-01", end_date: "2026-04-15", budget: 50000, status: "In Progress", created_at: "2026-01-20" },
  { id: 3, name: "Market Expansion", dept_id: 3, start_date: "2026-01-15", end_date: "2026-08-31", budget: 100000, status: "Planned", created_at: "2026-01-05" },
  { id: 4, name: "Audit Automation", dept_id: 4, start_date: "2026-03-01", end_date: "2026-07-31", budget: 80000, status: "In Progress", created_at: "2026-02-15" },
  { id: 5, name: "Warehouse Optimization", dept_id: 5, start_date: "2026-02-10", end_date: "2026-05-20", budget: 90000, status: "Completed", created_at: "2026-01-30" }
];

// =====================================================
// EMPLOYEE_PROJECTS
// Many-to-Many between Employees and Projects
// =====================================================
export const EMPLOYEE_PROJECTS = [
  { id: 1, employee_id: 1, project_id: 1, role: "Developer", hours_allocated: 120, assigned_at: "2026-01-05" },
  { id: 2, employee_id: 3, project_id: 1, role: "Team Lead", hours_allocated: 80, assigned_at: "2026-01-03" },
  { id: 3, employee_id: 7, project_id: 1, role: "QA Engineer", hours_allocated: 60, assigned_at: "2026-01-10" },
  { id: 4, employee_id: 2, project_id: 2, role: "Coordinator", hours_allocated: 40, assigned_at: "2026-02-01" },
  { id: 5, employee_id: 12, project_id: 2, role: "Manager", hours_allocated: 30, assigned_at: "2026-01-28" },
  { id: 6, employee_id: 6, project_id: 3, role: "Sales Lead", hours_allocated: 90, assigned_at: "2026-01-18" },
  { id: 7, employee_id: 8, project_id: 3, role: "Executive", hours_allocated: 50, assigned_at: "2026-01-20" },
  { id: 8, employee_id: 16, project_id: 4, role: "Finance Head", hours_allocated: 70, assigned_at: "2026-03-01" },
  { id: 9, employee_id: 17, project_id: 5, role: "Coordinator", hours_allocated: 55, assigned_at: "2026-02-12" },
  { id: 10, employee_id: 18, project_id: 5, role: "Manager", hours_allocated: 65, assigned_at: "2026-02-10" }
];

// =====================================================
// CUSTOMERS
// One Customer -> Many Orders / Addresses / Reviews
// =====================================================
export const CUSTOMERS = [
  { id: 1, name: "Riya Shah", email: "riya@gmail.com", phone: "987650001", city: "Ahmedabad", gender: "Female", created_at: "2026-01-02", referred_by_customer_id: null },
  { id: 2, name: "Karan Mehta", email: "karan@gmail.com", phone: "987650002", city: "Surat", gender: "Male", created_at: "2026-01-04", referred_by_customer_id: 1 },
  { id: 3, name: "Neha Patel", email: "neha@gmail.com", phone: "987650003", city: "Vadodara", gender: "Female", created_at: "2026-01-10", referred_by_customer_id: null },
  { id: 4, name: "Manav Joshi", email: "manav@gmail.com", phone: "987650004", city: "Rajkot", gender: "Male", created_at: "2026-01-15", referred_by_customer_id: 2 },
  { id: 5, name: "Asha Desai", email: "asha@gmail.com", phone: "987650005", city: "Ahmedabad", gender: "Female", created_at: "2026-01-18", referred_by_customer_id: 1 },
  { id: 6, name: "Dev Rana", email: "dev@gmail.com", phone: "987650006", city: "Surat", gender: "Male", created_at: "2026-02-01", referred_by_customer_id: null },
  { id: 7, name: "Mitali Trivedi", email: "mitali@gmail.com", phone: "987650007", city: "Vadodara", gender: "Female", created_at: "2026-02-08", referred_by_customer_id: 3 },
  { id: 8, name: "Yash Soni", email: "yash@gmail.com", phone: "987650008", city: "Rajkot", gender: "Male", created_at: "2026-02-10", referred_by_customer_id: 2 }
];

// =====================================================
// CUSTOMER_ADDRESSES
// One Customer -> Many Addresses
// =====================================================
export const CUSTOMER_ADDRESSES = [
  { id: 1, customer_id: 1, type: "Home", line1: "Satellite Road", city: "Ahmedabad", state: "Gujarat", pincode: "380015", created_at: "2026-01-02" },
  { id: 2, customer_id: 1, type: "Office", line1: "Prahladnagar", city: "Ahmedabad", state: "Gujarat", pincode: "380051", created_at: "2026-01-03" },
  { id: 3, customer_id: 2, type: "Home", line1: "Adajan", city: "Surat", state: "Gujarat", pincode: "395009", created_at: "2026-01-04" },
  { id: 4, customer_id: 3, type: "Home", line1: "Alkapuri", city: "Vadodara", state: "Gujarat", pincode: "390007", created_at: "2026-01-10" },
  { id: 5, customer_id: 4, type: "Home", line1: "Kalavad Road", city: "Rajkot", state: "Gujarat", pincode: "360005", created_at: "2026-01-15" },
  { id: 6, customer_id: 5, type: "Home", line1: "Navrangpura", city: "Ahmedabad", state: "Gujarat", pincode: "380009", created_at: "2026-01-18" },
  { id: 7, customer_id: 6, type: "Home", line1: "Vesu", city: "Surat", state: "Gujarat", pincode: "395007", created_at: "2026-02-01" },
  { id: 8, customer_id: 7, type: "Home", line1: "Gotri", city: "Vadodara", state: "Gujarat", pincode: "390021", created_at: "2026-02-08" },
  { id: 9, customer_id: 8, type: "Home", line1: "University Road", city: "Rajkot", state: "Gujarat", pincode: "360001", created_at: "2026-02-10" }
];

// =====================================================
// CATEGORIES
// Self-referencing parent_category_id
// =====================================================
export const CATEGORIES = [
  { id: 1, name: "Electronics", parent_category_id: null, created_at: "2025-01-01" },
  { id: 2, name: "Furniture", parent_category_id: null, created_at: "2025-01-02" },
  { id: 3, name: "Stationery", parent_category_id: null, created_at: "2025-01-03" },
  { id: 4, name: "Kitchen", parent_category_id: null, created_at: "2025-01-04" },
  { id: 5, name: "Accessories", parent_category_id: null, created_at: "2025-01-05" },
  { id: 6, name: "Laptops", parent_category_id: 1, created_at: "2025-01-06" },
  { id: 7, name: "Audio", parent_category_id: 1, created_at: "2025-01-07" }
];

// =====================================================
// SUPPLIERS
// One Supplier -> Many Products
// =====================================================
export const SUPPLIERS = [
  { id: 1, name: "TechSource Pvt Ltd", city: "Ahmedabad", contact_email: "sales@techsource.com", joined_at: "2025-03-01", rating: 4.7 },
  { id: 2, name: "OfficeMart", city: "Surat", contact_email: "contact@officemart.com", joined_at: "2025-03-05", rating: 4.3 },
  { id: 3, name: "KitchenKing", city: "Rajkot", contact_email: "hello@kitchenking.com", joined_at: "2025-03-12", rating: 4.5 },
  { id: 4, name: "FurniWorld", city: "Vadodara", contact_email: "support@furniworld.com", joined_at: "2025-03-18", rating: 4.1 }
];

// =====================================================
// WAREHOUSES
// One Warehouse -> Many Inventory rows / Shipments
// =====================================================
export const WAREHOUSES = [
  { id: 1, name: "Ahmedabad Central", city: "Ahmedabad", capacity: 1000, created_at: "2025-04-01" },
  { id: 2, name: "Surat Hub", city: "Surat", capacity: 800, created_at: "2025-04-10" },
  { id: 3, name: "Rajkot Storage", city: "Rajkot", capacity: 600, created_at: "2025-04-20" }
];

// =====================================================
// PRODUCTS
// Many Products -> One Category
// Many Products -> One Supplier
// =====================================================
export const PRODUCTS = [
  { id: 1, name: "Laptop", sku: "ELE-LAP-001", price: 72000, cost_price: 60000, stock: 15, category_id: 6, supplier_id: 1, launch_date: "2025-08-01", created_at: "2025-08-01", status: "Active" },
  { id: 2, name: "Desk Chair", sku: "FUR-CHA-001", price: 8500, cost_price: 6200, stock: 40, category_id: 2, supplier_id: 4, launch_date: "2025-07-15", created_at: "2025-07-15", status: "Active" },
  { id: 3, name: "Headphones", sku: "ELE-AUD-001", price: 3200, cost_price: 2200, stock: 60, category_id: 7, supplier_id: 1, launch_date: "2025-09-10", created_at: "2025-09-10", status: "Active" },
  { id: 4, name: "Notebook", sku: "STA-NBK-001", price: 120, cost_price: 70, stock: 500, category_id: 3, supplier_id: 2, launch_date: "2025-06-01", created_at: "2025-06-01", status: "Active" },
  { id: 5, name: "Coffee Mug", sku: "KIT-MUG-001", price: 450, cost_price: 250, stock: 120, category_id: 4, supplier_id: 3, launch_date: "2025-05-11", created_at: "2025-05-11", status: "Active" },
  { id: 6, name: "Mouse", sku: "ACC-MOU-001", price: 900, cost_price: 500, stock: 100, category_id: 5, supplier_id: 1, launch_date: "2025-10-01", created_at: "2025-10-01", status: "Active" },
  { id: 7, name: "Keyboard", sku: "ACC-KEY-001", price: 1500, cost_price: 950, stock: 80, category_id: 5, supplier_id: 1, launch_date: "2025-10-05", created_at: "2025-10-05", status: "Active" },
  { id: 8, name: "Study Table", sku: "FUR-TBL-001", price: 12000, cost_price: 9000, stock: 20, category_id: 2, supplier_id: 4, launch_date: "2025-07-25", created_at: "2025-07-25", status: "Active" },
  { id: 9, name: "Bottle", sku: "KIT-BOT-001", price: 600, cost_price: 320, stock: 150, category_id: 4, supplier_id: 3, launch_date: "2025-05-20", created_at: "2025-05-20", status: "Active" },
  { id: 10, name: "Pen Pack", sku: "STA-PEN-001", price: 90, cost_price: 45, stock: 400, category_id: 3, supplier_id: 2, launch_date: "2025-06-08", created_at: "2025-06-08", status: "Discontinued" }
];

// =====================================================
// INVENTORY
// Many-to-Many style between Products and Warehouses
// =====================================================
export const INVENTORY = [
  { id: 1, product_id: 1, warehouse_id: 1, quantity: 8, last_restocked_at: "2026-03-01" },
  { id: 2, product_id: 1, warehouse_id: 2, quantity: 7, last_restocked_at: "2026-03-04" },
  { id: 3, product_id: 2, warehouse_id: 2, quantity: 18, last_restocked_at: "2026-03-03" },
  { id: 4, product_id: 2, warehouse_id: 3, quantity: 22, last_restocked_at: "2026-03-05" },
  { id: 5, product_id: 3, warehouse_id: 1, quantity: 30, last_restocked_at: "2026-03-02" },
  { id: 6, product_id: 4, warehouse_id: 1, quantity: 200, last_restocked_at: "2026-03-01" },
  { id: 7, product_id: 5, warehouse_id: 3, quantity: 80, last_restocked_at: "2026-03-07" },
  { id: 8, product_id: 6, warehouse_id: 1, quantity: 60, last_restocked_at: "2026-03-06" },
  { id: 9, product_id: 7, warehouse_id: 2, quantity: 50, last_restocked_at: "2026-03-06" },
  { id: 10, product_id: 8, warehouse_id: 3, quantity: 20, last_restocked_at: "2026-03-05" },
  { id: 11, product_id: 9, warehouse_id: 2, quantity: 100, last_restocked_at: "2026-03-08" },
  { id: 12, product_id: 10, warehouse_id: 1, quantity: 250, last_restocked_at: "2026-03-01" }
];

// =====================================================
// COUPONS
// One Coupon -> Many Orders
// =====================================================
export const COUPONS = [
  { id: 1, code: "WELCOME10", discount_type: "Percentage", discount_value: 10, min_order_amount: 500, valid_from: "2026-01-01", valid_to: "2026-12-31", status: "Active", created_at: "2025-12-20" },
  { id: 2, code: "FLAT200", discount_type: "Flat", discount_value: 200, min_order_amount: 2000, valid_from: "2026-02-01", valid_to: "2026-06-30", status: "Active", created_at: "2026-01-25" },
  { id: 3, code: "SUMMER15", discount_type: "Percentage", discount_value: 15, min_order_amount: 3000, valid_from: "2026-03-01", valid_to: "2026-05-31", status: "Expired", created_at: "2026-02-20" }
];

// =====================================================
// ORDERS
// Many Orders -> One Customer
// Many Orders -> One Address
// Optional coupon_id
// =====================================================
export const ORDERS = [
  { id: 1, customer_id: 1, shipping_address_id: 1, coupon_id: 1, order_date: "2026-03-01", status: "Delivered", total_amount: 144000, discount_amount: 14400, final_amount: 129600, created_at: "2026-03-01" },
  { id: 2, customer_id: 2, shipping_address_id: 3, coupon_id: null, order_date: "2026-03-03", status: "Packed", total_amount: 12800, discount_amount: 0, final_amount: 12800, created_at: "2026-03-03" },
  { id: 3, customer_id: 3, shipping_address_id: 4, coupon_id: 2, order_date: "2026-03-08", status: "Shipped", total_amount: 8500, discount_amount: 200, final_amount: 8300, created_at: "2026-03-08" },
  { id: 4, customer_id: 4, shipping_address_id: 5, coupon_id: null, order_date: "2026-03-09", status: "Delivered", total_amount: 2700, discount_amount: 0, final_amount: 2700, created_at: "2026-03-09" },
  { id: 5, customer_id: 5, shipping_address_id: 6, coupon_id: 1, order_date: "2026-03-12", status: "Pending", total_amount: 1200, discount_amount: 120, final_amount: 1080, created_at: "2026-03-12" },
  { id: 6, customer_id: 1, shipping_address_id: 2, coupon_id: null, order_date: "2026-03-14", status: "Delivered", total_amount: 3300, discount_amount: 0, final_amount: 3300, created_at: "2026-03-14" },
  { id: 7, customer_id: 6, shipping_address_id: 7, coupon_id: 2, order_date: "2026-03-15", status: "Cancelled", total_amount: 12000, discount_amount: 200, final_amount: 11800, created_at: "2026-03-15" },
  { id: 8, customer_id: 7, shipping_address_id: 8, coupon_id: null, order_date: "2026-03-16", status: "Pending", total_amount: 2250, discount_amount: 0, final_amount: 2250, created_at: "2026-03-16" },
  { id: 9, customer_id: 8, shipping_address_id: 9, coupon_id: 1, order_date: "2026-02-25", status: "Delivered", total_amount: 1800, discount_amount: 180, final_amount: 1620, created_at: "2026-02-25" },
  { id: 10, customer_id: 3, shipping_address_id: 4, coupon_id: null, order_date: "2026-01-20", status: "Delivered", total_amount: 900, discount_amount: 0, final_amount: 900, created_at: "2026-01-20" }
];

// =====================================================
// ORDER_ITEMS
// Creates Many-to-Many between Orders and Products
// =====================================================
export const ORDER_ITEMS = [
  { id: 1, order_id: 1, product_id: 1, quantity: 2, unit_price: 72000, total_price: 144000, created_at: "2026-03-01" },
  { id: 2, order_id: 2, product_id: 3, quantity: 4, unit_price: 3200, total_price: 12800, created_at: "2026-03-03" },
  { id: 3, order_id: 3, product_id: 2, quantity: 1, unit_price: 8500, total_price: 8500, created_at: "2026-03-08" },
  { id: 4, order_id: 4, product_id: 5, quantity: 6, unit_price: 450, total_price: 2700, created_at: "2026-03-09" },
  { id: 5, order_id: 5, product_id: 4, quantity: 10, unit_price: 120, total_price: 1200, created_at: "2026-03-12" },
  { id: 6, order_id: 6, product_id: 6, quantity: 2, unit_price: 900, total_price: 1800, created_at: "2026-03-14" },
  { id: 7, order_id: 6, product_id: 7, quantity: 1, unit_price: 1500, total_price: 1500, created_at: "2026-03-14" },
  { id: 8, order_id: 7, product_id: 8, quantity: 1, unit_price: 12000, total_price: 12000, created_at: "2026-03-15" },
  { id: 9, order_id: 8, product_id: 9, quantity: 3, unit_price: 600, total_price: 1800, created_at: "2026-03-16" },
  { id: 10, order_id: 8, product_id: 10, quantity: 5, unit_price: 90, total_price: 450, created_at: "2026-03-16" },
  { id: 11, order_id: 9, product_id: 6, quantity: 2, unit_price: 900, total_price: 1800, created_at: "2026-02-25" },
  { id: 12, order_id: 10, product_id: 6, quantity: 1, unit_price: 900, total_price: 900, created_at: "2026-01-20" }
];

// =====================================================
// PAYMENTS
// One Order -> Many Payments
// =====================================================
export const PAYMENTS = [
  { id: 1, order_id: 1, amount: 100000, method: "Card", status: "Paid", payment_date: "2026-03-01", transaction_ref: "TXN1001", created_at: "2026-03-01" },
  { id: 2, order_id: 1, amount: 29600, method: "UPI", status: "Paid", payment_date: "2026-03-01", transaction_ref: "TXN1002", created_at: "2026-03-01" },
  { id: 3, order_id: 2, amount: 12800, method: "UPI", status: "Paid", payment_date: "2026-03-03", transaction_ref: "TXN1003", created_at: "2026-03-03" },
  { id: 4, order_id: 3, amount: 8300, method: "Card", status: "Processing", payment_date: "2026-03-08", transaction_ref: "TXN1004", created_at: "2026-03-08" },
  { id: 5, order_id: 4, amount: 2700, method: "Cash", status: "Paid", payment_date: "2026-03-09", transaction_ref: "TXN1005", created_at: "2026-03-09" },
  { id: 6, order_id: 6, amount: 3300, method: "Gift Card", status: "Paid", payment_date: "2026-03-14", transaction_ref: "TXN1006", created_at: "2026-03-14" },
  { id: 7, order_id: 9, amount: 1620, method: "Card", status: "Paid", payment_date: "2026-02-25", transaction_ref: "TXN1007", created_at: "2026-02-25" },
  { id: 8, order_id: 10, amount: 900, method: "UPI", status: "Refunded", payment_date: "2026-01-20", transaction_ref: "TXN1008", created_at: "2026-01-20" }
];

// =====================================================
// SHIPMENTS
// One Order -> One Shipment in this practice dataset
// =====================================================
export const SHIPMENTS = [
  { id: 1, order_id: 1, warehouse_id: 1, courier: "BlueDart", tracking_no: "BD123", shipped_date: "2026-03-02", expected_delivery_date: "2026-03-04", delivered_date: "2026-03-04", shipping_cost: 250, status: "Delivered", created_at: "2026-03-02" },
  { id: 2, order_id: 3, warehouse_id: 2, courier: "Delhivery", tracking_no: "DL456", shipped_date: "2026-03-09", expected_delivery_date: "2026-03-12", delivered_date: null, shipping_cost: 180, status: "In Transit", created_at: "2026-03-09" },
  { id: 3, order_id: 4, warehouse_id: 3, courier: "XpressBees", tracking_no: "XB789", shipped_date: "2026-03-10", expected_delivery_date: "2026-03-11", delivered_date: "2026-03-11", shipping_cost: 120, status: "Delivered", created_at: "2026-03-10" },
  { id: 4, order_id: 6, warehouse_id: 1, courier: "EcomExpress", tracking_no: "EE111", shipped_date: "2026-03-15", expected_delivery_date: "2026-03-17", delivered_date: "2026-03-17", shipping_cost: 90, status: "Delivered", created_at: "2026-03-15" },
  { id: 5, order_id: 9, warehouse_id: 2, courier: "DTDC", tracking_no: "DT900", shipped_date: "2026-02-26", expected_delivery_date: "2026-02-28", delivered_date: "2026-03-01", shipping_cost: 95, status: "Delivered", created_at: "2026-02-26" }
];

// =====================================================
// RETURNS
// One Order item can have zero/one return in this demo
// =====================================================
export const RETURNS = [
  { id: 1, order_item_id: 12, reason: "Defective item", return_date: "2026-01-25", refund_amount: 900, status: "Approved", created_at: "2026-01-25" },
  { id: 2, order_item_id: 4, reason: "Wrong size", return_date: "2026-03-15", refund_amount: 450, status: "Requested", created_at: "2026-03-15" }
];

// =====================================================
// REVIEWS
// One Customer -> Many Reviews
// One Product -> Many Reviews
// =====================================================
export const REVIEWS = [
  { id: 1, customer_id: 1, product_id: 1, rating: 5, comment: "Excellent laptop", review_date: "2026-03-06", created_at: "2026-03-06" },
  { id: 2, customer_id: 2, product_id: 3, rating: 4, comment: "Sound quality is good", review_date: "2026-03-07", created_at: "2026-03-07" },
  { id: 3, customer_id: 4, product_id: 5, rating: 5, comment: "Nice mug", review_date: "2026-03-12", created_at: "2026-03-12" },
  { id: 4, customer_id: 1, product_id: 6, rating: 4, comment: "Useful mouse", review_date: "2026-03-18", created_at: "2026-03-18" },
  { id: 5, customer_id: 8, product_id: 6, rating: 3, comment: "Average", review_date: "2026-03-03", created_at: "2026-03-03" }
];

// =====================================================
// INVOICES
// One Order -> One Invoice
// =====================================================
export const INVOICES = [
  { id: 1, order_id: 1, invoice_no: "INV-2026-001", issue_date: "2026-03-01", due_date: "2026-03-01", subtotal: 144000, tax_amount: 25920, total_amount: 169920, status: "Paid", created_at: "2026-03-01" },
  { id: 2, order_id: 2, invoice_no: "INV-2026-002", issue_date: "2026-03-03", due_date: "2026-03-03", subtotal: 12800, tax_amount: 2304, total_amount: 15104, status: "Paid", created_at: "2026-03-03" },
  { id: 3, order_id: 3, invoice_no: "INV-2026-003", issue_date: "2026-03-08", due_date: "2026-03-08", subtotal: 8500, tax_amount: 1530, total_amount: 10030, status: "Partially Paid", created_at: "2026-03-08" },
  { id: 4, order_id: 4, invoice_no: "INV-2026-004", issue_date: "2026-03-09", due_date: "2026-03-09", subtotal: 2700, tax_amount: 486, total_amount: 3186, status: "Paid", created_at: "2026-03-09" },
  { id: 5, order_id: 6, invoice_no: "INV-2026-005", issue_date: "2026-03-14", due_date: "2026-03-14", subtotal: 3300, tax_amount: 594, total_amount: 3894, status: "Paid", created_at: "2026-03-14" }
];

// =====================================================
// PERMISSIONS
// =====================================================
export const PERMISSIONS = [
  { id: 1, name: "VIEW_USERS", module: "Users", created_at: "2025-01-01" },
  { id: 2, name: "CREATE_USERS", module: "Users", created_at: "2025-01-01" },
  { id: 3, name: "EDIT_PRODUCTS", module: "Products", created_at: "2025-01-01" },
  { id: 4, name: "VIEW_REPORTS", module: "Reports", created_at: "2025-01-01" },
  { id: 5, name: "MANAGE_ORDERS", module: "Orders", created_at: "2025-01-01" }
];

// =====================================================
// ROLE_PERMISSIONS
// Many-to-Many between Roles and Permissions
// =====================================================
export const ROLE_PERMISSIONS = [
  { id: 1, role_id: 1, permission_id: 1, granted_at: "2025-01-10" },
  { id: 2, role_id: 2, permission_id: 1, granted_at: "2025-01-10" },
  { id: 3, role_id: 2, permission_id: 3, granted_at: "2025-01-10" },
  { id: 4, role_id: 5, permission_id: 1, granted_at: "2025-01-10" },
  { id: 5, role_id: 5, permission_id: 2, granted_at: "2025-01-10" },
  { id: 6, role_id: 5, permission_id: 4, granted_at: "2025-01-10" },
  { id: 7, role_id: 5, permission_id: 5, granted_at: "2025-01-10" },
  { id: 8, role_id: 4, permission_id: 5, granted_at: "2025-01-10" }
];

// =====================================================
// DATABASE
// =====================================================
export const DATABASE = {
  DEPARTMENTS,
  ROLES,
  EMPLOYEES,
  EMPLOYEE_DETAILS,
  ATTENDANCE,
  LEAVES,
  PROJECTS,
  EMPLOYEE_PROJECTS,
  CUSTOMERS,
  CUSTOMER_ADDRESSES,
  CATEGORIES,
  SUPPLIERS,
  WAREHOUSES,
  PRODUCTS,
  INVENTORY,
  COUPONS,
  ORDERS,
  ORDER_ITEMS,
  PAYMENTS,
  SHIPMENTS,
  RETURNS,
  REVIEWS,
  INVOICES,
  PERMISSIONS,
  ROLE_PERMISSIONS
};

// =====================================================
// QUERY_SCHEMA
// =====================================================
export const QUERY_SCHEMA = {
  DEPARTMENTS: ["id", "name", "location", "budget", "created_at"],
  ROLES: ["id", "name", "level", "base_salary", "created_at"],
  EMPLOYEES: ["id", "name", "age", "gender", "city", "salary", "email", "phone", "dept_id", "role_id", "manager_id", "hire_date", "status", "created_at"],
  EMPLOYEE_DETAILS: ["id", "employee_id", "pan_no", "aadhaar_last4", "marital_status", "blood_group", "emergency_contact", "created_at"],
  ATTENDANCE: ["id", "employee_id", "attendance_date", "check_in", "check_out", "status", "work_mode", "created_at"],
  LEAVES: ["id", "employee_id", "leave_type", "start_date", "end_date", "total_days", "status", "applied_at"],
  PROJECTS: ["id", "name", "dept_id", "start_date", "end_date", "budget", "status", "created_at"],
  EMPLOYEE_PROJECTS: ["id", "employee_id", "project_id", "role", "hours_allocated", "assigned_at"],
  CUSTOMERS: ["id", "name", "email", "phone", "city", "gender", "created_at", "referred_by_customer_id"],
  CUSTOMER_ADDRESSES: ["id", "customer_id", "type", "line1", "city", "state", "pincode", "created_at"],
  CATEGORIES: ["id", "name", "parent_category_id", "created_at"],
  SUPPLIERS: ["id", "name", "city", "contact_email", "joined_at", "rating"],
  WAREHOUSES: ["id", "name", "city", "capacity", "created_at"],
  PRODUCTS: ["id", "name", "sku", "price", "cost_price", "stock", "category_id", "supplier_id", "launch_date", "created_at", "status"],
  INVENTORY: ["id", "product_id", "warehouse_id", "quantity", "last_restocked_at"],
  COUPONS: ["id", "code", "discount_type", "discount_value", "min_order_amount", "valid_from", "valid_to", "status", "created_at"],
  ORDERS: ["id", "customer_id", "shipping_address_id", "coupon_id", "order_date", "status", "total_amount", "discount_amount", "final_amount", "created_at"],
  ORDER_ITEMS: ["id", "order_id", "product_id", "quantity", "unit_price", "total_price", "created_at"],
  PAYMENTS: ["id", "order_id", "amount", "method", "status", "payment_date", "transaction_ref", "created_at"],
  SHIPMENTS: ["id", "order_id", "warehouse_id", "courier", "tracking_no", "shipped_date", "expected_delivery_date", "delivered_date", "shipping_cost", "status", "created_at"],
  RETURNS: ["id", "order_item_id", "reason", "return_date", "refund_amount", "status", "created_at"],
  REVIEWS: ["id", "customer_id", "product_id", "rating", "comment", "review_date", "created_at"],
  INVOICES: ["id", "order_id", "invoice_no", "issue_date", "due_date", "subtotal", "tax_amount", "total_amount", "status", "created_at"],
  PERMISSIONS: ["id", "name", "module", "created_at"],
  ROLE_PERMISSIONS: ["id", "role_id", "permission_id", "granted_at"]
};