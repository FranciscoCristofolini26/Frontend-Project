import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnInit,
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
import { CalendarEvent, CalendarEventDraft } from '../../../calendar/models';
import { CalendarEventsService } from '../../../calendar/service/calendar-events.service';

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}min`;
  }

  return `${hours}h${remainingMinutes > 0 ? ` ${remainingMinutes}min` : ''}`;
}

<<<<<<< Updated upstream
=======
function createPlannerEvents(today: Date): PlannerEvent[] {
  return [
    {
      id: 1,
      date: dateKey(today),
      title: 'Daily com produto',
      startTime: '09:00',
      endTime: '09:30',
      category: 'event',
      kind: 'event',
    },
    {
      id: 2,
      date: dateKey(today),
      title: 'Revisar proposta da Acme',
      startTime: '10:00',
      endTime: '11:00',
      category: 'event',
      kind: 'task',
    },
    {
      id: 3,
      date: dateKey(today),
      title: 'Estudar Angular',
      startTime: '14:00',
      endTime: '15:30',
      category: 'study',
      kind: 'task',
    },
    {
      id: 4,
      date: dateKey(today),
      title: 'Consulta médica',
      startTime: '14:30',
      endTime: '15:15',
      category: 'personal',
      kind: 'event',
    },
    {
      id: 5,
      date: dateKey(today),
      title: 'Revisão de sprint',
      startTime: '16:30',
      endTime: '17:15',
      category: 'work',
      kind: 'event',
    },
    {
      id: 6,
      date: dateKey(addDays(today, -2)),
      title: 'Planejamento de conteúdo',
      startTime: '10:00',
      endTime: '11:00',
      category: 'work',
      kind: 'event',
    },
    {
      id: 7,
      date: dateKey(addDays(today, -1)),
      title: 'Sessão de leitura',
      startTime: '15:00',
      endTime: '16:00',
      category: 'study',
      kind: 'task',
    },
    {
      id: 8,
      date: dateKey(addDays(today, 1)),
      title: 'Café com Ana',
      startTime: '12:00',
      endTime: '13:00',
      category: 'personal',
      kind: 'event',
    },
    {
      id: 9,
      date: dateKey(addDays(today, 2)),
      title: 'Workshop de design',
      startTime: '09:30',
      endTime: '11:30',
      category: 'work',
      kind: 'event',
    },
    {
      id: 10,
      date: dateKey(addDays(today, 3)),
      title: 'Planejar a próxima semana',
      startTime: '16:00',
      endTime: '17:00',
      category: 'work',
      kind: 'task',
    },
  ];
}

>>>>>>> Stashed changes
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
export class Planning implements OnInit {
  private readonly habitService = inject(HabitService);
<<<<<<< Updated upstream
  private readonly plannerService = inject(PlannerService);
=======
  private readonly calendarEventsService = inject(CalendarEventsService);
>>>>>>> Stashed changes

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

<<<<<<< Updated upstream
  readonly events = this.plannerService.events;
  readonly unscheduledTasks = this.plannerService.unscheduledTasks;
=======
  readonly events = signal<PlannerEvent[]>([]);
  readonly unscheduledTasks = signal<PlannerTask[]>([
    { id: 1, title: 'Organizar materiais da reunião', category: 'work', project: 'Produto' },
    { id: 2, title: 'Ler capítulo 4 do curso', category: 'study', project: 'Angular' },
    { id: 3, title: 'Responder e-mails pendentes', category: 'personal' },
  ]);
>>>>>>> Stashed changes
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

  ngOnInit(): void {
    this.calendarEventsService
      .getEvents()
      .subscribe((events) => this.events.set(events.map((event) => this.toPlannerEvent(event))));
  }

  toggleHabit(id: number): void {
    this.habitService.toggleCompletion(id, dateKey(this.selectedDate()));
  }

  createEvent(draft: PlannerEventDraft): void {
    if (this.wouldExceedConcurrentLimit(draft)) {
      this.aiOrganizationPrompt.set(true);
      return;
    }

<<<<<<< Updated upstream
    this.plannerService.createEvent(draft, dateKey(this.selectedDate()));
    this.closeEventForm();
  }

  removeEvent(id: number): void {
    this.plannerService.removeEvent(id);
=======
    this.calendarEventsService.createEvent(this.toCalendarEventDraft(draft)).subscribe((event) => {
      this.events.update((events) => [...events, this.toPlannerEvent(event)]);
      this.closeEventForm();
    });
  }

  removeEvent(id: number): void {
    this.calendarEventsService.deleteEvent(id).subscribe(() => {
      this.events.update((events) => events.filter((event) => event.id !== id));
    });
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
    this.plannerService.updateEvent({ ...event, ...draft });
    this.closeEventForm();
=======
    this.calendarEventsService
      .updateEvent(event.id, this.toCalendarEventDraft(draft))
      .subscribe((updatedEvent) => {
        const updatedPlannerEvent = this.toPlannerEvent(updatedEvent);
        this.events.update((events) =>
          events.map((item) => (item.id === event.id ? updatedPlannerEvent : item)),
        );
        this.closeEventForm();
      });
>>>>>>> Stashed changes
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
        description: '',
        startTime: slotTime,
        endTime,
        category: task.category,
      },
      dateKey(this.selectedDate()),
      'task',
    );
    this.plannerService.removeUnscheduledTask(task.id);
  }

  private toCalendarEventDraft(draft: PlannerEventDraft): CalendarEventDraft {
    return {
      title: draft.title,
      date: draft.date,
      startTime: draft.startTime,
      endTime: draft.endTime,
      description: draft.description,
      location: draft.location,
      source: draft.source ?? 'internal',
      category: draft.category,
    };
  }

  private toPlannerEvent(event: CalendarEvent): PlannerEvent {
    return {
      id: Number(event.id),
      title: event.title,
      date: event.date,
      description: event.description,
      location: event.location,
      source: event.source,
      startTime: event.startTime,
      endTime: event.endTime,
      category: event.category,
      kind: 'event',
    };
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
