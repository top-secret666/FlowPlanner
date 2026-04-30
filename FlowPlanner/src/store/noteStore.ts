import { create } from "zustand";
import type { Note, UpdateNoteInput } from "@/types/Note";

/**
 * Shape of the note store state and its actions.
 */
interface NoteStoreState {
  notes: Note[];
  /** The date currently selected in the journal view (YYYY-MM-DD). */
  selectedDate: string;
  isLoading: boolean;
  error: string | null;

  /** Replace the full note list. */
  setNotes: (notes: Note[]) => void;

  /** Append a single note. */
  addNote: (note: Note) => void;

  /** Apply a partial update to an existing note. */
  updateNote: (id: string, update: UpdateNoteInput) => void;

  /** Remove a note by id. */
  removeNote: (id: string) => void;

  /** Change the active journal date. */
  setSelectedDate: (date: string) => void;

  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

/**
 * Global note / journal store powered by Zustand.
 */
export const useNoteStore = create<NoteStoreState>((set) => ({
  notes: [],
  selectedDate: new Date().toISOString().split("T")[0],
  isLoading: false,
  error: null,

  setNotes: (notes: Note[]): void => set({ notes }),

  addNote: (note: Note): void =>
    set((state) => ({ notes: [...state.notes, note] })),

  updateNote: (id: string, update: UpdateNoteInput): void =>
    set((state) => ({
      notes: state.notes.map((n) =>
        n.id === id ? { ...n, ...update } : n
      ),
    })),

  removeNote: (id: string): void =>
    set((state) => ({
      notes: state.notes.filter((n) => n.id !== id),
    })),

  setSelectedDate: (date: string): void => set({ selectedDate: date }),

  setLoading: (isLoading: boolean): void => set({ isLoading }),

  setError: (error: string | null): void => set({ error }),
}));