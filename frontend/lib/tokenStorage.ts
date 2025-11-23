import type { AuthResponse } from "@/lib/auth";

const STORAGE_KEY = "omocha-bako.auth";

type StoredAuthSession = AuthResponse & {
  storedAt: string;
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function saveAuthSession(session: AuthResponse) {
  if (!canUseStorage()) return;
  const payload: StoredAuthSession = {
    ...session,
    storedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function loadAuthSession(): StoredAuthSession | null {
  if (!canUseStorage()) return null;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredAuthSession;
  } catch (error) {
    console.warn("Failed to parse stored auth session", error);
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function clearAuthSession() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(STORAGE_KEY);
}
