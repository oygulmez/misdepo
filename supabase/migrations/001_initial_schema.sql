-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable RLS (Row Level Security)
ALTER DATABASE postgres SET "app.settings.jwt_secret" TO '';

-- Create custom types/enums
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE payment_method AS ENUM ('cash_on_delivery', 'bank_transfer', 'credit_card');

-- Create categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(500) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    campaign_price DECIMAL(10,2) CHECK (campaign_price >= 0),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    image_urls TEXT[] DEFAULT '{}',
    stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
    min_stock_level INTEGER DEFAULT 5 CHECK (min_stock_level >= 0),
    sku VARCHAR(100) UNIQUE,
    variants JSONB,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    is_campaign BOOLEAN DEFAULT false,
    campaign_start_date TIMESTAMP WITH TIME ZONE,
    campaign_end_date TIMESTAMP WITH TIME ZONE,
    weight DECIMAL(10,3),
    dimensions JSONB,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Campaign constraints
    CONSTRAINT valid_campaign_dates CHECK (
        (is_campaign = false) OR 
        (is_campaign = true AND campaign_start_date IS NOT NULL AND campaign_end_date IS NOT NULL AND campaign_start_date < campaign_end_date)
    ),
    CONSTRAINT valid_campaign_price CHECK (
        (is_campaign = false) OR 
        (is_campaign = true AND campaign_price IS NOT NULL AND campaign_price < price)
    )
);

-- Create customers table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    address TEXT NOT NULL,
    notes TEXT,
    total_orders INTEGER DEFAULT 0 CHECK (total_orders >= 0),
    total_spent DECIMAL(12,2) DEFAULT 0 CHECK (total_spent >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_address TEXT NOT NULL,
    payment_method payment_method NOT NULL,
    status order_status DEFAULT 'pending',
    subtotal DECIMAL(12,2) NOT NULL CHECK (subtotal >= 0),
    shipping_cost DECIMAL(10,2) DEFAULT 0 CHECK (shipping_cost >= 0),
    tax_amount DECIMAL(10,2) DEFAULT 0 CHECK (tax_amount >= 0),
    total_amount DECIMAL(12,2) NOT NULL CHECK (total_amount >= 0),
    notes TEXT,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    product_name VARCHAR(500) NOT NULL,
    product_price DECIMAL(10,2) NOT NULL CHECK (product_price >= 0),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    total_price DECIMAL(12,2) NOT NULL CHECK (total_price >= 0),
    product_variant JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create settings table
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_active ON categories(is_active);
CREATE INDEX idx_categories_sort_order ON categories(sort_order);

CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_featured ON products(is_featured);
CREATE INDEX idx_products_campaign ON products(is_campaign);
CREATE INDEX idx_products_stock ON products(stock_quantity);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_price ON products(price);

CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_email ON customers(email);

CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_order_number ON orders(order_number);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

CREATE INDEX idx_settings_key ON settings(key);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('order_number_seq')::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create sequence for order numbers
CREATE SEQUENCE order_number_seq START 1;

-- Create trigger for automatic order number generation
CREATE TRIGGER generate_order_number_trigger 
    BEFORE INSERT ON orders 
    FOR EACH ROW 
    EXECUTE FUNCTION generate_order_number();

-- Function to update customer stats
CREATE OR REPLACE FUNCTION update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Update customer stats when new order is created
        UPDATE customers 
        SET 
            total_orders = total_orders + 1,
            total_spent = total_spent + NEW.total_amount,
            updated_at = NOW()
        WHERE id = NEW.customer_id;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Update customer stats when order amount changes
        IF OLD.customer_id = NEW.customer_id THEN
            UPDATE customers 
            SET 
                total_spent = total_spent - OLD.total_amount + NEW.total_amount,
                updated_at = NOW()
            WHERE id = NEW.customer_id;
        ELSE
            -- Customer changed
            UPDATE customers 
            SET 
                total_orders = total_orders - 1,
                total_spent = total_spent - OLD.total_amount,
                updated_at = NOW()
            WHERE id = OLD.customer_id;
            
            UPDATE customers 
            SET 
                total_orders = total_orders + 1,
                total_spent = total_spent + NEW.total_amount,
                updated_at = NOW()
            WHERE id = NEW.customer_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Update customer stats when order is deleted
        UPDATE customers 
        SET 
            total_orders = total_orders - 1,
            total_spent = total_spent - OLD.total_amount,
            updated_at = NOW()
        WHERE id = OLD.customer_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Create trigger for customer stats updates
CREATE TRIGGER update_customer_stats_trigger
    AFTER INSERT OR UPDATE OR DELETE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_stats();

-- Insert default settings
INSERT INTO settings (key, value, description) VALUES
('site_title', '"Temizlik & Ambalaj E-Ticaret"', 'Site başlığı'),
('site_description', '"Kaliteli temizlik ve ambalaj ürünleri uygun fiyatlarla"', 'Site açıklaması'),
('contact_phone', '"0555 123 45 67"', 'İletişim telefonu'),
('contact_email', '"info@temizlikambalaj.com"', 'İletişim e-postası'),
('contact_address', '"İstanbul, Türkiye"', 'Adres bilgisi'),
('shipping_cost', '0', 'Kargo ücreti'),
('min_order_amount', '0', 'Minimum sipariş tutarı'),
('tax_rate', '0.18', 'KDV oranı'),
('bank_account_info', '{"bank_name": "Örnek Banka", "account_number": "1234567890", "iban": "TR12 3456 7890 1234 5678 90"}', 'Banka hesap bilgileri');

-- Insert sample categories
INSERT INTO categories (name, description, sort_order) VALUES
('Temizlik Ürünleri', 'Deterjan, sabun ve temizlik malzemeleri', 1),
('Ambalaj Malzemeleri', 'Plastik torbalar, karton kutular ve ambalaj ürünleri', 2),
('Ev İhtiyaçları', 'Günlük kullanım malzemeleri ve ev gerekleri', 3);

-- Insert sub-categories
INSERT INTO categories (name, description, parent_id, sort_order) VALUES
('Deterjanlar', 'Çamaşır ve bulaşık deterjanları', (SELECT id FROM categories WHERE name = 'Temizlik Ürünleri'), 1),
('Sabunlar', 'El ve vücut sabunları', (SELECT id FROM categories WHERE name = 'Temizlik Ürünleri'), 2),
('Plastik Torbalar', 'Çeşitli boyutlarda plastik torbalar', (SELECT id FROM categories WHERE name = 'Ambalaj Malzemeleri'), 1),
('Karton Kutular', 'Farklı boyutlarda karton ambalajlar', (SELECT id FROM categories WHERE name = 'Ambalaj Malzemeleri'), 2);

-- Enable Row Level Security (optional, for future use)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (temporarily allow all operations)
CREATE POLICY "Allow all operations on categories" ON categories FOR ALL TO anon, authenticated USING (true);
CREATE POLICY "Allow all operations on products" ON products FOR ALL TO anon, authenticated USING (true);
CREATE POLICY "Allow all operations on customers" ON customers FOR ALL TO anon, authenticated USING (true);
CREATE POLICY "Allow all operations on orders" ON orders FOR ALL TO anon, authenticated USING (true);
CREATE POLICY "Allow all operations on order_items" ON order_items FOR ALL TO anon, authenticated USING (true);
CREATE POLICY "Allow all operations on settings" ON settings FOR ALL TO anon, authenticated USING (true); 