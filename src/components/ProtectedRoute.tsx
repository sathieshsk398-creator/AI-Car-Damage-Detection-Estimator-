import React, { ReactNode } from "react";
import AdminLogin from "./AdminLogin";
import UserLandingGateway from "./UserLandingGateway";

interface OwnerProtectedRouteProps {
  isAuthenticated: boolean;
  onLoginSuccess: (token: string, user: { email: string; role: string; shopName: string }) => void;
  onCancel: () => void;
  children: ReactNode;
}

/**
 * Layer 2: Owner-Specific Admin Gateway
 * Intercepts unauthenticated shop inventory actions and renders the Owner Login Gate.
 */
export function OwnerProtectedRoute({
  isAuthenticated,
  onLoginSuccess,
  onCancel,
  children
}: OwnerProtectedRouteProps) {
  if (!isAuthenticated) {
    return (
      <AdminLogin 
        onLoginSuccess={onLoginSuccess} 
        onCancel={onCancel} 
      />
    );
  }

  return <>{children}</>;
}

interface UserProtectedRouteProps {
  isAuthenticated: boolean;
  onLoginSuccess: (token: string, user: { email: string; role: string }) => void;
  children: ReactNode;
}

/**
 * Layer 1: App-Wide User Gateway
 * Locks the entire root domain behind the website entrance login/registration card.
 */
export function UserProtectedRoute({
  isAuthenticated,
  onLoginSuccess,
  children
}: UserProtectedRouteProps) {
  if (!isAuthenticated) {
    return (
      <UserLandingGateway 
        onLoginSuccess={onLoginSuccess} 
      />
    );
  }

  return <>{children}</>;
}
