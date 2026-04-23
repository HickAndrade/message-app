"use client";

import type { User } from "@/app/types";
import { createContext, useContext, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { browserApi } from "@/app/services/api/browser";

type AuthStatus = "authenticated" | "unauthenticated";

type AuthContextValue = {
  currentUser: User | null;
  logout: () => Promise<void>;
  setCurrentUser: (user: User | null) => void;
  status: AuthStatus;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export interface AuthProviderProps {
  children: React.ReactNode;
  initialUser: User | null;
}

export default function AuthProvider({
  children,
  initialUser
}: AuthProviderProps) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(initialUser);

  const value = useMemo<AuthContextValue>(() => ({
    currentUser,
    status: currentUser ? "authenticated" : "unauthenticated",
    setCurrentUser,
    logout: async () => {
      await browserApi.post("/auth/logout");
      setCurrentUser(null);
      router.push("/");
      router.refresh();
    }
  }), [currentUser, router]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}
