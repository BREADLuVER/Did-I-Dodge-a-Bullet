import type { Metadata } from 'next'
import './globals.css'
import { PerformanceMonitor } from '@/components/PerformanceMonitor'

export const metadata: Metadata = {
  title: 'Did I Dodge a Bullet? | Interview Red Flag Bingo',
  description: 'Post-interview red flag bingo for the quietly suspicious. Process your interview experience and trust your gut instincts.',
  keywords: 'interview, red flags, job search, workplace, bingo, career advice',
  authors: [{ name: 'Did I Dodge a Bullet?' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Did I Dodge a Bullet? | Interview Red Flag Bingo',
    description: 'Post-interview red flag bingo for the quietly suspicious.',
    type: 'website',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Did I Dodge a Bullet? | Interview Red Flag Bingo',
    description: 'Post-interview red flag bingo for the quietly suspicious.',
  },
  // Performance optimizations
  other: {
    'theme-color': '#f97316',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Preload critical resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://firestore.googleapis.com" />
        <link rel="dns-prefetch" href="https://identitytoolkit.googleapis.com" />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <PerformanceMonitor />
        {children}
      </body>
    </html>
  )
} 