import { TABLE_KEYS } from "../contexts/BidExtractionContext";

/**
 * The Flask response's row objects arrive with alphabetized keys --
 * jsonify() sorts dict keys by default -- which scrambles the grouping
 * the server actually built (e.g. each company's "unit_price - X" /
 * "amount - X" pair no longer sit next to each other, and everything
 * from every company clusters by field name instead of by company).
 * That's destructive, not just cosmetic: the original insertion order
 * is gone by the time this reaches the client, so there's nothing to
 * "restore" -- this rebuilds a sensible order from what we know about
 * the schema instead.
 *
 * The more thorough fix is turning off Flask's key sorting server-side
 * (app.config["JSON_SORT_KEYS"] = False, on Flask versions that still
 * expose it) so the response doesn't need this correction applied to
 * it at all. Worth doing either way, but keeping this as a client-side
 * safety net regardless -- it doesn't hurt anything to have both.
 */

const METADATA_COLUMN_ORDER = ["field", "value"];
const BID_SUMMARY_COLUMN_ORDER = ["Company", "Amount", "Percent of Engineer Estimate"];
const LINE_ITEM_DETAIL_ORDER = [
  "item_number",
  "container_description",
  "item_name",
  "additive_number",
  "quantity",
  "unit",
];

const ESTIMATE_COLUMN_RE = /^(unit_price|amount) - (.+)$/;

function orderLineItemColumns(availableColumns) {
  const ordered = LINE_ITEM_DETAIL_ORDER.filter((col) => availableColumns.has(col));

  const companyNames = new Set();
  availableColumns.forEach((col) => {
    const match = col.match(ESTIMATE_COLUMN_RE);
    if (match) companyNames.add(match[2]);
  });

  Array.from(companyNames)
    .sort((a, b) => a.localeCompare(b))
    .forEach((company) => {
      const unitPriceCol = `unit_price - ${company}`;
      const amountCol = `amount - ${company}`;
      if (availableColumns.has(unitPriceCol)) ordered.push(unitPriceCol);
      if (availableColumns.has(amountCol)) ordered.push(amountCol);
    });

  // Anything that doesn't match a known pattern still gets shown --
  // just tacked on the end rather than silently dropped.
  const remaining = Array.from(availableColumns)
    .filter((col) => !ordered.includes(col))
    .sort((a, b) => a.localeCompare(b));

  return [...ordered, ...remaining];
}

export function getOrderedColumns(tableKey, rows) {
  if (!rows || rows.length === 0) return [];
  const availableColumns = new Set(Object.keys(rows[0]));

  switch (tableKey) {
    case TABLE_KEYS.METADATA:
      return METADATA_COLUMN_ORDER.filter((col) => availableColumns.has(col));
    case TABLE_KEYS.BID_SUMMARIES:
      return BID_SUMMARY_COLUMN_ORDER.filter((col) => availableColumns.has(col));
    case TABLE_KEYS.LINE_ITEMS:
      return orderLineItemColumns(availableColumns);
    default:
      return Array.from(availableColumns).sort((a, b) => a.localeCompare(b));
  }
}
