'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { pravahApi } from '@/lib/api';
import { ApplicationRecord } from '@/lib/types';
import { dashboardMetrics } from '@/lib/mockData';

export default function DashboardPage() {
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [selectedZone, setSelectedZone] = useState('All');

  useEffect(() => {
    pravahApi.getApplications(selectedZone).then(setApplications);
  }, [selectedZone]);

  const overdueCases = applications.filter(a => a.slaStatus === 'overdue' || a.daysExpended > 15);

  return (
    <div className="min-h-screen flex flex-col bg-brand-ivory text-brand-text-primary selection:bg-brand-forest selection:text-white">
      <Header />
      <div className="flex-1 flex w-full">
        <Sidebar />

        <main className="flex-1 min-w-0 p-5 md:p-6 lg:p-7 space-y-6">
          {/* Executive Overview Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-brand-border shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-brand-forest-light text-brand-forest border border-brand-forest/20">
                  NATIONAL EXECUTIVE DESK
                </span>
                <span className="text-xs text-brand-text-muted font-mono">• AY 2026-2027 ANNUAL CYCLE</span>
              </div>
              <h1 className="text-2xl font-bold text-brand-forest tracking-tight mt-1">
                Executive Approval Operations Dashboard
              </h1>
              <p className="text-xs text-brand-text-muted mt-0.5">
                Real-time statutory monitoring across 6 zonal directorates, automated SLA enforcement, and early pendency warnings.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto">
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="px-3 py-1.5 bg-brand-subtle border border-brand-border rounded text-xs font-semibold text-brand-forest outline-none cursor-pointer"
              >
                <option value="All">All Zonal Jurisdictions (National)</option>
                <option value="Northern">Northern Regional Office (NRO)</option>
                <option value="Western">Western Regional Office (WRO)</option>
                <option value="Southern">Southern Regional Office (SRO)</option>
                <option value="Eastern">Eastern Regional Office (ERO)</option>
              </select>

              <Link
                href="/workflow-intelligence"
                className="px-3 py-1.5 bg-brand-forest hover:bg-brand-forest-hover text-white text-xs font-semibold rounded shadow-xs transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">hub</span>
                <span>Workflow Intelligence</span>
              </Link>
            </div>
          </div>

          {/* Statutory Metrics Runway */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
            <div className="bg-white p-4 rounded-lg border border-brand-border shadow-xs space-y-1">
              <div className="text-[10px] text-brand-text-muted uppercase font-bold tracking-wider">In-Process Applications</div>
              <div className="text-2xl font-bold font-mono text-brand-forest">{dashboardMetrics.inProcessApps}</div>
              <div className="text-[11px] text-brand-text-muted flex items-center gap-1">
                <span className="text-brand-success font-semibold">↑ 12%</span> vs AY 2025-26
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-brand-border shadow-xs space-y-1">
              <div className="text-[10px] text-brand-text-muted uppercase font-bold tracking-wider">Scrutiny SLA Ceiling</div>
              <div className="text-2xl font-bold font-mono text-brand-copper">{dashboardMetrics.scrutinyCeilingDays} Days Max</div>
              <div className="text-[11px] text-brand-text-muted flex items-center gap-1">
                Avg. turnaround: <span className="font-semibold text-brand-forest">{dashboardMetrics.averageProcessingDays}d</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-brand-border shadow-xs space-y-1 border-l-4 border-l-brand-alert-red">
              <div className="text-[10px] text-brand-alert-red uppercase font-bold tracking-wider">SLA Escalated (Overdue)</div>
              <div className="text-2xl font-bold font-mono text-brand-alert-red">{dashboardMetrics.overdueCasesCount} Cases</div>
              <div className="text-[11px] text-brand-alert-red font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-alert-red animate-pulse" /> +24h to +72h breach
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-brand-border shadow-xs space-y-1">
              <div className="text-[10px] text-brand-text-muted uppercase font-bold tracking-wider">Pending EVC Visits</div>
              <div className="text-2xl font-bold font-mono text-brand-warning">{dashboardMetrics.pendingEvcCount} Rosters</div>
              <div className="text-[11px] text-brand-text-muted">48 panels constituted</div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-brand-border shadow-xs space-y-1">
              <div className="text-[10px] text-brand-text-muted uppercase font-bold tracking-wider">Compliance Registry</div>
              <div className="text-2xl font-bold font-mono text-brand-success">{dashboardMetrics.complianceRatioPercent}%</div>
              <div className="text-[11px] text-brand-text-muted">FDR, Land & Fire NOCs</div>
            </div>
          </div>

          {/* Critical Statutory Attention Strip */}
          {overdueCases.length > 0 && (
            <div className="bg-brand-alert-bg border border-brand-alert-red/30 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded bg-brand-alert-red text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <span className="material-symbols-outlined text-[20px]">warning</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-brand-alert-red uppercase tracking-wider">
                      IMMEDIATE REGULATORY INTERVENTION REQUIRED
                    </span>
                    <span className="bg-brand-alert-red text-white text-[10px] font-mono px-1.5 rounded font-bold">
                      {overdueCases.length} CASE BLOCKED
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-brand-forest mt-0.5">
                    APP-2026-00124 — Dronacharya Institute of Engineering & Technology
                  </h3>
                  <p className="text-xs text-brand-text-muted mt-0.5">
                    Scrutiny period exceeded Day 15 (APH Rule 2.4.1 Land Deed Defect). Downstream EVC committee constitution halted.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href="/applications/APP-2026-00124"
                  className="px-3.5 py-2 bg-brand-alert-red hover:bg-brand-alert-red/90 text-white text-xs font-bold rounded shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <span>Open Dossier & Take Action</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>
            </div>
          )}

          {/* Applications Workbench Table */}
          <div className="bg-white rounded-lg border border-brand-border shadow-xs overflow-hidden">
            <div className="p-4 border-b border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-brand-forest">Active Statutory Registry Cases</h3>
                <p className="text-xs text-brand-text-muted">Applications currently progressing through APH 2026-27 lifecycle stages</p>
              </div>
              <Link
                href="/applications"
                className="text-xs text-brand-forest font-bold hover:underline flex items-center gap-1"
              >
                <span>View Full Registry (1,428)</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-brand-subtle text-brand-text-muted uppercase text-[10px] tracking-wider border-b border-brand-border">
                  <tr>
                    <th className="py-2.5 px-4 font-bold">Application ID</th>
                    <th className="py-2.5 px-4 font-bold">Institution Name</th>
                    <th className="py-2.5 px-4 font-bold">Application Type</th>
                    <th className="py-2.5 px-4 font-bold">Current Stage</th>
                    <th className="py-2.5 px-4 font-bold">SLA Runway</th>
                    <th className="py-2.5 px-4 font-bold">Status</th>
                    <th className="py-2.5 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/60">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-brand-subtle/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-brand-forest">
                        <Link href={`/applications/${app.id}`} className="hover:underline">
                          {app.id}
                        </Link>
                        <div className="text-[10px] text-brand-text-muted font-mono">{app.pid}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-brand-text-primary hover:text-brand-forest transition-colors">
                          <Link href={`/applications/${app.id}`}>{app.institutionName}</Link>
                        </div>
                        <div className="text-[11px] text-brand-text-muted">{app.city}, {app.state} ({app.regionalOffice.split('(')[1]?.replace(')', '') || 'Zonal'})</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium">{app.applicationType}</span>
                        <div className="text-[10px] text-brand-text-muted">{app.programDetails}</div>
                      </td>
                      <td className="py-3 px-4 font-medium">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${
                            app.currentStageNumber === 3 ? 'bg-brand-copper animate-pulse' :
                            app.currentStageNumber === 4 ? 'bg-brand-warning' :
                            app.currentStageNumber === 6 ? 'bg-brand-success' : 'bg-brand-forest'
                          }`} />
                          <span>{app.currentStageLabel}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <div className={`font-semibold ${app.daysExpended > 15 ? 'text-brand-alert-red' : 'text-brand-forest'}`}>
                          {app.daysExpended}d / {app.statutoryCeiling}d
                        </div>
                        {app.overdueText && (
                          <div className="text-[10px] text-brand-alert-red font-bold">{app.overdueText}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded border ${
                          app.status === 'overdue' ? 'bg-brand-alert-bg text-brand-alert-red border-brand-alert-red/30' :
                          app.status === 'approved' ? 'bg-brand-forest-light text-brand-forest border-brand-forest/20' :
                          app.status === 'evc_scheduled' ? 'bg-brand-amber-bg text-brand-amber border-brand-amber/30' :
                          'bg-brand-subtle text-brand-text-primary border-brand-border'
                        }`}>
                          {app.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/applications/${app.id}`}
                          className="px-2.5 py-1 bg-white hover:bg-brand-subtle text-brand-forest font-semibold rounded border border-brand-border transition-colors text-xs inline-flex items-center gap-1"
                        >
                          <span>Examine</span>
                          <span className="material-symbols-outlined text-[14px]">visibility</span>
                        </Link>
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
