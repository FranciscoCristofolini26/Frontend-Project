import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { HabitDrawer } from './components/habit-drawer/habit-drawer';
import { HabitEmptyState } from './components/habit-empty-state/habit-empty-state';
import { HabitGrid } from './components/habit-grid/habit-grid';
import { HabitSummaryBar } from './components/habit-summary-bar/habit-summary-bar';
import { CategoryService } from '../../shared/components/categories';
import { Habit, HabitDraft } from './models/habit';
import { HabitService } from './service/habit.service';

type HabitFilter = 'all' | 'active' | 'paused' | string;

interface HabitTab {
  id: HabitFilter;
  label: string;
}

@Component({
  selector: 'app-habits',
  imports: [MatIconModule, HabitDrawer, HabitEmptyState, HabitGrid, HabitSummaryBar],
  templateUrl: './habits.html',
  styleUrl: './habits.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Habits {
  private readonly habitService = inject(HabitService);
  private readonly categoryService = inject(CategoryService);

  readonly habits = this.habitService.habits;
  readonly categories = this.categoryService.categories;
  readonly searchTerm = signal('');
  readonly activeFilter = signal<HabitFilter>('all');
  readonly drawerOpen = signal(false);
  readonly editingHabit = signal<Habit | null>(null);
  readonly deleteCandidate = signal<Habit | null>(null);
  readonly tabs = computed<HabitTab[]>(() => [
    { id: 'all', label: 'Todos' },
    { id: 'active', label: 'Ativos' },
    { id: 'paused', label: 'Pausados' },
    ...this.categories().map((category) => ({ id: category.id, label: category.name })),
  ]);

  readonly filteredHabits = computed(() => {
    const searchTerm = this.searchTerm().trim().toLocaleLowerCase();
    const activeFilter = this.activeFilter();

    return this.habits().filter((habit) => {
      const matchesSearch = !searchTerm || habit.name.toLocaleLowerCase().includes(searchTerm);
      const matchesFilter =
        activeFilter === 'all' ||
        (activeFilter === 'active' && habit.status === 'active') ||
        (activeFilter === 'paused' && habit.status === 'paused') ||
        habit.categoryId === activeFilter;

      return matchesSearch && matchesFilter;
    });
  });

  setSearchTerm(value: string): void {
    this.searchTerm.set(value);
  }

  setFilter(filter: HabitFilter): void {
    this.activeFilter.set(filter);
  }

  openCreateDrawer(): void {
    this.editingHabit.set(null);
    this.drawerOpen.set(true);
  }

  openEditDrawer(habit: Habit): void {
    this.editingHabit.set(habit);
    this.drawerOpen.set(true);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
    this.editingHabit.set(null);
  }

  saveHabit(draft: HabitDraft): void {
    const habit = this.editingHabit();
    if (habit) {
      this.habitService.update(habit.id, draft);
    } else {
      this.habitService.create(draft);
    }
    this.closeDrawer();
  }

  toggleHabitStatus(habit: Habit): void {
    this.habitService.toggleStatus(habit.id);
  }

  requestDelete(habit: Habit): void {
    this.deleteCandidate.set(habit);
  }

  cancelDelete(): void {
    this.deleteCandidate.set(null);
  }

  confirmDelete(): void {
    const habit = this.deleteCandidate();
    if (!habit) return;

    this.habitService.remove(habit.id);
    this.deleteCandidate.set(null);
  }
}
