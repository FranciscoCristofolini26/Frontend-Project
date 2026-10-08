import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CategoryService } from '../../shared/components/categories';
import { GoalDrawer } from './components/goal-drawer/goal-drawer';
import { GoalEmptyState } from './components/goal-empty-state/goal-empty-state';
import { GoalFocus } from './components/goal-focus/goal-focus';
import { GoalList } from './components/goal-list/goal-list';
import { GoalWeekNavigation } from './components/goal-week-navigation/goal-week-navigation';
import { Goal, GoalDraft, WeeklyFocus } from './models/goal';
import { GoalService } from './service/goal.service';
import { addDays, startOfWeek, weekIdFor } from './utils/week.utils';

type GoalStateFilter = 'all' | 'in-progress' | 'completed';

@Component({
  selector: 'app-goals',
  imports: [MatIconModule, GoalDrawer, GoalEmptyState, GoalFocus, GoalList, GoalWeekNavigation],
  templateUrl: './goals.html',
  styleUrl: './goals.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Goals {
  private readonly goalService = inject(GoalService);
  private readonly categoryService = inject(CategoryService);

  readonly goals = this.goalService.goals;
  readonly loading = this.goalService.loading;
  readonly error = this.goalService.error;
  readonly categories = this.categoryService.categories;
  readonly selectedDate = signal(startOfWeek(new Date()));
  readonly stateFilter = signal<GoalStateFilter>('all');
  readonly categoryFilter = signal('all');
  readonly drawerOpen = signal(false);
  readonly editingGoal = signal<Goal | null>(null);
  readonly selectedWeekId = computed(() => weekIdFor(this.selectedDate()));
  readonly focus = computed(() => this.goalService.weeklyFocus()[this.selectedWeekId()] ?? null);

  readonly goalsForWeek = computed(() =>
    this.goals().filter((goal) => goal.weekId === this.selectedWeekId()),
  );
  readonly filteredGoals = computed(() => {
    const stateFilter = this.stateFilter();
    const categoryFilter = this.categoryFilter();

    return this.goalsForWeek().filter((goal) => {
      const matchesState =
        stateFilter === 'all' ||
        (stateFilter === 'in-progress' && goal.status === 'EM_ANDAMENTO') ||
        (stateFilter === 'completed' && goal.status === 'CONCLUIDA');
      const matchesCategory = categoryFilter === 'all' || goal.categoryId === categoryFilter;
      return matchesState && matchesCategory;
    });
  });
  readonly summary = computed(() => {
    const goals = this.goalsForWeek();
    const completed = goals.filter((goal) => goal.status === 'CONCLUIDA').length;
    return {
      completed,
      total: goals.length,
      percentage: goals.length ? Math.round((completed / goals.length) * 100) : 0,
    };
  });

  previousWeek(): void {
    this.selectedDate.set(addDays(this.selectedDate(), -7));
  }

  nextWeek(): void {
    this.selectedDate.set(addDays(this.selectedDate(), 7));
  }

  goToCurrentWeek(): void {
    this.selectedDate.set(startOfWeek(new Date()));
  }

  setStateFilter(filter: GoalStateFilter): void {
    this.stateFilter.set(filter);
  }

  setCategoryFilter(categoryId: string): void {
    this.categoryFilter.set(categoryId);
  }

  openCreateDrawer(): void {
    this.editingGoal.set(null);
    this.drawerOpen.set(true);
  }

  openEditDrawer(goal: Goal): void {
    this.editingGoal.set(goal);
    this.drawerOpen.set(true);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
    this.editingGoal.set(null);
  }

  saveGoal(draft: GoalDraft): void {
    const goal = this.editingGoal();
    if (goal) {
      this.goalService.update(goal.id, draft);
    } else {
      this.goalService.create(this.selectedWeekId(), draft);
    }
    this.closeDrawer();
  }

  completeGoal(goal: Goal): void {
    this.goalService.complete(goal.id);
  }

  deferGoal(goal: Goal): void {
    this.goalService.defer(goal.id, weekIdFor(addDays(this.selectedDate(), 7)));
  }

  saveFocus(focus: WeeklyFocus): void {
    this.goalService.saveFocus(this.selectedWeekId(), focus);
  }
}
