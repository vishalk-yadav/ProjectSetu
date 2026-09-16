import { RiskAnalysisResult, SeverityLevel } from '../types';

interface ProjectRiskInput {
  id: string;
  name: string;
  startDate: Date | string;
  expectedCompletionDate: Date | string;
  actualCompletionDate?: Date | string | null;
  status: string;
  progressPercentage: number;
  allocatedBudget: number;
  utilizedBudget: number;
  milestones?: Array<{
    id: string;
    name: string;
    status: string;
    expectedCompletionDate: Date | string;
    progressPercentage: number;
  }>;
  risks?: Array<{
    id: string;
    severity: string;
    status: string;
  }>;
  anomalies?: Array<{
    id: string;
    severity: string;
  }>;
}

export function calculateProjectRisk(project: ProjectRiskInput): RiskAnalysisResult {
  const reasons: string[] = [];
  const recommendations: string[] = [];

  const now = new Date();
  const start = new Date(project.startDate);
  const expectedEnd = new Date(project.expectedCompletionDate);

  const totalDurationDays = Math.max(1, Math.round((expectedEnd.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const daysElapsed = Math.max(0, Math.round((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const daysRemaining = Math.round((expectedEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  // Expected progress based on linear timeline
  const expectedProgress = Math.min(100, Math.max(0, (daysElapsed / totalDurationDays) * 100));
  const progressVariance = expectedProgress - project.progressPercentage;

  // 1. Delay Risk (Max 25 pts)
  let delayRisk = 0;
  if (project.status === 'COMPLETED') {
    delayRisk = 0;
  } else if (daysRemaining < 0) {
    const overdueDays = Math.abs(daysRemaining);
    delayRisk = Math.min(25, 15 + Math.round((overdueDays / 30) * 10));
    reasons.push(`Project deadline passed by ${overdueDays} days with incomplete progress (${project.progressPercentage}%).`);
    recommendations.push('Convene an emergency schedule revision committee and request revised completion milestones.');
  } else if (daysRemaining <= 30 && project.progressPercentage < 80) {
    delayRisk = 20;
    reasons.push(`Only ${daysRemaining} days remaining until deadline, but progress is at ${project.progressPercentage}%.`);
    recommendations.push('Fast-track critical path deliverables to mitigate impending deadline breach.');
  } else if (progressVariance > 20) {
    delayRisk = Math.min(20, Math.round((progressVariance / 100) * 25));
    reasons.push(`Progress is lagging expected trajectory by ${progressVariance.toFixed(1)} percentage points.`);
    recommendations.push('Conduct a milestone bottleneck review with the department project manager.');
  } else if (progressVariance > 5) {
    delayRisk = 8;
  }

  // 2. Budget Risk (Max 25 pts)
  let budgetRisk = 0;
  const budgetUtilization = project.allocatedBudget > 0 ? (project.utilizedBudget / project.allocatedBudget) * 100 : 0;
  const budgetProgressRatio = project.progressPercentage > 0 ? budgetUtilization / project.progressPercentage : 1;

  if (budgetUtilization > 95 && project.progressPercentage < 90) {
    budgetRisk = 25;
    reasons.push(`Severe budget exhaustion: ${budgetUtilization.toFixed(1)}% budget utilized while completion is only ${project.progressPercentage}%.`);
    recommendations.push('Freeze discretionary fund allocations and conduct financial audit.');
  } else if (budgetUtilization > 80 && project.progressPercentage < 65) {
    budgetRisk = 18;
    reasons.push(`High budget burn rate: ${budgetUtilization.toFixed(1)}% consumed with ${project.progressPercentage}% progress.`);
    recommendations.push('Review unit procurement costs and enforce stricter contractor invoice verification.');
  } else if (budgetProgressRatio > 1.3 && project.progressPercentage > 10) {
    budgetRisk = 12;
    reasons.push(`Budget burn rate exceeds physical progress rate by ${(budgetProgressRatio * 100 - 100).toFixed(0)}%.`);
    recommendations.push('Benchmark spending against physical deliverables.');
  } else if (budgetUtilization > 80) {
    budgetRisk = 6;
  }

  // 3. Milestone Risk (Max 20 pts)
  let milestoneRisk = 0;
  if (project.milestones && project.milestones.length > 0) {
    const totalMilestones = project.milestones.length;
    const delayedMilestones = project.milestones.filter(m => {
      if (m.status === 'COMPLETED') return false;
      const mEnd = new Date(m.expectedCompletionDate);
      return mEnd < now || m.status === 'DELAYED';
    });

    const delayedRatio = delayedMilestones.length / totalMilestones;
    if (delayedMilestones.length > 0) {
      milestoneRisk = Math.min(20, Math.round(delayedRatio * 20) + Math.min(6, delayedMilestones.length * 2));
      reasons.push(`${delayedMilestones.length} of ${totalMilestones} key milestones are currently delayed or overdue.`);
      recommendations.push(`Prioritize recovery for delayed milestones: ${delayedMilestones.slice(0, 2).map(m => `"${m.name}"`).join(', ')}.`);
    }
  }

  // 4. Progress Risk (Max 20 pts)
  let progressRisk = 0;
  if (project.status !== 'COMPLETED') {
    if (project.progressPercentage < 10 && daysElapsed > 60) {
      progressRisk = 20;
      reasons.push(`Stagnant project launch: Only ${project.progressPercentage}% progress reported despite ${daysElapsed} days since project start.`);
      recommendations.push('Investigate ground-level mobilization hurdles and inter-agency approvals.');
    } else if (progressVariance > 30) {
      progressRisk = 16;
      reasons.push(`Extreme variance: Expected progress is ${expectedProgress.toFixed(0)}% vs reported ${project.progressPercentage}%.`);
      recommendations.push('Deploy a department technical monitoring officer on-site for direct verification.');
    } else if (progressVariance > 15) {
      progressRisk = 10;
    }
  }

  // 5. Issue & Anomaly Risk (Max 10 pts)
  let issueRisk = 0;
  const activeRisks = project.risks ? project.risks.filter(r => r.status === 'ACTIVE') : [];
  const criticalRisks = activeRisks.filter(r => r.severity === 'CRITICAL');
  const highRisks = activeRisks.filter(r => r.severity === 'HIGH');
  const activeAnomalies = project.anomalies || [];

  if (criticalRisks.length > 0) {
    issueRisk += 6;
    reasons.push(`${criticalRisks.length} CRITICAL operational/environmental risk(s) actively flagged on project.`);
  }
  if (highRisks.length > 0) {
    issueRisk += 2;
  }
  if (activeAnomalies.length > 0) {
    issueRisk += Math.min(4, activeAnomalies.length * 2);
    reasons.push(`${activeAnomalies.length} behavioral anomaly detection alerts recorded in telemetry.`);
  }
  issueRisk = Math.min(10, issueRisk);

  if (project.status === 'COMPLETED') {
    return {
      score: 5,
      level: 'LOW',
      breakdown: { delayRisk: 0, budgetRisk: 0, milestoneRisk: 0, progressRisk: 0, issueRisk: 5 },
      reasons: ['Project has successfully concluded all operational phases.'],
      recommendations: ['Conduct post-implementation review and archive project closure audit.'],
    };
  }

  const rawScore = delayRisk + budgetRisk + milestoneRisk + progressRisk + issueRisk;
  const score = Math.max(5, Math.min(99, rawScore));

  let level: SeverityLevel = 'LOW';
  if (score >= 81) level = 'CRITICAL';
  else if (score >= 61) level = 'HIGH';
  else if (score >= 31) level = 'MODERATE';
  else level = 'LOW';

  if (reasons.length === 0) {
    reasons.push('Project execution metrics are aligned within planned tolerances and budget thresholds.');
  }
  if (recommendations.length === 0) {
    recommendations.push('Maintain regular bi-weekly status updates and continuous milestone tracking.');
  }

  return {
    score,
    level,
    breakdown: {
      delayRisk,
      budgetRisk,
      milestoneRisk,
      progressRisk,
      issueRisk,
    },
    reasons,
    recommendations,
  };
}
