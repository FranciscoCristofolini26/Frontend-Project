import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { PlannerHabit } from '../../models';

@Component({
  selector: 'app-planner-habits-card',
  templateUrl: './planner-habits-card.html',
  styleUrl: './planner-habits-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlannerHabitsCard {
  readonly habits = input<PlannerHabit[]>([]);
  readonly habitToggled = output<number>();
}
