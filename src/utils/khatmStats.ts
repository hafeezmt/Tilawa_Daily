export interface KhatmProgressStats {
  completedHizbs: number;
  totalHizbs: number;
  percentComplete: number;
  remainingHizbs: number;
  estimatedDaysToFinish: number;
}

export function calculateKhatmStats(completedHizbCount: number, dailyTarget: number = 5): KhatmProgressStats {
  const total = 60;
  const clamped = Math.min(Math.max(completedHizbCount, 0), total);
  const remaining = total - clamped;
  const percent = Math.round((clamped / total) * 100);
  const days = Math.ceil(remaining / dailyTarget);

  return {
    completedHizbs: clamped,
    totalHizbs: total,
    percentComplete: percent,
    remainingHizbs: remaining,
    estimatedDaysToFinish: days
  };
}
