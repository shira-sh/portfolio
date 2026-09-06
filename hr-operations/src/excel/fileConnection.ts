/** Bridges the browser's file APIs to the rest of the app. Two paths are supported:
 *  1. File System Access API (Chromium): keeps a handle so we can write changes back
 *     to the exact file the user picked ("Save Changes").
 *  2. Fallback (any other browser): plain <input type="file"> upload + manual
 *     download/export. No direct-write capability.
 * The rest of the application never touches File/FileSystemFileHandle directly -
 * it goes through the dataSource store, which calls into this module. */

export function isFileSystemAccessSupported(): boolean {
  return typeof window !== 'undefined' && 'showOpenFilePicker' in window;
}

export interface PickedFile {
  file: File;
  handle: FileSystemFileHandle | null;
}

export async function pickWorkbookFile(): Promise<PickedFile | null> {
  if (isFileSystemAccessSupported()) {
    try {
      const [handle] = await window.showOpenFilePicker!({
        types: [
          {
            description: 'Excel Workbook',
            accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] },
          },
        ],
        multiple: false,
      });
      const file = await handle.getFile();
      return { file, handle };
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return null;
      throw err;
    }
  }
  return null;
}

export function fileFromUploadEvent(input: HTMLInputElement): File | null {
  return input.files && input.files.length > 0 ? input.files[0] : null;
}

export async function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return file.arrayBuffer();
}

export async function writeBufferToHandle(
  handle: FileSystemFileHandle,
  buffer: ArrayBuffer,
): Promise<void> {
  const writable = await handle.createWritable();
  await writable.write(buffer);
  await writable.close();
}

export function downloadBuffer(buffer: ArrayBuffer, fileName: string): void {
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
