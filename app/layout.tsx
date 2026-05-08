import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Weicken & Schmidt',
    template: '%s | Weicken & Schmidt',
  },
  description: 'Ihr Fachgeschäft für Farben & Malerbedarf in Witten. Vorbestellungen, Farbmischservice und aktuelle Angebote.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'W&S',
    startupImage: [],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    title: 'Weicken & Schmidt – Farben & Malerbedarf',
    description: 'Ihr Fachgeschäft in Witten. Online vorbestellen, Farbton konfigurieren, Angebote entdecken.',
    siteName: 'Weicken & Schmidt',
  },
}

export const viewport: Viewport = {
  themeColor: '#f97316',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de" className={inter.variable}>
      <head>
        {/* iOS PWA icons */}
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-192" />
        <link rel="apple-touch-icon" sizes="120x120" href="/icons/icon-192" />
        {/* iOS Safari splash screens */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="W&S" />
        {/* Prevent iOS phone number detection */}
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="min-h-screen">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#262626',
              color: '#fafafa',
              borderRadius: '12px',
              fontSize: '14px',
              padding: '12px 16px',
            },
            success: {
              iconTheme: {
                primary: '#f97316',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  )
}
