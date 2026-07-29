import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { PlannerEvent, dateKey, toMinutes } from '../../models';

@Component({
  selector: 'app-planner-next-activity-card',
  imports: [MatIconModule],
  templateUrl: './planner-next-activity-card.html',
  styleUrl: './planner-next-activity-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlannerNextActivityCard {
  readonly date = input.required<Date>();
  readonly events = input<PlannerEvent[]>([]);
  readonly nextActivity = computed(() => {
    const selectedDate = dateKey(this.date());
    const today = dateKey(new Date());

    if (selectedDate < today) {
      return null;
    }

    const minimumTime =
      selectedDate === today ? new Date().getHours() * 60 + new Date().getMinutes() : 0;
    return (
      [...this.events()]
        .sort((first, second) => toMinutes(first.startTime) - toMinutes(second.startTime))
        .find((event) => toMinutes(event.startTime) > minimumTime) ?? null
    );
  });
  readonly startsInLabel = computed(() => {
    const activity = this.nextActivity();
    if (!activity) {
      return '';
    }

    if (dateKey(this.date()) !== dateKey(new Date())) {
      return 'Próxima atividade do dia';
    }

    const currentMinutes = new Date().getHours() * 60 + new Date().getMinutes();
    const difference = Math.max(0, toMinutes(activity.startTime) - currentMinutes);
    const hours = Math.floor(difference / 60);
    const minutes = difference % 60;
    const duration =
      hours > 0 ? `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}` : `${minutes} minutos`;
    return `Começa em ${duration}`;
  });
}
