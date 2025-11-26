import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuthToken, getUserData, setAuthToken as storeAuthToken, setUserData as storeUserData, clearAuthData } from './authStorage';

type AuthContextType = {
  loading: boolean;
  isAuthenticated: boolean;
  user: any | null;
  signIn: (accessToken: string, refreshToken: string, user?: any) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: any) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUserState] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = await getAuthToken();
        const localUser = await getUserData();
        if (!mounted) return;
        setIsAuthenticated(!!token);
        setUserState(localUser ?? null);
      } catch {
        if (!mounted) return;
        setIsAuthenticated(false);
        setUserState(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const signIn = async (accessToken: string, refreshToken: string, userObj?: any) => {
    await storeAuthToken(accessToken, refreshToken);
    if (userObj) await storeUserData(userObj);
    setIsAuthenticated(true);
    if (userObj) setUserState(userObj);
  };

  const signOut = async () => {
    await clearAuthData();
    setIsAuthenticated(false);
    setUserState(null);
  };

  const setUser = async (u: any) => {
    await storeUserData(u);
    setUserState(u);
  };

  return (
    <AuthContext.Provider value={{ loading, isAuthenticated, user, signIn, signOut, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
