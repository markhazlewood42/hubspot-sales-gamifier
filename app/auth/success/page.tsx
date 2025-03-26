/**
 * Success page displayed after successful OAuth authentication with HubSpot.
 * Shows the authentication details and confirms the app was installed.
 */
"use client" // This directive marks this as a Client Component, enabling use of hooks and browser APIs

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"

// In Next.js App Router, this file creates the /auth/success route
export default function AuthSuccess() {
  // useSearchParams is a Next.js hook to access URL query parameters on the client side
  const searchParams = useSearchParams()
  const [installInfo, setInstallInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Extract query parameters from the URL
  const portalId = searchParams.get("portalId")

  // Fetch installation info from the API
  useEffect(() => {
    if (portalId) {
      fetch(`/api/hubspot/installs/${portalId}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            setInstallInfo(data.install)
          } else {
            setError(data.error || "Failed to fetch installation info")
          }
        })
        .catch((err) => {
          console.error("Error fetching installation info:", err)
          setError("An error occurred while fetching installation info")
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [portalId])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-2xl w-full bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center">Authentication Successful!</h1>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-lg mb-4">Loading installation information...</p>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : portalId ? (
          <>
            <div className="mb-6">
              <p className="text-lg mb-2">
                You have successfully connected to HubSpot Portal ID: <strong>{portalId}</strong>
              </p>
              <p className="text-sm text-gray-600">
                Your HubSpot account has been successfully connected to the Sales Gamifier app. The authentication
                tokens have been securely stored in our database.
              </p>
            </div>

            {installInfo && (
              <div className="bg-green-50 border border-green-200 p-4 rounded-md mb-6">
                <p className="text-green-800 font-medium">✅ Installation successful</p>
                <p className="text-sm text-green-700 mt-1">
                  Connected on: {new Date(installInfo.createdAt).toLocaleString()}
                </p>
                <p className="text-sm text-green-700">
                  Token expires: {new Date(installInfo.expiresAt).toLocaleString()}
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-md mb-6">
                <p className="text-red-800 font-medium">⚠️ Error retrieving installation details</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <p className="text-sm text-red-700 mt-1">
                  Your app is still installed, but we couldn't fetch the details.
                </p>
              </div>
            )}
          </>
        ) : (
          <p className="text-lg text-center text-red-600">No portal ID found. Authentication may have failed.</p>
        )}

        <div className="mt-8 text-center">
          <a href="/" className="text-blue-600 hover:underline">
            Return to Home
          </a>
        </div>
      </div>
    </main>
  )
}

