# NextAuth Configuration - SellFlow-Saas

## Architecture

### Files Generated
- `/lib/auth/config.ts` - NextAuth configuration
- `/lib/auth/types.ts` - TypeScript type definitions
- `/lib/auth/providers.ts` - OAuth & Credentials providers
- `/lib/auth/supabase.ts` - Supabase integration
- `/lib/auth/session.ts` - Server-side session helpers
- `/lib/auth/middleware.ts` - Middleware utilities
- `/app/api/auth/route.ts` - NextAuth handlers (GET/POST)
- `/app/api/auth/[...nextauth]/route.ts` - Dynamic route
- `/hooks/useSession.ts` - Client-side hooks
- `/middleware.ts` - Application middleware
- `.env.local.example` - Environment variables template

## Setup Steps

### 1. Install Dependencies
```bash
npm install next-auth@5.0.0 @auth/prisma-adapter
npm install @supabase/supabase-js
```

### 2. Generate NextAuth Secret
```bash
openssl rand -base64 32
```
Add to `.env.local`:
```
NEXTAUTH_SECRET=<generated-secret>
NEXTAUTH_URL=http://localhost:3000 # or your domain
```

### 3. Configure Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new OAuth 2.0 credentials (Web Application)
3. Add authorized redirect URI:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
4. Copy Client ID & Secret to `.env.local`

### 4. Configure Database
- Ensure Supabase PostgreSQL is set up
- Add `DATABASE_URL` to `.env.local`
- Run Prisma migrations

### 5. Supabase Configuration
Optional: Sync users with Supabase Auth
- Add NEXT_PUBLIC_SUPABASE_URL
- Add NEXT_PUBLIC_SUPABASE_ANON_KEY
- Add SUPABASE_SERVICE_ROLE_KEY

### 6. Database Setup

#### Option A: Prisma Adapter (Recommended)
Already configured in `/lib/auth/config.ts`
- Uses Prisma schema for NextAuth tables
- Requires Prisma adapter setup

#### Option B: Custom Database
Implement in `/lib/auth/supabase.ts`:
- Replace TODO comments with actual queries
- Use Supabase client for user management

### 7. Middleware Configuration
Already implemented in `/middleware.ts`
- Protects /dashboard routes
- Protects /api/protected routes
- Redirects unauthenticated users to signin

## Usage Examples

### Server-Side (Server Components & API Routes)

#### Get Current Session
```typescript
import { getServerSession } from '@/lib/auth/session';

export default async function Page() {
  const session = await getServerSession();
  
  if (!session) {
    return <div>Not authenticated</div>;
  }
  
  return <div>Welcome, {session.user.email}</div>;
}
```

#### Require Authentication
```typescript
import { requireAuth } from '@/lib/auth/session';

export async function POST(request: Request) {
  const session = await requireAuth();
  
  // User is authenticated
  console.log(session.user.id);
}
```

#### Check Plan
```typescript
import { userHasPlan } from '@/lib/auth/session';

if (await userHasPlan('pro')) {
  // Show pro features
}
```

### Client-Side (Client Components)

#### Use Session Hook
```typescript
'use client';

import { useSession } from '@/hooks/useSession';

export function UserProfile() {
  const { data: session, status } = useSession();
  
  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'unauthenticated') return <div>Sign in required</div>;
  
  return <div>Welcome, {session?.user?.email}</div>;
}
```

#### Use Auth Hook
```typescript
'use client';

import { useAuth } from '@/hooks/useSession';

export function AuthStatus() {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <SignInButton />;
  
  return <UserMenu user={user} />;
}
```

#### Check Plan
```typescript
'use client';

import { useUserPlan } from '@/hooks/useSession';

export function ProFeature() {
  const { hasPlan, plan } = useUserPlan();
  
  if (!hasPlan('pro')) {
    return <UpgradePrompt />;
  }
  
  return <div>Pro content here</div>;
}
```

### Protect Routes

#### Middleware
Routes automatically protected by `/middleware.ts`:
- `/dashboard/*` - Requires auth
- `/api/protected/*` - Requires auth

To add more routes, update `middleware.ts`:
```typescript
const protectedPatterns = ['/dashboard', '/api/protected', '/admin'];
```

#### HOC Protection
```typescript
'use client';

import { withAuth } from '@/hooks/useSession';

function Dashboard({ session }) {
  return <div>Welcome, {session.user.email}</div>;
}

export default withAuth(Dashboard);
```

## Security Features

### CSRF Protection
- Built-in via NextAuth
- Automatic token validation
- No additional configuration needed

### Session Security
- JWT-based sessions (stateless)
- 30-day max age
- 24-hour update interval
- HttpOnly cookies (when applicable)

### OAuth Security
- Nonce validation
- State parameter verification
- Provider credential protection
- Token expiration handling

### Password Security (Credentials Provider)
- TODO: Implement bcrypt hashing
- TODO: Rate limiting on failed attempts
- TODO: Account lockout after failures

## Environment Variables

### Required
- `NEXTAUTH_SECRET` - Generated secret
- `NEXTAUTH_URL` - Application URL
- `GOOGLE_CLIENT_ID` - Google OAuth
- `GOOGLE_CLIENT_SECRET` - Google OAuth
- `DATABASE_URL` - PostgreSQL connection

### Optional
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase public key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase admin key
- `DEBUG` - Debug logging

## Troubleshooting

### Session Not Persisting
- Check `NEXTAUTH_SECRET` is set
- Verify `NEXTAUTH_URL` matches domain
- Check cookie settings in browser

### OAuth Redirect Loop
- Verify redirect URI matches exactly in provider settings
- Check `NEXTAUTH_URL` configuration
- Clear browser cookies and retry

### Database Connection Error
- Verify `DATABASE_URL` is correct
- Check database credentials
- Run Prisma migrations: `npm run db:push`

### Type Errors
- Ensure `@types/next-auth` matches `next-auth` version
- Run `npm install` after version updates
- Check tsconfig.json includes auth types

## Customization

### Add New Provider
Edit `/lib/auth/providers.ts`:
```typescript
import GitHub from 'next-auth/providers/github';

export const githubProvider = GitHub({
  clientId: process.env.GITHUB_CLIENT_ID || '',
  clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
});
```

Add to `authConfig.providers`:
```typescript
providers: [googleProvider, githubProvider]
```

### Custom Signin Page
Create `/app/auth/signin/page.tsx`:
```typescript
import { signIn } from '@/app/api/auth/route';

export default function SignIn() {
  return (
    <form action={async () => {
      'use server';
      await signIn('google', { redirectTo: '/dashboard' });
    }}>
      <button type="submit">Sign in with Google</button>
    </form>
  );
}
```

### Custom Callbacks
Modify callbacks in `/lib/auth/config.ts`:
- `jwt()` - Customize token
- `session()` - Customize session
- `signIn()` - Control access
- `redirect()` - Custom redirects

## Testing

### Unit Test Example
```typescript
import { signIn } from '@/app/api/auth/route';

describe('Authentication', () => {
  it('should sign in with Google', async () => {
    // Mock next-auth
    // Test signin flow
  });
});
```

### E2E Test Example
```typescript
import { test, expect } from '@playwright/test';

test('signin flow', async ({ page }) => {
  await page.goto('/auth/signin');
  await page.click('button:has-text("Sign in with Google")');
  // Continue with Google OAuth flow
});
```

## Production Checklist

- [ ] Set strong `NEXTAUTH_SECRET`
- [ ] Configure correct `NEXTAUTH_URL`
- [ ] Add redirect URIs to OAuth provider
- [ ] Enable HTTPS only in production
- [ ] Set secure cookie flags
- [ ] Run Prisma migrations
- [ ] Test OAuth providers
- [ ] Monitor auth logs
- [ ] Set up session monitoring
- [ ] Implement rate limiting

## References

- [NextAuth.js Documentation](https://next-auth.js.org)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Authentication](https://supabase.com/docs/guides/auth)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
