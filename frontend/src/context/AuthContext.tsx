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

const MOCK_ADMIN: User = {
  id: 'admin-id',
  email: 'admin@acme.com',
  full_name: 'Elena Rostova',
  role: 'ADMIN',
  avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena',
};

const MOCK_USER: User = {
  id: 'user-alex',
  email: 'alex@acme.com',
  full_name: 'Alex Rivera',
  role: 'USER',
  avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
};

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
      if (typeof window !== 'undefined') {
        const savedMock = localStorage.getItem('mock_user');
        if (savedMock) {
          try {
            setUser(JSON.parse(savedMock));
            setLoading(false);
            return;
          } catch (e) {}
        }
      }
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
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.accessToken) {
        localStorage.setItem('accessToken', res.data.accessToken);
      }
      setUser(res.data.user);
    } catch (err: any) {
      // Graceful Fallback for Vercel Preview when local backend server is not connected
      if (!err.response || err.code === 'ERR_NETWORK') {
        let fallbackUser: User = MOCK_USER;
        if (email.toLowerCase().includes('admin')) {
          fallbackUser = MOCK_ADMIN;
        } else {
          fallbackUser = {
            id: `user-${Date.now()}`,
            email: email,
            full_name: email.split('@')[0].replace('.', ' '),
            role: email.toLowerCase().includes('admin') ? 'ADMIN' : 'USER',
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
          };
        }
        localStorage.setItem('mock_user', JSON.stringify(fallbackUser));
        localStorage.setItem('accessToken', 'mock-vercel-access-token');
        setUser(fallbackUser);
        router.push('/dashboard');
        return;
      }
      throw err;
    }
    router.push('/dashboard');
  };

  const register = async (email: string, password: string, full_name: string, role: 'ADMIN' | 'USER' = 'USER') => {
    try {
      const res = await api.post('/auth/register', { email, password, full_name, role });
      if (res.data.accessToken) {
        localStorage.setItem('accessToken', res.data.accessToken);
      }
      setUser(res.data.user);
    } catch (err: any) {
      if (!err.response || err.code === 'ERR_NETWORK') {
        const fallbackUser: User = {
          id: `user-${Date.now()}`,
          email,
          full_name,
          role,
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${full_name}`,
        };
        localStorage.setItem('mock_user', JSON.stringify(fallbackUser));
        localStorage.setItem('accessToken', 'mock-vercel-access-token');
        setUser(fallbackUser);
        router.push('/dashboard');
        return;
      }
      throw err;
    }
    router.push('/dashboard');
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('mock_user');
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
