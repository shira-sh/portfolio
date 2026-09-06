import { Link } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-10 text-center">
      <FileQuestion size={36} className="text-gray-400" />
      <h1 className="text-lg font-bold text-gray-900">העמוד המבוקש לא נמצא</h1>
      <Link to="/" className="text-sm font-medium text-blue-600 hover:underline">
        חזרה לדף הבית
      </Link>
    </div>
  );
}
