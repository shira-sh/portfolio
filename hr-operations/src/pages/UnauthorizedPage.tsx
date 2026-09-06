import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export function UnauthorizedPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-10 text-center">
      <ShieldAlert size={36} className="text-amber-500" />
      <h1 className="text-lg font-bold text-gray-900">אין הרשאה לצפייה בעמוד זה</h1>
      <p className="text-sm text-gray-500">התפקיד שלך במערכת אינו כולל גישה לתוכן זה.</p>
      <Link to="/dashboard" className="mt-2 text-sm font-medium text-blue-600 hover:underline">
        חזרה לדשבורד
      </Link>
    </div>
  );
}
