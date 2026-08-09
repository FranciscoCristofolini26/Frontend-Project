const MS_PER_DAY = 86_400_000;

export interface CalendarDay {
  date: Date;
  key: string;
  isCurrentMonth: boolean;
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, amount: number): Date {
  const result = startOfDay(date);
  result.setDate(result.getDate() + amount);
  return result;
}

export function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

export function startOfWeek(date: Date): Date {
  const day = startOfDay(date);
  const offset = (day.getDay() + 6) % 7;
  return addDays(day, -offset);
}

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function fromDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function isSameDay(first: Date, second: Date): boolean {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

export function buildMonthDays(referenceDate: Date): CalendarDay[] {
  const monthStart = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
  const firstVisibleDay = startOfWeek(monthStart);

  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(firstVisibleDay, index);
    return {
      date,
      key: toDateKey(date),
      isCurrentMonth: date.getMonth() === referenceDate.getMonth(),
    };
  });
}

export function compareTime(first: string, second: string): number {
  return first.localeCompare(second);
}

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function daysBetween(first: Date, second: Date): number {
  return Math.round((startOfDay(second).getTime() - startOfDay(first).getTime()) / MS_PER_DAY);
}
