/**
 * Visual/logical category of a schedule slot.
 */
export type SlotCategory =
  | "deep_work"
  | "meetings"
  | "admin"
  | "break"
  | "personal"
  | "blocked";

/**
 * The current mode of the day that drives scheduling strategy.
 */
export type DayMode = "deep_work" | "meetings" | "light" | "off";

/**
 * A single block of scheduled time on the daily timeline.
 */
export interface ScheduleSlot {
  id: string;
  /** ISO 8601 datetime string – slot start */
  startTime: string;
  /** ISO 8601 datetime string – slot end */
  endTime: string;
  title: string;
  category: SlotCategory;
  /** Optional task id this slot is fulfilling */
  taskId: string | null;
  /** Optional Google Calendar event id */
  calendarEventId: string | null;
  isAllDay: boolean;
  color: string | null;
}

/**
 * Snapshot of the full day schedule and its mode.
 */
export interface DaySchedule {
  /** ISO 8601 date string (YYYY-MM-DD) */
  date: string;
  mode: DayMode;
  slots: ScheduleSlot[];
  /** Total focused minutes available after meetings & blocks */
  availableFocusMinutes: number;
}

/**
 * Settings that control how the AI scheduler distributes tasks.
 */
export interface SchedulerPreferences {
  preferredWorkStart: string; // "HH:mm"
  preferredWorkEnd: string; // "HH:mm"
  defaultFocusBlockMinutes: number;
  breakBetweenBlocksMinutes: number;
  prioritizeHighPriorityFirst: boolean;
}