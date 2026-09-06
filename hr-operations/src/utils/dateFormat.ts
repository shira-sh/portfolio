/** All entities store dates internally as ISO strings (YYYY-MM-DD) or full ISO
 * timestamps. This module is the only place that formats dates for display, in
 * Israeli notation (DD/MM/YYYY). */

export function isoDateToday(): string {
  return new Date().toISOString().slice(0, 10);
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function formatDateIL(isoDate: string | null | undefined): string {
  if (!isoDate) return '—';
  const datePart = isoDate.slice(0, 10);
  const [year, month, day] = datePart.split('-');
  if (!year || !month || !day) return isoDate;
  return `${day}/${month}/${year}`;
}

export function formatDateTimeIL(isoTimestamp: string | null | undefined): string {
  if (!isoTimestamp) return '—';
  const d = new Date(isoTimestamp);
  if (Number.isNaN(d.getTime())) return isoTimestamp;
  const datePart = formatDateIL(isoTimestamp);
  const time = d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
  return `${datePart} ${time}`;
}

export function formatTimeHM(value: string | null | undefined): string {
  return value ?? '—';
}

export function currentTimeHM(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function minutesBetween(clockIn: string, clockOut: string): number {
  const [inH, inM] = clockIn.split(':').map(Number);
  const [outH, outM] = clockOut.split(':').map(Number);
  return outH * 60 + outM - (inH * 60 + inM);
}

export function formatWorkedHours(minutes: number | null): string {
  if (minutes === null || Number.isNaN(minutes)) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
