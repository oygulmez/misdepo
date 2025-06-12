-- 🚀 Hızlı Kurulum SQL - Supabase Dashboard > SQL Editor'da çalıştırın

-- 1. Extensions ve Types
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE payment_method AS ENUM ('cash_on_delivery', 'bank_transfer', 'credit_card');

-- 2. Categories Table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Products Table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(500) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    campaign_price DECIMAL(10,2) CHECK (campaign_price >= 0),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    image_urls TEXT[] DEFAULT '{}',
    stock_quantity INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    is_campaign BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Customers Table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    address TEXT NOT NULL,
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Orders Table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL DEFAULT ('ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || EXTRACT(EPOCH FROM NOW())::INTEGER),
    customer_id UUID REFERENCES customers(id),
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_address TEXT NOT NULL,
    payment_method payment_method NOT NULL,
    status order_status DEFAULT 'pending',
    total_amount DECIMAL(12,2) NOT NULL CHECK (total_amount >= 0),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Order Items Table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    product_name VARCHAR(500) NOT NULL,
    product_price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    total_price DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Settings Table
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. RLS Policies (Geçici olarak herkese izin ver)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all" ON categories FOR ALL TO anon, authenticated USING (true);
CREATE POLICY "Allow all" ON products FOR ALL TO anon, authenticated USING (true);
CREATE POLICY "Allow all" ON customers FOR ALL TO anon, authenticated USING (true);
CREATE POLICY "Allow all" ON orders FOR ALL TO anon, authenticated USING (true);
CREATE POLICY "Allow all" ON order_items FOR ALL TO anon, authenticated USING (true);
CREATE POLICY "Allow all" ON settings FOR ALL TO anon, authenticated USING (true);

-- 9. Sample Data
INSERT INTO categories (name, description, sort_order) VALUES
('Temizlik Ürünleri', 'Deterjan, sabun ve temizlik malzemeleri', 1),
('Ambalaj Malzemeleri', 'Plastik torbalar, karton kutular', 2),
('Ev İhtiyaçları', 'Günlük kullanım malzemeleri', 3);

INSERT INTO settings (key, value, description) VALUES
('site_title', '"Temizlik & Ambalaj E-Ticaret"', 'Site başlığı'),
('contact_phone', '"0555 123 45 67"', 'İletişim telefonu'),
('contact_email', '"info@temizlikambalaj.com"', 'İletişim e-postası');

-- 10. Sample Products
INSERT INTO products (name, description, price, category_id, stock_quantity) VALUES
('Premium Deterjan', 'Yüksek kaliteli çamaşır deterjanı 5L', 45.00, 
 (SELECT id FROM categories WHERE name = 'Temizlik Ürünleri'), 100),
('Plastik Torba Set', 'Çeşitli boyutlarda 100 adet', 25.00, 
 (SELECT id FROM categories WHERE name = 'Ambalaj Malzemeleri'), 50);

-- ✅ Kurulum Tamamlandı! 