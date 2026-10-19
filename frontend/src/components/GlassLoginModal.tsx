'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface GlassLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlassLoginModal({ isOpen, onClose }: GlassLoginModalProps) {
  const router = useRouter();
  const { login } = useAuth();
  const [userId, setUserId] = useState('r.srivastava@aicte-india.org');
  const [password, setPassword] = useState('••••••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedOffice, setSelectedOffice] = useState('Northern Regional Office (NRO) - Kanpur');
  const [rememberSession, setRememberSession] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await login(userId, password, selectedOffice);
    setIsLoading(false);
    onClose();
    router.push('/dashboard');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-6 bg-brand-forest-dark/85 backdrop-blur-md transition-all animate-fadeIn">
      {/* Modal Close Button */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 z-50 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
        title="Close login modal"
      >
        <span className="material-symbols-outlined text-[20px]">close</span>
      </button>

      {/* Split Screen Experience Card */}
      <div className="w-full max-w-5xl h-full sm:h-[640px] rounded-none sm:rounded-2xl overflow-hidden shadow-glass-panel grid grid-cols-1 md:grid-cols-12 border border-brand-border/40 bg-white">
        {/* Left Side: Deep Forest Atmospheric 3D Workflow Panel */}
        <div className="hidden md:flex md:col-span-6 bg-gradient-to-br from-brand-forest-dark via-brand-forest to-[#0e221b] text-brand-ivory p-10 flex-col justify-between relative overflow-hidden">
          {/* Background decorative ambient circles */}
          <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-brand-copper/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-brand-forest/30 blur-3xl pointer-events-none" />

          {/* Top Header inside left pane */}
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded bg-brand-ivory text-brand-forest font-bold flex items-center justify-center text-sm shadow">
                PR
              </div>
              <div>
                <div className="font-bold text-base tracking-tight text-white">PRAVAH</div>
                <div className="text-[10px] font-mono text-brand-copper-light">
                  STATUTORY OPERATIONS GATEWAY
                </div>
              </div>
            </div>
          </div>

          {/* Middle Illustrative Visual Elements: Active Case State Card */}
          <div className="relative z-10 space-y-4 my-auto">
            <div className="p-5 rounded-xl glass-surface-dark text-white space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-brand-copper-light">PID: 1-4392811</span>
                <span className="px-2 py-0.5 rounded bg-brand-copper text-white text-[10px] font-semibold">
                  STAGE 03: RE-SCRUTINY
                </span>
              </div>
              <div className="font-bold text-sm text-white">
                Dronacharya Institute of Engineering & Technology
              </div>
              <div className="text-xs text-brand-ivory/70">
                Knowledge Park III, Greater Noida (NRO - Kanpur)
              </div>
              {/* Mini dependency progress dots */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono">
                <span className="text-brand-ivory/60">Land Deed Audit: Deficient</span>
                <span className="text-brand-warning font-semibold">Cure Window: 24h</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-brand-ivory/80 flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-brand-copper shrink-0 animate-ping" />
              <span>Connected to Northern Regional Office Scrutiny Directorate.</span>
            </div>
          </div>

          {/* Bottom Security Badge */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-brand-ivory/60 font-mono">
            <span>SECURE RO AUTHENTICATION</span>
            <span>SHA-256 TAMPER-CHECK</span>
          </div>
        </div>

        {/* Right Side: Translucent Glass Login Panel on Warm Ivory */}
        <div className="col-span-1 md:col-span-6 bg-brand-ivory p-8 sm:p-12 flex flex-col justify-center relative">
          <div className="max-w-md w-full mx-auto space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-brand-sage text-[11px] font-mono font-medium text-brand-forest mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-copper" />
                PORTAL SESSION AUTHENTICATION
              </div>
              <h3 className="text-2xl font-bold text-brand-charcoal tracking-tight">
                Welcome back
              </h3>
              <p className="text-xs text-brand-charcoal/70 mt-1">
                Sign in to your approval operations workspace.
              </p>
            </div>

            {/* Glass Form Container */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email / User ID */}
              <div>
                <label className="block text-xs font-semibold text-brand-charcoal mb-1" htmlFor="user-id">
                  Official User ID / Email
                </label>
                <div className="relative">
                  <input
                    id="user-id"
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="e.g. ro.kanpur@aicte-india.org"
                    required
                    className="w-full px-3.5 py-2.5 rounded bg-white border border-brand-border focus:border-brand-forest focus:ring-1 focus:ring-brand-forest text-xs font-medium text-brand-charcoal outline-none transition-all placeholder:text-brand-charcoal/40"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-brand-charcoal/40">
                    <span className="material-symbols-outlined text-[18px]">badge</span>
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-brand-charcoal" htmlFor="password">
                    Password
                  </label>
                  <a href="#" className="text-[11px] font-medium text-brand-copper hover:underline">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter authorized credential"
                    required
                    className="w-full px-3.5 py-2.5 rounded bg-white border border-brand-border focus:border-brand-forest focus:ring-1 focus:ring-brand-forest text-xs font-medium text-brand-charcoal outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-brand-charcoal/40 hover:text-brand-forest cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Administrative Office Selector */}
              <div>
                <label className="block text-xs font-semibold text-brand-charcoal mb-1">
                  Administrative Office
                </label>
                <select
                  value={selectedOffice}
                  onChange={(e) => setSelectedOffice(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded bg-white border border-brand-border focus:border-brand-forest text-xs font-medium text-brand-charcoal outline-none"
                >
                  <option>Northern Regional Office (NRO) - Kanpur</option>
                  <option>Western Regional Office (WRO) - Mumbai</option>
                  <option>Southern Regional Office (SRO) - Chennai</option>
                  <option>Eastern Regional Office (ERO) - Kolkata</option>
                  <option>North-Western Regional Office (NWRO) - Chandigarh</option>
                  <option>Central Bureau / Member Secretary Desk</option>
                </select>
              </div>

              {/* Remember Session */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberSession}
                  onChange={(e) => setRememberSession(e.target.checked)}
                  className="w-4 h-4 rounded border-brand-border text-brand-forest focus:ring-brand-forest"
                />
                <label htmlFor="remember" className="text-xs text-brand-charcoal/80 select-none">
                  Keep session active on this authorized terminal
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-brand-forest hover:bg-brand-forest-dark text-white text-xs font-bold rounded shadow-sm transition-all border border-brand-forest-dark flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>{isLoading ? 'Authenticating...' : 'Sign In to Approval Operations'}</span>
                <span className="material-symbols-outlined text-[16px] text-brand-copper-light transition-transform group-hover:translate-x-1">
                  arrow_forward
                </span>
              </button>
            </form>

            {/* Footer warning */}
            <div className="pt-4 border-t border-brand-border/70 text-center">
              <span className="text-[11px] font-mono text-brand-charcoal/50">
                Authorized access only • Strictly audited per AICTE Act
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
