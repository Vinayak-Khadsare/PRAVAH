# Initial synthetic dataset for PRAVAH MongoDB seed & graceful local in-memory fallback
INITIAL_APPLICATIONS = [
    {
        "id": "APP-2026-00124",
        "pid": "1-4392811",
        "institutionName": "Dronacharya Institute of Engineering & Technology",
        "address": "Plot 42-B, Knowledge Park III, Greater Noida",
        "city": "Greater Noida",
        "state": "Uttar Pradesh",
        "pin": "201310",
        "regionalOffice": "Northern Regional Office (NRO - Kanpur Jurisdiction)",
        "geoTag": "28.4744° N, 77.4912° E",
        "applicationType": "New Technical Inst.",
        "programDetails": "UG Engg (4 Progs / 360 Seats)",
        "academicSession": "AY 2026-2027",
        "currentStageNumber": 3,
        "currentStageLabel": "Stage 03 (Re-Scrutiny & Cure)",
        "status": "overdue",
        "slaStatus": "overdue",
        "daysExpended": 16,
        "statutoryCeiling": 15,
        "overdueText": "Overdue: +1d 08h 26m",
        "lastRegistryEvent": "26 Feb 2026, 11:34 AM by Panel 02",
        "assignedOfficer": {
            "name": "Dr. P. K. Verma",
            "role": "Senior Scrutiny Officer (RO Kanpur)",
            "authId": "NRO-092"
        },
        "associateOfficer": {
            "name": "Er. M. Joshi",
            "role": "Town Planning Directorate",
            "authId": "NRO-214"
        },
        "institutionProfile": {
            "managingSociety": "Dronacharya Educational Trust",
            "societyRegNo": "1998/UP/442 (Reg. Meerut)",
            "principalDesignate": "Dr. Arvind Sharma (M.Tech, Ph.D)",
            "officialEmail": "admin@dronacharya-engg.ac.in",
            "campusPhone": "+91 120 2329800",
            "affiliatingUniversity": "AKTU, Lucknow (Proposed)"
        },
        "criticalBlocker": {
            "title": "Critical Blocker: Mandatory Land Deed Non-Compliance",
            "ruleRef": "APH RULE 2.4.1 VIOLATION",
            "description": "This deficiency directly halts progression to Stage 04 (EVC) and freezes Architectural Cadre clearance.",
            "question1_whatPending": "Certified 30-Year Registered Land Lease Deed & Khasra Map Verification. Clear, unencumbered land parcel of 5.20 contiguous acres at Knowledge Park III with Sub-Registrar endorsement stamps in accordance with APH Section 2.4.",
            "question2_whyBlocked": "Unregistered MoU Uploaded; Rectification Lacks Sub-Registrar Seal. Original submission contained only an uncertified notary agreement. Supplementary deed submitted on 22 Feb omitted statutory stamp duty clearance certificates on Folios 14–18.",
            "question3_nextAction": "Issue Final Form-B Rejection Notice or 48-Hour Final Extension. Dr. P. K. Verma (Senior Scrutiny Officer) must execute definitive Form-B rejection or invoke the 48-hour statutory grace prerogative prior to immediate Standing Appeals Council referral.",
            "downstreamHalted": [
                "EVC Inspection Panel 3-Member Constitution",
                "Architectural Drawing & Built-up Area Cadre Sign-Off",
                "AICTE Portal Digital Approval Key Allocation"
            ]
        },
        "deficiencies": [
            {
                "id": "def-1",
                "orderNum": "01",
                "title": "Clear Land Title & Encumbrance Certificate",
                "isCritical": True,
                "refCode": "REF: LD-2026-NRO-99",
                "status": "deficient",
                "requirement": "Requirement: 5.20 contiguous acres at Plot 42-B, Knowledge Park III, registered for minimum 30 years without lien or second mortgages.",
                "officerName": "Dr. P. K. Verma (Senior Scrutiny Officer)",
                "officerRole": "Senior Scrutiny Officer",
                "officerComment": "Uploaded PDF contains supplementary lease agreement executed on 22 Feb 2026. However, Sub-Registrar verification stamp duty seal is missing on Folios 14, 15, and 16. Khasra map is not attested by District Tehsildar.",
                "officerDate": "22 Feb 2026, 05:22 PM",
                "applicantResponse": "Supplementary affidavit and treasury challan receipt submitted. Physical stamp clearance certificate is under expedited stamping at Gautam Buddha Nagar Registry Office.",
                "applicantDate": "24 Feb 2026, 02:11 PM"
            },
            {
                "id": "def-2",
                "orderNum": "02",
                "title": "Fire Safety NOC Undertaking (Provisional Form-F)",
                "isCritical": False,
                "refCode": "REF: FS-UP-2026-88",
                "status": "compliant",
                "requirement": "Provisional NOC from UP Fire Service Department for proposed Academic Block A & B (Built-up area: 18,400 sq.m).",
                "officerName": "Er. M. Joshi (Town Planning Directorate)",
                "officerRole": "Town Planning Directorate",
                "officerComment": "Verified provisional fire safety compliance certificate issued by Chief Fire Officer, Gautam Buddha Nagar.",
                "officerDate": "18 Feb 2026, 14:10 IST"
            },
            {
                "id": "def-3",
                "orderNum": "03",
                "title": "AICTE Regulatory Scrutiny Fee & Corpus FDR Proof",
                "isCritical": False,
                "refCode": "TXN: SBIN-2026-90812",
                "status": "compliant",
                "requirement": "Statutory fee receipt of ₹7,00,000/- and Joint FDR ₹1,00,00,000/- with Regional Officer NRO.",
                "officerName": "Auto-Reconciled via State Bank of India Gateway",
                "officerRole": "Finance Gateway",
                "officerComment": "Electronic verification successful. FDR lien marked in favor of Regional Officer, AICTE NRO.",
                "officerDate": "11 Feb 2026, 10:15 IST"
            }
        ],
        "undertakings": [
            {
                "id": "und-1",
                "title": "Affidavit for Non-Capitation Fee & Anti-Ragging Compliance",
                "refCode": "APH-AFF-01",
                "clause": "Mandatory undertaking on ₹100 non-judicial stamp paper under Supreme Court directives.",
                "status": "compliant",
                "submittedDate": "10 Feb 2026",
                "verifiedBy": "Dr. P. K. Verma"
            }
        ],
        "documents": [
            {
                "id": "doc-1",
                "name": "Land_Registry_Deed_Khasra.pdf",
                "size": "8.4 MB",
                "uploadDate": "22 Feb 2026",
                "status": "deficient",
                "category": "land",
                "sha256": "9A77F128BAE019"
            },
            {
                "id": "doc-2",
                "name": "Master_Building_Plan_PWD.pdf",
                "size": "14.2 MB",
                "uploadDate": "10 Feb 2026",
                "status": "verified",
                "category": "noc",
                "sha256": "88CC9011EFA412"
            }
        ],
        "auditLog": [
            {
                "id": "log-1",
                "title": "SLA Escalation Engine Alert",
                "timestamp": "26 Feb 2026, 11:34 AM IST",
                "description": "Automated regulatory flag raised: Case exceeded 15 working-day maximum scrutiny window without final clearance. Escalation dispatched to Member Secretary (RO Auth) and Regional Directorate.",
                "actor": "Pravah-System-Scheduler-Node-04 | Prior State: In-Scrutiny | New State: Overdue-Escalated",
                "type": "alert",
                "sha256": "8F9A2B4912EC33"
            },
            {
                "id": "log-2",
                "title": "Supplementary Affidavit Uploaded",
                "timestamp": "22 Feb 2026, 04:15 PM IST",
                "description": "Applicant representative Dr. Arvind Sharma uploaded file DOC-4392811-LD2 in response to Deficiency Notice NRO-DEF-091.",
                "actor": "Applicant Signatory (Digital Token: DSC-991204) | Stage: Stage 03 Re-Scrutiny",
                "type": "upload"
            }
        ]
    },
    {
        "id": "APP-2026-00089",
        "pid": "1-3829104",
        "institutionName": "Malaviya Institute of Technology & Research",
        "address": "NH-28, Industrial Corridor, Gorakhpur",
        "city": "Gorakhpur",
        "state": "Uttar Pradesh",
        "pin": "273010",
        "regionalOffice": "Northern Regional Office (NRO - Kanpur Jurisdiction)",
        "geoTag": "26.7606° N, 83.3732° E",
        "applicationType": "Extension of Approval (EoA)",
        "programDetails": "UG & PG Engg (6 Progs / 600 Seats)",
        "academicSession": "AY 2026-2027",
        "currentStageNumber": 4,
        "currentStageLabel": "Stage 04 (EVC Inspection)",
        "status": "evc_scheduled",
        "slaStatus": "normal",
        "daysExpended": 9,
        "statutoryCeiling": 15,
        "lastRegistryEvent": "24 Feb 2026, 04:20 PM by RO NRO",
        "assignedOfficer": {
            "name": "Dr. S. K. Awasthi",
            "role": "Regional Scrutiny Panel Head",
            "authId": "NRO-041"
        },
        "institutionProfile": {
            "managingSociety": "Purvanchal Vidya Samiti",
            "societyRegNo": "2004/UP/910",
            "principalDesignate": "Prof. S. N. Mishra",
            "officialEmail": "registrar@mitr-gorakhpur.ac.in",
            "campusPhone": "+91 551 2291040",
            "affiliatingUniversity": "MMMUT, Gorakhpur"
        },
        "deficiencies": [],
        "undertakings": [],
        "documents": [],
        "auditLog": []
    }
]

INITIAL_EVC = [
    {
        "id": "EVC-2026-042",
        "applicationId": "APP-2026-00089",
        "institutionName": "Malaviya Institute of Technology & Research",
        "location": "Gorakhpur, UP",
        "regionalOffice": "Northern Regional Office (NRO)",
        "visitDate": "28 Feb 2026",
        "panelConvener": "Prof. Animesh Roy (MNIT Allahabad)",
        "panelMembers": ["Er. V. K. Gupta (PWD Chief Engg)", "Dr. Meena Saxena (NIT Patna)"],
        "status": "Scheduled",
        "inspectionType": "Physical Campus Audit",
        "slaDaysRemaining": 3
    },
    {
        "id": "EVC-2026-043",
        "applicationId": "APP-2026-00124",
        "institutionName": "Dronacharya Institute of Engineering & Technology",
        "location": "Greater Noida, UP",
        "regionalOffice": "Northern Regional Office (NRO)",
        "visitDate": "PENDING_CLEARANCE",
        "panelConvener": "Prof. S. Sen (IIT Roorkee)",
        "panelMembers": ["TBD", "TBD"],
        "status": "Action Needed",
        "inspectionType": "Physical Campus Audit",
        "slaDaysRemaining": 0
    }
]

INITIAL_COMPLIANCE = [
    {
        "id": "CMP-2026-012",
        "institutionName": "Dronacharya Institute of Engineering & Technology",
        "applicationId": "APP-2026-00124",
        "subject": "30-Year Registered Land Lease Deed & Sub-Registrar Attestation",
        "category": "Land Lease Deed",
        "validityExpiry": "26 Feb 2026 (Elapsed)",
        "daysRemaining": -1,
        "status": "Critical Overdue",
        "refNumber": "LD-2026-NRO-99"
    }
]

INITIAL_ALERTS = [
    {
        "id": "ALT-101",
        "title": "Statutory 15-Day Ceiling Exceeded (+24h Overdue)",
        "message": "APP-2026-00124 (Dronacharya Institute) reached Day 16 without formal closure. Mandatory audit flag dispatched to National Grievance Council.",
        "timestamp": "26 Feb 2026, 11:34 AM",
        "priority": "critical",
        "category": "SLA Escalation",
        "applicationId": "APP-2026-00124",
        "institutionName": "Dronacharya Institute of Engineering & Technology",
        "resolved": False
    }
]
