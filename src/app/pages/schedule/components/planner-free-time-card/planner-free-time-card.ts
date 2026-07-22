import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-planner-free-time-card',
  imports: [MatIconModule],
  templateUrl: './planner-free-time-card.html',
  styleUrl: './planner-free-time-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlannerFreeTimeCard {
  readonly freeTime = input('0h');
  readonly percentage = input(0);
}
