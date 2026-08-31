/**
 * AutoGuard Centralized Authentication & JWT Session Storage
 * 
 * Secure token and session manager.
 * Stores ONLY signed JWT tokens and non-sensitive user profile metadata in localStorage.
 * Plaintext passwords and local user hashes are NEVER stored in browser storage.
 */

export interface AuthUser {
  id?: string;
  email: string;
  role: string;
  shopName?: string;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  adminToken?: string;
  user?: AuthUser;
  error?: string;
}

const ADMIN_TOKEN_KEY = "autoguard_owner_token";
const ADMIN_USER_KEY = "autoguard_admin_user";
const USER_TOKEN_KEY = "autoguard_user_token";
const USER_DATA_KEY = "autoguard_auth_user";

// Clean up legacy plaintext database key if found from older builds
(function purgeLegacyStorage() {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem("autoguard_registered_admins");
    } catch (e) {
      // ignore
    }
  }
})();

// --- Token & Session Management ---

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function getAdminUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ADMIN_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

export function setAdminSession(token: string, user: AuthUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
}

export function clearAdminSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_USER_KEY);
}

export function getUserToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(USER_TOKEN_KEY);
}

export function getUserData(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_DATA_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

export function setUserSession(token: string, user: AuthUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_TOKEN_KEY, token);
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
  localStorage.setItem("currentUser", user.email);
}

export function clearUserSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USER_TOKEN_KEY);
  localStorage.removeItem(USER_DATA_KEY);
  localStorage.removeItem("currentUser");
}

// --- Centralized API Integration Methods ---

/**
 * Register a new Admin profile directly in the centralized Database.
 */
export async function registerAdminApi(
  email: string,
  password: string,
  shopName?: string
): Promise<AuthResponse> {
  const trimmedEmail = email.toLowerCase().trim();
  const effectiveShop = shopName?.trim() || "AutoGuard Custom Repairs";

  try {
    const response = await fetch("/api/auth/owner-register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: trimmedEmail, password, shopName: effectiveShop }),
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Failed to register admin in centralized database.",
      };
    }

    const token = data.adminToken || data.token;
    if (token && data.user) {
      setAdminSession(token, data.user);
    }

    return {
      success: true,
      token,
      adminToken: token,
      user: data.user,
      message: data.message,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Network connection error while connecting to authentication service.",
    };
  }
}

/**
 * Login an Admin user against the centralized Database.
 */
export async function loginAdminApi(email: string, password: string): Promise<AuthResponse> {
  const trimmedEmail = email.toLowerCase().trim();

  try {
    const response = await fetch("/api/auth/owner-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: trimmedEmail, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Invalid credentials. Please verify your email and password.",
      };
    }

    const token = data.adminToken || data.token;
    if (token && data.user) {
      setAdminSession(token, data.user);
    }

    return {
      success: true,
      token,
      adminToken: token,
      user: data.user,
      message: data.message,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Network connection error while connecting to authentication service.",
    };
  }
}

/**
 * General user / technician login against centralized Database.
 */
export async function loginUserApi(email: string, password: string): Promise<AuthResponse> {
  const trimmedEmail = email.toLowerCase().trim();

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: trimmedEmail, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Invalid credentials. Please check your credentials.",
      };
    }

    if (data.token && data.user) {
      setUserSession(data.token, data.user);
    }

    return {
      success: true,
      token: data.token,
      user: data.user,
      message: data.message,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Network connection error while connecting to authentication service.",
    };
  }
}

/**
 * General user / technician registration in centralized Database.
 */
export async function registerUserApi(email: string, password: string): Promise<AuthResponse> {
  const trimmedEmail = email.toLowerCase().trim();

  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: trimmedEmail, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Registration failed.",
      };
    }

    if (data.token && data.user) {
      setUserSession(data.token, data.user);
    }

    return {
      success: true,
      token: data.token,
      user: data.user,
      message: data.message,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Network connection error while connecting to authentication service.",
    };
  }
}

/**
 * Fetch verified list of showroom admins from the centralized Database.
 */
export async function fetchRegisteredAdminsApi(): Promise<AuthUser[]> {
  try {
    const response = await fetch("/api/auth/admins");
    if (!response.ok) return [];
    const data = await response.json();
    return data.admins || [];
  } catch (err) {
    console.warn("Could not fetch admins from database:", err);
    return [];
  }
}
