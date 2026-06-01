import type { ReactNode } from 'react';

export default function ResponsiveTable({ columns, rows }: { columns: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-slate-200 text-xs font-extrabold uppercase text-slate-500">
          <tr>
            {columns.map((column) => (
              <th key={column} className="px-6 py-4">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="bg-white">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-6 py-5 align-middle text-slate-600">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
