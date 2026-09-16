export type UserRole = 'SUPER_ADMIN' | 'DEPARTMENT_ADMIN' | 'PROJECT_MANAGER' | 'CITIZEN';

export interface User {
  id: string;
  name: string;
  email?: string | null;
  mobileNumber?: string | null;
  mobileVerified?: boolean;
  accountStatus?: string;
  role: UserRole;
  isActive?: boolean;
  departmentId?: string | null;
  department?: {
    id: string;
    name: string;
    code: string;
  };
  _count?: {
    managedProjects?: number;
    uploadedDocuments?: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export type ProjectStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED';
export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type SeverityLevel = 'LOW' | 'MODERATE' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Milestone {
  id: string;
  projectId: string;
  name: string;
  description: string;
  expectedCompletionDate: string;
  actualCompletionDate?: string | null;
  status: ProjectStatus;
  progressPercentage: number;
  responsiblePerson: string;
  priority: PriorityLevel;
  isOverdue?: boolean;
  displayStatus?: string;
}

export interface BudgetTransaction {
  id: string;
  projectId: string;
  amount: number;
  transactionDate: string;
  category: string;
  description: string;
  project?: {
    id: string;
    name: string;
  };
}

export interface Risk {
  id: string;
  projectId: string;
  riskType: string;
  severity: SeverityLevel;
  description: string;
  status: string;
  createdAt: string;
  project?: {
    id: string;
    name: string;
    department?: { code: string };
  };
}

export interface Anomaly {
  id: string;
  projectId: string;
  type: string;
  severity: SeverityLevel;
  description: string;
  detectedAt: string;
  project?: {
    id: string;
    name: string;
    department?: { code: string };
  };
}

export interface DocumentItem {
  id: string;
  projectId: string;
  name: string;
  fileUrl: string;
  fileType: string;
  category: string;
  isPublic?: boolean;
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  uploadedById?: string | null;
  uploadedAt: string;
  project?: {
    id: string;
    name: string;
    department?: { code: string; name?: string };
  };
  uploadedBy?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface NotificationItem {
  id: string;
  userId?: string | null;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'CRITICAL';
  severity: SeverityLevel;
  isRead: boolean;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  projectCode?: string | null;
  implementingAgency?: string | null;
  state?: string | null;
  city?: string | null;
  description: string;
  departmentId: string;
  department: {
    id: string;
    name: string;
    code: string;
  };
  projectManagerId?: string | null;
  projectManager?: {
    id: string;
    name: string;
    email: string;
    role?: string;
  };
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  startDate: string;
  expectedCompletionDate: string;
  actualCompletionDate?: string | null;
  status: ProjectStatus;
  progressPercentage: number;
  allocatedBudget: number;
  utilizedBudget: number;
  revisedBudget?: number | null;
  riskScore: number;
  priority: PriorityLevel;
  officialSourceUrl?: string | null;
  dataClassification?: string | null;
  createdAt: string;
  updatedAt: string;
  milestones?: Milestone[];
  budgetTransactions?: BudgetTransaction[];
  risks?: Risk[];
  anomalies?: Anomaly[];
  documents?: DocumentItem[];
  _count?: {
    milestones: number;
    risks: number;
    anomalies: number;
    documents: number;
  };
}

export interface Department {
  id: string;
  name: string;
  code: string;
  departmentHead: string;
  contactInformation: string;
  totalUsers?: number;
  stats?: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    delayedProjects: number;
    avgProgress: number;
    totalAllocatedBudget: number;
    totalBudgetUtilized: number;
    budgetUtilizationPercentage: number;
    avgRiskScore: number;
    completionRate: number;
  };
  performanceScore?: number;
  rank?: number;
}

export interface RiskAnalysis {
  projectId: string;
  projectName: string;
  score: number;
  level: SeverityLevel;
  breakdown: {
    delayRisk: number;
    budgetRisk: number;
    milestoneRisk: number;
    progressRisk: number;
    issueRisk: number;
  };
  reasons: string[];
  recommendations: string[];
}

export interface DelayPrediction {
  projectId: string;
  projectName: string;
  delayProbability: number;
  prediction: 'LOW_RISK' | 'MODERATE_RISK' | 'HIGH_RISK' | 'CRITICAL_DELAY';
  statusText: string;
  estimatedDelayDays: number;
  projectedCompletionDate: string;
  confidenceScore: number;
  factors: string[];
  recommendedAction: string;
}

export interface CostPrediction {
  projectId: string;
  projectName: string;
  costOverrunProbability: number;
  predictedFinalCost: number;
  allocatedBudget: number;
  utilizedBudget: number;
  remainingBudget: number;
  projectedVariance: number;
  costPerformanceIndex: number;
  schedulePerformanceIndex: number;
  riskLevel: SeverityLevel;
  recommendations: string[];
}

export interface SmartSummary {
  projectId: string;
  projectName: string;
  headline: string;
  executiveSummary: string;
  timelineStatus: string;
  financialStatus: string;
  criticalIssues: string[];
  recommendedActions: string[];
  lastGeneratedAt: string;
}

export interface AssistantQueryResult {
  answer: string;
  queryIntent: string;
  confidence: number;
  highlightMetric?: {
    label: string;
    value: string;
    subtext?: string;
  };
  projects?: Array<{
    id: string;
    name: string;
    departmentName: string;
    status: string;
    progressPercentage: number;
    riskScore: number;
    budgetUtilization: number;
    location: string;
  }>;
  departments?: Array<{
    id: string;
    name: string;
    code: string;
    totalProjects: number;
    highRiskProjects: number;
    avgProgress: number;
  }>;
  suggestions: string[];
}

export type ComplaintStatus = 'PENDING' | 'IN_REVIEW' | 'RESOLVED' | 'REJECTED';
export type ComplaintCategory =
  | 'CONSTRUCTION_DELAY'
  | 'QUALITY_DEFECT'
  | 'FINANCIAL_MISUSE'
  | 'SAFETY_HAZARD'
  | 'ENVIRONMENTAL_VIOLATION'
  | 'CITIZEN_GRIEVANCE'
  | 'OTHER';

export interface Complaint {
  id: string;
  trackingId?: string;
  projectId?: string | null;
  project?: {
    id: string;
    name: string;
    location?: string;
    status?: string;
    department?: {
      id: string;
      name: string;
      code: string;
    };
  };
  userId?: string | null;
  complainantName: string;
  complainantEmail: string;
  complainantPhone?: string | null;
  complainantRole: string;
  isPublic?: boolean;
  category: string;
  severity: SeverityLevel;
  subject: string;
  description: string;
  photoUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  locationAccuracy?: number | null;
  locationAddress?: string | null;
  status: ComplaintStatus;
  assignedTo?: string | null;
  resolutionNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ApprovalType = 'PROGRESS_UPDATE' | 'MILESTONE_STATUS' | 'BUDGET_REVISION' | 'DOCUMENT_UPLOAD';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ApprovalRequestItem {
  id: string;
  projectId: string;
  requestedById: string;
  type: ApprovalType;
  title: string;
  description: string;
  payload: string;
  status: ApprovalStatus;
  reviewedById?: string | null;
  reviewNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  project?: {
    id: string;
    name: string;
    department?: { id: string; name: string; code: string };
  };
  requestedBy?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  reviewedBy?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface AuditLogItem {
  id: string;
  userId?: string | null;
  userEmail?: string | null;
  userName?: string | null;
  role?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  details: string;
  ipAddress?: string | null;
  createdAt: string;
}

export interface ProjectDiscussionItem {
  id: string;
  projectId: string;
  userId?: string | null;
  senderName: string;
  senderRole: string;
  message: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface SystemSettingItem {
  id: string;
  key: string;
  value: string;
  category: string;
  description?: string | null;
  updatedAt: string;
}

