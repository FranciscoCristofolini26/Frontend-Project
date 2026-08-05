<<<<<<< Updated upstream
export type GoalPriority = 'ALTA' | 'MEDIA' | 'BAIXA';
export type GoalStatus = 'PLANEJADA' | 'EM_ANDAMENTO' | 'CONCLUIDA';

export interface GoalTask {
  taskId: number;
=======
import { CategoryName } from '../../models/category';

export const GOAL_PRIORITIES = ['ALTA', 'MEDIA', 'BAIXA'] as const;
export const GOAL_STATUSES = ['PLANEJADA', 'EM_ANDAMENTO', 'CONCLUIDA'] as const;

export type GoalPriority = (typeof GOAL_PRIORITIES)[number];
export type GoalStatus = (typeof GOAL_STATUSES)[number];

/** A tarefa é a fonte da verdade para o progresso de uma meta. */
export interface GoalTask {
  id: number;
>>>>>>> Stashed changes
  title: string;
  completed: boolean;
}

<<<<<<< Updated upstream
export interface GoalHabitTarget {
  habitId: number;
=======
/** Alvo independente da frequência configurada no hábito. */
export interface GoalHabitTarget {
  habitId: number;
  habitName: string;
  completedCount: number;
>>>>>>> Stashed changes
  targetCount: number;
}

export interface Goal {
  id: number;
  weekId: string;
  title: string;
  expectedResult: string;
  priority: GoalPriority;
<<<<<<< Updated upstream
  categoryId: string;
=======
  category: CategoryName;
>>>>>>> Stashed changes
  status: GoalStatus;
  deferredCount: number;
  createdAt: string;
  completedAt?: string;
<<<<<<< Updated upstream
  taskLinks: GoalTask[];
=======
  tasks: GoalTask[];
>>>>>>> Stashed changes
  habitTarget?: GoalHabitTarget;
}

export interface GoalDraft {
  title: string;
  expectedResult: string;
  priority: GoalPriority;
<<<<<<< Updated upstream
  categoryId: string;
  habitId: number | null;
  habitTargetCount: number;
}

export interface WeeklyFocus {
  focus: string;
  message: string;
=======
  category: CategoryName;
>>>>>>> Stashed changes
}

export function emptyGoalDraft(): GoalDraft {
  return {
    title: '',
    expectedResult: '',
    priority: 'MEDIA',
<<<<<<< Updated upstream
    categoryId: 'trabalho',
    habitId: null,
    habitTargetCount: 1,
=======
    category: 'Pessoal',
>>>>>>> Stashed changes
  };
}

export function goalToDraft(goal: Goal): GoalDraft {
  return {
    title: goal.title,
    expectedResult: goal.expectedResult,
    priority: goal.priority,
<<<<<<< Updated upstream
    categoryId: goal.categoryId,
    habitId: goal.habitTarget?.habitId ?? null,
    habitTargetCount: goal.habitTarget?.targetCount ?? 1,
=======
    category: goal.category,
>>>>>>> Stashed changes
  };
}
