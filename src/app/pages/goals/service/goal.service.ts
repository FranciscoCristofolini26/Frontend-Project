import { Injectable, signal } from '@angular/core';
<<<<<<< Updated upstream
import { Goal, GoalDraft, GoalStatus, WeeklyFocus } from '../models/goal';
import { isFutureWeek, toDateKey, weekIdFor } from '../utils/week.utils';

const GOALS_STORAGE_KEY = 'agenda.weekly-goals';
const WEEKLY_FOCUS_STORAGE_KEY = 'agenda.weekly-focus';

function statusForWeek(weekId: string): GoalStatus {
  return isFutureWeek(weekId) ? 'PLANEJADA' : 'EM_ANDAMENTO';
}

function initialGoals(): Goal[] {
  const currentWeek = weekIdFor(new Date());

  return [
    {
      id: 1,
      weekId: currentWeek,
      title: 'Avançar no Spring Boot',
      expectedResult: 'Completar os capítulos 12–16 do curso.',
      priority: 'ALTA',
      categoryId: 'estudo',
      status: 'EM_ANDAMENTO',
      deferredCount: 0,
      createdAt: toDateKey(new Date()),
      taskLinks: [
        { taskId: 121, title: 'Capítulo 12', completed: true },
        { taskId: 122, title: 'Capítulo 13', completed: true },
        { taskId: 123, title: 'Capítulo 14', completed: true },
        { taskId: 124, title: 'Capítulo 15', completed: false },
        { taskId: 125, title: 'Capítulo 16', completed: false },
=======
import { Goal, GoalDraft, GoalStatus } from '../models/goal';

const GOALS_STORAGE_KEY = 'agenda.goals';
const FOCUS_STORAGE_KEY = 'agenda.weekly-focus';

export interface WeeklyFocus {
  focus: string;
  note: string;
}

function startOfWeek(value: Date): Date {
  const date = new Date(value);
  date.setHours(12, 0, 0, 0);
  const day = date.getDay();
  date.setDate(date.getDate() - (day === 0 ? 6 : day - 1));
  return date;
}

function weekIdFor(value: Date): string {
  const date = startOfWeek(value);
  const yearStart = new Date(date.getFullYear(), 0, 1);
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86_400_000 + yearStart.getDay() + 1) / 7);
  return `${date.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

function dateKey(value = new Date()): string {
  return value.toISOString().slice(0, 10);
}

function initialGoals(): Goal[] {
  const currentWeekId = weekIdFor(new Date());
  return [
    {
      id: 1,
      weekId: currentWeekId,
      title: 'Avançar no Spring Boot',
      expectedResult: 'Completar os capítulos 12–16 do curso.',
      priority: 'ALTA',
      category: 'Estudo',
      status: 'EM_ANDAMENTO',
      deferredCount: 0,
      createdAt: dateKey(),
      tasks: [
        { id: 101, title: 'Capítulo 12', completed: true },
        { id: 102, title: 'Capítulo 13', completed: true },
        { id: 103, title: 'Capítulo 14', completed: true },
        { id: 104, title: 'Capítulo 15', completed: false },
        { id: 105, title: 'Capítulo 16', completed: false },
>>>>>>> Stashed changes
      ],
    },
    {
      id: 2,
<<<<<<< Updated upstream
      weekId: currentWeek,
      title: 'Correr quatro vezes',
      expectedResult: 'Fazer quatro corridas na semana, priorizando constância.',
      priority: 'MEDIA',
      categoryId: 'saude',
      status: 'EM_ANDAMENTO',
      deferredCount: 0,
      createdAt: toDateKey(new Date()),
      taskLinks: [],
      habitTarget: { habitId: 2, targetCount: 4 },
    },
    {
      id: 3,
      weekId: currentWeek,
      title: 'Alinhar proposta do novo projeto',
      expectedResult: 'Sair da reunião com escopo e próximos responsáveis definidos.',
      priority: 'BAIXA',
      categoryId: 'projetos',
      status: 'PLANEJADA',
      deferredCount: 0,
      createdAt: toDateKey(new Date()),
      taskLinks: [],
    },
    {
      id: 4,
      weekId: currentWeek,
      title: 'Preparar apresentação da equipe',
      expectedResult: 'Deixar a apresentação revisada e pronta para sexta-feira.',
      priority: 'MEDIA',
      categoryId: 'trabalho',
      status: 'CONCLUIDA',
      deferredCount: 0,
      createdAt: toDateKey(new Date()),
      completedAt: toDateKey(new Date()),
      taskLinks: [
        { taskId: 231, title: 'Reunir indicadores', completed: true },
        { taskId: 232, title: 'Revisar slides', completed: true },
      ],
=======
      weekId: currentWeekId,
      title: 'Preparar a apresentação do projeto',
      expectedResult: 'Ter roteiro, demonstração e slides revisados para a reunião.',
      priority: 'ALTA',
      category: 'Trabalho',
      status: 'EM_ANDAMENTO',
      deferredCount: 0,
      createdAt: dateKey(),
      tasks: [
        { id: 201, title: 'Definir roteiro', completed: true },
        { id: 202, title: 'Revisar demonstração', completed: true },
        { id: 203, title: 'Finalizar slides', completed: false },
      ],
    },
    {
      id: 3,
      weekId: currentWeekId,
      title: 'Correr quatro vezes',
      expectedResult: 'Completar quatro corridas durante a semana.',
      priority: 'MEDIA',
      category: 'Saúde',
      status: 'EM_ANDAMENTO',
      deferredCount: 0,
      createdAt: dateKey(),
      tasks: [],
      habitTarget: { habitId: 2, habitName: 'Exercício físico', completedCount: 3, targetCount: 4 },
    },
    {
      id: 4,
      weekId: currentWeekId,
      title: 'Organizar documentos pessoais',
      expectedResult: 'Deixar os documentos importantes reunidos em uma única pasta.',
      priority: 'BAIXA',
      category: 'Pessoal',
      status: 'PLANEJADA',
      deferredCount: 0,
      createdAt: dateKey(),
      tasks: [],
>>>>>>> Stashed changes
    },
  ];
}

<<<<<<< Updated upstream
@Injectable({ providedIn: 'root' })
export class GoalService {
  readonly goals = signal<Goal[]>(this.readGoals());
  readonly weeklyFocus = signal<Record<string, WeeklyFocus>>(this.readWeeklyFocus());
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  create(weekId: string, draft: GoalDraft): void {
    const nextId = Math.max(0, ...this.goals().map((goal) => goal.id)) + 1;
    const goal: Goal = {
      id: nextId,
      weekId,
      title: draft.title.trim(),
      expectedResult: draft.expectedResult.trim(),
      priority: draft.priority,
      categoryId: draft.categoryId,
      status: statusForWeek(weekId),
      deferredCount: 0,
      createdAt: toDateKey(new Date()),
      taskLinks: [],
      habitTarget:
        draft.habitId && draft.habitTargetCount > 0
          ? { habitId: draft.habitId, targetCount: draft.habitTargetCount }
          : undefined,
    };

    this.setGoals([...this.goals(), goal]);
=======
function initialFocus(): Record<string, WeeklyFocus> {
  return {
    [weekIdFor(new Date())]: {
      focus: 'Entregar uma versão segura do projeto sem perder o ritmo de estudo.',
      note: 'Escolha o essencial antes de preencher a semana.',
    },
  };
}

@Injectable({ providedIn: 'root' })
export class GoalService {
  readonly goals = signal<Goal[]>(this.readGoals());
  readonly focuses = signal<Record<string, WeeklyFocus>>(this.readFocuses());

  create(draft: GoalDraft, weekId: string, weekStart: Date): void {
    const id = Math.max(0, ...this.goals().map((goal) => goal.id)) + 1;
    const status: GoalStatus = weekStart > startOfWeek(new Date()) ? 'PLANEJADA' : 'EM_ANDAMENTO';
    this.setGoals([
      ...this.goals(),
      {
        id,
        weekId,
        title: draft.title.trim(),
        expectedResult: draft.expectedResult.trim(),
        priority: draft.priority,
        category: draft.category,
        status,
        deferredCount: 0,
        createdAt: dateKey(),
        tasks: [],
      },
    ]);
>>>>>>> Stashed changes
  }

  update(id: number, draft: GoalDraft): void {
    this.setGoals(
      this.goals().map((goal) =>
        goal.id === id
          ? {
              ...goal,
              title: draft.title.trim(),
              expectedResult: draft.expectedResult.trim(),
              priority: draft.priority,
<<<<<<< Updated upstream
              categoryId: draft.categoryId,
              habitTarget:
                draft.habitId && draft.habitTargetCount > 0
                  ? { habitId: draft.habitId, targetCount: draft.habitTargetCount }
                  : undefined,
=======
              category: draft.category,
>>>>>>> Stashed changes
            }
          : goal,
      ),
    );
  }

  complete(id: number): void {
    this.setGoals(
      this.goals().map((goal) =>
<<<<<<< Updated upstream
        goal.id === id
          ? { ...goal, status: 'CONCLUIDA', completedAt: toDateKey(new Date()) }
=======
        goal.id === id && goal.status !== 'CONCLUIDA'
          ? { ...goal, status: 'CONCLUIDA', completedAt: dateKey() }
>>>>>>> Stashed changes
          : goal,
      ),
    );
  }

<<<<<<< Updated upstream
  defer(id: number, nextWeekId: string): void {
=======
  defer(id: number, nextWeekId: string, nextWeekStart: Date): void {
    const status: GoalStatus = nextWeekStart > startOfWeek(new Date()) ? 'PLANEJADA' : 'EM_ANDAMENTO';
>>>>>>> Stashed changes
    this.setGoals(
      this.goals().map((goal) =>
        goal.id === id
          ? {
              ...goal,
              weekId: nextWeekId,
<<<<<<< Updated upstream
              status: statusForWeek(nextWeekId),
=======
              status,
>>>>>>> Stashed changes
              deferredCount: goal.deferredCount + 1,
              completedAt: undefined,
            }
          : goal,
      ),
    );
  }

  saveFocus(weekId: string, focus: WeeklyFocus): void {
<<<<<<< Updated upstream
    const weeklyFocus = { ...this.weeklyFocus(), [weekId]: focus };
    this.weeklyFocus.set(weeklyFocus);

    try {
      localStorage.setItem(WEEKLY_FOCUS_STORAGE_KEY, JSON.stringify(weeklyFocus));
    } catch {
      // A página segue utilizável quando o armazenamento está indisponível.
=======
    const nextFocuses = { ...this.focuses(), [weekId]: focus };
    this.focuses.set(nextFocuses);
    try {
      localStorage.setItem(FOCUS_STORAGE_KEY, JSON.stringify(nextFocuses));
    } catch {
      // O foco continua disponível durante a sessão se o armazenamento falhar.
>>>>>>> Stashed changes
    }
  }

  private setGoals(goals: Goal[]): void {
    this.goals.set(goals);
<<<<<<< Updated upstream
    this.saveGoals(goals);
=======
    try {
      localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
    } catch {
      // A página segue utilizável quando o armazenamento local não está disponível.
    }
>>>>>>> Stashed changes
  }

  private readGoals(): Goal[] {
    try {
<<<<<<< Updated upstream
      const storedGoals = localStorage.getItem(GOALS_STORAGE_KEY);
      if (!storedGoals) return initialGoals();

      const parsedGoals: unknown = JSON.parse(storedGoals);
      return Array.isArray(parsedGoals) ? (parsedGoals as Goal[]) : initialGoals();
=======
      const storedGoals: unknown = JSON.parse(localStorage.getItem(GOALS_STORAGE_KEY) ?? 'null');
      return Array.isArray(storedGoals) ? (storedGoals as Goal[]) : initialGoals();
>>>>>>> Stashed changes
    } catch {
      return initialGoals();
    }
  }

<<<<<<< Updated upstream
  private saveGoals(goals: Goal[]): void {
    try {
      localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
    } catch {
      // A interface continua funcional quando o armazenamento está indisponível.
    }
  }

  private readWeeklyFocus(): Record<string, WeeklyFocus> {
    try {
      const storedFocus = localStorage.getItem(WEEKLY_FOCUS_STORAGE_KEY);
      if (!storedFocus) {
        return {
          [weekIdFor(new Date())]: {
            focus: 'Entregar o essencial com clareza.',
            message: 'Menos prioridades, mais avanço no que realmente importa.',
          },
        };
      }

      const parsedFocus: unknown = JSON.parse(storedFocus);
      return parsedFocus && typeof parsedFocus === 'object'
        ? (parsedFocus as Record<string, WeeklyFocus>)
        : {};
    } catch {
      return {};
=======
  private readFocuses(): Record<string, WeeklyFocus> {
    try {
      const storedFocuses: unknown = JSON.parse(localStorage.getItem(FOCUS_STORAGE_KEY) ?? 'null');
      return storedFocuses && typeof storedFocuses === 'object'
        ? (storedFocuses as Record<string, WeeklyFocus>)
        : initialFocus();
    } catch {
      return initialFocus();
>>>>>>> Stashed changes
    }
  }
}
