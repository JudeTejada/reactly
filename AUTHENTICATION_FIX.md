# Authentication Fix - Clerk Token Integration

## Issue
API requests were failing with 401 "No authentication token provided" error when creating projects from the frontend.

## Root Cause
The API client (`lib/api.ts`) wasn't including the Clerk authentication token in the Authorization header for protected endpoints.

## Solution Implemented

### 1. Token Provider Pattern
Created a token provider system that allows the API client to access Clerk's `getToken()` function:

**`lib/api.ts`:**
```typescript
let tokenProvider: (() => Promise<string | null>) | null = null;

export function setTokenProvider(provider: () => Promise<string | null>) {
  tokenProvider = provider;
}

// In fetch method:
const token = tokenProvider ? await tokenProvider() : null;

headers: {
  "Content-Type": "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
  ...options.headers,
}
```

### 2. Provider Setup
Updated the Providers component to inject Clerk's token function:

**`app/providers.tsx`:**
```typescript
import { useAuth } from "@clerk/nextjs";
import { setTokenProvider } from "@/lib/api";

export function Providers({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();

  useEffect(() => {
    setTokenProvider(() => getToken());
  }, [getToken]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

## How It Works

1. **App Initialization:**
   - When the app loads, the `Providers` component initializes
   - `useAuth()` from Clerk provides the `getToken()` function
   - `setTokenProvider()` stores this function globally

2. **API Requests:**
   - When any API method is called (e.g., `api.createProject()`)
   - The internal `fetch()` method calls `tokenProvider()` to get the current token
   - Token is included in the `Authorization: Bearer <token>` header
   - Backend validates the token with Clerk's API

3. **Token Refresh:**
   - Clerk automatically handles token refresh
   - The `getToken()` function always returns a valid token
   - No manual token management needed

## Testing

### 1. Start Both Servers
```bash
# Terminal 1 - Backend
cd apps/backend
pnpm dev

# Terminal 2 - Frontend
cd apps/web
pnpm dev
```

### 2. Test Project Creation
1. Open http://localhost:3000
2. Sign up or sign in with Clerk
3. Navigate to Dashboard → Projects
4. Click "New Project"
5. Enter project name (e.g., "Test App")
6. Click "Create Project"

**Expected Result:**
- ✅ Project created successfully
- ✅ Toast notification: "Success: Project created successfully"
- ✅ Project appears in the grid with API key

**Previous Error (Fixed):**
- ❌ "No authentication token provided" (401)

### 3. Verify Token in Network Tab
1. Open Browser DevTools (F12)
2. Go to Network tab
3. Create a project
4. Find the `POST /api/projects` request
5. Check Request Headers

**Should see:**
```
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

## Backend Validation

The backend uses Clerk's JWT verification:

**`apps/backend/src/auth/clerk-auth.guard.ts`:**
```typescript
import { verifyToken } from '@clerk/backend';

async canActivate(context: ExecutionContext): Promise<boolean> {
  const token = this.extractToken(request);
  
  const payload = await verifyToken(token, {
    secretKey: this.configService.get('CLERK_SECRET_KEY'),
  });
  
  request.user = payload;
  return true;
}
```

## Benefits

✅ **Secure:** Tokens never stored in localStorage  
✅ **Automatic:** Token refresh handled by Clerk  
✅ **Clean:** No prop drilling or context complexity  
✅ **Type-Safe:** Full TypeScript support  
✅ **SSR-Safe:** Works with Next.js Server Components

## All Protected Endpoints Now Working

- ✅ `POST /api/projects` - Create project
- ✅ `GET /api/projects` - List projects
- ✅ `GET /api/projects/:id` - Get project
- ✅ `PUT /api/projects/:id` - Update project
- ✅ `DELETE /api/projects/:id` - Delete project
- ✅ `POST /api/projects/:id/regenerate-key` - Regenerate API key
- ✅ `GET /api/feedback` - List feedback
- ✅ `DELETE /api/feedback/:id` - Delete feedback
- ✅ `GET /api/analytics/*` - All analytics endpoints

## Troubleshooting

### Still Getting 401?

1. **Check Clerk Setup:**
   ```bash
   # apps/web/.env.local
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
   CLERK_SECRET_KEY=sk_test_xxxxx
   ```

2. **Verify Backend Config:**
   ```bash
   # apps/backend/.env
   CLERK_SECRET_KEY=sk_test_xxxxx  # Must match frontend
   ```

3. **Clear Browser Cache:**
   - Sign out
   - Clear cookies for localhost
   - Sign in again

4. **Check Network Tab:**
   - Verify token is in Authorization header
   - Check if token is expired (decode at jwt.io)

### Token Not Being Sent?

- Make sure you're signed in with Clerk
- Check that Providers component is wrapping your app
- Verify `useAuth()` is working (check console)

### Backend Rejecting Token?

- Ensure CLERK_SECRET_KEY matches in both apps
- Check backend logs for specific error
- Verify Clerk dashboard settings

## Files Modified

1. **apps/web/lib/api.ts** - Added token provider and Authorization header
2. **apps/web/app/providers.tsx** - Set up Clerk token provider

## Related Documentation

- [Clerk Authentication](https://clerk.com/docs/references/nextjs/overview)
- [Backend Auth Guard](./apps/backend/src/auth/README.md)
- [Web App Complete](./WEB_APP_COMPLETE.md)
