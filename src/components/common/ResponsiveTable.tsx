import type { ReactNode } from 'react';

export default function ResponsiveTable({
  columns,
  rows,
  colWidths,
}: {
  columns: string[];
  rows: ReactNode[][];
  colWidths?: Array<string | undefined>;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="data-table min-w-full text-left text-sm">
        {colWidths ? (
          <colgroup>
            {columns.map((column, index) => (
              <col key={column} style={colWidths[index] ? { width: colWidths[index] } : undefined} />
            ))}
          </colgroup>
        ) : null}
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="bg-white">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="align-middle">
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
