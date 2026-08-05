import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Goal } from '../../models/goal';
import { GoalCard } from '../goal-card/goal-card';

@Component({
  selector: 'app-goal-list',
  imports: [GoalCard],
  templateUrl: './goal-list.html',
  styleUrl: './goal-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoalList {
  readonly goals = input<Goal[]>([]);
  readonly edit = output<Goal>();
  readonly complete = output<Goal>();
  readonly defer = output<Goal>();
}
