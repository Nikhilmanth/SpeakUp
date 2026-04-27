// XP thresholds for level titles
export const LEVELS = [
  { min: 0, title: "Novice" },
  { min: 50, title: "Beginner" },
  { min: 150, title: "Apprentice" },
  { min: 350, title: "Conversationalist" },
  { min: 700, title: "Fluent Learner" },
  { min: 1200, title: "Expert" },
  { min: 2000, title: "Master" },
];

export function getLevel(xp: number) {
  let current = LEVELS[0];
  let next = LEVELS[1];
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].min) {
      current = LEVELS[i];
      next = LEVELS[i + 1] ?? LEVELS[i];
    }
  }
  const progress = next === current ? 100 : Math.round(((xp - current.min) / (next.min - current.min)) * 100);
  return { ...current, nextMin: next.min, progress };
}
