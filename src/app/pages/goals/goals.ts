import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
<<<<<<< Updated upstream
import { MatIconModule } from '@angular/material/icon';
import { CategoryService } from '../../shared/categories';
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
=======
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CATEGORY_NAMES, CategoryName } from '../models/category';
import { Goal, GoalDraft, GoalPriority, emptyGoalDraft, goalToDraft } from './models/goal';
import { GoalService, WeeklyFocus } from './service/goal.service';

type GoalStateFilter = 'all' | 'in-progress' | 'completed';
type GoalCategoryFilter = 'all' | CategoryName;

interface GoalProgress {
  completed: number;
  total: number;
  percent: number;
  label: string;
}

const MONTHS = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

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

@Component({
  selector: 'app-goals',
  imports: [FormsModule, MatIconModule],
>>>>>>> Stashed changes
  templateUrl: './goals.html',
  styleUrl: './goals.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Goals {
  private readonly goalService = inject(GoalService);
<<<<<<< Updated upstream
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
=======

  readonly goals = this.goalService.goals;
  readonly categories = CATEGORY_NAMES;
  readonly selectedWeekStart = signal(startOfWeek(new Date()));
  readonly selectedWeekId = computed(() => weekIdFor(this.selectedWeekStart()));
  readonly currentWeekId = weekIdFor(new Date());
  readonly stateFilter = signal<GoalStateFilter>('all');
  readonly categoryFilter = signal<GoalCategoryFilter>('all');
  readonly expandedGoalId = signal<number | null>(null);
  readonly drawerOpen = signal(false);
  readonly editingGoal = signal<Goal | null>(null);
  readonly focusEditing = signal(false);
  readonly isSubmitting = signal(false);

  draft: GoalDraft = emptyGoalDraft();
  focusDraft: WeeklyFocus = { focus: '', note: '' };

  readonly weekGoals = computed(() =>
    this.goals().filter((goal) => goal.weekId === this.selectedWeekId()),
  );
  readonly filteredGoals = computed(() => {
    const state = this.stateFilter();
    const category = this.categoryFilter();

    return this.weekGoals().filter((goal) => {
      const matchesState =
        state === 'all' ||
        (state === 'in-progress' && goal.status === 'EM_ANDAMENTO') ||
        (state === 'completed' && goal.status === 'CONCLUIDA');
      return matchesState && (category === 'all' || goal.category === category);
    });
  });
  readonly currentFocus = computed(
    () => this.goalService.focuses()[this.selectedWeekId()] ?? { focus: '', note: '' },
  );
  readonly summary = computed(() => {
    const goals = this.weekGoals();
>>>>>>> Stashed changes
    const completed = goals.filter((goal) => goal.status === 'CONCLUIDA').length;
    return {
      completed,
      total: goals.length,
      percentage: goals.length ? Math.round((completed / goals.length) * 100) : 0,
    };
  });

  previousWeek(): void {
<<<<<<< Updated upstream
    this.selectedDate.set(addDays(this.selectedDate(), -7));
  }

  nextWeek(): void {
    this.selectedDate.set(addDays(this.selectedDate(), 7));
  }

  goToCurrentWeek(): void {
    this.selectedDate.set(startOfWeek(new Date()));
=======
    this.moveWeek(-1);
  }

  nextWeek(): void {
    this.moveWeek(1);
>>>>>>> Stashed changes
  }

  setStateFilter(filter: GoalStateFilter): void {
    this.stateFilter.set(filter);
  }

<<<<<<< Updated upstream
  setCategoryFilter(categoryId: string): void {
    this.categoryFilter.set(categoryId);
  }

  openCreateDrawer(): void {
    this.editingGoal.set(null);
    this.drawerOpen.set(true);
  }

  openEditDrawer(goal: Goal): void {
    this.editingGoal.set(goal);
=======
  setCategoryFilter(category: GoalCategoryFilter): void {
    this.categoryFilter.set(category);
  }

  toggleExpanded(goalId: number): void {
    this.expandedGoalId.update((expandedId) => (expandedId === goalId ? null : goalId));
  }

  onGoalKeydown(event: KeyboardEvent, goalId: number): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggleExpanded(goalId);
    }
  }

  openCreate(): void {
    this.editingGoal.set(null);
    this.draft = emptyGoalDraft();
    this.isSubmitting.set(false);
    this.drawerOpen.set(true);
  }

  openEdit(goal: Goal, event?: Event): void {
    event?.stopPropagation();
    this.editingGoal.set(goal);
    this.draft = goalToDraft(goal);
    this.isSubmitting.set(false);
>>>>>>> Stashed changes
    this.drawerOpen.set(true);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
    this.editingGoal.set(null);
  }

<<<<<<< Updated upstream
  saveGoal(draft: GoalDraft): void {
    const goal = this.editingGoal();
    if (goal) {
      this.goalService.update(goal.id, draft);
    } else {
      this.goalService.create(this.selectedWeekId(), draft);
=======
  saveGoal(): void {
    this.isSubmitting.set(true);
    if (!this.draft.title.trim() || !this.draft.expectedResult.trim()) return;

    const editingGoal = this.editingGoal();
    if (editingGoal) {
      this.goalService.update(editingGoal.id, this.draft);
    } else {
      this.goalService.create(this.draft, this.selectedWeekId(), this.selectedWeekStart());
>>>>>>> Stashed changes
    }
    this.closeDrawer();
  }

<<<<<<< Updated upstream
  completeGoal(goal: Goal): void {
    this.goalService.complete(goal.id);
  }

  deferGoal(goal: Goal): void {
    this.goalService.defer(goal.id, weekIdFor(addDays(this.selectedDate(), 7)));
  }

  saveFocus(focus: WeeklyFocus): void {
    this.goalService.saveFocus(this.selectedWeekId(), focus);
=======
  completeGoal(goal: Goal, event: Event): void {
    event.stopPropagation();
    this.goalService.complete(goal.id);
  }

  deferGoal(goal: Goal, event: Event): void {
    event.stopPropagation();
    const nextWeekStart = new Date(this.selectedWeekStart());
    nextWeekStart.setDate(nextWeekStart.getDate() + 7);
    this.goalService.defer(goal.id, weekIdFor(nextWeekStart), nextWeekStart);
    if (this.expandedGoalId() === goal.id) this.expandedGoalId.set(null);
  }

  startFocusEditing(): void {
    const currentFocus = this.currentFocus();
    this.focusDraft = { focus: currentFocus.focus, note: currentFocus.note };
    this.focusEditing.set(true);
  }

  cancelFocusEditing(): void {
    this.focusEditing.set(false);
  }

  saveFocus(): void {
    if (!this.focusDraft.focus.trim()) return;
    this.goalService.saveFocus(this.selectedWeekId(), {
      focus: this.focusDraft.focus.trim(),
      note: this.focusDraft.note.trim(),
    });
    this.focusEditing.set(false);
  }

  getProgress(goal: Goal): GoalProgress | null {
    if (goal.tasks.length) {
      const completed = goal.tasks.filter((task) => task.completed).length;
      return {
        completed,
        total: goal.tasks.length,
        percent: Math.round((completed / goal.tasks.length) * 100),
        label: `${completed} de ${goal.tasks.length} tarefas`,
      };
    }

    if (goal.habitTarget) {
      const { completedCount, targetCount } = goal.habitTarget;
      return {
        completed: completedCount,
        total: targetCount,
        percent: targetCount ? Math.min(100, Math.round((completedCount / targetCount) * 100)) : 0,
        label: `${completedCount} de ${targetCount} execuções`,
      };
    }

    return null;
  }

  statusLabel(goal: Goal): string {
    if (!this.getProgress(goal)) return goal.status === 'CONCLUIDA' ? 'Concluída' : 'Pendente';
    switch (goal.status) {
      case 'CONCLUIDA':
        return 'Concluída';
      case 'PLANEJADA':
        return 'Planejada';
      default:
        return 'Em andamento';
    }
  }

  priorityLabel(priority: GoalPriority): string {
    return priority[0] + priority.slice(1).toLocaleLowerCase();
  }

  weekRangeLabel(): string {
    const start = this.selectedWeekStart();
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return `${this.shortDate(start)} — ${this.shortDate(end)}`;
  }

  isCurrentWeek(): boolean {
    return this.selectedWeekId() === this.currentWeekId;
  }

  closeDrawerFromBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.closeDrawer();
  }

  private moveWeek(offset: number): void {
    this.selectedWeekStart.update((weekStart) => {
      const nextWeek = new Date(weekStart);
      nextWeek.setDate(nextWeek.getDate() + offset * 7);
      return nextWeek;
    });
    this.expandedGoalId.set(null);
  }

  private shortDate(date: Date): string {
    return `${String(date.getDate()).padStart(2, '0')} ${MONTHS[date.getMonth()]}`;
>>>>>>> Stashed changes
  }
}
