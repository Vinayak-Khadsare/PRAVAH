'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { isRouteAllowed } from '@/lib/permissions';

const PUBLIC_ROUTES = ['/', '/login', '/register'];

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isPublicRoute) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, isPublicRoute, router]);

  // Public route: render immediately
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Session verification loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-ivory flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-12 h-12 rounded-xl bg-brand-forest text-white font-bold flex items-center justify-center text-base shadow-md animate-pulse">
          PR
        </div>
        <div className="text-center space-y-1">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-brand-forest">
            PRAVAH Portal Session
          </div>
          <div className="text-[11px] text-brand-text-muted">
            Verifying cryptographic credentials and regulatory jurisdiction...
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated: wait for redirect
  if (!isAuthenticated || !user) {
    return null;
  }

  // Check role authorization for current path
  const allowed = isRouteAllowed(pathname, user.role);

  if (!allowed) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-brand-ivory flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white border border-brand-border rounded-xl shadow-glass-panel p-8 text-center space-y-5 animate-fadeIn">
          <div className="w-14 h-14 rounded-full bg-brand-alert-bg border border-brand-alert-red/20 text-brand-alert-red flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-[32px]">shield_lock</span>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-brand-alert-bg text-[10px] font-mono font-bold text-brand-alert-red uppercase">
              Statutory Access Prohibited • 403 Forbidden
            </div>
            <h3 className="text-xl font-bold text-brand-charcoal">
              Jurisdiction Access Restricted
            </h3>
            <p className="text-xs text-brand-charcoal/70 leading-relaxed">
              Your active credential <strong className="text-brand-charcoal">{user.name}</strong> with role{' '}
              <span className="px-1.5 py-0.5 rounded font-mono font-bold bg-brand-tag-bg text-brand-forest border border-brand-forest/20">
                {user.roleDisplay || user.role}
              </span>{' '}
              is not authorized to access the module <code className="font-mono text-brand-copper bg-brand-subtle px-1 rounded">{pathname}</code> under the AICTE Approval Process Handbook (APH 2026-2027) regulatory policy.
            </p>
          </div>

          <div className="p-3 bg-brand-subtle rounded border border-brand-border text-left text-[11px] text-brand-text-muted space-y-1">
            <div className="font-semibold text-brand-forest flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">policy</span>
              <span>Statutory Rule Reference</span>
            </div>
            <p>
              AICTE Act 1987 Section 10(k): Directorate modules are partitioned according to institutional and regulatory jurisdiction. Unauthorized parameter tampering is strictly logged in the immutable audit trail.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-brand-forest hover:bg-brand-forest-dark text-white text-xs font-bold rounded shadow-xs transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Return to My Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
