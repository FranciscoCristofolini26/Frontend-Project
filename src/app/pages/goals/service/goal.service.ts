import { Injectable, signal } from '@angular/core';
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
      title: 'Avan\u00e7ar no Spring Boot',
      expectedResult: 'Completar os cap\u00edtulos 12\u201316 do curso.',
      priority: 'ALTA',
      categoryId: 'estudo',
      status: 'EM_ANDAMENTO',
      deferredCount: 0,
      createdAt: toDateKey(new Date()),
      taskLinks: [
        { taskId: 121, title: 'Cap\u00edtulo 12', completed: true },
        { taskId: 122, title: 'Cap\u00edtulo 13', completed: true },
        { taskId: 123, title: 'Cap\u00edtulo 14', completed: true },
        { taskId: 124, title: 'Cap\u00edtulo 15', completed: false },
        { taskId: 125, title: 'Cap\u00edtulo 16', completed: false },
      ],
    },
    {
      id: 2,
      weekId: currentWeek,
      title: 'Correr quatro vezes',
      expectedResult: 'Fazer quatro corridas na semana, priorizando const\u00e2ncia.',
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
      expectedResult: 'Sair da reuni\u00e3o com escopo e pr\u00f3ximos respons\u00e1veis definidos.',
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
      title: 'Preparar apresenta\u00e7\u00e3o da equipe',
      expectedResult: 'Deixar a apresenta\u00e7\u00e3o revisada e pronta para sexta-feira.',
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
    },
  ];
}

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
              categoryId: draft.categoryId,
              habitTarget:
                draft.habitId && draft.habitTargetCount > 0
                  ? { habitId: draft.habitId, targetCount: draft.habitTargetCount }
                  : undefined,
            }
          : goal,
      ),
    );
  }

  complete(id: number): void {
    this.setGoals(
      this.goals().map((goal) =>
        goal.id === id
          ? { ...goal, status: 'CONCLUIDA', completedAt: toDateKey(new Date()) }
          : goal,
      ),
    );
  }

  defer(id: number, nextWeekId: string): void {
    this.setGoals(
      this.goals().map((goal) =>
        goal.id === id
          ? {
              ...goal,
              weekId: nextWeekId,
              status: statusForWeek(nextWeekId),
              deferredCount: goal.deferredCount + 1,
              completedAt: undefined,
            }
          : goal,
      ),
    );
  }

  saveFocus(weekId: string, focus: WeeklyFocus): void {
    const weeklyFocus = { ...this.weeklyFocus(), [weekId]: focus };
    this.weeklyFocus.set(weeklyFocus);

    try {
      localStorage.setItem(WEEKLY_FOCUS_STORAGE_KEY, JSON.stringify(weeklyFocus));
    } catch {
      // A página segue utilizável quando o armazenamento está indisponível.
    }
  }

  private setGoals(goals: Goal[]): void {
    this.goals.set(goals);
    this.saveGoals(goals);
  }

  private readGoals(): Goal[] {
    try {
      const storedGoals = localStorage.getItem(GOALS_STORAGE_KEY);
      if (!storedGoals) return initialGoals();

      const parsedGoals: unknown = JSON.parse(storedGoals);
      return Array.isArray(parsedGoals) ? (parsedGoals as Goal[]) : initialGoals();
    } catch {
      return initialGoals();
    }
  }

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
    }
  }
}
