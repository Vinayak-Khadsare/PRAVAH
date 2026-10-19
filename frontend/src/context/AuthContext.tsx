'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSession } from '@/lib/types';

interface AuthContextType {
  user: UserSession | null;
  token: string | null;
  isAuthenticated: boolean;
  selectedOffice: string;
  setSelectedOffice: (office: string) => void;
  login: (email: string, pass: string, office: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserSession['role']) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [selectedOffice, setSelectedOffice] = useState<string>('Northern Regional Office (NRO) - Kanpur');

  useEffect(() => {
    // Check saved session in localStorage
    const savedToken = localStorage.getItem('pravah_token');
    const savedUser = localStorage.getItem('pravah_user');

    if (savedToken && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setToken(savedToken);
        setIsAuthenticated(true);
        if (parsed.regionalOffice) setSelectedOffice(parsed.regionalOffice);

        // Verify token with backend /auth/me
        fetch(`${API_BASE_URL}/auth/me`, {
          headers: { 'Authorization': `Bearer ${savedToken}` }
        }).then(res => {
          if (!res.ok) {
            // Expired or tampered token: clean up
            localStorage.removeItem('pravah_token');
            localStorage.removeItem('pravah_user');
            setUser(null);
            setToken(null);
            setIsAuthenticated(false);
          }
        }).catch(() => {
          // Keep session if backend is temporarily unreachable
        });
      } catch {
        localStorage.removeItem('pravah_token');
        localStorage.removeItem('pravah_user');
      }
    }
  }, []);

  const login = async (email: string, pass: string, office: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass, office })
      });

      if (!res.ok) {
        return false;
      }

      const data = await res.json();
      const sessionUser: UserSession = {
        userId: data.user.email,
        name: data.user.name,
        role: data.user.role === 'regional_officer' ? 'Member Secretary (RO Auth)' :
              data.user.role === 'scrutiny_officer' ? 'Senior Scrutiny Officer' :
              data.user.role === 'institution_rep' ? 'Institution Admin' :
              data.user.role === 'evc_member' ? 'EVC Convener' :
              data.user.role === 'auditor' ? 'CAG Regulatory Auditor' : 'Member Secretary (RO Auth)',
        regionalOffice: data.user.regionalOffice || office,
        initials: data.user.initials,
      };

      setUser(sessionUser);
      setToken(data.access_token);
      setIsAuthenticated(true);
      setSelectedOffice(office);

      localStorage.setItem('pravah_token', data.access_token);
      localStorage.setItem('pravah_user', JSON.stringify(sessionUser));
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    if (token) {
      fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(() => {});
    }
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('pravah_token');
    localStorage.removeItem('pravah_user');
  };

  const switchRole = (role: UserSession['role']) => {
    if (!user) return;
    const updated: UserSession = {
      ...user,
      role,
      name: role === 'Senior Scrutiny Officer' ? 'Dr. P. K. Verma' :
            role === 'Town Planning Officer' ? 'Er. M. Joshi' :
            role === 'EVC Convener' ? 'Prof. S. Sen' :
            role === 'Institution Admin' ? 'Dr. Arvind Sharma' : 'Dr. R. K. Srivastava',
      initials: role === 'Senior Scrutiny Officer' ? 'PV' :
                role === 'Town Planning Officer' ? 'MJ' :
                role === 'EVC Convener' ? 'SS' :
                role === 'Institution Admin' ? 'AS' : 'RS',
    };
    setUser(updated);
    localStorage.setItem('pravah_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        selectedOffice,
        setSelectedOffice,
        login,
        logout,
        switchRole,
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
