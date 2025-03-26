/**
 * API route that handles the OAuth callback from HubSpot.
 * Exchanges the authorization code for access and refresh tokens, then stores them in the database.
 */
import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { exchangeForTokens, getAccountInfo } from "@/lib/hubspot"
import { initDatabase, storeHubSpotInstall } from "@/lib/db"

// In Next.js App Router, API routes are defined by creating a route.ts file
// This file handles GET requests to /api/auth/hubspot/callback
// The file path directly maps to the URL path
export async function GET(request: Request) {
  // Extract query parameters from the request URL
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")

  if (!code) {
    // NextResponse is a Next.js utility for API responses
    return NextResponse.json({ error: "No code provided" }, { status: 400 })
  }

  try {
    // Initialize the database to ensure tables exist
    await initDatabase()

    // Get the host from headers for constructing the redirect URI
    // This is a server-side function in Next.js
    const headersList = headers()
    const host = headersList.get("host") || ""
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https"
    const baseUrl = `${protocol}://${host}`
    const redirectUri = `${baseUrl}/api/auth/hubspot/callback`

    // Exchange the code for tokens using the official client
    console.log("Exchanging auth code for tokens ...")
    const tokenData = await exchangeForTokens(code, redirectUri)
    console.log("Token data: " + JSON.stringify(tokenData))

    // Get the HubSpot account info using the official client
    console.log("Getting installed account info with " + tokenData.accessToken + " ...")
    const accountData = await getAccountInfo(tokenData.accessToken)
    console.log("Account data: " + JSON.stringify(accountData))

    // Store the installation in the database
    console.log("Adding install info to database ...")
    const storeResult = await storeHubSpotInstall(
      accountData.hubId,
      tokenData.accessToken,
      tokenData.refreshToken,
      tokenData.expiresIn,
    )

    if (!storeResult.success) {
      console.error("Failed to store HubSpot installation:", storeResult.error)
    }

    // Redirect to a success page with the portal ID
    // We no longer need to expose tokens in the URL since they're stored in the database
    return NextResponse.redirect(new URL(`/auth/success?portalId=${accountData.hubId}`, request.url))
  } catch (error) {
    console.error("OAuth error:", error)
    return NextResponse.json({ error: "Authentication failed", details: error }, { status: 500 })
  }
}

