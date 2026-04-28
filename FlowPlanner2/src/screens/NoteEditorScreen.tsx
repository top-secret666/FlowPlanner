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

type Status = 'idle' | 'loading' | 'success' | 'error';

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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.inputSingle}
        value={title}
        onChangeText={setTitle}
        placeholder="Note title"
        placeholderTextColor="#6b7280"
      />

      <Text style={styles.label}>Body</Text>
      <TextInput
        style={styles.inputMulti}
        value={body}
        onChangeText={setBody}
        placeholder="Note body"
        placeholderTextColor="#6b7280"
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
    backgroundColor: '#111827',
  },
  content: {
    padding: 20,
  },
  label: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 16,
  },
  inputSingle: {
    backgroundColor: '#1f2937',
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  inputMulti: {
    backgroundColor: '#1f2937',
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    minHeight: 144,
  },
  button: {
    backgroundColor: '#0d9488',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  successText: {
    color: '#22c55e',
    fontSize: 15,
    marginTop: 14,
    textAlign: 'center',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 15,
    marginTop: 14,
    textAlign: 'center',
  },
});