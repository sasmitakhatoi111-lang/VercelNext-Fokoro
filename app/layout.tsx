import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import { Header } from '@/components/header'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: {
    default: 'Fokoro - Get Answers to Your Questions',
    template: '%s | Fokoro',
  },
  description:
    'Fokoro is a Q&A platform where you can ask questions, share knowledge, and get expert answers from a community of engaged users.',
  keywords: [
    'Q&A',
    'questions',
    'answers',
    'knowledge sharing',
    'community',
    'help',
    'discussion',
  ],
  authors: [{ name: 'Fokoro' }],
  creator: 'Fokoro',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || 'https://fokoro.com'
  ),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Fokoro',
    title: 'Fokoro - Get Answers to Your Questions',
    description:
      'Ask questions, share knowledge, and get expert answers from a community of engaged users.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fokoro - Get Answers to Your Questions',
    description:
      'Ask questions, share knowledge, and get expert answers from a community of engaged users.',
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

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a1a' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased min-h-screen bg-background">
        <Header />
        <main>{children}</main>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
