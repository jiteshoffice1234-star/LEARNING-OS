import { useEffect, useCallback, useRef, useSyncExternalStore } from 'react';

/**
 * LEARNING OS — local persistence layer
 * --------------------------------------
 * Offline-first. All data lives in browser localStorage. No network, no accounts.
 *
 * Every module gets its own key under the LEARNING_OS namespace so that:
 *   - data survives refresh and navigation
 *   - a corrupted/missing key only affects that module
 *   - export/import can serialize the whole namespace as one JSON blob
 */

export const STORAGE_PREFIX = 'learningos:v1:';
export const SCHEMA_VERSION = 1;

/** localStorage is unavailable in some privacy modes. Fall back to memory. */
function getStorage(): Storage | null {
  try {
    const s = window.localStorage;
    const probe = `${STORAGE_PREFIX}__probe`;
    s.setItem(probe, '1');
    s.removeItem(probe);
    return s;
  } catch {
    return null;
  }
}

const memStore = new Map<string, string>();
const storage = typeof window === 'undefined' ? null : getStorage();

/** In-memory subscribers, keyed by full storage key. */
const listeners = new Map<string, Set<() => void>>();

/**
 * Parsed-value cache. `useSyncExternalStore` compares snapshots by reference,
 * so we must return the SAME object until the underlying string actually
 * changes. Re-parsing JSON on every render would loop forever.
 */
const parsedCache = new Map<string, { raw: string; value: unknown }>();

function fullKey(key: string) {
  return `${STORAGE_PREFIX}${key}`;
}

function emit(key: string) {
  const set = listeners.get(fullKey(key));
  if (set) set.forEach((fn) => fn());
}

function rawRead(full: string): string | null {
  if (storage) {
    try {
      return storage.getItem(full);
    } catch {
      /* fall through to memory */
    }
  }
  return memStore.has(full) ? (memStore.get(full) as string) : null;
}

function rawWrite(full: string, value: string) {
  if (storage) {
    try {
      storage.setItem(full, value);
    } catch {
      memStore.set(full, value);
    }
  } else {
    memStore.set(full, value);
  }
}

/** Subscribe a component to a specific key. */
function subscribe(key: string, cb: () => void) {
  const full = fullKey(key);
  let set = listeners.get(full);
  if (!set) {
    set = new Set();
    listeners.set(full, set);
  }
  set.add(cb);
  return () => {
    set?.delete(cb);
  };
}

/**
 * Read a value. Returns `fallback` when the key is absent or unparsable.
 * Falls back to `fallback` (not a crash) so a bad backup never bricks the app.
 * Results are cached so repeated reads return the identical reference.
 */
export function readValue<T>(key: string, fallback: T): T {
  const full = fullKey(key);
  const raw = rawRead(full);
  if (raw === null) return fallback;

  const cached = parsedCache.get(full);
  if (cached && cached.raw === raw) return cached.value as T;

  let value: T;
  try {
    value = JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
  parsedCache.set(full, { raw, value });
  return value;
}

/** Write a value and notify subscribers. */
export function writeValue<T>(key: string, value: T) {
  let serialized: string;
  try {
    serialized = JSON.stringify(value);
  } catch (e) {
    console.error(`[learning-os] Failed to serialize "${key}"`, e);
    return;
  }
  const full = fullKey(key);
  rawWrite(full, serialized);
  // Cache the exact object we just wrote so the next read is reference-stable.
  parsedCache.set(full, { raw: serialized, value });
  emit(key);
}

/** Remove a single key. */
export function removeValue(key: string) {
  const full = fullKey(key);
  if (storage) {
    try {
      storage.removeItem(full);
    } catch {
      /* ignore */
    }
  }
  memStore.delete(full);
  parsedCache.delete(full);
  emit(key);
}

/**
 * Persistent React state. Drop-in replacement for useState that survives
 * refresh, navigation and app restarts.
 *
 * The value is seeded with `initialValue` on first ever read and written back
 * on every update. The first `initialValue` passed is captured in a ref, so an
 * inline `[]` / `{}` literal is safe — it won't change identity each render.
 */
export function usePersistentState<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  // Capture the initial value once per key. Inline literals are then safe.
  const initialRef = useRef<{ key: string; value: T }>({ key, value: initialValue });
  if (initialRef.current.key !== key) {
    initialRef.current = { key, value: initialValue };
  }
  const initial = initialRef.current.value;

  // Seed on first ever access so the key exists and exports include it.
  useEffect(() => {
    if (rawRead(fullKey(key)) === null) {
      rawWrite(fullKey(key), JSON.stringify(initial));
      const full = fullKey(key);
      let parsed: unknown;
      try {
        parsed = JSON.parse(JSON.stringify(initial));
      } catch {
        parsed = initial;
      }
      parsedCache.set(full, { raw: JSON.stringify(initial), value: parsed });
      emit(key);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const value = useSyncExternalStore(
    useCallback((cb) => subscribe(key, cb), [key]),
    useCallback(() => readValue<T>(key, initial), [key, initial]),
    useCallback(() => readValue<T>(key, initial), [key, initial])
  );

  const setValue = useCallback(
    (update: T | ((prev: T) => T)) => {
      const prev = readValue<T>(key, initial);
      const next =
        typeof update === 'function'
          ? (update as (p: T) => T)(prev)
          : update;
      writeValue(key, next);
    },
    [key, initial]
  );

  return [value, setValue];
}

/** Non-hook accessor for imperative use (backup, export, cross-module reads). */
export const store = {
  get: readValue,
  set: writeValue,
  remove: removeValue,
};

/** Every key currently stored, with the namespace stripped. */
export function listKeys(): string[] {
  const out: string[] = [];
  if (storage) {
    try {
      for (let i = 0; i < storage.length; i++) {
        const k = storage.key(i);
        if (k && k.startsWith(STORAGE_PREFIX)) out.push(k.slice(STORAGE_PREFIX.length));
      }
    } catch {
      /* ignore */
    }
  }
  memStore.forEach((_, full) => {
    if (full.startsWith(STORAGE_PREFIX)) {
      const short = full.slice(STORAGE_PREFIX.length);
      if (!out.includes(short)) out.push(short);
    }
  });
  return out;
}

/** Snapshot of the entire namespace — used by Backup Center export. */
export function exportAll(): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  listKeys().forEach((key) => {
    data[key] = readValue<unknown>(key, null);
  });
  return {
    _app: 'LEARNING OS',
    _schemaVersion: SCHEMA_VERSION,
    _exportedAt: new Date().toISOString(),
    data,
  };
}

export type ImportResult = {
  ok: boolean;
  restored: number;
  skipped: number;
  message: string;
};

/**
 * Restore a previously exported snapshot. Unknown / wrong-version files are
 * rejected rather than silently wiping the user's data.
 */
export function importAll(payload: unknown): ImportResult {
  if (!payload || typeof payload !== 'object') {
    return { ok: false, restored: 0, skipped: 0, message: 'Not a valid backup file.' };
  }
  const obj = payload as Record<string, unknown>;
  if (obj._app !== 'LEARNING OS' || !obj.data || typeof obj.data !== 'object') {
    return {
      ok: false,
      restored: 0,
      skipped: 0,
      message: 'This file was not created by LEARNING OS.',
    };
  }
  const version = typeof obj._schemaVersion === 'number' ? obj._schemaVersion : 0;
  if (version > SCHEMA_VERSION) {
    return {
      ok: false,
      restored: 0,
      skipped: 0,
      message: 'Backup was made by a newer version of LEARNING OS.',
    };
  }

  const data = obj.data as Record<string, unknown>;
  let restored = 0;
  let skipped = 0;
  Object.entries(data).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      skipped++;
      return;
    }
    try {
      writeValue(key, value);
      restored++;
    } catch {
      skipped++;
    }
  });
  return {
    ok: true,
    restored,
    skipped,
    message: `Restored ${restored} item${restored === 1 ? '' : 's'}.`,
  };
}

/** Wipe the whole namespace (Danger Zone → Delete All Data). */
export function clearAll() {
  listKeys().forEach((key) => removeValue(key));
}

/** Approximate bytes used by the namespace — shown in Backup Center. */
export function usedBytes(): number {
  let total = 0;
  if (storage) {
    try {
      for (let i = 0; i < storage.length; i++) {
        const k = storage.key(i);
        if (k && k.startsWith(STORAGE_PREFIX)) {
          total += k.length + (storage.getItem(k)?.length ?? 0);
        }
      }
    } catch {
      /* ignore */
    }
  }
  memStore.forEach((v, k) => {
    if (k.startsWith(STORAGE_PREFIX)) total += k.length + v.length;
  });
  // localStorage stores UTF-16, so ~2 bytes per code unit.
  return total * 2;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/** Keep other tabs in sync. */
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key && e.key.startsWith(STORAGE_PREFIX)) {
      emit(e.key.slice(STORAGE_PREFIX.length));
    }
  });
}
