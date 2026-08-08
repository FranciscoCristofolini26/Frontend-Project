export type HabitFrequencyType = 'daily' | 'weekdays' | 'custom';
export type HabitStatus = 'active' | 'paused';

export interface Habit {
  id: number;
  name: string;
  icon: string;
  categoryId: string;
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
  categoryId: string;
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
    categoryId: 'saude',
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
    categoryId: habit.categoryId,
    frequencyType: habit.frequencyType,
    time: habit.time ?? '',
    goal: habit.goal ?? '',
    note: habit.note ?? '',
  };
}
