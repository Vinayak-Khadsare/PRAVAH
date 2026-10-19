export type RegulatoryStage = 
  | 'stage_01_submission'
  | 'stage_02_scrutiny'
  | 'stage_03_rescrutiny'
  | 'stage_04_evc'
  | 'stage_05_sac'
  | 'stage_06_decision';

export type ApplicationStatus =
  | 'submitted'
  | 'in_scrutiny'
  | 're_scrutiny'
  | 'deficiency_issued'
  | 'evc_scheduled'
  | 'evc_completed'
  | 'sac_escalated'
  | 'approved'
  | 'rejected'
  | 'overdue';

export type SlaStatus = 'normal' | 'warning' | 'overdue';

export interface DeficiencyItem {
  id: string;
  orderNum: string;
  title: string;
  isCritical: boolean;
  refCode: string;
  status: 'deficient' | 'compliant' | 'under_review';
  requirement: string;
  officerName: string;
  officerRole: string;
  officerComment: string;
  officerDate: string;
  applicantResponse?: string;
  applicantDate?: string;
  attachedFile?: {
    name: string;
    size: string;
  };
}

export interface StatutoryUndertaking {
  id: string;
  title: string;
  refCode: string;
  clause: string;
  status: 'compliant' | 'pending' | 'deficient';
  submittedDate: string;
  verifiedBy?: string;
}

export interface AttachedDocument {
  id: string;
  name: string;
  size: string;
  uploadDate: string;
  status: 'verified' | 'deficient' | 'pending';
  category: 'legal' | 'land' | 'cadre' | 'finance' | 'noc';
  downloadUrl?: string;
}

export interface AuditLogEvent {
  id: string;
  title: string;
  timestamp: string;
  description: string;
  actor: string;
  type: 'alert' | 'upload' | 'action' | 'system' | 'decision';
  stateChange?: {
    from: string;
    to: string;
  };
  sha256?: string;
}

export interface ApplicationRecord {
  id: string;
  pid: string;
  institutionName: string;
  address: string;
  city: string;
  state: string;
  pin: string;
  regionalOffice: string;
  geoTag: string;
  applicationType: 'New Technical Inst.' | 'Extension of Approval (EoA)' | 'Intake Expansion' | 'Closure / Merger';
  programDetails: string;
  academicSession: string;
  currentStageNumber: 1 | 2 | 3 | 4 | 5 | 6;
  currentStageLabel: string;
  status: ApplicationStatus;
  slaStatus: SlaStatus;
  daysExpended: number;
  statutoryCeiling: number; // usually 15
  overdueText?: string;
  lastRegistryEvent: string;
  assignedOfficer: {
    name: string;
    role: string;
    authId: string;
  };
  associateOfficer?: {
    name: string;
    role: string;
    authId: string;
  };
  evcConvener?: {
    name: string;
    affiliation: string;
    status: string;
  };
  institutionProfile: {
    managingSociety: string;
    societyRegNo: string;
    principalDesignate: string;
    officialEmail: string;
    campusPhone: string;
    affiliatingUniversity: string;
  };
  criticalBlocker?: {
    title: string;
    ruleRef: string;
    description: string;
    question1_whatPending: string;
    question2_whyBlocked: string;
    question3_nextAction: string;
    downstreamHalted: string[];
  };
  deficiencies: DeficiencyItem[];
  undertakings: StatutoryUndertaking[];
  documents: AttachedDocument[];
  auditLog: AuditLogEvent[];
}

export interface EvcScheduleRecord {
  id: string;
  applicationId: string;
  institutionName: string;
  location: string;
  regionalOffice: string;
  visitDate: string;
  panelConvener: string;
  panelMembers: string[];
  status: 'Scheduled' | 'Completed' | 'Pending Clearance' | 'Action Needed';
  inspectionType: 'Physical Campus Audit' | 'Surprise Verification' | 'Expert Committee Appeal';
  slaDaysRemaining: number;
}

export interface ComplianceTrackingRecord {
  id: string;
  institutionName: string;
  applicationId: string;
  subject: string;
  category: 'Land Lease Deed' | 'Fire Safety NOC' | 'Building Plan PWD' | 'Corpus FDR' | 'Cadre Faculty Ratio';
  validityExpiry: string;
  daysRemaining: number;
  status: 'Compliant' | 'Pending Action' | 'Cure Window Active' | 'Critical Overdue';
  refNumber: string;
}

export interface AlertNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  priority: 'critical' | 'warning' | 'info';
  category: 'SLA Escalation' | 'Document Deficiency' | 'EVC Stall' | 'Statutory Ceiling';
  applicationId: string;
  institutionName: string;
  resolved: boolean;
}

export interface UserSession {
  userId: string;
  name: string;
  role: 'Member Secretary (RO Auth)' | 'Senior Scrutiny Officer' | 'Town Planning Officer' | 'EVC Convener' | 'Institution Admin';
  regionalOffice: string;
  initials: string;
}
