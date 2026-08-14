import React from "react";
import { getOrderedColumns } from "../utils/columnOrder";

/**
 * Renders any array of row-objects (as produced by
 * pandas.DataFrame.to_json(orient="records")) as a plain HTML table.
 * `tableKey` tells getOrderedColumns() which schema to apply -- see
 * that file for why column order can't just be read off the first
 * row's keys.
 */
export default function DataTable({ rows, tableKey }) {
  if (!rows || rows.length === 0) {
    return <p className="data-table__empty">No rows to display.</p>;
  }

  const columns = getOrderedColumns(tableKey, rows);

  return (
    <div className="data-table__scroll">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column} scope="col">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column) => (
                <td key={column}>{formatCell(row[column])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatCell(value) {
  if (value === null || value === undefined) return "";
  return String(value);
}
