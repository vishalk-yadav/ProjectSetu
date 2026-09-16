export type UserRole = 'SUPER_ADMIN' | 'DEPARTMENT_ADMIN' | 'PROJECT_MANAGER' | 'CITIZEN';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive?: boolean;
  departmentId?: string | null;
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
  createdAt: Date | string;
  updatedAt: Date | string;
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
  createdAt: Date | string;
}

export interface ProjectDiscussionItem {
  id: string;
  projectId: string;
  userId?: string | null;
  senderName: string;
  senderRole: string;
  message: string;
  createdAt: Date | string;
}

export interface SystemSettingItem {
  id: string;
  key: string;
  value: string;
  category: string;
  description?: string | null;
  updatedAt: Date | string;
}

export type ProjectStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED';
export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type SeverityLevel = 'LOW' | 'MODERATE' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface RiskAnalysisResult {
  score: number; // 0 - 100
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

export interface DelayPredictionResult {
  delayProbability: number; // 0 - 100%
  prediction: 'LOW_RISK' | 'MODERATE_RISK' | 'HIGH_RISK' | 'CRITICAL_DELAY';
  statusText: string;
  estimatedDelayDays: number;
  projectedCompletionDate: string;
  confidenceScore: number;
  factors: string[];
  recommendedAction: string;
}

export interface CostPredictionResult {
  costOverrunProbability: number; // 0 - 100%
  predictedFinalCost: number; // In INR
  allocatedBudget: number;
  utilizedBudget: number;
  remainingBudget: number;
  projectedVariance: number; // Difference
  costPerformanceIndex: number; // CPI (Earned Value / Actual Cost)
  schedulePerformanceIndex: number; // SPI (Earned Value / Planned Value)
  riskLevel: SeverityLevel;
  recommendations: string[];
}

export interface AnomalyItem {
  id?: string;
  projectId: string;
  type: string;
  severity: SeverityLevel;
  description: string;
  detectedAt?: Date | string;
}

export interface SmartSummaryResult {
  headline: string;
  executiveSummary: string;
  timelineStatus: string;
  financialStatus: string;
  criticalIssues: string[];
  recommendedActions: string[];
  lastGeneratedAt: string;
}
