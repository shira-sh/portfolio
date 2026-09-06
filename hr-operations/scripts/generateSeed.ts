import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateSeedData } from '../src/seed/generateSeedData';
import { workbookToArrayBuffer } from '../src/excel/workbookAdapter';

const currentDir = dirname(fileURLToPath(import.meta.url));
const outPath = resolve(currentDir, '..', 'seed-data', 'HR_DEMO.xlsx');

const db = generateSeedData();
const buffer = workbookToArrayBuffer(db);

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, Buffer.from(buffer));

console.log(`Seed workbook written to ${outPath}`);
console.log(`Employees: ${db.employees.length}`);
console.log(`Departments: ${db.departments.length}`);
console.log(`Units: ${db.units.length}`);
console.log(`Attendance records: ${db.attendance.length}`);
console.log(`Attendance exceptions: ${db.attendanceExceptions.length}`);
console.log(`Users: ${db.users.length}`);
