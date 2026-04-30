import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getScreenPadding } from '../constants/layout';
import { syncNote } from '../services/obsidianService';
import { trackNote } from '../services/progressService';
import { useSettingsStore } from '../store/settingsStore';
import { theme } from '../theme/theme';
import { TEMPLATES } from '../data/templates';

type Status = 'idle' | 'loading' | 'success' | 'error';

const FOLDERS = [
  { id: 'notes', label: 'Notes', emoji: '📝' },
  { id: 'java', label: 'Java', emoji: '☕' },
  { id: 'spring', label: 'Spring', emoji: '🌱' },
  { id: 'algorithms', label: 'Algorithms', emoji: '🧮' },
  { id: 'english', label: 'English', emoji: '🇬🇧' },
  { id: 'daily', label: 'Daily', emoji: '📅' },
];

const TEMPLATE_FOLDER_MAP: Record<string, string> = {
  daily: 'daily',
  lesson: 'java',
  weekly: 'notes',
};

function getFormattedDate(): string {
  const now = new Date();
  return now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

function getTodayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function NoteEditorScreen() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [selectedFolder, setSelectedFolder] = useState('notes');
  const [score, setScore] = useState(3);

  const { token, interviewDate } = useSettingsStore.getState();
  const today = new Date();
  const target = interviewDate ? new Date(interviewDate) : null;
  const diffDays = target ? Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;
  const weekNumber = diffDays !== null ? Math.max(1, Math.min(8, 9 - Math.ceil(diffDays / 7))) : null;
  const isUrgent = diffDays !== null && diffDays <= 7;
  const showBanner = interviewDate && diffDays !== null;

  const handleSave = async () => {
    setStatus('loading');
    setErrorMessage('');
    try {
      const finalBody = selectedTemplateId === 'daily'
        ? `${body}\n\nscore:: ${score}`
        : body;
      await syncNote(title, finalBody, selectedTemplateId, selectedFolder);
      await trackNote(title, selectedTemplateId, selectedTemplateId === 'daily' ? score : undefined);
      setStatus('success');
      if (Platform.OS !== 'web') {
        try {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const Haptics = require('expo-haptics');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        } catch (_) {}
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err?.message ?? 'An unknown error occurred');
    }
  };

  const applyTemplate = (tpl: (typeof TEMPLATES)[number]) => {
    const date = getTodayISO();
    setSelectedTemplateId(tpl.id);
    setTitle(tpl.titleTemplate.replace(/\{\{date\}\}/g, date));
    setBody(tpl.bodyTemplate.replace(/\{\{date\}\}/g, date));
    if (TEMPLATE_FOLDER_MAP[tpl.id]) {
      setSelectedFolder(TEMPLATE_FOLDER_MAP[tpl.id]);
    }
  };

  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, getScreenPadding(insets.bottom)]}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.date}>{getFormattedDate()}</Text>

      {!token && (
        <View style={styles.tokenBanner}>
          <Text style={styles.tokenBannerText}>⚠️ Настрой GitHub в Settings</Text>
        </View>
      )}

      {showBanner && (
        diffDays! <= 0 ? (
          <View style={[styles.banner, styles.bannerUrgent]}>
            <Text style={[styles.bannerLeft, { color: theme.colors.warning }]}>🚀 День стажировки!</Text>
          </View>
        ) : (
          <View style={[styles.banner, isUrgent ? styles.bannerUrgent : styles.bannerNormal]}>
            <Text style={[styles.bannerLeft, { color: isUrgent ? theme.colors.warning : theme.colors.primary }]}>
              🎯 До стажировки
            </Text>
            <View style={styles.bannerRight}>
              <Text style={[styles.bannerDays, { color: isUrgent ? theme.colors.warning : theme.colors.primary }]}>
                {diffDays} дн
              </Text>
              <Text style={styles.bannerWeek}>Неделя {weekNumber} из 8</Text>
            </View>
          </View>
        )
      )}

      <Text style={styles.heading}>New Note</Text>

      <TextInput
        style={styles.titleInput}
        value={title}
        onChangeText={setTitle}
        placeholder="Note title..."
        placeholderTextColor={theme.colors.textFaint}
      />

      {/* Template chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsRow}
        contentContainerStyle={styles.chipsContent}
      >
        {TEMPLATES.map((tpl) => (
          <TouchableOpacity
            key={tpl.id}
            style={styles.chip}
            onPress={() => applyTemplate(tpl)}
          >
            <Text style={styles.chipText}>{tpl.emoji} {tpl.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Folder chips */}
      <Text style={styles.folderLabel}>📁 Сохранить в:</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsRow}
        contentContainerStyle={styles.chipsContent}
      >
        {FOLDERS.map((folder) => (
          <TouchableOpacity
            key={folder.id}
            style={[
              styles.chip,
              selectedFolder === folder.id ? styles.chipActive : styles.chipInactive,
            ]}
            onPress={() => setSelectedFolder(folder.id)}
          >
            <Text style={[
              styles.chipText,
              selectedFolder === folder.id && styles.chipTextActive,
            ]}>
              {folder.emoji} {folder.label}
            </Text>
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

      {/* Score selector — only for daily template */}
      {selectedTemplateId === 'daily' && (
        <View style={styles.scoreSection}>
          <Text style={styles.scoreLabel}>🏆 Оценка дня:</Text>
          <View style={styles.scoreRow}>
            {[1, 2, 3, 4, 5].map((n) => (
              <TouchableOpacity
                key={n}
                style={[styles.scoreBtn, score === n ? styles.scoreBtnActive : styles.scoreBtnInactive]}
                onPress={() => setScore(n)}
              >
                <Text style={[styles.scoreBtnText, score === n ? styles.scoreBtnTextActive : styles.scoreBtnTextInactive]}>
                  {n}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

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
    marginBottom: theme.spacing.sm,
  },
  chipsContent: {
    paddingRight: theme.spacing.sm,
  },
  chip: {
    borderRadius: theme.radius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderWidth: 1,
  },
  chipInactive: {
    backgroundColor: theme.colors.surface2,
    borderColor: theme.colors.border,
  },
  chipActive: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  chipText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
  },
  chipTextActive: {
    color: theme.colors.primary,
  },
  folderLabel: {
    fontSize: theme.typography.small,
    color: theme.colors.textMuted,
    marginBottom: 4,
    marginTop: theme.spacing.md,
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
    marginTop: theme.spacing.md,
  },
  scoreSection: {
    marginBottom: theme.spacing.lg,
  },
  scoreLabel: {
    fontSize: theme.typography.small,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.sm,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scoreBtn: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreBtnActive: {
    backgroundColor: theme.colors.primary,
    borderWidth: 0,
  },
  scoreBtnInactive: {
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  scoreBtnText: {
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  scoreBtnTextActive: {
    color: '#fff',
  },
  scoreBtnTextInactive: {
    color: theme.colors.textMuted,
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
  banner: {
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerNormal: {
    backgroundColor: theme.colors.primaryLight,
  },
  bannerUrgent: {
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
  },
  bannerLeft: {
    fontSize: theme.typography.small,
    fontWeight: '600',
  },
  bannerRight: {
    alignItems: 'flex-end',
  },
  bannerDays: {
    fontSize: theme.typography.h2,
    fontWeight: '700',
  },
  bannerWeek: {
    fontSize: theme.typography.tiny,
    color: theme.colors.textMuted,
  },
  tokenBanner: {
    backgroundColor: 'rgba(201,168,76,0.15)',
    borderRadius: 8,
    padding: 12,
    marginBottom: theme.spacing.md,
  },
  tokenBannerText: { color: '#c9a84c', fontSize: theme.typography.small, fontWeight: '600' },
});
