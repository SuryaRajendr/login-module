CREATE DATABASE IF NOT EXISTS login_module;

USE login_module;

CREATE TABLE IF NOT EXISTS users (
  id INT NOT NULL AUTO_INCREMENT,
  unique_user_id VARCHAR(20) NOT NULL,
  name VARCHAR(120) NOT NULL,
  mobile_number VARCHAR(20) NOT NULL,
  role ENUM('Admin', 'Supplier', 'Vendor') NOT NULL,
  location VARCHAR(150) NULL,
  business_name VARCHAR(150) NULL,
  business_type VARCHAR(100) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_unique_user_id (unique_user_id),
  UNIQUE KEY uq_users_mobile_number (mobile_number),
  KEY ix_users_role (role)
);
