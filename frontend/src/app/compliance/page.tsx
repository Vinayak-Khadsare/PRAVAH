'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { pravahApi } from '@/lib/api';
import { ComplianceTrackingRecord } from '@/lib/types';

export default function ComplianceTrackingPage() {
  const [records, setRecords] = useState<ComplianceTrackingRecord[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    pravahApi.getComplianceRecords().then(setRecords);
  }, []);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
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
                <span className="material-symbols-outlined text-[16px] text-brand-forest">gavel</span>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-brand-forest-light text-brand-forest border border-brand-forest/20">
                  STATUTORY VALIDITY MONITOR
                </span>
              </div>
              <h1 className="text-2xl font-bold text-brand-forest tracking-tight mt-1">
                Institutional Compliance & Undertakings Registry
              </h1>
              <p className="text-xs text-brand-text-muted mt-0.5">
                Surveillance of 30-year registered land lease deeds, fire NOC validity, cadre ratios, and mandatory bank FDR pledges.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-3 py-1.5 rounded bg-brand-forest-light text-brand-forest border border-brand-forest/20">
                94.2% National Compliance Index
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-brand-border shadow-xs overflow-hidden">
            <div className="p-4 border-b border-brand-border flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-brand-forest">Prescribed Statutory Compliance Obligations</h3>
                <p className="text-xs text-brand-text-muted">Automated expiration detection and early-cure escalation per APH 2026 regulations</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-brand-subtle text-brand-text-muted uppercase text-[10px] tracking-wider border-b border-brand-border">
                  <tr>
                    <th className="py-3 px-4 font-bold">Record ID</th>
                    <th className="py-3 px-4 font-bold">Institution Name</th>
                    <th className="py-3 px-4 font-bold">Subject / Statutory Obligation</th>
                    <th className="py-3 px-4 font-bold">Category</th>
                    <th className="py-3 px-4 font-bold">Validity Expiry</th>
                    <th className="py-3 px-4 font-bold">Status</th>
                    <th className="py-3 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/60">
                  {records.map((r) => (
                    <tr key={r.id} className="hover:bg-brand-subtle/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-brand-forest">
                        {r.id}
                        <div className="text-[10px] text-brand-text-muted font-mono">{r.refNumber}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-brand-text-primary">
                          <Link href={`/applications/${r.applicationId}`} className="hover:text-brand-forest hover:underline">
                            {r.institutionName}
                          </Link>
                        </div>
                        <div className="text-[10px] text-brand-text-muted font-mono">{r.applicationId}</div>
                      </td>
                      <td className="py-3.5 px-4 font-medium max-w-xs">{r.subject}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-[11px] bg-brand-subtle px-1.5 py-0.5 rounded border border-brand-border font-medium">
                          {r.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        <span className={`font-semibold ${r.daysRemaining < 0 ? 'text-brand-alert-red font-bold' : 'text-brand-text-primary'}`}>
                          {r.validityExpiry}
                        </span>
                        {r.daysRemaining < 0 && (
                          <div className="text-[10px] text-brand-alert-red font-bold">ELAPSED (-{Math.abs(r.daysRemaining)}d)</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded border ${
                          r.status === 'Compliant' ? 'bg-brand-forest-light text-brand-forest border-brand-forest/20' :
                          r.status === 'Critical Overdue' ? 'bg-brand-alert-bg text-brand-alert-red border-brand-alert-red/30' :
                          'bg-brand-amber-bg text-brand-amber border-brand-amber/30'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => triggerToast(`Verification dossier initiated for ${r.refNumber}`)}
                          className="px-2.5 py-1 bg-white hover:bg-brand-subtle text-brand-forest font-semibold rounded border border-brand-border transition-colors text-xs cursor-pointer"
                        >
                          Verify Deed
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
