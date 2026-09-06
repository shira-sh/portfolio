import { useMemo, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
  hiddenByDefault?: boolean;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  pageSize?: number;
  emptyMessage?: string;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  pageSize = 20,
  emptyMessage = 'לא נמצאו רשומות',
}: DataTableProps<T>) {
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<1 | -1>(1);
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(
    () => new Set(columns.filter((c) => c.hiddenByDefault).map((c) => c.key)),
  );

  const visibleColumns = columns.filter((c) => !hiddenColumns.has(c.key));

  const sortedRows = useMemo(() => {
    if (!sortKey) return rows;
    const column = columns.find((c) => c.key === sortKey);
    if (!column?.sortValue) return rows;
    return [...rows].sort((a, b) => {
      const av = column.sortValue!(a);
      const bv = column.sortValue!(b);
      if (av < bv) return -1 * sortDir;
      if (av > bv) return 1 * sortDir;
      return 0;
    });
  }, [rows, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const currentPage = Math.min(page, totalPages - 1);
  const pageRows = sortedRows.slice(currentPage * pageSize, currentPage * pageSize + pageSize);

  function toggleSort(column: DataTableColumn<T>) {
    if (!column.sortValue) return;
    if (sortKey === column.key) {
      setSortDir((d) => (d === 1 ? -1 : 1));
    } else {
      setSortKey(column.key);
      setSortDir(1);
    }
  }

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-end gap-2 text-xs text-gray-500">
        {columns.map((c) => (
          <label key={c.key} className="flex items-center gap-1 select-none">
            <input
              type="checkbox"
              checked={!hiddenColumns.has(c.key)}
              onChange={() =>
                setHiddenColumns((prev) => {
                  const next = new Set(prev);
                  if (next.has(c.key)) next.delete(c.key);
                  else next.add(c.key);
                  return next;
                })
              }
            />
            {c.header}
          </label>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full min-w-max text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              {visibleColumns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  onClick={() => toggleSort(column)}
                  className={`whitespace-nowrap px-4 py-2.5 text-right font-medium ${
                    column.sortValue ? 'cursor-pointer select-none' : ''
                  }`}
                >
                  {column.header}
                  {sortKey === column.key ? (sortDir === 1 ? ' ▲' : ' ▼') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pageRows.length === 0 && (
              <tr>
                <td colSpan={visibleColumns.length} className="px-4 py-10 text-center text-gray-400">
                  {emptyMessage}
                </td>
              </tr>
            )}
            {pageRows.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={() => onRowClick?.(row)}
                className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
              >
                {visibleColumns.map((column) => (
                  <td key={column.key} className="whitespace-nowrap px-4 py-2.5 text-gray-800">
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedRows.length > pageSize && (
        <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
          <span>
            מציג {currentPage * pageSize + 1}-{Math.min(sortedRows.length, (currentPage + 1) * pageSize)} מתוך{' '}
            {sortedRows.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="rounded-md border border-gray-200 p-1.5 disabled:opacity-40"
              aria-label="עמוד קודם"
            >
              <ChevronRight size={16} />
            </button>
            <span>
              עמוד {currentPage + 1} מתוך {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
              className="rounded-md border border-gray-200 p-1.5 disabled:opacity-40"
              aria-label="עמוד הבא"
            >
              <ChevronLeft size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
