import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { PlannerCategory, PlannerTask } from '../../models';

const CATEGORY_LABELS: Record<PlannerCategory, string> = {
  work: 'Trabalho',
  study: 'Estudos',
  personal: 'Pessoal',
  event: 'Evento',
  habit: 'Hábito',
};

@Component({
  selector: 'app-planner-unscheduled-tasks',
  imports: [MatIconModule],
  templateUrl: './planner-unscheduled-tasks.html',
  styleUrl: './planner-unscheduled-tasks.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlannerUnscheduledTasks {
  readonly tasks = input<PlannerTask[]>([]);
  readonly taskCount = computed(() => this.tasks().length);

  categoryLabel(category: PlannerCategory): string {
    return CATEGORY_LABELS[category];
  }
}
