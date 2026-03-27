-- SQL export generated from js/core/data/database.js
-- Target: MySQL 8+ / MySQL Workbench
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `shipments`;
DROP TABLE IF EXISTS `inventory`;
DROP TABLE IF EXISTS `warehouses`;
DROP TABLE IF EXISTS `reviews`;
DROP TABLE IF EXISTS `returns`;
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `suppliers`;
DROP TABLE IF EXISTS `role_permissions`;
DROP TABLE IF EXISTS `leaves`;
DROP TABLE IF EXISTS `employee_projects`;
DROP TABLE IF EXISTS `employee_details`;
DROP TABLE IF EXISTS `attendance`;
DROP TABLE IF EXISTS `employees`;
DROP TABLE IF EXISTS `roles`;
DROP TABLE IF EXISTS `projects`;
DROP TABLE IF EXISTS `permissions`;
DROP TABLE IF EXISTS `payments`;
DROP TABLE IF EXISTS `invoices`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `departments`;
DROP TABLE IF EXISTS `customer_addresses`;
DROP TABLE IF EXISTS `customers`;
DROP TABLE IF EXISTS `coupons`;
DROP TABLE IF EXISTS `categories`;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE `categories` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `parent_category_id` INT NULL,
  `created_at` DATE NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_categories_parent_category_id` (`parent_category_id`),
  CONSTRAINT `fk_categories_parent_category_id` FOREIGN KEY (`parent_category_id`) REFERENCES `categories` (`id`) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `coupons` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(64) NOT NULL,
  `discount_type` VARCHAR(50) NOT NULL,
  `discount_value` DECIMAL(12,2) NOT NULL,
  `min_order_amount` DECIMAL(12,2) NOT NULL,
  `valid_from` DATE NOT NULL,
  `valid_to` DATE NOT NULL,
  `status` VARCHAR(50) NOT NULL,
  `created_at` DATE NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `customers` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `email` VARCHAR(120) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `city` VARCHAR(50) NOT NULL,
  `gender` VARCHAR(50) NOT NULL,
  `created_at` DATE NOT NULL,
  `referred_by_customer_id` INT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_customers_referred_by_customer_id` (`referred_by_customer_id`),
  CONSTRAINT `fk_customers_referred_by_customer_id` FOREIGN KEY (`referred_by_customer_id`) REFERENCES `customers` (`id`) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `customer_addresses` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `customer_id` INT NOT NULL,
  `type` VARCHAR(50) NOT NULL,
  `line1` VARCHAR(50) NOT NULL,
  `city` VARCHAR(50) NOT NULL,
  `state` VARCHAR(50) NOT NULL,
  `pincode` VARCHAR(16) NOT NULL,
  `created_at` DATE NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_customer_addresses_customer_id` (`customer_id`),
  CONSTRAINT `fk_customer_addresses_customer_id` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `departments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `location` VARCHAR(50) NOT NULL,
  `budget` DECIMAL(12,2) NOT NULL,
  `created_at` DATE NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `orders` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `customer_id` INT NOT NULL,
  `shipping_address_id` INT NOT NULL,
  `coupon_id` INT NULL,
  `order_date` DATE NOT NULL,
  `status` VARCHAR(50) NOT NULL,
  `total_amount` DECIMAL(12,2) NOT NULL,
  `discount_amount` DECIMAL(12,2) NOT NULL,
  `final_amount` DECIMAL(12,2) NOT NULL,
  `created_at` DATE NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_orders_customer_id` (`customer_id`),
  KEY `idx_orders_shipping_address_id` (`shipping_address_id`),
  KEY `idx_orders_coupon_id` (`coupon_id`),
  CONSTRAINT `fk_orders_customer_id` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_orders_shipping_address_id` FOREIGN KEY (`shipping_address_id`) REFERENCES `customer_addresses` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_orders_coupon_id` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `invoices` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `order_id` INT NOT NULL,
  `invoice_no` VARCHAR(64) NOT NULL,
  `issue_date` DATE NOT NULL,
  `due_date` DATE NOT NULL,
  `subtotal` DECIMAL(12,2) NOT NULL,
  `tax_amount` DECIMAL(12,2) NOT NULL,
  `total_amount` DECIMAL(12,2) NOT NULL,
  `status` VARCHAR(50) NOT NULL,
  `created_at` DATE NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_invoices_order_id` (`order_id`),
  CONSTRAINT `fk_invoices_order_id` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `payments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `order_id` INT NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `method` VARCHAR(50) NOT NULL,
  `status` VARCHAR(50) NOT NULL,
  `payment_date` DATE NOT NULL,
  `transaction_ref` VARCHAR(64) NOT NULL,
  `created_at` DATE NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_payments_order_id` (`order_id`),
  CONSTRAINT `fk_payments_order_id` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `permissions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `module` VARCHAR(50) NOT NULL,
  `created_at` DATE NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `projects` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(120) NOT NULL,
  `dept_id` INT NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `budget` DECIMAL(12,2) NOT NULL,
  `status` VARCHAR(50) NOT NULL,
  `created_at` DATE NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_projects_dept_id` (`dept_id`),
  CONSTRAINT `fk_projects_dept_id` FOREIGN KEY (`dept_id`) REFERENCES `departments` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `roles` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `level` VARCHAR(50) NOT NULL,
  `base_salary` DECIMAL(12,2) NOT NULL,
  `created_at` DATE NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `employees` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `age` INT NOT NULL,
  `gender` VARCHAR(50) NOT NULL,
  `city` VARCHAR(50) NOT NULL,
  `salary` DECIMAL(12,2) NOT NULL,
  `email` VARCHAR(120) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `dept_id` INT NOT NULL,
  `role_id` INT NOT NULL,
  `manager_id` INT NULL,
  `hire_date` DATE NOT NULL,
  `status` VARCHAR(50) NOT NULL,
  `created_at` DATE NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_employees_dept_id` (`dept_id`),
  KEY `idx_employees_role_id` (`role_id`),
  KEY `idx_employees_manager_id` (`manager_id`),
  CONSTRAINT `fk_employees_dept_id` FOREIGN KEY (`dept_id`) REFERENCES `departments` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_employees_role_id` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_employees_manager_id` FOREIGN KEY (`manager_id`) REFERENCES `employees` (`id`) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `attendance` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `employee_id` INT NOT NULL,
  `attendance_date` DATE NOT NULL,
  `check_in` TIME NULL,
  `check_out` TIME NULL,
  `status` VARCHAR(50) NOT NULL,
  `work_mode` VARCHAR(50) NOT NULL,
  `created_at` DATE NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_attendance_employee_id` (`employee_id`),
  CONSTRAINT `fk_attendance_employee_id` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `employee_details` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `employee_id` INT NOT NULL,
  `pan_no` VARCHAR(64) NOT NULL,
  `aadhaar_last4` VARCHAR(16) NOT NULL,
  `marital_status` VARCHAR(50) NOT NULL,
  `blood_group` VARCHAR(50) NOT NULL,
  `emergency_contact` VARCHAR(20) NOT NULL,
  `created_at` DATE NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_employee_details_employee_id` (`employee_id`),
  CONSTRAINT `fk_employee_details_employee_id` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `employee_projects` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `employee_id` INT NOT NULL,
  `project_id` INT NOT NULL,
  `role` VARCHAR(50) NOT NULL,
  `hours_allocated` INT NOT NULL,
  `assigned_at` DATE NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_employee_projects_employee_id` (`employee_id`),
  KEY `idx_employee_projects_project_id` (`project_id`),
  CONSTRAINT `fk_employee_projects_employee_id` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_employee_projects_project_id` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `leaves` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `employee_id` INT NOT NULL,
  `leave_type` VARCHAR(50) NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `total_days` INT NOT NULL,
  `status` VARCHAR(50) NOT NULL,
  `applied_at` DATE NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_leaves_employee_id` (`employee_id`),
  CONSTRAINT `fk_leaves_employee_id` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `role_permissions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `role_id` INT NOT NULL,
  `permission_id` INT NOT NULL,
  `granted_at` DATE NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_role_permissions_role_id` (`role_id`),
  KEY `idx_role_permissions_permission_id` (`permission_id`),
  CONSTRAINT `fk_role_permissions_role_id` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_role_permissions_permission_id` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `suppliers` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `city` VARCHAR(50) NOT NULL,
  `contact_email` VARCHAR(120) NOT NULL,
  `joined_at` DATE NOT NULL,
  `rating` DECIMAL(3,1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `products` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `sku` VARCHAR(64) NOT NULL,
  `price` DECIMAL(12,2) NOT NULL,
  `cost_price` DECIMAL(12,2) NOT NULL,
  `stock` INT NOT NULL,
  `category_id` INT NOT NULL,
  `supplier_id` INT NOT NULL,
  `launch_date` DATE NOT NULL,
  `created_at` DATE NOT NULL,
  `status` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_products_category_id` (`category_id`),
  KEY `idx_products_supplier_id` (`supplier_id`),
  CONSTRAINT `fk_products_category_id` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_products_supplier_id` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `order_items` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `order_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `quantity` INT NOT NULL,
  `unit_price` DECIMAL(12,2) NOT NULL,
  `total_price` DECIMAL(12,2) NOT NULL,
  `created_at` DATE NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_order_items_order_id` (`order_id`),
  KEY `idx_order_items_product_id` (`product_id`),
  CONSTRAINT `fk_order_items_order_id` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_order_items_product_id` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `returns` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `order_item_id` INT NOT NULL,
  `reason` VARCHAR(50) NOT NULL,
  `return_date` DATE NOT NULL,
  `refund_amount` DECIMAL(12,2) NOT NULL,
  `status` VARCHAR(50) NOT NULL,
  `created_at` DATE NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_returns_order_item_id` (`order_item_id`),
  CONSTRAINT `fk_returns_order_item_id` FOREIGN KEY (`order_item_id`) REFERENCES `order_items` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `reviews` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `customer_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `rating` DECIMAL(3,1) NOT NULL,
  `comment` TEXT NOT NULL,
  `review_date` DATE NOT NULL,
  `created_at` DATE NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_reviews_customer_id` (`customer_id`),
  KEY `idx_reviews_product_id` (`product_id`),
  CONSTRAINT `fk_reviews_customer_id` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_reviews_product_id` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `warehouses` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `city` VARCHAR(50) NOT NULL,
  `capacity` INT NOT NULL,
  `created_at` DATE NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `inventory` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `product_id` INT NOT NULL,
  `warehouse_id` INT NOT NULL,
  `quantity` INT NOT NULL,
  `last_restocked_at` DATE NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_inventory_product_id` (`product_id`),
  KEY `idx_inventory_warehouse_id` (`warehouse_id`),
  CONSTRAINT `fk_inventory_product_id` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_inventory_warehouse_id` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `shipments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `order_id` INT NOT NULL,
  `warehouse_id` INT NOT NULL,
  `courier` VARCHAR(50) NOT NULL,
  `tracking_no` VARCHAR(64) NOT NULL,
  `shipped_date` DATE NOT NULL,
  `expected_delivery_date` DATE NOT NULL,
  `delivered_date` DATE NULL,
  `shipping_cost` DECIMAL(12,2) NOT NULL,
  `status` VARCHAR(50) NOT NULL,
  `created_at` DATE NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_shipments_order_id` (`order_id`),
  KEY `idx_shipments_warehouse_id` (`warehouse_id`),
  CONSTRAINT `fk_shipments_order_id` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_shipments_warehouse_id` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `categories` (`id`, `name`, `parent_category_id`, `created_at`) VALUES
  (1, 'Electronics', NULL, '2025-01-01'),
  (2, 'Furniture', NULL, '2025-01-02'),
  (3, 'Stationery', NULL, '2025-01-03'),
  (4, 'Kitchen', NULL, '2025-01-04'),
  (5, 'Accessories', NULL, '2025-01-05'),
  (6, 'Laptops', 1, '2025-01-06'),
  (7, 'Audio', 1, '2025-01-07');

INSERT INTO `coupons` (`id`, `code`, `discount_type`, `discount_value`, `min_order_amount`, `valid_from`, `valid_to`, `status`, `created_at`) VALUES
  (1, 'WELCOME10', 'Percentage', 10, 500, '2026-01-01', '2026-12-31', 'Active', '2025-12-20'),
  (2, 'FLAT200', 'Flat', 200, 2000, '2026-02-01', '2026-06-30', 'Active', '2026-01-25'),
  (3, 'SUMMER15', 'Percentage', 15, 3000, '2026-03-01', '2026-05-31', 'Expired', '2026-02-20');

INSERT INTO `customers` (`id`, `name`, `email`, `phone`, `city`, `gender`, `created_at`, `referred_by_customer_id`) VALUES
  (1, 'Riya Shah', 'riya@gmail.com', '987650001', 'Ahmedabad', 'Female', '2026-01-02', NULL),
  (2, 'Karan Mehta', 'karan@gmail.com', '987650002', 'Surat', 'Male', '2026-01-04', 1),
  (3, 'Neha Patel', 'neha@gmail.com', '987650003', 'Vadodara', 'Female', '2026-01-10', NULL),
  (4, 'Manav Joshi', 'manav@gmail.com', '987650004', 'Rajkot', 'Male', '2026-01-15', 2),
  (5, 'Asha Desai', 'asha@gmail.com', '987650005', 'Ahmedabad', 'Female', '2026-01-18', 1),
  (6, 'Dev Rana', 'dev@gmail.com', '987650006', 'Surat', 'Male', '2026-02-01', NULL),
  (7, 'Mitali Trivedi', 'mitali@gmail.com', '987650007', 'Vadodara', 'Female', '2026-02-08', 3),
  (8, 'Yash Soni', 'yash@gmail.com', '987650008', 'Rajkot', 'Male', '2026-02-10', 2);

INSERT INTO `customer_addresses` (`id`, `customer_id`, `type`, `line1`, `city`, `state`, `pincode`, `created_at`) VALUES
  (1, 1, 'Home', 'Satellite Road', 'Ahmedabad', 'Gujarat', '380015', '2026-01-02'),
  (2, 1, 'Office', 'Prahladnagar', 'Ahmedabad', 'Gujarat', '380051', '2026-01-03'),
  (3, 2, 'Home', 'Adajan', 'Surat', 'Gujarat', '395009', '2026-01-04'),
  (4, 3, 'Home', 'Alkapuri', 'Vadodara', 'Gujarat', '390007', '2026-01-10'),
  (5, 4, 'Home', 'Kalavad Road', 'Rajkot', 'Gujarat', '360005', '2026-01-15'),
  (6, 5, 'Home', 'Navrangpura', 'Ahmedabad', 'Gujarat', '380009', '2026-01-18'),
  (7, 6, 'Home', 'Vesu', 'Surat', 'Gujarat', '395007', '2026-02-01'),
  (8, 7, 'Home', 'Gotri', 'Vadodara', 'Gujarat', '390021', '2026-02-08'),
  (9, 8, 'Home', 'University Road', 'Rajkot', 'Gujarat', '360001', '2026-02-10');

INSERT INTO `departments` (`id`, `name`, `location`, `budget`, `created_at`) VALUES
  (1, 'IT', 'Ahmedabad', 500000, '2025-01-01'),
  (2, 'HR', 'Surat', 200000, '2025-01-03'),
  (3, 'Sales', 'Vadodara', 350000, '2025-01-05'),
  (4, 'Finance', 'Rajkot', 300000, '2025-01-07'),
  (5, 'Operations', 'Ahmedabad', 450000, '2025-01-10');

INSERT INTO `orders` (`id`, `customer_id`, `shipping_address_id`, `coupon_id`, `order_date`, `status`, `total_amount`, `discount_amount`, `final_amount`, `created_at`) VALUES
  (1, 1, 1, 1, '2026-03-01', 'Delivered', 144000, 14400, 129600, '2026-03-01'),
  (2, 2, 3, NULL, '2026-03-03', 'Packed', 12800, 0, 12800, '2026-03-03'),
  (3, 3, 4, 2, '2026-03-08', 'Shipped', 8500, 200, 8300, '2026-03-08'),
  (4, 4, 5, NULL, '2026-03-09', 'Delivered', 2700, 0, 2700, '2026-03-09'),
  (5, 5, 6, 1, '2026-03-12', 'Pending', 1200, 120, 1080, '2026-03-12'),
  (6, 1, 2, NULL, '2026-03-14', 'Delivered', 3300, 0, 3300, '2026-03-14'),
  (7, 6, 7, 2, '2026-03-15', 'Cancelled', 12000, 200, 11800, '2026-03-15'),
  (8, 7, 8, NULL, '2026-03-16', 'Pending', 2250, 0, 2250, '2026-03-16'),
  (9, 8, 9, 1, '2026-02-25', 'Delivered', 1800, 180, 1620, '2026-02-25'),
  (10, 3, 4, NULL, '2026-01-20', 'Delivered', 900, 0, 900, '2026-01-20');

INSERT INTO `invoices` (`id`, `order_id`, `invoice_no`, `issue_date`, `due_date`, `subtotal`, `tax_amount`, `total_amount`, `status`, `created_at`) VALUES
  (1, 1, 'INV-2026-001', '2026-03-01', '2026-03-01', 144000, 25920, 169920, 'Paid', '2026-03-01'),
  (2, 2, 'INV-2026-002', '2026-03-03', '2026-03-03', 12800, 2304, 15104, 'Paid', '2026-03-03'),
  (3, 3, 'INV-2026-003', '2026-03-08', '2026-03-08', 8500, 1530, 10030, 'Partially Paid', '2026-03-08'),
  (4, 4, 'INV-2026-004', '2026-03-09', '2026-03-09', 2700, 486, 3186, 'Paid', '2026-03-09'),
  (5, 6, 'INV-2026-005', '2026-03-14', '2026-03-14', 3300, 594, 3894, 'Paid', '2026-03-14');

INSERT INTO `payments` (`id`, `order_id`, `amount`, `method`, `status`, `payment_date`, `transaction_ref`, `created_at`) VALUES
  (1, 1, 100000, 'Card', 'Paid', '2026-03-01', 'TXN1001', '2026-03-01'),
  (2, 1, 29600, 'UPI', 'Paid', '2026-03-01', 'TXN1002', '2026-03-01'),
  (3, 2, 12800, 'UPI', 'Paid', '2026-03-03', 'TXN1003', '2026-03-03'),
  (4, 3, 8300, 'Card', 'Processing', '2026-03-08', 'TXN1004', '2026-03-08'),
  (5, 4, 2700, 'Cash', 'Paid', '2026-03-09', 'TXN1005', '2026-03-09'),
  (6, 6, 3300, 'Gift Card', 'Paid', '2026-03-14', 'TXN1006', '2026-03-14'),
  (7, 9, 1620, 'Card', 'Paid', '2026-02-25', 'TXN1007', '2026-02-25'),
  (8, 10, 900, 'UPI', 'Refunded', '2026-01-20', 'TXN1008', '2026-01-20');

INSERT INTO `permissions` (`id`, `name`, `module`, `created_at`) VALUES
  (1, 'VIEW_USERS', 'Users', '2025-01-01'),
  (2, 'CREATE_USERS', 'Users', '2025-01-01'),
  (3, 'EDIT_PRODUCTS', 'Products', '2025-01-01'),
  (4, 'VIEW_REPORTS', 'Reports', '2025-01-01'),
  (5, 'MANAGE_ORDERS', 'Orders', '2025-01-01');

INSERT INTO `projects` (`id`, `name`, `dept_id`, `start_date`, `end_date`, `budget`, `status`, `created_at`) VALUES
  (1, 'ERP Upgrade', 1, '2026-01-01', '2026-06-30', 150000, 'In Progress', '2025-12-15'),
  (2, 'Recruitment Drive', 2, '2026-02-01', '2026-04-15', 50000, 'In Progress', '2026-01-20'),
  (3, 'Market Expansion', 3, '2026-01-15', '2026-08-31', 100000, 'Planned', '2026-01-05'),
  (4, 'Audit Automation', 4, '2026-03-01', '2026-07-31', 80000, 'In Progress', '2026-02-15'),
  (5, 'Warehouse Optimization', 5, '2026-02-10', '2026-05-20', 90000, 'Completed', '2026-01-30');

INSERT INTO `roles` (`id`, `name`, `level`, `base_salary`, `created_at`) VALUES
  (1, 'Developer', 'L1', 30000, '2025-01-01'),
  (2, 'Senior Developer', 'L2', 50000, '2025-01-01'),
  (3, 'HR Executive', 'L1', 28000, '2025-01-01'),
  (4, 'Sales Executive', 'L1', 32000, '2025-01-01'),
  (5, 'Manager', 'L3', 65000, '2025-01-01'),
  (6, 'Accountant', 'L2', 45000, '2025-01-01'),
  (7, 'Operations Executive', 'L1', 35000, '2025-01-01');

INSERT INTO `employees` (`id`, `name`, `age`, `gender`, `city`, `salary`, `email`, `phone`, `dept_id`, `role_id`, `manager_id`, `hire_date`, `status`, `created_at`) VALUES
  (1, 'Amit', 20, 'Male', 'Ahmedabad', 25000, 'amit@company.com', '9000000001', 1, 1, 3, '2025-06-10', 'Active', '2025-06-10'),
  (2, 'Bhavya', 30, 'Female', 'Surat', 40000, 'bhavya@company.com', '9000000002', 2, 3, 12, '2024-11-15', 'Active', '2024-11-15'),
  (3, 'Chirag', 40, 'Male', 'Ahmedabad', 55000, 'chirag@company.com', '9000000003', 1, 5, NULL, '2023-04-01', 'Active', '2023-04-01'),
  (4, 'Dhruv', 22, 'Male', 'Vadodara', 28000, 'dhruv@company.com', '9000000004', 3, 4, 6, '2025-07-20', 'Active', '2025-07-20'),
  (5, 'Esha', 28, 'Female', 'Surat', 35000, 'esha@company.com', '9000000005', 2, 3, 12, '2025-01-10', 'Active', '2025-01-10'),
  (6, 'Farhan', 35, 'Male', 'Ahmedabad', 60000, 'farhan@company.com', '9000000006', 3, 5, NULL, '2023-08-08', 'Active', '2023-08-08'),
  (7, 'Gauri', 26, 'Female', 'Rajkot', 32000, 'gauri@company.com', '9000000007', 1, 1, 3, '2025-02-14', 'Active', '2025-02-14'),
  (8, 'Harsh', 31, 'Male', 'Surat', 45000, 'harsh@company.com', '9000000008', 3, 4, 6, '2024-09-12', 'Active', '2024-09-12'),
  (9, 'Isha', 29, 'Female', 'Rajkot', 38000, 'isha@company.com', '9000000009', 2, 3, 12, '2024-12-01', 'Active', '2024-12-01'),
  (10, 'Jatin', 33, 'Male', 'Vadodara', 42000, 'jatin@company.com', '9000000010', 1, 2, 3, '2024-03-14', 'Active', '2024-03-14'),
  (11, 'Kavya', 24, 'Female', 'Surat', 30000, 'kavya@company.com', '9000000011', 3, 4, 6, '2025-09-01', 'Active', '2025-09-01'),
  (12, 'Lalit', 37, 'Male', 'Rajkot', 65000, 'lalit@company.com', '9000000012', 2, 5, NULL, '2023-01-18', 'Active', '2023-01-18'),
  (13, 'Meera', 27, 'Female', 'Vadodara', 34000, 'meera@company.com', '9000000013', 1, 1, 3, '2025-04-05', 'Active', '2025-04-05'),
  (14, 'Nikhil', 32, 'Male', 'Surat', 47000, 'nikhil@company.com', '9000000014', 3, 4, 6, '2024-06-23', 'Resigned', '2024-06-23'),
  (15, 'Ojas', 23, 'Male', 'Ahmedabad', 29000, 'ojas@company.com', '9000000015', 1, 1, 3, '2025-10-10', 'Active', '2025-10-10'),
  (16, 'Priya', 36, 'Female', 'Vadodara', 58000, 'priya@company.com', '9000000016', 4, 6, NULL, '2023-02-11', 'Active', '2023-02-11'),
  (17, 'Rohan', 25, 'Male', 'Rajkot', 31000, 'rohan@company.com', '9000000017', 5, 7, 18, '2025-03-17', 'Active', '2025-03-17'),
  (18, 'Sana', 34, 'Female', 'Ahmedabad', 54000, 'sana@company.com', '9000000018', 5, 5, NULL, '2023-05-09', 'Active', '2023-05-09'),
  (19, 'Tanish', 30, 'Male', 'Vadodara', 40000, 'tanish@company.com', '9000000019', 3, 4, 6, '2024-08-20', 'On Leave', '2024-08-20'),
  (20, 'Usha', 28, 'Female', 'Rajkot', 36000, 'usha@company.com', '9000000020', 2, 3, 12, '2025-01-28', 'Active', '2025-01-28');

INSERT INTO `attendance` (`id`, `employee_id`, `attendance_date`, `check_in`, `check_out`, `status`, `work_mode`, `created_at`) VALUES
  (1, 1, '2026-03-01', '09:11', '18:02', 'Present', 'Office', '2026-03-01'),
  (2, 2, '2026-03-01', '09:02', '18:15', 'Present', 'Office', '2026-03-01'),
  (3, 3, '2026-03-01', '08:55', '18:40', 'Present', 'Office', '2026-03-01'),
  (4, 1, '2026-03-02', '09:25', '18:03', 'Late', 'Office', '2026-03-02'),
  (5, 4, '2026-03-02', NULL, NULL, 'Absent', 'N/A', '2026-03-02'),
  (6, 5, '2026-03-02', '09:05', '17:58', 'Present', 'WFH', '2026-03-02'),
  (7, 6, '2026-03-03', '09:15', '18:10', 'Present', 'Office', '2026-03-03'),
  (8, 7, '2026-03-03', '09:32', '18:00', 'Late', 'Office', '2026-03-03'),
  (9, 8, '2026-03-04', '09:08', '18:01', 'Present', 'Office', '2026-03-04'),
  (10, 9, '2026-03-04', NULL, NULL, 'Leave', 'N/A', '2026-03-04'),
  (11, 10, '2026-03-05', '09:00', '18:05', 'Present', 'WFH', '2026-03-05'),
  (12, 11, '2026-03-05', '09:18', '18:08', 'Present', 'Office', '2026-03-05');

INSERT INTO `employee_details` (`id`, `employee_id`, `pan_no`, `aadhaar_last4`, `marital_status`, `blood_group`, `emergency_contact`, `created_at`) VALUES
  (1, 1, 'PAN1001', '1111', 'Single', 'B+', '9898000001', '2025-06-10'),
  (2, 2, 'PAN1002', '2222', 'Married', 'O+', '9898000002', '2024-11-15'),
  (3, 3, 'PAN1003', '3333', 'Married', 'A+', '9898000003', '2023-04-01'),
  (4, 4, 'PAN1004', '4444', 'Single', 'AB+', '9898000004', '2025-07-20'),
  (5, 5, 'PAN1005', '5555', 'Single', 'O-', '9898000005', '2025-01-10');

INSERT INTO `employee_projects` (`id`, `employee_id`, `project_id`, `role`, `hours_allocated`, `assigned_at`) VALUES
  (1, 1, 1, 'Developer', 120, '2026-01-05'),
  (2, 3, 1, 'Team Lead', 80, '2026-01-03'),
  (3, 7, 1, 'QA Engineer', 60, '2026-01-10'),
  (4, 2, 2, 'Coordinator', 40, '2026-02-01'),
  (5, 12, 2, 'Manager', 30, '2026-01-28'),
  (6, 6, 3, 'Sales Lead', 90, '2026-01-18'),
  (7, 8, 3, 'Executive', 50, '2026-01-20'),
  (8, 16, 4, 'Finance Head', 70, '2026-03-01'),
  (9, 17, 5, 'Coordinator', 55, '2026-02-12'),
  (10, 18, 5, 'Manager', 65, '2026-02-10');

INSERT INTO `leaves` (`id`, `employee_id`, `leave_type`, `start_date`, `end_date`, `total_days`, `status`, `applied_at`) VALUES
  (1, 9, 'Sick', '2026-03-04', '2026-03-05', 2, 'Approved', '2026-03-03'),
  (2, 19, 'Casual', '2026-03-10', '2026-03-12', 3, 'Pending', '2026-03-08'),
  (3, 5, 'Vacation', '2026-02-20', '2026-02-25', 6, 'Approved', '2026-02-01'),
  (4, 1, 'Sick', '2026-01-10', '2026-01-11', 2, 'Rejected', '2026-01-09');

INSERT INTO `role_permissions` (`id`, `role_id`, `permission_id`, `granted_at`) VALUES
  (1, 1, 1, '2025-01-10'),
  (2, 2, 1, '2025-01-10'),
  (3, 2, 3, '2025-01-10'),
  (4, 5, 1, '2025-01-10'),
  (5, 5, 2, '2025-01-10'),
  (6, 5, 4, '2025-01-10'),
  (7, 5, 5, '2025-01-10'),
  (8, 4, 5, '2025-01-10');

INSERT INTO `suppliers` (`id`, `name`, `city`, `contact_email`, `joined_at`, `rating`) VALUES
  (1, 'TechSource Pvt Ltd', 'Ahmedabad', 'sales@techsource.com', '2025-03-01', 4.7),
  (2, 'OfficeMart', 'Surat', 'contact@officemart.com', '2025-03-05', 4.3),
  (3, 'KitchenKing', 'Rajkot', 'hello@kitchenking.com', '2025-03-12', 4.5),
  (4, 'FurniWorld', 'Vadodara', 'support@furniworld.com', '2025-03-18', 4.1);

INSERT INTO `products` (`id`, `name`, `sku`, `price`, `cost_price`, `stock`, `category_id`, `supplier_id`, `launch_date`, `created_at`, `status`) VALUES
  (1, 'Laptop', 'ELE-LAP-001', 72000, 60000, 15, 6, 1, '2025-08-01', '2025-08-01', 'Active'),
  (2, 'Desk Chair', 'FUR-CHA-001', 8500, 6200, 40, 2, 4, '2025-07-15', '2025-07-15', 'Active'),
  (3, 'Headphones', 'ELE-AUD-001', 3200, 2200, 60, 7, 1, '2025-09-10', '2025-09-10', 'Active'),
  (4, 'Notebook', 'STA-NBK-001', 120, 70, 500, 3, 2, '2025-06-01', '2025-06-01', 'Active'),
  (5, 'Coffee Mug', 'KIT-MUG-001', 450, 250, 120, 4, 3, '2025-05-11', '2025-05-11', 'Active'),
  (6, 'Mouse', 'ACC-MOU-001', 900, 500, 100, 5, 1, '2025-10-01', '2025-10-01', 'Active'),
  (7, 'Keyboard', 'ACC-KEY-001', 1500, 950, 80, 5, 1, '2025-10-05', '2025-10-05', 'Active'),
  (8, 'Study Table', 'FUR-TBL-001', 12000, 9000, 20, 2, 4, '2025-07-25', '2025-07-25', 'Active'),
  (9, 'Bottle', 'KIT-BOT-001', 600, 320, 150, 4, 3, '2025-05-20', '2025-05-20', 'Active'),
  (10, 'Pen Pack', 'STA-PEN-001', 90, 45, 400, 3, 2, '2025-06-08', '2025-06-08', 'Discontinued');

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `quantity`, `unit_price`, `total_price`, `created_at`) VALUES
  (1, 1, 1, 2, 72000, 144000, '2026-03-01'),
  (2, 2, 3, 4, 3200, 12800, '2026-03-03'),
  (3, 3, 2, 1, 8500, 8500, '2026-03-08'),
  (4, 4, 5, 6, 450, 2700, '2026-03-09'),
  (5, 5, 4, 10, 120, 1200, '2026-03-12'),
  (6, 6, 6, 2, 900, 1800, '2026-03-14'),
  (7, 6, 7, 1, 1500, 1500, '2026-03-14'),
  (8, 7, 8, 1, 12000, 12000, '2026-03-15'),
  (9, 8, 9, 3, 600, 1800, '2026-03-16'),
  (10, 8, 10, 5, 90, 450, '2026-03-16'),
  (11, 9, 6, 2, 900, 1800, '2026-02-25'),
  (12, 10, 6, 1, 900, 900, '2026-01-20');

INSERT INTO `returns` (`id`, `order_item_id`, `reason`, `return_date`, `refund_amount`, `status`, `created_at`) VALUES
  (1, 12, 'Defective item', '2026-01-25', 900, 'Approved', '2026-01-25'),
  (2, 4, 'Wrong size', '2026-03-15', 450, 'Requested', '2026-03-15');

INSERT INTO `reviews` (`id`, `customer_id`, `product_id`, `rating`, `comment`, `review_date`, `created_at`) VALUES
  (1, 1, 1, 5, 'Excellent laptop', '2026-03-06', '2026-03-06'),
  (2, 2, 3, 4, 'Sound quality is good', '2026-03-07', '2026-03-07'),
  (3, 4, 5, 5, 'Nice mug', '2026-03-12', '2026-03-12'),
  (4, 1, 6, 4, 'Useful mouse', '2026-03-18', '2026-03-18'),
  (5, 8, 6, 3, 'Average', '2026-03-03', '2026-03-03');

INSERT INTO `warehouses` (`id`, `name`, `city`, `capacity`, `created_at`) VALUES
  (1, 'Ahmedabad Central', 'Ahmedabad', 1000, '2025-04-01'),
  (2, 'Surat Hub', 'Surat', 800, '2025-04-10'),
  (3, 'Rajkot Storage', 'Rajkot', 600, '2025-04-20');

INSERT INTO `inventory` (`id`, `product_id`, `warehouse_id`, `quantity`, `last_restocked_at`) VALUES
  (1, 1, 1, 8, '2026-03-01'),
  (2, 1, 2, 7, '2026-03-04'),
  (3, 2, 2, 18, '2026-03-03'),
  (4, 2, 3, 22, '2026-03-05'),
  (5, 3, 1, 30, '2026-03-02'),
  (6, 4, 1, 200, '2026-03-01'),
  (7, 5, 3, 80, '2026-03-07'),
  (8, 6, 1, 60, '2026-03-06'),
  (9, 7, 2, 50, '2026-03-06'),
  (10, 8, 3, 20, '2026-03-05'),
  (11, 9, 2, 100, '2026-03-08'),
  (12, 10, 1, 250, '2026-03-01');

INSERT INTO `shipments` (`id`, `order_id`, `warehouse_id`, `courier`, `tracking_no`, `shipped_date`, `expected_delivery_date`, `delivered_date`, `shipping_cost`, `status`, `created_at`) VALUES
  (1, 1, 1, 'BlueDart', 'BD123', '2026-03-02', '2026-03-04', '2026-03-04', 250, 'Delivered', '2026-03-02'),
  (2, 3, 2, 'Delhivery', 'DL456', '2026-03-09', '2026-03-12', NULL, 180, 'In Transit', '2026-03-09'),
  (3, 4, 3, 'XpressBees', 'XB789', '2026-03-10', '2026-03-11', '2026-03-11', 120, 'Delivered', '2026-03-10'),
  (4, 6, 1, 'EcomExpress', 'EE111', '2026-03-15', '2026-03-17', '2026-03-17', 90, 'Delivered', '2026-03-15'),
  (5, 9, 2, 'DTDC', 'DT900', '2026-02-26', '2026-02-28', '2026-03-01', 95, 'Delivered', '2026-02-26');

SET FOREIGN_KEY_CHECKS = 1;

