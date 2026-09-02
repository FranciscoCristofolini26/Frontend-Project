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
  PLANNER_DAY_SLOTS,
  PlannerEvent,
  PlannerEventDraft,
  PlannerHabit,
  PlannerTask,
  dateKey,
  getPlannerDayAvailability,
  isPlannerTimeSlot,
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
  readonly dailyDropListIds = PLANNER_DAY_SLOTS.map((slot) => `daily-slot-${slot.startTime}`);
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
  readonly dayAvailability = computed(() =>
    getPlannerDayAvailability(dateKey(this.selectedDate()), this.dayEvents()),
  );
  readonly taskCount = computed(
    () =>
      this.unscheduledTasks().length +
      this.dayEvents().filter((event) => event.kind === 'task').length,
  );
  readonly eventCount = computed(
    () => this.dayEvents().filter((event) => event.kind === 'event').length,
  );
  readonly plannedMinutes = computed(() => this.dayAvailability().occupiedBlocks * 60);
  readonly plannedHours = computed(() => formatDuration(this.plannedMinutes()));
  readonly freeMinutes = computed(() => this.dayAvailability().availableBlocks * 60);
  readonly freeTime = computed(() => formatDuration(this.freeMinutes()));
  readonly freeTimePercentage = computed(() =>
    Math.round((this.dayAvailability().availableBlocks / this.dayAvailability().totalBlocks) * 100),
  );

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
    if (!isPlannerTimeSlot(draft) || this.hasOccupiedSlot(draft)) {
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

    if (!isPlannerTimeSlot(draft) || this.hasOccupiedSlot(draft, event.id)) {
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
    const slot = PLANNER_DAY_SLOTS.find((item) => item.startTime === slotTime);
    if (!slot || this.hasOccupiedSlot({ date: dateKey(this.selectedDate()), ...slot })) {
      this.aiOrganizationPrompt.set(true);
      return;
    }

    this.plannerService.createEvent(
      {
        title: task.title,
        date: dateKey(this.selectedDate()),
        description: '',
        startTime: slotTime,
        endTime: slot.endTime,
        category: task.category,
      },
      'task',
    );
    this.plannerService.removeUnscheduledTask(task.id);
  }

  private isDesktopViewport(): boolean {
    return typeof window !== 'undefined' && window.innerWidth >= 1024;
  }

  private hasOccupiedSlot(
    candidate: Pick<PlannerEvent, 'date' | 'startTime' | 'endTime'>,
    ignoredEventId?: number,
  ): boolean {
    if (!isPlannerTimeSlot(candidate)) {
      return true;
    }

    const candidateStart = this.timeToMinutes(candidate.startTime);
    const candidateEnd = this.timeToMinutes(candidate.endTime);
    return this.events().some(
      (event) =>
        event.id !== ignoredEventId &&
        event.date === candidate.date &&
        this.timeToMinutes(event.startTime) < candidateEnd &&
        this.timeToMinutes(event.endTime) > candidateStart,
    );
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
}
