import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { theme } from '../theme/theme';
import { syncNote } from '../services/obsidianService';
import { trackNote } from '../services/progressService';
type KnowledgeEntry = {
  id: string;
  topic: string;
  tags: string[];
  level: 'beginner' | 'intermediate' | 'advanced';
  created: string;
  status: 'done' | 'in-progress';
  body: string;
  folder: string;
  sourceUrl: string;
};

const FOLDERS = [
  { id: 'Java_Backend', label: 'Java', emoji: '☕' },
  { id: 'Spring', label: 'Spring', emoji: '🌱' },
  { id: 'Algorithms', label: 'Algorithms', emoji: '🧮' },
  { id: 'English', label: 'English', emoji: '🇬🇧' },
  { id: 'Other', label: 'Other', emoji: '📝' },
];

const LEVELS = ['beginner', 'intermediate', 'advanced'] as const;

const TOOLBAR_ITEMS = [
  { label: '## Теория', insert: '\n## Теория\n\n' },
  { label: '💡 Заметки', insert: '\n## 💡 Заметки\n\n' },
  { label: '❓ Вопросы', insert: '\n## ❓ Вопросы для самопроверки\n\n' },
  { label: '🔗 Ссылка', insert: '\n## 🔗 Связанные материалы\n- ' },
  { label: '- [ ]', insert: '- [ ] ' },
];

function getTodayISO(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

type Props = {
  visible: boolean;
  onClose: () => void;
  onSaved: (entry: KnowledgeEntry) => void;
  initialEntry?: KnowledgeEntry;
};

export default function NewKnowledgeModal({ visible, onClose, onSaved, initialEntry }: Props) {
  const isEdit = !!initialEntry;

  const [topic, setTopic] = useState(initialEntry?.topic ?? '');
  const [folder, setFolder] = useState(initialEntry?.folder ?? 'Java_Backend');
  const [level, setLevel] = useState<typeof LEVELS[number]>(initialEntry?.level ?? 'beginner');
  const [sourceUrl, setSourceUrl] = useState(initialEntry?.sourceUrl ?? '');
  const [tags, setTags] = useState(initialEntry?.tags.join(', ') ?? '');
  const [body, setBody] = useState(initialEntry?.body ?? '');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const bodyRef = useRef<TextInput>(null);
  const [selection, setSelection] = useState({ start: 0, end: 0 });

  const insertSnippet = (snippet: string) => {
    const before = body.slice(0, selection.start);
    const after = body.slice(selection.end);
    const newBody = before + snippet + after;
    setBody(newBody);
    const pos = selection.start + snippet.length;
    setSelection({ start: pos, end: pos });
  };

  const handleSave = async () => {
    if (!topic.trim()) return;
    setSaving(true);
    try {
      const today = getTodayISO();
      const slug = topic.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const tagList = tags.split(',').map((t: string) => t.trim()).filter(Boolean);

      const frontmatter = `---\ntype: knowledge\ntopic: ${topic}\ntags: [${tagList.join(', ')}]\nsource: ${sourceUrl}\ncreated: ${today}\nlevel: ${level}\nstatus: in-progress\n---\n\n`;
      const fullContent = frontmatter + body;
      const path = `Interview-Prep/02_LEARNING/Knowledge-Base/${folder}/${slug}.md`;

      // Use syncNote with a manual path override via folderOverride pattern
      // Build the full path manually — we pass it via obsidianService directly
      await syncNote(topic, fullContent, 'knowledge', folder === 'Java_Backend' ? 'java' : folder === 'Spring' ? 'spring' : folder === 'Algorithms' ? 'algorithms' : folder === 'English' ? 'english' : undefined);
      await trackNote(topic, 'knowledge');

      const entry: KnowledgeEntry = {
        id: initialEntry?.id ?? `${Date.now()}`,
        topic,
        tags: tagList,
        level,
        created: today,
        status: 'in-progress',
        body,
        folder,
        sourceUrl,
      };
      onSaved(entry);
      setToast('✅ Сохранено!');
      setTimeout(() => {
        setToast('');
        onClose();
      }, 1200);
    } catch (err: any) {
      setToast(`❌ ${err?.message ?? 'Ошибка'}`);
      setTimeout(() => setToast(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    if (!initialEntry) {
      setTopic(''); setFolder('Java_Backend'); setLevel('beginner');
      setSourceUrl(''); setTags(''); setBody('');
    }
    setToast('');
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} onShow={reset}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          {/* Nav bar */}
          <View style={styles.navbar}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.navCancel}>Отмена</Text>
            </TouchableOpacity>
            <Text style={styles.navTitle}>{isEdit ? 'Редактировать' : 'Новая тема'}</Text>
            <TouchableOpacity onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator color={theme.colors.primary} /> : <Text style={styles.navSave}>Сохранить</Text>}
            </TouchableOpacity>
          </View>

          {toast ? <Text style={styles.toast}>{toast}</Text> : null}

          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <TextInput
              style={styles.topicInput}
              value={topic}
              onChangeText={setTopic}
              placeholder="Название темы..."
              placeholderTextColor={theme.colors.textFaint}
            />

            {/* Folder chips */}
            <Text style={styles.sectionLabel}>📁 Раздел</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
              {FOLDERS.map((f) => (
                <TouchableOpacity
                  key={f.id}
                  style={[styles.chip, folder === f.id ? styles.chipActive : styles.chipInactive]}
                  onPress={() => setFolder(f.id)}
                >
                  <Text style={[styles.chipText, folder === f.id && styles.chipTextActive]}>
                    {f.emoji} {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Level chips */}
            <Text style={styles.sectionLabel}>📊 Уровень</Text>
            <View style={styles.levelRow}>
              {LEVELS.map((l) => (
                <TouchableOpacity
                  key={l}
                  style={[styles.chip, level === l ? styles.chipActive : styles.chipInactive]}
                  onPress={() => setLevel(l)}
                >
                  <Text style={[styles.chipText, level === l && styles.chipTextActive]}>{l}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionLabel}>🔗 Источник</Text>
            <TextInput
              style={styles.input}
              value={sourceUrl}
              onChangeText={setSourceUrl}
              placeholder="https://..."
              placeholderTextColor={theme.colors.textFaint}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.sectionLabel}>🏷 Теги</Text>
            <TextInput
              style={styles.input}
              value={tags}
              onChangeText={setTags}
              placeholder="java, oop, collections"
              placeholderTextColor={theme.colors.textFaint}
              autoCapitalize="none"
            />

            {/* Toolbar */}
            <Text style={styles.sectionLabel}>📝 Конспект</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.toolbar}>
              {TOOLBAR_ITEMS.map((item) => (
                <TouchableOpacity key={item.label} style={styles.toolbarBtn} onPress={() => insertSnippet(item.insert)}>
                  <Text style={styles.toolbarBtnText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TextInput
              ref={bodyRef}
              style={styles.bodyInput}
              value={body}
              onChangeText={setBody}
              onSelectionChange={(e) => setSelection(e.nativeEvent.selection)}
              placeholder="Начни писать конспект..."
              placeholderTextColor={theme.colors.textFaint}
              multiline
              textAlignVertical="top"
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  navCancel: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
  },
  navTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  navSave: {
    color: theme.colors.primary,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  toast: {
    backgroundColor: theme.colors.surface2,
    color: theme.colors.text,
    textAlign: 'center',
    padding: theme.spacing.sm,
    fontSize: theme.typography.small,
  },
  scroll: {
    padding: theme.spacing.lg,
    paddingBottom: 40,
  },
  topicInput: {
    color: theme.colors.text,
    fontSize: theme.typography.h1,
    fontWeight: '700',
    marginBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: theme.spacing.sm,
  },
  sectionLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  chipsRow: {
    marginBottom: theme.spacing.sm,
  },
  levelRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: theme.spacing.sm,
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
    fontWeight: '600',
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    color: theme.colors.text,
    fontSize: theme.typography.body,
    marginBottom: theme.spacing.sm,
  },
  toolbar: {
    marginBottom: theme.spacing.sm,
  },
  toolbarBtn: {
    backgroundColor: theme.colors.surface2,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 6,
  },
  toolbarBtnText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.tiny,
    fontWeight: '600',
  },
  bodyInput: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    color: theme.colors.text,
    fontSize: theme.typography.body,
    minHeight: 280,
    textAlignVertical: 'top',
  },
});