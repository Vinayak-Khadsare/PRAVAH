'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

export default function ReportsPage() {
  const [reportYear, setReportYear] = useState('AY 2026-2027');
  const [toast, setToast] = useState<string | null>(null);

  const regionalStats = [
    { zone: 'Northern Regional Office (NRO) - Kanpur', total: 412, completed: 320, inScrutiny: 78, overdue: 14, complianceRate: '92.4%' },
    { zone: 'Western Regional Office (WRO) - Mumbai', total: 388, completed: 340, inScrutiny: 42, overdue: 6, complianceRate: '96.1%' },
    { zone: 'Southern Regional Office (SRO) - Chennai', total: 340, completed: 312, inScrutiny: 25, overdue: 3, complianceRate: '97.2%' },
    { zone: 'Eastern Regional Office (ERO) - Kolkata', total: 168, completed: 132, inScrutiny: 30, overdue: 6, complianceRate: '91.8%' },
    { zone: 'North-Western Office (NWRO) - Chandigarh', total: 120, completed: 104, inScrutiny: 14, overdue: 2, complianceRate: '95.5%' },
  ];

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
                <span className="material-symbols-outlined text-[16px] text-brand-forest">analytics</span>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-brand-forest-light text-brand-forest border border-brand-forest/20">
                  STATUTORY COMPLIANCE REPORTS
                </span>
              </div>
              <h1 className="text-2xl font-bold text-brand-forest tracking-tight mt-1">
                Regional & Stage-Wise Reporting
              </h1>
              <p className="text-xs text-brand-text-muted mt-0.5">
                Official statutory audit summaries, SLA turnaround times, and national approval issuance analytics.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={reportYear}
                onChange={(e) => setReportYear(e.target.value)}
                className="px-3 py-1.5 bg-brand-subtle border border-brand-border rounded text-xs font-semibold text-brand-forest outline-none"
              >
                <option>AY 2026-2027 (Active Annual Cycle)</option>
                <option>AY 2025-2026 (Audited Prior Year)</option>
              </select>
              <button
                onClick={() => triggerToast('Generating Official Parliamentary AICTE Approval Report (PDF)')}
                className="px-3.5 py-1.5 bg-brand-forest hover:bg-brand-forest-hover text-white text-xs font-semibold rounded shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">file_download</span>
                <span>Export Official Report</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-brand-border shadow-xs overflow-hidden">
            <div className="p-4 border-b border-brand-border">
              <h3 className="text-sm font-bold text-brand-forest">Zonal Directorate Turnaround & SLA Compliance Matrix</h3>
              <p className="text-xs text-brand-text-muted">Calculated per 15-day maximum scrutinization ceiling</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-brand-subtle text-brand-text-muted uppercase text-[10px] tracking-wider border-b border-brand-border">
                  <tr>
                    <th className="py-3 px-4 font-bold">Regional Office Jurisdiction</th>
                    <th className="py-3 px-4 font-bold">Total Intake</th>
                    <th className="py-3 px-4 font-bold">Decided (LoA Issued)</th>
                    <th className="py-3 px-4 font-bold">Active in Scrutiny</th>
                    <th className="py-3 px-4 font-bold">Overdue Escalated</th>
                    <th className="py-3 px-4 font-bold">SLA Adherence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/60">
                  {regionalStats.map((r, i) => (
                    <tr key={i} className="hover:bg-brand-subtle/50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-brand-forest">{r.zone}</td>
                      <td className="py-3.5 px-4 font-mono font-semibold">{r.total}</td>
                      <td className="py-3.5 px-4 font-mono text-brand-forest font-semibold">{r.completed}</td>
                      <td className="py-3.5 px-4 font-mono text-brand-copper font-semibold">{r.inScrutiny}</td>
                      <td className="py-3.5 px-4 font-mono text-brand-alert-red font-bold">{r.overdue}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-brand-forest">{r.complianceRate}</td>
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
