import { ChangeDetectionStrategy, Component, computed, effect, input, signal } from '@angular/core';
import { PlannerViewMode } from '../header/header';
import {
  DAY_END_HOUR,
  DAY_START_HOUR,
  PlannerEvent,
  PlannerEventDraft,
  PlannerHabit,
  PlannerTask,
  addDays,
  dateKey,
  durationInMinutes,
  startOfDay,
} from '../../models';
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

function createPlannerEvents(today: Date): PlannerEvent[] {
  return [
    {
      id: 1,
      date: dateKey(today),
      title: 'Daily com produto',
      startTime: '09:00',
      endTime: '09:30',
      category: 'work',
      kind: 'event',
    },
    {
      id: 2,
      date: dateKey(today),
      title: 'Revisar proposta da Acme',
      startTime: '10:00',
      endTime: '11:00',
      category: 'work',
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
      category: 'event',
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
      category: 'event',
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
  readonly selectedDate = input<Date>(startOfDay(new Date()));
  readonly viewMode = input<PlannerViewMode>('daily');
  readonly newEventRequest = input(0);
  readonly eventFormOpen = signal(false);

  readonly events = signal<PlannerEvent[]>(createPlannerEvents(startOfDay(new Date())));
  readonly unscheduledTasks = signal<PlannerTask[]>([
    { id: 1, title: 'Organizar materiais da reunião', category: 'work', project: 'Produto' },
    { id: 2, title: 'Ler capítulo 4 do curso', category: 'study', project: 'Angular' },
    { id: 3, title: 'Responder e-mails pendentes', category: 'personal' },
  ]);
  readonly habits = signal<PlannerHabit[]>([
    { id: 1, title: 'Beber água', completed: true },
    { id: 2, title: 'Exercício físico', completed: false },
    { id: 3, title: 'Ler por 20 minutos', completed: false },
    { id: 4, title: 'Planejar o dia seguinte', completed: false },
  ]);

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
        this.eventFormOpen.set(true);
      }
    });
  }

  toggleHabit(id: number): void {
    this.habits.update((habits) =>
      habits.map((habit) => (habit.id === id ? { ...habit, completed: !habit.completed } : habit)),
    );
  }

  createEvent(draft: PlannerEventDraft): void {
    const nextId = Math.max(0, ...this.events().map((event) => event.id)) + 1;
    this.events.update((events) => [
      ...events,
      {
        ...draft,
        id: nextId,
        date: dateKey(this.selectedDate()),
        kind: 'event',
      },
    ]);
    this.eventFormOpen.set(false);
  }

  removeEvent(id: number): void {
    this.events.update((events) => events.filter((event) => event.id !== id));
  }
}
