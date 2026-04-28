import axios, { type AxiosInstance } from "axios";
import * as SecureStore from "expo-secure-store";
import type { ScheduleSlot } from "@/types/ScheduleSlot";

const SECURE_STORE_KEY = "google_calendar_token";
const GOOGLE_API_BASE = "https://www.googleapis.com/calendar/v3";

/**
 * Raw event shape returned by the Google Calendar API.
 */
interface GoogleCalendarEvent {
  id: string;
  summary: string;
  colorId?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
}

/**
 * Returns a configured Axios instance with the stored Google OAuth token.
 * Throws if no token is present.
 */
async function getAuthenticatedClient(): Promise<AxiosInstance> {
  const token = await SecureStore.getItemAsync(SECURE_STORE_KEY);
  if (!token) {
    throw new Error("Google Calendar is not connected. Please add a token in Settings.");
  }

  return axios.create({
    baseURL: GOOGLE_API_BASE,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}

/**
 * Persists the Google OAuth access token securely.
 */
export async function saveGoogleToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(SECURE_STORE_KEY, token);
}

/**
 * Removes the stored Google OAuth token (disconnect calendar).
 */
export async function removeGoogleToken(): Promise<void> {
  await SecureStore.deleteItemAsync(SECURE_STORE_KEY);
}

/**
 * Checks whether a Google Calendar token is currently stored.
 */
export async function isCalendarTokenPresent(): Promise<boolean> {
  const token = await SecureStore.getItemAsync(SECURE_STORE_KEY);
  return token !== null && token.length > 0;
}

/**
 * Maps a Google Calendar event to the internal ScheduleSlot type.
 */
function eventToSlot(event: GoogleCalendarEvent): ScheduleSlot {
  const isAllDay = Boolean(event.start.date && !event.start.dateTime);
  const startTime = event.start.dateTime ?? event.start.date ?? "";
  const endTime = event.end.dateTime ?? event.end.date ?? "";

  return {
    id: event.id,
    startTime,
    endTime,
    title: event.summary ?? "(no title)",
    category: "meetings",
    taskId: null,
    calendarEventId: event.id,
    isAllDay,
    color: event.colorId ?? null,
  };
}

/**
 * Fetches all events from the primary Google Calendar for a given day.
 * @param date - ISO date string (YYYY-MM-DD)
 */
export async function fetchEventsForDay(date: string): Promise<ScheduleSlot[]> {
  const client = await getAuthenticatedClient();

  const timeMin = `${date}T00:00:00Z`;
  const timeMax = `${date}T23:59:59Z`;

  const response = await client.get<{ items: GoogleCalendarEvent[] }>(
    "/calendars/primary/events",
    {
      params: {
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: "startTime",
      },
    }
  );

  return (response.data.items ?? []).map(eventToSlot);
}

/**
 * Fetches events for the next N days from today.
 * @param days - number of days to look ahead
 */
export async function fetchUpcomingEvents(days: number = 7): Promise<ScheduleSlot[]> {
  const client = await getAuthenticatedClient();

  const now = new Date();
  const future = new Date(now);
  future.setDate(future.getDate() + days);

  const response = await client.get<{ items: GoogleCalendarEvent[] }>(
    "/calendars/primary/events",
    {
      params: {
        timeMin: now.toISOString(),
        timeMax: future.toISOString(),
        singleEvents: true,
        orderBy: "startTime",
        maxResults: 100,
      },
    }
  );

  return (response.data.items ?? []).map(eventToSlot);
}