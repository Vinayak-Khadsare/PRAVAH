'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSession, CanonicalRole, getRoleDisplayName } from '@/lib/types';

export interface RegisterRequestPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  institutionName: string;
  institutionPid: string;
  regionalOffice?: string;
}

interface AuthContextType {
  user: UserSession | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  selectedOffice: string;
  setSelectedOffice: (office: string) => void;
  login: (email: string, pass: string, office?: string) => Promise<{ success: boolean; error?: string }>;
  register: (payload: RegisterRequestPayload) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedOffice, setSelectedOffice] = useState<string>('Northern Regional Office (NRO) - Kanpur');

  const fetchUserProfile = async (authToken: string): Promise<UserSession | null> => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
        cache: 'no-store'
      });
      if (!res.ok) {
        return null;
      }
      const data = await res.json();
      return {
        userId: data.userId,
        email: data.email,
        name: data.name,
        role: data.role as CanonicalRole,
        roleDisplay: getRoleDisplayName(data.role),
        regionalOffice: data.regionalOffice,
        initials: data.initials || 'UR',
        institutionPid: data.institutionPid,
        institutionName: data.institutionName,
        verificationStatus: data.verificationStatus || 'verified',
        active: data.active ?? true,
        createdAt: data.createdAt,
      };
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('pravah_token');
      if (savedToken) {
        const liveUser = await fetchUserProfile(savedToken);
        if (liveUser) {
          setUser(liveUser);
          setToken(savedToken);
          setIsAuthenticated(true);
          if (liveUser.regionalOffice) {
            setSelectedOffice(liveUser.regionalOffice);
          }
          localStorage.setItem('pravah_user', JSON.stringify(liveUser));
        } else {
          // Token is expired, invalid, or user deactivated
          localStorage.removeItem('pravah_token');
          localStorage.removeItem('pravah_user');
          setUser(null);
          setToken(null);
          setIsAuthenticated(false);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, pass: string, office?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: pass, office: office || selectedOffice })
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          error: data.detail || 'Authentication failed. Please verify credentials.'
        };
      }

      const sessionUser: UserSession = {
        userId: data.user.userId,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role as CanonicalRole,
        roleDisplay: getRoleDisplayName(data.user.role),
        regionalOffice: data.user.regionalOffice,
        initials: data.user.initials,
        institutionPid: data.user.institutionPid,
        institutionName: data.user.institutionName,
        verificationStatus: data.user.verificationStatus || 'verified',
        active: data.user.active ?? true,
        createdAt: data.user.createdAt,
      };

      setUser(sessionUser);
      setToken(data.access_token);
      setIsAuthenticated(true);
      if (sessionUser.regionalOffice) {
        setSelectedOffice(sessionUser.regionalOffice);
      }

      localStorage.setItem('pravah_token', data.access_token);
      localStorage.setItem('pravah_user', JSON.stringify(sessionUser));
      return { success: true };
    } catch {
      return { success: false, error: 'Could not connect to authentication service.' };
    }
  };

  const register = async (payload: RegisterRequestPayload): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          error: data.detail || 'Registration failed. Please check your inputs.'
        };
      }
      return { success: true };
    } catch {
      return { success: false, error: 'Network error during registration request.' };
    }
  };

  const refreshUser = async () => {
    const currentToken = token || localStorage.getItem('pravah_token');
    if (currentToken) {
      const liveUser = await fetchUserProfile(currentToken);
      if (liveUser) {
        setUser(liveUser);
        localStorage.setItem('pravah_user', JSON.stringify(liveUser));
      }
    }
  };

  const logout = () => {
    const activeToken = token || localStorage.getItem('pravah_token');
    if (activeToken) {
      fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${activeToken}` }
      }).catch(() => {});
    }
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('pravah_token');
    localStorage.removeItem('pravah_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        selectedOffice,
        setSelectedOffice,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
