import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CategoryService } from '../../../../shared/categories';
import { HabitService } from '../../../habits/service/habit.service';
import { Goal, GoalDraft, emptyGoalDraft, goalToDraft } from '../../models/goal';

@Component({
  selector: 'app-goal-drawer',
  imports: [FormsModule, MatIconModule],
  templateUrl: './goal-drawer.html',
  styleUrl: './goal-drawer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoalDrawer {
  private readonly categoryService = inject(CategoryService);
  private readonly habitService = inject(HabitService);

  readonly goal = input<Goal | null>(null);
  readonly close = output<void>();
  readonly save = output<GoalDraft>();
  readonly categories = this.categoryService.categories;
  readonly habits = this.habitService.habits;
  readonly hasTaskLinks = computed(() => Boolean(this.goal()?.taskLinks.length));
  draft: GoalDraft = emptyGoalDraft();
  submitted = false;

  constructor() {
    effect(() => {
      const goal = this.goal();
      this.draft = goal ? goalToDraft(goal) : emptyGoalDraft();
      this.submitted = false;
    });
  }

  submit(): void {
    this.submitted = true;
    if (!this.draft.title.trim() || !this.draft.expectedResult.trim()) return;
    this.save.emit({
      ...this.draft,
      habitTargetCount: Math.max(1, Number(this.draft.habitTargetCount)),
    });
  }

  onHabitChange(value: string): void {
    this.draft = { ...this.draft, habitId: value ? Number(value) : null };
  }

  closeFromBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.close.emit();
  }
}
