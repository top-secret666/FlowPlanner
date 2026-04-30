import { create } from "zustand";
import type { Task, CreateTaskInput, UpdateTaskInput } from "@/types/Task";

/**
 * Shape of the task store state and its actions.
 */
interface TaskStoreState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;

  /** Replace the full task list (e.g. after a DB load). */
  setTasks: (tasks: Task[]) => void;

  /** Append a single task to the list. */
  addTask: (task: Task) => void;

  /** Apply a partial update to an existing task by id. */
  updateTask: (id: string, update: UpdateTaskInput) => void;

  /** Remove a task by id. */
  removeTask: (id: string) => void;

  /** Set loading state. */
  setLoading: (loading: boolean) => void;

  /** Set or clear error message. */
  setError: (error: string | null) => void;
}

/**
 * Global task store powered by Zustand.
 * Business logic lives in useTaskViewModel – this store is state only.
 */
export const useTaskStore = create<TaskStoreState>((set) => ({
  tasks: [],
  isLoading: false,
  error: null,

  setTasks: (tasks: Task[]): void => set({ tasks }),

  addTask: (task: Task): void =>
    set((state) => ({ tasks: [...state.tasks, task] })),

  updateTask: (id: string, update: UpdateTaskInput): void =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, ...update } : t
      ),
    })),

  removeTask: (id: string): void =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    })),

  setLoading: (isLoading: boolean): void => set({ isLoading }),

  setError: (error: string | null): void => set({ error }),
}));