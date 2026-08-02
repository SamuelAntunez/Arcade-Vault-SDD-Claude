"use client";

import { createContext, useContext, useEffect, useState } from "react";

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

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      // ignore malformed storage
    }
  }, []);

  const login = (nextUser: SessionUser | null) => {
    setUser(nextUser);
    try {
      if (nextUser) localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore storage write failures
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore storage write failures
    }
  };

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
