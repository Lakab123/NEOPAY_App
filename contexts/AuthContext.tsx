import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { setBaseUrl, setAuthTokenGetter } from "../lib/api-client";

export type UserProfile = {
  id: number;
  name: string;
  email: string;
  biometricEnrolled: boolean;
  createdAt: string;
};

type AuthState = {
  token: string | null;
  user: UserProfile | null;
  isLoading: boolean;
};

type AuthContextType = AuthState & {
  login: (token: string, user: UserProfile) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: UserProfile) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

async function secureGet(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    return AsyncStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

async function secureSet(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    return AsyncStorage.setItem(key, value);
  }
  return SecureStore.setItemAsync(key, value);
}

async function secureDelete(key: string): Promise<void> {
  if (Platform.OS === "web") {
    return AsyncStorage.removeItem(key);
  }
  return SecureStore.deleteItemAsync(key);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token: null,
    user: null,
    isLoading: true,
  });

  // Set up base URL and auth token getter once
  useEffect(() => {
    const domain = process.env["EXPO_PUBLIC_DOMAIN"];
    if (domain) {
      setBaseUrl(`https://${domain}`);
    } else {
      setBaseUrl("https://workspaceapi-server-production-a8a9.up.railway.app");
    }
  }, []);

  // Provide auth token to API client
  useEffect(() => {
    setAuthTokenGetter(() => state.token);
  }, [state.token]);

  // Load persisted session on startup
  useEffect(() => {
    async function loadSession() {
      try {
        const [token, userJson] = await Promise.all([
          secureGet(TOKEN_KEY),
          secureGet(USER_KEY),
        ]);
        if (token && userJson) {
          const user = JSON.parse(userJson) as UserProfile;
          setState({ token, user, isLoading: false });
        } else {
          setState((s) => ({ ...s, isLoading: false }));
        }
      } catch {
        setState((s) => ({ ...s, isLoading: false }));
      }
    }
    loadSession();
  }, []);

  const login = useCallback(async (token: string, user: UserProfile) => {
    await Promise.all([
      secureSet(TOKEN_KEY, token),
      secureSet(USER_KEY, JSON.stringify(user)),
    ]);
    setState({ token, user, isLoading: false });
  }, []);

  const logout = useCallback(async () => {
    await Promise.all([secureDelete(TOKEN_KEY), secureDelete(USER_KEY)]);
    setState({ token: null, user: null, isLoading: false });
  }, []);

  const updateUser = useCallback((user: UserProfile) => {
    setState((s) => ({ ...s, user }));
    secureSet(USER_KEY, JSON.stringify(user));
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
