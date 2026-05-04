import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { Account, Profile } from 'next-auth';

/**
 * Google OAuth Provider Configuration
 *
 * Environment Variables Required:
 * - GOOGLE_CLIENT_ID: OAuth client ID from Google Cloud Console
 * - GOOGLE_CLIENT_SECRET: OAuth client secret from Google Cloud Console
 */
export const googleProvider = Google({
  clientId: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  allowDangerousEmailAccountLinking: false,
});

/**
 * Optional: Credentials Provider for custom authentication
 * Remove if not needed
 */
export const credentialsProvider = Credentials({
  name: 'Credentials',
  credentials: {
    email: { label: 'Email', type: 'email' },
    password: { label: 'Password', type: 'password' },
  },
  async authorize(credentials) {
    // TODO: Implement password hashing verification with bcrypt
    // TODO: Query Supabase or Prisma to validate user credentials

    if (!credentials?.email || !credentials?.password) {
      return null;
    }

    // This is a placeholder - implement actual credential verification
    // const user = await prisma.user.findUnique({
    //   where: { email: credentials.email },
    // });
    //
    // if (user && await bcrypt.compare(credentials.password, user.password)) {
    //   return {
    //     id: user.id,
    //     email: user.email,
    //     name: user.name,
    //     image: user.image,
    //     plan: user.plan,
    //   };
    // }

    return null;
  },
});

/**
 * Callback: JWT Token Configuration
 * Called whenever JWT is created or updated
 */
export async function jwtCallback(params: {
  token: any;
  user?: any;
  account?: Account | null;
  profile?: Profile | undefined;
  isNewUser?: boolean;
}) {
  const { token, user, account, isNewUser } = params;

  // Initial sign in
  if (user) {
    token.id = user.id;
    token.email = user.email;
    token.name = user.name;
    token.image = user.image;
    token.plan = user.plan || 'starter';
  }

  // Persist OAuth tokens from provider
  if (account) {
    token.accessToken = account.access_token;
    token.refreshToken = account.refresh_token;
    token.expiresAt = account.expires_at
      ? account.expires_at * 1000
      : Date.now() + 24 * 60 * 60 * 1000;
    token.supabaseId = account.providerAccountId;
  }

  // Handle token refresh for OAuth providers
  if (token.expiresAt && Date.now() >= token.expiresAt) {
    // TODO: Implement token refresh logic for OAuth provider
    // This is provider-specific (Google, GitHub, etc.)
    console.warn('Token expired - refresh logic needed');
  }

  return token;
}

/**
 * Callback: Session Configuration
 * Called when session is accessed via useSession() or getSession()
 */
export async function sessionCallback(params: {
  session: any;
  token: any;
  user?: any;
  newSession?: any;
  trigger?: 'getSession' | 'update';
  isNewUser?: boolean;
}) {
  const { session, token } = params;

  if (session.user) {
    session.user.id = token.id;
    session.user.email = token.email;
    session.user.name = token.name;
    session.user.image = token.image;
    session.user.plan = token.plan;
    session.user.createdAt = token.createdAt;
  }

  // Optionally include tokens in session (be cautious with sensitive data)
  // Only include if needed on client side
  // session.accessToken = token.accessToken;

  return session;
}

/**
 * Callback: Sign In Hook
 * Called on successful sign-in
 * Return false to prevent signin
 */
export async function signInCallback(params: {
  user: any;
  account: Account | null;
  profile?: Profile | undefined;
  email?: { verificationRequest?: boolean };
  credentials?: Record<string, any>;
}) {
  const { user, account, profile } = params;

  // TODO: Check user exists in database, create if needed
  // TODO: Sync Supabase user if using Supabase Auth
  // Example:
  // const existingUser = await prisma.user.findUnique({
  //   where: { email: user.email! },
  // });
  //
  // if (!existingUser && user.email) {
  //   await prisma.user.create({
  //     data: {
  //       email: user.email,
  //       name: user.name,
  //       image: user.image,
  //       plan: 'starter',
  //       supabaseId: account?.providerAccountId,
  //     },
  //   });
  // }

  return true; // Allow sign in
}

/**
 * Callback: Redirect Configuration
 * Controls where user is redirected after auth actions
 */
export function redirectCallback(params: {
  url: string;
  baseUrl: string;
}): string {
  const { url, baseUrl } = params;

  // Allow relative URLs
  if (url.startsWith('/')) return `${baseUrl}${url}`;

  // Allow URLs on same origin
  if (new URL(url).origin === baseUrl) return url;

  // Default redirect
  return baseUrl;
}
