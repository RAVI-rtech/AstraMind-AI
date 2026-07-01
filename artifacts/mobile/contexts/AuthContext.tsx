import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface User {
  id: string;
  email: string;
  name: string;
  isPremium: boolean;
  createdAt: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const AUTH_TOKEN_KEY = "@astramind_auth_token";
const AUTH_USER_KEY = "@astramind_auth_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    restoreSession();
  }, []);

  async function restoreSession() {
    try {
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem(AUTH_TOKEN_KEY),
        AsyncStorage.getItem(AUTH_USER_KEY),
      ]);
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, password: string) {
    // Stub — wire to /api/auth/login in the next phase
    const mockUser: User = {
      id: Date.now().toString(),
      email,
      name: email.split("@")[0],
      isPremium: false,
      createdAt: new Date().toISOString(),
    };
    const mockToken = "mock_token_" + Date.now();
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, mockToken);
    await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(mockUser));
    setToken(mockToken);
    setUser(mockUser);
  }

  async function register(name: string, email: string, _password: string) {
    const mockUser: User = {
      id: Date.now().toString(),
      email,
      name,
      isPremium: false,
      createdAt: new Date().toISOString(),
    };
    const mockToken = "mock_token_" + Date.now();
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, mockToken);
    await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(mockUser));
    setToken(mockToken);
    setUser(mockUser);
  }

  async function logout() {
    await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, AUTH_USER_KEY]);
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
