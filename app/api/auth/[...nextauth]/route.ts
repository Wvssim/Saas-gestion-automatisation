import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth/config';

/**
 * NextAuth Dynamic Route Handler
 *
 * Handles all authentication endpoints:
 * - GET /api/auth/signin - Sign in page
 * - POST /api/auth/signin/google - Google OAuth callback
 * - GET /api/auth/callback/google - OAuth redirect
 * - POST /api/auth/callback/credentials - Credentials validation
 * - GET /api/auth/session - Retrieve current session
 * - POST /api/auth/signout - Sign out
 * - GET /api/auth/providers - List enabled providers
 * - POST /api/auth/csrf - CSRF token
 * - GET /api/auth/error - Error page
 *
 * CSRF Protection: Built-in via NextAuth
 * - All POST requests validated automatically
 * - CSRF tokens included in responses
 *
 * Security Headers:
 * - Content-Security-Policy enforced by Next.js
 * - SameSite cookies (Strict/Lax) set by default
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
