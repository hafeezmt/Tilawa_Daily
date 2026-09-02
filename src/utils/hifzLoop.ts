export interface HifzRepeatSettings {
  ayahNumber: number;
  repeatCount: number; // e.g. 1, 3, 5, 10
  currentIteration: number;
  infiniteLoop: boolean;
}

export function calculateNextHifzIteration(settings: HifzRepeatSettings): { shouldContinue: boolean; nextSettings: HifzRepeatSettings } {
  if (settings.infiniteLoop) {
    return {
      shouldContinue: true,
      nextSettings: { ...settings, currentIteration: settings.currentIteration + 1 }
    };
  }

  const nextIter = settings.currentIteration + 1;
  const shouldContinue = nextIter <= settings.repeatCount;

  return {
    shouldContinue,
    nextSettings: { ...settings, currentIteration: nextIter }
  };
}
