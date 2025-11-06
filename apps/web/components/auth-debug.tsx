"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function AuthDebug() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const [token, setToken] = useState<string | null>(null);
  const [tokenInfo, setTokenInfo] = useState<any>(null);

  const loadToken = async () => {
    if (isSignedIn) {
      const t = await getToken();
      setToken(t);
      
      if (t) {
        // Decode JWT to show info (just for debugging)
        try {
          const parts = t.split('.');
          const payload = JSON.parse(atob(parts[1]));
          setTokenInfo(payload);
        } catch (e) {
          console.error('Failed to decode token:', e);
        }
      }
    }
  };

  const testApi = async () => {
    if (!token) {
      alert('No token available! Please click "Load Token" first.');
      return;
    }

    console.log('Testing API with token...');
    try {
      const response = await fetch('http://localhost:3001/api/projects', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (response.ok) {
        alert('API call successful! Check console for details.');
      } else {
        alert(`API call failed: ${data.message || data.error}`);
      }
    } catch (error: any) {
      console.error('API call error:', error);
      alert(`Error: ${error.message}`);
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      loadToken();
    }
  }, [isLoaded, isSignedIn]);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="mb-4 border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔍 Auth Debug Panel
          {isSignedIn ? (
            <Badge variant="default">Signed In</Badge>
          ) : (
            <Badge variant="destructive">Not Signed In</Badge>
          )}
        </CardTitle>
        <CardDescription>
          Debugging information for authentication issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="text-sm">
            <strong>User ID:</strong> {user?.id || 'N/A'}
          </div>
          <div className="text-sm">
            <strong>Email:</strong> {user?.primaryEmailAddress?.emailAddress || 'N/A'}
          </div>
          <div className="text-sm">
            <strong>Token Available:</strong>{' '}
            {token ? (
              <Badge variant="default">Yes ({token.length} chars)</Badge>
            ) : (
              <Badge variant="secondary">No</Badge>
            )}
          </div>
        </div>

        {tokenInfo && (
          <div className="space-y-2 border-t pt-2">
            <div className="text-sm font-medium">Token Info:</div>
            <div className="text-xs space-y-1">
              <div><strong>Subject (sub):</strong> {tokenInfo.sub}</div>
              <div><strong>Issuer:</strong> {tokenInfo.iss}</div>
              <div><strong>Expires:</strong> {new Date(tokenInfo.exp * 1000).toLocaleString()}</div>
              <div><strong>Session ID:</strong> {tokenInfo.sid}</div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={loadToken} size="sm" variant="outline">
            Load Token
          </Button>
          <Button onClick={testApi} size="sm" disabled={!token}>
            Test API Call
          </Button>
          <Button 
            onClick={() => {
              if (token) {
                navigator.clipboard.writeText(token);
                alert('Token copied to clipboard!');
              }
            }} 
            size="sm" 
            variant="outline"
            disabled={!token}
          >
            Copy Token
          </Button>
        </div>

        <div className="text-xs text-muted-foreground border-t pt-2">
          <strong>How to use:</strong>
          <ol className="list-decimal list-inside mt-1 space-y-1">
            <li>Click "Load Token" to fetch current auth token</li>
            <li>Click "Test API Call" to test /api/projects endpoint</li>
            <li>Check browser console for detailed logs</li>
            <li>Check backend logs for auth guard messages</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
