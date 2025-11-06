# Frontend Authentication Debugging Guide

## Changes Made

### 1. Updated `apps/web/app/providers.tsx`
- Added logging to track authentication state
- Added proper error handling for `getToken()`
- Added checks for `isLoaded` and `isSignedIn`

### 2. Updated `apps/web/lib/api.ts`
- Added console logging for all API requests
- Added token preview logging
- Fixed response unwrapping to handle backend format `{ success: true, data: ... }`

## How to Debug

### Step 1: Check Console Logs
Open your browser console and look for these log messages when creating a project:

```
[Providers] Auth state: { isLoaded: true, isSignedIn: true }
[Providers] Token obtained: yes
[API] Request: { endpoint: '/projects', hasToken: true, tokenPreview: 'eyJhbGciOiJSUzI1Ni...' }
```

### Step 2: Verify User is Signed In
Make sure you're signed in to Clerk:
1. Go to http://localhost:3000/dashboard
2. You should see your user info (not a sign-in page)
3. Check the Clerk dashboard at https://dashboard.clerk.com to verify the user exists

### Step 3: Check Token Generation
If you see `hasToken: false` or `Token obtained: no`:
1. Sign out and sign back in
2. Clear browser cache and cookies
3. Check Clerk configuration in `.env` file

### Step 4: Test Token Manually
Open browser console and run:
```javascript
// This should return a JWT token
await window.Clerk.session.getToken()
```

### Step 5: Backend Logs
Check the backend logs for:
```
[ClerkAuthGuard] Token extracted: Yes (length: 500+)
[ClerkAuthGuard] Token verified for user: user_...
```

## Common Issues

### Issue 1: "Token extracted: No"
**Cause**: Token not being sent from frontend  
**Fix**: 
- Verify `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set in `.env`
- Restart the Next.js dev server
- Clear browser cache

### Issue 2: "Invalid authentication token"
**Cause**: Clerk keys mismatch between frontend and backend  
**Fix**:
- Verify `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` in `apps/web/.env`
- Verify `CLERK_SECRET_KEY` in `apps/backend/.env`
- Both should be from the same Clerk application

### Issue 3: "Not authenticated, no token available"
**Cause**: User not signed in or Clerk not loaded  
**Fix**:
- Sign in to the application
- Wait for Clerk to fully load before making API calls
- Use React Query's `enabled` option to wait for auth

## Testing Steps

1. **Restart both servers:**
   ```bash
   # Terminal 1 - Backend
   cd apps/backend && pnpm dev
   
   # Terminal 2 - Frontend  
   cd apps/web && pnpm dev
   ```

2. **Sign in:**
   - Go to http://localhost:3000
   - Click "Sign In" or "Sign Up"
   - Complete authentication

3. **Try creating a project:**
   - Go to http://localhost:3000/dashboard/projects
   - Click "Create Project"
   - Fill in the form
   - Check browser console for logs

4. **Expected console output:**
   ```
   [Providers] Auth state: { isLoaded: true, isSignedIn: true }
   [Providers] Token obtained: yes
   [API] Request: { endpoint: '/projects', hasToken: true, tokenPreview: '...' }
   [API] Response: { endpoint: '/projects', success: true }
   ```

5. **Expected backend output:**
   ```
   [ClerkAuthGuard] Request path: /api/projects
   [ClerkAuthGuard] Auth header present: true
   [ClerkAuthGuard] Token extracted: Yes (length: 500+)
   [ClerkAuthGuard] Verifying token with Clerk...
   [ClerkAuthGuard] Token verified for user: user_...
   [ProjectsService] Created project: <uuid>
   ```

## If Still Not Working

1. Check that both apps are running:
   - Backend: http://localhost:3001/health
   - Frontend: http://localhost:3000

2. Verify Clerk keys are correct and from the same application

3. Try creating a new Clerk session:
   - Sign out
   - Clear all cookies
   - Sign back in

4. Check CORS settings in backend `.env`:
   ```
   ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
   ```
