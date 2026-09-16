import { CostPredictionResult, SeverityLevel } from '../types';

interface ProjectCostInput {
  id: string;
  name: string;
  startDate: Date | string;
  expectedCompletionDate: Date | string;
  progressPercentage: number;
  allocatedBudget: number; // BAC (Budget at Completion)
  utilizedBudget: number; // AC (Actual Cost)
}

export function predictCostOverrun(project: ProjectCostInput): CostPredictionResult {
  const recommendations: string[] = [];
  const bac = project.allocatedBudget; // Budget At Completion
  const ac = project.utilizedBudget; // Actual Cost
  const progress = Math.max(1, project.progressPercentage); // Avoid div by zero

  // Earned Value (EV) = BAC * (Progress / 100)
  const ev = (bac * progress) / 100;

  // Planned duration calculation for Planned Value (PV)
  const now = new Date();
  const start = new Date(project.startDate);
  const end = new Date(project.expectedCompletionDate);
  const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const elapsedDays = Math.max(1, Math.round((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const plannedProgress = Math.min(100, Math.max(1, (elapsedDays / totalDays) * 100));
  const pv = (bac * plannedProgress) / 100;

  // Cost Performance Index (CPI) = EV / AC
  // If AC is very low or 0, CPI defaults to 1.0
  let cpi = ac > 0 ? ev / ac : 1.0;
  // Cap reasonable CPI bounds to avoid infinity or ridiculous values
  cpi = Math.max(0.2, Math.min(2.5, Number(cpi.toFixed(3))));

  // Schedule Performance Index (SPI) = EV / PV
  let spi = pv > 0 ? ev / pv : 1.0;
  spi = Math.max(0.2, Math.min(2.5, Number(spi.toFixed(3))));

  // Estimate at Completion (EAC)
  // If CPI < 1.0, project will cost more than budget: EAC = BAC / CPI
  let eac = cpi > 0 ? bac / cpi : bac * 1.5;

  // Ensure EAC is at least AC
  eac = Math.max(ac, Math.round(eac));

  const projectedVariance = eac - bac; // Positive = cost overrun
  const remainingBudget = Math.max(0, bac - ac);

  // Overrun probability calculation
  let overrunProbability = 10;
  if (projectedVariance > 0) {
    const overrunRatio = projectedVariance / bac;
    overrunProbability = Math.min(95, Math.round(30 + overrunRatio * 80));
  } else if (cpi < 0.9) {
    overrunProbability = 50;
  } else if (cpi >= 1.05) {
    overrunProbability = 5;
  }

  // Risk Level determination
  let riskLevel: SeverityLevel = 'LOW';
  if (overrunProbability >= 70 || projectedVariance > bac * 0.25) {
    riskLevel = 'CRITICAL';
    recommendations.push('Immediate expenditure audit required: Projected final cost exceeds sanctioned budget significantly.');
    recommendations.push('Prepare supplementary grant request or trim non-essential scope items.');
  } else if (overrunProbability >= 45 || projectedVariance > bac * 0.1) {
    riskLevel = 'HIGH';
    recommendations.push('Cost Performance Index (CPI) is below 0.90. Review high-variance procurement line items.');
    recommendations.push('Enforce stricter stage-gate approval before releasing remaining funds.');
  } else if (overrunProbability >= 25) {
    riskLevel = 'MEDIUM';
    recommendations.push('Monitor inflation and raw material escalation clauses closely with vendors.');
  } else {
    recommendations.push('Financial utilization is well-calibrated with physical construction progress.');
  }

  return {
    costOverrunProbability: overrunProbability,
    predictedFinalCost: eac,
    allocatedBudget: bac,
    utilizedBudget: ac,
    remainingBudget,
    projectedVariance,
    costPerformanceIndex: cpi,
    schedulePerformanceIndex: spi,
    riskLevel,
    recommendations,
  };
}
