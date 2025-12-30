import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pastebin - Share Your Code & Text Instantly',
  description: 'A modern, fast, and secure pastebin application. Share your text snippets with optional expiry and view limits.',
  keywords: 'pastebin, code sharing, text sharing, code snippet, paste',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  )
}

