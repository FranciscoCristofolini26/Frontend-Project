import { Component, computed, effect, input, signal, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { LayoutTier, Task, TaskPeriod, TaskPriority } from '../../models';
import { TasksProperties } from './tasks-properties/tasks-properties';

const PRIORITY_CLASSES: Record<TaskPriority, string> = {
  [TaskPriority.ALTA]: 'bg-error/10 text-error',
  [TaskPriority.MEDIA]: 'bg-warning/10 text-warning',
  [TaskPriority.NORMAL]: 'bg-surface-elevated text-text-sub',
};

const PERIOD_LABELS: Record<TaskPeriod, string> = {
  hoje: 'Hoje',
  proximas: 'Próximas',
  'mais-tarde': 'Mais tarde',
};

const PERIOD_ORDER: TaskPeriod[] = ['hoje', 'proximas', 'mais-tarde'];

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
export class Tasks {
  layoutTier = input<LayoutTier>('balanced');
  newTaskRequest = input(0);
  tasks = signal<Task[]>([
    {
      id: 1,
      title: 'Revisar proposta comercial da Acme',
      priority: TaskPriority.ALTA,
      dueLabel: 'Hoje, 09:30',
      period: 'hoje',
      project: 'Vendas Q3',
      completed: false,
      notes: 'Aguardando parecer jurídico antes de enviar a versão final ao cliente.',
    },
    {
      id: 2,
      title: 'Sessão de foco: refatorar módulo de billing',
      priority: TaskPriority.MEDIA,
      dueLabel: 'Hoje, 14:00',
      period: 'hoje',
      project: 'Plataforma',
      completed: false,
    },
    {
      id: 3,
      title: 'Confirmar consulta médica',
      priority: TaskPriority.NORMAL,
      dueLabel: 'Hoje, 14:30',
      period: 'hoje',
      completed: false,
    },
    {
      id: 4,
      title: 'Escrever roteiro do onboarding',
      priority: TaskPriority.NORMAL,
      dueLabel: 'Amanhã',
      period: 'proximas',
      project: 'Ativação',
      completed: false,
      notes: 'Focar nos três primeiros passos do fluxo de boas-vindas.',
    },
    {
      id: 5,
      title: 'Reunião de planejamento semanal',
      priority: TaskPriority.ALTA,
      dueLabel: 'Amanhã, 10:00',
      period: 'proximas',
      completed: false,
    },
    {
      id: 6,
      title: 'Planejar férias de fim de ano',
      priority: TaskPriority.NORMAL,
      dueLabel: 'Sem data',
      period: 'mais-tarde',
      completed: false,
    },
    {
      id: 7,
      title: 'Ler artigo sobre design systems',
      priority: TaskPriority.NORMAL,
      dueLabel: 'Sem data',
      period: 'mais-tarde',
      completed: true,
    },
  ]);

  selectedTaskId = signal<number | null>(null);
  detailOpenChange = output<boolean>();
  showNewTaskDialog = signal<boolean>(false);
  collapsedGroups = signal<Set<string>>(new Set());

  pendingTasks = computed(() => this.tasks().filter((task) => !task.completed));
  completedTasks = computed(() => this.tasks().filter((task) => task.completed));
  selectedTask = computed(
    () => this.tasks().find((task) => task.id === this.selectedTaskId()) ?? null,
  );

  taskSections = computed(() => {
    const pending = this.pendingTasks();

    return PERIOD_ORDER.map((period) => ({
      key: period,
      label: PERIOD_LABELS[period],
      tasks: pending.filter((task) => task.period === period),
    })).filter((section) => section.tasks.length > 0);
  });

  constructor() {
    effect(() => this.detailOpenChange.emit(this.selectedTaskId() !== null));
    effect(() => {
      if (this.newTaskRequest() > 0) {
        this.showNewTaskDialog.set(true);
      }
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
    this.tasks.update((list) =>
      list.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)),
    );
  }

  openNewTaskDialog() {
    this.showNewTaskDialog.set(true);
  }

  closeNewTaskDialog() {
    this.showNewTaskDialog.set(false);
  }

  addTask(task: Omit<Task, 'id'>) {
    const newId = Math.max(...this.tasks().map((t) => t.id), 0) + 1;
    const newTask: Task = { ...task, id: newId };
    this.tasks.update((list) => [...list, newTask]);
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
