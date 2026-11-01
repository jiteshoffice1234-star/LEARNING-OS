import { readValue, writeValue, formatBytes } from './storage';
import { getSupabase, STORAGE_BUCKET, isSupabaseConfigured } from './supabase';

/**
 * File storage for uploaded documents/images (PDF, JPEG, PNG …).
 *
 * Two modes:
 *  - Supabase configured → the file bytes go to the `vault` Storage bucket and
 *    we keep only a public URL. Works across devices and survives cache clears.
 *  - Not configured → the file is kept as a base64 data URL in localStorage so
 *    uploads still work offline. Capped at ~1.5 MB because localStorage is ~5 MB.
 *
 * Metadata (name/size/type/url) always lives in localStorage under the app
 * namespace, so it's included in Backup Center exports and the Danger Zone wipe.
 */

export interface StoredFile {
  id: string;
  name: string;
  /** MIME type, e.g. application/pdf */
  type: string;
  /** Size in bytes. */
  size: number;
  /** Public URL (Supabase) or a base64 data URL (local fallback). */
  url: string;
  /** Object path inside the bucket — only set for Supabase uploads. */
  path?: string;
  origin: 'supabase' | 'local';
  createdAt: string;
}

const FILES_KEY = 'files';

/** localStorage can hold ~5 MB total; leave headroom for the rest of the app. */
const LOCAL_MAX_BYTES = 1_500_000;

export function listFiles(): StoredFile[] {
  return readValue<StoredFile[]>(FILES_KEY, []);
}

function saveFiles(files: StoredFile[]) {
  writeValue(FILES_KEY, files);
}

function sanitizedName(name: string) {
  return name.replace(/[^\w.\-]+/g, '_').slice(-80);
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Could not read the file.'));
    reader.readAsDataURL(file);
  });
}

export type UploadResult =
  | { ok: true; file: StoredFile }
  | { ok: false; error: string };

/** Upload one file and record its metadata. Never throws — returns a result. */
export async function uploadFile(file: File): Promise<UploadResult> {
  if (!file || file.size === 0) {
    return { ok: false, error: 'That file is empty.' };
  }

  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const supabase = getSupabase();

  if (supabase) {
    const path = `${id}-${sanitizedName(file.name)}`;
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });

    if (error) {
      // Most commonly: the `vault` bucket hasn't been created yet.
      const hint =
        /bucket|not found|404/i.test(error.message)
          ? ` Create a public bucket named "${STORAGE_BUCKET}" in Supabase → Storage, then try again.`
          : '';
      return { ok: false, error: `Upload failed: ${error.message}.${hint}` };
    }

    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    const record: StoredFile = {
      id,
      name: file.name,
      type: file.type || 'application/octet-stream',
      size: file.size,
      url: data.publicUrl,
      path,
      origin: 'supabase',
      createdAt: new Date().toISOString(),
    };
    saveFiles([record, ...listFiles()]);
    return { ok: true, file: record };
  }

  // Local fallback.
  if (file.size > LOCAL_MAX_BYTES) {
    return {
      ok: false,
      error: `"${file.name}" is ${formatBytes(file.size)}. Without Supabase connected, files must be under ${formatBytes(LOCAL_MAX_BYTES)}. Add your Supabase keys to store larger files.`,
    };
  }
  const dataUrl = await readFileAsDataUrl(file);
  const record: StoredFile = {
    id,
    name: file.name,
    type: file.type || 'application/octet-stream',
    size: file.size,
    url: dataUrl,
    origin: 'local',
    createdAt: new Date().toISOString(),
  };
  saveFiles([record, ...listFiles()]);
  return { ok: true, file: record };
}

/** Delete a file from Supabase (when used) and drop its metadata. */
export async function removeFile(id: string): Promise<void> {
  const files = listFiles();
  const target = files.find((f) => f.id === id);
  const supabase = getSupabase();

  if (supabase && target?.path) {
    await supabase.storage.from(STORAGE_BUCKET).remove([target.path]);
  }
  saveFiles(files.filter((f) => f.id !== id));
}

export { isSupabaseConfigured };
