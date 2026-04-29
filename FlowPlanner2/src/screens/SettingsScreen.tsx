import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useSettingsStore } from '../store/settingsStore';
import { theme } from '../theme/theme';

export default function SettingsScreen() {
  const {
    token, owner, repo, branch, folderPath,
    setToken, setOwner, setRepo, setBranch, setFolderPath,
  } = useSettingsStore();

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.heading}>Settings</Text>
      <Text style={styles.subtitle}>Configure your Obsidian sync</Text>

      {/* Card 1 – GitHub Access */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>GitHub Access</Text>

        <Text style={styles.fieldLabel}>Token</Text>
        <TextInput
          style={styles.input}
          value={token}
          onChangeText={setToken}
          placeholder="ghp_xxxxxxxxxxxx"
          placeholderTextColor={theme.colors.textFaint}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.fieldLabel}>Owner (username)</Text>
        <TextInput
          style={[styles.input, styles.inputLast]}
          value={owner}
          onChangeText={setOwner}
          placeholder="github-username"
          placeholderTextColor={theme.colors.textFaint}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* Card 2 – Repository */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Repository</Text>

        <Text style={styles.fieldLabel}>Repository</Text>
        <TextInput
          style={styles.input}
          value={repo}
          onChangeText={setRepo}
          placeholder="my-obsidian-vault"
          placeholderTextColor={theme.colors.textFaint}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.fieldLabel}>Branch</Text>
        <TextInput
          style={styles.input}
          value={branch}
          onChangeText={setBranch}
          placeholder="main"
          placeholderTextColor={theme.colors.textFaint}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.fieldLabel}>Folder Path</Text>
        <TextInput
          style={[styles.input, styles.inputLast]}
          value={folderPath}
          onChangeText={setFolderPath}
          placeholder="notes"
          placeholderTextColor={theme.colors.textFaint}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>{saved ? 'Saved ✓' : 'Save Settings'}</Text>
      </TouchableOpacity>
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
  heading: {
    color: theme.colors.text,
    fontSize: theme.typography.hero,
    fontWeight: '700',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    marginBottom: theme.spacing.xl,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.card,
  },
  cardTitle: {
    fontSize: theme.typography.small,
    fontWeight: '600',
    color: theme.colors.primary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.md,
  },
  fieldLabel: {
    fontSize: theme.typography.small,
    color: theme.colors.textMuted,
    fontWeight: '500',
    marginBottom: 4,
  },
  input: {
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    color: theme.colors.text,
    fontSize: theme.typography.body,
    marginBottom: theme.spacing.md,
  },
  inputLast: {
    marginBottom: 0,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  buttonText: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
});