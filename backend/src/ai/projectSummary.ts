import { SmartSummaryResult } from '../types';

interface ProjectSummaryInput {
  id: string;
  name: string;
  departmentName?: string;
  status: string;
  progressPercentage: number;
  allocatedBudget: number;
  utilizedBudget: number;
  startDate: Date | string;
  expectedCompletionDate: Date | string;
  riskScore: number;
  priority: string;
  milestones?: Array<{
    name: string;
    status: string;
    expectedCompletionDate: Date | string;
  }>;
  risks?: Array<{
    description: string;
    severity: string;
    status: string;
  }>;
}

function formatINR(val: number): string {
  if (val >= 10000000) {
    return `₹${(val / 10000000).toFixed(2)} Cr`;
  }
  if (val >= 100000) {
    return `₹${(val / 100000).toFixed(2)} Lakh`;
  }
  return `₹${val.toLocaleString('en-IN')}`;
}

export function generateProjectSummary(project: ProjectSummaryInput): SmartSummaryResult {
  const now = new Date();
  const start = new Date(project.startDate);
  const end = new Date(project.expectedCompletionDate);
  const daysRemaining = Math.round((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const budgetUtilization = project.allocatedBudget > 0 ? (project.utilizedBudget / project.allocatedBudget) * 100 : 0;

  const milestones = project.milestones || [];
  const delayedMilestones = milestones.filter(m => {
    if (m.status === 'COMPLETED') return false;
    return new Date(m.expectedCompletionDate) < now || m.status === 'DELAYED';
  });

  const activeRisks = (project.risks || []).filter(r => r.status === 'ACTIVE');

  // Determine risk descriptor
  let riskCategory = 'Low';
  if (project.riskScore >= 81) riskCategory = 'Critical';
  else if (project.riskScore >= 61) riskCategory = 'High';
  else if (project.riskScore >= 31) riskCategory = 'Moderate';

  // Build headline
  const headline = `${project.name} is currently ${project.progressPercentage}% complete with an overall ${riskCategory.toUpperCase()} risk rating.`;

  // Build narrative
  const deptContext = project.departmentName ? `under the ${project.departmentName}` : 'under department supervision';

  let scheduleSnippet = '';
  if (project.status === 'COMPLETED') {
    scheduleSnippet = 'The project has successfully accomplished all designated project milestones and closed operations.';
  } else if (daysRemaining < 0) {
    scheduleSnippet = `The project has overrun its scheduled completion deadline by ${Math.abs(daysRemaining)} days and is currently operating in an extended remediation phase.`;
  } else if (delayedMilestones.length > 0) {
    scheduleSnippet = `Execution is currently experiencing headwinds due to ${delayedMilestones.length} delayed key milestone(s) on the critical implementation path.`;
  } else {
    scheduleSnippet = `The project is currently proceeding in alignment with the designated timeline with ${daysRemaining} days remaining until target commissioning.`;
  }

  let budgetSnippet = '';
  if (budgetUtilization > 85 && project.progressPercentage < 70) {
    budgetSnippet = `Financial utilization has reached ${budgetUtilization.toFixed(1)}% (${formatINR(project.utilizedBudget)} utilized out of ${formatINR(project.allocatedBudget)} sanctioned), representing a notable cost variance relative to physical progress (${project.progressPercentage}%).`;
  } else {
    budgetSnippet = `Budget utilization stands at ${budgetUtilization.toFixed(1)}% (${formatINR(project.utilizedBudget)} utilized of ${formatINR(project.allocatedBudget)} sanctioned), which is within expected operational parameters.`;
  }

  const executiveSummary = `${project.name}, administered ${deptContext}, has reached a physical progress level of ${project.progressPercentage}%. ${scheduleSnippet} ${budgetSnippet} The composite ProjectSetu Risk Score is evaluated at ${project.riskScore}/100 (${riskCategory} Risk).`;

  const timelineStatus = daysRemaining < 0
    ? `Delayed by ${Math.abs(daysRemaining)} days past original target deadline (${end.toLocaleDateString('en-IN')}).`
    : `${daysRemaining} days remaining until scheduled target completion (${end.toLocaleDateString('en-IN')}).`;

  const financialStatus = `${formatINR(project.utilizedBudget)} spent of ${formatINR(project.allocatedBudget)} (${budgetUtilization.toFixed(1)}% utilized, ${formatINR(Math.max(0, project.allocatedBudget - project.utilizedBudget))} remaining).`;

  const criticalIssues: string[] = [];
  if (delayedMilestones.length > 0) {
    criticalIssues.push(`${delayedMilestones.length} overdue milestones: ${delayedMilestones.slice(0, 2).map(m => m.name).join(', ')}`);
  }
  if (budgetUtilization > 80) {
    criticalIssues.push(`High budget utilization threshold reached (${budgetUtilization.toFixed(1)}%).`);
  }
  if (activeRisks.length > 0) {
    criticalIssues.push(`${activeRisks.length} active operational/technical risks pending resolution.`);
  }
  if (criticalIssues.length === 0) {
    criticalIssues.push('No critical blockers or severe compliance issues currently flagged.');
  }

  const recommendedActions: string[] = [];
  if (delayedMilestones.length > 0) {
    recommendedActions.push('Authorize resource reprioritization to expedite delayed milestone deliverables.');
  }
  if (budgetUtilization > 80 && project.progressPercentage < 75) {
    recommendedActions.push('Audit upcoming procurement vouchers and optimize cost efficiency.');
  }
  if (daysRemaining < 45 && project.progressPercentage < 80) {
    recommendedActions.push('Establish weekly multi-departmental coordination standups to prevent further schedule slippage.');
  }
  if (recommendedActions.length === 0) {
    recommendedActions.push('Maintain bi-weekly status reporting and conduct scheduled milestone inspections.');
  }

  return {
    headline,
    executiveSummary,
    timelineStatus,
    financialStatus,
    criticalIssues,
    recommendedActions,
    lastGeneratedAt: new Date().toISOString(),
  };
}
