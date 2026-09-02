import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import {
  DAY_START_HOUR,
  PLANNER_DAY_SLOTS,
  PLANNER_SLOT_COUNT,
  PlannerEvent,
  PlannerTask,
  PositionedPlannerEvent,
  durationInMinutes,
  layoutEvents,
  toMinutes,
} from '../../models';
import { PlannerEventCard } from '../planner-event-card/planner-event-card';

@Component({
  selector: 'app-planner-day-view',
  imports: [DragDropModule, PlannerEventCard],
  templateUrl: './planner-day-view.html',
  styleUrl: './planner-day-view.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlannerDayView {
  readonly date = input.required<Date>();
  readonly events = input<PlannerEvent[]>([]);
  readonly dragEnabled = input(false);
  readonly eventRemoved = output<number>();
  readonly eventEdited = output<PlannerEvent>();
  readonly taskDropped = output<{
    event: CdkDragDrop<unknown, PlannerTask[], PlannerTask>;
    slotTime: string;
  }>();
  readonly compactTimeline = signal(this.isCompactViewport());
  readonly hours = Array.from(
    { length: PLANNER_SLOT_COUNT },
    (_, index) => DAY_START_HOUR + index,
  );
  readonly slots = PLANNER_DAY_SLOTS;
  readonly dateLabel = computed(() =>
    new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(this.date()),
  );
  readonly positionedEvents = computed(() => layoutEvents(this.events()));
  readonly pixelsPerMinute = computed(() => (this.compactTimeline() ? 1.35 : 2));
  readonly hourHeight = computed(() => this.pixelsPerMinute() * 60);
  readonly canvasHeight = computed(() => this.hourHeight() * PLANNER_SLOT_COUNT);
  readonly eventMinHeight = computed(() => (this.compactTimeline() ? 48 : 50));

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
    return 0.5 + (event.column * 100) / event.columnCount;
  }

  eventWidth(event: PositionedPlannerEvent): number {
    return 100 / event.columnCount - 1;
  }

  dropTask(event: CdkDragDrop<unknown, PlannerTask[], PlannerTask>, slotTime: string): void {
    this.taskDropped.emit({
      event,
      slotTime,
    });
  }

  private isCompactViewport(): boolean {
    return typeof window !== 'undefined' && window.innerWidth <= 384;
  }
}
