# 🗄️ Supabase Kurulum Rehberi

Bu döküman, **Temizlik & Ambalaj E-Ticaret** projesi için Supabase veritabanı kurulum adımlarını açıklar.

## 📋 Ön Gereksinimler

- [Supabase](https://supabase.com) hesabı
- Proje dosyaları (NextJS kurulu)

## 🚀 Adım 1: Supabase Projesi Oluşturma

1. [Supabase Dashboard](https://app.supabase.com) adresine gidin
2. "New Project" butonuna tıklayın
3. Proje bilgilerini doldurun:
   - **Name**: `temizlik-ambalaj-eticaret`
   - **Database Password**: Güçlü bir şifre belirleyin
   - **Region**: `Central EU (Frankfurt)` (Türkiye'ye en yakın)
4. "Create new project" butonuna tıklayın
5. Proje hazırlanırken bekleyin (2-3 dakika)

## 🔑 Adım 2: API Keys ve URL'leri Alma

1. Supabase dashboard'ta sol menüden **Settings** > **API** sekmesine gidin
2. Aşağıdaki bilgileri kopyalayın:
   - **Project URL**
   - **Project API Keys** > **anon public**
   - **Project API Keys** > **service_role** (güvenli saklayın)

## 💾 Adım 3: Environment Variables Ayarlama

Projenizin ana dizininde `.env.local` dosyası oluşturun:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Database Configuration
DATABASE_URL=your-database-url-here

# Admin Configuration  
ADMIN_EMAIL=admin@temizlikambalaj.com
ADMIN_PASSWORD=your-secure-admin-password
```

**⚠️ Önemli**: Gerçek değerlerle değiştirin ve bu dosyayı Git'e push etmeyin!

## 🗃️ Adım 4: Database Schema Kurulumu

1. Supabase dashboard'ta **SQL Editor** sekmesine gidin
2. "New query" butonuna tıklayın
3. `supabase/migrations/001_initial_schema.sql` dosyasının içeriğini kopyalayın
4. SQL editöre yapıştırın
5. **RUN** butonuna tıklayarak çalıştırın

### Oluşturulan Tablolar:

- ✅ `categories` - Ürün kategorileri (hiyerarşik)
- ✅ `products` - Ürünler (kampanya desteği ile)
- ✅ `customers` - Müşteriler  
- ✅ `orders` - Siparişler
- ✅ `order_items` - Sipariş kalemleri
- ✅ `settings` - Site ayarları

### Otomatik Özellikler:

- 🔢 Otomatik sipariş numarası üretimi (`ORD-20241201-0001`)
- 📊 Müşteri istatistikleri otomatik güncelleme
- 🕐 Otomatik timestamp güncelleme
- 🔒 Row Level Security (RLS) yapılandırması

## 🔍 Adım 5: Veritabanı Test Etme

### SQL Editor'de test sorguları çalıştırın:

```sql
-- Kategorileri kontrol edin
SELECT * FROM categories ORDER BY sort_order;

-- Ayarları kontrol edin  
SELECT * FROM settings;

-- Fonksiyonların çalışıp çalışmadığını test edin
SELECT generate_order_number();
```

## 🌐 Adım 6: NextJS Entegrasyonu

1. Proje dizininde terminal açın
2. Paketlerin yüklü olduğunu kontrol edin:

```bash
npm install @supabase/supabase-js
```

3. Supabase client konfigürasyonunu güncelleyin:

`src/lib/supabase.ts` dosyasında environment variables'ları güncelleyin.

## 🧪 Adım 7: Bağlantı Testi

NextJS projesini çalıştırın ve test edin:

```bash
npm run dev
```

Browser'da `http://localhost:3000` adresine gidin ve:

- Kategoriler yüklenebiliyor mu?
- Console'da hata var mı?
- Network tabında Supabase istekleri görünüyor mu?

## 📊 Adım 8: İlk Verileri Eklemek (Opsiyonel)

### Örnek Ürün Ekleme:

```sql
INSERT INTO products (
    name, 
    description, 
    price, 
    category_id, 
    stock_quantity,
    is_active
) VALUES (
    'Premium Deterjan 5L',
    'Yüksek kaliteli çamaşır deterjanı',
    45.00,
    (SELECT id FROM categories WHERE name = 'Deterjanlar'),
    100,
    true
);
```

### Kampanyalı Ürün Ekleme:

```sql
INSERT INTO products (
    name, 
    description, 
    price,
    campaign_price,
    category_id, 
    stock_quantity,
    is_active,
    is_campaign,
    campaign_start_date,
    campaign_end_date
) VALUES (
    'Çok Amaçlı Temizleyici',
    'Her yüzeyde kullanılabilir',
    25.00,
    18.75,
    (SELECT id FROM categories WHERE name = 'Temizlik Ürünleri'),
    50,
    true,
    true,
    NOW(),
    NOW() + INTERVAL '30 days'
);
```

## 🔧 Troubleshooting

### Yaygın Problemler:

1. **"Invalid API key" hatası**:
   - `.env.local` dosyasındaki API keys'leri kontrol edin
   - Dosya adının doğru olduğundan emin olun

2. **Database bağlantı hatası**:
   - Supabase proje URL'sini kontrol edin
   - RLS policies'lerinin doğru yapılandırıldığından emin olun

3. **SQL çalışmıyor**:
   - Migration dosyasının tamamen kopyalandığından emin olun
   - Her komutu ayrı ayrı çalıştırmayı deneyin

## 🔒 Güvenlik Notları

- ⚠️ Service role key'ini asla client-side kodda kullanmayın
- 🔐 Production'da güçlü RLS policies tanımlayın
- 🚫 `.env.local` dosyasını Git'e eklemeyin
- 🔄 Düzenli olarak API keys'leri rotate edin

## 📞 Destek

Sorun yaşıyorsanız:

1. [Supabase Docs](https://supabase.com/docs) dokümantasyonunu kontrol edin
2. Proje structure'ını gözden geçirin
3. Console/Network tab'ında hata mesajlarını kontrol edin

---

**✅ Kurulum tamamlandığında, veritabanı tamamen hazır ve kullanıma hazır olacak!** 