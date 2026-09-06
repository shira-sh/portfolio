import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Database, Download, FolderOpen, RefreshCw, Save, Upload, XCircle, AlertCircle } from 'lucide-react';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { useDataSourceStore } from '../stores/dataSourceStore';
import { useAuthStore } from '../stores/authStore';
import { formatDateTimeIL } from '../utils/dateFormat';
import { SHEET_NAMES } from '../types/database';

const SHEET_LABELS: Record<string, string> = {
  [SHEET_NAMES.Employees]: 'עובדים',
  [SHEET_NAMES.EmployeeAssignments]: 'שיוכים ארגוניים',
  [SHEET_NAMES.Departments]: 'מחלקות',
  [SHEET_NAMES.Units]: 'יחידות',
  [SHEET_NAMES.Attendance]: 'נוכחות',
  [SHEET_NAMES.AttendanceExceptions]: 'חריגי נוכחות',
  [SHEET_NAMES.Onboarding]: 'תהליכי קליטה',
  [SHEET_NAMES.OnboardingSteps]: 'שלבי קליטה',
  [SHEET_NAMES.Users]: 'משתמשים',
  [SHEET_NAMES.AuditLog]: 'יומן פעילות',
};

export function SettingsPage() {
  const store = useDataSourceStore();
  const currentUser = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  async function handlePick() {
    if (store.fileSystemAccessSupported) {
      await store.loadFromPicker();
    } else {
      fileInputRef.current?.click();
    }
  }

  async function handleChangeFile() {
    store.disconnect();
    logout();
    await handlePick();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">הגדרות ומקור נתונים</h1>
        <p className="mt-1 text-sm text-gray-500">
          המערכת עובדת מול קובץ Excel מקומי (HR_DEMO.xlsx). יש לחבר את הקובץ כדי להתחיל.
        </p>
      </div>

      <Card title="חיבור לקובץ הנתונים">
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
            <Database size={20} className={store.isConnected ? 'text-emerald-600' : 'text-gray-400'} />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">
                {store.isConnected ? store.fileName : 'לא מחובר קובץ נתונים'}
              </div>
              {store.isConnected && (
                <div className="text-xs text-gray-500">
                  נטען לאחרונה: {formatDateTimeIL(store.lastLoadedAt)}
                  {store.lastSavedAt && ` · נשמר לאחרונה: ${formatDateTimeIL(store.lastSavedAt)}`}
                </div>
              )}
            </div>
            <StatusBadge
              label={store.isConnected ? 'מחובר' : 'לא מחובר'}
              tone={store.isConnected ? 'green' : 'red'}
            />
          </div>

          {store.error && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{store.error}</span>
            </div>
          )}

          {!store.fileSystemAccessSupported && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>
                הדפדפן שלך אינו תומך בשמירה ישירה לקובץ. ניתן לטעון קובץ ולעבוד איתו, אך שינויים יישמרו רק לאחר
                לחיצה על "ייצוא" והחלפת הקובץ המקומי ידנית.
              </span>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx"
            className="hidden"
            onChange={(e) => store.loadFromInput(e.target)}
          />

          <div className="flex flex-wrap gap-2">
            {!store.isConnected ? (
              <button
                type="button"
                onClick={handlePick}
                disabled={store.isLoading}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                <FolderOpen size={16} />
                בחירת קובץ נתונים
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handlePick}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <RefreshCw size={16} />
                  טעינה מחדש
                </button>
                {store.canWriteDirectly && (
                  <button
                    type="button"
                    onClick={() => store.saveNow()}
                    className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <Save size={16} />
                    שמירה
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => store.exportNow()}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Download size={16} />
                  ייצוא
                </button>
                <button
                  type="button"
                  onClick={handleChangeFile}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <XCircle size={16} />
                  החלפת קובץ
                </button>
              </>
            )}
          </div>

          {!store.isConnected && (
            <div className="flex items-center gap-2 border-t border-gray-100 pt-4 text-sm text-gray-500">
              <Upload size={14} />
              אין לך קובץ דמו?{' '}
              <a href="/seed/HR_DEMO.xlsx" download className="font-medium text-blue-600 hover:underline">
                הורדת קובץ נתוני דמו (HR_DEMO.xlsx)
              </a>
            </div>
          )}
        </div>
      </Card>

      {store.isConnected && !currentUser && (
        <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 p-4">
          <div className="text-sm text-blue-800">הקובץ חובר בהצלחה. ניתן להמשיך להתחברות למערכת.</div>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            המשך להתחברות
            <ArrowLeft size={16} />
          </button>
        </div>
      )}

      {store.isConnected && (
        <Card title="שורות בקובץ">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {Object.entries(store.rowCounts).map(([sheet, count]) => (
              <div key={sheet} className="rounded-lg bg-gray-50 p-3 text-center">
                <div className="text-lg font-bold text-gray-900">{count}</div>
                <div className="text-xs text-gray-500">{SHEET_LABELS[sheet] ?? sheet}</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
