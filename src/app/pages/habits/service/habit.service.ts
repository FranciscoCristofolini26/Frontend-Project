import { Injectable, signal } from '@angular/core';
import { Habit, HabitDraft } from '../models/habit';
import { toDateKey } from '../utils/habit-metrics';

const HABITS_STORAGE_KEY = 'agenda.habits';

function offsetsBetween(first: number, last: number): number[] {
  return Array.from({ length: last - first + 1 }, (_, index) => first + index);
}

function datesFromOffsets(offsets: number[]): string[] {
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  return offsets.map((offset) => {
    const date = new Date(today);
    date.setDate(date.getDate() + offset);
    return toDateKey(date);
  });
}

function initialHabits(): Habit[] {
  return [
    {
      id: 1,
      name: 'Beber água',
      icon: 'water_drop',
      categoryId: 'saude',
      frequencyType: 'daily',
      time: '08:00',
      goal: 'Tomar pelo menos 2 litros de água por dia.',
      note: 'Deixar uma garrafa sempre por perto ajuda a lembrar.',
      status: 'active',
      completedDates: datesFromOffsets([...offsetsBetween(-42, -19), ...offsetsBetween(-17, 0)]),
      createdAt: toDateKey(new Date()),
    },
    {
      id: 2,
      name: 'Exercício físico',
      icon: 'fitness_center',
      categoryId: 'saude',
      frequencyType: 'daily',
      time: '07:00',
      goal: 'Movimentar o corpo por pelo menos 30 minutos.',
      note: 'Alternar caminhada, musculação e alongamento.',
      status: 'active',
      completedDates: datesFromOffsets([
        ...offsetsBetween(-35, -24),
        -20,
        -18,
        -16,
        -14,
        -12,
        -10,
        ...offsetsBetween(-5, 0),
      ]),
      createdAt: toDateKey(new Date()),
    },
    {
      id: 3,
      name: 'Ler por 20 minutos',
      icon: 'auto_stories',
      categoryId: 'estudo',
      frequencyType: 'daily',
      time: '21:30',
      goal: 'Ler ao menos 20 minutos, sem distrações.',
      note: 'Estou lendo um capítulo por noite.',
      status: 'active',
      completedDates: datesFromOffsets([
        ...offsetsBetween(-59, -45),
        ...offsetsBetween(-43, -14),
        -10,
        -8,
        -7,
        -5,
        -3,
        -2,
        -1,
        0,
      ]),
      createdAt: toDateKey(new Date()),
    },
    {
      id: 4,
      name: 'Meditar',
      icon: 'self_improvement',
      categoryId: 'mente',
      frequencyType: 'daily',
      goal: 'Reservar 10 minutos para desacelerar.',
      note: 'Pausado durante as férias; retomar com sessões curtas.',
      status: 'paused',
      completedDates: datesFromOffsets([...offsetsBetween(-28, -22), -15, -12, -9, -6]),
      createdAt: toDateKey(new Date()),
    },
  ];
}

function categoryIdFromLegacyName(category?: string): string {
  const categoryMap: Record<string, string> = {
    Saúde: 'saude',
    Mente: 'mente',
    Estudo: 'estudo',
    'Bem-estar': 'bem-estar',
  };

  return categoryMap[category ?? ''] ?? 'pessoal';
}

function normalizeStoredHabit(habit: Habit & { category?: string }): Habit {
  return habit.categoryId
    ? habit
    : {
        ...habit,
        categoryId: categoryIdFromLegacyName(habit.category),
      };
}

@Injectable({ providedIn: 'root' })
export class HabitService {
  readonly habits = signal<Habit[]>(this.readHabits());

  create(draft: HabitDraft): void {
    const nextId = Math.max(0, ...this.habits().map((habit) => habit.id)) + 1;
    const habit: Habit = {
      id: nextId,
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

    this.setHabits([...this.habits(), habit]);
  }

  update(id: number, draft: HabitDraft): void {
    this.setHabits(
      this.habits().map((habit) =>
        habit.id === id
          ? {
              ...habit,
              name: draft.name.trim(),
              icon: draft.icon,
              categoryId: draft.categoryId,
              frequencyType: draft.frequencyType,
              time: draft.time || undefined,
              goal: draft.goal.trim() || undefined,
              note: draft.note.trim() || undefined,
            }
          : habit,
      ),
    );
  }

  remove(id: number): void {
    this.setHabits(this.habits().filter((habit) => habit.id !== id));
  }

  toggleStatus(id: number): void {
    this.setHabits(
      this.habits().map((habit) =>
        habit.id === id
          ? { ...habit, status: habit.status === 'active' ? 'paused' : 'active' }
          : habit,
      ),
    );
  }

  toggleCompletion(id: number, date: string): void {
    this.setHabits(
      this.habits().map((habit) => {
        if (habit.id !== id) return habit;

        const completed = new Set(habit.completedDates);
        if (completed.has(date)) {
          completed.delete(date);
        } else {
          completed.add(date);
        }

        return { ...habit, completedDates: [...completed].sort() };
      }),
    );
  }

  private setHabits(habits: Habit[]): void {
    this.habits.set(habits);
    this.saveHabits(habits);
  }

  private readHabits(): Habit[] {
    try {
      const storedHabits = localStorage.getItem(HABITS_STORAGE_KEY);
      if (!storedHabits) return initialHabits();

      const parsedHabits: unknown = JSON.parse(storedHabits);
      return Array.isArray(parsedHabits)
        ? (parsedHabits as Array<Habit & { category?: string }>).map(normalizeStoredHabit)
        : initialHabits();
    } catch {
      return initialHabits();
    }
  }

  private saveHabits(habits: Habit[]): void {
    try {
      localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits));
    } catch {
      // A página segue utilizável quando o armazenamento do navegador não está disponível.
    }
  }
}
