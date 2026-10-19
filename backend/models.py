from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from enum import Enum
from datetime import datetime

class UserRole(str, Enum):
    SUPER_ADMIN = "super_admin"
    AICTE_ADMIN = "aicte_admin"
    REGIONAL_OFFICER = "regional_officer"
    SCRUTINY_OFFICER = "scrutiny_officer"
    EVC_MEMBER = "evc_member"
    COMMITTEE_MEMBER = "committee_member"
    INSTITUTION_REP = "institution_rep"
    COMPLIANCE_OFFICER = "compliance_officer"
    AUDITOR = "auditor"

class DeficiencyItemModel(BaseModel):
    id: str
    orderNum: str
    title: str
    isCritical: bool
    refCode: str
    status: str  # 'deficient' | 'compliant' | 'under_review'
    requirement: str
    officerName: str
    officerRole: str
    officerComment: str
    officerDate: str
    applicantResponse: Optional[str] = None
    applicantDate: Optional[str] = None
    attachedFile: Optional[Dict[str, str]] = None

class UndertakingModel(BaseModel):
    id: str
    title: str
    refCode: str
    clause: str
    status: str  # 'compliant' | 'pending' | 'deficient'
    submittedDate: str
    verifiedBy: Optional[str] = None

class DocumentModel(BaseModel):
    id: str
    name: str
    size: str
    uploadDate: str
    status: str  # 'verified' | 'deficient' | 'pending'
    category: str
    sha256: Optional[str] = None
    version: int = 1
    storagePath: Optional[str] = None
    uploadedBy: Optional[str] = None

class AuditLogEventModel(BaseModel):
    id: str
    title: str
    timestamp: str
    description: str
    actor: str
    type: str  # 'alert' | 'upload' | 'action' | 'system' | 'decision'
    sha256: Optional[str] = None
    previousHash: Optional[str] = None
    applicationId: Optional[str] = None

class CriticalBlockerModel(BaseModel):
    title: str
    ruleRef: str
    description: str
    question1_whatPending: str
    question2_whyBlocked: str
    question3_nextAction: str
    downstreamHalted: List[str]

class OfficerModel(BaseModel):
    name: str
    role: str
    authId: str

class InstitutionProfileModel(BaseModel):
    managingSociety: str
    societyRegNo: str
    principalDesignate: str
    officialEmail: str
    campusPhone: str
    affiliatingUniversity: str

class ApplicationModel(BaseModel):
    id: str
    pid: str
    institutionName: str
    address: str
    city: str
    state: str
    pin: str
    regionalOffice: str
    geoTag: str
    applicationType: str  # 'New Technical Inst.' | 'Extension of Approval (EoA)' | 'Intake Expansion' | 'Closure / Merger'
    programDetails: str
    academicSession: str
    currentStageNumber: int  # 1 to 6
    currentStageLabel: str
    status: str  # 'submitted', 'in_scrutiny', 'deficiency_issued', 're_scrutiny', 'evc_scheduled', 'evc_completed', 'sac_escalated', 'approved', 'rejected', 'overdue'
    slaStatus: str  # 'normal' | 'warning' | 'overdue'
    daysExpended: int
    statutoryCeiling: int = 15
    overdueText: Optional[str] = None
    lastRegistryEvent: str
    submissionDate: str = "10 Feb 2026"
    assignedOfficer: OfficerModel
    associateOfficer: Optional[OfficerModel] = None
    institutionProfile: InstitutionProfileModel
    criticalBlocker: Optional[CriticalBlockerModel] = None
    deficiencies: List[DeficiencyItemModel] = []
    undertakings: List[UndertakingModel] = []
    documents: List[DocumentModel] = []
    auditLog: List[AuditLogEventModel] = []

class EvcScheduleModel(BaseModel):
    id: str
    applicationId: str
    institutionName: str
    location: str
    regionalOffice: str
    visitDate: str
    panelConvener: str
    panelMembers: List[str]
    status: str  # 'Scheduled' | 'Completed' | 'Pending Clearance' | 'Action Needed' | 'Cancelled'
    inspectionType: str
    slaDaysRemaining: int
    securityToken: Optional[str] = None
    reportSubmitted: bool = False
    reportSummary: Optional[str] = None

class ComplianceRecordModel(BaseModel):
    id: str
    institutionName: str
    applicationId: str
    subject: str
    category: str
    validityExpiry: str
    daysRemaining: int
    status: str  # 'Compliant' | 'Pending Action' | 'Cure Window Active' | 'Critical Overdue'
    refNumber: str

class AlertNotificationModel(BaseModel):
    id: str
    title: str
    message: str
    timestamp: str
    priority: str  # 'critical' | 'warning' | 'info'
    category: str  # 'SLA Escalation' | 'Document Deficiency' | 'EVC Stall' | 'Statutory Ceiling'
    applicationId: str
    institutionName: str
    resolved: bool = False
    acknowledged: bool = False
    assignedRole: Optional[str] = None

# Auth Models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: UserRole
    regionalOffice: str
    institutionPid: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    office: Optional[str] = None

class UserResponse(BaseModel):
    userId: str
    email: str
    name: str
    role: str
    regionalOffice: str
    initials: str
    institutionPid: Optional[str] = None
    active: bool = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Workflow & Transition Models
class TransitionRequest(BaseModel):
    targetStage: int
    reason: str
    evidenceDetails: Optional[str] = None

StateTransitionRequest = TransitionRequest

class ObservationRequest(BaseModel):
    observation: str
    officerName: Optional[str] = None

class GraceNoticeRequest(BaseModel):
    hours: int = 48
    reason: Optional[str] = "Delegated regulatory prerogative invoked per APH Ch II Sec 2.6"

class FormBRequest(BaseModel):
    reason: str
    deficiencyIds: Optional[List[str]] = None
    officerName: Optional[str] = None

class EscalateSacRequest(BaseModel):
    reason: str
    officerName: Optional[str] = None

class RectificationSubmitRequest(BaseModel):
    deficiencyId: str
    responseSummary: str
    documentId: Optional[str] = None

# What-If Simulation Models
class SimulationRequest(BaseModel):
    applicationId: str
    action: str  # 'grace_notice' | 'accept_rectification' | 'escalate_sac' | 'delay_land_deed'
    parameterValue: Optional[int] = None

class SimulationResponse(BaseModel):
    applicationId: str
    scenario: str
    currentStage: int
    predictedSlaBreach: bool
    calculatedDaysImpact: int
    downstreamImpact: str
    statutoryRiskIndex: str
    unblockedDependencies: List[str]
    newlyBlockedDependencies: List[str]
    methodology: str

# Policy Model
class PolicyVersionModel(BaseModel):
    versionId: str
    title: str
    effectiveDate: str
    scrutinyCeilingDays: int
    graceNoticeMaxHours: int
    formBCureWindowDays: int
    changeSummary: str
    active: bool = True
