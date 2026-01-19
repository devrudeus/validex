import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SolanaGuard - Solana Smart Contract Auditor',
  description: 'Don\'t Get Rugged. Audit Any Solana Token in Seconds. Free, Fast, and Comprehensive Security Analysis.',
  keywords: ['Solana', 'Token Audit', 'Smart Contract', 'Security', 'Crypto', 'Blockchain'],
  openGraph: {
    title: 'SolanaGuard - Solana Smart Contract Auditor',
    description: 'Audit Any Solana Token in Seconds',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
