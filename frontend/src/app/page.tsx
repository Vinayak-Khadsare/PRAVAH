'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ThreeHeroScene from '@/components/ThreeHeroScene';
import GlassLoginModal from '@/components/GlassLoginModal';

export default function LandingPage() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-brand-ivory text-brand-charcoal selection:bg-brand-copper/20 selection:text-brand-forest">
      {/* Top Institutional Bar */}
      <header className="sticky top-0 z-40 border-b border-brand-border/80 bg-brand-ivory/95 backdrop-blur-md transition-all">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Brand & Emblem */}
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded bg-brand-forest flex items-center justify-center text-brand-ivory font-semibold text-sm tracking-wider shadow-sm border border-brand-forest-dark">
              PR
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-brand-forest leading-none">
                  PRAVAH
                </span>
                <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-brand-sage text-brand-forest-dark border border-brand-border">
                  TIER-1 OPS
                </span>
              </div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-brand-charcoal/60 leading-none">
                AICTE Approval Operations Platform
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-brand-charcoal/80">
            <a href="#platform" className="hover:text-brand-forest transition-colors py-1 border-b-2 border-transparent hover:border-brand-copper">
              Platform
            </a>
            <a href="#workflow" className="hover:text-brand-forest transition-colors py-1 border-b-2 border-transparent hover:border-brand-copper">
              Workflow Architecture
            </a>
            <a href="#compliance" className="hover:text-brand-forest transition-colors py-1 border-b-2 border-transparent hover:border-brand-copper">
              Compliance & EVC
            </a>
            <a href="#intelligence" className="hover:text-brand-forest transition-colors py-1 border-b-2 border-transparent hover:border-brand-copper">
              Pendency Intelligence
            </a>
          </nav>

          {/* Access CTAs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="px-4 py-2 text-xs font-semibold text-brand-forest hover:bg-brand-sage/70 rounded transition-all border border-transparent hover:border-brand-border flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-brand-copper">login</span>
              Sign In
            </button>
            <Link
              href="/dashboard"
              className="px-4 py-2 text-xs font-semibold bg-brand-forest text-brand-ivory rounded shadow-sm hover:bg-brand-forest-dark transition-all border border-brand-forest-dark flex items-center gap-1.5"
            >
              <span>Operations Console</span>
              <span className="material-symbols-outlined text-[16px] text-brand-copper-light">arrow_forward</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Full-Screen Hero Section with Autonomous 3D Approval Workflow Canvas */}
      <section className="relative min-h-[92svh] lg:min-h-[96svh] flex items-center border-b border-brand-border bg-gradient-to-b from-brand-ivory via-brand-ivory to-[#F2EFE5] overflow-hidden">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 grid-pattern opacity-45 pointer-events-none z-0" />

        {/* Full-bleed 3D Autonomous Approval Pipeline Scene */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
          <ThreeHeroScene />
        </div>

        {/* Strategic readability gradient overlay for left-hand textual content */}
        <div className="absolute inset-y-0 left-0 w-full lg:w-3/5 bg-gradient-to-r from-brand-ivory/95 via-brand-ivory/80 to-transparent pointer-events-none z-[1]" />

        {/* Foreground Content Region */}
        <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16 w-full h-full relative z-10 flex flex-col justify-center pointer-events-none">
          <div className="max-w-xl lg:max-w-2xl space-y-6 pointer-events-auto">
            {/* Regulatory Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-brand-sage/90 border border-brand-border text-xs font-mono font-medium text-brand-forest shadow-2xs backdrop-blur-xs">
              <span className="w-2 h-2 rounded-full bg-brand-copper animate-pulse" />
              <span>AICTE APPROVAL OPERATIONS PLATFORM • APH 2026</span>
            </div>

            {/* Main Institutional Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-brand-charcoal tracking-tight leading-[1.08]">
              Every approval.<br />
              Every deadline.<br />
              <span className="text-brand-forest">Under control.</span>
            </h1>

            {/* Strategic Description */}
            <p className="text-base sm:text-lg text-brand-charcoal/85 leading-relaxed max-w-xl font-normal">
              One unified workspace to manage technical institution application workflows, coordinate Expert Visit Committee inspections, track institutional compliance, and surface delays before they become statutory bottlenecks.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href="/dashboard"
                className="px-6 py-3.5 bg-brand-forest text-brand-ivory text-sm font-semibold rounded shadow-sm hover:bg-brand-forest-dark transition-all border border-brand-forest-dark flex items-center gap-2.5 group cursor-pointer"
              >
                <span>Launch Operations Workspace</span>
                <span className="material-symbols-outlined text-[18px] text-brand-copper-light transition-transform group-hover:translate-x-1">
                  arrow_forward
                </span>
              </Link>
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="px-6 py-3.5 bg-white/90 backdrop-blur-xs text-brand-forest text-sm font-semibold rounded border border-brand-border hover:border-brand-copper/50 hover:bg-brand-sage/60 transition-all flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <span>Sign In</span>
                <span className="text-xs font-mono text-brand-charcoal/50">RO / Auth</span>
              </button>
            </div>

            {/* Trust Seal & Statutory Compliance Note */}
            <p className="text-xs font-mono text-brand-charcoal/65 pt-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-brand-forest text-[16px]">verified</span>
              <span>Autonomous statutory enforcement • Cryptographic SHA-256 case integrity</span>
            </p>

            {/* Institutional Baseline Metrics */}
            <div className="pt-4 border-t border-brand-border/80 max-w-lg space-y-2">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/85 backdrop-blur-xs p-3 rounded border border-brand-border shadow-xs">
                  <div className="text-xl font-bold font-mono text-brand-forest">1,428</div>
                  <div className="text-[11px] text-brand-charcoal/70 uppercase font-medium">In-Process Apps</div>
                </div>
                <div className="bg-white/85 backdrop-blur-xs p-3 rounded border border-brand-border shadow-xs">
                  <div className="text-xl font-bold font-mono text-brand-copper">15 Days</div>
                  <div className="text-[11px] text-brand-charcoal/70 uppercase font-medium">Scrutiny Ceiling</div>
                </div>
                <div className="bg-white/85 backdrop-blur-xs p-3 rounded border border-brand-border shadow-xs">
                  <div className="text-xl font-bold font-mono text-brand-forest-dark">6 Zonal</div>
                  <div className="text-[11px] text-brand-charcoal/70 uppercase font-medium">Regional Offices</div>
                </div>
              </div>
              <div className="text-[10px] font-mono text-brand-charcoal/50 italic">
                *Illustrative national operations baseline under APH 2026 statutory guidelines.
              </div>
            </div>
          </div>

          {/* Autonomous Pipeline Live Telemetry Ribbon */}
          <div className="mt-8 lg:mt-12 max-w-4xl pointer-events-auto">
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-white/85 backdrop-blur-md border border-brand-border text-xs shadow-xs">
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                <span className="flex items-center gap-1.5 font-medium text-brand-charcoal">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-forest animate-pulse" />
                  <span className="font-mono text-[11px]">01 Intake</span>
                </span>
                <span className="flex items-center gap-1.5 font-medium text-brand-charcoal">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-copper" />
                  <span className="font-mono text-[11px]">02 Scrutiny</span>
                </span>
                <span className="flex items-center gap-1.5 font-medium text-brand-charcoal">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-forest-dark" />
                  <span className="font-mono text-[11px]">03 EVC Inspection</span>
                </span>
                <span className="flex items-center gap-1.5 font-medium text-brand-charcoal">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-warning" />
                  <span className="font-mono text-[11px]">04 SAC Hearing</span>
                </span>
                <span className="flex items-center gap-1.5 font-medium text-brand-charcoal">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-success" />
                  <span className="font-mono text-[11px]">05 LoA Decision</span>
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[10px] text-brand-charcoal/70">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-success" />
                <span>Autonomous 3D Pipeline • Continuous Regulatory Flow</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Workflow Strip: Progression Architecture */}
      <section className="py-8 bg-brand-sage/50 border-b border-brand-border" id="progression">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <span className="text-xs uppercase font-mono tracking-wider text-brand-copper font-semibold">
                Standard Statutory Progression Cycle
              </span>
              <h2 className="text-lg font-bold text-brand-charcoal">National Approval Pathway</h2>
            </div>
            <p className="text-xs text-brand-charcoal/60 max-w-md">
              *Note: Processing paths vary according to statutory categories (New Institution, EoA, Intake Expansion, Closure).
            </p>
          </div>

          {/* Linear Milestones Strip */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-white p-3.5 rounded border border-brand-border flex items-center gap-3">
              <div className="w-7 h-7 rounded bg-brand-forest text-brand-ivory flex items-center justify-center font-mono font-bold text-xs">
                01
              </div>
              <div>
                <div className="text-xs font-bold text-brand-charcoal">Submission</div>
                <div className="text-[10px] text-brand-charcoal/60">Digital Intake & Fees</div>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded border border-brand-border flex items-center gap-3">
              <div className="w-7 h-7 rounded bg-brand-forest text-brand-ivory flex items-center justify-center font-mono font-bold text-xs">
                02
              </div>
              <div>
                <div className="text-xs font-bold text-brand-charcoal">Scrutiny</div>
                <div className="text-[10px] text-brand-charcoal/60">Legal & Cadre Audit</div>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded border border-brand-border flex items-center gap-3">
              <div className="w-7 h-7 rounded bg-brand-copper text-brand-ivory flex items-center justify-center font-mono font-bold text-xs">
                03
              </div>
              <div>
                <div className="text-xs font-bold text-brand-charcoal">EVC (If Req.)</div>
                <div className="text-[10px] text-brand-charcoal/60">Physical Campus Audit</div>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded border border-brand-border flex items-center gap-3">
              <div className="w-7 h-7 rounded bg-brand-warning text-brand-ivory flex items-center justify-center font-mono font-bold text-xs">
                04
              </div>
              <div>
                <div className="text-xs font-bold text-brand-charcoal">Committee (SAC)</div>
                <div className="text-[10px] text-brand-charcoal/60">Appeals & Rectifications</div>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded border border-brand-border flex items-center gap-3">
              <div className="w-7 h-7 rounded bg-brand-success text-brand-ivory flex items-center justify-center font-mono font-bold text-xs">
                05
              </div>
              <div>
                <div className="text-xs font-bold text-brand-charcoal">Decision</div>
                <div className="text-[10px] text-brand-charcoal/60">LoA / Council Sign-off</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Platform Capabilities */}
      <section className="py-20 max-w-7xl mx-auto px-6" id="platform">
        <div className="max-w-2xl mb-14">
          <span className="text-xs uppercase font-mono tracking-wider text-brand-forest font-semibold">
            Institutional Operations
          </span>
          <h2 className="text-3xl font-bold text-brand-charcoal tracking-tight mt-1">
            Engineered for Public Sector Rigor
          </h2>
          <p className="text-sm text-brand-charcoal/70 mt-2">
            A resilient digital backbone handling high-stakes regulatory processing across technical colleges, polytechnics, and university faculties.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            href="/workflow"
            className="bg-white p-6 rounded-lg border border-brand-border hover:border-brand-copper/60 transition-all shadow-xs hover:shadow-subtle-elevated group"
          >
            <div className="w-10 h-10 rounded bg-brand-sage flex items-center justify-center text-brand-forest mb-4 group-hover:bg-brand-forest group-hover:text-brand-ivory transition-colors">
              <span className="material-symbols-outlined text-[20px]">fact_check</span>
            </div>
            <h3 className="text-base font-bold text-brand-charcoal">Approval Workflow Automation</h3>
            <p className="text-xs text-brand-charcoal/70 mt-2 leading-relaxed">
              Enforce multi-tier scrutiny protocols, automated Form-B deficiency issuance, and strict 15-day regulatory statutory processing ceilings.
            </p>
            <div className="mt-4 pt-3 border-t border-brand-border/60 text-[11px] font-mono text-brand-forest font-medium flex items-center gap-1">
              <span>Explore Scrutiny Engine</span> →
            </div>
          </Link>

          <Link
            href="/evc"
            className="bg-white p-6 rounded-lg border border-brand-border hover:border-brand-copper/60 transition-all shadow-xs hover:shadow-subtle-elevated group"
          >
            <div className="w-10 h-10 rounded bg-brand-sage flex items-center justify-center text-brand-forest mb-4 group-hover:bg-brand-forest group-hover:text-brand-ivory transition-colors">
              <span className="material-symbols-outlined text-[20px]">event_available</span>
            </div>
            <h3 className="text-base font-bold text-brand-charcoal">EVC Scheduling & Coordination</h3>
            <p className="text-xs text-brand-charcoal/70 mt-2 leading-relaxed">
              Coordinate Expert Visit Committee panellists, geo-fenced campus inspection slots, and automated roster availability checking under RO auth.
            </p>
            <div className="mt-4 pt-3 border-t border-brand-border/60 text-[11px] font-mono text-brand-copper font-medium flex items-center gap-1">
              <span>Inspection Workspace</span> →
            </div>
          </Link>

          <Link
            href="/compliance"
            className="bg-white p-6 rounded-lg border border-brand-border hover:border-brand-copper/60 transition-all shadow-xs hover:shadow-subtle-elevated group"
          >
            <div className="w-10 h-10 rounded bg-brand-sage flex items-center justify-center text-brand-forest mb-4 group-hover:bg-brand-forest group-hover:text-brand-ivory transition-colors">
              <span className="material-symbols-outlined text-[20px]">gavel</span>
            </div>
            <h3 className="text-base font-bold text-brand-charcoal">Institutional Compliance</h3>
            <p className="text-xs text-brand-charcoal/70 mt-2 leading-relaxed">
              Monitor 30-year registered land lease deeds, pending fire NOCs, cadre-ratio balances, and statutory FDR deposits with verification states.
            </p>
            <div className="mt-4 pt-3 border-t border-brand-border/60 text-[11px] font-mono text-brand-forest font-medium flex items-center gap-1">
              <span>Registry Monitoring</span> →
            </div>
          </Link>

          <Link
            href="/workflow-intelligence"
            className="bg-white p-6 rounded-lg border border-brand-border hover:border-brand-copper/60 transition-all shadow-xs hover:shadow-subtle-elevated group"
          >
            <div className="w-10 h-10 rounded bg-brand-sage flex items-center justify-center text-brand-forest mb-4 group-hover:bg-brand-forest group-hover:text-brand-ivory transition-colors">
              <span className="material-symbols-outlined text-[20px]">hub</span>
            </div>
            <h3 className="text-base font-bold text-brand-charcoal">Early-Warning Intelligence</h3>
            <p className="text-xs text-brand-charcoal/70 mt-2 leading-relaxed">
              Surface impending SLA breaches, unresolved stage dependencies, and unverified prerequisites before delays freeze administrative movement.
            </p>
            <div className="mt-4 pt-3 border-t border-brand-border/60 text-[11px] font-mono text-brand-forest font-medium flex items-center gap-1">
              <span>Dependency Graph</span> →
            </div>
          </Link>
        </div>
      </section>

      {/* Regulatory Decision Architecture: 3 Statutory Questions */}
      <section className="py-16 bg-white border-y border-brand-border" id="workflow">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase font-mono tracking-wider text-brand-copper font-semibold">
              Regulatory Decision Architecture
            </span>
            <h2 className="text-3xl font-bold text-brand-charcoal tracking-tight mt-1">
              Answering the 3 Statutory Questions
            </h2>
            <p className="text-sm text-brand-charcoal/70 mt-2">
              Every screen in PRAVAH is designed to eliminate ambiguity for scrutiny officers, regional directors, and appellate committees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-brand-ivory p-6 rounded-lg border border-brand-border">
              <div className="text-xs font-mono font-bold text-brand-forest mb-2">QUESTION 01</div>
              <h4 className="text-base font-bold text-brand-charcoal mb-2">What is pending?</h4>
              <p className="text-xs text-brand-charcoal/70 leading-relaxed">
                Exact missing affidavits, deficient land titles, biometric faculty verification gaps, or unsubmitted FDR certificates identified down to specific folio numbers.
              </p>
            </div>

            <div className="bg-brand-ivory p-6 rounded-lg border border-brand-border">
              <div className="text-xs font-mono font-bold text-brand-copper mb-2">QUESTION 02</div>
              <h4 className="text-base font-bold text-brand-charcoal mb-2">Why is it blocked?</h4>
              <p className="text-xs text-brand-charcoal/70 leading-relaxed">
                Specific regulatory rule references (e.g. AICTE APH Section 2.4.1), timestamped scrutiny observations, and pending cure window durations.
              </p>
            </div>

            <div className="bg-brand-ivory p-6 rounded-lg border border-brand-border">
              <div className="text-xs font-mono font-bold text-brand-forest-dark mb-2">QUESTION 03</div>
              <h4 className="text-base font-bold text-brand-charcoal mb-2">What action happens next?</h4>
              <p className="text-xs text-brand-charcoal/70 leading-relaxed">
                Role-aware statutory interventions: issue Form-B deficiency notice, grant 48-hour cure notice, schedule EVC inspection, or escalate to SAC hearing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Institutional Footer */}
      <footer className="bg-brand-forest-dark text-brand-ivory py-12 border-t border-brand-forest">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded bg-brand-forest flex items-center justify-center font-bold text-brand-ivory border border-brand-copper">
                PR
              </div>
              <span className="font-bold text-sm tracking-wide text-brand-ivory">PRAVAH</span>
            </div>
            <p className="text-brand-ivory/60 leading-relaxed">
              AICTE Institutional Approval Operations Platform. Built for regulatory accuracy, audit accountability, and seamless institutional coordination.
            </p>
          </div>

          <div>
            <h5 className="font-mono uppercase font-bold text-brand-copper mb-3">Regional Directorates</h5>
            <ul className="space-y-1.5 text-brand-ivory/70 font-mono text-[11px]">
              <li>Northern Regional Office (NRO) - Kanpur</li>
              <li>Western Regional Office (WRO) - Mumbai</li>
              <li>Southern Regional Office (SRO) - Chennai</li>
              <li>Eastern Regional Office (ERO) - Kolkata</li>
              <li>North-Western Office (NWRO) - Chandigarh</li>
            </ul>
          </div>

          <div>
            <h5 className="font-mono uppercase font-bold text-brand-copper mb-3">Statutory Protocols</h5>
            <ul className="space-y-1.5 text-brand-ivory/70">
              <li>Strict 15-day scrutiny ceiling enforcement</li>
              <li>Cryptographic SHA-256 state audit logs</li>
              <li>Geofenced EVC panel reporting</li>
              <li>Standing Appeals Committee (SAC) Escalations</li>
            </ul>
          </div>

          <div>
            <h5 className="font-mono uppercase font-bold text-brand-copper mb-3">Operational Security</h5>
            <div className="p-3 rounded bg-brand-forest border border-brand-border/20 text-brand-ivory/80 space-y-1">
              <div className="font-bold text-brand-ivory">Authorized Administrative Access</div>
              <p className="text-[11px] text-brand-ivory/60">
                Restricted to gazetted approval committee officers, zonal administrators, and verified institutional representatives.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 mt-8 pt-6 border-t border-brand-forest/60 flex flex-col sm:flex-row items-center justify-between text-[11px] text-brand-ivory/50">
          <div>Demonstration Prototype Environment • AICTE Approval Process Handbook Compliance</div>
          <div className="font-mono">PRAVAH-BUILD-AY2026-NRO • v2.4.1 Gov-Secure</div>
        </div>
      </footer>

      {/* Glass Login Modal */}
      <GlassLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
}
