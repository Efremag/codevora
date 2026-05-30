-- ============================================================
-- Codevora Link - Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS codevora_link CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE codevora_link;

-- Plans table
CREATE TABLE IF NOT EXISTS plans (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  slug VARCHAR(50) NOT NULL UNIQUE,
  max_links INT NOT NULL DEFAULT 5,
  has_analytics BOOLEAN NOT NULL DEFAULT FALSE,
  has_custom_themes BOOLEAN NOT NULL DEFAULT FALSE,
  has_custom_domain BOOLEAN NOT NULL DEFAULT FALSE,
  price_birr DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  price_usd DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  plan_id INT NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (plan_id) REFERENCES plans(id)
);

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  username VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(100),
  bio TEXT,
  profile_image VARCHAR(500),
  theme_color VARCHAR(7) NOT NULL DEFAULT '#F97316',
  background_style ENUM('solid','gradient','image') NOT NULL DEFAULT 'solid',
  background_value VARCHAR(500) DEFAULT '#FFFFFF',
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  total_views INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Links table
CREATE TABLE IF NOT EXISTS links (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(100) NOT NULL,
  url VARCHAR(2048) NOT NULL,
  icon_type VARCHAR(50) NOT NULL DEFAULT 'link',
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  click_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Link clicks analytics table
CREATE TABLE IF NOT EXISTS link_clicks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  link_id INT NOT NULL,
  user_id INT NOT NULL,
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  referrer VARCHAR(500),
  clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (link_id) REFERENCES links(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Profile views analytics table
CREATE TABLE IF NOT EXISTS profile_views (
  id INT PRIMARY KEY AUTO_INCREMENT,
  profile_id INT NOT NULL,
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  referrer VARCHAR(500),
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- ============================================================
-- Seed Data
-- ============================================================

INSERT INTO plans (name, slug, max_links, has_analytics, has_custom_themes, has_custom_domain, price_birr, price_usd) VALUES
('Free', 'free', 3, FALSE, FALSE, FALSE, 0.00, 0.00),
('Pro', 'pro', 999, TRUE, TRUE, FALSE, 199.00, 4.99),
('Business', 'business', 999, TRUE, TRUE, TRUE, 499.00, 9.99);

-- Default admin user (password: Admin@123456)
INSERT INTO users (email, password_hash, plan_id, is_active, is_admin, email_verified) VALUES
('admin@codevora.com', '$2a$12$u8cfR5yG2n/zXO9pvqNW4u4RuKfufM1n.GLiSRV4XO1CV9tUAm2uK', 3, TRUE, TRUE, TRUE);

INSERT INTO profiles (user_id, username, display_name, bio, theme_color) VALUES
(1, 'admin', 'Codevora Admin', 'Official Codevora Link admin account.', '#F97316');

-- Transactions table (Telebirr payments)
CREATE TABLE IF NOT EXISTS transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  out_trade_no VARCHAR(100) NOT NULL UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  plan_id INT NOT NULL,
  status ENUM('pending','completed','failed') NOT NULL DEFAULT 'pending',
  telebirr_trade_no VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES plans(id)
);

-- ============================================================
-- Useful indexes
-- ============================================================
CREATE INDEX idx_links_user_id ON links(user_id);
CREATE INDEX idx_link_clicks_link_id ON link_clicks(link_id);
CREATE INDEX idx_link_clicks_clicked_at ON link_clicks(clicked_at);
CREATE INDEX idx_profile_views_profile_id ON profile_views(profile_id);
CREATE INDEX idx_profile_views_viewed_at ON profile_views(viewed_at);
