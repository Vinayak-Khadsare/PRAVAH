'use client';

import React from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import DependencyGraph from '@/components/DependencyGraph';

export default function WorkflowIntelligencePage() {
  return (
    <div className="min-h-screen flex flex-col bg-brand-ivory text-brand-text-primary selection:bg-brand-forest selection:text-white">
      <Header />
      <div className="flex-1 flex w-full">
        <Sidebar />

        <main className="flex-1 min-w-0 p-5 md:p-6 lg:p-7 space-y-6">
          <div className="bg-white p-5 rounded-lg border border-brand-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-brand-forest">hub</span>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-brand-forest-light text-brand-forest border border-brand-forest/20">
                  WORKFLOW INTELLIGENCE & GRAPH ENGINE
                </span>
              </div>
              <h1 className="text-2xl font-bold text-brand-forest tracking-tight mt-1">
                Dependency Analysis & What-If Simulation
              </h1>
              <p className="text-xs text-brand-text-muted mt-0.5">
                Examine prerequisite bottlenecks, analyze downstream cascade consequences, and simulate statutory grace extensions.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-3 py-1.5 rounded bg-brand-forest text-white shadow-xs">
                AICTE APH 2026-27 Active Topology
              </span>
            </div>
          </div>

          {/* Interactive Dependency Graph with What-If Engine */}
          <DependencyGraph />

          {/* National Bottleneck Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white p-5 rounded-lg border border-brand-border shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-brand-copper text-[18px]">landslide</span>
                <h3 className="text-sm font-bold text-brand-forest">Top Statutory Defect</h3>
              </div>
              <div className="text-xl font-bold font-mono text-brand-forest">42% Land Lease Title Defect</div>
              <p className="text-xs text-brand-text-muted leading-relaxed">
                Sub-Registrar 30-year deed seal omissions and uncertified Tehsildar Khasra maps constitute the predominant Stage 03 blocker nationally.
              </p>
              <div className="text-[11px] font-mono text-brand-copper font-semibold">Affected: 218 Institutions</div>
            </div>

            <div className="bg-white p-5 rounded-lg border border-brand-border shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-brand-warning text-[18px]">local_fire_department</span>
                <h3 className="text-sm font-bold text-brand-forest">Fire Safety NOC Lags</h3>
              </div>
              <div className="text-xl font-bold font-mono text-brand-warning">28% State Fire Clearance Lags</div>
              <p className="text-xs text-brand-text-muted leading-relaxed">
                State Fire Service Department multi-tier inspections routinely consume 14+ calendar days, conflicting with the 15-day AICTE ceiling.
              </p>
              <div className="text-[11px] font-mono text-brand-warning font-semibold">Affected: 145 Institutions</div>
            </div>

            <div className="bg-white p-5 rounded-lg border border-brand-border shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-brand-forest text-[18px]">badge</span>
                <h3 className="text-sm font-bold text-brand-forest">Biometric Faculty Duplication</h3>
              </div>
              <div className="text-xl font-bold font-mono text-brand-forest">18% Cadre Verification Cross-Check</div>
              <p className="text-xs text-brand-text-muted leading-relaxed">
                Automated detection of faculty Aadhaar/PAN registrations appearing across multiple institutional self-disclosure declarations.
              </p>
              <div className="text-[11px] font-mono text-brand-forest font-semibold">Flagged: 92 Faculty Records</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
