export type PlannerCategory = 'work' | 'study' | 'personal' | 'health' | 'event' | 'habit';

export type PlannerEventSource = 'internal' | 'google';

export type PlannerItemKind = 'event' | 'task';

export interface PlannerEvent {
  id: number;
  date: string;
  title: string;
  description?: string;
  location?: string;
  source?: PlannerEventSource;
  startTime: string;
  endTime: string;
  category: PlannerCategory;
  kind: PlannerItemKind;
}

export interface PlannerEventDraft {
  title: string;
  date: string;
  description: string;
  location?: string;
  source?: PlannerEventSource;
  startTime: string;
  endTime: string;
  category: PlannerCategory;
}

/** A fixed one-hour interval in the planner workday. */
export interface PlannerTimeSlot {
  startTime: string;
  endTime: string;
}

/** Daily availability derived from the planner's one-hour slots. */
export interface PlannerDayAvailability {
  date: string;
  totalBlocks: number;
  occupiedBlocks: number;
  availableBlocks: number;
  availableHours: number;
  slots: Array<PlannerTimeSlot & { available: boolean }>;
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

export interface PlannerOverlapGroup {
  id: string;
  events: PlannerEvent[];
  startTime: string;
  endTime: string;
}
