import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as SQLite from 'expo-sqlite';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { theme } from '../theme/theme';
import { uploadImageToGitHub, saveKnowledgeNote } from '../services/knowledgeService';

// ─── Types ───────────────────────────────────────────────────────────────────

type ImageItem = {
  localUri: string;
  githubUrl: string;
  filename: string;
  uploading: boolean;
};

type KnowledgeNote = {
  id: number;
  topic: string;
  folder: string;
  level: string;
  tags: string;
  sourceUrl: string;
  status: string;
  body: string;
  images: ImageItem[];
  createdAt: string;
};

// ─── Constants ───────────────────────────────────────────────────────────────

const STORAGE_KEY = 'knowledge_notes';

const FOLDERS = [
  { id: 'Java_Backend', label: 'Java', emoji: '☕', color: '#f97316' },
  { id: 'Spring', label: 'Spring', emoji: '🌱', color: '#22c55e' },
  { id: 'Algorithms', label: 'Algorithms', emoji: '🧮', color: '#3b82f6' },
  { id: 'English', label: 'English', emoji: '🇬🇧', color: '#a855f7' },
  { id: 'Other', label: 'Other', emoji: '📝', color: theme.colors.textMuted },
];

const LEVELS = [
  { id: 'beginner', color: theme.colors.success },
  { id: 'intermediate', color: theme.colors.warning },
  { id: 'advanced', color: theme.colors.error },
];

const STATUSES = ['in-progress', 'done', 'review'];

const TOOLBAR = [
  { label: '## Теория', insert: '\n## Теория\n\n' },
  { label: '💡 Заметки', insert: '\n## 💡 Заметки\n\n' },
  { label: '❓ Вопросы', insert: '\n## ❓ Вопросы\n\n' },
  { label: '🔗 Ссылка', insert: '\n## 🔗 Материалы\n- ' },
  { label: '- [ ]', insert: '- [ ] ' },
  { label: '**bold**', insert: '**текст**' },
  { label: '> цитата', insert: '\n> ' },
];

// ─── Editor Modal ─────────────────────────────────────────────────────────────

type EditorProps = {
  visible: boolean;
  initial: KnowledgeNote | null;
  onClose: () => void;
  onSaved: (note: KnowledgeNote) => void;
};

function KnowledgeEditor({ visible, initial, onClose, onSaved }: EditorProps) {
  const [topic, setTopic] = useState('');
  const [folder, setFolder] = useState('Other');
  const [level, setLevel] = useState('beginner');
  const [tags, setTags] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState('in-progress');
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [selection, setSelection] = useState({ start: 0, end: 0 });

  useEffect(() => {
    if (visible) {
      setTopic(initial?.topic ?? '');
      setFolder(initial?.folder ?? 'Other');
      setLevel(initial?.level ?? 'beginner');
      setTags(initial?.tags ?? '');
      setSourceUrl(initial?.sourceUrl ?? '');
      setBody(initial?.body ?? '');
      setStatus(initial?.status ?? 'in-progress');
      setImages(initial?.images ?? []);
      setToast('');
    }
  }, [visible, initial]);

  const insertSnippet = (snippet: string) => {
    const before = body.slice(0, selection.start);
    const after = body.slice(selection.end);
    setBody(before + snippet + after);
  };

  const pickImage = async (fromCamera: boolean) => {
    if (Platform.OS === 'web') {
      Alert.alert('Недоступно', 'Загрузка фото недоступна в веб-версии');
      return;
    }

    const { status: perm } = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (perm !== 'granted') {
      Alert.alert('Нужен доступ', fromCamera ? 'к камере' : 'к галерее');
      return;
    }

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ base64: false, quality: 0.7 })
      : await ImagePicker.launchImageLibraryAsync({ base64: false, quality: 0.7 });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    const filename = `knowledge_${Date.now()}.jpg`;
    const placeholder: ImageItem = { localUri: asset.uri, githubUrl: '', filename, uploading: true };

    setImages((prev) => [...prev, placeholder]);

    try {
      const b64 = await (FileSystem as any).readAsStringAsync(asset.uri, {
        encoding: 'base64' as const,
      });
      const githubUrl = await uploadImageToGitHub(b64, filename);
      setImages((prev) =>
        prev.map((img) => img.filename === filename ? { ...img, githubUrl, uploading: false } : img)
      );
    } catch {
      setImages((prev) => prev.filter((img) => img.filename !== filename));
      Alert.alert('Ошибка загрузки', 'Не удалось загрузить изображение');
    }
  };

  const showImagePicker = () => {
    Alert.alert('Добавить фото', '', [
      { text: '📷 Камера', onPress: () => pickImage(true) },
      { text: '🖼️ Галерея', onPress: () => pickImage(false) },
      { text: 'Отмена', style: 'cancel' },
    ]);
  };

  const removeImage = (filename: string) => {
    setImages((prev) => prev.filter((img) => img.filename !== filename));
  };

  const handleSave = async () => {
    if (!topic.trim()) { Alert.alert('Введи название темы'); return; }
    setIsSaving(true);
    try {
      await saveKnowledgeNote(
        topic, folder, level, tags, sourceUrl, status, body,
        images.filter((img) => img.githubUrl)
      );
      const note: KnowledgeNote = {
        id: initial?.id ?? Date.now(),
        topic, folder, level, tags, sourceUrl, status, body, images,
        createdAt: initial?.createdAt ?? new Date().toISOString(),
      };
      onSaved(note);
      setToast('📚 Сохранено в GitHub!');
      setTimeout(() => { setToast(''); onClose(); }, 1400);
    } catch (err: any) {
      Alert.alert('Ошибка', err?.message ?? 'Не удалось сохранить');
    } finally {
      setIsSaving(false);
    }
  };

  const folderColor = FOLDERS.find((f) => f.id === folder)?.color ?? theme.colors.textMuted;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          {/* Navbar */}
          <View style={styles.navbar}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.navCancel}>Отмена</Text>
            </TouchableOpacity>
            <Text style={styles.navTitle}>{initial ? 'Редактировать' : 'Новая тема'}</Text>
            <TouchableOpacity onPress={handleSave} disabled={isSaving}>
              {isSaving
                ? <ActivityIndicator color={theme.colors.primary} />
                : <Text style={styles.navSave}>Сохранить</Text>}
            </TouchableOpacity>
          </View>

          {toast ? <View style={styles.toastBar}><Text style={styles.toastText}>{toast}</Text></View> : null}

          <ScrollView contentContainerStyle={styles.editorScroll} keyboardShouldPersistTaps="handled">
            {/* Topic */}
            <TextInput
              style={styles.topicInput}
              value={topic}
              onChangeText={setTopic}
              placeholder="Название темы..."
              placeholderTextColor={theme.colors.textFaint}
            />

            {/* Folder */}
            <Text style={styles.fieldLabel}>📁 Папка:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
              {FOLDERS.map((f) => (
                <TouchableOpacity
                  key={f.id}
                  style={[styles.chip, folder === f.id
                    ? { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.primary }
                    : { backgroundColor: theme.colors.surface2, borderColor: theme.colors.border }]}
                  onPress={() => setFolder(f.id)}
                >
                  <Text style={[styles.chipText, { color: folder === f.id ? theme.colors.primary : theme.colors.textMuted }]}>
                    {f.emoji} {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Level */}
            <Text style={styles.fieldLabel}>📊 Уровень:</Text>
            <View style={styles.rowWrap}>
              {LEVELS.map((l) => (
                <TouchableOpacity
                  key={l.id}
                  style={[styles.chip,
                    level === l.id
                      ? { backgroundColor: `${l.color}22`, borderColor: l.color }
                      : { backgroundColor: theme.colors.surface2, borderColor: theme.colors.border }]}
                  onPress={() => setLevel(l.id)}
                >
                  <Text style={[styles.chipText, { color: level === l.id ? l.color : theme.colors.textMuted }]}>
                    {l.id}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Source */}
            <Text style={styles.fieldLabel}>🔗 Источник:</Text>
            <TextInput
              style={styles.input}
              value={sourceUrl}
              onChangeText={setSourceUrl}
              placeholder="🔗 Источник (URL)..."
              placeholderTextColor={theme.colors.textFaint}
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* Tags */}
            <Text style={styles.fieldLabel}>🏷 Теги:</Text>
            <TextInput
              style={styles.input}
              value={tags}
              onChangeText={setTags}
              placeholder="теги через запятую: java, oop"
              placeholderTextColor={theme.colors.textFaint}
              autoCapitalize="none"
            />

            {/* Images */}
            <Text style={styles.fieldLabel}>🖼️ Картинки</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesRow}>
              {images.map((img) => (
                <View key={img.filename} style={styles.imageWrapper}>
                  <Image source={{ uri: img.localUri }} style={styles.imageThumb} />
                  {img.uploading
                    ? <View style={styles.imageOverlay}><ActivityIndicator size="small" color="#fff" /></View>
                    : <View style={styles.imageCheckOverlay}><Text style={styles.imageCheck}>✓</Text></View>}
                  <TouchableOpacity style={styles.imageRemove} onPress={() => removeImage(img.filename)}>
                    <Text style={styles.imageRemoveText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={styles.addImageBtn} onPress={showImagePicker}>
                <Text style={styles.addImageText}>＋ Фото</Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Body */}
            <Text style={styles.fieldLabel}>📝 Заметка</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.toolbar}>
              {TOOLBAR.map((item) => (
                <TouchableOpacity key={item.label} style={styles.toolbarBtn} onPress={() => insertSnippet(item.insert)}>
                  <Text style={styles.toolbarBtnText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TextInput
              style={styles.bodyInput}
              value={body}
              onChangeText={setBody}
              onSelectionChange={(e) => setSelection(e.nativeEvent.selection)}
              placeholder="Пиши теорию здесь..."
              placeholderTextColor={theme.colors.textFaint}
              multiline
              textAlignVertical="top"
            />

            {/* Status */}
            <Text style={styles.fieldLabel}>📌 Статус:</Text>
            <View style={styles.rowWrap}>
              {STATUSES.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.chip,
                    status === s
                      ? { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.primary }
                      : { backgroundColor: theme.colors.surface2, borderColor: theme.colors.border }]}
                  onPress={() => setStatus(s)}
                >
                  <Text style={[styles.chipText, { color: status === s ? theme.colors.primary : theme.colors.textMuted }]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function KnowledgeScreen() {
  const [notes, setNotes] = useState<KnowledgeNote[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [editingNote, setEditingNote] = useState<KnowledgeNote | null>(null);

  useEffect(() => {
    if (Platform.OS === 'web') {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) setNotes(JSON.parse(raw));
      } catch { /* ignore */ }
      return;
    }
    try {
      const db = SQLite.openDatabaseSync('flowplanner.db');
      db.execSync('CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value TEXT)');
      const row = db.getFirstSync<{ value: string }>('SELECT value FROM kv WHERE key = ?', [STORAGE_KEY]);
      if (row?.value) setNotes(JSON.parse(row.value));
    } catch { /* ignore */ }
  }, []);

  const persistNotes = async (updated: KnowledgeNote[]) => {
    setNotes(updated);
    if (Platform.OS === 'web') {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
      return;
    }
    try {
      const db = SQLite.openDatabaseSync('flowplanner.db');
      db.execSync('CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value TEXT)');
      db.runSync('INSERT OR REPLACE INTO kv (key, value) VALUES (?, ?)', [STORAGE_KEY, JSON.stringify(updated)]);
    } catch { /* ignore */ }
  };

  const handleSaved = async (note: KnowledgeNote) => {
    const updated = editingNote
      ? notes.map((n) => n.id === editingNote.id ? note : n)
      : [...notes, note];
    await persistNotes(updated);
  };

  const handleDelete = (note: KnowledgeNote) => {
    Alert.alert('Удалить?', `"${note.topic}" будет удалена.`, [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Удалить', style: 'destructive', onPress: () => persistNotes(notes.filter((n) => n.id !== note.id)) },
    ]);
  };

  const openNew = () => { setEditingNote(null); setShowEditor(true); };
  const openEdit = (note: KnowledgeNote) => { setEditingNote(note); setShowEditor(true); };

  const folderInfo = (id: string) => FOLDERS.find((f) => f.id === id) ?? FOLDERS[4];

  const renderItem = ({ item }: { item: KnowledgeNote }) => {
    const fi = folderInfo(item.folder);
    const tagList = item.tags.split(',').map((t) => t.trim()).filter(Boolean);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => openEdit(item)}
        onLongPress={() => handleDelete(item)}
        activeOpacity={0.75}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTopic} numberOfLines={1}>{fi.emoji} {item.topic}</Text>
          <View style={[styles.statusDot, { backgroundColor: item.status === 'done' ? theme.colors.success : theme.colors.warning }]} />
        </View>

        <View style={styles.cardMeta}>
          <View style={[styles.folderChip, { backgroundColor: `${fi.color}22`, borderColor: fi.color }]}>
            <Text style={[styles.folderChipText, { color: fi.color }]}>{fi.label}</Text>
          </View>
          {tagList.slice(0, 3).map((tag) => (
            <View key={tag} style={styles.tagChip}>
              <Text style={styles.tagChipText}>{tag}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.cardDate}>{item.createdAt.split('T')[0]}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>📚 База знаний</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openNew}>
          <Text style={styles.addBtnText}>＋</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notes}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={notes.length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📚</Text>
            <Text style={styles.emptyText}>Нет заметок. Нажми ＋ чтобы добавить.</Text>
          </View>
        }
      />

      <KnowledgeEditor
        visible={showEditor}
        initial={editingNote}
        onClose={() => setShowEditor(false)}
        onSaved={async (note) => { await handleSaved(note); }}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: theme.colors.bg },

  // Screen header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  heading: { color: theme.colors.text, fontSize: theme.typography.h1, fontWeight: '700' },
  addBtn: {
    width: 36, height: 36, borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  addBtnText: { color: '#fff', fontSize: 22, lineHeight: 26 },

  // List
  list: { padding: theme.spacing.lg, paddingTop: 0 },
  emptyContainer: { flex: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 80 },
  emptyEmoji: { fontSize: 48, marginBottom: theme.spacing.md },
  emptyText: { color: theme.colors.textMuted, fontSize: theme.typography.body, textAlign: 'center' },

  // Card
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.card,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.sm },
  cardTopic: { color: theme.colors.text, fontSize: theme.typography.h3, fontWeight: '700', flex: 1, marginRight: 8 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  cardMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: theme.spacing.sm },
  folderChip: { borderRadius: theme.radius.full, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
  folderChipText: { fontSize: theme.typography.tiny, fontWeight: '600' },
  tagChip: { backgroundColor: theme.colors.surface2, borderRadius: theme.radius.full, paddingHorizontal: 8, paddingVertical: 3 },
  tagChipText: { color: theme.colors.textMuted, fontSize: theme.typography.tiny },
  cardDate: { color: theme.colors.textFaint, fontSize: theme.typography.tiny },

  // Editor modal
  navbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: theme.spacing.lg, borderBottomWidth: 1, borderBottomColor: theme.colors.border,
  },
  navCancel: { color: theme.colors.textMuted, fontSize: theme.typography.body },
  navTitle: { color: theme.colors.text, fontSize: theme.typography.body, fontWeight: '700' },
  navSave: { color: theme.colors.primary, fontSize: theme.typography.body, fontWeight: '700' },

  toastBar: { backgroundColor: theme.colors.primaryLight, padding: theme.spacing.sm, alignItems: 'center' },
  toastText: { color: theme.colors.primary, fontSize: theme.typography.small, fontWeight: '600' },

  editorScroll: { padding: theme.spacing.lg, paddingBottom: 48 },

  topicInput: {
    color: theme.colors.text, fontSize: theme.typography.h2, fontWeight: '700',
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
    paddingBottom: theme.spacing.sm, marginBottom: theme.spacing.lg,
  },
  fieldLabel: {
    color: theme.colors.textMuted, fontSize: theme.typography.small,
    fontWeight: '600', marginBottom: theme.spacing.sm, marginTop: theme.spacing.md,
  },
  chipsScroll: { marginBottom: theme.spacing.sm },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: theme.spacing.sm },
  chip: { borderRadius: theme.radius.full, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8 },
  chipText: { fontSize: theme.typography.small },

  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1, borderColor: theme.colors.border,
    borderRadius: theme.radius.md, padding: theme.spacing.md,
    color: theme.colors.text, fontSize: theme.typography.body,
    marginBottom: theme.spacing.sm,
  },

  // Images
  imagesRow: { marginBottom: theme.spacing.sm },
  imageWrapper: { width: 80, height: 80, marginRight: 8, position: 'relative' },
  imageThumb: { width: 80, height: 80, borderRadius: theme.radius.md },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject, borderRadius: theme.radius.md,
    backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center',
  },
  imageCheckOverlay: {
    position: 'absolute', bottom: 2, right: 2, width: 18, height: 18,
    borderRadius: 9, backgroundColor: theme.colors.success,
    alignItems: 'center', justifyContent: 'center',
  },
  imageCheck: { color: '#fff', fontSize: 10, fontWeight: '700' },
  imageRemove: {
    position: 'absolute', top: 2, right: 2, width: 18, height: 18,
    borderRadius: 9, backgroundColor: theme.colors.error,
    alignItems: 'center', justifyContent: 'center',
  },
  imageRemoveText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  addImageBtn: {
    width: 80, height: 80, borderRadius: theme.radius.md,
    borderWidth: 1, borderColor: theme.colors.border, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surface2,
  },
  addImageText: { color: theme.colors.textMuted, fontSize: theme.typography.tiny, textAlign: 'center' },

  // Toolbar + body
  toolbar: { marginBottom: theme.spacing.sm },
  toolbarBtn: {
    backgroundColor: theme.colors.surface2, borderRadius: theme.radius.sm,
    paddingHorizontal: 10, paddingVertical: 6, marginRight: 6,
  },
  toolbarBtnText: { color: theme.colors.textMuted, fontSize: theme.typography.tiny, fontWeight: '600' },
  bodyInput: {
    backgroundColor: theme.colors.surface2, borderRadius: theme.radius.md,
    padding: theme.spacing.md, color: theme.colors.text,
    fontSize: theme.typography.small, minHeight: 200, textAlignVertical: 'top',
    // @ts-ignore
    fontFamily: 'monospace',
  },
});