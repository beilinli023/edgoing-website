import './globals.css'
import type { Metadata } from 'next'
import ClientLayout from './ClientLayout'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export const metadata: Metadata = {
  title: 'EdGoing - Explore. Learn. Grow.',
  description: 'Professional international education platform - Explore the world, expand your horizons',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body
        className="font-sans"
        suppressHydrationWarning
      >
        <ErrorBoundary>
          <ClientLayout>
            {children}
          </ClientLayout>
        </ErrorBoundary>
      </body>
    </html>
  )
}
