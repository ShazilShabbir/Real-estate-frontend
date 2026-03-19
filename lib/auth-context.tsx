"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/axios";

interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  provider?: string;
  role?: string;
  savedProperties?: string[];
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  optimisticToggleFavorite: (propertyId: string) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Auto-login using HttpOnly cookie
  const fetchUser = async () => {
    try {
      const { data } = await api.get("/auth/me", {
        withCredentials: true,
      });

      if (data?.data) {
        setUser(data.data);
      }
    } catch (err) {
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const refreshUser = async () => {
    await fetchUser();
  };

  // Logs out user (server clears cookies)
  const logout = async () => {
    try {
      await api.post("/auth/logout", {}, { withCredentials: true });
    } catch (err) {
      // Handle server errors if needed
      console.error("Logout failed", err);
    }
    setUser(null);
  };

  // Optimistic UI updates
  const optimisticToggleFavorite = (propertyId: string) => {
    if (!user) return;
    const isSaved = user.savedProperties?.includes(propertyId);
    const newSaved = isSaved
      ? user.savedProperties?.filter((id) => id !== propertyId)
      : [...(user.savedProperties || []), propertyId];

    setUser({
      ...user,
      savedProperties: newSaved,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        setUser,
        logout,
        refreshUser,
        optimisticToggleFavorite,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
}