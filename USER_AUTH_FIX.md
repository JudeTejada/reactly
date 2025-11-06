# User Authentication and Project Linking Fix

## Problem
Projects created on the frontend were not being linked to the authenticated user because of inconsistent handling of Clerk user IDs throughout the backend.

## Root Cause
1. The database schema uses internal UUIDs for the `users.id` field
2. Clerk provides string-based user IDs (e.g., `user_356qNUdHNNfAa0kiD54suYqhV93`)
3. The `ClerkAuthGuard` was only setting `userId` without providing `clerkUserId` or `email`
4. Controllers were inconsistently using `user.userId` vs `user.clerkUserId`
5. Services were expecting internal UUIDs but receiving Clerk user IDs

## Solution

### 1. Updated Database Connection (Neon WebSocket Driver)
**Files Modified:**
- `apps/backend/src/db/index.ts`
- `apps/backend/src/db/migrate.ts`

**Changes:**
- Switched from `drizzle-orm/neon-http` to `drizzle-orm/neon-serverless`
- Changed from `neon()` function to `Pool` with WebSocket support
- Added `ws` package dependency
- Fixed environment variable loading with `dotenv.config()`

### 2. Enhanced ClerkAuthGuard
**File Modified:** `apps/backend/src/auth/clerk-auth.guard.ts`

**Changes:**
- Now fetches full user data from Clerk API using `clerkClient.users.getUser()`
- Sets comprehensive user object in request:
  ```typescript
  request.user = {
    userId: verified.sub,           // Clerk user ID
    clerkUserId: verified.sub,      // Same as userId for consistency
    sessionId: verified.sid,        // Session ID
    email: clerkUser.emailAddresses[0]?.emailAddress || null,
    name: `${clerkUser.firstName} ${clerkUser.lastName}`.trim() || null,
  };
  ```
- Added fallback if user data fetch fails
- Improved error handling and logging

### 3. Updated All Services to Handle Clerk User IDs
**Files Modified:**
- `apps/backend/src/analytics/analytics.service.ts`
- `apps/backend/src/feedback/feedback.service.ts`

**Changes:**
- Added `getUserInternalId()` helper method to convert Clerk user ID to internal UUID
- Updated all methods to:
  1. Accept `clerkUserId` as parameter (instead of `userId`)
  2. Look up the internal user UUID from the `users` table
  3. Use the internal UUID for database queries

**Example:**
```typescript
private async getUserInternalId(clerkUserId: string): Promise<string> {
  const user = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.clerkUserId, clerkUserId))
    .limit(1);

  if (user.length === 0) {
    throw new NotFoundException("User not found");
  }

  return user[0].id;
}
```

### 4. Updated All Controllers to Use clerkUserId Consistently
**Files Modified:**
- `apps/backend/src/projects/projects.controller.ts`
- `apps/backend/src/analytics/analytics.controller.ts`
- `apps/backend/src/feedback/feedback.controller.ts`

**Changes:**
- All methods now use `user.clerkUserId` instead of `user.userId`
- Ensures consistency across all endpoints
- Projects now properly link to authenticated users

## Methods Updated

### ProjectsController
- `createProject()` - ✅ Uses `user.clerkUserId` and `user.email`
- `getAllProjects()` - ✅ Uses `user.clerkUserId`
- `getProject()` - ✅ Uses `user.clerkUserId`
- `updateProject()` - ✅ Uses `user.clerkUserId`
- `regenerateApiKey()` - ✅ Uses `user.clerkUserId`
- `toggleActive()` - ✅ Uses `user.clerkUserId`
- `deleteProject()` - ✅ Uses `user.clerkUserId`

### AnalyticsController
- `getOverview()` - ✅ Uses `user.clerkUserId`
- `getTrends()` - ✅ Uses `user.clerkUserId`
- `getRecentFeedback()` - ✅ Uses `user.clerkUserId`

### FeedbackController
- `getAllFeedback()` - ✅ Uses `user.clerkUserId`
- `getFeedback()` - ✅ Uses `user.clerkUserId`
- `deleteFeedback()` - ✅ Uses `user.clerkUserId`

## Testing
Run TypeScript compilation to verify:
```bash
cd apps/backend
pnpm type-check
```

## Result
- Projects now properly link to the authenticated user
- All database queries correctly resolve Clerk user IDs to internal UUIDs
- User data (email, name) is available for the `ensureUser()` method
- Consistent authentication handling across all endpoints
