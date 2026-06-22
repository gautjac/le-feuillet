import type { Editor } from "@tiptap/react";

export function countWords(text: string): number {
  const m = text.trim().match(/\S+/g);
  return m ? m.length : 0;
}

export function readingMinutes(words: number): number {
  return Math.max(1, Math.round(words / 220));
}

// Read an image File into a base64 data URL (so it stores in Dexie and inlines
// into the published HTML with no external dependency).
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("read failed"));
    reader.readAsDataURL(file);
  });
}

export async function insertImageFromFile(
  editor: Editor,
  file: File,
): Promise<void> {
  if (!file.type.startsWith("image/")) return;
  const src = await fileToDataUrl(file);
  editor.chain().focus().setImage({ src }).run();
}

export function pickAndInsertImage(editor: Editor): void {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = () => {
    const file = input.files?.[0];
    if (file) void insertImageFromFile(editor, file);
  };
  input.click();
}
