import { Injectable, inject, signal } from '@angular/core';
import { catchError, finalize, of } from 'rxjs';
import { ApiClient, withoutId } from '../../../core/data-access/api-client.service';
import { DemoDataStore } from '../../../core/data-access/demo-data-store.service';
import { Habit, HabitDraft } from '../models/habit';
import { toDateKey } from '../utils/habit-metrics';

const RESOURCE = 'habits';

function createDemoHabit(): Habit {
  return {
    id: 1,
    name: 'Exemplo de hábito',
    icon: 'self_improvement',
    categoryId: 'pessoal',
    frequencyType: 'daily',
    goal: 'Este é um único registro de demonstração enquanto a API não possui dados.',
    status: 'active',
    completedDates: [toDateKey(new Date())],
    createdAt: toDateKey(new Date()),
  };
}

@Injectable({ providedIn: 'root' })
export class HabitService {
  private readonly api = inject(ApiClient);
  private readonly demoDataStore = inject(DemoDataStore);

  readonly habits = signal<Habit[]>([]);
  readonly loading = signal(false);

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);

    this.api
      .getAll<Habit>(RESOURCE)
      .pipe(
        catchError(() => of([])),
        finalize(() => this.loading.set(false)),
      )
      .subscribe((habits) => {
        this.habits.set(
          habits.length ? habits : this.demoDataStore.getOrCreateList(RESOURCE, createDemoHabit),
        );
      });
  }

  create(draft: HabitDraft): void {
    const habit: Habit = {
      id: this.nextId(),
      name: draft.name.trim(),
      icon: draft.icon,
      categoryId: draft.categoryId,
      frequencyType: draft.frequencyType,
      time: draft.time || undefined,
      goal: draft.goal.trim() || undefined,
      note: draft.note.trim() || undefined,
      status: 'active',
      completedDates: [],
      createdAt: toDateKey(new Date()),
    };

    this.api
      .post<Habit, Omit<Habit, 'id'>>(RESOURCE, withoutId(habit))
      .pipe(catchError(() => of(habit)))
      .subscribe((createdHabit) => this.habits.update((items) => [...items, createdHabit]));
  }

  update(id: number, draft: HabitDraft): void {
    const habit = this.habits().find((item) => item.id === id);
    if (!habit) return;

    this.persist({
      ...habit,
      name: draft.name.trim(),
      icon: draft.icon,
      categoryId: draft.categoryId,
      frequencyType: draft.frequencyType,
      time: draft.time || undefined,
      goal: draft.goal.trim() || undefined,
      note: draft.note.trim() || undefined,
    });
  }

  remove(id: number): void {
    this.api
      .delete(RESOURCE, id)
      .pipe(catchError(() => of(undefined)))
      .subscribe(() => this.habits.update((items) => items.filter((item) => item.id !== id)));
  }

  toggleStatus(id: number): void {
    const habit = this.habits().find((item) => item.id === id);
    if (!habit) return;

    this.persist({ ...habit, status: habit.status === 'active' ? 'paused' : 'active' });
  }

  toggleCompletion(id: number, date: string): void {
    const habit = this.habits().find((item) => item.id === id);
    if (!habit) return;

    const completedDates = new Set(habit.completedDates);
    if (completedDates.has(date)) {
      completedDates.delete(date);
    } else {
      completedDates.add(date);
    }

    this.persist({ ...habit, completedDates: [...completedDates].sort() });
  }

  private persist(habit: Habit): void {
    this.api
      .put<Habit, Omit<Habit, 'id'>>(RESOURCE, habit.id, withoutId(habit))
      .pipe(catchError(() => of(habit)))
      .subscribe((updatedHabit) =>
        this.habits.update((items) =>
          items.map((item) => (item.id === updatedHabit.id ? updatedHabit : item)),
        ),
      );
  }

  private nextId(): number {
    return Math.max(0, ...this.habits().map((habit) => habit.id)) + 1;
  }
}
