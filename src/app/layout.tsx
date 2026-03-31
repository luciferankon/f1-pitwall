import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'PitWall — F1 2024 Season Analytics',
  description: '24 races. 20 drivers. 10 teams. The complete data story of the 2024 Formula 1 season with AI race analysis.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased bg-[#050508] text-[#f0f0f8]">{children}</body>
    </html>
  )
}
