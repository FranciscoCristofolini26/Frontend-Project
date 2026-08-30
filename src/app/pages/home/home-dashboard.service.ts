import { Injectable, inject, signal } from '@angular/core';
import { catchError, forkJoin, of } from 'rxjs';
import { ApiClient } from '../../core/data-access/api-client.service';
import { CalendarEvent } from '../calendar/models';
import { Goal } from '../goals/models/goal';
import { weekIdFor } from '../goals/utils/week.utils';
import { Habit } from '../habits/models/habit';
import { calculateHabitSummary } from '../habits/utils/habit-metrics';
import { PlannerEvent, Task, dateKey, durationInMinutes, toMinutes } from '../schedule/models';

export type HomeTimeSegmentStatus = 'busy' | 'attention' | 'free' | 'unknown';

interface HomeBackendData {
  tasks: Task[] | null;
  plannerEvents: PlannerEvent[] | null;
  habits: Habit[] | null;
  goals: Goal[] | null;
  calendarEvents: CalendarEvent[] | null;
}

export interface HomeDashboardData {
  appName: string;
  pageName: string;
  profile: {
    initials: string;
    name: string | null;
  };
  welcome: {
    eyebrow: string;
    title: string;
    description: string;
  };
  day: {
    weekday: string;
    number: string;
    month: string;
    weatherIcon: string;
    temperature: string | null;
    city: string | null;
    weatherCondition: string | null;
    greeting: string | null;
  };
  availableTime: {
    label: string;
    value: string | null;
    description: string | null;
    segments: { id: number; status: HomeTimeSegmentStatus; label: string }[];
  };
  focus: {
    label: string;
    title: string | null;
    description: string | null;
    progressLabel: string;
    progress: number | null;
    actionLabel: string;
  };
  weeklyGoal: {
    label: string;
    title: string | null;
    progress: number | null;
    status: string | null;
  };
  agenda: {
    title: string;
    countLabel: string | null;
    events: { id: string; time: string; title: string; category: string; tone: string }[];
  };
  suggestions: {
    title: string;
    items: { id: number; message: string; primaryAction: string; dismissAction: string }[];
    emptyLabel: string;
  };
  habits: {
    title: string;
    todayLabel: string;
    emptyLabel: string;
    items: { id: number; icon: string; name: string; value: string; progress: number }[];
  };
  daySummary: {
    title: string;
    expandLabel: string;
    metrics: { id: number; icon: string; value: string | null; label: string }[];
  };
  footer: {
    tagline: string;
    syncStatus: string;
  };
}

function currentDayData(): HomeDashboardData['day'] {
  const today = new Date();
  const weekday = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(today);
  const month = new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(today).replace('.', '');

  return {
    weekday: `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}`,
    number: String(today.getDate()).padStart(2, '0'),
    month: `${month.charAt(0).toUpperCase()}${month.slice(1)}`,
    weatherIcon: 'cloud_off',
    temperature: null,
    city: null,
    weatherCondition: null,
    greeting: null,
  };
}

function createUnknownSegments(): HomeDashboardData['availableTime']['segments'] {
  return Array.from({ length: 7 }, (_, index) => ({
    id: index + 1,
    status: 'unknown' as const,
    label: 'Null',
  }));
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  if (hours === 0) return `${remainder}min hoje`;
  return `${hours}h${remainder ? ` ${remainder}min` : ''} hoje`;
}

function timeSegments(events: PlannerEvent[], today: Date): HomeDashboardData['availableTime']['segments'] {
  const startHour = 8;
  const hoursPerSegment = 2;
  const segmentsCount = 7;
  const todayKey = dateKey(today);

  return Array.from({ length: segmentsCount }, (_, index) => {
    const start = (startHour + index * hoursPerSegment) * 60;
    const end = start + hoursPerSegment * 60;
    const overlappingEvents = events.filter(
      (event) =>
        event.date === todayKey && toMinutes(event.startTime) < end && toMinutes(event.endTime) > start,
    );
    const status: HomeTimeSegmentStatus =
      overlappingEvents.length > 1 ? 'attention' : overlappingEvents.length === 1 ? 'busy' : 'free';

    return {
      id: index + 1,
      status,
      label: `${String(start / 60).padStart(2, '0')}h a ${String(end / 60).padStart(2, '0')}h`,
    };
  });
}

function availableTime(events: PlannerEvent[] | null, today: Date): HomeDashboardData['availableTime'] {
  if (events === null) {
    return {
      label: 'TEMPO DISPONÍVEL',
      value: null,
      description: null,
      segments: createUnknownSegments(),
    };
  }

  const busyMinutes = events
    .filter((event) => event.date === dateKey(today))
    .reduce((total, event) => total + durationInMinutes(event), 0);
  const dayMinutes = 14 * 60;

  return {
    label: 'TEMPO DISPONÍVEL',
    value: formatDuration(Math.max(0, dayMinutes - busyMinutes)),
    description: null,
    segments: timeSegments(events, today),
  };
}

function currentFocus(tasks: Task[] | null): HomeDashboardData['focus'] {
  const task = tasks?.find((item) => !item.completed);

  return {
    label: 'FOCO DE HOJE',
    title: task?.title ?? null,
    description: task?.notes ?? null,
    progressLabel: 'Progresso',
    progress: task ? 0 : null,
    actionLabel: 'Abrir tarefas',
  };
}

function goalProgress(goal: Goal): number | null {
  if (goal.taskLinks.length === 0) return null;

  const completed = goal.taskLinks.filter((task) => task.completed).length;
  return Math.round((completed / goal.taskLinks.length) * 100);
}

function goalStatus(goal: Goal): string {
  if (goal.status === 'CONCLUIDA') return 'Concluída';
  if (goal.status === 'EM_ANDAMENTO') return 'Em andamento';
  return 'Planejada';
}

function weeklyGoal(goals: Goal[] | null, today: Date): HomeDashboardData['weeklyGoal'] {
  const goalsForCurrentWeek = goals?.filter((item) => item.weekId === weekIdFor(today));
  const goal =
    goalsForCurrentWeek?.find((item) => item.status !== 'CONCLUIDA') ?? goalsForCurrentWeek?.[0];

  return {
    label: 'META DA SEMANA',
    title: goal?.title ?? null,
    progress: goal ? goalProgress(goal) : null,
    status: goal ? goalStatus(goal) : null,
  };
}

function eventTone(category: string): string {
  if (category === 'personal') return 'personal';
  if (category === 'health' || category === 'habit') return 'wellbeing';
  return 'work';
}

function agenda(
  calendarEvents: CalendarEvent[] | null,
  plannerEvents: PlannerEvent[] | null,
  today: Date,
): HomeDashboardData['agenda'] {
  if (calendarEvents === null && plannerEvents === null) {
    return { title: 'Agenda de hoje', countLabel: null, events: [] };
  }

  const todayKey = dateKey(today);
  const items = [
    ...(calendarEvents ?? [])
      .filter((event) => event.date === todayKey)
      .map((event) => ({
        id: `calendar-${event.id}`,
        time: event.startTime,
        title: event.title,
        category: event.category,
        tone: eventTone(event.category),
      })),
    ...(plannerEvents ?? [])
      .filter((event) => event.date === todayKey)
      .map((event) => ({
        id: `planner-${event.id}`,
        time: event.startTime,
        title: event.title,
        category: event.category,
        tone: eventTone(event.category),
      })),
  ].sort((first, second) => first.time.localeCompare(second.time));

  return {
    title: 'Agenda de hoje',
    countLabel: `${items.length} ${items.length === 1 ? 'evento' : 'eventos'}`,
    events: items,
  };
}

function habitItems(habits: Habit[] | null, today: Date): HomeDashboardData['habits']['items'] {
  if (habits === null) return [];

  const todayKey = dateKey(today);
  return habits
    .filter((habit) => habit.status === 'active')
    .map((habit) => {
      const completed = habit.completedDates.includes(todayKey);
      return {
        id: habit.id,
        icon: habit.icon,
        name: habit.name,
        value: completed ? '1/1' : '0/1',
        progress: completed ? 100 : 0,
      };
    });
}

function summary(tasks: Task[] | null, habits: Habit[] | null): HomeDashboardData['daySummary']['metrics'] {
  const completed = tasks?.filter((task) => task.completed).length;
  const habitSummary = habits === null ? null : calculateHabitSummary(habits);

  return [
    {
      id: 1,
      icon: 'task_alt',
      value: tasks === null ? null : `${completed}/${tasks.length}`,
      label: 'tarefas concluídas',
    },
    { id: 2, icon: 'psychology', value: null, label: 'foco profundo' },
    {
      id: 3,
      icon: 'local_fire_department',
      value: habitSummary === null ? null : String(habitSummary.highestCurrentStreak),
      label: 'dias de sequência',
    },
    { id: 4, icon: 'sentiment_satisfied', value: null, label: 'humor do dia' },
  ];
}

function backendStatus(data: HomeBackendData): string {
  const sources = Object.values(data);
  const connected = sources.filter((source) => source !== null).length;
  const total = sources.length;

  return connected === 0
    ? 'Nenhuma fonte do backend conectada'
    : `${connected} de ${total} fontes do backend conectadas`;
}

function createDashboardData(data: HomeBackendData): HomeDashboardData {
  const today = new Date();

  return {
    appName: 'Sereno',
    pageName: 'Início',
    profile: { initials: '—', name: null },
    welcome: {
      eyebrow: 'ESPAÇO PESSOAL',
      title: 'Um dia de cada vez.',
      description: 'Uma visão calma do que importa agora, sem perder de vista o seu ritmo.',
    },
    day: currentDayData(),
    availableTime: availableTime(data.plannerEvents, today),
    focus: currentFocus(data.tasks),
    weeklyGoal: weeklyGoal(data.goals, today),
    agenda: agenda(data.calendarEvents, data.plannerEvents, today),
    suggestions: { title: 'Sugestões inteligentes', items: [], emptyLabel: 'Null' },
    habits: {
      title: 'Hábitos',
      todayLabel: 'Hoje',
      emptyLabel: data.habits === null ? 'Null' : 'Nenhum hábito ativo',
      items: habitItems(data.habits, today),
    },
    daySummary: {
      title: 'Resumo do dia',
      expandLabel: 'Ver resumo completo',
      metrics: summary(data.tasks, data.habits),
    },
    footer: {
      tagline: 'Espaço pessoal inteligente',
      syncStatus: backendStatus(data),
    },
  };
}

const INITIAL_BACKEND_DATA: HomeBackendData = {
  tasks: null,
  plannerEvents: null,
  habits: null,
  goals: null,
  calendarEvents: null,
};

@Injectable({ providedIn: 'root' })
export class HomeDashboardService {
  private readonly api = inject(ApiClient);

  readonly dashboard = signal<HomeDashboardData>(createDashboardData(INITIAL_BACKEND_DATA));

  constructor() {
    forkJoin({
      tasks: this.requestList<Task>('tasks'),
      plannerEvents: this.requestList<PlannerEvent>('planner/events'),
      habits: this.requestList<Habit>('habits'),
      goals: this.requestList<Goal>('goals'),
      calendarEvents: this.requestList<CalendarEvent>('calendar-events'),
    }).subscribe((data) => this.dashboard.set(createDashboardData(data)));
  }

  dismissSuggestion(id: number): void {
    this.dashboard.update((dashboard) => ({
      ...dashboard,
      suggestions: {
        ...dashboard.suggestions,
        items: dashboard.suggestions.items.filter((item) => item.id !== id),
      },
    }));
  }

  private requestList<T>(resource: string) {
    return this.api.getAll<T>(resource).pipe(catchError(() => of<T[] | null>(null)));
  }
}
