'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSession } from '@/lib/types';
import { currentUser } from '@/lib/mockData';

interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  selectedOffice: string;
  setSelectedOffice: (office: string) => void;
  login: (email: string, pass: string, office: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserSession['role']) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(currentUser);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [selectedOffice, setSelectedOffice] = useState<string>('Northern Regional Office (NRO) - Kanpur');

  useEffect(() => {
    // Check saved session in localStorage
    const saved = localStorage.getItem('pravah_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUser(parsed);
        setIsAuthenticated(true);
        if (parsed.regionalOffice) setSelectedOffice(parsed.regionalOffice);
      } catch {
        // ignore
      }
    }
  }, []);

  const login = async (email: string, _pass: string, office: string): Promise<boolean> => {
    const newUser: UserSession = {
      userId: email,
      name: email.includes('verma') ? 'Dr. P. K. Verma' : 'Dr. R. K. Srivastava',
      role: email.includes('verma') ? 'Senior Scrutiny Officer' : 'Member Secretary (RO Auth)',
      regionalOffice: office,
      initials: email.includes('verma') ? 'PV' : 'RS',
    };
    setUser(newUser);
    setIsAuthenticated(true);
    setSelectedOffice(office);
    localStorage.setItem('pravah_user', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
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
