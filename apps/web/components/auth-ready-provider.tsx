"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { setTokenProvider } from "@/lib/api";

interface AuthReadyContextValue {
  isAuthReady: boolean;
}

const AuthReadyContext = createContext<AuthReadyContextValue>({
  isAuthReady: false,
});

export function useAuthReady() {
  return useContext(AuthReadyContext);
}

interface AuthReadyProviderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * AuthReadyProvider ensures that the authentication token is available
 * before rendering authenticated content. This prevents race conditions
 * where API calls are made before the token is ready.
 */
export function AuthReadyProvider({
  children,
  fallback,
}: AuthReadyProviderProps) {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [isAuthReady, setIsAuthReady] = useState(false);
  const tokenProviderSetRef = useRef(false);

  useEffect(() => {
    // Only set up the token provider once auth is loaded and user is signed in
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      // Not signed in, but auth is loaded - we can proceed (will redirect to login)
      setIsAuthReady(true);
      return;
    }

    // Set up the token provider only once
    if (!tokenProviderSetRef.current) {
      tokenProviderSetRef.current = true;

      setTokenProvider(async () => {
        try {
          const token = await getToken();
          return token;
        } catch (error) {
          console.error("[AuthReadyProvider] Error getting token:", error);
          return null;
        }
      });
    }

    // Auth is loaded, user is signed in, and token provider is set
    setIsAuthReady(true);
  }, [getToken, isLoaded, isSignedIn]);

  if (!isAuthReady) {
    return fallback ?? <AuthLoadingSkeleton />;
  }

  return (
    <AuthReadyContext.Provider value={{ isAuthReady }}>
      {children}
    </AuthReadyContext.Provider>
  );
}

/**
 * Default loading skeleton shown while auth is initializing
 */
function AuthLoadingSkeleton() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/20">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
