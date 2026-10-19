'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const mainConsoleLinks = [
    {
      name: 'Executive Dashboard',
      href: '/dashboard',
      icon: 'dashboard',
    },
    {
      name: 'Applications Registry',
      href: '/applications',
      icon: 'folder_shared',
      badge: '1,428',
      badgeClass: 'bg-brand-tag-bg text-brand-text-muted',
    },
    {
      name: 'Approval Workflow',
      href: '/workflow',
      icon: 'fact_check',
    },
    {
      name: 'EVC Scheduling',
      href: '/evc',
      icon: 'event_available',
      badge: '64',
      badgeClass: 'bg-brand-amber-bg text-brand-amber border border-brand-amber/30',
    },
    {
      name: 'Institutional Compliance',
      href: '/compliance',
      icon: 'gavel',
    },
    {
      name: 'Document Registry',
      href: '/documents',
      icon: 'inventory_2',
    },
  ];

  const analyticsLinks = [
    {
      name: 'Alerts & Escalations',
      href: '/alerts',
      icon: 'notification_important',
      iconClass: 'text-brand-alert-red',
      badge: '4',
      badgeClass: 'bg-brand-alert-red text-white',
    },
    {
      name: 'Workflow Intelligence',
      href: '/workflow-intelligence',
      icon: 'hub',
    },
    {
      name: 'Reports & Analytics',
      href: '/reports',
      icon: 'analytics',
    },
    {
      name: 'Audit Trail & Logs',
      href: '/audit',
      icon: 'history',
    },
    {
      name: 'Administrative Config',
      href: '/settings',
      icon: 'admin_panel_settings',
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-brand-border shrink-0 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-3.5rem)]">
      <div className="p-3">
        {/* Main Console Group */}
        <div className="text-[10px] uppercase font-bold tracking-wider text-brand-text-muted px-2 mb-2">
          Main Console
        </div>
        <nav className="space-y-0.5">
          {mainConsoleLinks.map((item) => {
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
                  <span className={`ml-auto text-[10px] px-1.5 py-0.2 rounded font-bold ${item.badgeClass}`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Oversight & Analytics Group */}
        <div className="text-[10px] uppercase font-bold tracking-wider text-brand-text-muted px-2 mt-6 mb-2">
          Oversight & Analytics
        </div>
        <nav className="space-y-0.5">
          {analyticsLinks.map((item) => {
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
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${item.badgeClass}`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer Protocol Card */}
      <div className="p-3 border-t border-brand-border bg-brand-subtle/60 text-xs m-2 rounded-sm border">
        <div className="flex items-center gap-1.5 text-brand-forest font-semibold mb-1">
          <span className="material-symbols-outlined text-[16px]">verified_user</span>
          <span>Statutory SLA Protocol</span>
        </div>
        <p className="text-[11px] text-brand-text-muted leading-tight">
          Strict 15-day scrutinization ceiling enforceable per AICTE Regulations 2026.
        </p>
      </div>
    </aside>
  );
}
