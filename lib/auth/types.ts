import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT as DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface User extends DefaultUser {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    emailVerified?: Date | null;
    plan?: 'starter' | 'pro' | 'enterprise';
    createdAt?: Date;
  }

  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      plan?: 'starter' | 'pro' | 'enterprise';
      createdAt?: Date;
    } & DefaultSession['user'];
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id?: string;
    email?: string;
    name?: string | null;
    image?: string | null;
    plan?: 'starter' | 'pro' | 'enterprise';
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    supabaseId?: string;
  }
}
