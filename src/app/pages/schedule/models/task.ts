export enum TaskPriority {
  ALTA = 'Alta',
  MEDIA = 'Média',
  NORMAL = 'Normal',
}
export interface Task {
  id: number;
  title: string;
  priority: TaskPriority;
  dueLabel: string;
  completed: boolean;
  notes?: string;
}
