'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

export default function DocumentRegistryPage() {
  const [toast, setToast] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState('all');

  const docs = [
    {
      id: 'DOC-4392811-LD2',
      name: 'Supplementary_Land_Registry_Deed_Khasra.pdf',
      appId: 'APP-2026-00124',
      institution: 'Dronacharya Institute of Engineering & Technology',
      category: 'Land Lease Deed',
      size: '8.4 MB',
      uploadDate: '22 Feb 2026, 04:15 PM',
      sha256: '9A77F128BAE019',
      status: 'Deficient (Missing Sub-Registrar Seal)',
      statusClass: 'bg-brand-alert-bg text-brand-alert-red border-brand-alert-red/30',
    },
    {
      id: 'DOC-4392811-BP1',
      name: 'Master_Building_Plan_PWD_Signoff.pdf',
      appId: 'APP-2026-00124',
      institution: 'Dronacharya Institute of Engineering & Technology',
      category: 'Building Plan PWD',
      size: '14.2 MB',
      uploadDate: '10 Feb 2026, 09:20 AM',
      sha256: '88CC9011EFA412',
      status: 'Verified (PWD Certified)',
      statusClass: 'bg-brand-forest-light text-brand-forest border-brand-forest/20',
    },
    {
      id: 'DOC-3829104-CAD1',
      name: 'Faculty_Cadre_SelfDisclosure_AY2026.pdf',
      appId: 'APP-2026-00089',
      institution: 'Malaviya Institute of Technology & Research',
      category: 'Cadre Faculty Ratio',
      size: '4.8 MB',
      uploadDate: '12 Feb 2026, 11:45 AM',
      sha256: 'B012FF441099AC',
      status: 'Verified',
      statusClass: 'bg-brand-forest-light text-brand-forest border-brand-forest/20',
    },
    {
      id: 'DOC-5521098-LD1',
      name: 'Registered_Sale_Deed_Lavale_Campus.pdf',
      appId: 'APP-2026-00178',
      institution: 'Symbiosis School of Applied Artificial Intelligence',
      category: 'Land Lease Deed',
      size: '12.1 MB',
      uploadDate: '18 Feb 2026, 02:30 PM',
      sha256: '77AC8901BA3345',
      status: 'Verified (Clear Title)',
      statusClass: 'bg-brand-forest-light text-brand-forest border-brand-forest/20',
    },
    {
      id: 'DOC-2940112-NBA1',
      name: 'NBA_Tier1_Accreditation_Certificate.pdf',
      appId: 'APP-2026-00045',
      institution: 'Coimbatore Institute of Emerging Technologies',
      category: 'Accreditation',
      size: '2.4 MB',
      uploadDate: '10 Feb 2026, 10:15 AM',
      sha256: '55DD410298BBE1',
      status: 'Verified (Valid to 2028)',
      statusClass: 'bg-brand-forest-light text-brand-forest border-brand-forest/20',
    },
  ];

  const filteredDocs = filterCategory === 'all' ? docs : docs.filter(d => d.category === filterCategory);

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
                <span className="material-symbols-outlined text-[16px] text-brand-forest">inventory_2</span>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-brand-forest-light text-brand-forest border border-brand-forest/20">
                  DIGITAL EVIDENCE ARCHIVE
                </span>
              </div>
              <h1 className="text-2xl font-bold text-brand-forest tracking-tight mt-1">
                Central Statutory Document Registry
              </h1>
              <p className="text-xs text-brand-text-muted mt-0.5">
                Cryptographically audited storage for registered title deeds, structural safety certificates, and statutory bank instruments.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-1.5 bg-brand-subtle border border-brand-border rounded text-xs font-semibold text-brand-forest outline-none"
              >
                <option value="all">All Prescribed Documents</option>
                <option value="Land Lease Deed">Land Lease Deeds (30-Year)</option>
                <option value="Building Plan PWD">Building Plans & PWD Stamped</option>
                <option value="Cadre Faculty Ratio">Faculty Cadre Self-Disclosures</option>
                <option value="Accreditation">Accreditation (NBA/NAAC)</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-brand-border shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-brand-subtle text-brand-text-muted uppercase text-[10px] tracking-wider border-b border-brand-border">
                  <tr>
                    <th className="py-3 px-4 font-bold">Document Title & File</th>
                    <th className="py-3 px-4 font-bold">Associated Application</th>
                    <th className="py-3 px-4 font-bold">Prescribed Category</th>
                    <th className="py-3 px-4 font-bold">Integrity Hash</th>
                    <th className="py-3 px-4 font-bold">Verification State</th>
                    <th className="py-3 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/60">
                  {filteredDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-brand-subtle/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-brand-forest flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                          <span>{doc.name}</span>
                        </div>
                        <div className="text-[10px] text-brand-text-muted font-mono">{doc.size} • {doc.uploadDate}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-brand-text-primary">
                          <Link href={`/applications/${doc.appId}`} className="hover:text-brand-forest hover:underline">
                            {doc.institution}
                          </Link>
                        </div>
                        <div className="text-[10px] text-brand-text-muted font-mono">{doc.appId}</div>
                      </td>
                      <td className="py-3.5 px-4 font-medium">{doc.category}</td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-brand-text-muted">
                        SHA-256: {doc.sha256}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded border ${doc.statusClass}`}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => triggerToast(`Opening inline PDF viewer for ${doc.name}`)}
                          className="px-2.5 py-1 bg-white hover:bg-brand-subtle text-brand-forest font-semibold rounded border border-brand-border transition-colors text-xs inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[14px]">visibility</span>
                          <span>Inspect</span>
                        </button>
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
