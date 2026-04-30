import * as SQLite from "expo-sqlite";
import type { Note, CreateNoteInput, UpdateNoteInput } from "@/types/Note";
import { generateId } from "@/utils/generateId";

/** Current schema version. Increment when adding migrations. */
const SCHEMA_VERSION = 1;

/** Singleton database instance (async). */
let db: SQLite.SQLiteDatabase | null = null;

/**
 * Returns the open async database connection, opening it if needed.
 */
async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync("flowplanner.db");
  }
  return db;
}

/**
 * Runs schema migrations based on PRAGMA user_version.
 * Each migration block is guarded by version check so it only runs once.
 */
async function runMigrations(database: SQLite.SQLiteDatabase): Promise<void> {
  const versionRow = await database.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version"
  );
  const currentVersion = versionRow?.user_version ?? 0;

  if (currentVersion < 1) {
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        priority TEXT NOT NULL DEFAULT 'medium',
        status TEXT NOT NULL DEFAULT 'pending',
        due_date TEXT,
        scheduled_at TEXT,
        estimated_minutes INTEGER NOT NULL DEFAULT 30,
        tags TEXT NOT NULL DEFAULT '[]',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY NOT NULL,
        type TEXT NOT NULL DEFAULT 'quick',
        title TEXT NOT NULL,
        content TEXT NOT NULL DEFAULT '',
        date TEXT NOT NULL,
        task_id TEXT,
        tags TEXT NOT NULL DEFAULT '[]',
        synced INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS journal_entries (
        id TEXT PRIMARY KEY NOT NULL,
        date TEXT NOT NULL UNIQUE,
        mood TEXT,
        summary TEXT NOT NULL DEFAULT '',
        highlights TEXT NOT NULL DEFAULT '[]',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_notes_date ON notes(date);
      CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
      CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

      PRAGMA user_version = 1;
    `);
  }

  // Future migrations go here:
  // if (currentVersion < 2) { await database.execAsync(`...`); }
}

/**
 * Initialises the database: enables WAL mode, foreign keys, then runs migrations.
 * Safe to call multiple times – idempotent.
 */
export async function initDatabase(): Promise<void> {
  const database = await getDatabase();

  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
  `);

  await runMigrations(database);
}

/**
 * Maps a raw SQLite row to a typed Note object.
 */
function rowToNote(row: Record<string, unknown>): Note {
  return {
    id: row["id"] as string,
    type: row["type"] as Note["type"],
    title: row["title"] as string,
    content: row["content"] as string,
    date: row["date"] as string,
    taskId: (row["task_id"] as string | null) ?? null,
    tags: JSON.parse((row["tags"] as string) ?? "[]") as string[],
    synced: Boolean(row["synced"]),
    createdAt: row["created_at"] as string,
    updatedAt: row["updated_at"] as string,
  };
}

/**
 * Fetches all notes for a given date (YYYY-MM-DD).
 */
export async function getNotesByDate(date: string): Promise<Note[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<Record<string, unknown>>(
    "SELECT * FROM notes WHERE date = ? ORDER BY created_at ASC",
    [date]
  );
  return rows.map(rowToNote);
}

/**
 * Fetches a single note by id.
 */
export async function getNoteById(id: string): Promise<Note | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<Record<string, unknown>>(
    "SELECT * FROM notes WHERE id = ?",
    [id]
  );
  return row ? rowToNote(row) : null;
}

/**
 * Creates a new note and returns it with generated id and timestamps.
 */
export async function createNote(input: CreateNoteInput): Promise<Note> {
  const database = await getDatabase();
  const now = new Date().toISOString();
  const id = generateId();

  await database.runAsync(
    `INSERT INTO notes
      (id, type, title, content, date, task_id, tags, synced, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      input.type,
      input.title,
      input.content,
      input.date,
      input.taskId ?? null,
      JSON.stringify(input.tags),
      input.synced ? 1 : 0,
      now,
      now,
    ]
  );

  return { ...input, id, createdAt: now, updatedAt: now };
}

/**
 * Updates an existing note by id.
 */
export async function updateNote(
  id: string,
  update: Omit<UpdateNoteInput, "updatedAt">
): Promise<void> {
  const database = await getDatabase();
  const now = new Date().toISOString();

  await database.runAsync(
    `UPDATE notes SET
      type       = COALESCE(?, type),
      title      = COALESCE(?, title),
      content    = COALESCE(?, content),
      date       = COALESCE(?, date),
      task_id    = COALESCE(?, task_id),
      tags       = COALESCE(?, tags),
      synced     = COALESCE(?, synced),
      updated_at = ?
     WHERE id = ?`,
    [
      update.type ?? null,
      update.title ?? null,
      update.content ?? null,
      update.date ?? null,
      update.taskId ?? null,
      update.tags ? JSON.stringify(update.tags) : null,
      update.synced !== undefined ? (update.synced ? 1 : 0) : null,
      now,
      id,
    ]
  );
}

/**
 * Deletes a note by id.
 */
export async function deleteNote(id: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync("DELETE FROM notes WHERE id = ?", [id]);
}

/**
 * Marks all notes for a given date as synced to Obsidian.
 */
export async function markNotesAsSynced(date: string): Promise<void> {
  const database = await getDatabase();
  const now = new Date().toISOString();
  await database.runAsync(
    "UPDATE notes SET synced = 1, updated_at = ? WHERE date = ?",
    [now, date]
  );
}