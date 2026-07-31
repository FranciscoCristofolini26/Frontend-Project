import { Habit, HabitMetrics, HabitSummary } from '../models/habit';

export interface HeatmapDay {
  date: string;
  label: string;
  completed: boolean;
}

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;
const MILESTONES = [365, 90, 30, 7] as const;

function atDayOffset(offset: number, from = new Date()): Date {
  const date = new Date(from);
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return date;
}

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function dateDistance(first: string, second: string): number {
  const [firstYear, firstMonth, firstDay] = first.split('-').map(Number);
  const [secondYear, secondMonth, secondDay] = second.split('-').map(Number);
  return (
    (Date.UTC(secondYear, secondMonth - 1, secondDay) -
      Date.UTC(firstYear, firstMonth - 1, firstDay)) /
    ONE_DAY_IN_MS
  );
}

function uniqueCompletedDates(habit: Habit): string[] {
  return [...new Set(habit.completedDates)].sort();
}

export function buildHeatmap(habit: Habit, days: number): HeatmapDay[] {
  const completed = new Set(habit.completedDates);

  return Array.from({ length: days }, (_, index) => {
    const date = atDayOffset(index - days + 1);
    const key = toDateKey(date);
    return {
      date: key,
      label: new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(date),
      completed: completed.has(key),
    };
  });
}

export function calculateCurrentStreak(habit: Habit): number {
  const completed = new Set(habit.completedDates);
  let streak = 0;

  while (completed.has(toDateKey(atDayOffset(-streak)))) {
    streak += 1;
  }

  return streak;
}

export function calculateBestStreak(habit: Habit): number {
  const dates = uniqueCompletedDates(habit);
  if (!dates.length) return 0;

  let current = 1;
  let best = 1;

  for (let index = 1; index < dates.length; index += 1) {
    if (dateDistance(dates[index - 1], dates[index]) === 1) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 1;
    }
  }

  return best;
}

export function calculateHabitMetrics(habit: Habit): HabitMetrics {
  const completedDates = uniqueCompletedDates(habit);
  const currentStreak = calculateCurrentStreak(habit);
  const bestStreak = calculateBestStreak(habit);
  const lastThirtyDays = buildHeatmap(habit, 30);
  const consistency = Math.round(
    (lastThirtyDays.filter((day) => day.completed).length / lastThirtyDays.length) * 100,
  );

  return {
    currentStreak,
    bestStreak,
    consistency,
    completedDays: completedDates.length,
    milestone: MILESTONES.find((milestone) => bestStreak >= milestone) ?? null,
  };
}

export function calculateHabitSummary(habits: Habit[]): HabitSummary {
  const activeHabits = habits.filter((habit) => habit.status === 'active');
  const metrics = habits.map(calculateHabitMetrics);

  return {
    activeCount: activeHabits.length,
    highestCurrentStreak: Math.max(0, ...metrics.map((metric) => metric.currentStreak)),
    accumulatedDays: metrics.reduce((total, metric) => total + metric.completedDays, 0),
    averageConsistency: habits.length
      ? Math.round(metrics.reduce((total, metric) => total + metric.consistency, 0) / habits.length)
      : 0,
  };
}
