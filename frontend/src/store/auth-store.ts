"use client";

import { create } from "zustand";
import {
  clearToken,
  getStoredUser,
  getToken,
  setStoredUser,
  setToken,
  type AuthUser,
} from "@/lib/auth/token";
import { api } from "@/lib/api/client";

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  hydrated: boolean;
  hydrate: () => void;
  setSession: (token: string, user: AuthUser) => void;
  clear: () => void;
  logout: () => Promise<void>;
  login: (email: string, password: string) => Promise<AuthUser>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  hydrated: false,

  hydrate: () => {
    set({
      token: getToken(),
      user: getStoredUser(),
      hydrated: true,
    });
  },

  setSession: (token, user) => {
    setToken(token);
    setStoredUser(user);
    set({ token, user, hydrated: true });
  },

  clear: () => {
    clearToken();
    set({ token: null, user: null, hydrated: true });
  },

  login: async (email, password) => {
    const { data } = await api.post<{
      token: string;
      user: AuthUser;
    }>("/auth/login", { email, password });
    get().setSession(data.token, data.user);
    return data.user;
  },

  logout: async () => {
    try {
      if (get().token) {
        await api.post("/auth/logout");
      }
    } catch {
      // ignore
    } finally {
      get().clear();
    }
  },
}));
