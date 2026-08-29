import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { PlannerViewMode } from '../header/header';
import {
  DAY_END_HOUR,
  DAY_START_HOUR,
  MAX_CONCURRENT_EVENTS,
  PlannerEvent,
  PlannerEventDraft,
  PlannerHabit,
  PlannerTask,
  dateKey,
  durationInMinutes,
  startOfDay,
} from '../../models';
import { HabitService } from '../../../habits/service/habit.service';
import { PlannerService } from '../../service/planner.service';
import { PlannerDayView } from '../planner-day-view/planner-day-view';
import { PlannerSidebar } from '../planner-sidebar/planner-sidebar';
import { PlannerUnscheduledTasks } from '../planner-unscheduled-tasks/planner-unscheduled-tasks';
import { PlannerWeekView } from '../planner-week-view/planner-week-view';
import { PlannerEventForm } from '../planner-event-form/planner-event-form';

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}min`;
  }

  return `${hours}h${remainingMinutes > 0 ? ` ${remainingMinutes}min` : ''}`;
}

@Component({
  selector: 'app-planning',
  imports: [
    PlannerDayView,
    PlannerWeekView,
    PlannerSidebar,
    PlannerUnscheduledTasks,
    PlannerEventForm,
  ],
  templateUrl: './planning.html',
  styleUrl: './planning.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Planning {
  private readonly habitService = inject(HabitService);
  private readonly plannerService = inject(PlannerService);

  readonly selectedDate = input<Date>(startOfDay(new Date()));
  readonly viewMode = input<PlannerViewMode>('daily');
  readonly newEventRequest = input(0);
  readonly eventFormOpen = signal(false);
  readonly editingEvent = signal<PlannerEvent | null>(null);
  readonly aiOrganizationPrompt = signal(false);
  readonly isDesktop = signal(this.isDesktopViewport());
  readonly dailyDropListIds = Array.from(
    { length: DAY_END_HOUR - DAY_START_HOUR + 1 },
    (_, index) => `daily-slot-${DAY_START_HOUR + index}`,
  );
  readonly dragAndDropEnabled = computed(() => this.viewMode() === 'daily' && this.isDesktop());

  readonly events = this.plannerService.events;
  readonly unscheduledTasks = this.plannerService.unscheduledTasks;
  readonly habits = computed<PlannerHabit[]>(() => {
    const activeDate = dateKey(this.selectedDate());
    return this.habitService
      .habits()
      .filter((habit) => habit.status === 'active')
      .map((habit) => ({
        id: habit.id,
        title: habit.name,
        completed: habit.completedDates.includes(activeDate),
      }));
  });

  readonly dayEvents = computed(() => {
    const activeDate = dateKey(this.selectedDate());
    return this.events().filter((event) => event.date === activeDate);
  });
  readonly taskCount = computed(
    () =>
      this.unscheduledTasks().length +
      this.dayEvents().filter((event) => event.kind === 'task').length,
  );
  readonly eventCount = computed(
    () => this.dayEvents().filter((event) => event.kind === 'event').length,
  );
  readonly plannedMinutes = computed(() =>
    this.dayEvents().reduce((total, event) => total + durationInMinutes(event), 0),
  );
  readonly plannedHours = computed(() => formatDuration(this.plannedMinutes()));
  readonly freeMinutes = computed(() => {
    const availableMinutes = (DAY_END_HOUR - DAY_START_HOUR) * 60;
    return Math.max(0, availableMinutes - this.plannedMinutes());
  });
  readonly freeTime = computed(() => formatDuration(this.freeMinutes()));
  readonly freeTimePercentage = computed(() => {
    const availableMinutes = (DAY_END_HOUR - DAY_START_HOUR) * 60;
    return Math.round((this.freeMinutes() / availableMinutes) * 100);
  });

  constructor() {
    effect(() => {
      if (this.newEventRequest() > 0) {
        this.editingEvent.set(null);
        this.eventFormOpen.set(true);
      }
    });
  }

  toggleHabit(id: number): void {
    this.habitService.toggleCompletion(id, dateKey(this.selectedDate()));
  }

  createEvent(draft: PlannerEventDraft): void {
    if (this.wouldExceedConcurrentLimit(draft)) {
      this.aiOrganizationPrompt.set(true);
      return;
    }

    this.plannerService.createEvent(draft);
    this.closeEventForm();
  }

  removeEvent(id: number): void {
    this.plannerService.removeEvent(id);
  }

  openEventEditor(event: PlannerEvent): void {
    this.editingEvent.set(event);
    this.eventFormOpen.set(true);
  }

  updateEvent(draft: PlannerEventDraft): void {
    const event = this.editingEvent();
    if (!event) return;

    if (this.wouldExceedConcurrentLimit(draft, event.id)) {
      this.aiOrganizationPrompt.set(true);
      return;
    }

    this.plannerService.updateEvent({ ...event, ...draft });
    this.closeEventForm();
  }

  removeEditingEvent(id: number): void {
    this.removeEvent(id);
    this.closeEventForm();
  }

  closeEventForm(): void {
    this.eventFormOpen.set(false);
    this.editingEvent.set(null);
  }

  @HostListener('window:resize')
  updateDesktopMode(): void {
    this.isDesktop.set(this.isDesktopViewport());
  }

  onTaskDropped(event: CdkDragDrop<unknown, PlannerTask[], PlannerTask>, slotTime: string): void {
    if (!this.dragAndDropEnabled() || event.previousContainer.id !== 'unplanned-tasks') {
      return;
    }

    const task = event.item.data;
    const startHour = Number(slotTime.slice(0, 2));
    const endTime = `${Math.min(startHour + 1, DAY_END_HOUR + 1)
      .toString()
      .padStart(2, '0')}:00`;
    if (
      this.wouldExceedConcurrentLimit({
        date: dateKey(this.selectedDate()),
        startTime: slotTime,
        endTime,
      })
    ) {
      this.aiOrganizationPrompt.set(true);
      return;
    }

    this.plannerService.createEvent(
      {
        title: task.title,
        date: dateKey(this.selectedDate()),
        description: '',
        startTime: slotTime,
        endTime,
        category: task.category,
      },
      'task',
    );
    this.plannerService.removeUnscheduledTask(task.id);
  }

  private isDesktopViewport(): boolean {
    return typeof window !== 'undefined' && window.innerWidth >= 1024;
  }

  private wouldExceedConcurrentLimit(
    candidate: Pick<PlannerEvent, 'date' | 'startTime' | 'endTime'>,
    ignoredEventId?: number,
  ): boolean {
    const candidateStart = this.timeToMinutes(candidate.startTime);
    const candidateEnd = this.timeToMinutes(candidate.endTime);
    const relevantEvents = this.events().filter(
      (event) =>
        event.id !== ignoredEventId &&
        event.date === candidate.date &&
        this.timeToMinutes(event.startTime) < candidateEnd &&
        this.timeToMinutes(event.endTime) > candidateStart,
    );
    const boundaries = [
      candidateStart,
      candidateEnd,
      ...relevantEvents.flatMap((event) => [
        Math.max(candidateStart, this.timeToMinutes(event.startTime)),
        Math.min(candidateEnd, this.timeToMinutes(event.endTime)),
      ]),
    ].sort((first, second) => first - second);

    return boundaries.some((boundary, index) => {
      const nextBoundary = boundaries[index + 1];
      if (nextBoundary === undefined || nextBoundary === boundary) return false;

      const probe = boundary + (nextBoundary - boundary) / 2;
      const simultaneous = relevantEvents.filter(
        (event) =>
          this.timeToMinutes(event.startTime) < probe && this.timeToMinutes(event.endTime) > probe,
      ).length;
      return simultaneous >= MAX_CONCURRENT_EVENTS;
    });
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
}
