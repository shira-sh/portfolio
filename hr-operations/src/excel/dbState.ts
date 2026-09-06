import { createEmptyDatabase, type Database } from '../types/database';
import { rowCounts as computeRowCounts, workbookToArrayBuffer } from './workbookAdapter';
import { writeBufferToHandle } from './fileConnection';

/** Holds the single in-memory Database instance for the whole app session, plus the
 * optional File System Access handle used for direct-write persistence. Repositories
 * read/write through `getDatabase()` / `touch()`; the dataSource store (UI-facing)
 * subscribes here to reflect connection status without owning the data itself. */

interface ConnectionState {
  database: Database;
  fileName: string | null;
  fileHandle: FileSystemFileHandle | null;
  lastLoadedAt: string | null;
  lastSavedAt: string | null;
  isDirty: boolean;
  canWriteDirectly: boolean;
}

let state: ConnectionState = {
  database: createEmptyDatabase(),
  fileName: null,
  fileHandle: null,
  lastLoadedAt: null,
  lastSavedAt: null,
  isDirty: false,
  canWriteDirectly: false,
};

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((cb) => cb());
}

export function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function getDatabase(): Database {
  return state.database;
}

export function getConnectionSnapshot() {
  return {
    fileName: state.fileName,
    isConnected: state.fileName !== null,
    lastLoadedAt: state.lastLoadedAt,
    lastSavedAt: state.lastSavedAt,
    isDirty: state.isDirty,
    canWriteDirectly: state.canWriteDirectly,
    rowCounts: computeRowCounts(state.database),
  };
}

export function loadDatabase(
  database: Database,
  fileName: string,
  fileHandle: FileSystemFileHandle | null,
): void {
  state = {
    database,
    fileName,
    fileHandle,
    lastLoadedAt: new Date().toISOString(),
    lastSavedAt: null,
    isDirty: false,
    canWriteDirectly: fileHandle !== null,
  };
  notify();
}

export function disconnect(): void {
  state = {
    database: createEmptyDatabase(),
    fileName: null,
    fileHandle: null,
    lastLoadedAt: null,
    lastSavedAt: null,
    isDirty: false,
    canWriteDirectly: false,
  };
  notify();
}

/** Called by repositories after any write. Auto-saves immediately when we hold a
 * writable file handle; otherwise just flags the workbook as dirty so the UI can
 * prompt the user to export manually. */
export async function touch(): Promise<void> {
  state.isDirty = true;
  notify();
  if (state.fileHandle) {
    await persist();
  }
}

export async function persist(): Promise<boolean> {
  if (!state.fileHandle) return false;
  const buffer = workbookToArrayBuffer(state.database);
  await writeBufferToHandle(state.fileHandle, buffer);
  state.isDirty = false;
  state.lastSavedAt = new Date().toISOString();
  notify();
  return true;
}

export function exportBuffer(): ArrayBuffer {
  const buffer = workbookToArrayBuffer(state.database);
  state.isDirty = false;
  state.lastSavedAt = new Date().toISOString();
  notify();
  return buffer;
}

export function getFileName(): string {
  return state.fileName ?? 'HR_DEMO.xlsx';
}
