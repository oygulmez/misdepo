import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/context/CartContext'
import { ToastProvider } from '@/context/ToastContext'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as SonnerToaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Temizlik & Ambalaj - Kaliteli Ürünler, Uygun Fiyatlar',
  description: 'Temizlik ürünleri ve ambalaj malzemeleri için en uygun fiyatlarla kaliteli ürünler. Hızlı teslimat, güvenli ödeme.',
  keywords: 'temizlik ürünleri, ambalaj malzemeleri, deterjan, plastik torba, temizlik malzemeleri, online alışveriş',
  authors: [{ name: 'Temizlik & Ambalaj' }],
  creator: 'Temizlik & Ambalaj',
  publisher: 'Temizlik & Ambalaj',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://yourdomain.com'), // Replace with your actual domain
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://yourdomain.com',
    title: 'Temizlik & Ambalaj - Kaliteli Ürünler',
    description: 'Temizlik ürünleri ve ambalaj malzemeleri için en uygun fiyatlarla kaliteli ürünler.',
    siteName: 'Temizlik & Ambalaj',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Temizlik & Ambalaj - Kaliteli Ürünler',
    description: 'Temizlik ürünleri ve ambalaj malzemeleri için en uygun fiyatlarla kaliteli ürünler.',
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
    <html lang="tr">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#1d4ed8" />
        <link rel="canonical" href="https://yourdomain.com" />
      </head>
      <body className={inter.className}>
        <CartProvider>
          <ToastProvider>
            {children}
            <Toaster />
            <SonnerToaster position="top-right" richColors />
          </ToastProvider>
        </CartProvider>
      </body>
    </html>
  )
} 