import type React from "react"
/**
 * Root layout component that wraps all pages in the application.
 * Provides global styles and metadata for the entire app.
 */
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"

// Next.js has built-in font optimization
// This loads the Inter font and applies it to the body
const inter = Inter({ subsets: ["latin"] })

// The metadata export sets the page title and description for SEO
// Next.js automatically generates appropriate <head> tags
export const metadata: Metadata = {
  title: "HubSpot Sales Gamifier",
  description: "A gamification app for HubSpot Sales users",
    generator: 'v0.dev'
}

// In Next.js App Router, the layout.tsx file defines the shared UI for multiple pages
// This RootLayout wraps ALL pages in the application
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      {/* The inter.className applies the loaded font to the body */}
      <body className={inter.className}>{children}</body>
    </html>
  )
}



import './globals.css'