import { Component, OnInit, computed, effect, inject, input, signal, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { catchError, of } from 'rxjs';
import { DemoDataStore } from '../../../../core/data-access/demo-data-store.service';
import { LayoutTier, Task, TaskPriority } from '../../models';
import { TasksProperties } from './tasks-properties/tasks-properties';
import { TasksService } from './service/tasks.service';

const PRIORITY_SLUGS: Record<TaskPriority, string> = {
  [TaskPriority.ALTA]: 'alta',
  [TaskPriority.MEDIA]: 'media',
  [TaskPriority.NORMAL]: 'normal',
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
  groups = computed(() => [
    { key: 'pendentes', label: 'Pendentes', tasks: this.pendingTasks() },
    { key: 'concluidas', label: 'Concluídas', tasks: this.completedTasks() },
  ]);
  progress = computed(() => {
    const total = this.tasks().length;
    return total ? Math.round((this.completedTasks().length / total) * 100) : 0;
  });
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

  prioritySlug(priority: TaskPriority): string {
    return PRIORITY_SLUGS[priority];
  }
}
