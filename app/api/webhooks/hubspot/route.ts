/**
 * API route that handles incoming webhooks from HubSpot.
 * Processes various event types like deal property changes and contact creation.
 */
import { NextResponse } from "next/server"
import { createHubSpotClient } from "@/lib/hubspot"
import { getValidAccessToken } from "@/lib/db"

// In Next.js App Router, this file creates the /api/webhooks/hubspot endpoint
// This handles POST requests for HubSpot webhooks
export async function POST(request: Request) {
  try {
    // Parse the JSON body from the incoming webhook request
    const payload = await request.json()

    // Verify the webhook (in a real app, you would verify the signature)
    // HubSpot doesn't provide a built-in verification method in their client
    // so you would need to implement this yourself

    // Process the event based on its type
    const eventType = payload.eventType
    const portalId = payload.portalId.toString()
    const objectId = payload.objectId

    console.log(`Received webhook: ${eventType} for portal ${portalId}`)

    // Get a valid access token for this portal from the database
    const tokenResult = await getValidAccessToken(portalId)

    if (!tokenResult.success) {
      console.error(`No valid token found for portal ${portalId}`)
      return NextResponse.json({ error: "No valid token found for this portal" }, { status: 401 })
    }

    // Create a HubSpot client with the token
    const hubspotClient = createHubSpotClient(tokenResult.accessToken)

    // Process different event types
    switch (eventType) {
      case "deal.propertyChange":
        // Handle deal property change
        // Example: if a deal stage changed to "closed won", award points
        break
      case "contact.creation":
        // Handle contact creation
        break
      // Add more event types as needed
    }

    // Return a successful response to acknowledge receipt of the webhook
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 })
  }
}

