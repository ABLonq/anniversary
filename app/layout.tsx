import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '💕 Anılarımız',
  description: 'Seninle geçirdiğimiz her an...',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  )
}
