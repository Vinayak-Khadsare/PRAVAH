'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const [institutionPid, setInstitutionPid] = useState('');
  const [regionalOffice, setRegionalOffice] = useState('Northern Regional Office (NRO) - Kanpur');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const regionalOffices = [
    'Northern Regional Office (NRO) - Kanpur',
    'Western Regional Office (WRO) - Mumbai',
    'Southern Regional Office (SRO) - Chennai',
    'Eastern Regional Office (ERO) - Kolkata',
    'North-Western Regional Office (NWRO) - Chandigarh',
    'Central Bureau / Member Secretary Desk',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify and re-enter.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters in length.');
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('Please acknowledge the statutory verification declaration.');
      return;
    }

    setIsLoading(true);
    const result = await register({
      name: fullName.trim(),
      email: email.trim(),
      password,
      confirmPassword,
      institutionName: institutionName.trim(),
      institutionPid: institutionPid.trim(),
      regionalOffice,
    });
    setIsLoading(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Registration failed. Please check your information.');
    } else {
      setIsSuccess(true);
    }
  };

  return (
    <div className="min-h-screen bg-brand-forest-dark flex items-center justify-center p-4 sm:p-8">
      {/* Container */}
      <div className="w-full max-w-4xl rounded-2xl overflow-hidden shadow-glass-panel grid grid-cols-1 md:grid-cols-12 border border-brand-border/40 bg-white">
        
        {/* Left Informational Atmospheric Pane */}
        <div className="hidden md:flex md:col-span-5 bg-gradient-to-br from-brand-forest-dark via-brand-forest to-[#0e221b] text-brand-ivory p-8 flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-brand-copper/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-brand-forest/30 blur-3xl pointer-events-none" />

          {/* Top Brand Header */}
          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded bg-brand-ivory text-brand-forest font-bold flex items-center justify-center text-sm shadow">
                PR
              </div>
              <div>
                <div className="font-bold text-base tracking-tight text-white group-hover:text-brand-copper-light transition-colors">
                  PRAVAH
                </div>
                <div className="text-[10px] font-mono text-brand-copper-light">
                  AICTE APPROVAL GATEWAY
                </div>
              </div>
            </Link>
          </div>

          {/* Core Info Cards */}
          <div className="relative z-10 space-y-4 my-auto">
            <div className="p-4 rounded-xl glass-surface-dark text-white space-y-2 border border-white/10">
              <div className="flex items-center gap-2 text-brand-copper-light text-xs font-mono font-semibold">
                <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
                <span>INSTITUTION REGISTRATION</span>
              </div>
              <h4 className="font-bold text-sm text-white">
                Institutional Representative Portal
              </h4>
              <p className="text-xs text-brand-ivory/70 leading-relaxed">
                Register as an authorized institution officer to file new applications, upload statutory land & building deeds, submit deficiency responses, and track EVC rosters.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-white/5 border border-white/10 text-xs text-brand-ivory/80 space-y-1">
              <div className="flex items-center gap-1.5 text-brand-amber font-semibold text-[11px]">
                <span className="material-symbols-outlined text-[14px]">shield</span>
                <span>Statutory Scope Enforcement</span>
              </div>
              <p className="text-[11px] text-brand-ivory/70 leading-tight">
                Accounts created through public enrollment receive <strong className="text-white">Institution Representative</strong> access scoped exclusively to your registered Permanent Institute ID (PID).
              </p>
            </div>
          </div>

          {/* Bottom Security Seals */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-[10px] text-brand-ivory/60 font-mono">
            <span>APH 2026-2027</span>
            <span>SHA-256 AUDITED</span>
          </div>
        </div>

        {/* Right Form Pane */}
        <div className="col-span-1 md:col-span-7 bg-brand-ivory p-6 sm:p-10 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto space-y-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-brand-sage text-[10px] font-mono font-medium text-brand-forest mb-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-copper" />
                CREATE INSTITUTION REPRESENTATIVE ACCOUNT
              </div>
              <h3 className="text-2xl font-bold text-brand-charcoal tracking-tight">
                Register for PRAVAH
              </h3>
              <p className="text-xs text-brand-charcoal/70 mt-0.5">
                Already registered?{' '}
                <Link href="/login" className="text-brand-copper font-semibold hover:underline">
                  Sign in here
                </Link>
              </p>
            </div>

            {/* Success State */}
            {isSuccess ? (
              <div className="p-6 rounded-xl bg-white border border-brand-forest/20 shadow-xs space-y-4 animate-fadeIn">
                <div className="w-12 h-12 rounded-full bg-brand-forest-light text-brand-forest flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-[28px]">verified</span>
                </div>
                <div className="text-center space-y-1">
                  <h4 className="font-bold text-base text-brand-charcoal">Account Registered Successfully!</h4>
                  <p className="text-xs text-brand-charcoal/70">
                    Your institutional representative profile for <strong className="text-brand-forest">{institutionName}</strong> (PID: <span className="font-mono">{institutionPid}</span>) is ready.
                  </p>
                </div>
                <div className="p-3 bg-brand-subtle rounded border border-brand-border text-xs text-brand-charcoal/80 space-y-1">
                  <div className="font-semibold text-brand-forest">Next Steps:</div>
                  <p className="text-[11px] text-brand-text-muted">
                    Sign in with your email <span className="font-mono font-medium text-brand-charcoal">{email}</span> to access your applications registry and compliance portal.
                  </p>
                </div>
                <Link
                  href="/login"
                  className="w-full py-2.5 bg-brand-forest hover:bg-brand-forest-dark text-white text-xs font-bold rounded shadow-sm transition-all border border-brand-forest-dark flex items-center justify-center gap-2"
                >
                  <span>Proceed to Sign In</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>
            ) : (
              /* Registration Form */
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {errorMessage && (
                  <div className="p-3 rounded bg-brand-alert-bg border border-brand-alert-red/30 text-brand-alert-red text-xs flex items-start gap-2 animate-shake">
                    <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-brand-charcoal mb-1" htmlFor="full-name">
                    Representative Full Name
                  </label>
                  <input
                    id="full-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Dr. Arvind Sharma"
                    required
                    className="w-full px-3 py-2 rounded bg-white border border-brand-border focus:border-brand-forest focus:ring-1 focus:ring-brand-forest text-xs font-medium text-brand-charcoal outline-none transition-all placeholder:text-brand-charcoal/40"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold text-brand-charcoal mb-1" htmlFor="reg-email">
                    Official Institutional Email
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. admin@dronacharya-engg.ac.in"
                    required
                    className="w-full px-3 py-2 rounded bg-white border border-brand-border focus:border-brand-forest focus:ring-1 focus:ring-brand-forest text-xs font-medium text-brand-charcoal outline-none transition-all placeholder:text-brand-charcoal/40"
                  />
                </div>

                {/* Two-column: PID & Institution Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-brand-charcoal mb-1" htmlFor="inst-pid">
                      Permanent Institute ID (PID)
                    </label>
                    <input
                      id="inst-pid"
                      type="text"
                      value={institutionPid}
                      onChange={(e) => setInstitutionPid(e.target.value)}
                      placeholder="e.g. 1-4392811"
                      required
                      className="w-full px-3 py-2 rounded bg-white border border-brand-border focus:border-brand-forest focus:ring-1 focus:ring-brand-forest text-xs font-mono font-medium text-brand-charcoal outline-none transition-all placeholder:text-brand-charcoal/40"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-brand-charcoal mb-1" htmlFor="inst-name">
                      Institution Name
                    </label>
                    <input
                      id="inst-name"
                      type="text"
                      value={institutionName}
                      onChange={(e) => setInstitutionName(e.target.value)}
                      placeholder="e.g. Dronacharya Inst."
                      required
                      className="w-full px-3 py-2 rounded bg-white border border-brand-border focus:border-brand-forest focus:ring-1 focus:ring-brand-forest text-xs font-medium text-brand-charcoal outline-none transition-all placeholder:text-brand-charcoal/40"
                    />
                  </div>
                </div>

                {/* Regional Office Selection */}
                <div>
                  <label className="block text-xs font-semibold text-brand-charcoal mb-1" htmlFor="reg-office">
                    Jurisdiction Regional Office
                  </label>
                  <select
                    id="reg-office"
                    value={regionalOffice}
                    onChange={(e) => setRegionalOffice(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-white border border-brand-border focus:border-brand-forest text-xs font-medium text-brand-charcoal outline-none"
                  >
                    {regionalOffices.map((office) => (
                      <option key={office} value={office}>
                        {office}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Two-column: Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-brand-charcoal mb-1" htmlFor="reg-password">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="reg-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min 8 characters"
                        required
                        className="w-full px-3 py-2 rounded bg-white border border-brand-border focus:border-brand-forest focus:ring-1 focus:ring-brand-forest text-xs font-medium text-brand-charcoal outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-brand-charcoal/40 hover:text-brand-forest"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-brand-charcoal mb-1" htmlFor="confirm-password">
                      Confirm Password
                    </label>
                    <input
                      id="confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      required
                      className="w-full px-3 py-2 rounded bg-white border border-brand-border focus:border-brand-forest focus:ring-1 focus:ring-brand-forest text-xs font-medium text-brand-charcoal outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Statutory Checkbox */}
                <div className="flex items-start gap-2 pt-1">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    required
                    className="mt-0.5 w-4 h-4 rounded border-brand-border text-brand-forest focus:ring-brand-forest"
                  />
                  <label htmlFor="terms" className="text-[11px] text-brand-charcoal/70 leading-tight select-none">
                    I solemnly declare that I am an authorized representative of the named institution under the AICTE Act 1987.
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-brand-forest hover:bg-brand-forest-dark text-white text-xs font-bold rounded shadow-sm transition-all border border-brand-forest-dark flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {isLoading ? (
                    <span>Registering Account...</span>
                  ) : (
                    <>
                      <span>Create Institution Account</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Bottom Disclaimer */}
            <div className="pt-3 border-t border-brand-border/70 text-center">
              <span className="text-[10px] font-mono text-brand-charcoal/50">
                Official AICTE Platform • Statutory Penalties for False Affidavits
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
