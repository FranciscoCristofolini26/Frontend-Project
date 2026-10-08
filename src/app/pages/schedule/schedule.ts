import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Planning } from './components/planning/planning';
import { Tasks } from './components/tasks/tasks';
import { Header, PlannerContent, PlannerViewMode } from './components/header/header';
import { startOfDay } from './models/planner.utils';
import { LayoutTier } from './models';
import { SidebarState } from '../../shared/components/sidebar/sidebar-state';

type ScheduleView = 'planejamento' | 'tarefas';

@Component({
  selector: 'app-schedule',
  imports: [Planning, Tasks, Header],
  templateUrl: './schedule.html',
  styleUrl: './schedule.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Schedule implements OnInit {
  readonly view = signal<ScheduleView>('planejamento');
  readonly selectedDate = signal(startOfDay(new Date()));
  readonly plannerViewMode = signal<PlannerViewMode>('daily');
  readonly tasksDetailOpen = signal(false);
  readonly newEventRequest = signal(0);
  readonly newTaskRequest = signal(0);

  private readonly sidebarState = inject(SidebarState);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly activeContent = (): PlannerContent =>
    this.view() === 'planejamento' ? 'planning' : 'tasks';

  private readonly openSidebarsCount = computed(
    () => (this.sidebarState.occupiesLayout() ? 1 : 0) + (this.tasksDetailOpen() ? 1 : 0),
  );

  readonly layoutTier = computed<LayoutTier>(() => {
    const openSidebars = this.openSidebarsCount();

    if (openSidebars >= 2) return 'compact';
    if (openSidebars === 1) return 'balanced';
    return 'spacious';
  });

  readonly edgeToEdge = computed(() => this.openSidebarsCount() > 0);

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.view.set(params.get('view') === 'tarefas' ? 'tarefas' : 'planejamento');
    });
  }

  setView(view: ScheduleView) {
    this.view.set(view);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { view: view === 'tarefas' ? 'tarefas' : null },
      queryParamsHandling: 'merge',
    });
  }

  onPrimaryAction(content: PlannerContent): void {
    if (content === 'planning') {
      this.newEventRequest.update((request) => request + 1);
    } else {
      this.newTaskRequest.update((request) => request + 1);
    }
  }
}
