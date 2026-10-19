'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { pravahApi } from '@/lib/api';
import { AlertNotification } from '@/lib/types';

export default function AlertsEscalationsPage() {
  const [alerts, setAlerts] = useState<AlertNotification[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    pravahApi.getAlerts().then(setAlerts);
  }, []);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleAcknowledge = async (id: string) => {
    await pravahApi.acknowledgeAlert(id);
    const updated = await pravahApi.getAlerts();
    setAlerts([...updated]);
    triggerToast(`Alert ${id} acknowledged and audit logged.`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-ivory text-brand-text-primary selection:bg-brand-forest selection:text-white">
      <Header />
      <div className="flex-1 flex w-full">
        <Sidebar />

        <main className="flex-1 min-w-0 p-5 md:p-6 lg:p-7 space-y-5">
          {toast && (
            <div className="bg-brand-forest-deep text-white px-4 py-2.5 rounded shadow-lg text-xs flex items-center justify-between border border-brand-copper animate-fadeIn">
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-brand-copper-light text-[18px]">verified</span>
                {toast}
              </span>
              <button onClick={() => setToast(null)} className="text-white/60 hover:text-white">✕</button>
            </div>
          )}

          <div className="bg-white p-5 rounded-lg border border-brand-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-brand-alert-red">notification_important</span>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-brand-alert-bg text-brand-alert-red border border-brand-alert-red/30">
                  STATUTORY ESCALATION ENGINE
                </span>
              </div>
              <h1 className="text-2xl font-bold text-brand-forest tracking-tight mt-1">
                Alerts, Reminders & Overdue Escalations
              </h1>
              <p className="text-xs text-brand-text-muted mt-0.5">
                Automated regulatory flags raised by Pravah background monitoring for impending SLA violations and prerequisite stalls.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-3 py-1.5 rounded bg-brand-alert-bg text-brand-alert-red border border-brand-alert-red/30">
                {alerts.filter(a => !a.resolved).length} Pending Interventions
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {alerts.map((a) => (
              <div
                key={a.id}
                className={`bg-white p-5 rounded-lg border transition-all shadow-xs flex flex-col md:flex-row md:items-start justify-between gap-4 ${
                  !a.resolved && a.priority === 'critical'
                    ? 'border-l-4 border-l-brand-alert-red'
                    : 'border-brand-border'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-9 h-9 rounded flex items-center justify-center shrink-0 mt-0.5 ${
                      a.priority === 'critical'
                        ? 'bg-brand-alert-bg text-brand-alert-red border border-brand-alert-red/30'
                        : a.priority === 'warning'
                        ? 'bg-brand-amber-bg text-brand-amber border border-brand-amber/30'
                        : 'bg-brand-subtle text-brand-forest border border-brand-border'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {a.priority === 'critical' ? 'error' : a.priority === 'warning' ? 'warning' : 'info'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-brand-forest">{a.title}</span>
                      <span className="font-mono text-[10px] bg-brand-subtle px-1.5 py-0.2 rounded border border-brand-border">
                        {a.id}
                      </span>
                      <span
                        className={`font-mono text-[9px] font-bold uppercase px-1.5 py-0.2 rounded border ${
                          a.priority === 'critical'
                            ? 'bg-brand-alert-bg text-brand-alert-red border-brand-alert-red/30'
                            : 'bg-brand-amber-bg text-brand-amber border-brand-amber/30'
                        }`}
                      >
                        {a.category}
                      </span>
                    </div>

                    <p className="text-xs text-brand-text-muted leading-relaxed max-w-2xl">{a.message}</p>

                    <div className="text-[11px] text-brand-text-muted flex items-center gap-3 pt-1 font-mono">
                      <span>{a.timestamp}</span>
                      <span>•</span>
                      <Link href={`/applications/${a.applicationId}`} className="text-brand-forest hover:underline font-bold">
                        {a.institutionName} ({a.applicationId})
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <Link
                    href={`/applications/${a.applicationId}`}
                    className="px-3 py-1.5 bg-brand-subtle hover:bg-brand-border text-brand-forest text-xs font-semibold rounded border border-brand-border transition-colors inline-flex items-center gap-1"
                  >
                    <span>Examine Dossier</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </Link>
                  {!a.resolved ? (
                    <button
                      onClick={() => handleAcknowledge(a.id)}
                      className="px-3 py-1.5 bg-brand-forest hover:bg-brand-forest-hover text-white text-xs font-bold rounded shadow-xs transition-colors cursor-pointer"
                    >
                      Acknowledge
                    </button>
                  ) : (
                    <span className="text-xs font-mono text-brand-success font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      Resolved
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
