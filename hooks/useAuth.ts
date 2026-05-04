'use client';

import { useSession } from 'next-auth/react';
import { User } from '@/types';

export const useAuth = () => {
  const { data: session, status, update } = useSession();

  const user = session?.user as User | undefined;
  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';

  return {
    user,
    isLoading,
    isAuthenticated,
    session,
    update,
  };
};
