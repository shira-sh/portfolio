import { Loader2 } from 'lucide-react';

export function LoadingState({ message = 'טוען נתונים...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-gray-400">
      <Loader2 size={24} className="animate-spin" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
