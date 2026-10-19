'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { pravahApi } from '@/lib/api';
import { EvcScheduleRecord } from '@/lib/types';

export default function EvcSchedulingPage() {
  const [schedules, setSchedules] = useState<EvcScheduleRecord[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<EvcScheduleRecord | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    pravahApi.getEvcSchedules().then(setSchedules);
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
                <span className="material-symbols-outlined text-[16px] text-brand-forest">event_available</span>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-brand-amber-bg text-brand-amber border border-brand-amber/30">
                  APH STAGE 04 DISPATCH
                </span>
              </div>
              <h1 className="text-2xl font-bold text-brand-forest tracking-tight mt-1">
                Expert Visit Committee (EVC) Operations
              </h1>
              <p className="text-xs text-brand-text-muted mt-0.5">
                Physical campus audits, geo-fenced biometric validation, and multi-member panellist availability rosters.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-3 py-1.5 rounded bg-brand-subtle text-brand-forest border border-brand-border">
                64 Active Inspection Slots
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div className="bg-white p-4 rounded-lg border border-brand-border shadow-xs">
              <div className="text-[10px] text-brand-text-muted uppercase font-bold">Scheduled Campus Inspections</div>
              <div className="text-xl font-bold font-mono text-brand-forest mt-1">48 Scheduled</div>
              <div className="text-[11px] text-brand-text-muted">Biometric tokens dispatched</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-brand-border shadow-xs border-l-4 border-l-brand-alert-red">
              <div className="text-[10px] text-brand-alert-red uppercase font-bold">Panels Withheld / Action Needed</div>
              <div className="text-xl font-bold font-mono text-brand-alert-red mt-1">16 Withheld</div>
              <div className="text-[11px] text-brand-alert-red">Prerequisite document defects</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-brand-border shadow-xs">
              <div className="text-[10px] text-brand-text-muted uppercase font-bold">Reports Submitted & Verified</div>
              <div className="text-xl font-bold font-mono text-brand-success mt-1">112 Completed</div>
              <div className="text-[11px] text-brand-text-muted">Geotagged campus footage</div>
            </div>
          </div>

          {/* EVC Inspection Table */}
          <div className="bg-white rounded-lg border border-brand-border shadow-xs overflow-hidden">
            <div className="p-4 border-b border-brand-border">
              <h3 className="text-sm font-bold text-brand-forest">EVC Inspection Rosters</h3>
              <p className="text-xs text-brand-text-muted">3-member panel assignments under Regional Office authorization</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-brand-subtle text-brand-text-muted uppercase text-[10px] tracking-wider border-b border-brand-border">
                  <tr>
                    <th className="py-3 px-4 font-bold">Roster ID</th>
                    <th className="py-3 px-4 font-bold">Institution & Campus</th>
                    <th className="py-3 px-4 font-bold">Audit Type</th>
                    <th className="py-3 px-4 font-bold">Inspection Date</th>
                    <th className="py-3 px-4 font-bold">Panel Convener</th>
                    <th className="py-3 px-4 font-bold">Status</th>
                    <th className="py-3 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/60">
                  {schedules.map((item) => (
                    <tr key={item.id} className="hover:bg-brand-subtle/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-brand-forest">
                        {item.id}
                        <div className="text-[10px] text-brand-text-muted">
                          <Link href={`/applications/${item.applicationId}`} className="hover:underline">
                            {item.applicationId}
                          </Link>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-brand-text-primary">{item.institutionName}</div>
                        <div className="text-[11px] text-brand-text-muted">{item.location} • {item.regionalOffice}</div>
                      </td>
                      <td className="py-3.5 px-4 font-medium">{item.inspectionType}</td>
                      <td className="py-3.5 px-4 font-mono">
                        {item.visitDate === 'PENDING_CLEARANCE' ? (
                          <span className="text-brand-alert-red font-bold">Withheld (Land Defect)</span>
                        ) : (
                          <span className="font-bold text-brand-forest">{item.visitDate}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-brand-text-primary">{item.panelConvener}</div>
                        <div className="text-[10px] text-brand-text-muted">{item.panelMembers.join(', ')}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded border ${
                          item.status === 'Completed' ? 'bg-brand-forest-light text-brand-forest border-brand-forest/20' :
                          item.status === 'Action Needed' ? 'bg-brand-alert-bg text-brand-alert-red border-brand-alert-red/30' :
                          'bg-brand-amber-bg text-brand-amber border-brand-amber/30'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedSchedule(item);
                            triggerToast(`Opened EVC Inspection dossier for ${item.institutionName}`);
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-brand-subtle text-brand-forest font-semibold rounded border border-brand-border transition-colors text-xs cursor-pointer"
                        >
                          Manage Panel
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Manage Panel Drawer */}
          {selectedSchedule && (
            <div className="bg-white p-5 rounded-lg border border-brand-border shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-brand-border">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-brand-forest">Panel Roster Inspection: {selectedSchedule.id}</span>
                  <span className="font-mono text-xs text-brand-text-muted">({selectedSchedule.applicationId})</span>
                </div>
                <button
                  onClick={() => setSelectedSchedule(null)}
                  className="text-brand-text-muted hover:text-brand-text-primary text-xs"
                >
                  ✕ Close
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="bg-brand-subtle/50 p-3 rounded border border-brand-border">
                  <div className="text-[10px] uppercase font-bold text-brand-text-muted">Designated Convener</div>
                  <div className="font-bold text-brand-forest mt-1">{selectedSchedule.panelConvener}</div>
                  <div className="text-[11px] text-brand-text-muted mt-0.5">Biometric Geotag App ID: EVC-PANEL-APP-92</div>
                </div>
                <div className="bg-brand-subtle/50 p-3 rounded border border-brand-border">
                  <div className="text-[10px] uppercase font-bold text-brand-text-muted">Associated Panel Members</div>
                  <div className="font-medium text-brand-text-primary mt-1">{selectedSchedule.panelMembers.join(' • ')}</div>
                  <div className="text-[11px] text-brand-text-muted mt-0.5">Approved under NRO panel roster 2026</div>
                </div>
                <div className="bg-brand-subtle/50 p-3 rounded border border-brand-border">
                  <div className="text-[10px] uppercase font-bold text-brand-text-muted">Statutory Safeguards</div>
                  <div className="font-medium text-brand-text-primary mt-1">Geo-Fenced Campus Attendance Required</div>
                  <div className="text-[11px] text-brand-text-muted mt-0.5">Videography timestamped with SHA-256</div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => triggerToast('Automated SMS & official dispatch notice transmitted to panel members')}
                  className="px-3 py-1.5 bg-brand-forest text-white text-xs font-semibold rounded hover:bg-brand-forest-hover transition-colors cursor-pointer"
                >
                  Dispatch Biometric Notice
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
