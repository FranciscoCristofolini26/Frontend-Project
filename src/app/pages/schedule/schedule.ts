import { Component, computed, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { SidebarState } from '../../shared/sidebar/sidebar-state';
import { Planning } from './components/planning/planning';
import { Tasks } from './components/tasks/tasks';
import { LayoutTier } from './models';

type ScheduleView = 'planejamento' | 'tarefas';

@Component({
  selector: 'app-schedule',
  imports: [MatIconModule, Planning, Tasks],
  templateUrl: './schedule.html',
  styleUrl: './schedule.css',
})
export class Schedule {
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
}
