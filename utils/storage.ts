import AsyncStorage from '@react-native-async-storage/async-storage';
import { Folder, Note, Tag } from '../types';

const KEYS = {
  NOTES: 'quicknote:notes',
  FOLDERS: 'quicknote:folders',
  TAGS: 'quicknote:tags',
} as const;

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function now(): string {
  return new Date().toISOString();
}

// ─── Notes ───────────────────────────────────────────────────────────────────

async function getNotes(): Promise<Note[]> {
  const raw = await AsyncStorage.getItem(KEYS.NOTES);
  return raw ? (JSON.parse(raw) as Note[]) : [];
}

async function getNoteById(id: string): Promise<Note | undefined> {
  const notes = await getNotes();
  return notes.find((n) => n.id === id);
}

async function createNote(
  data: Pick<Note, 'title' | 'content'> & Partial<Pick<Note, 'folderId' | 'tagIds'>>
): Promise<Note> {
  const notes = await getNotes();
  const note: Note = {
    id: generateId(),
    title: data.title,
    content: data.content,
    folderId: data.folderId,
    tagIds: data.tagIds ?? [],
    createdAt: now(),
    updatedAt: now(),
  };
  await AsyncStorage.setItem(KEYS.NOTES, JSON.stringify([...notes, note]));
  return note;
}

async function updateNote(
  id: string,
  data: Partial<Pick<Note, 'title' | 'content' | 'folderId' | 'tagIds'>>
): Promise<Note | undefined> {
  const notes = await getNotes();
  const index = notes.findIndex((n) => n.id === id);
  if (index === -1) return undefined;
  const updated: Note = { ...notes[index], ...data, updatedAt: now() };
  notes[index] = updated;
  await AsyncStorage.setItem(KEYS.NOTES, JSON.stringify(notes));
  return updated;
}

async function deleteNote(id: string): Promise<void> {
  const notes = await getNotes();
  await AsyncStorage.setItem(
    KEYS.NOTES,
    JSON.stringify(notes.filter((n) => n.id !== id))
  );
}

// ─── Folders ─────────────────────────────────────────────────────────────────

async function getFolders(): Promise<Folder[]> {
  const raw = await AsyncStorage.getItem(KEYS.FOLDERS);
  return raw ? (JSON.parse(raw) as Folder[]) : [];
}

async function getFolderById(id: string): Promise<Folder | undefined> {
  const folders = await getFolders();
  return folders.find((f) => f.id === id);
}

async function createFolder(
  data: Pick<Folder, 'name'> & Partial<Pick<Folder, 'color'>>
): Promise<Folder> {
  const folders = await getFolders();
  const folder: Folder = {
    id: generateId(),
    name: data.name,
    color: data.color,
    createdAt: now(),
    updatedAt: now(),
  };
  await AsyncStorage.setItem(KEYS.FOLDERS, JSON.stringify([...folders, folder]));
  return folder;
}

async function updateFolder(
  id: string,
  data: Partial<Pick<Folder, 'name' | 'color'>>
): Promise<Folder | undefined> {
  const folders = await getFolders();
  const index = folders.findIndex((f) => f.id === id);
  if (index === -1) return undefined;
  const updated: Folder = { ...folders[index], ...data, updatedAt: now() };
  folders[index] = updated;
  await AsyncStorage.setItem(KEYS.FOLDERS, JSON.stringify(folders));
  return updated;
}

async function deleteFolder(id: string): Promise<void> {
  const folders = await getFolders();
  await AsyncStorage.setItem(
    KEYS.FOLDERS,
    JSON.stringify(folders.filter((f) => f.id !== id))
  );
  // Remove folder reference from notes
  const notes = await getNotes();
  const updated = notes.map((n) =>
    n.folderId === id ? { ...n, folderId: undefined, updatedAt: now() } : n
  );
  await AsyncStorage.setItem(KEYS.NOTES, JSON.stringify(updated));
}

// ─── Tags ─────────────────────────────────────────────────────────────────────

async function getTags(): Promise<Tag[]> {
  const raw = await AsyncStorage.getItem(KEYS.TAGS);
  return raw ? (JSON.parse(raw) as Tag[]) : [];
}

async function getTagById(id: string): Promise<Tag | undefined> {
  const tags = await getTags();
  return tags.find((t) => t.id === id);
}

async function createTag(
  data: Pick<Tag, 'name'> & Partial<Pick<Tag, 'color'>>
): Promise<Tag> {
  const tags = await getTags();
  const tag: Tag = {
    id: generateId(),
    name: data.name,
    color: data.color,
    createdAt: now(),
    updatedAt: now(),
  };
  await AsyncStorage.setItem(KEYS.TAGS, JSON.stringify([...tags, tag]));
  return tag;
}

async function updateTag(
  id: string,
  data: Partial<Pick<Tag, 'name' | 'color'>>
): Promise<Tag | undefined> {
  const tags = await getTags();
  const index = tags.findIndex((t) => t.id === id);
  if (index === -1) return undefined;
  const updated: Tag = { ...tags[index], ...data, updatedAt: now() };
  tags[index] = updated;
  await AsyncStorage.setItem(KEYS.TAGS, JSON.stringify(tags));
  return updated;
}

async function deleteTag(id: string): Promise<void> {
  const tags = await getTags();
  await AsyncStorage.setItem(
    KEYS.TAGS,
    JSON.stringify(tags.filter((t) => t.id !== id))
  );
  // Remove tag reference from notes
  const notes = await getNotes();
  const updated = notes.map((n) =>
    n.tagIds.includes(id)
      ? { ...n, tagIds: n.tagIds.filter((tid) => tid !== id), updatedAt: now() }
      : n
  );
  await AsyncStorage.setItem(KEYS.NOTES, JSON.stringify(updated));
}

export const storage = {
  notes: { getAll: getNotes, getById: getNoteById, create: createNote, update: updateNote, delete: deleteNote },
  folders: { getAll: getFolders, getById: getFolderById, create: createFolder, update: updateFolder, delete: deleteFolder },
  tags: { getAll: getTags, getById: getTagById, create: createTag, update: updateTag, delete: deleteTag },
};
