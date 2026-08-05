const DAY_IN_MS = 24 * 60 * 60 * 1000;
const MONTHS = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

function normalizedDate(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(12, 0, 0, 0);
  return normalized;
}

export function addDays(date: Date, days: number): Date {
  const result = normalizedDate(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function startOfWeek(date: Date): Date {
  const result = normalizedDate(date);
  const weekday = result.getDay() || 7;
  result.setDate(result.getDate() - weekday + 1);
  return result;
}

export function weekIdFor(date: Date): string {
  const weekStart = startOfWeek(date);
  const thursday = addDays(weekStart, 3);
  const year = thursday.getFullYear();
  const firstThursday = new Date(year, 0, 4, 12);
  const firstWeekStart = startOfWeek(firstThursday);
  const weekNumber =
    Math.round((weekStart.getTime() - firstWeekStart.getTime()) / (7 * DAY_IN_MS)) + 1;

  return `${year}-W${String(weekNumber).padStart(2, '0')}`;
}

export function weekRangeLabel(date: Date): string {
  const start = startOfWeek(date);
  const end = addDays(start, 6);
  const startLabel = `${String(start.getDate()).padStart(2, '0')} ${MONTHS[start.getMonth()]}`;
  const endLabel = `${String(end.getDate()).padStart(2, '0')} ${MONTHS[end.getMonth()]}`;
  return `${startLabel} — ${endLabel}`;
}

export function weekDateKeys(weekId: string): string[] {
  const [yearValue, weekValue] = weekId.split('-W');
  const year = Number(yearValue);
  const week = Number(weekValue);
  const firstWeekStart = startOfWeek(new Date(year, 0, 4, 12));
  const start = addDays(firstWeekStart, (week - 1) * 7);
  return Array.from({ length: 7 }, (_, index) => toDateKey(addDays(start, index)));
}

export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function isFutureWeek(weekId: string): boolean {
  return weekId > weekIdFor(new Date());
}

export function isCurrentWeek(weekId: string): boolean {
  return weekId === weekIdFor(new Date());
}
