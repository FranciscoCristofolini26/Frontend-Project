import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { isCurrentWeek, weekIdFor, weekRangeLabel } from '../../utils/week.utils';

@Component({
  selector: 'app-goal-week-navigation',
  imports: [MatIconModule],
  templateUrl: './goal-week-navigation.html',
  styleUrl: './goal-week-navigation.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoalWeekNavigation {
  readonly selectedDate = input.required<Date>();
  readonly previous = output<void>();
  readonly next = output<void>();
  readonly current = output<void>();
  readonly label = computed(() => weekRangeLabel(this.selectedDate()));
  readonly isCurrent = computed(() => isCurrentWeek(weekIdFor(this.selectedDate())));
}
