/**
 * Type of note entry.
 */
export type NoteType = "quick" | "journal" | "task_note";

/**
 * Represents a note or journal entry stored locally.
 */
export interface Note {
  id: string;
  type: NoteType;
  title: string;
  content: string;
  /** ISO 8601 date string (YYYY-MM-DD) the note belongs to */
  date: string;
  /** Optional reference to a related task id */
  taskId: string | null;
  /** Tags extracted or manually added */
  tags: string[];
  /** Whether this note has been pushed to the Obsidian vault via GitHub */
  synced: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Data required to create a new note.
 */
export type CreateNoteInput = Omit<Note, "id" | "createdAt" | "updatedAt">;

/**
 * Partial update payload for an existing note.
 */
export type UpdateNoteInput = Partial<Omit<Note, "id" | "createdAt">> & {
  updatedAt: string;
};