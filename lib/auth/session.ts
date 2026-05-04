import { auth } from '@/app/api/auth/route';
import type { Session } from 'next-auth';

/**
 * Get current session on server-side
 * Use in Server Components and API routes
 */
export async function getServerSession(): Promise<Session | null> {
  const session = await auth();
  return session;
}

/**
 * Get current user on server-side
 * Returns null if not authenticated
 */
export async function getServerUser() {
  const session = await getServerSession();

  if (!session?.user) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
    plan: session.user.plan,
    createdAt: session.user.createdAt,
  };
}

/**
 * Validate user authorization
 * Returns true if user is authenticated and owns the resource
 */
export async function validateUserAccess(userId: string): Promise<boolean> {
  const session = await getServerSession();

  if (!session?.user?.id) {
    return false;
  }

  return session.user.id === userId;
}

/**
 * Check if user has specific plan
 */
export async function userHasPlan(
  requiredPlan: 'starter' | 'pro' | 'enterprise',
): Promise<boolean> {
  const session = await getServerSession();

  if (!session?.user?.plan) {
    return false;
  }

  const planHierarchy = {
    starter: 0,
    pro: 1,
    enterprise: 2,
  };

  const userPlanLevel = planHierarchy[session.user.plan];
  const requiredPlanLevel = planHierarchy[requiredPlan];

  return userPlanLevel >= requiredPlanLevel;
}

/**
 * Require authentication
 * Throw error if user not authenticated
 */
export async function requireAuth() {
  const session = await getServerSession();

  if (!session?.user?.id) {
    throw new Error('Unauthorized: Please sign in');
  }

  return session;
}

/**
 * Require specific plan
 * Throw error if user doesn't have plan
 */
export async function requirePlan(plan: 'starter' | 'pro' | 'enterprise') {
  const session = await requireAuth();

  const hasPlan = await userHasPlan(plan);

  if (!hasPlan) {
    throw new Error(`Upgrade required: ${plan} plan needed`);
  }

  return session;
}
