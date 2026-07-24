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
  PlannerOverlapGroup,
  durationInMinutes,
  dateKey,
  getWeekDays,
  groupOverlappingEvents,
  toMinutes,
} from '../../models';
import { PlannerEventCard } from '../planner-event-card/planner-event-card';
import { PlannerDayView } from '../planner-day-view/planner-day-view';
import { PlannerOverlapAccordion } from '../planner-overlap-accordion/planner-overlap-accordion';

interface WeekDay {
  date: Date;
  key: string;
  label: string;
  dayNumber: string;
  eventGroups: PlannerOverlapGroup[];
}

@Component({
  selector: 'app-planner-week-view',
  imports: [PlannerEventCard, PlannerDayView, PlannerOverlapAccordion],
  templateUrl: './planner-week-view.html',
  styleUrl: './planner-week-view.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlannerWeekView {
  readonly date = input.required<Date>();
  readonly events = input<PlannerEvent[]>([]);
  readonly eventRemoved = output<number>();
  readonly eventEdited = output<PlannerEvent>();
  readonly mobilePickerOpen = signal(false);
  readonly mobileSelectedKey = signal<string | null>(null);
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
        eventGroups: groupOverlappingEvents(this.events().filter((event) => event.date === key)),
      };
    }),
  );
  readonly mobileSelectedDay = computed(() => {
    const selectedKey = dateKey(this.date());
    return this.weekDays().find((day) => day.key === selectedKey) ?? this.weekDays()[0];
  });
  readonly mobileDayEvents = computed(() =>
    this.mobileSelectedDay()?.eventGroups.flatMap((group) => group.events) ?? [],
  );
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

  eventTop(event: Pick<PlannerEvent, 'startTime'>): number {
    const offsetInMinutes = toMinutes(event.startTime) - DAY_START_HOUR * 60;
    return offsetInMinutes * this.pixelsPerMinute();
  }

  eventHeight(event: Pick<PlannerEvent, 'startTime' | 'endTime'>): number {
    return durationInMinutes(event) * this.pixelsPerMinute();
  }

  overlapGroupHeight(group: PlannerOverlapGroup): number {
    const groupDuration = durationInMinutes(group) * this.pixelsPerMinute();
    return Math.max(groupDuration, group.events.length * 44 + (group.events.length - 1) * 4);
  }

  selectMobileDay(key: string): void {
    this.mobileSelectedKey.set(key);
    this.mobilePickerOpen.set(false);
  }

  private isCompactViewport(): boolean {
    return typeof window !== 'undefined' && window.innerWidth <= 384;
  }
  }
}
