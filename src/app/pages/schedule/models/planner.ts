export type PlannerCategory = 'work' | 'study' | 'personal' | 'event' | 'habit';

export type PlannerItemKind = 'event' | 'task';

export interface PlannerEvent {
  id: number;
  date: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  category: PlannerCategory;
  kind: PlannerItemKind;
}

export interface PlannerEventDraft {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  category: PlannerCategory;
}

export interface PlannerTask {
  id: number;
  title: string;
  category: PlannerCategory;
  project?: string;
}

export interface PlannerHabit {
  id: number;
  title: string;
  completed: boolean;
}

export interface PositionedPlannerEvent extends PlannerEvent {
  column: number;
  columnCount: number;
}
