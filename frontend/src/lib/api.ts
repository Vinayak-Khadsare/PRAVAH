import { ApplicationRecord, EvcScheduleRecord, ComplianceTrackingRecord, AlertNotification, AuditLogEvent } from './types';
import { sampleApplications, sampleEvcSchedules, sampleComplianceRecords, sampleAlerts, dashboardMetrics } from './mockData';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

function getAuthHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('pravah_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
}

export const pravahApi = {
  async getMetrics() {
    try {
      const res = await fetch(`${API_BASE_URL}/workflow/metrics`, {
        headers: getAuthHeaders(),
        cache: 'no-store'
      });
      if (res.ok) return await res.json();
    } catch {
      // Backend connectivity fallback
    }
    return dashboardMetrics;
  },

  async getApplications(filterZone?: string, search?: string, status?: string): Promise<ApplicationRecord[]> {
    try {
      const params = new URLSearchParams();
      if (filterZone && filterZone !== 'All') params.append('zone', filterZone);
      if (search) params.append('q', search);
      if (status && status !== 'all') params.append('status', status);

      const res = await fetch(`${API_BASE_URL}/applications?${params.toString()}`, {
        headers: getAuthHeaders(),
        cache: 'no-store'
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback only if backend offline
    }

    let results = [...sampleApplications];
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
      const res = await fetch(`${API_BASE_URL}/applications/${id}`, {
        headers: getAuthHeaders(),
        cache: 'no-store'
      });
      if (res.ok) {
        return await res.json();
      }
      if (res.status === 404) {
        return null;
      }
    } catch {
      // Offline fallback
    }
    const found = sampleApplications.find(a => a.id === id || a.pid === id);
    return found || null;
  },

  async recordObservation(appId: string, observation: string, officerName: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/applications/${appId}/observations`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ observation, officerName })
      });
      if (res.ok) return await res.json();
    } catch {
      // Offline
    }

    const newLog: AuditLogEvent = {
      id: `log-${Date.now()}`,
      title: 'Scrutiny Officer Observation Recorded',
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
      description: observation,
      actor: `${officerName} | Manual Scrutiny Entry`,
      type: 'action',
    };
    return { success: true, event: newLog };
  },

  async grantGraceNotice(appId: string, hours: number = 48) {
    try {
      const res = await fetch(`${API_BASE_URL}/applications/${appId}/grace-notice`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ hours, reason: `Statutory ${hours}-Hour Extension` })
      });
      if (res.ok) return await res.json();
    } catch {
      // Offline
    }
    return { success: true, message: `${hours}-hour grace window recorded.` };
  },

  async issueDeficiencyFormB(appId: string, reason: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/applications/${appId}/deficiency-form-b`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason })
      });
      if (res.ok) return await res.json();
    } catch {
      // Offline
    }
    return { success: true };
  },

  async escalateToSac(appId: string, reason: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/applications/${appId}/escalate-sac`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason })
      });
      if (res.ok) return await res.json();
    } catch {
      // Offline
    }
    return { success: true };
  },

  async acceptRectification(appId: string, defRefCode: string, rectificationDetails: string = "Sub-Registrar verified stamp submitted") {
    try {
      const res = await fetch(`${API_BASE_URL}/applications/${appId}/rectifications`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ deficiencyRefCode: defRefCode, rectificationDetails })
      });
      if (res.ok) return await res.json();
    } catch {
      // Offline
    }
    return { success: true };
  },

  async recommendForEvc(appId: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/applications/${appId}/recommend-evc`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({})
      });
      if (res.ok) return await res.json();
    } catch {
      // Offline
    }
    return { success: true };
  },

  async simulateScenario(appId: string, action: string, parameterValue?: number) {
    try {
      const res = await fetch(`${API_BASE_URL}/workflow/simulate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ applicationId: appId, action, parameterValue })
      });
      if (res.ok) return await res.json();
    } catch {
      // Offline
    }
    return null;
  },

  async getEvcSchedules(): Promise<EvcScheduleRecord[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/evc`, {
        headers: getAuthHeaders(),
        cache: 'no-store'
      });
      if (res.ok) return await res.json();
    } catch {
      // Offline
    }
    return sampleEvcSchedules;
  },

  async dispatchEvc(evcId: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/evc/${evcId}/dispatch`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (res.ok) return await res.json();
    } catch {
      // Offline
    }
    return { success: true, message: `Dispatched token for ${evcId}` };
  },

  async getComplianceRecords(): Promise<ComplianceTrackingRecord[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/compliance`, {
        headers: getAuthHeaders(),
        cache: 'no-store'
      });
      if (res.ok) return await res.json();
    } catch {
      // Offline
    }
    return sampleComplianceRecords;
  },

  async getAlerts(): Promise<AlertNotification[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/alerts`, {
        headers: getAuthHeaders(),
        cache: 'no-store'
      });
      if (res.ok) return await res.json();
    } catch {
      // Offline
    }
    return sampleAlerts;
  },

  async acknowledgeAlert(alertId: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/alerts/${alertId}/acknowledge`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (res.ok) return await res.json();
    } catch {
      // Offline
    }
    return { success: true };
  },

  async getAuditLogs(appId?: string): Promise<AuditLogEvent[]> {
    try {
      const url = appId ? `${API_BASE_URL}/audit?app_id=${appId}` : `${API_BASE_URL}/audit`;
      const res = await fetch(url, {
        headers: getAuthHeaders(),
        cache: 'no-store'
      });
      if (res.ok) return await res.json();
    } catch {
      // Offline
    }
    const allLogs: AuditLogEvent[] = [];
    sampleApplications.forEach(app => {
      allLogs.push(...app.auditLog);
    });
    return allLogs;
  },
};
