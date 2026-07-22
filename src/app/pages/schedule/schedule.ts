import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Planning } from './components/planning/planning';
import { Tasks } from './components/tasks/tasks';
import { Header, PlannerContent, PlannerViewMode } from './components/header/header';
import { startOfDay } from './models/planner.utils';

type ScheduleView = 'planejamento' | 'tarefas';

@Component({
  selector: 'app-schedule',
  imports: [Planning, Tasks, Header],
  templateUrl: './schedule.html',
  styleUrl: './schedule.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Schedule {
  readonly view = signal<ScheduleView>('planejamento');
  readonly selectedDate = signal(startOfDay(new Date()));
  readonly plannerViewMode = signal<PlannerViewMode>('daily');
  readonly tasksDetailOpen = signal(false);
  readonly newEventRequest = signal(0);

  readonly activeContent = (): PlannerContent =>
    this.view() === 'planejamento' ? 'planning' : 'tasks';

  setView(view: ScheduleView) {
    this.view.set(view);
  }

  onPrimaryAction(content: PlannerContent): void {
    if (content === 'planning') {
      this.newEventRequest.update((request) => request + 1);
    }
  }
}
