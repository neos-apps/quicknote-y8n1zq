import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Note } from './types';
import { storage } from './utils/storage';

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function seed() {
      const existing = await storage.notes.getAll();
      if (existing.length === 0) {
        const folder = await storage.folders.create({ name: 'Personal', color: '#4A90D9' });
        const tag = await storage.tags.create({ name: 'important', color: '#E74C3C' });
        await storage.notes.create({
          title: 'Welcome to QuickNote',
          content: 'Start writing your notes here.',
          folderId: folder.id,
          tagIds: [tag.id],
        });
      }
      setNotes(await storage.notes.getAll());
      setReady(true);
    }
    seed();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>QuickNote</Text>
      {!ready ? (
        <ActivityIndicator size="large" color="#4A90D9" />
      ) : (
        <Text style={styles.subtitle}>
          {notes.length} note{notes.length !== 1 ? 's' : ''} stored locally
        </Text>
      )}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});
