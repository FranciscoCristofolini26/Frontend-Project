import { Component, OnInit, computed, effect, inject, input, signal, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { catchError, of } from 'rxjs';
import { DemoDataStore } from '../../../../core/data-access/demo-data-store.service';
import { LayoutTier, Task, TaskPriority } from '../../models';
import { TasksProperties } from './tasks-properties/tasks-properties';
import { TasksService } from './service/tasks.service';

const PRIORITY_CLASSES: Record<TaskPriority, string> = {
  [TaskPriority.ALTA]: 'bg-error/10 text-error',
  [TaskPriority.MEDIA]: 'bg-warning/10 text-warning',
  [TaskPriority.NORMAL]: 'bg-surface-elevated text-text-sub',
};

const TIER_ROW_CLASSES: Record<LayoutTier, string> = {
  compact: 'gap-3 rounded-xl p-4',
  balanced: 'gap-3 rounded-xl p-4',
  spacious: 'gap-4 rounded-2xl p-5 text-lg',
};

const TIER_BADGE_CLASSES: Record<LayoutTier, string> = {
  compact: 'px-3 py-1 text-xs',
  balanced: 'px-3 py-1 text-xs',
  spacious: 'px-3.5 py-1.5 text-sm',
};

const TIER_LIST_GAP_CLASSES: Record<LayoutTier, string> = {
  compact: 'space-y-3',
  balanced: 'space-y-3',
  spacious: 'space-y-4',
};

const TIER_LABEL_CLASSES: Record<LayoutTier, string> = {
  compact: 'text-xs',
  balanced: 'text-xs',
  spacious: 'text-sm',
};

const TIER_ICON_CLASSES: Record<LayoutTier, string> = {
  compact: 'icon-lg',
  balanced: 'icon-lg',
  spacious: 'icon-xl',
};

@Component({
  selector: 'app-tasks',
  imports: [MatIconModule, TasksProperties],
  templateUrl: './tasks.html',
  styleUrl: './tasks.css',
})
export class Tasks implements OnInit {
  private readonly tasksService = inject(TasksService);
  private readonly demoDataStore = inject(DemoDataStore);

  layoutTier = input<LayoutTier>('balanced');
  newTaskRequest = input(0);
  tasks = signal<Task[]>([]);
  selectedTaskId = signal<number | null>(null);
  detailOpenChange = output<boolean>();
  showNewTaskDialog = signal<boolean>(false);
  collapsedGroups = signal<Set<string>>(new Set());

  pendingTasks = computed(() => this.tasks().filter((task) => !task.completed));
  completedTasks = computed(() => this.tasks().filter((task) => task.completed));
  selectedTask = computed(
    () => this.tasks().find((task) => task.id === this.selectedTaskId()) ?? null,
  );

  constructor() {
    effect(() => this.detailOpenChange.emit(this.selectedTaskId() !== null));
    effect(() => {
      if (this.newTaskRequest() > 0) {
        this.showNewTaskDialog.set(true);
      }
    });
  }

  ngOnInit(): void {
    this.tasksService
      .getTasks()
      .pipe(catchError(() => of([])))
      .subscribe((tasks) => {
        const displayedTasks = tasks.length
          ? tasks
          : this.demoDataStore.getOrCreateList<Task>('schedule-tasks', () => ({
              id: 1,
              title: 'Exemplo de tarefa',
              priority: TaskPriority.NORMAL,
              dueLabel: 'Hoje',
              completed: false,
            }));
        this.tasks.set(displayedTasks);
      });
  }

  isGroupCollapsed(key: string): boolean {
    return this.collapsedGroups().has(key);
  }

  toggleGroup(key: string) {
    this.collapsedGroups.update((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  selectTask(id: number) {
    this.selectedTaskId.update((current) => (current === id ? null : id));
  }

  closeDetail() {
    this.selectedTaskId.set(null);
  }

  toggleTask(id: number, event?: Event) {
    event?.stopPropagation();
    const task = this.tasks().find((t) => t.id === id);
    if (!task) {
      return;
    }

    const completed = !task.completed;
    this.tasks.update((list) => list.map((t) => (t.id === id ? { ...t, completed } : t)));
    this.tasksService
      .updateTask(id, { completed })
      .pipe(catchError(() => of({ ...task, completed })))
      .subscribe();
  }

  openNewTaskDialog() {
    this.showNewTaskDialog.set(true);
  }

  closeNewTaskDialog() {
    this.showNewTaskDialog.set(false);
  }

  addTask(task: Omit<Task, 'id'>) {
    const fallbackTask: Task = {
      ...task,
      id: Math.max(0, ...this.tasks().map((item) => item.id)) + 1,
    };

    this.tasksService
      .createTask(task)
      .pipe(catchError(() => of(fallbackTask)))
      .subscribe((newTask) => this.tasks.update((list) => [...list, newTask]));
  }

  priorityClasses(priority: TaskPriority): string {
    return PRIORITY_CLASSES[priority];
  }

  badgeClasses(): string {
    return `rounded-full font-semibold ${TIER_BADGE_CLASSES[this.layoutTier()]}`;
  }

  listGapClasses(): string {
    return TIER_LIST_GAP_CLASSES[this.layoutTier()];
  }

  labelClasses(): string {
    return `${TIER_LABEL_CLASSES[this.layoutTier()]} text-text-sub`;
  }

  iconClasses(): string {
    return TIER_ICON_CLASSES[this.layoutTier()];
  }

  rowClasses(taskId: number): string {
    const base = 'flex cursor-pointer items-center border transition-colors duration-150';
    const tierClasses = TIER_ROW_CLASSES[this.layoutTier()];

    return this.selectedTaskId() === taskId
      ? `${base} ${tierClasses} border-brand-primary bg-card-surface shadow-sm`
      : `${base} ${tierClasses} border-transparent hover:border-border hover:bg-card-surface`;
  }
}
