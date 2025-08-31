/**
 * Root Layout Component
 * 
 * This is the root layout that wraps all pages with necessary providers
 * including React Query for data fetching and global styles.
 */

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SDR Grok - AI-Powered Sales Development',
  description: 'AI-powered SDR automation using Grok for lead qualification and outreach',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
