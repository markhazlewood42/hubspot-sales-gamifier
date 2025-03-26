/**
 * Utility functions for interacting with the HubSpot API using the official client library.
 * Provides methods for OAuth flow, token management, and data retrieval from HubSpot.
 */
const hubspot = require("@hubspot/api-client")
const hubspotClient = new hubspot.Client({ basePath: "https://api.hubapiqa.com" })

// Get OAuth URL
// This generates the URL that users will visit to authorize your app
export function getOAuthUrl(redirectUri: string) {
  // Define the scopes (permissions) your app needs as an array
  const scopesArray = ["crm.objects.contacts.read", "crm.objects.deals.read", "crm.objects.owners.read"]

  // Join the scopes into a single space-separated string as required by HubSpot
  const scopes = scopesArray.join(" ")

  // The correct parameter order is: clientId, redirectUri, scopes (as a space-separated string)
  return hubspotClient.oauth.getAuthorizationUrl(process.env.HUBSPOT_CLIENT_ID, redirectUri, scopes)
}

// Exchange code for tokens
// After the user authorizes your app, HubSpot redirects to your callback URL with a code
// This function exchanges that code for access and refresh tokens
export async function exchangeForTokens(code: string, redirectUri: string) {
  return await hubspotClient.oauth.tokensApi.create(
    "authorization_code",
    code,
    redirectUri,
    process.env.HUBSPOT_CLIENT_ID,
    process.env.HUBSPOT_CLIENT_SECRET,
  )
}

// Refresh tokens
// Access tokens expire, so you need to use the refresh token to get a new access token
export async function refreshToken() {
  return await hubspotClient.oauth.tokensApi.create(
    "refresh_token",
    undefined,
    undefined,
    process.env.HUBSPOT_CLIENT_ID,
    process.env.HUBSPOT_CLIENT_SECRET,
    refreshToken,
  )
}

// Get HubSpot account info
// This retrieves information about the HubSpot account associated with the access token
export async function getAccountInfo(accessToken: string) {
  console.log("Setting access token on client to: " + accessToken)
  hubspotClient.setAccessToken(accessToken)
  console.log("Calling accessTokensApi.get ...")
  const accountInfo = await hubspotClient.oauth.accessTokensApi.get(accessToken)
  return accountInfo
}

// Get HubSpot deals
// This retrieves a list of deals from the HubSpot CRM
export async function getDeals(accessToken: string, limit = 10) {
  hubspotClient.setAccessToken(accessToken)
  return await hubspotClient.crm.deals.basicApi.getPage(limit)
}

// Get HubSpot contacts
// This retrieves a list of contacts from the HubSpot CRM
export async function getContacts(accessToken: string, limit = 10) {
  hubspotClient.setAccessToken(accessToken)
  return await hubspotClient.crm.contacts.basicApi.getPage(limit)
}

// Get HubSpot owners (sales reps)
// This retrieves a list of owners (users) from the HubSpot CRM
export async function getOwners(accessToken: string) {
  hubspotClient.setAccessToken(accessToken)
  return await hubspotClient.crm.owners.ownersApi.getPage()
}

// Create HubSpot Client
export function createHubSpotClient(accessToken: string) {
  const client = new hubspot.Client({ basePath: "https://api.hubapiqa.com" })
  client.setAccessToken(accessToken)
  return client
}

