'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { api } from '@/lib/api';

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: 'ADMIN' | 'USER';
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, full_name: string, role?: 'ADMIN' | 'USER') => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_PATHS = ['/auth/login', '/auth/register'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get('/users/me');
      setUser(res.data);
    } catch (err) {
      setUser(null);
      if (!PUBLIC_PATHS.includes(pathname)) {
        router.push('/auth/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, [pathname]);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.accessToken) {
      localStorage.setItem('accessToken', res.data.accessToken);
    }
    setUser(res.data.user);
    router.push('/dashboard');
  };

  const register = async (email: string, password: string, full_name: string, role: 'ADMIN' | 'USER' = 'USER') => {
    const res = await api.post('/auth/register', { email, password, full_name, role });
    if (res.data.accessToken) {
      localStorage.setItem('accessToken', res.data.accessToken);
    }
    setUser(res.data.user);
    router.push('/dashboard');
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('accessToken');
      setUser(null);
      router.push('/auth/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser: fetchCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
