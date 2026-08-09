import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Habit } from '../../models/habit';
import { calculateHabitSummary } from '../../utils/habit-metrics';

@Component({
  selector: 'app-habit-summary-bar',
  imports: [MatIconModule],
  templateUrl: './habit-summary-bar.html',
  styleUrl: './habit-summary-bar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HabitSummaryBar {
  readonly habits = input<Habit[]>([]);
  readonly summary = computed(() => calculateHabitSummary(this.habits()));
}
