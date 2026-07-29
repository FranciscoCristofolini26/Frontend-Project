export enum TaskPriority {
  ALTA = 'Alta',
  MEDIA = 'Média',
  NORMAL = 'Normal',
}

export type TaskPeriod = 'hoje' | 'proximas' | 'mais-tarde';

export interface Task {
  id: number;
  title: string;
  priority: TaskPriority;
  dueLabel: string;
  period: TaskPeriod;
  project?: string;
  completed: boolean;
  notes?: string;
}
