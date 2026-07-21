import { Component, computed, effect, signal, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Task, TaskPriority } from '../../models';

const PRIORITY_CLASSES: Record<TaskPriority, string> = {
  [TaskPriority.ALTA]: 'bg-error/10 text-error',
  [TaskPriority.MEDIA]: 'bg-warning/10 text-warning',
  [TaskPriority.NORMAL]: 'bg-surface-elevated text-text-sub',
};

@Component({
  selector: 'app-tasks',
  imports: [MatIconModule],
  templateUrl: './tasks.html',
  styleUrl: './tasks.css',
})
export class Tasks {
  tasks = signal<Task[]>([
    {
      id: 1,
      title: 'Revisar proposta comercial da Acme',
      priority: TaskPriority.ALTA,
      dueLabel: 'Hoje, 09:30',
      project: 'Vendas Q3',
      completed: false,
      notes: 'Aguardando parecer jurídico antes de enviar a versão final ao cliente.',
    },
    {
      id: 2,
      title: 'Sessão de foco: refatorar módulo de billing',
      priority: TaskPriority.MEDIA,
      dueLabel: 'Hoje, 14:00',
      project: 'Plataforma',
      completed: false,
    },
    {
      id: 3,
      title: 'Confirmar consulta médica',
      priority: TaskPriority.NORMAL,
      dueLabel: 'Hoje, 14:30',
      completed: false,
    },
    {
      id: 4,
      title: 'Escrever roteiro do onboarding',
      priority: TaskPriority.NORMAL,
      dueLabel: 'Amanhã',
      project: 'Ativação',
      completed: false,
      notes: 'Focar nos três primeiros passos do fluxo de boas-vindas.',
    },
    {
      id: 5,
      title: 'Reunião de planejamento semanal',
      priority: TaskPriority.ALTA,
      dueLabel: 'Amanhã, 10:00',
      completed: false,
    },
    {
      id: 6,
      title: 'Ler artigo sobre design systems',
      priority: TaskPriority.NORMAL,
      dueLabel: 'Sem data',
      completed: true,
    },
  ]);

  selectedTaskId = signal<number | null>(null);
  detailOpenChange = output<boolean>();

  pendingTasks = computed(() => this.tasks().filter((task) => !task.completed));
  completedTasks = computed(() => this.tasks().filter((task) => task.completed));
  selectedTask = computed(
    () => this.tasks().find((task) => task.id === this.selectedTaskId()) ?? null,
  );

  constructor() {
    effect(() => this.detailOpenChange.emit(this.selectedTaskId() !== null));
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

  priorityClasses(priority: TaskPriority): string {
    return PRIORITY_CLASSES[priority];
  }

  rowClasses(taskId: number): string {
    const base =
      'flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all duration-150';

    return this.selectedTaskId() === taskId
      ? `${base} border-brand-primary bg-card-surface shadow-lg -translate-y-1`
      : `${base} border-border bg-card-surface shadow-none hover:-translate-y-0.5 hover:shadow-md`;
  }
}
