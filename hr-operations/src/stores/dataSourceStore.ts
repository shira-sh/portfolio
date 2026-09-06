import { create } from 'zustand';
import {
  disconnect as disconnectDb,
  exportBuffer,
  getConnectionSnapshot,
  loadDatabase,
  persist,
  subscribe,
} from '../excel/dbState';
import {
  downloadBuffer,
  fileFromUploadEvent,
  isFileSystemAccessSupported,
  pickWorkbookFile,
  readFileAsArrayBuffer,
} from '../excel/fileConnection';
import { parseWorkbook, requiredSheetsPresent } from '../excel/workbookAdapter';

interface DataSourceState {
  fileName: string | null;
  isConnected: boolean;
  lastLoadedAt: string | null;
  lastSavedAt: string | null;
  isDirty: boolean;
  canWriteDirectly: boolean;
  rowCounts: Record<string, number>;
  isLoading: boolean;
  error: string | null;
  fileSystemAccessSupported: boolean;
  loadFromPicker: () => Promise<void>;
  loadFromFile: (file: File) => Promise<void>;
  loadFromInput: (input: HTMLInputElement) => Promise<void>;
  saveNow: () => Promise<void>;
  exportNow: () => void;
  disconnect: () => void;
  clearError: () => void;
}

async function loadBuffer(
  set: (partial: Partial<DataSourceState>) => void,
  buffer: ArrayBuffer,
  fileName: string,
  handle: FileSystemFileHandle | null,
) {
  const check = requiredSheetsPresent(buffer);
  if (!check.ok) {
    set({
      isLoading: false,
      error: `הקובץ תקין אך חסרים בו הגליונות הבאים: ${check.missing.join(', ')}`,
    });
    return;
  }
  try {
    const db = parseWorkbook(buffer);
    loadDatabase(db, fileName, handle);
  } catch {
    set({ isLoading: false, error: 'לא ניתן לקרוא את הקובץ - ודאי שמדובר בקובץ Excel תקין (xlsx)' });
    return;
  }
  set({ isLoading: false, error: null });
}

export const useDataSourceStore = create<DataSourceState>((set, get) => {
  subscribe(() => set(getConnectionSnapshot()));

  return {
    ...getConnectionSnapshot(),
    isLoading: false,
    error: null,
    fileSystemAccessSupported: isFileSystemAccessSupported(),

    loadFromPicker: async () => {
      set({ isLoading: true, error: null });
      try {
        const picked = await pickWorkbookFile();
        if (!picked) {
          set({ isLoading: false });
          return;
        }
        const buffer = await readFileAsArrayBuffer(picked.file);
        await loadBuffer(set, buffer, picked.file.name, picked.handle);
      } catch {
        set({ isLoading: false, error: 'טעינת הקובץ נכשלה' });
      }
    },

    loadFromFile: async (file: File) => {
      set({ isLoading: true, error: null });
      try {
        const buffer = await readFileAsArrayBuffer(file);
        await loadBuffer(set, buffer, file.name, null);
      } catch {
        set({ isLoading: false, error: 'טעינת הקובץ נכשלה' });
      }
    },

    loadFromInput: async (input: HTMLInputElement) => {
      const file = fileFromUploadEvent(input);
      if (!file) return;
      await get().loadFromFile(file);
    },

    saveNow: async () => {
      set({ isLoading: true, error: null });
      try {
        const saved = await persist();
        if (!saved) {
          set({ isLoading: false, error: 'אין הרשאת כתיבה ישירה לקובץ - יש לייצא ולהחליף ידנית' });
          return;
        }
        set({ isLoading: false });
      } catch {
        set({ isLoading: false, error: 'שמירת הקובץ נכשלה' });
      }
    },

    exportNow: () => {
      const buffer = exportBuffer();
      downloadBuffer(buffer, get().fileName ?? 'HR_DEMO.xlsx');
    },

    disconnect: () => {
      disconnectDb();
    },

    clearError: () => set({ error: null }),
  };
});
