import { useRef, useState } from 'react';
import { UploadCloud, Download, FileCheck2, AlertCircle } from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Card } from '../components/Card';
import { parseWorkbook, requiredSheetsPresent } from '../excel/workbookAdapter';
import { validateImport, type ImportValidationResult } from '../excel/validators/importValidator';
import { loadDatabase } from '../excel/dbState';
import type { Database } from '../types/database';
import { useDataSourceStore } from '../stores/dataSourceStore';
import { useAuthStore } from '../stores/authStore';
import { logEvent } from '../services/auditService';

export function ImportExportPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [validation, setValidation] = useState<ImportValidationResult | null>(null);
  const [pendingDb, setPendingDb] = useState<Database | null>(null);
  const [pendingFileName, setPendingFileName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const exportNow = useDataSourceStore((s) => s.exportNow);
  const currentUser = useAuthStore((s) => s.currentUser);

  async function handleFile(file: File) {
    setError(null);
    setValidation(null);
    setPendingDb(null);
    try {
      const buffer = await file.arrayBuffer();
      const check = requiredSheetsPresent(buffer);
      if (!check.ok) {
        setError(`חסרים בקובץ הגליונות הבאים: ${check.missing.join(', ')}`);
        return;
      }
      const db = parseWorkbook(buffer);
      setValidation(validateImport(db));
      setPendingDb(db);
      setPendingFileName(file.name);
    } catch {
      setError('לא ניתן לקרוא את הקובץ - ודאי שמדובר בקובץ Excel תקין');
    }
  }

  async function confirmImport() {
    if (!pendingDb) return;
    loadDatabase(pendingDb, pendingFileName, null);
    if (currentUser) {
      await logEvent(currentUser, 'EXCEL_IMPORTED', 'System', 'import', `יובא קובץ נתונים: ${pendingFileName}`);
    }
    setValidation(null);
    setPendingDb(null);
  }

  async function handleExport() {
    exportNow();
    if (currentUser) {
      await logEvent(currentUser, 'EXCEL_EXPORTED', 'System', 'export', 'יוצא קובץ נתונים מעודכן');
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Breadcrumbs items={[{ label: 'דשבורד', to: '/dashboard' }, { label: 'ייבוא וייצוא' }]} />
      <h1 className="text-xl font-bold text-gray-900">ייבוא וייצוא נתונים</h1>

      <Card title="ייבוא קובץ Excel">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed p-10 text-center transition ${
            isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <UploadCloud size={28} className="text-gray-400" />
          <p className="text-sm text-gray-600">גררי קובץ Excel לכאן, או לחצי לבחירה</p>
          <p className="text-xs text-gray-400">קובץ xlsx בפורמט HR_DEMO בלבד</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {validation && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
              <FileCheck2 size={16} />
              נמצאו {validation.totalEmployees} עובדים בקובץ, מתוכם {validation.validEmployees} תקינים
            </div>
            <ul className="grid grid-cols-2 gap-2 text-sm text-gray-600 sm:grid-cols-3">
              <ValidationRow label="שדות חובה חסרים" value={validation.missingRequiredFields} />
              <ValidationRow label="ללא מנהל תקין" value={validation.missingManager} />
              <ValidationRow label="ללא מחלקה תקינה" value={validation.missingDepartment} />
              <ValidationRow label="ללא יחידה תקינה" value={validation.missingUnit} />
              <ValidationRow label="ת.ז. כפולות" value={validation.duplicateNationalIds} />
              <ValidationRow label="סטטוס לא תקין" value={validation.invalidStatus} />
              <ValidationRow label="תאריכים לא תקינים" value={validation.invalidDates} />
            </ul>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setValidation(null);
                  setPendingDb(null);
                }}
                className="btn-outline"
              >
                ביטול
              </button>
              <button onClick={confirmImport} className="btn-primary">
                ייבוא הקובץ כמקור הנתונים הפעיל
              </button>
            </div>
          </div>
        )}
      </Card>

      <Card title="ייצוא נתונים">
        <p className="mb-3 text-sm text-gray-500">
          ייצוא קובץ Excel מעודכן הכולל את כל השינויים שבוצעו במערכת מאז החיבור לקובץ.
        </p>
        <button onClick={handleExport} className="btn-primary flex items-center gap-2">
          <Download size={16} />
          ייצוא HR_DEMO.xlsx מעודכן
        </button>
      </Card>
    </div>
  );
}

function ValidationRow({ label, value }: { label: string; value: number }) {
  return (
    <li className={`rounded-lg px-3 py-2 ${value > 0 ? 'bg-amber-50 text-amber-700' : 'bg-gray-50 text-gray-500'}`}>
      <span className="font-semibold">{value}</span> {label}
    </li>
  );
}
