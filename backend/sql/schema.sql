CREATE DATABASE IF NOT EXISTS login_module;

USE login_module;

CREATE TABLE IF NOT EXISTS users (
  id INT NOT NULL AUTO_INCREMENT,
  unique_user_id VARCHAR(20) NOT NULL,
  name VARCHAR(120) NOT NULL,
  mobile_number VARCHAR(20) NOT NULL,
  email VARCHAR(150) NULL,
  role ENUM('Admin', 'Supplier', 'Vendor') NOT NULL,
  location VARCHAR(150) NULL,
  business_name VARCHAR(150) NULL,
  business_type VARCHAR(100) NULL,
  specialty VARCHAR(150) NULL,
  availability VARCHAR(30) NOT NULL DEFAULT 'Available',
  about VARCHAR(700) NULL,
  profile_image LONGTEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_unique_user_id (unique_user_id),
  UNIQUE KEY uq_users_mobile_number (mobile_number),
  KEY ix_users_role (role)
);

CREATE TABLE IF NOT EXISTS products (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  sku VARCHAR(80) NOT NULL,
  category VARCHAR(120) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  price DOUBLE NOT NULL DEFAULT 0.0,
  status VARCHAR(60) NOT NULL DEFAULT 'In Stock',
  image_url LONGTEXT NULL,
  supplier_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_products_sku (sku),
  KEY ix_products_supplier_id (supplier_id),
  CONSTRAINT fk_products_supplier FOREIGN KEY (supplier_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS vendor_requests (
  id INT NOT NULL AUTO_INCREMENT,
  vendor_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  message LONGTEXT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'Pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL,
  PRIMARY KEY (id),
  KEY ix_vendor_requests_vendor_id (vendor_id),
  KEY ix_vendor_requests_product_id (product_id),
  CONSTRAINT fk_vendor_requests_vendor FOREIGN KEY (vendor_id) REFERENCES users (id),
  CONSTRAINT fk_vendor_requests_product FOREIGN KEY (product_id) REFERENCES products (id)
);

CREATE TABLE IF NOT EXISTS orders (
  id INT NOT NULL AUTO_INCREMENT,
  request_id INT NOT NULL,
  order_number VARCHAR(50) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'Pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_orders_order_number (order_number),
  KEY ix_orders_request_id (request_id),
  CONSTRAINT fk_orders_request FOREIGN KEY (request_id) REFERENCES vendor_requests (id)
);

CREATE TABLE IF NOT EXISTS vendor_requests (
  id INT NOT NULL AUTO_INCREMENT,
  vendor_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  message LONGTEXT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'Pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL,
  PRIMARY KEY (id),
  KEY ix_vendor_requests_vendor_id (vendor_id),
  KEY ix_vendor_requests_product_id (product_id),
  CONSTRAINT fk_vendor_requests_vendor FOREIGN KEY (vendor_id) REFERENCES users (id),
  CONSTRAINT fk_vendor_requests_product FOREIGN KEY (product_id) REFERENCES products (id)
);

CREATE TABLE IF NOT EXISTS orders (
  id INT NOT NULL AUTO_INCREMENT,
  request_id INT NOT NULL,
  order_number VARCHAR(50) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'Pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_orders_order_number (order_number),
  KEY ix_orders_request_id (request_id),
  CONSTRAINT fk_orders_request FOREIGN KEY (request_id) REFERENCES vendor_requests (id)
);
