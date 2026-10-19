import { ApplicationRecord, EvcScheduleRecord, ComplianceTrackingRecord, AlertNotification, AuditLogEvent } from './types';
import { sampleApplications, sampleEvcSchedules, sampleComplianceRecords, sampleAlerts, dashboardMetrics } from './mockData';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// In-browser mock storage fallback for resilient demo execution
let localApplications: ApplicationRecord[] = [...sampleApplications];
let localAlerts: AlertNotification[] = [...sampleAlerts];
let localEvc: EvcScheduleRecord[] = [...sampleEvcSchedules];
let localCompliance: ComplianceTrackingRecord[] = [...sampleComplianceRecords];

export const pravahApi = {
  async getMetrics() {
    try {
      const res = await fetch(`${API_BASE_URL}/metrics`, { cache: 'no-store' });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return dashboardMetrics;
  },

  async getApplications(filterZone?: string, search?: string, status?: string): Promise<ApplicationRecord[]> {
    try {
      const params = new URLSearchParams();
      if (filterZone) params.append('zone', filterZone);
      if (search) params.append('q', search);
      if (status) params.append('status', status);

      const res = await fetch(`${API_BASE_URL}/applications?${params.toString()}`, { cache: 'no-store' });
      if (res.ok) return await res.json();
    } catch {
      // fallback to mock
    }

    let results = [...localApplications];
    if (filterZone && filterZone !== 'All') {
      results = results.filter(a => a.regionalOffice.includes(filterZone));
    }
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(a =>
        a.id.toLowerCase().includes(q) ||
        a.pid.toLowerCase().includes(q) ||
        a.institutionName.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q)
      );
    }
    if (status && status !== 'all') {
      results = results.filter(a => a.status === status);
    }
    return results;
  },

  async getApplicationById(id: string): Promise<ApplicationRecord | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/applications/${id}`, { cache: 'no-store' });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    const found = localApplications.find(a => a.id === id || a.pid === id);
    return found || sampleApplications[0];
  },

  async recordObservation(appId: string, observation: string, officerName: string) {
    const newLog: AuditLogEvent = {
      id: `log-${Date.now()}`,
      title: 'Scrutiny Officer Observation Recorded',
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
      description: observation,
      actor: `${officerName} | Manual Scrutiny Entry`,
      type: 'action',
    };

    const app = localApplications.find(a => a.id === appId);
    if (app) {
      app.auditLog.unshift(newLog);
    }
    return { success: true, log: newLog };
  },

  async grantGraceNotice(appId: string, hours: number = 48) {
    const app = localApplications.find(a => a.id === appId);
    if (app) {
      const newLog: AuditLogEvent = {
        id: `log-${Date.now()}`,
        title: `Statutory ${hours}-Hour Cure Extension Granted`,
        timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
        description: `Member Secretary invoked delegated regulatory prerogative granting ${hours} hours extension to clear Land Encumbrance seals.`,
        actor: 'Dr. R. K. Srivastava (Member Secretary - RO Auth)',
        type: 'decision',
        sha256: '99AC712B00E4F9',
      };
      app.auditLog.unshift(newLog);
      if (app.criticalBlocker) {
        app.criticalBlocker.question2_whyBlocked += ` [Grace notice active: ${hours}h cure window granted]`;
      }
    }
    return { success: true, message: `${hours}-hour grace window recorded and audit logged.` };
  },

  async issueDeficiencyFormB(appId: string, reason: string) {
    const app = localApplications.find(a => a.id === appId);
    if (app) {
      app.status = 'deficiency_issued';
      app.currentStageNumber = 3;
      app.currentStageLabel = 'Stage 03 (Re-Scrutiny & Cure)';
      const newLog: AuditLogEvent = {
        id: `log-${Date.now()}`,
        title: 'Form-B Formal Regulatory Deficiency Issued',
        timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
        description: `Deficiency notice served to institution: ${reason}. Mandatory 7-day cure window triggered.`,
        actor: 'Dr. P. K. Verma (Senior Scrutiny Officer)',
        type: 'action',
      };
      app.auditLog.unshift(newLog);
    }
    return { success: true };
  },

  async escalateToSac(appId: string, reason: string) {
    const app = localApplications.find(a => a.id === appId);
    if (app) {
      app.status = 'sac_escalated';
      app.currentStageNumber = 5;
      app.currentStageLabel = 'Stage 05 (Standing Hearing / SAC)';
      const newLog: AuditLogEvent = {
        id: `log-${Date.now()}`,
        title: 'Escalated to Standing Appeals Committee (SAC)',
        timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
        description: `Case referred to appellate committee: ${reason}. Dossier transferred to National Appeals Registry.`,
        actor: 'Dr. R. K. Srivastava (Member Secretary - RO Auth)',
        type: 'decision',
        sha256: 'FA7180B992CD01',
      };
      app.auditLog.unshift(newLog);
    }
    return { success: true };
  },

  async acceptRectification(appId: string, defId: string) {
    const app = localApplications.find(a => a.id === appId);
    if (app) {
      const def = app.deficiencies.find(d => d.id === defId);
      if (def) {
        def.status = 'compliant';
        def.isCritical = false;
      }
      const newLog: AuditLogEvent = {
        id: `log-${Date.now()}`,
        title: 'Rectification Verified & Approved',
        timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
        description: `Scrutiny officer verified Sub-Registrar stamp clearance. Blocker condition resolved.`,
        actor: 'Dr. P. K. Verma (Senior Scrutiny Officer)',
        type: 'action',
      };
      app.auditLog.unshift(newLog);

      // Check if all critical blockers are resolved
      const hasCritical = app.deficiencies.some(d => d.isCritical && d.status === 'deficient');
      if (!hasCritical) {
        app.criticalBlocker = undefined;
        app.status = 'in_scrutiny';
      }
    }
    return { success: true };
  },

  async recommendForEvc(appId: string) {
    const app = localApplications.find(a => a.id === appId);
    if (app) {
      app.currentStageNumber = 4;
      app.currentStageLabel = 'Stage 04 (EVC Inspection)';
      app.status = 'evc_scheduled';
      const newLog: AuditLogEvent = {
        id: `log-${Date.now()}`,
        title: 'Recommended for Expert Visit Committee (EVC)',
        timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
        description: 'Scrutiny requirements fulfilled. Inspection team dispatch unlocked.',
        actor: 'Dr. P. K. Verma (Senior Scrutiny Officer)',
        type: 'decision',
      };
      app.auditLog.unshift(newLog);
    }
    return { success: true };
  },

  async getEvcSchedules(): Promise<EvcScheduleRecord[]> {
    return localEvc;
  },

  async getComplianceRecords(): Promise<ComplianceTrackingRecord[]> {
    return localCompliance;
  },

  async getAlerts(): Promise<AlertNotification[]> {
    return localAlerts;
  },

  async acknowledgeAlert(alertId: string) {
    const a = localAlerts.find(item => item.id === alertId);
    if (a) {
      a.resolved = true;
    }
    return { success: true };
  },

  async getAuditLogs(): Promise<AuditLogEvent[]> {
    const allLogs: AuditLogEvent[] = [];
    localApplications.forEach(app => {
      allLogs.push(...app.auditLog);
    });
    return allLogs;
  },
};
