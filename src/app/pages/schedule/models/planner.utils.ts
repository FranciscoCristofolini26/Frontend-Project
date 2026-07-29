import { PlannerEvent, PositionedPlannerEvent } from './planner';

export const DAY_START_HOUR = 8;
export const DAY_END_HOUR = 20;
export const PIXELS_PER_MINUTE = 2;

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, amount: number): Date {
  const result = startOfDay(date);
  result.setDate(result.getDate() + amount);
  return result;
}

export function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function durationInMinutes(event: Pick<PlannerEvent, 'startTime' | 'endTime'>): number {
  return Math.max(0, toMinutes(event.endTime) - toMinutes(event.startTime));
}

export function startOfWeek(date: Date): Date {
  const result = startOfDay(date);
  const offset = result.getDay() === 0 ? -6 : 1 - result.getDay();
  result.setDate(result.getDate() + offset);
  return result;
}

export function getWeekDays(date: Date): Date[] {
  const monday = startOfWeek(date);
  return Array.from({ length: 7 }, (_, index) => addDays(monday, index));
}

export function layoutEvents(events: PlannerEvent[]): PositionedPlannerEvent[] {
  const sorted = [...events].sort(
    (first, second) => toMinutes(first.startTime) - toMinutes(second.startTime),
  );
  const groups: PlannerEvent[][] = [];
  let currentGroup: PlannerEvent[] = [];
  let furthestEnd = 0;

  for (const event of sorted) {
    const eventStart = toMinutes(event.startTime);
    if (currentGroup.length > 0 && eventStart >= furthestEnd) {
      groups.push(currentGroup);
      currentGroup = [];
      furthestEnd = 0;
    }

    currentGroup.push(event);
    furthestEnd = Math.max(furthestEnd, toMinutes(event.endTime));
  }

  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  return groups.flatMap((group) => {
    const columnsEnd: number[] = [];
    const positioned = group.map((event) => {
      const start = toMinutes(event.startTime);
      let column = columnsEnd.findIndex((end) => end <= start);
      if (column === -1) {
        column = columnsEnd.length;
      }
      columnsEnd[column] = toMinutes(event.endTime);
      return { ...event, column, columnCount: 1 };
    });

    return positioned.map((event) => ({ ...event, columnCount: columnsEnd.length }));
  });
}
