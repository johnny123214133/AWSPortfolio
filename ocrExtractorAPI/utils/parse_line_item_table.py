"""
Parsing helpers for the output of line_item_table_extraction.py.

Takes the `ClassifiedLineItemTable` dataclass (`labeled_df` + `header_pivot_col`)
and turns it into three usable pieces:

  - the "Region :" value out of the folded header block's leading
    (pre-pivot) column
  - a line-item DataFrame, using the (folded) subheader row as column
    names, with the trailing Unit Price / Amount columns renamed to
    embed the owning entity's name -- see the note on that decision
    below
  - a summary DataFrame (the SUMMARY-type rows), sharing the same
    column names as the line-item DataFrame

This file imports `ClassifiedLineItemTable` and `LineItemTableRowType` directly from
your extraction module rather than re-declaring them, since this file
is a consumer of that module's actual output type, not a standalone
extractor. Only `_is_blank` is copied over, per the pattern in the
other files.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple

import pandas as pd

from .table_extraction import ClassifiedLineItemTable, LineItemTableRowType


def _is_blank(v) -> bool:
    return v is None or (isinstance(v, float) and pd.isna(v)) or str(v).strip() == ""


_BIDDER_LABEL_RE = re.compile(r"^\s*bidder\s*:\s*", re.IGNORECASE)


def _clean_entity_name(value) -> str:
    """Strips a leading 'Bidder :' placeholder label off an entity name.
    That label lives in its own header sub-row (e.g. "Abstract of Bids"
    row: blank, "Bidder :", "Bidder :") and, once folded together with
    the row(s) that carry the actual company name, ends up prefixed onto
    it (e.g. "Bidder : KILGORE COMPANIES, LLC") unless stripped back out.
    """
    if _is_blank(value):
        return value
    cleaned = _BIDDER_LABEL_RE.sub("", str(value)).strip()
    return re.sub(r"\s+", " ", cleaned)


# --------------------------------------------------------------------------
# Header row access
# --------------------------------------------------------------------------

def _original_columns(labeled_df: pd.DataFrame) -> List:
    """The dataframe's real content columns -- everything except the
    tracking columns build_classified_table added."""
    return [c for c in labeled_df.columns if not str(c).startswith("_")]


def _single_row_values(labeled_df: pd.DataFrame, row_type: LineItemTableRowType, original_columns: List) -> list:
    """Pull the one row of `row_type` out of labeled_df as a plain list
    of values. Raises if it isn't there; warns via the returned row
    count being > 1 is silently resolved by taking the first (a table
    should only ever fold to one HEADER row and one SUBHEADER row)."""
    matches = labeled_df[labeled_df["_row_type"] == row_type.value]
    if matches.empty:
        raise ValueError(f"no {row_type.value!r} row found in labeled_df")
    return matches.iloc[0][original_columns].tolist()


# --------------------------------------------------------------------------
# Region
# --------------------------------------------------------------------------

def extract_region(header_col0_value: str, label: str = "Region") -> Optional[str]:
    """The header's leading (pre-pivot) block is folded with '\\n'
    between its original lines specifically so it can be split back
    apart like this. Finds the line that's just the label itself
    (e.g. "Region :") and returns the very next line ("Region 1") --
    matching how that block is actually laid out: a standalone label
    line followed by its value on the next line.

    `header_col0_value` is the header row's column-0 value (a single
    string) -- the caller pulls that value out and passes it in
    directly; this function doesn't need the rest of the row or the
    pivot column.
    """
    # print(f"header string:n\n{header_col0_value}")
    if _is_blank(header_col0_value):
        return None

    lines = header_col0_value.split("\n")
    target = label.strip().lower()
    # print(f"target: {target}")
    for i, line in enumerate(lines):
        # print(f"line: {line}")
        candidate = line.strip().rstrip(":").strip().lower()
        parts = candidate.split(":")
        key_parts = parts[0].split(" ")
        # print(f"key_parts: {key_parts}")
        if len(key_parts) > 2 or key_parts[-1] != "":
            continue

        if key_parts[0] == target and i + 1 < len(lines):
            # return lines[i + 1].strip()
            return parts[1].strip()
    return None


# --------------------------------------------------------------------------
# Entity -> column lookup
# --------------------------------------------------------------------------

def extract_entity_column_dict(
    header_values: list,
    original_columns: list,
    header_pivot_col: int,
    trailing_columns_to_ignore: int = 0,
) -> Dict[str, object]:
    """Walk the header row from the pivot column to the end (minus
    `trailing_columns_to_ignore`, 0 by default), recording each distinct
    value's FIRST column. Because a merged Unit Price/Amount pair
    duplicates the same entity name across both of its columns, this
    naturally lands on the pair's first (Unit Price) column and skips
    its duplicate (Amount) -- so each entity maps to where its block
    starts in the header, which is what makes this useful as a lookup
    back into the raw header structure.

    `trailing_columns_to_ignore` previously defaulted to 3 on the
    assumption that the last few header columns were never real
    entities. That assumption was wrong -- with 3 companies given, it
    was cutting off the last one entirely (and part of the second-to-
    last's Amount column). Defaulting to 0 now; only raise it if you
    have an actual, confirmed reason some trailing columns aren't real
    entities.
    """
    end_col = len(original_columns) - trailing_columns_to_ignore
    entity_dict: Dict[str, object] = {}
    for c in range(header_pivot_col, max(header_pivot_col, end_col)):
        val = _clean_entity_name(header_values[c]) if c < len(header_values) else None
        if _is_blank(val) or val in entity_dict:
            continue
        entity_dict[val] = original_columns[c]
    return entity_dict


# --------------------------------------------------------------------------
# Line-item and summary dataframes
# --------------------------------------------------------------------------

def _build_column_names(header_values: list, subheader_values: list, header_pivot_col: int) -> List[str]:
    """Column names for the line-item/summary dataframes: the leading
    (pre-pivot) columns just use the subheader's own label
    ("Line No.", "Container Description", ...). For columns at/after
    the pivot, the subheader repeats "Unit Price" / "Amount" once per
    entity -- duplicate column names in a dataframe are ambiguous to
    index and easy to mis-select, so each is suffixed with the entity
    name read directly off the header row at that same column, e.g.
    "Unit Price - KILGORE COMPANIES, LLC". This is deliberately NOT
    driven by the entity dict above (which only records each entity's
    first column) -- reading the header value per-column instead means
    both the Unit Price AND Amount columns get the right entity name,
    not just the first one of the pair. See the response text for why
    this is the recommended approach over relying on the dict alone.
    """
    names = []
    for c, subheader_label in enumerate(subheader_values):
        label = subheader_label if not _is_blank(subheader_label) else f"col_{c}"
        if c >= header_pivot_col:
            entity_name = _clean_entity_name(header_values[c]) if c < len(header_values) else None
            if _is_blank(entity_name):
                # Still mark this as a company column even without a
                # resolved name -- otherwise it's indistinguishable from
                # a real leading detail column downstream (no ' - ' in
                # the name), and things like project_builder.py's
                # detail/estimate split will silently miscategorize its
                # Unit Price / Amount values as line item "details"
                # instead of company estimates.
                entity_name = f"Unknown Entity (col {c})"
            label = f"{label} - {entity_name}"
        names.append(label)
    return names


def build_line_item_dataframe(classified: ClassifiedLineItemTable) -> Tuple[pd.DataFrame, List[str]]:
    """Line items become this dataframe's rows; the folded subheader
    row (with entity names embedded past the pivot, per
    `_build_column_names`) becomes its column names."""
    labeled = classified.labeled_df
    original_columns = _original_columns(labeled)

    header_values = _single_row_values(labeled, LineItemTableRowType.HEADER, original_columns)
    subheader_values = _single_row_values(labeled, LineItemTableRowType.SUBHEADER, original_columns)

    if classified.header_pivot_col is None:
        raise ValueError("classified table has no header_pivot_col -- was a HEADER row detected?")

    column_names = _build_column_names(header_values, subheader_values, classified.header_pivot_col)

    line_item_rows = labeled[labeled["_row_type"] == LineItemTableRowType.LINE_ITEM.value]
    line_items_df = line_item_rows[original_columns].copy()
    line_items_df.columns = column_names
    line_items_df = line_items_df.reset_index(drop=True)

    return line_items_df, column_names


def build_summary_dataframe(classified: ClassifiedLineItemTable, column_names: List[str]) -> pd.DataFrame:
    """SUMMARY-type rows, kept separate from the line items but sharing
    the exact same column names."""
    labeled = classified.labeled_df
    original_columns = _original_columns(labeled)

    summary_rows = labeled[labeled["_row_type"] == LineItemTableRowType.SUMMARY.value]
    summary_df = summary_rows[original_columns].copy()
    summary_df.columns = column_names
    return summary_df.reset_index(drop=True)


# --------------------------------------------------------------------------
# Orchestration
# --------------------------------------------------------------------------

@dataclass
class ParsedLineItemTable:
    region: Optional[str]
    line_items: pd.DataFrame
    summary: pd.DataFrame
    entity_columns: Dict[str, object]


def parse_line_item_table(classified: ClassifiedLineItemTable) -> ParsedLineItemTable:
    labeled = classified.labeled_df
    original_columns = _original_columns(labeled)

    if classified.header_pivot_col is None:
        raise ValueError("classified table has no header_pivot_col -- was a HEADER row detected?")

    header_values = _single_row_values(labeled, LineItemTableRowType.HEADER, original_columns)

    region = extract_region(header_values[0])
    entity_columns = extract_entity_column_dict(
        header_values, original_columns, classified.header_pivot_col
    )

    line_items_df, column_names = build_line_item_dataframe(classified)
    summary_df = build_summary_dataframe(classified, column_names)

    return ParsedLineItemTable(
        region=region,
        line_items=line_items_df,
        summary=summary_df,
        entity_columns=entity_columns,
    )


if __name__ == "__main__":
    # Example wiring:
    #
    # from line_item_table_extraction import build_classified_table
    # classified = build_classified_table(extracted_table.df)
    # parsed = parse_line_item_table(classified)
    # print(parsed.region)
    # print(parsed.line_items.head())
    # print(parsed.summary)
    # print(parsed.entity_columns)
    pass