import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-goal-empty-state',
  imports: [MatIconModule],
  templateUrl: './goal-empty-state.html',
  styleUrl: './goal-empty-state.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoalEmptyState {
  readonly create = output<void>();
}
