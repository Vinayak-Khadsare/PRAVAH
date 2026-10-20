import { CanonicalRole } from './types';

export interface NavLinkItem {
  name: string;
  href: string;
  icon: string;
  badge?: string;
  badgeClass?: string;
  iconClass?: string;
  allowedRoles: CanonicalRole[];
}

export const ALL_ROLES: CanonicalRole[] = [
  'super_admin',
  'aicte_admin',
  'regional_officer',
  'scrutiny_officer',
  'evc_member',
  'committee_member',
  'institution_rep',
  'auditor',
];

export const ROUTE_PERMISSIONS: Record<string, CanonicalRole[]> = {
  '/dashboard': ALL_ROLES,
  '/applications': ALL_ROLES,
  '/compliance': ['institution_rep', 'scrutiny_officer', 'regional_officer', 'auditor', 'aicte_admin', 'super_admin'],
  '/documents': ALL_ROLES,
  '/alerts': ['regional_officer', 'scrutiny_officer', 'aicte_admin', 'super_admin', 'institution_rep'],
  '/workflow': ['regional_officer', 'scrutiny_officer', 'committee_member', 'aicte_admin', 'super_admin'],
  '/workflow-intelligence': ['scrutiny_officer', 'regional_officer', 'committee_member', 'aicte_admin', 'super_admin'],
  '/evc': ['evc_member', 'regional_officer', 'aicte_admin', 'super_admin'],
  '/reports': ['regional_officer', 'committee_member', 'auditor', 'aicte_admin', 'super_admin'],
  '/audit': ['auditor', 'regional_officer', 'aicte_admin', 'super_admin'],
  '/settings': ['aicte_admin', 'super_admin'],
};

export function isRouteAllowed(pathname: string, role?: string): boolean {
  if (!role) return false;
  const canonical = role as CanonicalRole;
  if (canonical === 'super_admin') return true;

  // Find exact match or prefix match
  for (const [route, allowed] of Object.entries(ROUTE_PERMISSIONS)) {
    if (pathname === route || pathname.startsWith(route + '/')) {
      return allowed.includes(canonical);
    }
  }
  return true;
}

export function getSidebarNavigation(role?: string) {
  const canonical = (role as CanonicalRole) || 'regional_officer';

  // Customize labels based on role for institutional clarity
  const appLabel =
    canonical === 'institution_rep' ? 'My Applications' :
    canonical === 'scrutiny_officer' ? 'Scrutiny Queue' :
    canonical === 'committee_member' ? 'Committee Cases' :
    canonical === 'evc_member' ? 'Assigned Inspections' :
    canonical === 'auditor' ? 'Applications Registry (RO)' : 'Applications Registry';

  const complianceLabel =
    canonical === 'institution_rep' ? 'My Compliance Obligations' :
    canonical === 'scrutiny_officer' ? 'Compliance Review' : 'Institutional Compliance';

  const docLabel =
    canonical === 'institution_rep' ? 'My Dossier Documents' :
    canonical === 'scrutiny_officer' ? 'Document Verification' : 'Document Registry';

  const mainConsoleItems: NavLinkItem[] = [
    {
      name: canonical === 'auditor' ? 'Audit Overview Dashboard' : 'Executive Dashboard',
      href: '/dashboard',
      icon: 'dashboard',
      allowedRoles: ALL_ROLES,
    },
    {
      name: appLabel,
      href: '/applications',
      icon: 'folder_shared',
      badge: canonical === 'institution_rep' ? 'Active' : '1,428',
      badgeClass: 'bg-brand-tag-bg text-brand-text-muted',
      allowedRoles: ALL_ROLES,
    },
    {
      name: 'Approval Workflow',
      href: '/workflow',
      icon: 'fact_check',
      allowedRoles: ['regional_officer', 'scrutiny_officer', 'committee_member', 'aicte_admin', 'super_admin'],
    },
    {
      name: canonical === 'evc_member' ? 'My Inspection Rosters' : 'EVC Scheduling',
      href: '/evc',
      icon: 'event_available',
      badge: '64',
      badgeClass: 'bg-brand-amber-bg text-brand-amber border border-brand-amber/30',
      allowedRoles: ['evc_member', 'regional_officer', 'aicte_admin', 'super_admin'],
    },
    {
      name: complianceLabel,
      href: '/compliance',
      icon: 'gavel',
      allowedRoles: ['institution_rep', 'scrutiny_officer', 'regional_officer', 'auditor', 'aicte_admin', 'super_admin'],
    },
    {
      name: docLabel,
      href: '/documents',
      icon: 'inventory_2',
      allowedRoles: ALL_ROLES,
    },
  ];

  const oversightItems: NavLinkItem[] = [
    {
      name: 'Alerts & Escalations',
      href: '/alerts',
      icon: 'notification_important',
      iconClass: 'text-brand-alert-red',
      badge: '4',
      badgeClass: 'bg-brand-alert-red text-white',
      allowedRoles: ['regional_officer', 'scrutiny_officer', 'aicte_admin', 'super_admin', 'institution_rep'],
    },
    {
      name: 'Workflow Intelligence',
      href: '/workflow-intelligence',
      icon: 'hub',
      allowedRoles: ['scrutiny_officer', 'regional_officer', 'committee_member', 'aicte_admin', 'super_admin'],
    },
    {
      name: 'Reports & Analytics',
      href: '/reports',
      icon: 'analytics',
      allowedRoles: ['regional_officer', 'committee_member', 'auditor', 'aicte_admin', 'super_admin'],
    },
    {
      name: canonical === 'auditor' ? 'Audit Trail & Verification' : 'Audit Trail & Logs',
      href: '/audit',
      icon: 'history',
      allowedRoles: ['auditor', 'regional_officer', 'aicte_admin', 'super_admin'],
    },
    {
      name: canonical === 'super_admin' ? 'Administrative & User Governance' : 'Administrative Config',
      href: '/settings',
      icon: 'admin_panel_settings',
      allowedRoles: ['aicte_admin', 'super_admin'],
    },
  ];

  return {
    mainConsole: mainConsoleItems.filter(item => item.allowedRoles.includes(canonical)),
    oversight: oversightItems.filter(item => item.allowedRoles.includes(canonical)),
  };
}
