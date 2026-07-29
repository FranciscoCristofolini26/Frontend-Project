import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

interface SummaryMetric {
  id: 'tasks' | 'events' | 'habits' | 'planned';
  value: string | number;
  label: string;
  highlighted?: boolean;
}

@Component({
  selector: 'app-daily-summary',
  imports: [],
  templateUrl: './daily-summary.html',
  styleUrl: './daily-summary.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DailySummaryComponent {
  readonly taskCount = input(0);
  readonly eventCount = input(0);
  readonly habitCount = input(0);
  readonly plannedHours = input('0h');

  readonly metrics = computed<SummaryMetric[]>(() => [
    { id: 'tasks', value: this.taskCount(), label: 'Tarefas' },
    { id: 'events', value: this.eventCount(), label: 'Eventos' },
    { id: 'habits', value: this.habitCount(), label: 'Hábitos' },
    { id: 'planned', value: this.plannedHours(), label: 'Planejadas', highlighted: true },
  ]);
}
