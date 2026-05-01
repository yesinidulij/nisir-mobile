import * as SecureStore from 'expo-secure-store';
import { EventEmitter } from './EventEmitter';

const AUTH_STORAGE_KEY = 'nisir.auth';
const AUTH_CHANGED_EVENT = 'auth-changed';

export interface AuthUser {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  emailVerified?: boolean;
  [key: string]: unknown;
}

export interface AuthState {
  accessToken?: string;
  refreshToken?: string;
  user?: AuthUser | null;
}

// Event emitter for auth state changes
const authEmitter = new EventEmitter();

export const loadAuthState = async (): Promise<AuthState | null> => {
  try {
    const storedValue = await SecureStore.getItemAsync(AUTH_STORAGE_KEY);
    if (!storedValue) return null;
    return JSON.parse(storedValue) as AuthState;
  } catch {
    return null;
  }
};

export const saveAuthState = async (state: AuthState) => {
  try {
    await SecureStore.setItemAsync(AUTH_STORAGE_KEY, JSON.stringify(state));
    authEmitter.emit(AUTH_CHANGED_EVENT);
  } catch (error) {
    console.error('Failed to save auth state', error);
  }
};

export const clearAuthState = async () => {
  try {
    await SecureStore.deleteItemAsync(AUTH_STORAGE_KEY);
    authEmitter.emit(AUTH_CHANGED_EVENT);
  } catch (error) {
    console.error('Failed to clear auth state', error);
  }
};

export const onAuthStateChange = (listener: () => void) => {
  authEmitter.on(AUTH_CHANGED_EVENT, listener);
  return () => authEmitter.off(AUTH_CHANGED_EVENT, listener);
};

export const subscribeAuthState = (listener: () => void) => {
  return onAuthStateChange(listener);
};

export const getUserFullName = (user: AuthUser | null | undefined) => {
  if (!user) return '';
  const parts = [user.firstName, user.lastName].filter(Boolean);
  if (parts.length > 0) return parts.join(' ');
  return user.email ?? '';
};

export const getUserRole = (user: AuthUser | null | undefined): string | undefined => {
  return user?.role;
};

export const persistAuthResponse = async (response: any) => {
  if (!response || typeof response !== 'object') return;
  
  const payload = response.data || response;
  
  const existing = (await loadAuthState()) ?? {};
  const next: AuthState = { ...existing };
  
  let updated = false;

  if (payload.accessToken) {
    next.accessToken = payload.accessToken;
    updated = true;
  }
  
  if (payload.refreshToken) {
    next.refreshToken = payload.refreshToken;
    updated = true;
  }
  
  if (payload.user !== undefined) {
    next.user = payload.user;
    updated = true;
  } else if (payload.id || payload.email) {
    const { accessToken, refreshToken, ...userFields } = payload;
    next.user = userFields as AuthUser;
    updated = true;
  }

  if (updated) {
    await saveAuthState(next);
  }
};

export const setEmailVerified = async (verified: boolean) => {
  const existing = await loadAuthState();
  if (!existing?.user) return;
  const updatedUser: AuthUser = { ...existing.user, emailVerified: verified };
  await saveAuthState({ ...existing, user: updatedUser });
};
