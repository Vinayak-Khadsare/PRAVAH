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

export interface ApiActionResult {
  success: boolean;
  message?: string;
  error?: string;
  [key: string]: any;
}

export const pravahApi = {
  async getMetrics() {
    try {
      const res = await fetch(`${API_BASE_URL}/workflow/metrics`, {
        headers: getAuthHeaders(),
        cache: 'no-store'
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend unavailable, using demonstration metrics baseline:', e);
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
    } catch (e) {
      console.warn('Backend unavailable, using demonstration applications baseline:', e);
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
    } catch (e) {
      console.warn(`Backend unavailable for application '${id}', checking demonstration data:`, e);
    }
    const found = sampleApplications.find(a => a.id === id || a.pid === id);
    return found || null;
  },

  async recordObservation(appId: string, observation: string, officerName: string): Promise<ApiActionResult> {
    try {
      const res = await fetch(`${API_BASE_URL}/applications/${appId}/observations`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ observation, officerName })
      });
      if (res.ok) {
        return await res.json();
      }
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        error: errData.detail || `Server returned status ${res.status}`
      };
    } catch (e: any) {
      return {
        success: false,
        error: e.message || 'Network connection to backend failed.'
      };
    }
  },

  async grantGraceNotice(appId: string, hours: number = 48): Promise<ApiActionResult> {
    try {
      const res = await fetch(`${API_BASE_URL}/applications/${appId}/grace-notice`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ hours, reason: `Statutory ${hours}-Hour Extension` })
      });
      if (res.ok) {
        return await res.json();
      }
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        error: errData.detail || `Server returned status ${res.status}`
      };
    } catch (e: any) {
      return {
        success: false,
        error: e.message || 'Network connection to backend failed.'
      };
    }
  },

  async issueDeficiencyFormB(appId: string, reason: string): Promise<ApiActionResult> {
    try {
      const res = await fetch(`${API_BASE_URL}/applications/${appId}/deficiency-form-b`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason })
      });
      if (res.ok) {
        return await res.json();
      }
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        error: errData.detail || `Server returned status ${res.status}`
      };
    } catch (e: any) {
      return {
        success: false,
        error: e.message || 'Network connection to backend failed.'
      };
    }
  },

  async escalateToSac(appId: string, reason: string): Promise<ApiActionResult> {
    try {
      const res = await fetch(`${API_BASE_URL}/applications/${appId}/escalate-sac`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason })
      });
      if (res.ok) {
        return await res.json();
      }
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        error: errData.detail || `Server returned status ${res.status}`
      };
    } catch (e: any) {
      return {
        success: false,
        error: e.message || 'Network connection to backend failed.'
      };
    }
  },

  async acceptRectification(appId: string, defRefCode: string, rectificationDetails: string = "Sub-Registrar verified stamp submitted"): Promise<ApiActionResult> {
    try {
      const res = await fetch(`${API_BASE_URL}/applications/${appId}/rectifications`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ deficiencyRefCode: defRefCode, rectificationDetails })
      });
      if (res.ok) {
        return await res.json();
      }
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        error: errData.detail || `Server returned status ${res.status}`
      };
    } catch (e: any) {
      return {
        success: false,
        error: e.message || 'Network connection to backend failed.'
      };
    }
  },

  async recommendForEvc(appId: string): Promise<ApiActionResult> {
    try {
      const res = await fetch(`${API_BASE_URL}/applications/${appId}/recommend-evc`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({})
      });
      if (res.ok) {
        return await res.json();
      }
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        error: errData.detail || `Server returned status ${res.status}`
      };
    } catch (e: any) {
      return {
        success: false,
        error: e.message || 'Network connection to backend failed.'
      };
    }
  },

  async simulateScenario(appId: string, action: string, parameterValue?: number) {
    try {
      const res = await fetch(`${API_BASE_URL}/workflow/simulate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ applicationId: appId, action, parameterValue })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Simulation request failed:', e);
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
    } catch (e) {
      console.warn('Backend unavailable, using demonstration EVC schedule baseline:', e);
    }
    return sampleEvcSchedules;
  },

  async dispatchEvc(evcId: string): Promise<ApiActionResult> {
    try {
      const res = await fetch(`${API_BASE_URL}/evc/${evcId}/dispatch`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (res.ok) return await res.json();
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        error: errData.detail || `Server returned status ${res.status}`
      };
    } catch (e: any) {
      return {
        success: false,
        error: e.message || 'Network connection to backend failed.'
      };
    }
  },

  async getComplianceRecords(): Promise<ComplianceTrackingRecord[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/compliance`, {
        headers: getAuthHeaders(),
        cache: 'no-store'
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend unavailable, using demonstration compliance baseline:', e);
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
    } catch (e) {
      console.warn('Backend unavailable, using demonstration alerts baseline:', e);
    }
    return sampleAlerts;
  },

  async acknowledgeAlert(alertId: string): Promise<ApiActionResult> {
    try {
      const res = await fetch(`${API_BASE_URL}/alerts/${alertId}/acknowledge`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (res.ok) return await res.json();
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        error: errData.detail || `Server returned status ${res.status}`
      };
    } catch (e: any) {
      return {
        success: false,
        error: e.message || 'Network connection to backend failed.'
      };
    }
  },

  async getAuditLogs(appId?: string): Promise<AuditLogEvent[]> {
    try {
      const url = appId ? `${API_BASE_URL}/audit?app_id=${appId}` : `${API_BASE_URL}/audit`;
      const res = await fetch(url, {
        headers: getAuthHeaders(),
        cache: 'no-store'
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend unavailable, using demonstration audit logs baseline:', e);
    }
    const allLogs: AuditLogEvent[] = [];
    sampleApplications.forEach(app => {
      allLogs.push(...app.auditLog);
    });
    return allLogs;
  },
};
