import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Spotify Emulation',
  description: 'A simple Spotify web UI emulation',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-spotify-black text-white">{children}</body>
    </html>
  )
}
