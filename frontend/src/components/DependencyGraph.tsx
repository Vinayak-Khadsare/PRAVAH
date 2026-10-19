'use client';

import React, { useState } from 'react';

interface StageNode {
  id: string;
  stageNumber: number;
  label: string;
  sublabel: string;
  x: number;
  y: number;
  status: 'completed' | 'active_blocked' | 'locked' | 'conditional';
  slaCeiling: string;
  leadOfficer: string;
  prerequisites: string[];
  blockerDetails?: string;
  downstreamHalted?: string[];
}

export default function DependencyGraph() {
  const [selectedNode, setSelectedNode] = useState<string>('stage_03');
  const [simulationScenario, setSimulationScenario] = useState<string>('current');

  const nodes: StageNode[] = [
    {
      id: 'stage_01',
      stageNumber: 1,
      label: 'Intake Submission',
      sublabel: 'Digital Dossier & Fees',
      x: 100,
      y: 140,
      status: 'completed',
      slaCeiling: '3 Days',
      leadOfficer: 'Pravah Intake Gateway',
      prerequisites: ['Trust Registration Certificate', 'AICTE Processing Fee ₹7.00L', 'Basic Digital Form-A'],
    },
    {
      id: 'stage_02',
      stageNumber: 2,
      label: 'Scrutiny Committee',
      sublabel: 'Legal & Cadre Audit',
      x: 290,
      y: 140,
      status: 'completed',
      slaCeiling: '4 Days',
      leadOfficer: 'Panel 02 (Dr. P. K. Verma)',
      prerequisites: ['Sub-Registrar Land Title Verification', 'Fire Safety NOC Form-F', 'Faculty Cadre Bio-ID'],
      blockerDetails: 'Passed with 1 deficiency flag issued on 22 Feb.',
    },
    {
      id: 'stage_03',
      stageNumber: 3,
      label: 'Re-Scrutiny & Cure',
      sublabel: 'Deficiency Notice Form-B',
      x: 480,
      y: 140,
      status: simulationScenario === 'rectified' ? 'completed' : 'active_blocked',
      slaCeiling: '8 Days',
      leadOfficer: 'Dr. P. K. Verma (Sr. RO)',
      prerequisites: ['Attested Folios 14-18 Sub-Registrar Stamp', 'Tehsildar Khasra Map'],
      blockerDetails: simulationScenario === 'rectified' ? 'Rectification verified. Blocker cleared.' : 'APH Rule 2.4.1 Land Deed non-compliance. Cure window elapsed 24h.',
      downstreamHalted: simulationScenario === 'rectified' ? [] : ['EVC Panel Constitution', 'Architectural Cadre Clearance', 'Approval Key Generation'],
    },
    {
      id: 'stage_04',
      stageNumber: 4,
      label: 'Expert Visit (EVC)',
      sublabel: 'Physical Campus Audit',
      x: 670,
      y: 140,
      status: simulationScenario === 'rectified' ? 'completed' : (simulationScenario === 'grace' ? 'active_blocked' : 'locked'),
      slaCeiling: '5 Days',
      leadOfficer: 'Prof. S. Sen (IIT Roorkee)',
      prerequisites: ['Stage 03 Scrutiny Clean Sign-off', '3-Member Panel Constitution', 'Geofenced Campus Biometric Gateway'],
      blockerDetails: simulationScenario === 'rectified' ? 'Panel dispatched.' : 'Dispatch withheld pending Land Title clearance.',
    },
    {
      id: 'stage_05',
      stageNumber: 5,
      label: 'Standing Hearing / SAC',
      sublabel: 'Appellate Committee',
      x: 860,
      y: 70,
      status: simulationScenario === 'escalate' ? 'active_blocked' : 'conditional',
      slaCeiling: '7 Days',
      leadOfficer: 'Member Secretary / SAC Bench',
      prerequisites: ['Form-B Deficiency Rejection or SLA Escalation Trigger', 'Appellant Grounds Affidavit'],
    },
    {
      id: 'stage_06',
      stageNumber: 6,
      label: 'Final Decision / LoA',
      sublabel: 'Council Sign-Off',
      x: 860,
      y: 210,
      status: simulationScenario === 'rectified' ? 'active_blocked' : 'locked',
      slaCeiling: '3 Days',
      leadOfficer: 'AICTE Executive Committee',
      prerequisites: ['Clean EVC Recommendation', 'No Open Deficiencies in Registry', 'Executive Committee Signature'],
    },
  ];

  const selectedNodeData = nodes.find(n => n.id === selectedNode) || nodes[2];

  return (
    <div className="space-y-6">
      {/* What-If Simulator Bar */}
      <div className="bg-white p-4 rounded-lg border border-brand-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-brand-forest text-[20px]">smart_toy</span>
            <h3 className="text-sm font-bold text-brand-forest">Statutory What-If Scenario Simulator</h3>
          </div>
          <p className="text-xs text-brand-text-muted mt-0.5">
            Simulate administrative decisions and preview cascade impacts on statutory ceilings and downstream committees.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSimulationScenario('current')}
            className={`px-3 py-1.5 rounded text-xs font-semibold border transition-all cursor-pointer ${
              simulationScenario === 'current'
                ? 'bg-brand-forest text-white border-brand-forest shadow-xs'
                : 'bg-brand-subtle text-brand-text-primary border-brand-border hover:bg-white'
            }`}
          >
            Current State (+24h Overdue)
          </button>
          <button
            onClick={() => setSimulationScenario('grace')}
            className={`px-3 py-1.5 rounded text-xs font-semibold border transition-all cursor-pointer ${
              simulationScenario === 'grace'
                ? 'bg-brand-copper text-white border-brand-copper shadow-xs'
                : 'bg-brand-subtle text-brand-text-primary border-brand-border hover:bg-white'
            }`}
          >
            Simulate: 48h Grace Notice
          </button>
          <button
            onClick={() => setSimulationScenario('rectified')}
            className={`px-3 py-1.5 rounded text-xs font-semibold border transition-all cursor-pointer ${
              simulationScenario === 'rectified'
                ? 'bg-brand-success text-white border-brand-success shadow-xs'
                : 'bg-brand-subtle text-brand-text-primary border-brand-border hover:bg-white'
            }`}
          >
            Simulate: Accept Rectification
          </button>
          <button
            onClick={() => setSimulationScenario('escalate')}
            className={`px-3 py-1.5 rounded text-xs font-semibold border transition-all cursor-pointer ${
              simulationScenario === 'escalate'
                ? 'bg-brand-alert-red text-white border-brand-alert-red shadow-xs'
                : 'bg-brand-subtle text-brand-text-primary border-brand-border hover:bg-white'
            }`}
          >
            Simulate: SAC Escalation
          </button>
        </div>
      </div>

      {/* SVG Canvas for Pipeline Dependency Nodes */}
      <div className="bg-white rounded-lg border border-brand-border shadow-xs p-6 overflow-x-auto">
        <div className="min-w-[980px] h-[300px] relative select-none">
          <svg className="w-full h-full">
            <defs>
              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#234B3C" />
                <stop offset="100%" stopColor="#B8734E" />
              </linearGradient>
            </defs>

            {/* Connecting Dependency Splines */}
            {/* Stage 1 -> 2 */}
            <line x1="170" y1="140" x2="220" y2="140" stroke="#397553" strokeWidth="3" />
            {/* Stage 2 -> 3 */}
            <line x1="360" y1="140" x2="410" y2="140" stroke="#397553" strokeWidth="3" />
            {/* Stage 3 -> 4 */}
            <line
              x1="550"
              y1="140"
              x2="600"
              y2="140"
              stroke={simulationScenario === 'rectified' ? '#397553' : '#B84040'}
              strokeWidth="3"
              strokeDasharray={simulationScenario === 'rectified' ? 'none' : '4,4'}
            />
            {/* Stage 4 -> 6 (Standard LoA path) */}
            <path
              d="M 740 140 C 780 140, 780 210, 790 210"
              fill="none"
              stroke={simulationScenario === 'rectified' ? '#397553' : '#DCDDD4'}
              strokeWidth="2.5"
            />
            {/* Stage 3 -> 5 (SAC Appeal path) */}
            <path
              d="M 550 140 C 650 140, 720 70, 790 70"
              fill="none"
              stroke={simulationScenario === 'escalate' ? '#B84040' : '#DCDDD4'}
              strokeWidth="2"
              strokeDasharray="4,4"
            />
            {/* Stage 5 -> 6 (SAC Decision path) */}
            <line x1="860" y1="105" x2="860" y2="175" stroke="#DCDDD4" strokeWidth="2" strokeDasharray="3,3" />

            {/* Render Nodes */}
            {nodes.map((node) => {
              const isSelected = selectedNode === node.id;
              let bgColor = '#FFFFFF';
              let borderColor = '#DCDDD4';
              let badgeColor = '#59655D';

              if (node.status === 'completed') {
                borderColor = '#397553';
                badgeColor = '#397553';
              } else if (node.status === 'active_blocked') {
                borderColor = '#B84040';
                badgeColor = '#B84040';
              } else if (node.status === 'conditional') {
                borderColor = '#B7791F';
                badgeColor = '#B7791F';
              }

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x - 70}, ${node.y - 35})`}
                  onClick={() => setSelectedNode(node.id)}
                  className="cursor-pointer group"
                >
                  <rect
                    width="140"
                    height="70"
                    rx="8"
                    fill={bgColor}
                    stroke={isSelected ? '#234B3C' : borderColor}
                    strokeWidth={isSelected ? '3' : '2'}
                    className="transition-all filter drop-shadow-xs"
                  />
                  {/* Status Indicator Dot */}
                  <circle
                    cx="15"
                    cy="20"
                    r="5"
                    fill={badgeColor}
                    className={node.status === 'active_blocked' ? 'animate-pulse' : ''}
                  />
                  {/* Label */}
                  <text x="26" y="24" fontSize="11" fontWeight="700" fill="#1E2621">
                    STAGE 0{node.stageNumber}
                  </text>
                  <text x="12" y="42" fontSize="11" fontWeight="600" fill="#234B3C">
                    {node.label}
                  </text>
                  <text x="12" y="56" fontSize="9" fill="#59655D" fontFamily="monospace">
                    {node.sublabel}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="pt-4 border-t border-brand-border flex flex-wrap items-center justify-between text-xs text-brand-text-muted">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-success" /> Completed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-alert-red animate-pulse" /> Active / Blocked
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-amber" /> Conditional Referral (SAC)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-border" /> Locked Prerequisite
            </span>
          </div>
          <span className="font-mono text-[11px]">Click any node to inspect regulatory prerequisites</span>
        </div>
      </div>

      {/* Selected Node Inspection Card */}
      <div className="bg-white p-5 rounded-lg border border-brand-border shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-brand-border">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-brand-subtle text-brand-forest border border-brand-border">
                STAGE 0{selectedNodeData.stageNumber}
              </span>
              <h4 className="text-base font-bold text-brand-forest">{selectedNodeData.label}</h4>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded font-mono ${
                selectedNodeData.status === 'completed'
                  ? 'bg-brand-forest-light text-brand-forest border border-brand-forest/20'
                  : selectedNodeData.status === 'active_blocked'
                  ? 'bg-brand-alert-bg text-brand-alert-red border border-brand-alert-red/30'
                  : 'bg-brand-subtle text-brand-text-muted'
              }`}>
                {selectedNodeData.status}
              </span>
            </div>
            <p className="text-xs text-brand-text-muted mt-1">Lead Officer: {selectedNodeData.leadOfficer}</p>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-brand-text-muted">APH Statutory Ceiling</div>
            <div className="text-sm font-bold font-mono text-brand-forest">{selectedNodeData.slaCeiling}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Prerequisites */}
          <div className="space-y-2">
            <div className="font-bold text-brand-forest flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">check_box</span>
              Mandatory Statutory Prerequisites
            </div>
            <ul className="space-y-1.5">
              {selectedNodeData.prerequisites.map((p, idx) => (
                <li key={idx} className="flex items-start gap-2 text-brand-text-primary bg-brand-subtle/50 p-2 rounded border border-brand-border">
                  <span className="material-symbols-outlined text-brand-forest text-[14px] mt-0.5">verified</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Blockers & Impact */}
          <div className="space-y-2">
            <div className="font-bold text-brand-alert-red flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">report_problem</span>
              Blocker Details & Downstream Cascade
            </div>
            <div className="p-3 rounded bg-brand-subtle/60 border border-brand-border space-y-2 text-brand-text-primary">
              <p>{selectedNodeData.blockerDetails || 'No current blockers on this stage node.'}</p>
              {selectedNodeData.downstreamHalted && selectedNodeData.downstreamHalted.length > 0 && (
                <div className="pt-2 border-t border-brand-border/60">
                  <div className="font-semibold text-brand-alert-red text-[11px] mb-1">Downstream Operations Halted:</div>
                  <ul className="space-y-1">
                    {selectedNodeData.downstreamHalted.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-1.5 text-[11px] text-brand-text-muted">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-alert-red" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
