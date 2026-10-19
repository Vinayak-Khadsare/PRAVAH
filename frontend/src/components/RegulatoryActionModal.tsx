'use client';

import React, { useState } from 'react';
import { pravahApi } from '@/lib/api';

export type ActionType = 
  | 'observation'
  | 'deficiency_form_b'
  | 'grace_notice'
  | 'escalate_sac'
  | 'recommend_evc'
  | 'accept_rectification';

interface RegulatoryActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  appId: string;
  institutionName: string;
  actionType: ActionType | null;
  deficiencyId?: string;
  onSuccess: () => void;
}

export default function RegulatoryActionModal({
  isOpen,
  onClose,
  appId,
  institutionName,
  actionType,
  deficiencyId,
  onSuccess,
}: RegulatoryActionModalProps) {
  const [note, setNote] = useState('');
  const [graceHours, setGraceHours] = useState(48);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !actionType) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (actionType === 'observation') {
        await pravahApi.recordObservation(appId, note || 'Scrutiny observation logged without formal defect.', 'Dr. P. K. Verma');
      } else if (actionType === 'grace_notice') {
        await pravahApi.grantGraceNotice(appId, graceHours);
      } else if (actionType === 'deficiency_form_b') {
        await pravahApi.issueDeficiencyFormB(appId, note || 'Mandatory Land Registry Deed lacks Sub-Registrar seal per APH 2.4.1.');
      } else if (actionType === 'escalate_sac') {
        await pravahApi.escalateToSac(appId, note || 'Statutory 15-day ceiling exceeded. Land encumbrance unresolved during cure period.');
      } else if (actionType === 'recommend_evc') {
        await pravahApi.recommendForEvc(appId);
      } else if (actionType === 'accept_rectification' && deficiencyId) {
        await pravahApi.acceptRectification(appId, deficiencyId);
      }

      onSuccess();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTitle = () => {
    switch (actionType) {
      case 'observation': return 'Record Official Scrutiny Observation';
      case 'grace_notice': return 'Grant Statutory Cure Extension (Grace Notice)';
      case 'deficiency_form_b': return 'Issue Statutory Form-B Deficiency Notice';
      case 'escalate_sac': return 'Escalate to Standing Appeals Committee (SAC)';
      case 'recommend_evc': return 'Recommend Application for EVC Physical Inspection';
      case 'accept_rectification': return 'Accept Document Rectification & Remove Blocker';
    }
  };

  const getIcon = () => {
    switch (actionType) {
      case 'observation': return 'edit_note';
      case 'grace_notice': return 'hourglass_top';
      case 'deficiency_form_b': return 'assignment_late';
      case 'escalate_sac': return 'gavel';
      case 'recommend_evc': return 'verified';
      case 'accept_rectification': return 'check_circle';
    }
  };

  const getBadgeColor = () => {
    switch (actionType) {
      case 'observation': return 'bg-brand-subtle text-brand-forest border-brand-border';
      case 'grace_notice': return 'bg-brand-amber-bg text-brand-amber border-brand-amber/30';
      case 'deficiency_form_b': return 'bg-brand-alert-bg text-brand-alert-red border-brand-alert-red/30';
      case 'escalate_sac': return 'bg-brand-alert-bg text-brand-alert-red border-brand-alert-red/30';
      case 'recommend_evc': return 'bg-brand-forest-light text-brand-forest border-brand-forest/30';
      case 'accept_rectification': return 'bg-brand-forest-light text-brand-forest border-brand-forest/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-forest-dark/80 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-brand-border rounded-xl shadow-glass-panel max-w-xl w-full p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-brand-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-brand-forest-light text-brand-forest flex items-center justify-center border border-brand-forest/20">
              <span className="material-symbols-outlined text-[20px]">{getIcon()}</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-brand-forest">{getTitle()}</h3>
              <div className="text-[11px] text-brand-text-muted flex items-center gap-1.5 mt-0.5 font-mono">
                <span>{appId}</span>
                <span>•</span>
                <span className="truncate max-w-[280px]">{institutionName}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-brand-text-muted hover:text-brand-text-primary p-1 rounded-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Action Description */}
        <div className={`p-3 rounded-lg border text-xs leading-relaxed ${getBadgeColor()}`}>
          {actionType === 'grace_notice' && (
            <p>
              Under AICTE APH Chapter II Section 2.6, the Regional Officer / Member Secretary may grant a one-time cure extension prior to statutory referral. This intervention will be timestamped in the cryptographic audit trail.
            </p>
          )}
          {actionType === 'deficiency_form_b' && (
            <p>
              Issuing Form-B formally marks this application as deficient and dispatches digital intimation with SMS alerts to the applicant society. The statutory clock for cure response begins immediately.
            </p>
          )}
          {actionType === 'escalate_sac' && (
            <p>
              Escalation transfers jurisdiction to the Standing Appeals Committee at AICTE Headquarters, New Delhi. Physical or hybrid hearing will be calendared.
            </p>
          )}
          {actionType === 'observation' && (
            <p>
              Record non-blocking technical observations or advisory notes visible to scrutiny panel members and executive officers.
            </p>
          )}
          {actionType === 'recommend_evc' && (
            <p>
              Affirms that preliminary legal, architectural, and financial audits are compliant. Unblocks Expert Visit Committee pool assignment.
            </p>
          )}
          {actionType === 'accept_rectification' && (
            <p>
              Confirms that supplementary documents uploaded by the institution satisfy statutory requirements. The critical blocker flag will be cleared.
            </p>
          )}
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {actionType === 'grace_notice' && (
            <div>
              <label className="block font-semibold text-brand-text-primary mb-1">
                Extension Duration (Hours)
              </label>
              <select
                value={graceHours}
                onChange={(e) => setGraceHours(Number(e.target.value))}
                className="w-full px-3 py-2 bg-brand-subtle border border-brand-border rounded text-xs font-semibold text-brand-text-primary outline-none focus:border-brand-forest"
              >
                <option value={24}>24 Hours (Immediate Cure Window)</option>
                <option value={48}>48 Hours (Standard Statutory Prerogative)</option>
                <option value={72}>72 Hours (Weekend / Holiday Grace)</option>
              </select>
            </div>
          )}

          <div>
            <label className="block font-semibold text-brand-text-primary mb-1">
              {actionType === 'observation' ? 'Scrutiny Officer Remarks' : 'Statutory Order Details / Notes'}
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Enter official reasoning, regulation clause references, or specific instructions..."
              className="w-full px-3 py-2 bg-brand-subtle border border-brand-border rounded text-xs text-brand-text-primary outline-none focus:border-brand-forest placeholder:text-brand-text-muted/60"
            />
          </div>

          {/* Action Confirmation Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-brand-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-brand-subtle hover:bg-brand-border text-brand-text-primary font-semibold rounded text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-brand-forest hover:bg-brand-forest-dark text-white font-bold rounded text-xs transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">check</span>
              <span>{isSubmitting ? 'Recording...' : 'Authorize Regulatory Action'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
