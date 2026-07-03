import type { User } from '../types/index.js';

const AUTH_TOKEN_KEY = 'wishesdream_auth_token';
const AUTH_USER_KEY = 'wishesdream_auth_user';
const GUEST_TOKEN_KEY = 'wishesdream_guest_token';

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

export function getStoredUser(): User | null {
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function setStoredUser(user: User): void {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function getGuestToken(): string | null {
  return localStorage.getItem(GUEST_TOKEN_KEY);
}

export function setGuestToken(token: string): void {
  localStorage.setItem(GUEST_TOKEN_KEY, token);
}

export function ensureGuestToken(): string {
  const existing = getGuestToken();
  if (existing) {
    return existing;
  }

  const token = crypto.randomUUID();
  setGuestToken(token);
  return token;
}
