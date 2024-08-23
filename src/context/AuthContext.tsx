import React, { createContext, useContext, useState, useEffect } from "react";
import {
  loginService,
  logoutService,
  meService,
  refreshTokenService,
} from "../services/authService";
import { AuthContextType, UserType } from "../types";
import { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY } from "../constants/constants";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const authToken = localStorage.getItem(AUTH_TOKEN_KEY);
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

      if (!authToken || !refreshToken) {
        setLoading(false);
        return;
      }

      try {
        const userData = await meService();
        setUser(userData);
      } catch (error) {
        try {
          await refreshTokenService();
          const userData = await meService();
          setUser(userData);
        } catch (refreshError) {
          console.error("Authentication failed, please log in again.");
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    const userData = await loginService(username, password);
    setUser(userData);
  };

  const logout = async () => {
    await logoutService();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
