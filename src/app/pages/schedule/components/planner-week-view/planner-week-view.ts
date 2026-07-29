import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import {
  DAY_END_HOUR,
  DAY_START_HOUR,
  PlannerEvent,
  PositionedPlannerEvent,
  durationInMinutes,
  dateKey,
  getWeekDays,
  layoutEvents,
  toMinutes,
} from '../../models';
import { PlannerEventCard } from '../planner-event-card/planner-event-card';
import { PlannerDayView } from '../planner-day-view/planner-day-view';

interface WeekDay {
  date: Date;
  key: string;
  label: string;
  dayNumber: string;
  events: PositionedPlannerEvent[];
}

@Component({
  selector: 'app-planner-week-view',
  imports: [PlannerEventCard, PlannerDayView],
  templateUrl: './planner-week-view.html',
  styleUrl: './planner-week-view.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlannerWeekView {
  readonly date = input.required<Date>();
  readonly events = input<PlannerEvent[]>([]);
  readonly eventRemoved = output<number>();
  readonly eventEdited = output<PlannerEvent>();
  readonly compactTimeline = signal(this.isCompactViewport());
  readonly hours = Array.from(
    { length: DAY_END_HOUR - DAY_START_HOUR + 1 },
    (_, index) => DAY_START_HOUR + index,
  );
  readonly weekDays = computed<WeekDay[]>(() =>
    getWeekDays(this.date()).map((date) => {
      const key = dateKey(date);
      return {
        date,
        key,
        label: new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(date).replace('.', ''),
        dayNumber: `${date.getDate()}`,
        events: layoutEvents(this.events().filter((event) => event.date === key)),
      };
    }),
  );
  readonly mobileSelectedDay = computed(() => {
    const selectedKey = dateKey(this.date());
    return this.weekDays().find((day) => day.key === selectedKey) ?? this.weekDays()[0];
  });
  // The weekly cards need room for a title and its time on separate lines.
  readonly pixelsPerMinute = computed(() => (this.compactTimeline() ? 1.35 : 2.25));
  readonly halfHourHeight = computed(() => this.pixelsPerMinute() * 30);
  readonly hourHeight = computed(() => this.pixelsPerMinute() * 60);
  readonly canvasHeight = computed(() => this.hourHeight() * 13);
  readonly eventMinHeight = computed(() => (this.compactTimeline() ? 38 : 54));

  @HostListener('window:resize')
  updateTimelineScale(): void {
    this.compactTimeline.set(this.isCompactViewport());
  }

  eventTop(event: PositionedPlannerEvent): number {
    const offsetInMinutes = toMinutes(event.startTime) - DAY_START_HOUR * 60;
    const stackOffset = event.columnCount > 1 ? event.column * 8 : 0;
    return offsetInMinutes * this.pixelsPerMinute() + stackOffset;
  }

  eventHeight(event: PositionedPlannerEvent): number {
    return Math.max(durationInMinutes(event) * this.pixelsPerMinute() - 6, this.eventMinHeight());
  }

  eventLeft(event: PositionedPlannerEvent): number {
    return event.columnCount > 1 ? 4 : 3;
  }

  eventWidth(event: PositionedPlannerEvent): number {
    return event.columnCount > 1 ? 92 : 94;
  }

  private isCompactViewport(): boolean {
    return typeof window !== 'undefined' && window.innerWidth <= 384;
  }
}
