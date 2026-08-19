import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CategoryService } from '../../../../shared/components/categories';
import { Habit, HabitDraft, emptyHabitDraft, habitToDraft } from '../../models/habit';

const HABIT_ICONS = [
  'self_improvement',
  'water_drop',
  'fitness_center',
  'auto_stories',
  'psychology',
  'bedtime',
  'restaurant',
  'directions_run',
  'spa',
  'edit_note',
];

@Component({
  selector: 'app-habit-drawer',
  imports: [FormsModule, MatIconModule],
  templateUrl: './habit-drawer.html',
  styleUrl: './habit-drawer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HabitDrawer {
  private readonly categoryService = inject(CategoryService);

  readonly habit = input<Habit | null>(null);
  readonly close = output<void>();
  readonly save = output<HabitDraft>();
  readonly categories = this.categoryService.categories;
  readonly icons = HABIT_ICONS;
  draft: HabitDraft = emptyHabitDraft();
  submitted = false;

  constructor() {
    effect(() => {
      const habit = this.habit();
      this.draft = habit ? habitToDraft(habit) : emptyHabitDraft();
      this.submitted = false;
    });
  }

  submit(): void {
    this.submitted = true;
    if (!this.draft.name.trim()) return;

    this.save.emit({ ...this.draft });
  }

  setIcon(icon: string): void {
    this.draft = { ...this.draft, icon };
  }

  setCategory(categoryId: string): void {
    this.draft = { ...this.draft, categoryId };
  }

  closeFromBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.close.emit();
  }
}
