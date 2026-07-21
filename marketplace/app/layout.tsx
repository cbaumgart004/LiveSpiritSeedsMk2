import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'
import { themeClass } from '@/lib/brand'

export const metadata: Metadata = {
  title: 'Spirit Seeds Shop',
  description: 'Wellness goods from Spirit Seeds Wellness.',
}

const FONTS =
  'https://fonts.googleapis.com/css2?family=Euphoria+Script&family=Farsan&family=Merriweather+Sans:wght@300;400;700&family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Marcellus&display=swap'

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={FONTS} rel="stylesheet" />
      </head>
      {/* Inherit the brochure's current season + UX style. */}
      <body className={`min-h-full flex flex-col ${themeClass()}`}>
        <header className="brand-surface border-b">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <Link href="/" className="brand-heading text-3xl">
              Spirit Seeds Shop
            </Link>
            <nav className="text-sm opacity-80">
              <Link href="/" className="hover:opacity-100">
                All products
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
        <footer className="brand-subheading border-t py-6 text-center text-xs opacity-70">
          Spirit Seeds Wellness · Lafayette, Colorado
        </footer>
      </body>
    </html>
  )
}
