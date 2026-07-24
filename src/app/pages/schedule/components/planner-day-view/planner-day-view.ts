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
  readonly eventEdited = output<PlannerEvent>();
  readonly compactTimeline = signal(this.isCompactViewport());
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
  readonly pixelsPerMinute = computed(() => (this.compactTimeline() ? 1.35 : 2));
  readonly halfHourHeight = computed(() => this.pixelsPerMinute() * 30);
  readonly hourHeight = computed(() => this.pixelsPerMinute() * 60);
  readonly canvasHeight = computed(() => this.hourHeight() * 13);
  readonly eventMinHeight = computed(() => (this.compactTimeline() ? 38 : 44));

  @HostListener('window:resize')
  updateTimelineScale(): void {
    this.compactTimeline.set(this.isCompactViewport());
  }

  eventTop(event: PositionedPlannerEvent): number {
    const offsetInMinutes = toMinutes(event.startTime) - DAY_START_HOUR * 60;
    return offsetInMinutes * this.pixelsPerMinute();
  }

  eventHeight(event: PositionedPlannerEvent): number {
    return Math.max(durationInMinutes(event) * this.pixelsPerMinute() - 6, this.eventMinHeight());
  }

  eventLeft(event: PositionedPlannerEvent): number {
    return (event.column * 100) / event.columnCount;
  }

  eventWidth(event: PositionedPlannerEvent): number {
    return 100 / event.columnCount;
  }

  private isCompactViewport(): boolean {
    return typeof window !== 'undefined' && window.innerWidth <= 384;
  }
}
