/** Small coercion helpers used by all Excel mappers. SheetJS returns loosely-typed
 * cell values (string | number | boolean | undefined), so every mapper reading from
 * a row must normalize before handing data to the application layer. */

export function str(value: unknown): string {
  if (value === undefined || value === null) return '';
  return String(value).trim();
}

export function strOrNull(value: unknown): string | null {
  const s = str(value);
  return s === '' ? null : s;
}

export function num(value: unknown): number {
  if (value === undefined || value === null || value === '') return 0;
  const n = Number(value);
  return Number.isNaN(n) ? 0 : n;
}

export function numOrNull(value: unknown): number | null {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

export function bool(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  const s = str(value).toLowerCase();
  return s === 'true' || s === '1' || s === 'yes';
}

export function csvToArray(value: unknown): string[] {
  const s = str(value);
  if (!s) return [];
  return s
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

export function arrayToCsv(values: string[]): string {
  return values.join(',');
}
