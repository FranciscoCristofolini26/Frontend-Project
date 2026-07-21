export enum RoutineBlockType {
  REUNIAO = 'Reunião',
  TAREFA = 'Tarefa',
  FOCO = 'Foco',
  PAUSA = 'Pausa',
}

export interface RoutineBlock {
  id: number;
  title: string;
  type: RoutineBlockType;
  startTime: string;
  endTime: string;
  detail: string;
  completed?: boolean;
}
