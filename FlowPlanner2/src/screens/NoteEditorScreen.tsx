import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { syncNote } from '../services/obsidianService';
import { theme } from '../theme/theme';

type Status = 'idle' | 'loading' | 'success' | 'error';

const TEMPLATES: { label: string; body: string }[] = [
  {
    label: 'Daily Note',
    body: '## What I worked on\n\n## Wins\n\n## Tomorrow',
  },
  {
    label: 'Meeting',
    body: '## Attendees\n\n## Agenda\n\n## Action items',
  },
  {
    label: 'Idea',
    body: '## The idea\n\n## Why it matters\n\n## Next steps',
  },
  {
    label: 'Todo',
    body: '## Today\'s tasks\n- [ ] \n- [ ] \n- [ ] ',
  },
];

function getFormattedDate(): string {
  const now = new Date();
  return now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

function getShortDate(): string {
  const now = new Date();
  return now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function NoteEditorScreen() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSave = async () => {
    setStatus('loading');
    setErrorMessage('');
    try {
      await syncNote(title, body);
      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err?.message ?? 'An unknown error occurred');
    }
  };

  const applyTemplate = (tpl: { label: string; body: string }) => {
    setTitle(`${tpl.label} – ${getShortDate()}`);
    setBody(tpl.body);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.date}>{getFormattedDate()}</Text>
      <Text style={styles.heading}>New Note</Text>

      <TextInput
        style={styles.titleInput}
        value={title}
        onChangeText={setTitle}
        placeholder="Note title..."
        placeholderTextColor={theme.colors.textFaint}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsRow}
        contentContainerStyle={styles.chipsContent}
      >
        {TEMPLATES.map((tpl) => (
          <TouchableOpacity
            key={tpl.label}
            style={styles.chip}
            onPress={() => applyTemplate(tpl)}
          >
            <Text style={styles.chipText}>{tpl.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TextInput
        style={styles.bodyInput}
        value={body}
        onChangeText={setBody}
        placeholder="Start writing..."
        placeholderTextColor={theme.colors.textFaint}
        multiline
        textAlignVertical="top"
      />

      <TouchableOpacity
        style={[styles.button, status === 'loading' && styles.buttonDisabled]}
        onPress={handleSave}
        disabled={status === 'loading'}
      >
        {status === 'loading' ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>Save to Obsidian</Text>
        )}
      </TouchableOpacity>

      {status === 'success' && (
        <Text style={styles.successText}>Saved to Obsidian ✓</Text>
      )}
      {status === 'error' && (
        <Text style={styles.errorText}>{errorMessage}</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  content: {
    padding: theme.spacing.lg,
  },
  date: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    marginBottom: theme.spacing.xs,
  },
  heading: {
    color: theme.colors.text,
    fontSize: theme.typography.hero,
    fontWeight: '700',
    marginBottom: theme.spacing.lg,
  },
  titleInput: {
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    fontSize: theme.typography.h2,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
  },
  chipsRow: {
    marginBottom: theme.spacing.md,
  },
  chipsContent: {
    paddingRight: theme.spacing.sm,
  },
  chip: {
    backgroundColor: theme.colors.surface2,
    borderRadius: theme.radius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  chipText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
  },
  bodyInput: {
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    fontSize: theme.typography.body,
    minHeight: 200,
    textAlignVertical: 'top',
    marginBottom: theme.spacing.lg,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  successText: {
    color: theme.colors.success,
    fontSize: theme.typography.body,
    textAlign: 'center',
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.body,
    textAlign: 'center',
  },
});