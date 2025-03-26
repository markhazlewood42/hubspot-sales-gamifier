/**
 * API route that generates a sales leaderboard based on HubSpot deal data.
 * Calculates points for each sales rep based on their closed deals within a specified timeframe.
 */
import { NextResponse } from "next/server"
import { getDeals, getOwners } from "@/lib/hubspot"

// In Next.js App Router, this file creates the /api/gamification/leaderboard endpoint
// This is a server-side API route that generates leaderboard data
export async function GET(request: Request) {
  // Extract query parameters from the request URL
  const { searchParams } = new URL(request.url)
  const accessToken = searchParams.get("accessToken")
  const timeframe = searchParams.get("timeframe") || "week" // day, week, month, quarter, year

  if (!accessToken) {
    return NextResponse.json({ error: "No access token provided" }, { status: 400 })
  }

  try {
    // Get all owners (sales reps)
    const ownersResponse = await getOwners(accessToken)

    // Get all deals
    const dealsResponse = await getDeals(accessToken, 100)

    // Calculate start date based on timeframe
    const now = new Date()
    const startDate = new Date()

    switch (timeframe) {
      case "day":
        startDate.setHours(0, 0, 0, 0)
        break
      case "week":
        startDate.setDate(now.getDate() - now.getDay())
        startDate.setHours(0, 0, 0, 0)
        break
      case "month":
        startDate.setDate(1)
        startDate.setHours(0, 0, 0, 0)
        break
      case "quarter":
        const quarter = Math.floor(now.getMonth() / 3)
        startDate.setMonth(quarter * 3, 1)
        startDate.setHours(0, 0, 0, 0)
        break
      case "year":
        startDate.setMonth(0, 1)
        startDate.setHours(0, 0, 0, 0)
        break
    }

    // Filter deals by timeframe and closed status
    const recentClosedDeals = dealsResponse.results.filter((deal) => {
      const closeDate = new Date(deal.properties.closedate)
      return closeDate >= startDate && deal.properties.dealstage === "closedwon"
    })

    // Group deals by owner
    const dealsByOwner: Record<string, any[]> = {}

    recentClosedDeals.forEach((deal) => {
      const ownerId = deal.properties.hubspot_owner_id
      if (!dealsByOwner[ownerId]) {
        dealsByOwner[ownerId] = []
      }
      dealsByOwner[ownerId].push(deal)
    })

    // Create leaderboard
    const leaderboard = ownersResponse.results.map((owner) => {
      const ownerDeals = dealsByOwner[owner.id] || []
      const totalAmount = ownerDeals.reduce((sum, deal) => {
        return sum + (Number.parseFloat(deal.properties.amount) || 0)
      }, 0)

      return {
        id: owner.id,
        name: `${owner.firstName} ${owner.lastName}`,
        email: owner.email,
        deals: ownerDeals.length,
        amount: totalAmount,
        points: ownerDeals.length * 100 + totalAmount * 0.01, // Example points calculation
      }
    })

    // Sort by points in descending order
    leaderboard.sort((a, b) => b.points - a.points)

    return NextResponse.json({ leaderboard })
  } catch (error) {
    console.error("Error generating leaderboard:", error)
    return NextResponse.json({ error: "Failed to generate leaderboard", details: error }, { status: 500 })
  }
}

