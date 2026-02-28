import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { queryClient } from "./queryClient";

interface User {
  id: string;
  userName: string;
  email: string;
  role: "admin" | "user";
  photoUrl?: string;
  description?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (userName: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function fetchJson(url: string, options?: RequestInit) {
  const res = await fetch(url, { credentials: "include", ...options });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Request failed: ${res.status}`);
  return data;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(data => setUser(data?.user ?? null))
      .finally(() => setIsLoading(false));
  }, []);

  const signIn = async (email: string, password: string) => {
    const data = await fetchJson("/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setUser(data.user);
    queryClient.invalidateQueries();
  };

  const signUp = async (userName: string, email: string, password: string) => {
    const data = await fetchJson("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userName, email, password, role: "user" }),
    });
    setUser(data.user);
    queryClient.invalidateQueries();
  };

  const signOut = async () => {
    await fetch("/api/auth/signout", { method: "POST", credentials: "include" });
    setUser(null);
    queryClient.clear();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
