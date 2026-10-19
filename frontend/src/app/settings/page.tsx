'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

export default function SettingsConfigPage() {
  const [slaCeiling, setSlaCeiling] = useState(15);
  const [cureWindow, setCureWindow] = useState(7);
  const [maxGraceHours, setMaxGraceHours] = useState(48);
  const [autoEscalateSac, setAutoEscalateSac] = useState(true);
  const [geofencingRadius, setGeofencingRadius] = useState(500);
  const [toast, setToast] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setToast('Regulatory parameters updated successfully and logged in Master Audit.');
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
                <span className="material-symbols-outlined text-[16px] text-brand-forest">admin_panel_settings</span>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-brand-forest-light text-brand-forest border border-brand-forest/20">
                  REGULATORY SAFEGUARDS & PARAMETERS
                </span>
              </div>
              <h1 className="text-2xl font-bold text-brand-forest tracking-tight mt-1">
                Workflow Rules & Administrative Settings
              </h1>
              <p className="text-xs text-brand-text-muted mt-0.5">
                Configure processing deadlines, escalation policies, and audit logging parameters per Council decisions.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-3 py-1.5 rounded bg-brand-subtle text-brand-forest border border-brand-border">
                AICTE APH Regs 2026 Engine
              </span>
            </div>
          </div>

          <form onSubmit={handleSave} className="bg-white p-6 rounded-lg border border-brand-border shadow-xs space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-brand-forest border-b border-brand-border pb-2">
                Statutory SLA & Turnaround Ceilings
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-brand-text-primary mb-1">
                    Maximum Scrutiny Turnaround Ceiling (Days)
                  </label>
                  <input
                    type="number"
                    value={slaCeiling}
                    onChange={(e) => setSlaCeiling(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-brand-subtle border border-brand-border rounded font-mono font-bold text-brand-forest outline-none focus:border-brand-forest"
                  />
                  <p className="text-[11px] text-brand-text-muted mt-1">Standard prescribed by APH Chapter II Section 2.1.</p>
                </div>

                <div>
                  <label className="block font-semibold text-brand-text-primary mb-1">
                    Form-B Deficiency Standard Cure Window (Days)
                  </label>
                  <input
                    type="number"
                    value={cureWindow}
                    onChange={(e) => setCureWindow(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-brand-subtle border border-brand-border rounded font-mono font-bold text-brand-forest outline-none focus:border-brand-forest"
                  />
                  <p className="text-[11px] text-brand-text-muted mt-1">Institutional response time to submit supplementary rectification.</p>
                </div>

                <div>
                  <label className="block font-semibold text-brand-text-primary mb-1">
                    Maximum One-Time Grace Notice Prerogative (Hours)
                  </label>
                  <input
                    type="number"
                    value={maxGraceHours}
                    onChange={(e) => setMaxGraceHours(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-brand-subtle border border-brand-border rounded font-mono font-bold text-brand-forest outline-none focus:border-brand-forest"
                  />
                  <p className="text-[11px] text-brand-text-muted mt-1">Delegated power of Member Secretary / Regional Officer.</p>
                </div>

                <div>
                  <label className="block font-semibold text-brand-text-primary mb-1">
                    EVC Biometric Geofencing Tolerance (Meters)
                  </label>
                  <input
                    type="number"
                    value={geofencingRadius}
                    onChange={(e) => setGeofencingRadius(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-brand-subtle border border-brand-border rounded font-mono font-bold text-brand-forest outline-none focus:border-brand-forest"
                  />
                  <p className="text-[11px] text-brand-text-muted mt-1">Perimeter around institutional GPS coordinates for panel attendance.</p>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={autoEscalateSac}
                    onChange={(e) => setAutoEscalateSac(e.target.checked)}
                    className="w-4 h-4 rounded border-brand-border text-brand-forest focus:ring-brand-forest"
                  />
                  <span className="font-semibold text-brand-text-primary">
                    Automatically trigger Standing Appeals Committee (SAC) escalation when Day 15 expires without approval
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-brand-border flex items-center justify-end gap-3">
              <button
                type="submit"
                className="px-5 py-2.5 bg-brand-forest hover:bg-brand-forest-hover text-white text-xs font-bold rounded shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">save</span>
                <span>Save Regulatory Configuration</span>
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
