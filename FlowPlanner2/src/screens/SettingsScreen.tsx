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
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>GitHub Token</Text>
      <TextInput
        style={styles.input}
        value={token}
        onChangeText={setToken}
        placeholder="ghp_xxxxxxxxxxxx"
        placeholderTextColor="#6b7280"
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Text style={styles.label}>Owner (username)</Text>
      <TextInput
        style={styles.input}
        value={owner}
        onChangeText={setOwner}
        placeholder="github-username"
        placeholderTextColor="#6b7280"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Text style={styles.label}>Repository</Text>
      <TextInput
        style={styles.input}
        value={repo}
        onChangeText={setRepo}
        placeholder="my-obsidian-vault"
        placeholderTextColor="#6b7280"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Text style={styles.label}>Branch</Text>
      <TextInput
        style={styles.input}
        value={branch}
        onChangeText={setBranch}
        placeholder="main"
        placeholderTextColor="#6b7280"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Text style={styles.label}>Folder Path</Text>
      <TextInput
        style={styles.input}
        value={folderPath}
        onChangeText={setFolderPath}
        placeholder="notes"
        placeholderTextColor="#6b7280"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>{saved ? 'Saved ✓' : 'Save Settings'}</Text>
      </TouchableOpacity>
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
  input: {
    backgroundColor: '#1f2937',
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#0d9488',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});