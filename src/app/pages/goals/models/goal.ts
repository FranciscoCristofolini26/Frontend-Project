export type GoalPriority = 'ALTA' | 'MEDIA' | 'BAIXA';
export type GoalStatus = 'PLANEJADA' | 'EM_ANDAMENTO' | 'CONCLUIDA';

export interface GoalTask {
  taskId: number;
  title: string;
  completed: boolean;
}

export interface GoalHabitTarget {
  habitId: number;
  targetCount: number;
}

export interface Goal {
  id: number;
  weekId: string;
  title: string;
  expectedResult: string;
  priority: GoalPriority;
  categoryId: string;
  status: GoalStatus;
  deferredCount: number;
  createdAt: string;
  completedAt?: string;
  taskLinks: GoalTask[];
  habitTarget?: GoalHabitTarget;
}

export interface GoalDraft {
  title: string;
  expectedResult: string;
  priority: GoalPriority;
  categoryId: string;
  habitId: number | null;
  habitTargetCount: number;
}

export interface WeeklyFocus {
  focus: string;
  message: string;
}

export function emptyGoalDraft(): GoalDraft {
  return {
    title: '',
    expectedResult: '',
    priority: 'MEDIA',
    categoryId: 'trabalho',
    habitId: null,
    habitTargetCount: 1,
  };
}

export function goalToDraft(goal: Goal): GoalDraft {
  return {
    title: goal.title,
    expectedResult: goal.expectedResult,
    priority: goal.priority,
    categoryId: goal.categoryId,
    habitId: goal.habitTarget?.habitId ?? null,
    habitTargetCount: goal.habitTarget?.targetCount ?? 1,
  };
}
