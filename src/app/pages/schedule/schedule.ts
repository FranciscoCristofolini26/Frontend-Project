import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Planning } from './components/planning/planning';
import { Tasks } from './components/tasks/tasks';
import { Header, PlannerContent, PlannerViewMode } from './components/header/header';
import { startOfDay } from './models/planner.utils';
import { SidebarState } from '../../shared/sidebar/sidebar-state';
import { LayoutTier } from './models';

type ScheduleView = 'planejamento' | 'tarefas';

@Component({
  selector: 'app-schedule',
  imports: [Planning, Tasks, Header],
  templateUrl: './schedule.html',
  styleUrl: './schedule.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Schedule {
  readonly scheduleView = signal<ScheduleView>('planejamento');
  readonly selectedDate = signal(startOfDay(new Date()));
  readonly plannerViewMode = signal<PlannerViewMode>('daily');
  readonly tasksDetailOpe = signal(false);
  readonly newEventRequest = signal(0);

  readonly activeContent = (): PlannerContent =>
    this.view() === 'planejamento' ? 'planning' : 'tasks';
  private readonly sidebarState = inject(SidebarState);

  view = signal<ScheduleView>('tarefas');
  tasksDetailOpen = signal(false);

  readonly layoutTier = computed<LayoutTier>(() => {
    const openSidebars =
      (this.sidebarState.occupiesLayout() ? 1 : 0) + (this.tasksDetailOpen() ? 1 : 0);

    if (openSidebars >= 2) return 'compact';
    if (openSidebars === 1) return 'balanced';
    return 'spacious';
  });

  setView(view: ScheduleView) {
    this.view.set(view);
  }

  onPrimaryAction(content: PlannerContent): void {
    if (content === 'planning') {
      this.newEventRequest.update((request) => request + 1);
    }
  }
}
