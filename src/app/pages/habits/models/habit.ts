export const HABIT_CATEGORIES = ['Saúde', 'Mente', 'Estudo', 'Bem-estar'] as const;

export type HabitCategory = (typeof HABIT_CATEGORIES)[number];
export type HabitFrequencyType = 'daily' | 'weekdays' | 'custom';
export type HabitStatus = 'active' | 'paused';

export interface Habit {
  id: number;
  name: string;
  icon: string;
  category: HabitCategory;
  frequencyType: HabitFrequencyType;
  time?: string;
  goal?: string;
  note?: string;
  status: HabitStatus;
  completedDates: string[];
  createdAt: string;
}

export interface HabitDraft {
  name: string;
  icon: string;
  category: HabitCategory;
  frequencyType: HabitFrequencyType;
  time: string;
  goal: string;
  note: string;
}

export interface HabitMetrics {
  currentStreak: number;
  bestStreak: number;
  consistency: number;
  completedDays: number;
  milestone: number | null;
}

export interface HabitSummary {
  activeCount: number;
  highestCurrentStreak: number;
  accumulatedDays: number;
  averageConsistency: number;
}

export function emptyHabitDraft(): HabitDraft {
  return {
    name: '',
    icon: 'self_improvement',
    category: 'Saúde',
    frequencyType: 'daily',
    time: '',
    goal: '',
    note: '',
  };
}

export function habitToDraft(habit: Habit): HabitDraft {
  return {
    name: habit.name,
    icon: habit.icon,
    category: habit.category,
    frequencyType: habit.frequencyType,
    time: habit.time ?? '',
    goal: habit.goal ?? '',
    note: habit.note ?? '',
  };
}
