import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CategoryService } from '../../../../shared/categories';
import { HabitService } from '../../../habits/service/habit.service';
import { Goal } from '../../models/goal';
import { calculateGoalProgress } from '../../utils/goal-progress';

@Component({
  selector: 'app-goal-card',
  imports: [MatIconModule],
  templateUrl: './goal-card.html',
  styleUrl: './goal-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoalCard {
  private readonly categoryService = inject(CategoryService);
  private readonly habitService = inject(HabitService);

  readonly goal = input.required<Goal>();
  readonly edit = output<Goal>();
  readonly complete = output<Goal>();
  readonly defer = output<Goal>();
  readonly expanded = signal(false);
  readonly progress = computed(() =>
    calculateGoalProgress(this.goal(), this.habitService.habits()),
  );
  readonly category = computed(() =>
    this.categoryService.categories().find((category) => category.id === this.goal().categoryId),
  );
  readonly linkedHabitName = computed(() => {
    const habitId = this.goal().habitTarget?.habitId;
    return (
      this.habitService.habits().find((habit) => habit.id === habitId)?.name ?? 'Hábito vinculado'
    );
  });

  toggleExpanded(): void {
    this.expanded.update((expanded) => !expanded);
  }

  onOverviewKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggleExpanded();
    }
  }

  priorityLabel(): string {
    return this.goal().priority === 'ALTA'
      ? 'Alta'
      : this.goal().priority === 'MEDIA'
        ? 'Média'
        : 'Baixa';
  }

  statusLabel(): string {
    switch (this.goal().status) {
      case 'PLANEJADA':
        return 'Planejada';
      case 'CONCLUIDA':
        return 'Concluída';
      default:
        return 'Em andamento';
    }
  }

  progressLabel(): string {
    const progress = this.progress();
    if (progress.type === 'habit') {
      return `${progress.completed} de ${progress.total} execuções`;
    }
    return `${progress.completed} de ${progress.total} tarefas`;
  }
}
