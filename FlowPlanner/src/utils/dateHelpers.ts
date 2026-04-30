/**
 * Returns today's date as an ISO date string (YYYY-MM-DD).
 */
export function todayISO(): string {
  return new Date().toISOString().split("T")[0] as string;
}

/**
 * Formats an ISO datetime string to a short time string (HH:MM).
 * @param isoString - ISO 8601 datetime string
 */
export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/**
 * Formats an ISO date string to a human-readable date (e.g. "Mon, Apr 28").
 * @param isoDate - ISO 8601 date string (YYYY-MM-DD)
 */
export function formatDate(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00`);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/**
 * Returns the duration in minutes between two ISO datetime strings.
 */
export function durationMinutes(start: string, end: string): number {
  return (new Date(end).getTime() - new Date(start).getTime()) / 60_000;
}

/**
 * Returns true if the given ISO date string is today.
 */
export function isToday(isoDate: string): boolean {
  return isoDate === todayISO();
}

/**
 * Returns an array of ISO date strings for the next N days starting from today.
 */
export function nextDays(count: number): string[] {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return date.toISOString().split("T")[0] as string;
  });
}