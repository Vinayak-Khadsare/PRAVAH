from pydantic import BaseModel, Field
from typing import List, Optional

class DeficiencyItemModel(BaseModel):
    id: str
    orderNum: str
    title: str
    isCritical: bool
    refCode: str
    status: str
    requirement: str
    officerName: str
    officerRole: str
    officerComment: str
    officerDate: str
    applicantResponse: Optional[str] = None
    applicantDate: Optional[str] = None

class UndertakingModel(BaseModel):
    id: str
    title: str
    refCode: str
    clause: str
    status: str
    submittedDate: str
    verifiedBy: Optional[str] = None

class DocumentModel(BaseModel):
    id: str
    name: str
    size: str
    uploadDate: str
    status: str
    category: str
    sha256: Optional[str] = None

class AuditLogEventModel(BaseModel):
    id: str
    title: str
    timestamp: str
    description: str
    actor: str
    type: str
    sha256: Optional[str] = None

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
    applicationType: str
    programDetails: str
    academicSession: str
    currentStageNumber: int
    currentStageLabel: str
    status: str
    slaStatus: str
    daysExpended: int
    statutoryCeiling: int = 15
    overdueText: Optional[str] = None
    lastRegistryEvent: str
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
    status: str
    inspectionType: str
    slaDaysRemaining: int

class ComplianceRecordModel(BaseModel):
    id: str
    institutionName: str
    applicationId: str
    subject: str
    category: str
    validityExpiry: str
    daysRemaining: int
    status: str
    refNumber: str

class AlertNotificationModel(BaseModel):
    id: str
    title: str
    message: str
    timestamp: str
    priority: str
    category: str
    applicationId: str
    institutionName: str
    resolved: bool = False

class ObservationRequest(BaseModel):
    observation: str
    officerName: str = "Dr. P. K. Verma"

class GraceNoticeRequest(BaseModel):
    hours: int = 48
    reason: Optional[str] = None

class FormBRequest(BaseModel):
    reason: str
    officerName: str = "Dr. P. K. Verma"

class EscalateSacRequest(BaseModel):
    reason: str
    officerName: str = "Dr. R. K. Srivastava"

class LoginRequest(BaseModel):
    email: str
    password: str
    office: str
