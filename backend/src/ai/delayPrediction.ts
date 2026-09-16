import { DelayPredictionResult } from '../types';

interface ProjectDelayInput {
  id: string;
  name: string;
  startDate: Date | string;
  expectedCompletionDate: Date | string;
  actualCompletionDate?: Date | string | null;
  status: string;
  progressPercentage: number;
  milestones?: Array<{
    id: string;
    name: string;
    status: string;
    expectedCompletionDate: Date | string;
    actualCompletionDate?: Date | string | null;
    progressPercentage: number;
  }>;
}

export function predictProjectDelay(project: ProjectDelayInput): DelayPredictionResult {
  const now = new Date();
  const start = new Date(project.startDate);
  const expectedEnd = new Date(project.expectedCompletionDate);

  if (project.status === 'COMPLETED') {
    return {
      delayProbability: 0,
      prediction: 'LOW_RISK',
      statusText: 'COMPLETED ON SCHEDULE',
      estimatedDelayDays: 0,
      projectedCompletionDate: (project.actualCompletionDate ? new Date(project.actualCompletionDate) : now).toISOString().split('T')[0],
      confidenceScore: 98,
      factors: ['Project has reached 100% completion.'],
      recommendedAction: 'Final sign-off achieved. No schedule intervention needed.',
    };
  }

  const totalDurationDays = Math.max(1, Math.round((expectedEnd.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const daysElapsed = Math.max(1, Math.round((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const daysRemaining = Math.round((expectedEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  // Current physical progress velocity (% per day)
  const currentVelocity = Math.max(0.01, project.progressPercentage / daysElapsed);
  const remainingWork = Math.max(0, 100 - project.progressPercentage);

  // Projected days needed at current velocity
  const projectedDaysNeeded = Math.round(remainingWork / currentVelocity);
  const estimatedScheduleGap = projectedDaysNeeded - Math.max(0, daysRemaining);

  // Analyze milestone bottlenecks
  const milestones = project.milestones || [];
  const delayedMilestones = milestones.filter(m => {
    if (m.status === 'COMPLETED') return false;
    return new Date(m.expectedCompletionDate) < now || m.status === 'DELAYED';
  });

  const factors: string[] = [];
  let probability = 10;

  if (daysRemaining < 0) {
    const overdue = Math.abs(daysRemaining);
    probability = 95;
    factors.push(`Deadline lapsed ${overdue} days ago with ${remainingWork.toFixed(0)}% work remaining.`);
  } else {
    // Velocity analysis
    const plannedVelocity = 100 / totalDurationDays;
    const velocityRatio = currentVelocity / plannedVelocity;

    if (velocityRatio < 0.5) {
      probability += 50;
      factors.push(`Execution speed (${currentVelocity.toFixed(2)}%/day) is less than half planned pace (${plannedVelocity.toFixed(2)}%/day).`);
    } else if (velocityRatio < 0.8) {
      probability += 30;
      factors.push(`Current progress velocity lags target trajectory by ${((1 - velocityRatio) * 100).toFixed(0)}%.`);
    } else {
      factors.push(`Progress velocity is within 85%+ of expected trajectory.`);
    }

    // Days remaining vs needed
    if (daysRemaining < 45 && project.progressPercentage < 70) {
      probability += 25;
      factors.push(`Only ${daysRemaining} days remaining for ${remainingWork.toFixed(0)}% pending deliverables.`);
    }

    // Milestone delays
    if (delayedMilestones.length > 0) {
      probability += Math.min(25, delayedMilestones.length * 10);
      factors.push(`${delayedMilestones.length} milestone(s) on critical path are currently overdue.`);
    }
  }

  probability = Math.max(5, Math.min(96, probability));

  // Calculate projected completion date
  const projectedDaysFromNow = Math.max(daysRemaining + Math.max(0, estimatedScheduleGap), 5);
  const projectedDate = new Date(now.getTime() + projectedDaysFromNow * 24 * 60 * 60 * 1000);
  const estimatedDelayDays = Math.max(0, Math.round((projectedDate.getTime() - expectedEnd.getTime()) / (1000 * 60 * 60 * 24)));

  let prediction: DelayPredictionResult['prediction'] = 'LOW_RISK';
  let statusText = 'ON TRACK';
  let recommendedAction = 'Maintain standard progress tracking and milestone sign-offs.';

  if (probability >= 80) {
    prediction = 'CRITICAL_DELAY';
    statusText = 'CRITICAL DELAY IMMINENT';
    recommendedAction = 'Deploy emergency technical task force, parallelize remaining milestones, and fast-track inter-department clearances.';
  } else if (probability >= 55) {
    prediction = 'HIGH_RISK';
    statusText = 'HIGH PROBABILITY OF DELAY';
    recommendedAction = 'Issue formal notice to contractors, augment manpower, and hold weekly inter-department review meetings.';
  } else if (probability >= 30) {
    prediction = 'MODERATE_RISK';
    statusText = 'MODERATE SCHEDULE VULNERABILITY';
    recommendedAction = 'Monitor delayed milestones closely and establish contingency buffers for civil works.';
  }

  return {
    delayProbability: probability,
    prediction,
    statusText,
    estimatedDelayDays,
    projectedCompletionDate: projectedDate.toISOString().split('T')[0],
    confidenceScore: Math.min(94, 75 + Math.round((milestones.length / 5) * 15)),
    factors,
    recommendedAction,
  };
}
