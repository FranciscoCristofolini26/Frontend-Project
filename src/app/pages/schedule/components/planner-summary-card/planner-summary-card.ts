import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-planner-summary-card',
  imports: [MatIconModule],
  templateUrl: './planner-summary-card.html',
  styleUrl: './planner-summary-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlannerSummaryCard {
  readonly taskCount = input(0);
  readonly eventCount = input(0);
  readonly habitCount = input(0);
  readonly plannedHours = input('0h');
}
