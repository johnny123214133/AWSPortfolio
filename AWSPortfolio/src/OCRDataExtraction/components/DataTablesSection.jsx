import React from "react";
import { TABLE_KEYS, useBidExtraction } from "../contexts/BidExtractionContext";
import DataTable from "./DataTable";

const TABLE_LABELS = {
  [TABLE_KEYS.METADATA]: "Metadata",
  [TABLE_KEYS.BID_SUMMARIES]: "Bid Summaries",
  [TABLE_KEYS.LINE_ITEMS]: "Line Items",
};

export default function DataTablesSection() {
  const { data, activeTable, setActiveTable } = useBidExtraction();

  if (!data) {
    return (
      <section className="data-tables-section">
        <p className="data-tables-section__empty">
          Upload a PDF and extract it to see its data here.
        </p>
      </section>
    );
  }

  const activeRows = data[activeTable] ?? [];

  return (
    <section className="data-tables-section" aria-labelledby="data-tables-heading">
      <h2 id="data-tables-heading">Extracted data</h2>

      <div className="data-tables-section__tabs" role="tablist" aria-label="Extracted tables">
        {Object.values(TABLE_KEYS).map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={activeTable === key}
            className={`data-tables-section__tab${
              activeTable === key ? " data-tables-section__tab--active" : ""
            }`}
            onClick={() => setActiveTable(key)}
          >
            {TABLE_LABELS[key]}
          </button>
        ))}
      </div>

      <DataTable rows={activeRows} tableKey={activeTable} />
    </section>
  );
}
