import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import {
  DAY_END_HOUR,
  DAY_START_HOUR,
  PIXELS_PER_MINUTE,
  PlannerEvent,
  PositionedPlannerEvent,
  durationInMinutes,
  getWeekDays,
  layoutEvents,
  toMinutes,
} from '../../models';
import { PlannerEventCard } from '../planner-event-card/planner-event-card';

interface WeekDay {
  date: Date;
  key: string;
  label: string;
  dayNumber: string;
  events: PositionedPlannerEvent[];
}

@Component({
  selector: 'app-planner-week-view',
  imports: [PlannerEventCard],
  templateUrl: './planner-week-view.html',
  styleUrl: './planner-week-view.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlannerWeekView {
  readonly date = input.required<Date>();
  readonly events = input<PlannerEvent[]>([]);
  readonly eventRemoved = output<number>();
  readonly hours = Array.from(
    { length: DAY_END_HOUR - DAY_START_HOUR + 1 },
    (_, index) => DAY_START_HOUR + index,
  );
  readonly weekDays = computed<WeekDay[]>(() =>
    getWeekDays(this.date()).map((date) => {
      const key = this.toDateKey(date);
      return {
        date,
        key,
        label: new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(date).replace('.', ''),
        dayNumber: `${date.getDate()}`,
        events: layoutEvents(this.events().filter((event) => event.date === key)),
      };
    }),
  );

  eventTop(event: PositionedPlannerEvent): number {
    return (toMinutes(event.startTime) - DAY_START_HOUR * 60) * PIXELS_PER_MINUTE;
  }

  eventHeight(event: PositionedPlannerEvent): number {
    return Math.max(durationInMinutes(event) * PIXELS_PER_MINUTE - 6, 42);
  }

  eventLeft(event: PositionedPlannerEvent): number {
    return 3 + (event.column * 94) / event.columnCount;
  }

  eventWidth(event: PositionedPlannerEvent): number {
    return 94 / event.columnCount - 2;
  }

  private toDateKey(date: Date): string {
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
  }
}
