import type { Metadata } from 'next'
import './globals.css'
import { CartProvider } from '@/context/CartContext'
import { ToastProvider } from '@/context/ToastContext'

export const metadata: Metadata = {
  title: 'Temizlik & Ambalaj Ürünleri - Kaliteli Ürünler Uygun Fiyatlarla',
  description: 'Temizlik malzemeleri, ambalaj ürünleri ve ev ihtiyaçlarınız için kaliteli ürünler. Hızlı teslimat, uygun fiyatlar. Şimdi sipariş verin!',
  keywords: 'temizlik ürünleri, ambalaj malzemeleri, deterjan, sabun, plastik torbalar, temizlik malzemeleri',
  authors: [{ name: 'Temizlik & Ambalaj E-Ticaret' }],
  creator: 'Temizlik & Ambalaj E-Ticaret',
  publisher: 'Temizlik & Ambalaj E-Ticaret',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://localhost:3000'), // Production'da değiştirilecek
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Temizlik & Ambalaj Ürünleri - Kaliteli Ürünler Uygun Fiyatlarla',
    description: 'Temizlik malzemeleri, ambalaj ürünleri ve ev ihtiyaçlarınız için kaliteli ürünler. Hızlı teslimat, uygun fiyatlar.',
    url: 'https://localhost:3000',
    siteName: 'Temizlik & Ambalaj E-Ticaret',
    locale: 'tr_TR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Temizlik & Ambalaj Ürünleri',
    description: 'Kaliteli temizlik ve ambalaj ürünleri uygun fiyatlarla.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr" className="scroll-smooth">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <ToastProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  )
} 