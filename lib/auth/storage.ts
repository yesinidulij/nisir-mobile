import * as SecureStore from 'expo-secure-store';
import { EventEmitter } from './EventEmitter';

const AUTH_STORAGE_KEY = 'nisir.auth';
const AUTH_CHANGED_EVENT = 'auth-changed';

export interface AuthUser {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  name?: string;
  email?: string;
  emailVerified?: boolean;
  role?: string;
  userRole?: string;
  roleType?: string;
  userType?: string;
  accountType?: string;
  type?: string;
  id?: string;
  [key: string]: unknown;
}

export interface AuthState {
  accessToken?: string;
  refreshToken?: string;
  user?: AuthUser | null;
}

// Event emitter for auth state changes
const authEmitter = new EventEmitter();

const USER_ROLE_KEYS = [
  'role', 'userRole', 'roleType', 'role_type',
  'userType', 'user_type', 'accountType', 'account_type', 'type',
] as const;

const USER_NAME_KEYS = ['firstName', 'firstname', 'first_name', 'givenName', 'given_name'] as const;
const USER_LAST_NAME_KEYS = ['lastName', 'lastname', 'last_name', 'familyName', 'family_name', 'surname'] as const;
const USER_FULL_NAME_KEYS = ['fullName', 'fullname', 'name', 'displayName'] as const;
const ACCESS_TOKEN_KEYS = ['accessToken', 'access_token', 'token', 'jwt', 'jwtToken'] as const;
const REFRESH_TOKEN_KEYS = ['refreshToken', 'refresh_token'] as const;
const EMAIL_KEYS = ['email', 'emailAddress', 'email_address'] as const;
const USER_CONTAINER_KEYS = ['user', 'profile', 'account', 'member', 'customer'] as const;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const assignStringIfMissing = (
  target: Record<string, unknown>,
  key: string,
  value: string | undefined,
) => {
  if (!value) return;
  const existing = target[key];
  if (typeof existing === 'string' && existing.trim().length > 0) return;
  target[key] = value;
};

const findStringInKeys = (
  source: Record<string, unknown>,
  keys: readonly string[],
): string | undefined => {
  for (const key of keys) {
    const value = getString(source[key]);
    if (value) return value;
  }
  return undefined;
};

const normalizeAuthUser = (value: Record<string, unknown>) => {
  const normalized: AuthUser = {};

  for (const [key, entry] of Object.entries(value)) {
    if (
      ACCESS_TOKEN_KEYS.includes(key as any) ||
      REFRESH_TOKEN_KEYS.includes(key as any)
    ) continue;
    normalized[key] = entry;
  }

  const firstName = findStringInKeys(value, USER_NAME_KEYS);
  assignStringIfMissing(normalized, 'firstName', firstName);

  const lastName = findStringInKeys(value, USER_LAST_NAME_KEYS);
  assignStringIfMissing(normalized, 'lastName', lastName);

  const fullName = findStringInKeys(value, USER_FULL_NAME_KEYS);
  assignStringIfMissing(normalized, 'fullName', fullName);
  assignStringIfMissing(normalized, 'name', fullName);

  const email = findStringInKeys(value, EMAIL_KEYS);
  assignStringIfMissing(normalized, 'email', email);

  for (const key of USER_ROLE_KEYS) {
    const roleValue = getString(value[key]);
    if (!roleValue) continue;
    assignStringIfMissing(normalized, 'role', roleValue);
  }

  const id = getString(value.id ?? value.userId ?? value._id);
  const username = getString(value.username ?? value.userName);
  const isMeaningful = Boolean(firstName || lastName || fullName || email || normalized.role || id || username);
  return { user: normalized, isMeaningful };
};

const deriveAuthStateFromResponse = (value: unknown): AuthState => {
  if (!isRecord(value)) return {};
  const authState: AuthState = {};

  // Find access token
  const findToken = (obj: Record<string, unknown>, keys: readonly string[]) => {
    for (const key of keys) {
      const val = getString(obj[key]);
      if (val) return val;
    }
    return undefined;
  };

  authState.accessToken = findToken(value, ACCESS_TOKEN_KEYS);
  authState.refreshToken = findToken(value, REFRESH_TOKEN_KEYS);

  // Find user in nested containers
  let userCandidate: AuthUser | null = null;
  for (const key of USER_CONTAINER_KEYS) {
    const entry = value[key];
    if (isRecord(entry)) {
      const { user, isMeaningful } = normalizeAuthUser(entry);
      if (isMeaningful) {
        userCandidate = user;
        break;
      }
    }
  }

  // Fallback: try top-level
  if (!userCandidate) {
    const { user, isMeaningful } = normalizeAuthUser(value);
    if (isMeaningful) userCandidate = user;
  }

  if (userCandidate) authState.user = userCandidate;
  return authState;
};

export const loadAuthState = async (): Promise<AuthState | null> => {
  try {
    const storedValue = await SecureStore.getItemAsync(AUTH_STORAGE_KEY);
    if (!storedValue) return null;
    const parsed = JSON.parse(storedValue);
    if (!isRecord(parsed)) return null;
    const state: AuthState = {};
    if (getString(parsed.accessToken as string)) state.accessToken = parsed.accessToken as string;
    if (getString(parsed.refreshToken as string)) state.refreshToken = parsed.refreshToken as string;
    if (isRecord(parsed.user)) state.user = normalizeAuthUser(parsed.user as Record<string, unknown>).user;
    else if (parsed.user === null) state.user = null;
    return state.accessToken || state.refreshToken || state.user !== undefined ? state : null;
  } catch {
    return null;
  }
};

export const saveAuthState = async (state: AuthState) => {
  try {
    const payload: AuthState = {};
    if (state.accessToken) payload.accessToken = state.accessToken;
    if (state.refreshToken) payload.refreshToken = state.refreshToken;
    if (state.user !== undefined) payload.user = state.user ?? null;
    await SecureStore.setItemAsync(AUTH_STORAGE_KEY, JSON.stringify(payload));
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
  const firstName = findStringInKeys(user, USER_NAME_KEYS);
  const lastName = findStringInKeys(user, USER_LAST_NAME_KEYS);
  const parts = [firstName, lastName].filter((p): p is string => typeof p === 'string' && p.length > 0);
  if (parts.length > 0) return parts.join(' ');
  return findStringInKeys(user, USER_FULL_NAME_KEYS) ?? getString(user.email) ?? '';
};

export const getUserRole = (user: AuthUser | null | undefined): string | undefined => {
  if (!user || !isRecord(user)) return undefined;
  for (const key of USER_ROLE_KEYS) {
    const value = getString(user[key]);
    if (value) return value;
  }
  return undefined;
};

export const persistAuthResponse = async (value: unknown) => {
  const derived = deriveAuthStateFromResponse(value);
  const hasAccessToken = derived.accessToken !== undefined;
  const hasRefreshToken = derived.refreshToken !== undefined;
  const hasUser = derived.user !== undefined;
  if (!hasAccessToken && !hasRefreshToken && !hasUser) return;

  const existing = (await loadAuthState()) ?? {};
  const next: AuthState = {};
  next.accessToken = hasAccessToken ? derived.accessToken : existing.accessToken;
  next.refreshToken = hasRefreshToken ? derived.refreshToken : existing.refreshToken;
  if (hasUser) next.user = derived.user ?? null;
  else if (existing.user !== undefined) next.user = existing.user ?? null;
  await saveAuthState(next);
};

export const setEmailVerified = async (verified: boolean) => {
  const existing = await loadAuthState();
  if (!existing?.user) return;
  const updatedUser: AuthUser = { ...existing.user, emailVerified: verified };
  await saveAuthState({ ...existing, user: updatedUser });
};
