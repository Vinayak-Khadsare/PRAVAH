'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getSidebarNavigation } from '@/lib/permissions';

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const { mainConsole, oversight } = getSidebarNavigation(user?.role);

  return (
    <aside className="w-64 bg-white border-r border-brand-border shrink-0 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-3.5rem)]">
      <div className="p-3">
        {/* Main Console Group */}
        <div className="text-[10px] uppercase font-bold tracking-wider text-brand-text-muted px-2 mb-2">
          {user?.role === 'institution_rep' ? 'Institutional Console' : 'Main Console'}
        </div>
        <nav className="space-y-0.5">
          {mainConsole.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium rounded-sm transition-colors ${
                  isActive
                    ? 'bg-brand-forest-deep text-white font-semibold shadow-xs'
                    : 'text-brand-text-primary hover:bg-brand-subtle'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[18px] ${
                    isActive ? 'text-white' : 'text-brand-text-muted'
                  }`}
                >
                  {item.icon}
                </span>
                <span>{item.name}</span>
                {item.badge && (
                  <span className={`ml-auto text-[10px] px-1.5 py-0.2 rounded font-bold ${item.badgeClass || 'bg-brand-tag-bg text-brand-text-muted'}`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Oversight & Analytics Group */}
        {oversight.length > 0 && (
          <>
            <div className="text-[10px] uppercase font-bold tracking-wider text-brand-text-muted px-2 mt-6 mb-2">
              {user?.role === 'institution_rep' ? 'Statutory Notices' : 'Oversight & Governance'}
            </div>
            <nav className="space-y-0.5">
              {oversight.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center justify-between px-2.5 py-1.5 text-xs font-medium rounded-sm transition-colors ${
                      isActive
                        ? 'bg-brand-forest-deep text-white font-semibold shadow-xs'
                        : 'text-brand-text-primary hover:bg-brand-subtle'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`material-symbols-outlined text-[18px] ${
                          item.iconClass || (isActive ? 'text-white' : 'text-brand-text-muted')
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${item.badgeClass || 'bg-brand-tag-bg text-brand-text-muted'}`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </>
        )}
      </div>

      {/* Sidebar Footer Protocol Card */}
      <div className="p-3 border-t border-brand-border bg-brand-subtle/60 text-xs m-2 rounded-sm border">
        <div className="flex items-center gap-1.5 text-brand-forest font-semibold mb-1">
          <span className="material-symbols-outlined text-[16px]">verified_user</span>
          <span>
            {user?.role === 'institution_rep' ? 'Institutional Scope' : 'Statutory SLA Protocol'}
          </span>
        </div>
        <p className="text-[11px] text-brand-text-muted leading-tight">
          {user?.role === 'institution_rep'
            ? `Permanent Institute ID: ${user.institutionPid || 'Pending Assignment'}`
            : 'Strict 15-day scrutinization ceiling enforceable per AICTE Regulations 2026.'}
        </p>
      </div>
    </aside>
  );
}
