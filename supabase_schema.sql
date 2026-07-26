-- ====================================================================
-- TOPUPSON SUPABASE DATABASE SCHEMA & RLS POLICIES
-- Jalankan skrip ini di Supabase SQL Editor jika tidak menggunakan Drizzle Kit
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabel Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password TEXT,
  role VARCHAR(50) DEFAULT 'member' NOT NULL,
  balance NUMERIC(15, 2) DEFAULT 0 NOT NULL,
  whatsapp VARCHAR(50),
  avatar_url TEXT,
  api_key VARCHAR(255),
  secret_key VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Tabel Categories
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  logo TEXT,
  game_slug VARCHAR(255) NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Tabel Games
CREATE TABLE IF NOT EXISTS games (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  image TEXT NOT NULL,
  banner TEXT,
  logo TEXT,
  developers VARCHAR(255),
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  description TEXT,
  instructions JSONB,
  is_popular BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Tabel Products
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(100) PRIMARY KEY,
  game_slug VARCHAR(255) NOT NULL REFERENCES games(slug) ON DELETE CASCADE,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  selling_price NUMERIC(15, 2) NOT NULL,
  selling_price_gold NUMERIC(15, 2) NOT NULL,
  selling_price_platinum NUMERIC(15, 2) NOT NULL,
  promo_price NUMERIC(15, 2),
  cost_price NUMERIC(15, 2) DEFAULT 0,
  sku VARCHAR(100),
  images TEXT,
  logo TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_gangguan BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Tabel Payment Methods
CREATE TABLE IF NOT EXISTS payment_methods (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  images TEXT NOT NULL,
  payment_id VARCHAR(100) NOT NULL,
  minimum_amount NUMERIC(15, 2) DEFAULT 1000 NOT NULL,
  maximum_amount NUMERIC(15, 2) DEFAULT 10000000 NOT NULL,
  fee NUMERIC(15, 2) DEFAULT 0 NOT NULL,
  fee_percent NUMERIC(5, 2) DEFAULT 0 NOT NULL,
  type VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'active' NOT NULL,
  "group" VARCHAR(100) DEFAULT 'E-Wallet' NOT NULL,
  is_outside_group BOOLEAN DEFAULT FALSE,
  badge_text VARCHAR(100),
  outside_sort INTEGER DEFAULT 0,
  instructions JSONB,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. Tabel Orders / Transactions
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id VARCHAR(100) NOT NULL UNIQUE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  game_slug VARCHAR(255) NOT NULL,
  product_id VARCHAR(100) NOT NULL,
  product_title VARCHAR(255) NOT NULL,
  id_games VARCHAR(255) NOT NULL,
  server_games VARCHAR(100),
  nickname VARCHAR(255),
  quantity INTEGER DEFAULT 1 NOT NULL,
  price NUMERIC(15, 2) NOT NULL,
  fee NUMERIC(15, 2) DEFAULT 0 NOT NULL,
  discount_price NUMERIC(15, 2) DEFAULT 0,
  promo_price NUMERIC(15, 2) DEFAULT 0,
  promo_code VARCHAR(100),
  promo_discount NUMERIC(15, 2) DEFAULT 0,
  total_price NUMERIC(15, 2) NOT NULL,
  payment_method_id VARCHAR(100),
  payment_name VARCHAR(255) NOT NULL,
  payment_code VARCHAR(100) NOT NULL,
  payment_code_display VARCHAR(255),
  qr_string TEXT,
  qr_image_url TEXT,
  payment_status VARCHAR(50) DEFAULT 'pending' NOT NULL,
  buy_status VARCHAR(50) DEFAULT 'pending' NOT NULL,
  serial_number TEXT DEFAULT '',
  whatsapp VARCHAR(50),
  email VARCHAR(255),
  expired_time INTEGER,
  pricing_json JSONB,
  gateway_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. Tabel Promo Codes
CREATE TABLE IF NOT EXISTS promo_codes (
  id SERIAL PRIMARY KEY,
  code VARCHAR(100) NOT NULL UNIQUE,
  discount_type VARCHAR(50) DEFAULT 'percent' NOT NULL,
  discount_value NUMERIC(15, 2) NOT NULL,
  min_order NUMERIC(15, 2) DEFAULT 0,
  max_discount NUMERIC(15, 2) DEFAULT 0,
  quota INTEGER DEFAULT 100,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 8. Tabel Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(100) REFERENCES orders(order_id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  game_slug VARCHAR(255),
  product_title VARCHAR(255),
  rating INTEGER DEFAULT 5 NOT NULL,
  comment TEXT,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 9. Tabel Articles / Blog
CREATE TABLE IF NOT EXISTS articles (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(255) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  thumbnail TEXT,
  content TEXT NOT NULL,
  excerpt TEXT,
  author VARCHAR(100) DEFAULT 'Admin',
  views INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 10. Tabel Settings
CREATE TABLE IF NOT EXISTS settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Public Read Policies (Katalog, Produk, Harga, Artikel, Review, Settings bisa dibaca publik)
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public read games" ON games FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public read products" ON products FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public read payment_methods" ON payment_methods FOR SELECT USING (status = 'active');
CREATE POLICY "Public read reviews" ON reviews FOR SELECT USING (is_published = TRUE);
CREATE POLICY "Public read articles" ON articles FOR SELECT USING (is_published = TRUE);
CREATE POLICY "Public read settings" ON settings FOR SELECT USING (TRUE);
CREATE POLICY "Public read active promo_codes" ON promo_codes FOR SELECT USING (is_active = TRUE);

-- Orders Policies (User dapat melihat pesanannya sendiri, publik dapat mengecek via invoice/order_id)
CREATE POLICY "Users can read own orders" ON orders FOR SELECT USING (
  auth.uid() = user_id OR user_id IS NULL
);

CREATE POLICY "Users can read own profile" ON users FOR SELECT USING (
  auth.uid() = id
);
