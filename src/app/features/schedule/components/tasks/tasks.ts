import { Component, computed, signal } from '@angular/core';
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

  pendingTasks = computed(() => this.tasks().filter((task) => !task.completed));
  completedTasks = computed(() => this.tasks().filter((task) => task.completed));

  toggleTask(id: number) {
    this.tasks.update((list) =>
      list.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)),
    );
  }

  priorityClasses(priority: TaskPriority): string {
    return PRIORITY_CLASSES[priority];
  }
}
