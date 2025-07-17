import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Did I Dodge a Bullet? | Interview Red Flag Bingo',
  description: 'Post-interview red flag bingo for the quietly suspicious. Process your interview experience and trust your gut instincts.',
  keywords: 'interview, red flags, job search, workplace, bingo, career advice',
  authors: [{ name: 'Did I Dodge a Bullet?' }],
  openGraph: {
    title: 'Did I Dodge a Bullet? | Interview Red Flag Bingo',
    description: 'Post-interview red flag bingo for the quietly suspicious.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {children}
      </body>
    </html>
  )
} 