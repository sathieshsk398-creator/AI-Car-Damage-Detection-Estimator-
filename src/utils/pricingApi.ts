import { getAdminToken, getUserToken } from "./authStorage";

export type PricingMatrix = Record<string, Record<string, { repair: number; replace: number }>>;

/**
 * Retrieve the active JWT token from localStorage.
 * Checks both admin/owner token and standard user token keys.
 */
export function getStoredJwtToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem("autoguard_owner_token") ||
    localStorage.getItem("autoguard_user_token") ||
    sessionStorage.getItem("autoguard_owner_token") ||
    sessionStorage.getItem("autoguard_user_token") ||
    getAdminToken() ||
    getUserToken() ||
    null
  );
}

/**
 * Fetch the custom price list for the currently authenticated admin.
 * Transmits the JWT in the Authorization: Bearer <token> header.
 */
export async function fetchAdminPrices(explicitToken?: string): Promise<{
  success: boolean;
  prices: PricingMatrix;
  adminId?: string;
  isNew?: boolean;
  error?: string;
}> {
  const token = explicitToken || getStoredJwtToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch("/api/admin/prices", {
    method: "GET",
    headers,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch price list from database.");
  }

  return data;
}

/**
 * Persist custom price list modifications for the currently authenticated admin.
 * Transmits the JWT in the Authorization: Bearer <token> header so the backend
 * guarantees isolation and updates only this adminId's document.
 */
export async function saveAdminPrices(
  prices: PricingMatrix,
  explicitToken?: string
): Promise<{
  success: boolean;
  message?: string;
  prices: PricingMatrix;
  adminId?: string;
  error?: string;
}> {
  const token = explicitToken || getStoredJwtToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch("/api/admin/prices", {
    method: "PUT",
    headers,
    body: JSON.stringify({ prices }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to save custom prices to database.");
  }

  return data;
}

