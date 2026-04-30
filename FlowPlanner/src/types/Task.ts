/**
 * Priority level for a task.
 */
export type TaskPriority = "low" | "medium" | "high" | "urgent";

/**
 * Current lifecycle status of a task.
 */
export type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled";

/**
 * Represents a single actionable task in the planner.
 */
export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  /** ISO 8601 date string (YYYY-MM-DD) */
  dueDate: string | null;
  /** ISO 8601 datetime string */
  scheduledAt: string | null;
  /** Duration in minutes */
  estimatedMinutes: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Data required to create a new task (id and timestamps are auto-generated).
 */
export type CreateTaskInput = Omit<Task, "id" | "createdAt" | "updatedAt">;

/**
 * Partial update payload for an existing task.
 */
export type UpdateTaskInput = Partial<Omit<Task, "id" | "createdAt">> & {
  updatedAt: string;
};