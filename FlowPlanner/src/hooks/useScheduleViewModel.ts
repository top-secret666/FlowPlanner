import { useState, useCallback } from "react";
import { useSettingsStore } from "@/store/settingsStore";
import { useTaskStore } from "@/store/taskStore";
import { distributeTasks, inferDayMode } from "@/services/aiScheduler";
import { fetchEventsForDay } from "@/services/calendarService";
import type { DaySchedule, ScheduleSlot } from "@/types/ScheduleSlot";

/**
 * ViewModel hook for the daily schedule / Today screen.
 * Fetches calendar events, runs the AI scheduler, and exposes the result.
 */
export function useScheduleViewModel(): {
  daySchedule: DaySchedule | null;
  calendarSlots: ScheduleSlot[];
  isLoading: boolean;
  error: string | null;
  loadScheduleForDate: (date: string) => Promise<void>;
  runSmartDistribution: (date: string) => Promise<void>;
} {
  const [daySchedule, setDaySchedule] = useState<DaySchedule | null>(null);
  const [calendarSlots, setCalendarSlots] = useState<ScheduleSlot[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { dayMode, schedulerPreferences } = useSettingsStore();
  const { tasks } = useTaskStore();

  /**
   * Loads Google Calendar events for the given date and updates state.
   */
  const loadScheduleForDate = useCallback(
    async (date: string): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        const slots = await fetchEventsForDay(date);
        setCalendarSlots(slots);

        const pendingTasks = tasks.filter(
          (t) => t.status === "pending" || t.status === "in_progress"
        );
        const schedule = distributeTasks(
          date,
          pendingTasks,
          slots,
          schedulerPreferences,
          dayMode
        );
        setDaySchedule(schedule);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to load schedule";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [tasks, dayMode, schedulerPreferences]
  );

  /**
   * Re-runs the AI task distribution using current calendar slots and pending tasks.
   */
  const runSmartDistribution = useCallback(
    async (date: string): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        const pendingTasks = tasks.filter(
          (t) => t.status === "pending" || t.status === "in_progress"
        );
        const inferredMode = inferDayMode(calendarSlots);
        const schedule = distributeTasks(
          date,
          pendingTasks,
          calendarSlots,
          schedulerPreferences,
          inferredMode
        );
        setDaySchedule(schedule);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Scheduling failed";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [tasks, calendarSlots, schedulerPreferences]
  );

  return {
    daySchedule,
    calendarSlots,
    isLoading,
    error,
    loadScheduleForDate,
    runSmartDistribution,
  };
}