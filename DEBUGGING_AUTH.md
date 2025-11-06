# Debugging Authentication Issues

## Current Problem
Backend is receiving requests but tokens are either:
1. Not being sent (401: "No authentication token provided")
2. Invalid when sent (401: "Invalid authentication token")

## Backend Improvements Made
Added detailed logging to `ClerkAuthGuard`:
- Request path
- Whether Authorization header is present
- Whether token was extracted
- Token verification results

## Frontend Checklist

### 1. Verify Token Provider is Set
Add this to your browser console while on the dashboard:

```javascript
// Check if token provider is working
const testFetch = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/projects', {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error);
  }
};
testFetch();
```

### 2. Check Network Tab
When you create a project, check the Network tab:

**Request Headers should include:**
```
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
Content-Type: application/json
```

**If Authorization header is missing:**
- Token provider might not be set up correctly
- User might not be signed in
- `getToken()` might be returning null

### 3. Verify Clerk Setup

**Frontend (.env.local):**
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
```

**Backend (.env):**
```env
CLERK_SECRET_KEY=sk_test_xxxxx  # Must match frontend
```

### 4. Test Token Manually

Add this to a dashboard page temporarily:

```typescript
"use client";
import { useAuth } from "@clerk/nextjs";

export default function TestPage() {
  const { getToken, isSignedIn } = useAuth();

  const testToken = async () => {
    console.log('Is signed in:', isSignedIn);
    const token = await getToken();
    console.log('Token:', token);
    console.log('Token length:', token?.length);
  };

  return (
    <div>
      <button onClick={testToken}>Test Token</button>
    </div>
  );
}
```

## Common Issues and Fixes

### Issue 1: Token Not Being Sent

**Symptom:** Backend logs show "Auth header present: false"

**Causes:**
1. User not signed in
2. Token provider not set up
3. `getToken()` returning null

**Fix:**
```typescript
// In apps/web/app/providers.tsx
import { useAuth } from "@clerk/nextjs";
import { setTokenProvider } from "@/lib/api";

export function Providers({ children }) {
  const { getToken } = useAuth();

  useEffect(() => {
    setTokenProvider(() => getToken());
  }, [getToken]);

  // ...
}
```

### Issue 2: Invalid Token

**Symptom:** Backend logs show "Token verification failed"

**Causes:**
1. CLERK_SECRET_KEY mismatch between frontend and backend
2. Token expired (Clerk should auto-refresh)
3. Wrong Clerk environment (test vs production)

**Fix:**
1. Verify both apps use same Clerk project
2. Check secret keys match
3. Sign out and sign in again

### Issue 3: CORS Errors

**Symptom:** Network tab shows CORS error

**Fix:** Check backend `main.ts`:
```typescript
app.enableCors({
  origin: ['http://localhost:3000'],
  credentials: true,
});
```

## Testing Steps

### Step 1: Check Backend Logs
```bash
cd apps/backend
pnpm dev
```

Look for these log lines when you try to create a project:
```
[ClerkAuthGuard] DEBUG Request path: /api/projects
[ClerkAuthGuard] DEBUG Auth header present: true/false
[ClerkAuthGuard] DEBUG Token extracted: Yes (length: XXX) / No
```

### Step 2: Check Frontend Console
Open browser DevTools console and look for:
- Any errors from Clerk
- Any errors from API client
- Token provider setup messages

### Step 3: Manual API Test

Use this cURL command with a valid token:

1. Get token from browser console:
```javascript
const token = await window.Clerk.session.getToken();
console.log(token);
```

2. Test with cURL:
```bash
curl -X POST http://localhost:3001/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"name": "Test Project", "allowedDomains": []}'
```

### Step 4: Verify Clerk Dashboard

1. Go to https://dashboard.clerk.com
2. Select your application
3. Check "API Keys"
4. Verify keys match your .env files
5. Check "Sessions" to see if user is actually signed in

## Quick Fixes

### If No Token is Being Sent:

1. **Restart frontend dev server:**
```bash
cd apps/web
# Kill the process
pnpm dev
```

2. **Clear browser data:**
- Open DevTools
- Application tab → Clear storage
- Sign out and sign in again

3. **Verify useAuth hook:**
```typescript
// In a client component
const { isLoaded, isSignedIn, getToken } = useAuth();

useEffect(() => {
  if (isLoaded && isSignedIn) {
    getToken().then(token => {
      console.log('Token available:', !!token);
    });
  }
}, [isLoaded, isSignedIn, getToken]);
```

### If Token is Invalid:

1. **Check Clerk keys match:**
```bash
# Frontend
cat apps/web/.env.local | grep CLERK_SECRET_KEY

# Backend  
cat apps/backend/.env | grep CLERK_SECRET_KEY
```

2. **Try different Clerk API version:**
```bash
cd apps/backend
pnpm add @clerk/backend@latest
```

3. **Check token in jwt.io:**
- Copy token from Network tab
- Paste into https://jwt.io
- Verify issuer and other claims

## Debug Mode

Enable debug mode in backend:

```typescript
// apps/backend/src/main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  // ...
}
```

## Still Not Working?

1. **Check Clerk Status:**
   - https://status.clerk.com

2. **Verify Network:**
   - Backend running on 3001
   - Frontend running on 3000
   - No firewall blocking

3. **Try Clerk Support:**
   - https://clerk.com/support
   - Include: error messages, network logs, Clerk app ID

4. **Simplify Test:**
   - Create a simple test endpoint without auth
   - Verify basic connectivity works
   - Add auth back incrementally
