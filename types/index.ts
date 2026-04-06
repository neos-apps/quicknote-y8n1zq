export interface Tag {
  id: string;
  name: string;
  color?: string;
  createdAt: string;
}

export interface Folder {
  id: string;
  name: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  folderId?: string;
  tagIds: string[];
  createdAt: string;
  updatedAt: string;
}
