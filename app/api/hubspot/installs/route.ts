/**
 * API route that lists all HubSpot installations.
 * Used for administrative purposes to manage connected HubSpot accounts.
 */
import { NextResponse } from "next/server"
import { getAllHubSpotInstalls } from "@/lib/db"

export async function GET() {
  try {
    const result = await getAllHubSpotInstalls()

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }

    // Don't expose sensitive tokens in the response
    const safeInstalls = result.installs.map((install) => {
      const { accessToken, refreshToken, ...safeInstall } = install
      return safeInstall
    })

    return NextResponse.json({ success: true, installs: safeInstalls })
  } catch (error) {
    console.error("Error fetching installations:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch installations" }, { status: 500 })
  }
}

