/**
 * API route that retrieves installation information for a specific HubSpot portal.
 * Used by the success page to display installation details.
 */
import { NextResponse } from "next/server"
import { getHubSpotInstall } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { portalId: string } }) {
  const portalId = params.portalId

  if (!portalId) {
    return NextResponse.json({ success: false, error: "No portal ID provided" }, { status: 400 })
  }

  try {
    const result = await getHubSpotInstall(portalId)

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 404 })
    }

    // Don't expose sensitive tokens in the response
    console.log("Got install data from DB: ", JSON.stringify(result.install));
    const { accessToken, refreshToken, ...safeInstall } = result.install

    return NextResponse.json({ success: true, install: safeInstall })
  } catch (error) {
    console.error("Error fetching installation:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch installation" }, { status: 500 })
  }
}

