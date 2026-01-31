import type { Metadata } from 'next'
import { Inter, Poppins, Playfair_Display } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import ParticleBackground from '@/components/ParticleBackground'

const inter = Inter({ subsets: ['latin'], variable: '--font-body' })
const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-heading'
})
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-accent'
})

export const metadata: Metadata = {
  title: 'Photo Editor - Passport/ID Photo Processing',
  description: 'Professional passport and ID photo editing with automatic enhancements',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} ${playfair.variable} font-body antialiased`}>
        <ThemeProvider>
          <ParticleBackground />
          <div className="relative z-10">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
