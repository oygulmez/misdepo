# 🧽 Temizlik & Ambalaj E-Ticaret Sitesi

Modern, responsive ve kullanıcı dostu bir e-ticaret platformu. NextJS 14, Supabase, TypeScript ve Tailwind CSS ile geliştirilmiştir.

## 🚀 Özellikler

### 🛒 E-Ticaret Özellikleri
- **Modern Ana Sayfa**: Hero section, kategori kartları, öne çıkan ürünler
- **Ürün Detay Sayfaları**: Büyük görseller, kampanya rozetleri, adet seçici
- **Sepet Sistemi**: LocalStorage ile kalıcı sepet, miktar güncelleme
- **Misafir Checkout**: Kayıt olmadan sipariş verme
- **Sipariş Takibi**: Sipariş onay sayfası ve detayları

### 🎨 UI/UX Özellikleri
- **Toast Bildirimleri**: Başarı, hata, uyarı mesajları
- **Loading Animasyonları**: Skeleton loading, spinners
- **Responsive Tasarım**: Mobile-first yaklaşım
- **Modern Animasyonlar**: Hover efektleri, transitions

### 🔧 Admin Panel
- **Dashboard**: İstatistikler, son siparişler
- **Sipariş Yönetimi**: Durum güncelleme, detay görüntüleme
- **Ürün Yönetimi**: CRUD işlemleri, kampanya yönetimi
- **Kategori Yönetimi**: Hiyerarşik kategori yapısı
- **Müşteri Yönetimi**: Müşteri listesi, sipariş geçmişi

## 🛠️ Teknolojiler

- **Frontend**: NextJS 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Custom animations
- **Database**: Supabase (PostgreSQL)
- **State Management**: React Context API
- **Form Handling**: React hooks
- **Icons**: Emoji icons

## 📦 Kurulum

1. **Projeyi klonlayın**
```bash
git clone https://github.com/oygulmez/Misdepo.git
cd Misdepo
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
```

3. **Environment variables ayarlayın**
```bash
# .env.local dosyası oluşturun
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Geliştirme sunucusunu başlatın**
```bash
npm run dev
```

## 🗄️ Database Yapısı

### Tablolar
- **categories**: Ürün kategorileri (hiyerarşik)
- **products**: Ürün bilgileri, kampanya desteği
- **customers**: Müşteri bilgileri
- **orders**: Sipariş başlıkları
- **order_items**: Sipariş detayları
- **settings**: Sistem ayarları

### Örnek Veri
Proje örnek kategoriler ve ürünlerle birlikte gelir:
- Temizlik Ürünleri
- Ambalaj Malzemeleri  
- Ev İhtiyaçları

## 🎯 Kullanım

### Müşteri Tarafı
1. **Ana Sayfa**: `http://localhost:3000`
2. **Ürün Detay**: `http://localhost:3000/product/[id]`
3. **Sepet**: `http://localhost:3000/cart`
4. **Checkout**: `http://localhost:3000/checkout`

### Admin Panel
1. **Dashboard**: `http://localhost:3000/admin`
2. **Siparişler**: `http://localhost:3000/admin/orders`
3. **Ürünler**: `http://localhost:3000/admin/products`
4. **Kategoriler**: `http://localhost:3000/admin/categories`
5. **Müşteriler**: `http://localhost:3000/admin/customers`

## 🔧 Geliştirme

### Proje Yapısı
```
src/
├── app/                 # NextJS App Router
│   ├── admin/          # Admin panel sayfaları
│   ├── cart/           # Sepet sayfası
│   ├── checkout/       # Checkout sayfası
│   └── product/        # Ürün detay sayfaları
├── components/         # Yeniden kullanılabilir bileşenler
├── context/           # React Context providers
├── lib/               # Utility fonksiyonlar, database API
└── supabase/          # Database migrations
```

### Önemli Dosyalar
- `src/lib/database.ts`: Database API fonksiyonları
- `src/lib/database.types.ts`: TypeScript type definitions
- `src/context/CartContext.tsx`: Sepet state yönetimi
- `src/context/ToastContext.tsx`: Bildirim sistemi

## 🚀 Deployment

### Vercel (Önerilen)
1. GitHub'a push edin
2. Vercel'e import edin
3. Environment variables ekleyin
4. Deploy edin

### Diğer Platformlar
- Netlify
- Railway
- DigitalOcean App Platform

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

- **Email**: oygulmez97@gmail.com
- **GitHub**: [@oygulmez](https://github.com/oygulmez)

## 🙏 Teşekkürler

- NextJS ekibine
- Supabase ekibine
- Tailwind CSS ekibine
- Tüm açık kaynak katkıda bulunanlara

---

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın! 