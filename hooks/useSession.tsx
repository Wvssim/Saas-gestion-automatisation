'use client';

import { useSession as useNextAuthSession } from 'next-auth/react';
import type { Session } from 'next-auth';
import type { ReactNode } from 'react';

/**
 * Hook to access session in Client Components
 * Typed wrapper around next-auth useSession
 */
export function useSession(): {
  data: Session | null;
  status: 'authenticated' | 'loading' | 'unauthenticated';
  update: (data?: any) => Promise<Session | null>;
} {
  const session = useNextAuthSession();

  return {
    data: session.data,
    status: session.status,
    update: session.update,
  };
}

/**
 * Hook to check if user is authenticated
 */
export function useAuth() {
  const session = useNextAuthSession();

  return {
    user: session.data?.user,
    isAuthenticated: session.status === 'authenticated',
    isLoading: session.status === 'loading',
    status: session.status,
  };
}

/**
 * Hook to check if user has specific plan
 */
export function useUserPlan() {
  const session = useNextAuthSession();

  const hasPlan = (requiredPlan: 'starter' | 'pro' | 'enterprise') => {
    if (!session.data?.user?.plan) {
      return false;
    }

    const planHierarchy = {
      starter: 0,
      pro: 1,
      enterprise: 2,
    };

    const userPlanLevel = planHierarchy[session.data.user.plan];
    const requiredPlanLevel = planHierarchy[requiredPlan];

    return userPlanLevel >= requiredPlanLevel;
  };

  return {
    plan: session.data?.user?.plan,
    hasPlan,
    canUpgrade: session.data?.user?.plan === 'starter',
    isPro: session.data?.user?.plan === 'pro',
    isEnterprise: session.data?.user?.plan === 'enterprise',
  };
}

/**
 * High-Order Component to protect routes
 * Usage: withAuth(YourComponent)
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P & { session: Session }>,
) {
  return function ProtectedComponent(props: P) {
    const session = useNextAuthSession();

    if (session.status === 'loading') {
      return <div>Loading...</div>;
    }

    if (session.status === 'unauthenticated') {
      return <div>Access Denied</div>;
    }

    return <Component {...props} session={session.data as Session} />;
  };
}

/**
 * Hook for session updates
 */
export function useSessionUpdate() {
  const session = useNextAuthSession();

  const updateSession = async (data?: any) => {
    return await session.update(data);
  };

  return {
    update: updateSession,
    isUpdating: session.status === 'loading',
  };
}

/**
 * Hook to refresh session token
 */
export function useRefreshSession() {
  const session = useNextAuthSession();

  const refresh = async () => {
    return await session.update();
  };

  return {
    refresh,
    isRefreshing: session.status === 'loading',
  };
}
