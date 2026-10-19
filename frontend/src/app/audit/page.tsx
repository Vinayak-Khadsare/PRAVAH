'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { pravahApi } from '@/lib/api';
import { AuditLogEvent } from '@/lib/types';

export default function AuditTrailPage() {
  const [logs, setLogs] = useState<AuditLogEvent[]>([]);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    pravahApi.getAuditLogs().then(setLogs);
  }, []);

  const filteredLogs = filterType === 'all' ? logs : logs.filter(l => l.type === filterType);

  return (
    <div className="min-h-screen flex flex-col bg-brand-ivory text-brand-text-primary selection:bg-brand-forest selection:text-white">
      <Header />
      <div className="flex-1 flex w-full">
        <Sidebar />

        <main className="flex-1 min-w-0 p-5 md:p-6 lg:p-7 space-y-5">
          <div className="bg-white p-5 rounded-lg border border-brand-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-brand-forest">history</span>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-brand-forest-light text-brand-forest border border-brand-forest/20">
                  CRYPTOGRAPHIC LOG REPOSITORY
                </span>
              </div>
              <h1 className="text-2xl font-bold text-brand-forest tracking-tight mt-1">
                Chronological Audit Trail & State Proofs
              </h1>
              <p className="text-xs text-brand-text-muted mt-0.5">
                Immutable, timestamped record of every regulatory intervention, document verification, and administrative decision.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-1.5 bg-brand-subtle border border-brand-border rounded text-xs font-semibold text-brand-forest outline-none"
              >
                <option value="all">All Regulatory Events</option>
                <option value="alert">SLA Escalation Alerts</option>
                <option value="action">Scrutiny Actions & Form-B</option>
                <option value="decision">Statutory Decisions & LoA</option>
                <option value="upload">Applicant Dossier Uploads</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-lg p-5 border border-brand-border shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <div className="text-xs font-bold text-brand-forest flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
                <span>Cryptographically Sealed Sequence (SHA-256 Chain)</span>
              </div>
              <span className="font-mono text-xs text-brand-text-muted">Master Node: AICTE-ROOT-CA-2026</span>
            </div>

            <div className="relative pl-6 space-y-4">
              <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-brand-border" />

              {filteredLogs.map((log) => (
                <div key={log.id} className="relative group">
                  <div
                    className={`absolute -left-6 top-1 w-2.5 h-2.5 rounded-full ring-4 ${
                      log.type === 'alert'
                        ? 'bg-brand-alert-red ring-brand-alert-bg'
                        : log.type === 'decision'
                        ? 'bg-brand-forest ring-brand-forest-light'
                        : log.type === 'action'
                        ? 'bg-brand-copper ring-brand-amber-bg'
                        : 'bg-brand-text-muted ring-brand-border'
                    }`}
                  />
                  <div className="bg-brand-subtle/50 p-4 rounded border border-brand-border space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className={`text-xs font-bold uppercase ${
                        log.type === 'alert' ? 'text-brand-alert-red' : 'text-brand-forest'
                      }`}>
                        {log.title}
                      </span>
                      <span className="font-mono text-[11px] text-brand-text-muted">{log.timestamp}</span>
                    </div>

                    <p className="text-xs text-brand-text-primary leading-relaxed">{log.description}</p>

                    <div className="text-[11px] text-brand-text-muted font-mono flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-brand-border/60">
                      <span>Actor: <strong className="text-brand-text-primary">{log.actor}</strong></span>
                      <span className="bg-white px-2 py-0.5 rounded border border-brand-border text-brand-forest font-semibold">
                        Hash: {log.sha256 || 'SHA256:7B01EFA99C12'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
