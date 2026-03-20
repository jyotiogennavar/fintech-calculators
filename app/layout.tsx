import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'FinCalc — Free Financial Calculators for India',
    template: '%s | FinCalc',
  },
  description:
    'Free, open-source financial calculators for India. Tax regime comparison, EMI, SIP, FIRE, capital gains, and more.',
  keywords: ['tax calculator', 'EMI calculator', 'SIP calculator', 'FIRE calculator', 'India'],
  openGraph: {
    title: 'FinCalc — Free Financial Calculators for India',
    description: 'Tax, loans, investments, retirement — all in one place.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  )
}