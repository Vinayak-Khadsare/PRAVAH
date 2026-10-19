'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import RegulatoryActionModal, { ActionType } from '@/components/RegulatoryActionModal';
import { pravahApi } from '@/lib/api';
import { ApplicationRecord } from '@/lib/types';
import { sampleApplications } from '@/lib/mockData';

export default function ApplicationDetailPage() {
  const params = useParams();
  const appId = (params?.id as string) || 'APP-2026-00124';

  const [application, setApplication] = useState<ApplicationRecord>(sampleApplications[0]);
  const [activeTab, setActiveTab] = useState<'deficiencies' | 'undertakings' | 'infra' | 'cadre'>('deficiencies');
  const [modalAction, setModalAction] = useState<ActionType | null>(null);
  const [selectedDefId, setSelectedDefId] = useState<string | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = () => {
    pravahApi.getApplicationById(appId).then((res) => {
      if (res) setApplication({ ...res });
    });
  };

  useEffect(() => {
    loadData();
  }, [appId]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const openAction = (type: ActionType, defId?: string) => {
    setModalAction(type);
    setSelectedDefId(defId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-ivory text-brand-text-primary selection:bg-brand-forest selection:text-white">
      <Header />
      <div className="flex-1 flex w-full">
        <Sidebar />

        <main className="flex-1 min-w-0 p-5 md:p-6 lg:p-7 space-y-5">
          {/* Toast Notification */}
          {toastMessage && (
            <div className="bg-brand-forest-deep text-white px-4 py-2.5 rounded shadow-lg text-xs flex items-center justify-between border border-brand-copper animate-fadeIn">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-brand-copper-light text-[18px]">verified</span>
                <span>{toastMessage}</span>
              </div>
              <button onClick={() => setToastMessage(null)} className="text-white/60 hover:text-white">
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          )}

          {/* Top Context Breadcrumb & Regulatory Status Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-4 py-2.5 rounded-lg border border-brand-border shadow-xs">
            <div className="flex flex-wrap items-center gap-2 text-xs text-brand-text-muted">
              <span className="flex items-center gap-1 text-brand-forest font-semibold">
                <span className="material-symbols-outlined text-[15px]">shield</span>
                PRAVAH STATUTORY ARCHIVE
              </span>
              <span>/</span>
              <Link href="/applications" className="hover:text-brand-forest cursor-pointer transition-colors">
                Applications Registry
              </Link>
              <span>/</span>
              <span>NRO Technical Desk</span>
              <span>/</span>
              <span className="font-mono text-brand-text-primary font-semibold bg-brand-subtle px-1.5 py-0.5 rounded border border-brand-border">
                {application.id}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-brand-subtle text-brand-text-muted text-[10px] px-2.5 py-0.5 rounded tracking-wider uppercase font-semibold border border-brand-border">
                CONFIDENTIAL REGULATORY RECORD • AUDITED TIER-1
              </span>
              {application.daysExpended > application.statutoryCeiling ? (
                <span className="inline-flex items-center gap-1.5 bg-brand-alert-bg text-brand-alert-red text-[10px] px-2.5 py-0.5 rounded uppercase font-bold border border-brand-alert-red/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-alert-red animate-pulse" />
                  SLA ESCALATED: DAY {application.daysExpended}/{application.statutoryCeiling} (+24H OVERDUE)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 bg-brand-forest-light text-brand-forest text-[10px] px-2.5 py-0.5 rounded uppercase font-bold border border-brand-forest/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-forest" />
                  SLA COMPLIANT: DAY {application.daysExpended}/{application.statutoryCeiling}
                </span>
              )}
            </div>
          </div>

          {/* Case File Hero Title & Context Panel */}
          <div className="bg-white rounded-lg p-5 border border-brand-border shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-brand-forest text-white text-xs px-2 py-0.5 rounded font-mono font-medium">
                    PID: {application.pid}
                  </span>
                  <span className="bg-brand-copper-bg text-brand-copper text-xs px-2 py-0.5 rounded uppercase font-semibold border border-brand-copper/30">
                    APH 2026-27 PROVISIONAL
                  </span>
                  <span className="bg-brand-subtle text-brand-text-muted text-xs px-2 py-0.5 rounded font-mono border border-brand-border">
                    PANEL-02 / RO-VERIF
                  </span>
                </div>
                <h1 className="text-2xl text-brand-forest tracking-tight font-bold">
                  {application.institutionName}
                </h1>
                <p className="text-xs text-brand-text-muted flex items-center gap-2 flex-wrap">
                  <span className="flex items-center gap-1 text-brand-text-primary font-medium">
                    <span className="material-symbols-outlined text-[15px] text-brand-forest">location_city</span>
                    {application.address}, {application.city}, {application.state} (Pin: {application.pin})
                  </span>
                  <span>•</span>
                  <span className="text-brand-text-muted">{application.regionalOffice}</span>
                  <span>•</span>
                  <span className="font-mono text-brand-text-muted">Geo-Tag: {application.geoTag}</span>
                </p>
              </div>

              {/* Contextual Regulatory Actions */}
              <div className="flex flex-wrap items-center gap-2 self-start shrink-0">
                <button
                  onClick={() => openAction('observation')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-subtle text-brand-text-primary text-xs font-semibold rounded hover:bg-brand-border transition-colors border border-brand-border cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">edit_note</span>
                  Record Observation
                </button>

                <button
                  onClick={() => openAction('deficiency_form_b')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-alert-bg text-brand-alert-red text-xs font-semibold rounded hover:bg-brand-alert-red/10 transition-colors border border-brand-alert-red/30 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">assignment_late</span>
                  Issue Deficiency Form-B
                </button>

                {application.criticalBlocker ? (
                  <div className="relative group">
                    <button
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-subtle text-brand-text-muted cursor-not-allowed text-xs font-semibold rounded border border-brand-border opacity-60"
                      disabled
                    >
                      <span className="material-symbols-outlined text-[16px]">event_busy</span>
                      Schedule EVC
                    </button>
                    <div className="absolute right-0 bottom-full mb-1 hidden group-hover:block w-56 p-2 bg-brand-forest text-white text-[10px] rounded shadow-md z-30 font-sans">
                      Blocked: Statutory Title Encumbrance Certificate unverified under APH Rule 2.4.1.
                    </div>
                  </div>
                ) : (
                  <Link
                    href="/evc"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-forest text-white text-xs font-semibold rounded hover:bg-brand-forest-hover transition-colors shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">event_available</span>
                    Schedule EVC
                  </Link>
                )}

                <button
                  onClick={() => openAction('recommend_evc')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-forest text-white text-xs rounded hover:bg-brand-forest-hover transition-colors shadow-xs font-semibold cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  Recommend for EVC
                </button>
              </div>
            </div>

            {/* Metadata Runway Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 bg-brand-subtle/70 p-3 rounded border border-brand-border">
              <div>
                <div className="text-[10px] text-brand-text-muted uppercase font-semibold">Application Type</div>
                <div className="text-xs text-brand-text-primary font-semibold truncate mt-0.5">{application.applicationType}</div>
                <div className="text-[11px] text-brand-text-muted truncate">{application.programDetails}</div>
              </div>
              <div>
                <div className="text-[10px] text-brand-text-muted uppercase font-semibold">Academic Session</div>
                <div className="text-xs text-brand-text-primary font-semibold mt-0.5">{application.academicSession}</div>
                <div className="text-[11px] text-brand-text-muted truncate">Annual Approval Cycle</div>
              </div>
              <div>
                <div className="text-[10px] text-brand-text-muted uppercase font-semibold">Scrutiny Stage</div>
                <div className="text-xs text-brand-copper font-semibold mt-0.5 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-brand-copper" />
                  {application.currentStageLabel}
                </div>
                <div className="text-[11px] text-brand-alert-red font-medium truncate">
                  {application.daysExpended > 15 ? 'Cure window elapsed 24h' : 'Stage active'}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-brand-text-muted uppercase font-semibold">Assigned Officer</div>
                <div className="text-xs text-brand-text-primary font-semibold mt-0.5">{application.assignedOfficer.name}</div>
                <div className="text-[11px] text-brand-text-muted truncate">{application.assignedOfficer.role}</div>
              </div>
              <div>
                <div className="text-[10px] text-brand-text-muted uppercase font-semibold">Statutory Ceiling</div>
                <div className={`text-xs font-semibold mt-0.5 flex items-center gap-1 ${application.daysExpended > 15 ? 'text-brand-alert-red' : 'text-brand-forest'}`}>
                  <span className="material-symbols-outlined text-[15px]">timer_off</span>
                  {application.daysExpended} Days / {application.statutoryCeiling} Max
                </div>
                <div className="text-[11px] text-brand-alert-red truncate font-mono">
                  {application.overdueText || 'Within SLA limit'}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-brand-text-muted uppercase font-semibold">Last Registry Event</div>
                <div className="text-xs text-brand-text-primary font-semibold mt-0.5">{application.lastRegistryEvent.split(' by')[0]}</div>
                <div className="text-[11px] text-brand-text-muted truncate">by {application.lastRegistryEvent.split('by ')[1] || 'Panel'}</div>
              </div>
            </div>
          </div>

          {/* Core Section A: Horizontal Statutory Workflow Progression Timeline */}
          <div className="bg-white rounded-lg p-5 border border-brand-border shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-brand-forest text-[20px]">account_tree</span>
                <h2 className="text-base text-brand-forest font-bold">Statutory Approval Lifecycle Milestones</h2>
              </div>
              <span className="text-[10px] text-brand-text-muted bg-brand-subtle px-2 py-0.5 rounded font-mono border border-brand-border">
                REGULATION REF: AICTE/APH/2026/CH-II
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-2 pt-2">
              {/* Stage 1 */}
              <div className="relative bg-brand-subtle p-3 rounded border border-brand-border flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-forest flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-brand-forest">check_circle</span>
                    STAGE 01
                  </span>
                  <span className="font-mono text-[10px] text-brand-text-muted">10 Feb 2026</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-brand-text-primary">Intake Submission</div>
                  <div className="text-[11px] text-brand-text-muted mt-0.5">Digital Packet Verified</div>
                </div>
                <div className="pt-2 flex items-center justify-between text-[11px] text-brand-text-muted font-medium">
                  <span>0 Deficiencies</span>
                  <span className="font-mono text-brand-text-muted">3d process</span>
                </div>
              </div>

              {/* Stage 2 */}
              <div className="relative bg-brand-subtle p-3 rounded border border-brand-border flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-forest flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-brand-forest">check_circle</span>
                    STAGE 02
                  </span>
                  <span className="font-mono text-[10px] text-brand-text-muted">15 Feb 2026</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-brand-text-primary">Scrutiny Committee</div>
                  <div className="text-[11px] text-brand-text-muted mt-0.5">Panel A Review Complete</div>
                </div>
                <div className="pt-2 flex items-center justify-between text-[11px] text-brand-alert-red font-medium">
                  <span>1 Land Deed Flag</span>
                  <span className="font-mono text-brand-text-muted">2d process</span>
                </div>
              </div>

              {/* Stage 3 */}
              <div className="relative bg-brand-amber-bg p-3 rounded border border-brand-copper shadow-xs flex flex-col justify-between space-y-2 ring-1 ring-brand-copper">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-copper flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-brand-alert-red animate-ping" />
                    STAGE 03 • ACTIVE
                  </span>
                  <span className="bg-brand-alert-red text-white font-mono text-[9px] font-bold px-1 rounded">OVERDUE</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-brand-forest">Re-Scrutiny & Cure</div>
                  <div className="text-[11px] text-brand-text-muted mt-0.5">Deficiency Notice Form-B</div>
                </div>
                <div className="pt-2 flex items-center justify-between text-[11px]">
                  <span className="text-brand-alert-red font-bold">11 Days in Stage</span>
                  <span className="font-mono text-brand-text-muted">Assigned: Dr. Verma</span>
                </div>
              </div>

              {/* Stage 4 */}
              <div className="relative bg-brand-subtle/50 p-3 rounded border border-brand-border flex flex-col justify-between space-y-2 opacity-75">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-brand-text-muted flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px]">lock</span>
                    STAGE 04
                  </span>
                  <span className="font-mono text-[10px] text-brand-text-muted">PREREQ BLOCKED</span>
                </div>
                <div>
                  <div className="text-xs font-semibold text-brand-text-muted">Expert Visit (EVC)</div>
                  <div className="text-[11px] text-brand-text-muted mt-0.5">Physical Campus Audit</div>
                </div>
                <div className="pt-2 flex items-center justify-between text-[11px] text-brand-text-muted">
                  <span>TBD (3-Member Pool)</span>
                  <span className="font-mono text-brand-text-muted">--</span>
                </div>
              </div>

              {/* Stage 5 */}
              <div className="relative bg-brand-subtle/50 p-3 rounded border border-brand-border flex flex-col justify-between space-y-2 opacity-60">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-brand-text-muted flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px]">lock</span>
                    STAGE 05
                  </span>
                  <span className="font-mono text-[10px] text-brand-text-muted">CONDITIONAL</span>
                </div>
                <div>
                  <div className="text-xs font-semibold text-brand-text-muted">Standing Hearing / SAC</div>
                  <div className="text-[11px] text-brand-text-muted mt-0.5">Appellate Committee</div>
                </div>
                <div className="pt-2 flex items-center justify-between text-[11px] text-brand-text-muted">
                  <span>If Escalated</span>
                  <span className="font-mono text-brand-text-muted">--</span>
                </div>
              </div>

              {/* Stage 6 */}
              <div className="relative bg-brand-subtle/50 p-3 rounded border border-brand-border flex flex-col justify-between space-y-2 opacity-50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-brand-text-muted flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px]">flag</span>
                    STAGE 06
                  </span>
                  <span className="font-mono text-[10px] text-brand-text-muted">30 APR 2026</span>
                </div>
                <div>
                  <div className="text-xs font-semibold text-brand-text-muted">Final Decision / LoA</div>
                  <div className="text-[11px] text-brand-text-muted mt-0.5">Council Issuance Target</div>
                </div>
                <div className="pt-2 flex items-center justify-between text-[11px] text-brand-text-muted">
                  <span>Member Secretary</span>
                  <span className="font-mono text-brand-text-muted">Final Gate</span>
                </div>
              </div>
            </div>
          </div>

          {/* Core Section B: Dependency Blocker Panel */}
          {application.criticalBlocker && (
            <div className="bg-white rounded-lg p-5 border border-brand-border shadow-xs space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-brand-subtle p-3 rounded-lg border border-brand-border">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded bg-brand-alert-bg text-brand-alert-red flex items-center justify-center shrink-0 mt-0.5 border border-brand-alert-red/30">
                    <span className="material-symbols-outlined text-[20px]">warning</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm text-brand-forest font-bold">
                        {application.criticalBlocker.title}
                      </h3>
                      <span className="bg-brand-alert-red text-white text-[10px] px-2 py-0.2 rounded font-bold">
                        {application.criticalBlocker.ruleRef}
                      </span>
                    </div>
                    <p className="text-xs text-brand-text-muted mt-0.5">
                      {application.criticalBlocker.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setActiveTab('deficiencies')}
                    className="px-3 py-1.5 bg-white text-brand-forest text-xs rounded hover:bg-brand-subtle transition-colors border border-brand-border font-medium cursor-pointer"
                  >
                    Examine Dossier #LD-2026-NRO-99
                  </button>
                  <button
                    onClick={() => openAction('grace_notice')}
                    className="px-3 py-1.5 bg-brand-copper text-white text-xs rounded hover:bg-brand-copper/90 transition-opacity shadow-xs font-medium cursor-pointer"
                  >
                    Grant 48-Hour Grace Notice
                  </button>
                  <button
                    onClick={() => openAction('escalate_sac')}
                    className="px-3 py-1.5 bg-brand-alert-red text-white text-xs rounded hover:bg-brand-alert-red/90 transition-opacity shadow-xs font-semibold cursor-pointer"
                  >
                    Escalate to SAC Hearing
                  </button>
                </div>
              </div>

              {/* Triple Inquiry Structured Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-brand-subtle/60 p-3.5 rounded border border-brand-border space-y-1.5">
                  <div className="flex items-center gap-1.5 text-brand-copper text-xs uppercase font-bold">
                    <span className="material-symbols-outlined text-[16px]">help_outline</span>
                    1. What Is Pending?
                  </div>
                  <div className="text-xs font-semibold text-brand-text-primary">
                    Certified 30-Year Registered Land Lease Deed & Khasra Map Verification
                  </div>
                  <p className="text-xs text-brand-text-muted leading-relaxed">
                    {application.criticalBlocker.question1_whatPending}
                  </p>
                </div>

                <div className="bg-brand-subtle/60 p-3.5 rounded border border-brand-border space-y-1.5">
                  <div className="flex items-center gap-1.5 text-brand-alert-red text-xs uppercase font-bold">
                    <span className="material-symbols-outlined text-[16px]">report_problem</span>
                    2. Why Is It Blocked?
                  </div>
                  <div className="text-xs font-semibold text-brand-text-primary">
                    Unregistered MoU Uploaded; Rectification Lacks Sub-Registrar Seal
                  </div>
                  <p className="text-xs text-brand-text-muted leading-relaxed">
                    {application.criticalBlocker.question2_whyBlocked}
                  </p>
                </div>

                <div className="bg-brand-subtle/60 p-3.5 rounded border border-brand-border space-y-1.5">
                  <div className="flex items-center gap-1.5 text-brand-forest text-xs uppercase font-bold">
                    <span className="material-symbols-outlined text-[16px]">gavel</span>
                    3. Mandatory Regulatory Next Step
                  </div>
                  <div className="text-xs font-semibold text-brand-text-primary">
                    Issue Final Form-B Rejection Notice or 48-Hour Final Extension
                  </div>
                  <p className="text-xs text-brand-text-muted leading-relaxed">
                    {application.criticalBlocker.question3_nextAction}
                  </p>
                </div>
              </div>

              {/* Downstream Dependents Halted */}
              <div className="flex flex-wrap items-center gap-4 text-xs bg-brand-subtle/40 p-2.5 rounded border border-brand-border">
                <span className="text-[10px] uppercase font-bold text-brand-text-muted">Downstream Dependents Halted:</span>
                {application.criticalBlocker.downstreamHalted.map((item, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 text-brand-text-primary font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-alert-red" />
                    <span>{item}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Split Screen Operational Workbench */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column: Dossier Tabs & Audit Log (65% / col-span-8) */}
            <div className="lg:col-span-8 space-y-5">
              {/* Tabbed Administrative Dossier */}
              <div className="bg-white rounded-lg border border-brand-border shadow-xs overflow-hidden">
                <div className="flex border-b border-brand-border bg-brand-subtle px-4 pt-3 gap-1 overflow-x-auto">
                  <button
                    onClick={() => setActiveTab('deficiencies')}
                    className={`px-3.5 py-2 text-xs font-bold rounded-t border-t border-x transition-colors flex items-center gap-2 cursor-pointer ${
                      activeTab === 'deficiencies'
                        ? 'text-brand-forest bg-white border-brand-border shadow-xs'
                        : 'text-brand-text-muted border-transparent hover:text-brand-text-primary'
                    }`}
                  >
                    <span>Deficiencies & Scrutiny Observations</span>
                    <span className="bg-brand-alert-red text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">1</span>
                    <span className="bg-brand-forest text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">2</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('undertakings')}
                    className={`px-3.5 py-2 text-xs font-medium rounded-t border-t border-x transition-colors flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'undertakings'
                        ? 'text-brand-forest bg-white border-brand-border font-bold shadow-xs'
                        : 'text-brand-text-muted border-transparent hover:text-brand-text-primary'
                    }`}
                  >
                    <span>Statutory Undertakings</span>
                    <span className="text-brand-forest text-[14px] material-symbols-outlined">check_small</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('infra')}
                    className={`px-3.5 py-2 text-xs font-medium rounded-t border-t border-x transition-colors cursor-pointer ${
                      activeTab === 'infra'
                        ? 'text-brand-forest bg-white border-brand-border font-bold shadow-xs'
                        : 'text-brand-text-muted border-transparent hover:text-brand-text-primary'
                    }`}
                  >
                    <span>Infrastructure & Land Parcels</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('cadre')}
                    className={`px-3.5 py-2 text-xs font-medium rounded-t border-t border-x transition-colors cursor-pointer ${
                      activeTab === 'cadre'
                        ? 'text-brand-forest bg-white border-brand-border font-bold shadow-xs'
                        : 'text-brand-text-muted border-transparent hover:text-brand-text-primary'
                    }`}
                  >
                    <span>Faculty Cadre & Programs</span>
                  </button>
                </div>

                {/* Tab Content */}
                <div className="p-5 space-y-4">
                  {activeTab === 'deficiencies' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm text-brand-forest font-bold">Deficiency Registry Matrix</h3>
                          <p className="text-xs text-brand-text-muted">Statutory verification records per AICTE Regulations 2026</p>
                        </div>
                        <button
                          onClick={() => triggerToast('Scrutiny Form-A/B Dossier exported (PDF)')}
                          className="text-xs text-brand-forest font-bold flex items-center gap-1 hover:underline cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">file_download</span>
                          Export Scrutiny Form-A/B Dossier
                        </button>
                      </div>

                      <div className="space-y-3">
                        {application.deficiencies.map((item) => (
                          <div
                            key={item.id}
                            className={`rounded-lg p-4 border space-y-3 shadow-xs ${
                              item.isCritical ? 'bg-brand-subtle/50 border-brand-border' : 'bg-brand-subtle/30 border-brand-border opacity-95'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                              <div className="flex items-start gap-2.5">
                                <span
                                  className={`w-6 h-6 rounded text-white font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                                    item.isCritical ? 'bg-brand-alert-red' : 'bg-brand-forest'
                                  }`}
                                >
                                  {item.orderNum}
                                </span>
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm text-brand-forest font-bold">{item.title}</span>
                                    {item.isCritical && (
                                      <span className="bg-brand-alert-red text-white text-[10px] px-2 py-0.2 rounded font-bold uppercase">
                                        CRITICAL • BLOCKING
                                      </span>
                                    )}
                                    <span className="bg-brand-subtle text-brand-text-primary font-mono text-[10px] px-1.5 rounded border border-brand-border">
                                      {item.refCode}
                                    </span>
                                  </div>
                                  <div className="text-xs text-brand-text-muted mt-1">{item.requirement}</div>
                                </div>
                              </div>

                              <span
                                className={`text-xs px-2 py-0.5 rounded font-mono font-bold self-start border ${
                                  item.status === 'deficient'
                                    ? 'text-brand-alert-red bg-brand-alert-bg border-brand-alert-red/30'
                                    : 'text-brand-forest bg-brand-forest-light border-brand-forest/20'
                                }`}
                              >
                                {item.status === 'deficient' ? 'DEFICIENT (RE-SCRUTINY)' : 'COMPLIANT / VERIFIED'}
                              </span>
                            </div>

                            {/* Officer Observations & Response */}
                            <div className="bg-white p-3 rounded border border-brand-border space-y-2 text-xs">
                              <div className="flex items-start gap-2">
                                <span className="material-symbols-outlined text-brand-text-muted text-[16px] mt-0.5">
                                  account_circle
                                </span>
                                <div>
                                  <span className="font-semibold text-brand-text-primary">{item.officerName}: </span>
                                  <span className="text-brand-text-muted">"{item.officerComment}"</span>
                                  <span className="text-brand-text-muted font-mono text-[10px] ml-1">({item.officerDate})</span>
                                </div>
                              </div>

                              {item.applicantResponse && (
                                <div className="flex items-start gap-2 bg-brand-subtle/60 p-2 rounded border border-brand-border">
                                  <span className="material-symbols-outlined text-brand-copper text-[16px] mt-0.5">
                                    forward_to_inbox
                                  </span>
                                  <div>
                                    <span className="font-semibold text-brand-copper">Institution Representative Response: </span>
                                    <span className="text-brand-text-muted">"{item.applicantResponse}"</span>
                                    <span className="text-brand-text-muted font-mono text-[10px] ml-1">({item.applicantDate})</span>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Actions & File Link */}
                            {item.isCritical && (
                              <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                                <div className="flex items-center gap-2 text-[11px] text-brand-text-muted font-mono">
                                  <span>File: {item.attachedFile?.name || 'Supplementary_Deed_v2.pdf'} ({item.attachedFile?.size || '8.4 MB'})</span>
                                  <span>•</span>
                                  <a
                                    onClick={() => triggerToast('Opening PDF inline preview in secure reader')}
                                    className="text-brand-forest hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                                  >
                                    <span className="material-symbols-outlined text-[13px]">visibility</span> View In-Line
                                  </a>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => triggerToast('Physical verification request dispatched to Sub-Registrar')}
                                    className="px-2.5 py-1 bg-white text-brand-text-primary text-xs rounded hover:bg-brand-subtle transition-colors font-semibold border border-brand-border cursor-pointer"
                                  >
                                    Request Physical Verification
                                  </button>
                                  <button
                                    onClick={() => openAction('accept_rectification', item.id)}
                                    className="px-2.5 py-1 bg-brand-forest text-white text-xs rounded hover:bg-brand-forest-hover transition-colors font-semibold cursor-pointer"
                                  >
                                    Accept Rectification
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'undertakings' && (
                    <div className="space-y-3 text-xs">
                      <div className="font-bold text-brand-forest text-sm">Mandatory Statutory Undertakings</div>
                      <div className="divide-y divide-brand-border border border-brand-border rounded-lg bg-white">
                        {application.undertakings.map((u) => (
                          <div key={u.id} className="p-3.5 flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-brand-text-primary">{u.title}</span>
                                <span className="font-mono text-[10px] bg-brand-subtle px-1.5 rounded border border-brand-border">{u.refCode}</span>
                              </div>
                              <p className="text-brand-text-muted mt-1">{u.clause}</p>
                              <div className="text-[11px] text-brand-text-muted mt-1 font-mono">Submitted: {u.submittedDate} • Verified by: {u.verifiedBy || 'Pending'}</div>
                            </div>
                            <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                              u.status === 'compliant' ? 'bg-brand-forest-light text-brand-forest border-brand-forest/20' : 'bg-brand-alert-bg text-brand-alert-red border-brand-alert-red/30'
                            }`}>
                              {u.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'infra' && (
                    <div className="space-y-3 text-xs">
                      <div className="font-bold text-brand-forest text-sm">Campus Infrastructure & Land Details</div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div className="bg-brand-subtle/50 p-3 rounded border border-brand-border">
                          <div className="text-brand-text-muted text-[10px] uppercase font-bold">Total Land Parcel</div>
                          <div className="text-base font-bold font-mono text-brand-forest mt-0.5">5.20 Acres</div>
                          <div className="text-[11px] text-brand-text-muted">Knowledge Park III</div>
                        </div>
                        <div className="bg-brand-subtle/50 p-3 rounded border border-brand-border">
                          <div className="text-brand-text-muted text-[10px] uppercase font-bold">Built-up Area (PWD Certified)</div>
                          <div className="text-base font-bold font-mono text-brand-forest mt-0.5">18,400 Sq.m</div>
                          <div className="text-[11px] text-brand-text-muted">Block A & B Completed</div>
                        </div>
                        <div className="bg-brand-subtle/50 p-3 rounded border border-brand-border">
                          <div className="text-brand-text-muted text-[10px] uppercase font-bold">Floor Area Ratio (FAR)</div>
                          <div className="text-base font-bold font-mono text-brand-forest mt-0.5">1.50 FAR</div>
                          <div className="text-[11px] text-brand-text-muted">Approved by GNIDA</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'cadre' && (
                    <div className="space-y-3 text-xs">
                      <div className="font-bold text-brand-forest text-sm">Academic Programs & Faculty Cadre</div>
                      <div className="bg-white border border-brand-border rounded-lg overflow-hidden">
                        <table className="w-full text-left">
                          <thead className="bg-brand-subtle text-[10px] uppercase font-bold text-brand-text-muted border-b border-brand-border">
                            <tr>
                              <th className="p-2.5">Program</th>
                              <th className="p-2.5">Approved Intake</th>
                              <th className="p-2.5">Required Cadre (1:15)</th>
                              <th className="p-2.5">Identified Faculty</th>
                              <th className="p-2.5">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-brand-border">
                            <tr>
                              <td className="p-2.5 font-semibold">B.Tech Computer Science & Engg</td>
                              <td className="p-2.5 font-mono">120 Seats</td>
                              <td className="p-2.5 font-mono">1 Prof, 2 Assoc, 5 Asst</td>
                              <td className="p-2.5 font-mono">8 Biometric IDs</td>
                              <td className="p-2.5 text-brand-forest font-bold">Compliant</td>
                            </tr>
                            <tr>
                              <td className="p-2.5 font-semibold">B.Tech Electronics & Comm</td>
                              <td className="p-2.5 font-mono">60 Seats</td>
                              <td className="p-2.5 font-mono">1 Prof, 1 Assoc, 2 Asst</td>
                              <td className="p-2.5 font-mono">4 Biometric IDs</td>
                              <td className="p-2.5 text-brand-forest font-bold">Compliant</td>
                            </tr>
                            <tr>
                              <td className="p-2.5 font-semibold">B.Tech Mechanical Engg</td>
                              <td className="p-2.5 font-mono">90 Seats</td>
                              <td className="p-2.5 font-mono">1 Prof, 1 Assoc, 4 Asst</td>
                              <td className="p-2.5 font-mono">6 Biometric IDs</td>
                              <td className="p-2.5 text-brand-forest font-bold">Compliant</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Audit Trail & Regulatory Activity Log */}
              <div className="bg-white rounded-lg p-5 border border-brand-border shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-brand-forest text-[20px]">history_edu</span>
                    <h3 className="text-sm text-brand-forest font-bold">Statutory Activity & Scrutiny Audit Log</h3>
                  </div>
                  <span className="text-xs text-brand-text-muted font-mono">CRYPTOGRAPHIC LOG SEAL: SHA-256 #8F9A2B</span>
                </div>

                <div className="relative pl-6 space-y-4">
                  <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-brand-border" />

                  {application.auditLog.map((log) => (
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
                      <div className="bg-brand-subtle/50 p-3 rounded border border-brand-border space-y-1">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-bold uppercase ${
                              log.type === 'alert' ? 'text-brand-alert-red' : 'text-brand-forest'
                            }`}
                          >
                            {log.title}
                          </span>
                          <span className="font-mono text-[11px] text-brand-text-muted">{log.timestamp}</span>
                        </div>
                        <p className="text-xs text-brand-text-primary leading-relaxed">{log.description}</p>
                        <div className="text-[10px] text-brand-text-muted font-mono flex items-center justify-between pt-1">
                          <span>{log.actor}</span>
                          {log.sha256 && <span className="text-brand-forest font-semibold">Seal: {log.sha256}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Officers, Runway, Profile & Documents (35% / col-span-4) */}
            <div className="lg:col-span-4 space-y-5">
              {/* Statutory SLA Runway Gauge */}
              <div className="bg-white rounded-lg p-5 border border-brand-border shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-brand-alert-red text-[20px]">pace</span>
                    <h3 className="text-sm text-brand-forest font-bold">Statutory SLA Runway</h3>
                  </div>
                  <span className="text-brand-alert-red font-mono text-[11px] font-bold bg-brand-alert-bg px-2 py-0.5 rounded border border-brand-alert-red/30">
                    +24h EXCEEDED
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="text-brand-text-muted font-medium">Processing Time Expended:</span>
                    <span className="font-mono font-bold text-brand-alert-red text-sm">
                      {application.daysExpended} Days (Limit: {application.statutoryCeiling} Days)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-brand-subtle rounded-full overflow-hidden flex border border-brand-border">
                    <div className="h-full bg-brand-forest" style={{ width: '33%' }} title="Stage 1 & 2: 5 Days" />
                    <div className="h-full bg-brand-copper" style={{ width: '60%' }} title="Stage 3: Standard Window (9 Days)" />
                    <div className="h-full bg-brand-alert-red animate-pulse" style={{ width: '7%' }} title="Overdue: 2 Days" />
                  </div>
                  <div className="flex justify-between text-[10px] text-brand-text-muted font-mono pt-1">
                    <span>Day 00 (Submission)</span>
                    <span>Day 15 (APH Max)</span>
                    <span className="text-brand-alert-red font-bold">Day {application.daysExpended} (Now)</span>
                  </div>
                </div>
                <div className="bg-brand-subtle/50 p-3 rounded text-[11px] text-brand-text-muted space-y-1 border border-brand-border">
                  <div className="font-bold text-brand-text-primary flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-brand-alert-red">gavel</span>
                    Statutory Regulatory Impact:
                  </div>
                  <p>
                    Under Section 6.2 of the Approval Process Handbook, any application surpassing 15 days without approval or rejection notice triggers mandatory audit logging with the AICTE National Grievance Council.
                  </p>
                </div>
              </div>

              {/* Assigned Regulatory Officers & Panel */}
              <div className="bg-white rounded-lg p-5 border border-brand-border shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-brand-forest text-[20px]">badge</span>
                    <h3 className="text-sm text-brand-forest font-bold">Review Directorate</h3>
                  </div>
                  <span className="text-[10px] font-mono text-brand-text-muted">NRO-SCR-PANEL-02</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 bg-brand-subtle/60 p-2.5 rounded border border-brand-border">
                    <div className="w-8 h-8 rounded bg-brand-forest text-white font-bold text-xs flex items-center justify-center shrink-0">
                      PV
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-brand-text-primary">{application.assignedOfficer.name}</div>
                        <span className="bg-brand-forest-light text-brand-forest text-[9px] font-bold px-1.5 py-0.2 rounded border border-brand-forest/20">
                          PRIMARY
                        </span>
                      </div>
                      <div className="text-[12px] text-brand-text-muted">{application.assignedOfficer.role}</div>
                      <div className="font-mono text-[10px] text-brand-text-muted mt-0.5">
                        Assigned: 10 Feb 2026 • Auth: {application.assignedOfficer.authId}
                      </div>
                    </div>
                  </div>

                  {application.associateOfficer && (
                    <div className="flex items-start gap-3 bg-brand-subtle/60 p-2.5 rounded border border-brand-border">
                      <div className="w-8 h-8 rounded bg-brand-border text-brand-text-primary font-bold text-xs flex items-center justify-center shrink-0">
                        MJ
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-bold text-brand-text-primary">{application.associateOfficer.name}</div>
                          <span className="bg-white text-brand-text-muted text-[9px] font-bold px-1.5 py-0.2 rounded border border-brand-border">
                            LEGAL REVIEW
                          </span>
                        </div>
                        <div className="text-[12px] text-brand-text-muted">{application.associateOfficer.role}</div>
                        <div className="font-mono text-[10px] text-brand-text-muted mt-0.5">
                          Assigned: 12 Feb 2026 • Auth: {application.associateOfficer.authId}
                        </div>
                      </div>
                    </div>
                  )}

                  {application.evcConvener && (
                    <div className="flex items-start gap-3 bg-white p-2.5 rounded border border-dashed border-brand-border">
                      <div className="w-8 h-8 rounded bg-brand-subtle text-brand-text-muted font-bold text-xs flex items-center justify-center shrink-0">
                        SS
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-semibold text-brand-text-muted">{application.evcConvener.name}</div>
                          <span className="bg-brand-subtle text-brand-text-muted text-[9px] font-semibold px-1 rounded">
                            TENTATIVE CONVENER
                          </span>
                        </div>
                        <div className="text-[12px] text-brand-text-muted">{application.evcConvener.affiliation}</div>
                        <div className="font-mono text-[10px] text-brand-alert-red mt-0.5">
                          {application.evcConvener.status}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Institutional Profile */}
              <div className="bg-white rounded-lg p-5 border border-brand-border shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-brand-forest text-[20px]">account_balance</span>
                    <h3 className="text-sm text-brand-forest font-bold">Institutional Profile</h3>
                  </div>
                  <a href="#" className="text-xs text-brand-forest font-bold hover:underline">Full Master Registry</a>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-brand-border">
                    <span className="text-brand-text-muted">Managing Society:</span>
                    <span className="font-medium text-brand-text-primary text-right">{application.institutionProfile.managingSociety}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-brand-border">
                    <span className="text-brand-text-muted">Society Reg. No:</span>
                    <span className="font-mono text-brand-text-primary font-semibold">{application.institutionProfile.societyRegNo}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-brand-border">
                    <span className="text-brand-text-muted">Principal-Designate:</span>
                    <span className="font-medium text-brand-text-primary">{application.institutionProfile.principalDesignate}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-brand-border">
                    <span className="text-brand-text-muted">Official Contact:</span>
                    <span className="font-mono text-brand-text-primary text-[12px]">{application.institutionProfile.officialEmail}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-brand-border">
                    <span className="text-brand-text-muted">Campus Phone:</span>
                    <span className="font-mono text-brand-text-primary">{application.institutionProfile.campusPhone}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-brand-text-muted">Affiliating University:</span>
                    <span className="font-medium text-brand-text-primary">{application.institutionProfile.affiliatingUniversity}</span>
                  </div>
                </div>
              </div>

              {/* Attached Statutory Documents Quick-Drawer */}
              <div className="bg-white rounded-lg p-5 border border-brand-border shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-brand-forest text-[20px]">folder</span>
                    <h3 className="text-sm text-brand-forest font-bold">Statutory Dossiers</h3>
                  </div>
                  <span className="font-mono text-[10px] text-brand-text-muted font-bold">
                    {application.documents.length} FILES FILED
                  </span>
                </div>
                <div className="space-y-2">
                  {application.documents.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => triggerToast(`Previewing ${doc.name} in secure Gov-Viewer`)}
                      className="flex items-center justify-between p-2.5 bg-brand-subtle/50 rounded border border-brand-border hover:bg-brand-subtle transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`material-symbols-outlined text-[20px] ${doc.status === 'deficient' ? 'text-brand-alert-red' : 'text-brand-forest'}`}>
                          picture_as_pdf
                        </span>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-brand-text-primary truncate group-hover:text-brand-forest transition-colors">
                            {doc.name}
                          </div>
                          <div className="text-[11px] text-brand-text-muted font-mono">{doc.size} • Uploaded {doc.uploadDate}</div>
                        </div>
                      </div>
                      <span
                        className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                          doc.status === 'deficient'
                            ? 'bg-brand-alert-red text-white'
                            : 'bg-brand-forest-light text-brand-forest border border-brand-forest/20'
                        }`}
                      >
                        {doc.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => triggerToast('Generating complete zipped regulatory packet...')}
                  className="w-full py-2 bg-brand-subtle text-brand-text-primary text-xs rounded hover:bg-brand-border transition-colors font-semibold flex items-center justify-center gap-1.5 border border-brand-border cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">cloud_download</span>
                  Download Digital Application Dossier (.ZIP)
                </button>
              </div>
            </div>
          </div>

          {/* Floating Quick Regulatory Footnote */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-brand-subtle/50 rounded-lg text-xs text-brand-text-muted border border-brand-border">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-brand-forest text-[16px]">lock_clock</span>
              <span>Session Authenticated: Dr. R. K. Srivastava (Member Secretary - RO Auth) | Machine Node: DEL-NRO-02</span>
            </div>
            <div className="font-mono text-[11px]">
              Approval Process Handbook Standard: AICTE Regs (Grant of Approvals for Technical Institutions) 2026
            </div>
          </div>
        </main>
      </div>

      {/* Regulatory Action Modal */}
      <RegulatoryActionModal
        isOpen={modalAction !== null}
        onClose={() => setModalAction(null)}
        appId={application.id}
        institutionName={application.institutionName}
        actionType={modalAction}
        deficiencyId={selectedDefId}
        onSuccess={() => {
          loadData();
          triggerToast('Regulatory action recorded and cryptographic audit hash updated.');
        }}
      />
    </div>
  );
}
