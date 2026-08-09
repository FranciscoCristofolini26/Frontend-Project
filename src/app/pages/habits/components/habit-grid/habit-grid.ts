import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Habit } from '../../models/habit';
import { HabitCard } from '../habit-card/habit-card';

@Component({
  selector: 'app-habit-grid',
  imports: [HabitCard],
  templateUrl: './habit-grid.html',
  styleUrl: './habit-grid.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HabitGrid {
  readonly habits = input<Habit[]>([]);
  readonly edit = output<Habit>();
  readonly remove = output<Habit>();
  readonly statusChange = output<Habit>();
}
