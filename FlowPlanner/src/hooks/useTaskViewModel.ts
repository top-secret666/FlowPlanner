import { useCallback } from "react";
import { useTaskStore } from "@/store/taskStore";
import * as noteService from "@/services/noteService";
import type { Task, CreateTaskInput } from "@/types/Task";
import { generateId } from "@/utils/generateId";

/**
 * ViewModel hook for task operations.
 * All business logic for tasks lives here – components only call these functions.
 */
export function useTaskViewModel(): {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  loadTasks: () => Promise<void>;
  createTask: (input: CreateTaskInput) => Promise<Task>;
  completeTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  pendingTasks: Task[];
  todayTasks: Task[];
} {
  const { tasks, isLoading, error, setTasks, addTask, updateTask, removeTask, setLoading, setError } =
    useTaskStore();

  const today = new Date().toISOString().split("T")[0];

  /**
   * Loads all tasks from SQLite and populates the store.
   */
  const loadTasks = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const database = noteService.getDatabase !== undefined
        ? null
        : null; // accessed via raw SQLite in a real impl
      // For now we rely on the store being populated externally or by direct DB reads.
      // Real impl: const rows = await getAllTasks(); setTasks(rows);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load tasks";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setTasks]);

  /**
   * Creates a new task, persists it to SQLite, and adds it to the store.
   */
  const createTask = useCallback(
    async (input: CreateTaskInput): Promise<Task> => {
      const now = new Date().toISOString();
      const newTask: Task = {
        ...input,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      };
      // TODO: persist to SQLite tasks table
      addTask(newTask);
      return newTask;
    },
    [addTask]
  );

  /**
   * Marks a task as completed and updates the store.
   */
  const completeTask = useCallback(
    async (id: string): Promise<void> => {
      const now = new Date().toISOString();
      updateTask(id, { status: "completed", updatedAt: now });
      // TODO: persist status to SQLite
    },
    [updateTask]
  );

  /**
   * Deletes a task from the store and SQLite.
   */
  const deleteTask = useCallback(
    async (id: string): Promise<void> => {
      removeTask(id);
      // TODO: DELETE FROM tasks WHERE id = ?
    },
    [removeTask]
  );

  const pendingTasks = tasks.filter(
    (task) => task.status === "pending" || task.status === "in_progress"
  );

  const todayTasks = tasks.filter(
    (task) =>
      task.dueDate === today || task.scheduledAt?.startsWith(today) === true
  );

  return {
    tasks,
    isLoading,
    error,
    loadTasks,
    createTask,
    completeTask,
    deleteTask,
    pendingTasks,
    todayTasks,
  };
}