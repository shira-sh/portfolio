/** Fictional Israeli names for demo/seed data only. No real employee data. */

export const FIRST_NAMES_MALE = [
  'איתי', 'נועם', 'עומר', 'יהונתן', 'דניאל', 'אורי', 'רועי', 'תומר', 'גיא', 'אלון',
  'ליאור', 'שחר', 'עידו', 'יובל', 'ניר', 'אסף', 'עמית', 'טל', 'רן', 'משה',
];

export const FIRST_NAMES_FEMALE = [
  'מאיה', 'נועה', 'שירה', 'טליה', 'הילה', 'רוני', 'יעל', 'אביגיל', 'ליה', 'אור',
  'שקד', 'עדן', 'רותם', 'גל', 'ענבל', 'קרן', 'דנה', 'איילת', 'סתיו', 'רבקה',
];

export const LAST_NAMES = [
  'כהן', 'לוי', 'מזרחי', 'פרץ', 'ביטון', 'אזולאי', 'דהן', 'אברהם', 'פרידמן', 'שמעוני',
  'גבאי', 'עמר', 'חדד', 'סבן', 'אוחיון', 'קדוש', 'נחום', 'שלום', 'ברק', 'גולן',
  'רוזן', 'וקנין', 'טל', 'שרעבי', 'בן דוד', 'מלכה', 'יוסף', 'חן', 'אשכנזי', 'צור',
];

export function fakeFullName(index: number): { firstName: string; lastName: string } {
  const isMale = index % 2 === 0;
  const firstNames = isMale ? FIRST_NAMES_MALE : FIRST_NAMES_FEMALE;
  const firstName = firstNames[index % firstNames.length];
  const lastName = LAST_NAMES[(index * 7) % LAST_NAMES.length];
  return { firstName, lastName };
}

/** Clearly-fake demo national ID: 9-digit synthetic number, never a real ת"ז. */
export function fakeNationalId(index: number): string {
  const base = 200000000 + index * 37;
  return String(base).padStart(9, '0');
}

export function fakePhone(index: number): string {
  const suffix = String(1000000 + index * 13).slice(-7);
  return `05${index % 10}-${suffix}`;
}

export function fakeEmail(index: number): string {
  return `user${index}@demo-hr-org.co.il`;
}
