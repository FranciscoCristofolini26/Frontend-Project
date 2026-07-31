import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Habit } from '../../models/habit';
import { buildHeatmap, calculateHabitMetrics } from '../../utils/habit-metrics';

@Component({
  selector: 'app-habit-card',
  imports: [MatIconModule],
  templateUrl: './habit-card.html',
  styleUrl: './habit-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HabitCard {
  readonly habit = input.required<Habit>();
  readonly edit = output<Habit>();
  readonly remove = output<Habit>();
  readonly statusChange = output<Habit>();
  readonly expanded = signal(false);

  readonly metrics = computed(() => calculateHabitMetrics(this.habit()));
  readonly miniHeatmap = computed(() => buildHeatmap(this.habit(), 21));
  readonly fullHeatmap = computed(() => buildHeatmap(this.habit(), 60));

  toggleExpanded(): void {
    this.expanded.update((expanded) => !expanded);
  }

  onOverviewKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggleExpanded();
    }
  }

  frequencyLabel(): string {
    switch (this.habit().frequencyType) {
      case 'weekdays':
        return 'Dias úteis';
      case 'custom':
        return 'Frequência personalizada';
      default:
        return 'Todos os dias';
    }
  }
}
