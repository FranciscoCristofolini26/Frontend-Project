import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { PlannerEvent, PlannerHabit } from '../../models';
import { PlannerFreeTimeCard } from '../planner-free-time-card/planner-free-time-card';
import { PlannerHabitsCard } from '../planner-habits-card/planner-habits-card';
import { PlannerNextActivityCard } from '../planner-next-activity-card/planner-next-activity-card';
import { PlannerSummaryCard } from '../planner-summary-card/planner-summary-card';

@Component({
  selector: 'app-planner-sidebar',
  imports: [PlannerSummaryCard, PlannerNextActivityCard, PlannerHabitsCard, PlannerFreeTimeCard],
  templateUrl: './planner-sidebar.html',
  styleUrl: './planner-sidebar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlannerSidebar {
  readonly date = input.required<Date>();
  readonly events = input<PlannerEvent[]>([]);
  readonly habits = input<PlannerHabit[]>([]);
  readonly taskCount = input(0);
  readonly eventCount = input(0);
  readonly plannedHours = input('0h');
  readonly freeTime = input('0h');
  readonly freeTimePercentage = input(0);
  readonly habitToggled = output<number>();
}
