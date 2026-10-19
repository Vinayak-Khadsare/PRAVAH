'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { pravahApi } from '@/lib/api';
import { ApplicationRecord } from '@/lib/types';

export default function ApplicationsRegistryPage() {
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [search, setSearch] = useState('');
  const [selectedZone, setSelectedZone] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedStage, setSelectedStage] = useState('all');

  useEffect(() => {
    pravahApi.getApplications(selectedZone, search, selectedStatus).then(setApplications);
  }, [selectedZone, search, selectedStatus]);

  const filteredApps = applications.filter((app) => {
    if (selectedStage !== 'all' && app.currentStageNumber.toString() !== selectedStage) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-brand-ivory text-brand-text-primary selection:bg-brand-forest selection:text-white">
      <Header />
      <div className="flex-1 flex w-full">
        <Sidebar />

        <main className="flex-1 min-w-0 p-5 md:p-6 lg:p-7 space-y-5">
          {/* Top Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-brand-border shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-brand-forest">folder_shared</span>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-brand-forest-light text-brand-forest border border-brand-forest/20">
                  STATUTORY REPOSITORY
                </span>
              </div>
              <h1 className="text-2xl font-bold text-brand-forest tracking-tight mt-1">
                National Applications Registry
              </h1>
              <p className="text-xs text-brand-text-muted mt-0.5">
                Comprehensive tracking of AICTE approval dossiers across technical universities and polytechnics.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-3 py-1.5 rounded bg-brand-subtle text-brand-text-primary border border-brand-border">
                {filteredApps.length} of 1,428 Records Shown
              </span>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-white p-4 rounded-lg border border-brand-border shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* Search */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-brand-text-muted mb-1">Search Identifier / Institution</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-2.5 top-2 text-brand-text-muted text-[16px]">search</span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="App ID, Institute, City..."
                  className="w-full h-8 pl-8 pr-3 bg-brand-subtle border border-brand-border rounded focus:outline-none focus:border-brand-forest text-xs font-medium"
                />
              </div>
            </div>

            {/* Zonal Jurisdiction */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-brand-text-muted mb-1">Zonal Jurisdiction</label>
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="w-full h-8 px-2.5 bg-brand-subtle border border-brand-border rounded font-semibold text-brand-forest outline-none"
              >
                <option value="All">All Regional Directorates</option>
                <option value="Northern">Northern Regional Office (NRO)</option>
                <option value="Western">Western Regional Office (WRO)</option>
                <option value="Southern">Southern Regional Office (SRO)</option>
                <option value="Eastern">Eastern Regional Office (ERO)</option>
              </select>
            </div>

            {/* Stage Filter */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-brand-text-muted mb-1">Lifecycle Milestone</label>
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                className="w-full h-8 px-2.5 bg-brand-subtle border border-brand-border rounded font-semibold text-brand-forest outline-none"
              >
                <option value="all">All Stages (01 to 06)</option>
                <option value="1">Stage 01: Intake Submission</option>
                <option value="2">Stage 02: Scrutiny Committee</option>
                <option value="3">Stage 03: Re-Scrutiny & Cure</option>
                <option value="4">Stage 04: EVC Inspection</option>
                <option value="5">Stage 05: SAC Appeal Hearing</option>
                <option value="6">Stage 06: Final Decision / LoA</option>
              </select>
            </div>

            {/* SLA Status Filter */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-brand-text-muted mb-1">Statutory Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full h-8 px-2.5 bg-brand-subtle border border-brand-border rounded font-semibold text-brand-forest outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="overdue">SLA Escalated (Overdue)</option>
                <option value="in_scrutiny">In Scrutiny</option>
                <option value="deficiency_issued">Deficiency Issued</option>
                <option value="evc_scheduled">EVC Scheduled</option>
                <option value="approved">Approved (LoA Issued)</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-lg border border-brand-border shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-brand-subtle text-brand-text-muted uppercase text-[10px] tracking-wider border-b border-brand-border">
                  <tr>
                    <th className="py-3 px-4 font-bold">Application / PID</th>
                    <th className="py-3 px-4 font-bold">Institution Details</th>
                    <th className="py-3 px-4 font-bold">Category</th>
                    <th className="py-3 px-4 font-bold">Stage Milestone</th>
                    <th className="py-3 px-4 font-bold">SLA Days</th>
                    <th className="py-3 px-4 font-bold">Status</th>
                    <th className="py-3 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/60">
                  {filteredApps.map((app) => (
                    <tr key={app.id} className="hover:bg-brand-subtle/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-brand-forest">
                        <Link href={`/applications/${app.id}`} className="hover:underline flex items-center gap-1">
                          <span>{app.id}</span>
                          <span className="material-symbols-outlined text-[13px] text-brand-copper">north_east</span>
                        </Link>
                        <div className="text-[10px] text-brand-text-muted">{app.pid}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-brand-text-primary hover:text-brand-forest transition-colors">
                          <Link href={`/applications/${app.id}`}>{app.institutionName}</Link>
                        </div>
                        <div className="text-[11px] text-brand-text-muted">{app.city}, {app.state} • {app.regionalOffice.split('(')[1]?.replace(')', '') || 'Zonal'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-brand-text-primary">{app.applicationType}</span>
                        <div className="text-[10px] text-brand-text-muted">{app.academicSession}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-semibold">
                          <span className={`w-2 h-2 rounded-full ${
                            app.currentStageNumber === 3 ? 'bg-brand-alert-red animate-pulse' :
                            app.currentStageNumber === 4 ? 'bg-brand-warning' :
                            app.currentStageNumber === 6 ? 'bg-brand-success' : 'bg-brand-forest'
                          }`} />
                          <span>{app.currentStageLabel}</span>
                        </div>
                        <div className="text-[10px] text-brand-text-muted">{app.assignedOfficer.name}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        <span className={`font-bold ${app.daysExpended > 15 ? 'text-brand-alert-red' : 'text-brand-forest'}`}>
                          {app.daysExpended}d / {app.statutoryCeiling}d
                        </span>
                        {app.overdueText && (
                          <div className="text-[10px] text-brand-alert-red font-bold">{app.overdueText}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded border ${
                          app.status === 'overdue' ? 'bg-brand-alert-bg text-brand-alert-red border-brand-alert-red/30' :
                          app.status === 'approved' ? 'bg-brand-forest-light text-brand-forest border-brand-forest/20' :
                          app.status === 'evc_scheduled' ? 'bg-brand-amber-bg text-brand-amber border-brand-amber/30' :
                          'bg-brand-subtle text-brand-text-primary border-brand-border'
                        }`}>
                          {app.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/applications/${app.id}`}
                          className="px-2.5 py-1 bg-white hover:bg-brand-subtle text-brand-forest font-semibold rounded border border-brand-border transition-colors text-xs inline-flex items-center gap-1"
                        >
                          <span>Examine Dossier</span>
                          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
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
