'use client';

import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

export default function ApprovalWorkflowPage() {
  const pathways = [
    {
      category: 'New Technical Institution',
      refCode: 'APH CH-II SEC-2',
      duration: '15 Working Days',
      stages: ['Digital Intake', 'Scrutiny Panel', 'EVC Inspection (Mandatory)', 'Regional Recommendation', 'Council Approval'],
      note: 'Requires 100% physically inspected land deed, fire NOC, PWD structural clearance, and ₹1.00 Cr joint FDR.',
    },
    {
      category: 'Extension of Approval (EoA)',
      refCode: 'APH CH-I SEC-1',
      duration: '7 Working Days',
      stages: ['Self-Disclosure Intake', 'Automated Deficiency Engine', 'Random Surprise EVC (10% Sample)', 'Digital LoA'],
      note: 'Auto-reconciles faculty cadre ratios and NBA accreditation without mandatory physical EVC visit.',
    },
    {
      category: 'Intake Expansion / New Programs',
      refCode: 'APH CH-III SEC-4',
      duration: '12 Working Days',
      stages: ['Expansion Intake', 'Cadre & Built-Up Area Audit', 'Targeted EVC Audit', 'Council LoA'],
      note: 'Prerequisite: Valid NBA accreditation in existing disciplines and verified contiguous surplus built-up area.',
    },
    {
      category: 'Closure / Progressive Closure',
      refCode: 'APH CH-V SEC-1',
      duration: '10 Working Days',
      stages: ['Closure Resolution Intake', 'Student Migration Safeguard Plan', 'Faculty Severance Audit', 'Final NOC'],
      note: 'Guarantees continuation of currently enrolled batches until graduation under affiliating university.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-brand-ivory text-brand-text-primary selection:bg-brand-forest selection:text-white">
      <Header />
      <div className="flex-1 flex w-full">
        <Sidebar />

        <main className="flex-1 min-w-0 p-5 md:p-6 lg:p-7 space-y-5">
          <div className="bg-white p-5 rounded-lg border border-brand-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-brand-forest">account_tree</span>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-brand-forest-light text-brand-forest border border-brand-forest/20">
                  STATUTORY ROUTING MATRIX
                </span>
              </div>
              <h1 className="text-2xl font-bold text-brand-forest tracking-tight mt-1">
                Approval Workflow Architecture
              </h1>
              <p className="text-xs text-brand-text-muted mt-0.5">
                Rule-based routing engine enforcing category-specific statutory pathways under AICTE Regulations 2026.
              </p>
            </div>
            <Link
              href="/workflow-intelligence"
              className="px-3.5 py-2 bg-brand-forest hover:bg-brand-forest-hover text-white text-xs font-semibold rounded shadow-xs flex items-center gap-1.5 self-start md:self-auto"
            >
              <span className="material-symbols-outlined text-[16px]">hub</span>
              <span>Open Dependency Simulator</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {pathways.map((p, idx) => (
              <div key={idx} className="bg-white p-5 rounded-lg border border-brand-border shadow-xs space-y-4">
                <div className="flex items-start justify-between pb-3 border-b border-brand-border">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-brand-copper bg-brand-copper-bg px-2 py-0.5 rounded border border-brand-copper/30">
                      {p.refCode}
                    </span>
                    <h3 className="text-base font-bold text-brand-forest mt-1.5">{p.category}</h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-brand-forest bg-brand-subtle px-2 py-1 rounded border border-brand-border">
                    {p.duration} Max
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="font-semibold text-brand-text-muted text-[10px] uppercase">Statutory Transition Pathway:</div>
                  <div className="space-y-1.5">
                    {p.stages.map((st, i) => (
                      <div key={i} className="flex items-center gap-2 bg-brand-subtle/50 p-2 rounded border border-brand-border">
                        <span className="w-5 h-5 rounded-full bg-brand-forest text-white text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        <span className="font-medium text-brand-text-primary">{st}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-brand-subtle/40 rounded text-xs text-brand-text-muted border border-brand-border">
                  <span className="font-bold text-brand-text-primary">Regulatory Prerequisite: </span>
                  {p.note}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
