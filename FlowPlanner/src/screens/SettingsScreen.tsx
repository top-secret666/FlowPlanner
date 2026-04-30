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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getScreenPadding } from '../constants/layout';
import { useSettingsStore } from '../store/settingsStore';
import { setupVault } from '../scripts/setupVault';
import { theme } from '../theme/theme';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const store = useSettingsStore;
  const current = store.getState();

  const [token, setToken] = useState(current.token);
  const [owner, setOwner] = useState(current.owner);
  const [repo, setRepo] = useState(current.repo);
  const [branch, setBranch] = useState(current.branch);
  const [folderPath, setFolderPath] = useState(current.folderPath);
  const [dailyPath, setDailyPath] = useState(current.dailyPath);
  const [interviewDate, setInterviewDate] = useState(current.interviewDate);

  const [saveMsg, setSaveMsg] = useState('');
  const [vaultLoading, setVaultLoading] = useState(false);
  const [vaultMsg, setVaultMsg] = useState<{ text: string; ok: boolean } | null>(null);

  function handleSave() {
    store.setState({ token, owner, repo, branch, folderPath, dailyPath, interviewDate });
    setSaveMsg('Saved ✓');
    setTimeout(() => setSaveMsg(''), 2000);
  }

  async function handleSetupVault() {
    store.setState({ token, owner, repo, branch, folderPath, dailyPath, interviewDate });
    setVaultLoading(true);
    setVaultMsg(null);
    try {
      const result = await setupVault();
      setVaultMsg({
        text: `✅ Vault setup complete! ${result.success} files pushed.${result.failed.length > 0 ? ` ${result.failed.length} failed.` : ''}`,
        ok: result.failed.length === 0,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setVaultMsg({ text: `❌ ${msg}`, ok: false });
    } finally {
      setVaultLoading(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, getScreenPadding(insets.bottom)]}
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
          style={styles.input}
          value={folderPath}
          onChangeText={setFolderPath}
          placeholder="notes"
          placeholderTextColor={theme.colors.textFaint}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.fieldLabel}>Daily Notes Path</Text>
        <TextInput
          style={[styles.input, styles.inputLast]}
          value={dailyPath}
          onChangeText={setDailyPath}
          placeholder="DAILY/daily-notes"
          placeholderTextColor={theme.colors.textFaint}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* Card 3 – Стажировка */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🎯 Стажировка</Text>

        <Text style={styles.fieldLabel}>Дата стажировки (YYYY-MM-DD)</Text>
        <TextInput
          style={[styles.input, styles.inputLast]}
          value={interviewDate}
          onChangeText={setInterviewDate}
          placeholder="2026-06-01"
          placeholderTextColor={theme.colors.textFaint}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>{saveMsg || 'Save Settings'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.vaultButton, vaultLoading && styles.buttonDisabled]}
        onPress={handleSetupVault}
        disabled={vaultLoading}
      >
        {vaultLoading ? (
          <ActivityIndicator color={theme.colors.textMuted} size="small" />
        ) : (
          <Text style={styles.vaultButtonText}>🔧 Setup Obsidian Vault</Text>
        )}
      </TouchableOpacity>

      {vaultMsg ? (
        <Text style={[styles.statusText, { color: vaultMsg.ok ? theme.colors.success : theme.colors.error }]}>
          {vaultMsg.text}
        </Text>
      ) : null}
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
    paddingBottom: 40,
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
  vaultButton: {
    backgroundColor: theme.colors.surface2,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  vaultButtonText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    fontWeight: '600',
  },
  statusText: {
    fontSize: theme.typography.small,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
});