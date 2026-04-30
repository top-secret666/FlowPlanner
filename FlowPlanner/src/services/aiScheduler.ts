import type { Task } from "@/types/Task";
import type {
  ScheduleSlot,
  DaySchedule,
  DayMode,
  SchedulerPreferences,
  SlotCategory,
} from "@/types/ScheduleSlot";
import { generateId } from "@/utils/generateId";

const PRIORITY_ORDER: Record<Task["priority"], number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

/**
 * Determines the recommended DayMode based on existing calendar slots.
 * Heuristic: if more than 3 hours of meetings → "meetings" mode.
 */
export function inferDayMode(calendarSlots: ScheduleSlot[]): DayMode {
  const meetingMinutes = calendarSlots
    .filter((slot) => slot.category === "meetings")
    .reduce((total, slot) => {
      const start = new Date(slot.startTime).getTime();
      const end = new Date(slot.endTime).getTime();
      return total + (end - start) / 60_000;
    }, 0);

  if (meetingMinutes >= 180) return "meetings";
  if (meetingMinutes >= 60) return "light";
  return "deep_work";
}

/**
 * Calculates the total available focus minutes in a day
 * after subtracting calendar blocks and applying work-hour bounds.
 */
function calculateAvailableMinutes(
  date: string,
  calendarSlots: ScheduleSlot[],
  preferences: SchedulerPreferences
): number {
  const [startHour, startMin] = preferences.preferredWorkStart
    .split(":")
    .map(Number) as [number, number];
  const [endHour, endMin] = preferences.preferredWorkEnd
    .split(":")
    .map(Number) as [number, number];

  const workStart = new Date(`${date}T${preferences.preferredWorkStart}:00`);
  const workEnd = new Date(`${date}T${preferences.preferredWorkEnd}:00`);

  const totalWorkMinutes =
    (workEnd.getTime() - workStart.getTime()) / 60_000;

  const blockedMinutes = calendarSlots
    .filter((slot) => !slot.isAllDay)
    .reduce((total, slot) => {
      const slotStart = new Date(slot.startTime);
      const slotEnd = new Date(slot.endTime);

      // Clamp to work hours
      const effectiveStart = slotStart < workStart ? workStart : slotStart;
      const effectiveEnd = slotEnd > workEnd ? workEnd : slotEnd;

      if (effectiveEnd <= effectiveStart) return total;
      return total + (effectiveEnd.getTime() - effectiveStart.getTime()) / 60_000;
    }, 0);

  return Math.max(0, totalWorkMinutes - blockedMinutes);
}

/**
 * Sorts tasks by priority then by due date for distribution.
 */
function sortTasksForScheduling(tasks: Task[]): Task[] {
  return [...tasks].sort((taskA, taskB) => {
    const priorityDiff =
      PRIORITY_ORDER[taskA.priority] - PRIORITY_ORDER[taskB.priority];
    if (priorityDiff !== 0) return priorityDiff;

    if (taskA.dueDate && taskB.dueDate) {
      return taskA.dueDate.localeCompare(taskB.dueDate);
    }
    if (taskA.dueDate) return -1;
    if (taskB.dueDate) return 1;
    return 0;
  });
}

/**
 * Maps task priority to a slot category for visual display.
 */
function priorityToCategory(priority: Task["priority"]): SlotCategory {
  if (priority === "urgent" || priority === "high") return "deep_work";
  return "admin";
}

/**
 * Core scheduling algorithm: distributes pending tasks into available time slots.
 * Does NOT mutate the input – returns a new DaySchedule.
 *
 * @param date - target date (YYYY-MM-DD)
 * @param pendingTasks - tasks to schedule (status = pending or in_progress)
 * @param calendarSlots - existing calendar events for the day
 * @param preferences - user scheduling preferences
 * @param dayMode - the mode affecting how aggressively to pack tasks
 */
export function distributeTasks(
  date: string,
  pendingTasks: Task[],
  calendarSlots: ScheduleSlot[],
  preferences: SchedulerPreferences,
  dayMode: DayMode
): DaySchedule {
  const sortedTasks = sortTasksForScheduling(pendingTasks);

  const focusBlockMinutes =
    dayMode === "deep_work"
      ? preferences.defaultFocusBlockMinutes
      : dayMode === "light"
      ? Math.min(preferences.defaultFocusBlockMinutes, 45)
      : 30;

  const breakMinutes = preferences.breakBetweenBlocksMinutes;

  // Build a cursor starting at the work-start time
  const workStart = new Date(`${date}T${preferences.preferredWorkStart}:00`);
  const workEnd = new Date(`${date}T${preferences.preferredWorkEnd}:00`);

  let cursor = new Date(workStart);

  const generatedSlots: ScheduleSlot[] = [];

  /**
   * Checks whether a proposed time range overlaps with any calendar event.
   */
  function overlapsCalendar(start: Date, end: Date): boolean {
    return calendarSlots.some((calSlot) => {
      if (calSlot.isAllDay) return false;
      const calStart = new Date(calSlot.startTime);
      const calEnd = new Date(calSlot.endTime);
      return start < calEnd && end > calStart;
    });
  }

  /**
   * Advances the cursor past any calendar event that starts at or before cursor.
   */
  function skipCalendarBlocks(): void {
    let advanced = true;
    while (advanced) {
      advanced = false;
      for (const calSlot of calendarSlots) {
        if (calSlot.isAllDay) continue;
        const calStart = new Date(calSlot.startTime);
        const calEnd = new Date(calSlot.endTime);
        if (cursor >= calStart && cursor < calEnd) {
          cursor = new Date(calEnd.getTime() + breakMinutes * 60_000);
          advanced = true;
        }
      }
    }
  }

  for (const task of sortedTasks) {
    if (cursor >= workEnd) break;

    skipCalendarBlocks();
    if (cursor >= workEnd) break;

    const durationMinutes = Math.min(
      task.estimatedMinutes,
      focusBlockMinutes
    );
    const slotEnd = new Date(cursor.getTime() + durationMinutes * 60_000);

    if (slotEnd > workEnd) break;

    if (!overlapsCalendar(cursor, slotEnd)) {
      generatedSlots.push({
        id: generateId(),
        startTime: cursor.toISOString(),
        endTime: slotEnd.toISOString(),
        title: task.title,
        category: priorityToCategory(task.priority),
        taskId: task.id,
        calendarEventId: null,
        isAllDay: false,
        color: null,
      });

      cursor = new Date(slotEnd.getTime() + breakMinutes * 60_000);
    } else {
      // Skip forward 15 minutes and retry
      cursor = new Date(cursor.getTime() + 15 * 60_000);
    }
  }

  const allSlots = [...calendarSlots, ...generatedSlots].sort(
    (slotA, slotB) =>
      new Date(slotA.startTime).getTime() - new Date(slotB.startTime).getTime()
  );

  const availableFocusMinutes = calculateAvailableMinutes(
    date,
    calendarSlots,
    preferences
  );

  return {
    date,
    mode: dayMode,
    slots: allSlots,
    availableFocusMinutes,
  };
}