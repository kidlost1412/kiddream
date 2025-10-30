/**
 * Todo Database Mappers
 * Utilities to convert between database snake_case and application camelCase
 */

import type { Todo } from '../types';

/**
 * Map database todo (snake_case) to application todo (camelCase)
 */
export function mapDbTodoToApp(dbTodo: any): Todo {
  return {
    ...dbTodo,
    dueDate: dbTodo.due_date,
    isCompleted: dbTodo.is_completed,
    startTime: dbTodo.start_time ?? undefined,
    endTime: dbTodo.end_time ?? undefined,
    description: dbTodo.description ?? undefined,
    stakes: dbTodo.stakes as any,
    tags: dbTodo.tags ?? undefined,
    color: dbTodo.color ?? undefined,
    completedAt: dbTodo.completed_at ?? undefined,
    projectId: undefined,
  };
}

/**
 * Map application todo changes (camelCase) to database payload (snake_case)
 */
export function mapAppChangesToDb(changes: Partial<Omit<Todo, 'id'>>): Record<string, any> {
  const payload: any = {};

  if (changes.task !== undefined) payload.task = changes.task;
  if (changes.description !== undefined) payload.description = changes.description;
  if (changes.dueDate !== undefined) payload.due_date = changes.dueDate;
  if (changes.startTime !== undefined) payload.start_time = changes.startTime;
  if (changes.endTime !== undefined) payload.end_time = changes.endTime;
  if (changes.priority !== undefined) payload.priority = changes.priority;
  if (changes.tags !== undefined) payload.tags = changes.tags;
  if (changes.color !== undefined) payload.color = changes.color;
  if (changes.stakes !== undefined) payload.stakes = changes.stakes as any;
  if (changes.isCompleted !== undefined) payload.is_completed = changes.isCompleted;

  return payload;
}

/**
 * Map application todo (for insert) to database payload
 */
export function mapAppTodoToDbInsert(appTodo: Omit<Todo, 'id' | 'isCompleted'>): Record<string, any> {
  const { dueDate, startTime, endTime, ...rest } = appTodo;
  return {
    ...rest,
    due_date: dueDate,
    start_time: startTime,
    end_time: endTime,
  };
}
