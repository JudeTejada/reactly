"use client";

import { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { queryClient } from "@/lib/query-client";
import { setTokenProvider } from "@/lib/api";

export function Providers({ children }: { children: React.ReactNode }) {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    console.log('[Providers] Auth state:', { isLoaded, isSignedIn });
    
    // Set up the token provider for API calls
    setTokenProvider(async () => {
      if (!isLoaded || !isSignedIn) {
        console.log('[Providers] Not authenticated, no token available');
        return null;
      }
      
      try {
        const token = await getToken();
        console.log('[Providers] Token obtained:', token ? 'yes' : 'no');
        return token;
      } catch (error) {
        console.error('[Providers] Error getting token:', error);
        return null;
      }
    });
  }, [getToken, isLoaded, isSignedIn]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
