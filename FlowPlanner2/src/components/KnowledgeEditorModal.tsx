import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  StyleSheet,
} from 'react-native';
import { theme } from '../theme/theme';
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
import NewKnowledgeModal from './NewKnowledgeModal';

type Props = {
  visible: boolean;
  entry: KnowledgeEntry;
  onClose: () => void;
  onSaved: (entry: KnowledgeEntry) => void;
  onDeleted: (id: string) => void;
};

const LEVEL_COLORS: Record<string, string> = {
  beginner: '#22c55e',
  intermediate: '#fbbf24',
  advanced: '#f87171',
};

export default function KnowledgeEditorModal({ visible, entry, onClose, onSaved, onDeleted }: Props) {
  const [showEdit, setShowEdit] = useState(false);

  const handleDelete = () => {
    Alert.alert(
      'Удалить запись?',
      `"${entry.topic}" будет удалена из базы знаний.`,
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Удалить', style: 'destructive', onPress: () => onDeleted(entry.id) },
      ]
    );
  };

  return (
    <>
      <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
        <View style={styles.container}>
          {/* Nav bar */}
          <View style={styles.navbar}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.navBack}>← Назад</Text>
            </TouchableOpacity>
            <View style={styles.navActions}>
              <TouchableOpacity style={styles.editBtn} onPress={() => setShowEdit(true)}>
                <Text style={styles.editBtnText}>✏️ Изменить</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                <Text style={styles.deleteBtnText}>🗑</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.scroll}>
            {/* Topic */}
            <Text style={styles.topic}>{entry.topic}</Text>

            {/* Meta row */}
            <View style={styles.metaRow}>
              <View style={[styles.levelBadge, { borderColor: LEVEL_COLORS[entry.level] }]}>
                <Text style={[styles.levelText, { color: LEVEL_COLORS[entry.level] }]}>{entry.level}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: entry.status === 'done' ? 'rgba(34,197,94,0.15)' : 'rgba(251,191,36,0.15)' }]}>
                <View style={[styles.statusDot, { backgroundColor: entry.status === 'done' ? theme.colors.success : theme.colors.warning }]} />
                <Text style={[styles.statusText, { color: entry.status === 'done' ? theme.colors.success : theme.colors.warning }]}>
                  {entry.status === 'done' ? 'Готово' : 'В процессе'}
                </Text>
              </View>
              <Text style={styles.dateText}>{entry.created}</Text>
            </View>

            {/* Tags */}
            {entry.tags.length > 0 && (
              <View style={styles.tagsRow}>
                {entry.tags.map((tag: string) => (
                  <View key={tag} style={styles.tagChip}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Source */}
            {!!entry.sourceUrl && (
              <View style={styles.sourceBox}>
                <Text style={styles.sourceLabel}>🔗 Источник</Text>
                <Text style={styles.sourceUrl} numberOfLines={1}>{entry.sourceUrl}</Text>
              </View>
            )}

            {/* Divider */}
            <View style={styles.divider} />

            {/* Body */}
            <Text style={styles.body}>{entry.body || '_(нет содержимого)_'}</Text>
          </ScrollView>
        </View>
      </Modal>

      {showEdit && (
        <NewKnowledgeModal
          visible={showEdit}
          initialEntry={entry}
          onClose={() => setShowEdit(false)}
          onSaved={(updated) => {
            onSaved(updated);
            setShowEdit(false);
          }}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
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
  navBack: {
    color: theme.colors.primary,
    fontSize: theme.typography.body,
    fontWeight: '600',
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editBtn: {
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.md,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editBtnText: {
    color: theme.colors.primary,
    fontSize: theme.typography.small,
    fontWeight: '600',
  },
  deleteBtn: {
    backgroundColor: 'rgba(248,113,113,0.15)',
    borderRadius: theme.radius.md,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  deleteBtnText: {
    fontSize: theme.typography.small,
  },
  scroll: {
    padding: theme.spacing.lg,
    paddingBottom: 40,
  },
  topic: {
    color: theme.colors.text,
    fontSize: theme.typography.hero,
    fontWeight: '700',
    marginBottom: theme.spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: theme.spacing.md,
    flexWrap: 'wrap',
  },
  levelBadge: {
    borderRadius: theme.radius.full,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  levelText: {
    fontSize: theme.typography.tiny,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: theme.typography.tiny,
    fontWeight: '600',
  },
  dateText: {
    color: theme.colors.textFaint,
    fontSize: theme.typography.tiny,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: theme.spacing.md,
  },
  tagChip: {
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    color: theme.colors.primary,
    fontSize: theme.typography.tiny,
    fontWeight: '600',
  },
  sourceBox: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sourceLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.tiny,
    marginBottom: 2,
  },
  sourceUrl: {
    color: theme.colors.primary,
    fontSize: theme.typography.small,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.lg,
  },
  body: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    lineHeight: 24,
    fontFamily: 'monospace',
  },
});