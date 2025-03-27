/**
 * Utility functions for interacting with the HubSpot API using the official client library.
 * Provides methods for OAuth flow, token management, and data retrieval from HubSpot.
 */

import * as db from "@/lib/db";
import { Client } from "@hubspot/api-client";
const hubspotClient = new Client({ basePath: "https://api.hubapiqa.com" });

// Type definition for HubSpot installation
type HubSpotInstall = {
  id?: number,
  portal_id: number,
  access_token: string,
  refresh_token: string,
  expires_at: Date,
  created_at?: Date,
  updated_at?: Date
};

// A local cache for storing install info, refreshed from the install database if needed
const installCache: Record<string, HubSpotInstall> = {};

export namespace auth {
  
  // Get OAuth URL
  // This generates the URL that users will visit to authorize your app
  export function getOAuthUrl(redirectUri: string) {
    // Define the scopes (permissions) your app needs as an array
    const scopes = ["crm.objects.contacts.read", "crm.objects.deals.read", "crm.objects.owners.read"].join(" ");

    // The correct parameter order is: clientId, redirectUri, scopes (as a space-separated string)
    return hubspotClient.oauth.getAuthorizationUrl(process.env.HUBSPOT_CLIENT_ID, redirectUri, scopes);
  }

  // Exchange code for tokens
  // After the user authorizes your app, HubSpot redirects to your callback URL with a code
  // This function exchanges that code for access and refresh tokens
  export async function exchangeForTokens(code: string, redirectUri: string) {
    const tokenData = await hubspotClient.oauth.tokensApi.create(
                        "authorization_code",
                        code,
                        redirectUri,
                        process.env.HUBSPOT_CLIENT_ID,
                        process.env.HUBSPOT_CLIENT_SECRET,
                      );
    return tokenData;
  }

  // Refresh tokens
  // Access tokens expire, so you need to use the refresh token to get a new access token
  export async function refreshToken(refreshToken: string) {
    const tokenData = await hubspotClient.oauth.tokensApi.create(
                        "refresh_token",
                        undefined,
                        undefined,
                        process.env.HUBSPOT_CLIENT_ID,
                        process.env.HUBSPOT_CLIENT_SECRET,
                        refreshToken
                      );
    return tokenData;
  }

  // Stores a new app install in the database and local cache
  export async function storeInstall( portalId: number,
                                      accessToken: string,
                                      refreshToken: string,
                                      expiresIn: number) {
    try {
      // Calculate the expiration timestamp
      const expiration = new Date(Date.now() + expiresIn * 1000);

      // Update in-memory cache
      installCache[portalId] = {
        portal_id: portalId,
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: expiration
      };

      // Update database
      return await db.storeHubSpotInstall(portalId, accessToken, refreshToken, expiration);
    }
    catch (error) {
      console.error("Error storing install info:", error);
      return { success: false, error };
    }
  }
}

export namespace api {

  // Get access token for portal
  // This retrieves the access token for a given portal ID
  async function getAccessTokenForPortal(portalId: number) {
    try {
      // Check if we have an install for this portal
      if (installCache[portalId]) {
        // Check if the access token is expired
        if (installCache[portalId].expires_at > new Date()) {
          // Token is expired, refresh
          const tokenData = await auth.refreshToken(installCache[portalId].refresh_token);
          
          // This will update both the DB and the local cache, so we can use local cache for future calls
          auth.storeInstall(portalId, tokenData.accessToken, tokenData.refreshToken, tokenData.expiresIn);
        }
        return installCache[portalId].access_token;
      }
    }
    catch (error) {
      console.error("Error getting access token:", error);
      return null;
    }
  }

  // Get HubSpot account info
  // This retrieves information about the HubSpot account associated with the given portal
  export async function getAccountInfoFromPortal(portalId: number) {
    try {
      const accessToken = await getAccessTokenForPortal(portalId);
      if (accessToken) {
        hubspotClient.setAccessToken(accessToken);
        const accountInfo = await hubspotClient.oauth.accessTokensApi.get(accessToken);
        return accountInfo;
      }
    }
    catch (error) {
      console.error("Error getting account info from portal:", error);
      return null;
    }
  }

  // Get HubSpot account info
  // This retrieves information about the HubSpot account associated with the given access token
  export async function getAccountInfoFromAccessToken(accessToken: string) {
    hubspotClient.setAccessToken(accessToken);
    return await hubspotClient.oauth.accessTokensApi.get(accessToken);
  }

  // Get HubSpot deals
  // This retrieves a list of deals from the HubSpot CRM
  export async function getDeals(portalId: number, limit = 10) {
    const accessToken = await getAccessTokenForPortal(portalId);
    if (accessToken) {
      hubspotClient.setAccessToken(accessToken);
    } 
    else {
      throw new Error("Access token is missing or invalid.");
    }
    return await hubspotClient.crm.deals.basicApi.getPage(limit)
  }

  // Get HubSpot contacts
  // This retrieves a list of contacts from the HubSpot CRM
  export async function getContacts(portalId: number, limit = 10) {
    const accessToken = await getAccessTokenForPortal(portalId);
    if (accessToken) {
      hubspotClient.setAccessToken(accessToken);
    } 
    else {
      throw new Error("Access token is missing or invalid.");
    }
    return await hubspotClient.crm.contacts.basicApi.getPage(limit)
  }

  // Get HubSpot owners (sales reps)
  // This retrieves a list of owners (users) from the HubSpot CRM
  export async function getOwners(portalId: number) {
    const accessToken = await getAccessTokenForPortal(portalId);
    if (accessToken) {
      hubspotClient.setAccessToken(accessToken);
    } 
    else {
      throw new Error("Access token is missing or invalid.");
    }
    return await hubspotClient.crm.owners.ownersApi.getPage()
  }
}