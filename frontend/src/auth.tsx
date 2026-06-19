import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';

type User = {
  id: string;
  phone: string;
  full_name: string;
  username: string;
  avatar_url?: string | null;
  bio?: string | null;
  followers_count: number;
  following_count: number;
  posts_count: number;
} | null;

type AuthCtx = {
  user: User;
  loading: boolean;
  signInWithToken: (token: string, user: any) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({} as AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        setUser(null);
        return;
      }
      const me = await api.me();
      setUser(me);
    } catch {
      setUser(null);
      await AsyncStorage.removeItem('auth_token');
    }
  }, []);

  useEffect(() => {
    (async () => {
      await refresh();
      setLoading(false);
    })();
  }, [refresh]);

  const signInWithToken = async (token: string, u: any) => {
    await AsyncStorage.setItem('auth_token', token);
    setUser(u);
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('auth_token');
    setUser(null);
  };

  return (
    <Ctx.Provider value={{ user, loading, signInWithToken, signOut, refresh }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
