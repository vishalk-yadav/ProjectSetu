import { AnomalyItem, SeverityLevel } from '../types';

interface ProjectAnomalyInput {
  id: string;
  name: string;
  status: string;
  progressPercentage: number;
  allocatedBudget: number;
  utilizedBudget: number;
  startDate: Date | string;
  expectedCompletionDate: Date | string;
  updatedAt: Date | string;
  milestones?: Array<{
    id: string;
    name: string;
    status: string;
    expectedCompletionDate: Date | string;
    progressPercentage: number;
  }>;
  budgetTransactions?: Array<{
    amount: number;
    transactionDate: Date | string;
  }>;
}

export function detectProjectAnomalies(project: ProjectAnomalyInput): AnomalyItem[] {
  const anomalies: AnomalyItem[] = [];
  const now = new Date();
  const start = new Date(project.startDate);
  const end = new Date(project.expectedCompletionDate);
  const lastUpdated = new Date(project.updatedAt);

  if (project.status === 'COMPLETED') {
    return [];
  }

  // 1. Check Stale Updates (no updates in > 30 days on an active project)
  const daysSinceUpdate = Math.round((now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24));
  if (daysSinceUpdate > 30 && project.status === 'IN_PROGRESS') {
    anomalies.push({
      projectId: project.id,
      type: 'STALE_UPDATES',
      severity: daysSinceUpdate > 60 ? 'HIGH' : 'MEDIUM',
      description: `Project telemetry has not been updated for ${daysSinceUpdate} days. Risk of undetected ground-level blockers.`,
      detectedAt: now,
    });
  }

  // 2. Severe Progress vs Budget Variance
  const budgetUtilization = project.allocatedBudget > 0 ? (project.utilizedBudget / project.allocatedBudget) * 100 : 0;
  const progressGap = budgetUtilization - project.progressPercentage;

  if (budgetUtilization > 75 && project.progressPercentage < 50) {
    anomalies.push({
      projectId: project.id,
      type: 'UNUSUAL_BUDGET_EXHAUSTION',
      severity: 'CRITICAL',
      description: `Critical fiscal divergence: ${budgetUtilization.toFixed(1)}% budget consumed but only ${project.progressPercentage}% physical progress completed.`,
      detectedAt: now,
    });
  } else if (progressGap > 25 && project.progressPercentage > 0) {
    anomalies.push({
      projectId: project.id,
      type: 'SEVERE_PROGRESS_VARIANCE',
      severity: 'HIGH',
      description: `Budget consumption exceeds physical milestones by ${progressGap.toFixed(1)} percentage points.`,
      detectedAt: now,
    });
  }

  // 3. Deadline Slippage Anomaly
  const daysRemaining = Math.round((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysRemaining < 0 && project.status !== 'COMPLETED') {
    anomalies.push({
      projectId: project.id,
      type: 'DEADLINE_SLIPPAGE',
      severity: Math.abs(daysRemaining) > 60 ? 'CRITICAL' : 'HIGH',
      description: `Target completion date lapsed by ${Math.abs(daysRemaining)} days without project completion sign-off.`,
      detectedAt: now,
    });
  } else if (daysRemaining <= 21 && project.progressPercentage < 75) {
    anomalies.push({
      projectId: project.id,
      type: 'DEADLINE_SLIPPAGE',
      severity: 'HIGH',
      description: `Only ${daysRemaining} days remaining with ${(100 - project.progressPercentage).toFixed(0)}% pending work. High risk of missing deadline.`,
      detectedAt: now,
    });
  }

  // 4. Spend Spike Anomaly (recent transactions totaling > 20% of budget within 30 days)
  if (project.budgetTransactions && project.budgetTransactions.length > 0) {
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentSpend = project.budgetTransactions
      .filter(t => new Date(t.transactionDate) >= thirtyDaysAgo)
      .reduce((sum, t) => sum + t.amount, 0);

    const recentSpendPercent = project.allocatedBudget > 0 ? (recentSpend / project.allocatedBudget) * 100 : 0;
    if (recentSpendPercent >= 20) {
      anomalies.push({
        projectId: project.id,
        type: 'SPEND_SPIKE',
        severity: recentSpendPercent > 35 ? 'CRITICAL' : 'HIGH',
        description: `Unusual expenditure surge: ${recentSpendPercent.toFixed(1)}% of total sanctioned budget disbursed in the last 30 days.`,
        detectedAt: now,
      });
    }
  }

  return anomalies;
}
