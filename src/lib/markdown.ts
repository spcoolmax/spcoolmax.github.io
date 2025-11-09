import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const contentDirectory = path.join(process.cwd(), 'content');

export interface NoteMetadata {
  title: string;
  category: string;
  tags?: string[];
  date: string;
}

export interface Note {
  slug: string;
  metadata: NoteMetadata;
  content: string;
}

export interface PhotographMetadata {
  title: string;
  date: string;
}

export interface Photograph {
  slug: string;
  metadata: PhotographMetadata;
  content: string;
}

// 获取所有笔记
export function getAllNotes(): Note[] {
  const notesDirectory = path.join(contentDirectory, 'notes');
  const notes: Note[] = [];

  function readNotesRecursively(dir: string, basePath: string = '') {
    const items = fs.readdirSync(dir);

    items.forEach((item) => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        readNotesRecursively(fullPath, path.join(basePath, item));
      } else if (item.endsWith('.md')) {
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);
        const rel = path
          .relative(notesDirectory, fullPath)
          .replace(/\.md$/, '');
        const slug = rel.split(path.sep).join('/');

        notes.push({
          slug,
          metadata: data as NoteMetadata,
          content,
        });
      }
    });
  }

  if (fs.existsSync(notesDirectory)) {
    readNotesRecursively(notesDirectory);
  }

  return notes.sort((a, b) => {
    return new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime();
  });
}

// 根据slug获取笔记
export function getNoteBySlug(slug: string[]): Note | null {
  const fullPath = path.join(contentDirectory, 'notes', ...slug) + '.md';

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  return {
    slug: slug.join('/'),
    metadata: data as NoteMetadata,
    content,
  };
}

// 根据分类获取笔记
export function getNotesByCategory(category: string): Note[] {
  const allNotes = getAllNotes();
  return allNotes.filter((note) => note.metadata.category === category);
}

// 获取所有照片相册
export function getAllPhotographs(): Photograph[] {
  const photographsDirectory = path.join(contentDirectory, 'photographs');
  const photographs: Photograph[] = [];

  if (!fs.existsSync(photographsDirectory)) {
    return photographs;
  }

  function readPhotosRecursively(dir: string) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        readPhotosRecursively(fullPath);
      } else if (item.endsWith('.md')) {
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);
        const rel = path.relative(photographsDirectory, fullPath).replace(/\.md$/, '');
        const slug = rel.split(path.sep).join('/');
        photographs.push({
          slug,
          metadata: data as PhotographMetadata,
          content,
        });
      }
    }
  }

  readPhotosRecursively(photographsDirectory);

  return photographs.sort((a, b) => {
    return new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime();
  });
}

// 根据slug获取照片相册
export function getPhotographBySlug(slug: string): Photograph | null {
  const fullPath = path.join(contentDirectory, 'photographs', `${slug}.md`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  return {
    slug,
    metadata: data as PhotographMetadata,
    content,
  };
}

// 获取所有笔记分类
export function getAllCategories(): string[] {
  const notesDirectory = path.join(contentDirectory, 'notes');

  if (!fs.existsSync(notesDirectory)) {
    return [];
  }

  const categories = fs.readdirSync(notesDirectory).filter((item) => {
    return fs.statSync(path.join(notesDirectory, item)).isDirectory();
  });

  return categories;
}
