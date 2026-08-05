import { Habit } from '../../habits/models/habit';
import { Goal } from '../models/goal';
import { weekDateKeys } from './week.utils';

export interface GoalProgress {
  type: 'none' | 'tasks' | 'habit';
  completed: number;
  total: number;
  percentage: number;
}

export function calculateGoalProgress(goal: Goal, habits: Habit[]): GoalProgress {
  if (goal.taskLinks.length) {
    const completed = goal.taskLinks.filter((task) => task.completed).length;
    return {
      type: 'tasks',
      completed,
      total: goal.taskLinks.length,
      percentage: Math.round((completed / goal.taskLinks.length) * 100),
    };
  }

  if (goal.habitTarget) {
    const habit = habits.find((item) => item.id === goal.habitTarget?.habitId);
    const datesInWeek = new Set(weekDateKeys(goal.weekId));
    const completed = habit
      ? [...new Set(habit.completedDates)].filter((date) => datesInWeek.has(date)).length
      : 0;
    const total = goal.habitTarget.targetCount;
    return {
      type: 'habit',
      completed,
      total,
      percentage: Math.min(100, Math.round((completed / total) * 100)),
    };
  }

  return { type: 'none', completed: 0, total: 0, percentage: 0 };
}
