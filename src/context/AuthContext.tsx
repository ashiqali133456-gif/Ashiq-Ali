/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types.js';

interface TwoFactorAuthState {
  required: boolean;
  tempToken: string;
  message?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  twoFactorState: TwoFactorAuthState | null;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
  login: (identifier: string, password: string, role?: UserRole) => Promise<{ success: boolean; requires2FA?: boolean; message?: string }>;
  verify2FA: (pin: string) => Promise<boolean>;
  cancel2FA: () => void;
  loginWithGoogle: (data: { email: string; name: string; googleId?: string; picture?: string; requestedRole?: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('jpc_auth_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [twoFactorState, setTwoFactorState] = useState<TwoFactorAuthState | null>(null);

  const fetchCurrentUser = async () => {
    const storedToken = localStorage.getItem('jpc_auth_token');
    if (!storedToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${storedToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setToken(storedToken);
      } else {
        localStorage.removeItem('jpc_auth_token');
        setUser(null);
        setToken(null);
      }
    } catch (err) {
      console.error('Error fetching current user:', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (identifier: string, password: string, role?: UserRole) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, role }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed.');
      }

      if (data.requires2FA) {
        setTwoFactorState({
          required: true,
          tempToken: data.tempToken,
          message: data.message,
        });
        return { success: true, requires2FA: true, message: data.message };
      }

      localStorage.setItem('jpc_auth_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setTwoFactorState(null);
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };

  const verify2FA = async (pin: string): Promise<boolean> => {
    if (!twoFactorState?.tempToken) return false;
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken: twoFactorState.tempToken, pin }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '2FA verification failed.');
      }

      localStorage.setItem('jpc_auth_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setTwoFactorState(null);
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const cancel2FA = () => {
    setTwoFactorState(null);
  };

  const loginWithGoogle = async (googleData: { email: string; name: string; googleId?: string; picture?: string; requestedRole?: string }) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(googleData),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Google login failed.');
      }

      localStorage.setItem('jpc_auth_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('jpc_auth_token');
    setToken(null);
    setUser(null);
    setTwoFactorState(null);
  };

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isTeacher = user?.role === 'TEACHER';
  const isStudent = user?.role === 'STUDENT';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        twoFactorState,
        isAuthenticated,
        isSuperAdmin,
        isTeacher,
        isStudent,
        login,
        verify2FA,
        cancel2FA,
        loginWithGoogle,
        logout,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
