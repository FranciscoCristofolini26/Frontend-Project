import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import {
  DAY_END_HOUR,
  DAY_START_HOUR,
  PIXELS_PER_MINUTE,
  PlannerEvent,
  PositionedPlannerEvent,
  durationInMinutes,
  layoutEvents,
  toMinutes,
} from '../../models';
import { PlannerEventCard } from '../planner-event-card/planner-event-card';

@Component({
  selector: 'app-planner-day-view',
  imports: [PlannerEventCard],
  templateUrl: './planner-day-view.html',
  styleUrl: './planner-day-view.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlannerDayView {
  readonly date = input.required<Date>();
  readonly events = input<PlannerEvent[]>([]);
  readonly eventRemoved = output<number>();
  readonly hours = Array.from(
    { length: DAY_END_HOUR - DAY_START_HOUR + 1 },
    (_, index) => DAY_START_HOUR + index,
  );
  readonly dateLabel = computed(() =>
    new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(this.date()),
  );
  readonly positionedEvents = computed(() => layoutEvents(this.events()));

  eventTop(event: PositionedPlannerEvent): number {
    return (toMinutes(event.startTime) - DAY_START_HOUR * 60) * PIXELS_PER_MINUTE;
  }

  eventHeight(event: PositionedPlannerEvent): number {
    return Math.max(durationInMinutes(event) * PIXELS_PER_MINUTE - 6, 48);
  }

  eventLeft(event: PositionedPlannerEvent): number {
    return 1.5 + (event.column * 97) / event.columnCount;
  }

  eventWidth(event: PositionedPlannerEvent): number {
    return 97 / event.columnCount - 1.5;
  }
}
