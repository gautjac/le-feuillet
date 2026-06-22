import Dexie, { type Table } from "dexie";

// ── Le Feuillet — local-first store (IndexedDB via Dexie) ─────────────────────
// A "feuillet" is a leaf/sheet of paper. Each post is one feuillet. Publishing
// renders a feuillet to a self-contained HTML page stored alongside it.

export interface Post {
  id: string;
  title: string;
  // TipTap/ProseMirror JSON document. Stored as JSON so it round-trips losslessly.
  doc: unknown;
  // Plain-text mirror, kept for the command palette search + word count.
  text: string;
  words: number;
  createdAt: number;
  updatedAt: number;
}

export interface Published {
  id: string; // same id as the post it was rendered from
  postId: string;
  title: string;
  html: string; // fully self-contained standalone HTML document
  excerpt: string;
  words: number;
  readingMinutes: number;
  publishedAt: number;
}

class FeuilletDB extends Dexie {
  posts!: Table<Post, string>;
  published!: Table<Published, string>;

  constructor() {
    super("le-feuillet");
    this.version(1).stores({
      posts: "id, updatedAt, createdAt, title",
      published: "id, postId, publishedAt, title",
    });
  }
}

export const db = new FeuilletDB();

export function newId(): string {
  return (
    Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8)
  );
}

const EMPTY_DOC = { type: "doc", content: [{ type: "paragraph" }] };

export async function createPost(title = ""): Promise<Post> {
  const now = Date.now();
  const post: Post = {
    id: newId(),
    title,
    doc: EMPTY_DOC,
    text: "",
    words: 0,
    createdAt: now,
    updatedAt: now,
  };
  await db.posts.add(post);
  return post;
}

export async function savePost(
  id: string,
  patch: Partial<Pick<Post, "title" | "doc" | "text" | "words">>,
): Promise<void> {
  await db.posts.update(id, { ...patch, updatedAt: Date.now() });
}

export async function deletePost(id: string): Promise<void> {
  await db.transaction("rw", db.posts, db.published, async () => {
    await db.posts.delete(id);
    await db.published.delete(id);
  });
}

export async function renamePost(id: string, title: string): Promise<void> {
  await db.posts.update(id, { title, updatedAt: Date.now() });
}
