import { Injectable, inject, signal } from '@angular/core';
import { catchError, finalize, of } from 'rxjs';
import { ApiClient, withoutId } from '../../../core/data-access/api-client.service';
import { DemoDataStore } from '../../../core/data-access/demo-data-store.service';
import { Goal, GoalDraft, GoalStatus, WeeklyFocus } from '../models/goal';
import { toDateKey } from '../../habits/utils/habit-metrics';
import { weekIdFor } from '../utils/week.utils';

const RESOURCE = 'goals';

function statusForWeek(weekId: string): GoalStatus {
  return weekId === weekIdFor(new Date()) ? 'EM_ANDAMENTO' : 'PLANEJADA';
}

function createDemoGoal(): Goal {
  const today = new Date();
  return {
    id: 1,
    weekId: weekIdFor(today),
    title: 'Exemplo de meta semanal',
    expectedResult: 'Visualizar o layout enquanto a API não possui metas cadastradas.',
    priority: 'MEDIA',
    categoryId: 'pessoal',
    status: 'EM_ANDAMENTO',
    deferredCount: 0,
    createdAt: toDateKey(today),
    taskLinks: [],
  };
}

@Injectable({ providedIn: 'root' })
export class GoalService {
  private readonly api = inject(ApiClient);
  private readonly demoDataStore = inject(DemoDataStore);

  readonly goals = signal<Goal[]>([]);
  readonly weeklyFocus = signal<Record<string, WeeklyFocus>>({});
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.api
      .getAll<Goal>(RESOURCE)
      .pipe(
        catchError(() => of([])),
        finalize(() => this.loading.set(false)),
      )
      .subscribe((goals) => {
        this.goals.set(
          goals.length ? goals : this.demoDataStore.getOrCreateList(RESOURCE, createDemoGoal),
        );
      });
  }

  create(weekId: string, draft: GoalDraft): void {
    const goal: Goal = {
      id: this.nextId(),
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

    this.api
      .post<Goal, Omit<Goal, 'id'>>(RESOURCE, withoutId(goal))
      .pipe(catchError(() => of(goal)))
      .subscribe((createdGoal) => this.goals.update((items) => [...items, createdGoal]));
  }

  update(id: number, draft: GoalDraft): void {
    const goal = this.goals().find((item) => item.id === id);
    if (!goal) return;

    this.persist({
      ...goal,
      title: draft.title.trim(),
      expectedResult: draft.expectedResult.trim(),
      priority: draft.priority,
      categoryId: draft.categoryId,
      habitTarget:
        draft.habitId && draft.habitTargetCount > 0
          ? { habitId: draft.habitId, targetCount: draft.habitTargetCount }
          : undefined,
    });
  }

  complete(id: number): void {
    const goal = this.goals().find((item) => item.id === id);
    if (!goal) return;

    this.persist({ ...goal, status: 'CONCLUIDA', completedAt: toDateKey(new Date()) });
  }

  defer(id: number, nextWeekId: string): void {
    const goal = this.goals().find((item) => item.id === id);
    if (!goal) return;

    this.persist({
      ...goal,
      weekId: nextWeekId,
      status: statusForWeek(nextWeekId),
      deferredCount: goal.deferredCount + 1,
      completedAt: undefined,
    });
  }

  remove(id: number): void {
    this.api
      .delete(RESOURCE, id)
      .pipe(catchError(() => of(undefined)))
      .subscribe(() => this.goals.update((items) => items.filter((item) => item.id !== id)));
  }

  saveFocus(weekId: string, focus: WeeklyFocus): void {
    this.weeklyFocus.update((current) => ({ ...current, [weekId]: focus }));
  }

  private persist(goal: Goal): void {
    this.api
      .put<Goal, Omit<Goal, 'id'>>(RESOURCE, goal.id, withoutId(goal))
      .pipe(catchError(() => of(goal)))
      .subscribe((updatedGoal) =>
        this.goals.update((items) =>
          items.map((item) => (item.id === updatedGoal.id ? updatedGoal : item)),
        ),
      );
  }

  private nextId(): number {
    return Math.max(0, ...this.goals().map((goal) => goal.id)) + 1;
  }
}
