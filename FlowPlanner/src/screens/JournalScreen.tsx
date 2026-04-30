/// <reference types="nativewind/types" />
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { getScreenPadding } from "../constants/layout";
import { useNoteViewModel } from "@/hooks/useNoteViewModel";
import { Card } from "@/components/Card";
import { TealButton } from "@/components/TealButton";
import { EmptyState } from "@/components/EmptyState";
import { formatDate, todayISO, nextDays } from "@/utils/dateHelpers";

/** Auto-complete suggestion keywords for daily notes. */
const QUICK_PROMPTS = [
  "Today I focused on...",
  "Biggest win today:",
  "Blockers I hit:",
  "Tomorrow I need to...",
  "Gratitude:",
];

/**
 * Journal Screen – daily notes editor with auto-complete prompts
 * and a date strip for navigating past entries.
 */
export default function JournalScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const {
    selectedDate,
    notesForSelectedDate,
    isLoading,
    error,
    setSelectedDate,
    loadNotesForDate,
    createNote,
    updateNote,
  } = useNoteViewModel();

  const [editorContent, setEditorContent] = useState<string>("");
  const [editorTitle, setEditorTitle] = useState<string>("Quick Note");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const inputRef = useRef<TextInput>(null);

  const dates = nextDays(7).reverse(); // Show last 7 days

  useEffect((): void => {
    void loadNotesForDate(selectedDate);
  }, [selectedDate]);

  /**
   * Inserts a quick-prompt string into the editor content.
   */
  const insertPrompt = (prompt: string): void => {
    setEditorContent((prev) =>
      prev.length > 0 ? `${prev}\n\n${prompt}` : prompt
    );
    inputRef.current?.focus();
  };

  /**
   * Saves the current editor content as a new note.
   */
  const handleSave = async (): Promise<void> => {
    if (editorContent.trim().length === 0) return;
    setIsSaving(true);
    try {
      await createNote({
        type: "journal",
        title: editorTitle.trim() || "Quick Note",
        content: editorContent.trim(),
        date: selectedDate,
        taskId: null,
        tags: [],
        synced: false,
      });
      setEditorContent("");
      setEditorTitle("Quick Note");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={getScreenPadding(insets.bottom)}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="pt-4 pb-3">
            <Text className="text-text-primary text-2xl font-inter-bold">
              Journal
            </Text>
          </View>

          {/* Date strip */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-4"
          >
            {dates.map((date) => {
              const isSelected = date === selectedDate;
              return (
                <TouchableOpacity
                  key={date}
                  onPress={() => setSelectedDate(date)}
                  className={`mr-2 px-3 py-2 rounded-xl ${
                    isSelected ? "bg-teal" : "bg-surface-elevated"
                  }`}
                >
                  <Text
                    className={`text-xs font-inter-medium ${
                      isSelected ? "text-white" : "text-text-secondary"
                    }`}
                  >
                    {formatDate(date)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Editor */}
          <Card className="mb-4">
            <TextInput
              value={editorTitle}
              onChangeText={setEditorTitle}
              placeholder="Note title..."
              placeholderTextColor="#606060"
              className="text-text-primary font-inter-semibold text-base mb-2 border-b border-border pb-2"
            />
            <TextInput
              ref={inputRef}
              value={editorContent}
              onChangeText={setEditorContent}
              placeholder="Start writing..."
              placeholderTextColor="#606060"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              className="text-text-primary font-inter text-sm min-h-32"
            />
          </Card>

          {/* Quick prompts */}
          <Text className="text-text-muted text-xs font-inter-medium uppercase tracking-wider mb-2">
            Quick Prompts
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-4"
          >
            {QUICK_PROMPTS.map((prompt) => (
              <TouchableOpacity
                key={prompt}
                onPress={() => insertPrompt(prompt)}
                className="bg-surface-elevated rounded-xl px-3 py-2 mr-2"
              >
                <Text className="text-text-secondary text-xs font-inter">
                  {prompt}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TealButton
            label="Save Note"
            onPress={() => void handleSave()}
            isLoading={isSaving}
            className="mb-5"
          />

          {/* Error */}
          {error !== null && (
            <Text className="text-red-400 text-sm font-inter mb-4">{error}</Text>
          )}

          {/* Past notes for selected date */}
          <Text className="text-text-muted text-xs font-inter-medium uppercase tracking-wider mb-2">
            {notesForSelectedDate.length} note
            {notesForSelectedDate.length !== 1 ? "s" : ""} for{" "}
            {formatDate(selectedDate)}
          </Text>

          {notesForSelectedDate.length === 0 && !isLoading ? (
            <EmptyState
              title="No notes for this day"
              subtitle="Write your first entry above"
            />
          ) : (
            notesForSelectedDate.map((note) => (
              <Card key={note.id} className="mb-3">
                <Text className="text-text-primary font-inter-semibold text-sm mb-1">
                  {note.title}
                </Text>
                <Text className="text-text-secondary font-inter text-sm leading-5">
                  {note.content}
                </Text>
                {note.synced && (
                  <Text className="text-teal text-xs font-inter mt-2">
                    ✓ Synced to Obsidian
                  </Text>
                )}
              </Card>
            ))
          )}

          <View className="h-8" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}