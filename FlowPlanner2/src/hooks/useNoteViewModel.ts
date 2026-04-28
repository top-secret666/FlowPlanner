import { useCallback } from "react";
import { useNoteStore } from "@/store/noteStore";
import * as noteService from "@/services/noteService";
import type { Note, CreateNoteInput } from "@/types/Note";

/**
 * ViewModel hook for note / journal operations.
 * All business logic for notes lives here – components only call these functions.
 */
export function useNoteViewModel(): {
  notes: Note[];
  selectedDate: string;
  isLoading: boolean;
  error: string | null;
  notesForSelectedDate: Note[];
  setSelectedDate: (date: string) => void;
  loadNotesForDate: (date: string) => Promise<void>;
  createNote: (input: CreateNoteInput) => Promise<Note>;
  updateNote: (id: string, content: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
} {
  const {
    notes,
    selectedDate,
    isLoading,
    error,
    setNotes,
    addNote,
    updateNote: storeUpdateNote,
    removeNote,
    setSelectedDate,
    setLoading,
    setError,
  } = useNoteStore();

  /**
   * Loads notes for a specific date from SQLite into the store.
   */
  const loadNotesForDate = useCallback(
    async (date: string): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        const loaded = await noteService.getNotesByDate(date);
        // Merge with existing notes for other dates
        setNotes([
          ...notes.filter((n) => n.date !== date),
          ...loaded,
        ]);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to load notes";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [notes, setNotes, setLoading, setError]
  );

  /**
   * Creates a new note, persists it, and adds it to the store.
   */
  const createNote = useCallback(
    async (input: CreateNoteInput): Promise<Note> => {
      setLoading(true);
      setError(null);
      try {
        const newNote = await noteService.createNote(input);
        addNote(newNote);
        return newNote;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to create note";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [addNote, setLoading, setError]
  );

  /**
   * Updates the content of an existing note.
   */
  const updateNote = useCallback(
    async (id: string, content: string): Promise<void> => {
      const now = new Date().toISOString();
      await noteService.updateNote(id, { content });
      storeUpdateNote(id, { content, updatedAt: now });
    },
    [storeUpdateNote]
  );

  /**
   * Deletes a note by id from SQLite and the store.
   */
  const deleteNote = useCallback(
    async (id: string): Promise<void> => {
      await noteService.deleteNote(id);
      removeNote(id);
    },
    [removeNote]
  );

  const notesForSelectedDate = notes.filter((n) => n.date === selectedDate);

  return {
    notes,
    selectedDate,
    isLoading,
    error,
    notesForSelectedDate,
    setSelectedDate,
    loadNotesForDate,
    createNote,
    updateNote,
    deleteNote,
  };
}