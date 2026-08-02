"use client";

import { createContext, useContext, useSyncExternalStore } from "react";

export interface SessionUser {
  name: string;
}

interface SessionContextValue {
  user: SessionUser | null;
  login: (user: SessionUser | null) => void;
  logout: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

const STORAGE_KEY = "av_user";

// ===== external store over localStorage['av_user'] =====
const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cachedUser: SessionUser | null = null;

function readUser(): SessionUser | null {
  const raw = typeof window === "undefined" ? null : localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) return cachedUser;
  cachedRaw = raw;
  try {
    cachedUser = raw ? JSON.parse(raw) : null;
  } catch {
    cachedUser = null;
  }
  return cachedUser;
}

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getSnapshot() {
  return readUser();
}

function getServerSnapshot() {
  return null;
}

function writeUser(nextUser: SessionUser | null) {
  try {
    if (nextUser) localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore storage write failures
  }
  emit();
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const user = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const login = (nextUser: SessionUser | null) => writeUser(nextUser);
  const logout = () => writeUser(null);

  return (
    <SessionContext.Provider value={{ user, login, logout }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within a SessionProvider");
  return ctx;
}
