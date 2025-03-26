/**
 * Home page component that displays the main landing page with a HubSpot OAuth connection button.
 * Serves as the entry point for users to initiate the OAuth flow with HubSpot.
 */
import { headers } from "next/headers"
import { getOAuthUrl } from "@/lib/hubspot"

// In Next.js App Router, each page.tsx file automatically becomes a route
// This file creates the root route (/) of your application
export default function Home() {
  // Next.js provides a headers() function to access HTTP headers on the server
  // This is a server-side function and only works in Server Components
  const headersList = headers()
  const host = headersList.get("host") || ""
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https"
  const baseUrl = `${protocol}://${host}`

  // Construct the OAuth URL using the official client
  const redirectUri = `${baseUrl}/api/auth/hubspot/callback`
  const oauthUrl = getOAuthUrl(redirectUri)

  return (
    // In Next.js, you can use regular HTML elements and CSS classes
    // The className attribute is used instead of class (React standard)
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">HubSpot Sales Gamifier</h1>
      <p className="text-xl mb-8">Backend API for HubSpot Sales Gamification</p>

      <div className="flex flex-col items-center justify-center p-6 border rounded-lg bg-gray-50 w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4">Test OAuth Connection</h2>
        <a
          href={oauthUrl}
          className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
        >
          Connect to HubSpot
        </a>
      </div>
    </main>
  )
}

