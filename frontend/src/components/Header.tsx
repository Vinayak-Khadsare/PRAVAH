'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { sampleAlerts } from '@/lib/mockData';
import { UserSession } from '@/lib/types';

export default function Header() {
  const router = useRouter();
  const { user, selectedOffice, setSelectedOffice, switchRole, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showAlertMenu, setShowAlertMenu] = useState(false);

  const offices = [
    'Northern Regional Office (NRO) - Kanpur',
    'Western Regional Office (WRO) - Mumbai',
    'Southern Regional Office (SRO) - Chennai',
    'Eastern Regional Office (ERO) - Kolkata',
    'North-Western Regional Office (NWRO) - Chandigarh',
    'Central Bureau / Member Secretary Desk',
  ];

  const roles: UserSession['role'][] = [
    'Member Secretary (RO Auth)',
    'Senior Scrutiny Officer',
    'Town Planning Officer',
    'EVC Convener',
    'Institution Admin',
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/applications?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const unreadAlerts = sampleAlerts.filter(a => !a.resolved);

  return (
    <header className="h-14 bg-white border-b border-brand-border sticky top-0 z-50 px-5 flex items-center justify-between shadow-xs">
      {/* Left Logo & Branding */}
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-sm bg-brand-forest-deep text-white font-bold flex items-center justify-center tracking-wider text-sm shadow-sm border border-brand-forest">
            PR
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-brand-forest uppercase group-hover:text-brand-copper transition-colors">
                PRAVAH
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm bg-brand-forest-light text-brand-forest border border-brand-forest/20">
                TIER-1 GOV
              </span>
            </div>
            <div className="text-[11px] text-brand-text-muted leading-none font-medium">
              AICTE Institutional Approval Operations Portal
            </div>
          </div>
        </Link>

        {/* Zonal Context Switcher */}
        <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-brand-border text-xs text-brand-text-muted">
          <span className="material-symbols-outlined text-[16px] text-brand-forest">account_balance</span>
          <span className="font-medium text-brand-text-primary">Jurisdiction:</span>
          <select
            value={selectedOffice}
            onChange={(e) => setSelectedOffice(e.target.value)}
            className="font-semibold text-brand-forest bg-transparent border-none cursor-pointer focus:outline-none pr-2 py-0.5"
          >
            {offices.map((office) => (
              <option key={office} value={office}>
                {office}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Search & Right Controls */}
      <div className="flex items-center gap-4">
        <form onSubmit={handleSearch} className="relative hidden md:block w-72">
          <span className="material-symbols-outlined absolute left-2.5 top-2 text-brand-text-muted text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search App ID, Institute, Pin..."
            className="w-full h-8 pl-8 pr-12 text-xs bg-brand-subtle border border-brand-border rounded-sm focus:bg-white focus:outline-none focus:border-brand-forest text-brand-text-primary placeholder:text-brand-text-muted/70"
          />
          <kbd className="absolute right-2 top-2 text-[10px] text-brand-text-muted font-mono px-1 border border-brand-border rounded bg-white">
            ⌘K
          </kbd>
        </form>

        {/* System Notifications & Profile */}
        <div className="flex items-center gap-2 border-l border-brand-border pl-3 relative">
          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => setShowAlertMenu(!showAlertMenu)}
              className="relative p-1.5 text-brand-text-muted hover:text-brand-text-primary hover:bg-brand-subtle rounded-sm transition-colors"
              title="Notifications"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              {unreadAlerts.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand-alert-red animate-pulse" />
              )}
            </button>

            {showAlertMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-brand-border rounded-lg shadow-glass-panel p-3 z-50 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-brand-border font-bold text-brand-forest">
                  <span>Regulatory Alerts ({unreadAlerts.length})</span>
                  <Link href="/alerts" className="text-brand-copper hover:underline text-[11px]" onClick={() => setShowAlertMenu(false)}>
                    View All
                  </Link>
                </div>
                <div className="divide-y divide-brand-border/60 max-h-60 overflow-y-auto">
                  {sampleAlerts.slice(0, 3).map((a) => (
                    <div key={a.id} className="py-2 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className={`font-semibold ${a.priority === 'critical' ? 'text-brand-alert-red' : 'text-brand-warning'}`}>
                          {a.title}
                        </span>
                        <span className="text-[10px] text-brand-text-muted font-mono">{a.timestamp.split(',')[1]}</span>
                      </div>
                      <p className="text-[11px] text-brand-text-muted line-clamp-2">{a.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Audit Trail Shortcut */}
          <Link
            href="/audit"
            className="p-1.5 text-brand-text-muted hover:text-brand-text-primary hover:bg-brand-subtle rounded-sm transition-colors"
            title="Audit Trail"
          >
            <span className="material-symbols-outlined text-[20px]">receipt_long</span>
          </Link>

          {/* User Profile & Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2.5 ml-2 pl-2 border-l border-brand-border text-left hover:bg-brand-subtle/60 p-1 rounded-sm transition-colors"
            >
              <div className="w-7 h-7 rounded-sm bg-brand-subtle border border-brand-border text-brand-forest font-semibold text-xs flex items-center justify-center">
                {user?.initials || 'RS'}
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-semibold leading-tight text-brand-text-primary flex items-center gap-1">
                  <span>{user?.name || 'Dr. R. K. Srivastava'}</span>
                  <span className="material-symbols-outlined text-[14px] text-brand-text-muted">arrow_drop_down</span>
                </div>
                <div className="text-[10px] text-brand-text-muted leading-tight">
                  {user?.role || 'Member Secretary (RO Auth)'}
                </div>
              </div>
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-brand-border rounded-lg shadow-glass-panel p-2 z-50 text-xs">
                <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-brand-text-muted border-b border-brand-border mb-1">
                  Switch Regulatory Persona
                </div>
                {roles.map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      switchRole(r);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded text-xs flex items-center justify-between hover:bg-brand-subtle transition-colors ${
                      user?.role === r ? 'font-bold text-brand-forest bg-brand-forest-light/60' : 'text-brand-text-primary'
                    }`}
                  >
                    <span>{r}</span>
                    {user?.role === r && (
                      <span className="material-symbols-outlined text-[16px] text-brand-forest">check</span>
                    )}
                  </button>
                ))}
                <div className="pt-2 mt-1 border-t border-brand-border">
                  <button
                    onClick={() => {
                      logout();
                      setShowRoleMenu(false);
                      router.push('/login');
                    }}
                    className="w-full text-left px-3 py-1.5 rounded text-xs text-brand-alert-red hover:bg-brand-alert-bg font-semibold flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">logout</span>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
