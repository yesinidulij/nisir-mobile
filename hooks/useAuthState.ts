import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  getUserRole,
  loadAuthState,
  subscribeAuthState,
  type AuthState,
} from '@/lib/auth/storage';

const emptyState: AuthState = { user: null };

export const useAuthState = () => {
  const [snapshot, setSnapshot] = useState<AuthState>(emptyState);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    const state = await loadAuthState();
    setSnapshot(state ?? emptyState);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Initial load
    refresh();

    // Subscribe to changes
    const unsubscribe = subscribeAuthState(() => {
      refresh();
    });

    return unsubscribe;
  }, [refresh]);

  return useMemo(() => {
    const role = getUserRole(snapshot.user);
    const normalizedRole = role?.toUpperCase();

    return {
      ...snapshot,
      role,
      normalizedRole,
      isAuthenticated: Boolean(snapshot.user || snapshot.accessToken),
      isCompany: normalizedRole === 'COMPANY',
      isIndividual: normalizedRole === 'INDIVIDUAL',
      isAdmin: normalizedRole === 'ADMIN',
      isLoading,
    };
  }, [snapshot, isLoading]);
};

export type UseAuthStateReturn = ReturnType<typeof useAuthState>;
