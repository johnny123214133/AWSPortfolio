"""
Row-type classification for img2table's `.df` output on line-item tables
of the "Abstract of Bids" shape: a wide multi-row merged table header,
a wrapped multi-row subheader, numbered line-item rows (each possibly
wrapping across several df rows), summary/total rows, and a fifth
section-divider row type that's detected so it can be deliberately
skipped.

Column layout this assumes (0-indexed), matching the sample documents:
  col 0            -> Line no. (present only on a line-item row's first line)
  col 1 .. pivot-1  -> the "7 or so" leading descriptive columns
  col pivot ..end   -> repeating 2-column (Unit Price, Amount) pairs, one
                       pair per bidder/estimate

`pivot` isn't hardcoded to 7 -- it's read directly off the table header
row's own merge structure (see `header_pivot_col` below), since the
leading block width varies "depending on the subheader" per your
description.

Row types
---------
HEADER       every populated cell is part of a merge span: one wide
             leading span (>= leading_span_min_cols), then repeating
             pair-width merge spans to the end of the row.
SUBHEADER    same column shape as HEADER (leading block + repeating
             pairs) but nothing is merged -- individual label text in
             every cell.
LINE_ITEM    col 0 holds a number on the row that starts the entry; no
             merged cells anywhere in the row.
SUMMARY      col 0 blank, one wide merge span starting at col 1
             (>= leading_span_min_cols - 1), then repeating pair-width
             merge spans -- mirrors HEADER's shape, shifted right by one.
IGNORED      col 0 blank, no qualifying wide merge in the leading block,
             but at least `min_ignored_populated_cells` other cells in
             the leading block are populated (distinguishes a genuine
             section-divider row from a plain wrap-continuation line,
             which typically populates only the one wrapping column).
CONTINUATION internal only -- any row that doesn't clearly match one of
             the five patterns above is treated as a wrap-runoff line
             of whatever logical row precedes it, and gets folded in.
HEADER_CONTINUATION internal only -- a raw row that structurally looks
             like another HEADER row (its own wide leading merge span)
             but appears immediately after an already-open HEADER
             logical row. The table header is one <br/>-wrapped block
             spread across several bordered lines, so img2table
             reproduces the SAME merge duplication on every one of its
             OCR-detected lines -- without this check each wrapped
             header line would otherwise look like a fresh HEADER row
             and start its own logical row instead of folding into the
             one header. Never appears in the final output; folded rows
             keep the enclosing row's HEADER type. Many of these lines
             leave the columns at/after the pivot blank (only the
             leading block, or only one bidder's pair, actually wraps
             on any given line) -- folding already skips blanks
             per-column, so this doesn't need special handling beyond
             the reclassification itself.

             Columns before the pivot are folded with '\\n' rather than
             join_str, so that block stays splittable into its original
             lines for downstream parsing (e.g. "Project No :" /
             "F-R199(431)"). This is intentionally reintroducing a
             newline at a specific, known point -- not the same thing
             as the raw '\\n' that `_clean_text` strips out of individual
             OCR'd cell values, which was in the wrong place (mid-value,
             not between logical lines) to be useful as a delimiter.
             Columns at/after the pivot keep using join_str, same as
             every other continuation type.
SUBHEADER_CONTINUATION internal only -- the same problem as
             HEADER_CONTINUATION, but for the subheader: a wrapped
             subheader line ("Container" / "Description", "Additive" /
             "#", etc.) still has non-blank, non-numeric text in column
             0 and no merge spans, so it independently classifies as a
             fresh SUBHEADER too. Downgraded to this and folded into
             the open SUBHEADER row instead. Never appears in the final
             output.
"""

from __future__ import annotations

from collections import OrderedDict

import re
from dataclasses import dataclass, field
from enum import Enum
from typing import List, Tuple, Callable, Optional

import pandas as pd



# ==========================================================================
# Helper functions
# ==========================================================================

def _is_blank(v) -> bool:
    return v is None or (isinstance(v, float) and pd.isna(v)) or str(v).strip() == ""


def _clean_text(v):
    """Collapse any pre-existing '\\n' (e.g. from an OCR'd <br/> line
    break inside one cell) down to a single space, before this value is
    used for classification or folded together with another row's text.
    Leaves None/NaN untouched so `_is_blank` still works on it."""
    if v is None or (isinstance(v, float) and pd.isna(v)):
        return v
    return re.sub(r"\s*\n\s*", " ", str(v)).strip()



# ==========================================================================
# Line Item Table
# ==========================================================================

# --------------------------------------------------------------------------
# Merge detection (reused from the earlier postprocessing pass)
# --------------------------------------------------------------------------

@dataclass
class MergeSpan:
    start_col: int
    end_col: int  # inclusive
    value: str

def detect_merge_spans(row_values: list) -> list:
    """Find runs of >=2 consecutive columns holding the identical
    non-null value -- img2table's signature for a colspan merge."""
    spans = []
    i, n = 0, len(row_values)
    while i < n:
        v = row_values[i]
        if _is_blank(v):
            i += 1
            continue
        j = i
        while j + 1 < n and row_values[j + 1] == v:
            j += 1
        if j > i:
            spans.append(MergeSpan(start_col=i, end_col=j, value=v))
        i = j + 1
    return spans


def corroborate_span(
    span: MergeSpan,
    row_index: int,
    df: pd.DataFrame,
    bbox_lookup: Optional[Callable] = None,
    single_column_width: Optional[float] = None,
    min_repeat_rows: int = 1,
) -> bool:
    """Guard against coincidental duplicate values (e.g. Unit Price ==
    Amount on a qty=1 lump-sum line) being mistaken for a real merge.
    See img2table_df_postprocessing.py for the full explanation."""
    if bbox_lookup is not None and single_column_width:
        bbox = bbox_lookup(row_index, span.start_col)
        if bbox is not None:
            span_width = span.end_col - span.start_col + 1
            expected = span_width * single_column_width
            return (bbox.x2 - bbox.x1) >= 0.85 * expected

    repeats = 0
    for other_idx in range(len(df)):
        if other_idx == row_index:
            continue
        other_row = df.iloc[other_idx].tolist()
        if len(other_row) > span.end_col:
            same_span = all(
                other_row[c] == span.value for c in range(span.start_col, span.end_col + 1)
            )
            if same_span:
                repeats += 1
    return repeats >= min_repeat_rows


# --------------------------------------------------------------------------
# Row type classification
# --------------------------------------------------------------------------

class LineItemTableRowType(str, Enum):
    HEADER = "header"
    SUBHEADER = "subheader"
    LINE_ITEM = "line_item"
    SUMMARY = "summary"
    IGNORED = "ignored"
    CONTINUATION = "continuation"  # internal only -- never appears in output
    HEADER_CONTINUATION = "header_continuation"  # internal only -- see module docstring
    SUBHEADER_CONTINUATION = "subheader_continuation"  # internal only -- see module docstring


_NUMERIC_RE = re.compile(r"^\d+([.,]\d+)?$")


def _is_numeric_label(v) -> bool:
    return not _is_blank(v) and bool(_NUMERIC_RE.match(str(v).strip()))


def _has_wide_leading_span(spans: list, start_col: int, min_cols: int) -> bool:
    return any(
        s.start_col == start_col and (s.end_col - s.start_col + 1) >= min_cols
        for s in spans
    )


def classify_raw_line_item_row(
    row_values: list,
    leading_span_min_cols: int = 5,
    min_ignored_populated_cells: int = 2,
) -> LineItemTableRowType:
    """Classify a single raw (pre-fold) dataframe row using only its
    column-occupancy / merge-span shape. Order matters -- checks run
    from most to least structurally specific."""
    spans = detect_merge_spans(row_values)
    col0_blank = _is_blank(row_values[0])

    # HEADER: entirely merged, starting with a wide span at column 0.
    if _has_wide_leading_span(spans, 0, leading_span_min_cols):
        return LineItemTableRowType.HEADER

    if col0_blank:
        # SUMMARY: wide merge span starting at column 1 (col 0 itself is
        # blank -- the label/total block starts one column later).
        if _has_wide_leading_span(spans, 1, leading_span_min_cols - 1):
            return LineItemTableRowType.SUMMARY

        # IGNORED: no qualifying merge, but multiple leading-block cells
        # are populated -- a genuine section-divider row, not just a
        # single wrapping column's runoff.
        leading_block = row_values[1:leading_span_min_cols]
        populated = sum(1 for v in leading_block if not _is_blank(v))
        if populated >= min_ignored_populated_cells:
            return LineItemTableRowType.IGNORED

        return LineItemTableRowType.CONTINUATION

    # col 0 is populated and not part of a wide merge span.
    if _is_numeric_label(row_values[0]):
        return LineItemTableRowType.LINE_ITEM

    # Non-numeric text in col 0, nothing merged -> a subheader label row
    # ("Line", "No.", etc.)
    return LineItemTableRowType.SUBHEADER



# --------------------------------------------------------------------------
# Fold raw rows into type-labeled logical rows
# --------------------------------------------------------------------------

@dataclass
class ClassifiedLineItemTable:
    labeled_df: pd.DataFrame                 # one row per logical entry, plus
                                               # '_row_type', '_raw_start_row',
                                               # '_raw_end_row' columns
    header_pivot_col: Optional[int]           # first column NOT part of the
                                               # table header's leading merge
                                               # span -- where the repeating
                                               # bidder pairs begin
    type_transitions: list                    # [(raw_row_index, LineItemTableRowType), ...]
                                               # each time the type changes


def build_classified_line_item_table(
    df: pd.DataFrame,
    leading_span_min_cols: int = 5,
    min_ignored_populated_cells: int = 2,
    join_str: str = " ",
) -> ClassifiedLineItemTable:
    """Walk the raw img2table dataframe top to bottom, classify each row,
    fold CONTINUATION, HEADER_CONTINUATION, and SUBHEADER_CONTINUATION
    rows into the logical row above, and record where the row type
    changes plus the header's pivot column."""
    logical_rows = []
    current_values = None
    current_type = None
    current_start_row = None
    header_pivot_col = None
    type_transitions = []

    columns = list(df.columns)

    for raw_idx, (_, row) in enumerate(df.iterrows()):
        values = [_clean_text(v) for v in row.tolist()]
        row_type = classify_raw_line_item_row(values, leading_span_min_cols, min_ignored_populated_cells)

        # A wrapped header line reproduces the header's own wide leading
        # merge span on every OCR-detected line, so it classifies as a
        # fresh HEADER just like the row that actually started the
        # block. Once a HEADER row is already open, treat any further
        # HEADER-shaped row as a continuation of it instead.
        if row_type == LineItemTableRowType.HEADER and current_type == LineItemTableRowType.HEADER:
            row_type = LineItemTableRowType.HEADER_CONTINUATION

        # Same problem, same fix, for the subheader: a wrapped subheader
        # line still has non-blank, non-numeric text in column 0 with no
        # merges, so it independently classifies as a fresh SUBHEADER.
        if row_type == LineItemTableRowType.SUBHEADER and current_type == LineItemTableRowType.SUBHEADER:
            row_type = LineItemTableRowType.SUBHEADER_CONTINUATION

        if (
            row_type
            in (LineItemTableRowType.CONTINUATION, LineItemTableRowType.HEADER_CONTINUATION, LineItemTableRowType.SUBHEADER_CONTINUATION)
            and current_values is not None
        ):
            for c, val in enumerate(values):
                if _is_blank(val):
                    continue
                existing = current_values[c]
                if _is_blank(existing):
                    current_values[c] = val
                    continue
                # Header-only: keep a '\n' between the columns before the
                # pivot, so that section stays parseable as its own
                # delimited lines later (the pivot-and-after columns fold
                # the same way everything else does -- join_str).
                if row_type == LineItemTableRowType.HEADER_CONTINUATION and (
                    header_pivot_col is None or c < header_pivot_col
                ):
                    sep = "\n"
                else:
                    sep = join_str
                current_values[c] = f"{existing}{sep}{val}"
            continue

        # a new logical row starts here (row_type is one of the 5 real types,
        # or it's a CONTINUATION with nothing open yet -- treat as its own
        # row rather than dropping data silently)
        if current_values is not None:
            logical_rows.append((current_start_row, raw_idx - 1, current_type, current_values))

        current_values = list(values)
        current_type = row_type
        current_start_row = raw_idx

        if row_type == LineItemTableRowType.HEADER and header_pivot_col is None:
            spans = detect_merge_spans(values)
            leading = next(s for s in spans if s.start_col == 0)
            header_pivot_col = leading.end_col + 1

        if not type_transitions or type_transitions[-1][1] != row_type:
            type_transitions.append((raw_idx, row_type))

    if current_values is not None:
        logical_rows.append((current_start_row, len(df) - 1, current_type, current_values))

    records = []
    for start_row, end_row, row_type, values in logical_rows:
        rec = dict(zip(columns, values))
        rec["_row_type"] = row_type.value
        rec["_raw_start_row"] = start_row
        rec["_raw_end_row"] = end_row
        records.append(rec)

    labeled_df = pd.DataFrame(records, columns=columns + ["_row_type", "_raw_start_row", "_raw_end_row"])

    return ClassifiedLineItemTable(
        labeled_df=labeled_df,
        header_pivot_col=header_pivot_col,
        type_transitions=type_transitions,
    )




# ==========================================================================
# Metadata Table
# ==========================================================================

# --------------------------------------------------------------------------
# Reshape: N column pairs (2N columns x n rows) -> 2 columns x (N * n) rows
# --------------------------------------------------------------------------

def reshape_column_pairs(
    df: pd.DataFrame,
    column_pairs: Tuple[Tuple[int, int], ...] = ((0, 1), (2, 3)),
) -> Tuple[pd.DataFrame, List[int]]:
    """Stack N side-by-side key/value column pairs into a single
    2-column dataframe, e.g. 4 columns x n rows -> 2 columns x 2n rows
    for 2 pairs. Each pair contributes its own block of exactly
    len(df) rows, in column-pair order, so a folded entry's
    `_raw_start_row` / `_raw_end_row` (see below) can always be mapped
    back to `raw_row % len(df)` in the original dataframe if needed.

    Returns the reshaped frame plus a parallel list giving each
    reshaped row's originating pair index -- needed by
    `extract_metadata_entries` to stop a pair's last, possibly-
    unterminated key from bleeding into the next pair's first key.
    """
    block_size = len(df)
    blocks = []
    pair_index_by_row: List[int] = []
    for pair_idx, (key_col, value_col) in enumerate(column_pairs):
        block = df.iloc[:, [key_col, value_col]].copy()
        block.columns = ["key", "value"]
        blocks.append(block)
        pair_index_by_row.extend([pair_idx] * block_size)
    reshaped = pd.concat(blocks, ignore_index=True)
    return reshaped, pair_index_by_row


def _key_terminated(key_piece) -> bool:
    """The signal the whole scheme rests on: a key's text is complete
    once (and only once) it ends with ':'. Note this is a real
    dependency -- if OCR ever drops a trailing colon, everything after
    it in that column gets folded into one runaway "key" until a colon
    is finally seen. Worth spot-checking your keys column for stray
    missing colons if entries come out merged unexpectedly."""
    return not _is_blank(key_piece) and str(key_piece).strip().endswith(":")


# --------------------------------------------------------------------------
# Fold: single pass over the reshaped 2-column frame
# --------------------------------------------------------------------------

def extract_metadata_entries(
    reshaped_df: pd.DataFrame,
    pair_index_by_row: List[int],
    join_str: str = " ",
) -> pd.DataFrame:
    """Detect, label, and fold the reshaped key/value rows into one
    entry per logical row.

    A row starts a new entry when its key cell is non-blank AND the
    previous entry's key has already reached a trailing ':' (or there's
    no open entry yet). Until a key terminates, any further non-blank
    text in the key column is a continuation of that SAME key, not a
    new entry. Once a key is done, further value text keeps folding
    into the current entry's value until the next key starts.

    Crossing from one pair's block into the next is always a hard
    boundary, regardless of whether the previous pair's last key ever
    saw a terminating ':' -- otherwise an unterminated key at the very
    end of pair 1 (an OCR miss, or just how the data ends) would
    silently swallow pair 2's first entry.

    Known edge case: if a value is still wrapping on the exact same raw
    row where the NEXT key begins, that row's value text is attributed
    to the new entry, not appended to the one being closed -- overflow
    is assumed to land on its own following row(s), per how you
    described the layout.
    """
    records = []

    current_key = None
    current_value = None
    key_open = False       # an entry is open and its key hasn't hit ':' yet
    start_row = None
    entry_pair = None      # which pair the OPEN entry belongs to
    last_seen_pair = None  # which pair the row we just looked at belongs to

    for raw_idx, (_, row) in enumerate(reshaped_df.iterrows()):
        this_pair = pair_index_by_row[raw_idx]
        key_piece = _clean_text(row["key"])
        value_piece = _clean_text(row["value"])

        if last_seen_pair is not None and this_pair != last_seen_pair:
            key_open = False  # hard reset at a pair boundary
        last_seen_pair = this_pair

        starts_new = (not _is_blank(key_piece)) and not key_open

        if starts_new:
            if current_key is not None:
                records.append({
                    "key": current_key,
                    "value": current_value,
                    "_pair_index": entry_pair,
                    "_raw_start_row": start_row,
                    "_raw_end_row": raw_idx - 1,
                })
            current_key = key_piece
            current_value = value_piece if not _is_blank(value_piece) else None
            key_open = not _key_terminated(key_piece)
            start_row = raw_idx
            entry_pair = this_pair
            continue

        has_content = (not _is_blank(key_piece)) or (not _is_blank(value_piece))
        if current_key is not None and has_content and this_pair == entry_pair:
            if not _is_blank(key_piece):
                current_key = (
                    key_piece if _is_blank(current_key) else f"{current_key}{join_str}{key_piece}"
                )
                if key_open and _key_terminated(key_piece):
                    key_open = False
            if not _is_blank(value_piece):
                current_value = (
                    value_piece if _is_blank(current_value) else f"{current_value}{join_str}{value_piece}"
                )
            continue

        # nothing to fold: either genuinely empty for this pair, or stray
        # content that arrived before any key opened this pair's entry

    if current_key is not None:
        records.append({
            "key": current_key,
            "value": current_value,
            "_pair_index": entry_pair,
            "_raw_start_row": start_row,
            "_raw_end_row": len(reshaped_df) - 1,
        })

    return pd.DataFrame(
        records, columns=["key", "value", "_pair_index", "_raw_start_row", "_raw_end_row"]
    )


# --------------------------------------------------------------------------
# Orchestration
# --------------------------------------------------------------------------

@dataclass
class MetadataTableResult:
    labeled_df: pd.DataFrame  # columns: key, value, _pair_index, _raw_start_row, _raw_end_row

    def to_ordered_dict(self, strip_colon: bool = True) -> "OrderedDict[str, Optional[str]]":
        """Flatten every folded row into one ordered key/value dict, in
        the labeled_df's row order (pair by pair, entry order within
        each pair)."""
        result: "OrderedDict[str, Optional[str]]" = OrderedDict()
        for _, row in self.labeled_df.iterrows():
            key = row["key"].rstrip(":").strip() if strip_colon else row["key"]
            result[key] = row["value"]
        return result


def build_metadata_table(
    df: pd.DataFrame,
    column_pairs: Tuple[Tuple[int, int], ...] = ((0, 1), (2, 3)),
    join_str: str = " ",
) -> MetadataTableResult:
    """Reshape N side-by-side key/value column pairs into one 2-column
    frame, then fold it into one entry per logical row. Default assumes
    the 4-column, 2-pair layout you described; pass more pairs if a
    table ever has more than two side-by-side lists."""
    reshaped_df, pair_index_by_row = reshape_column_pairs(df, column_pairs)
    labeled_df = extract_metadata_entries(reshaped_df, pair_index_by_row, join_str=join_str)
    return MetadataTableResult(labeled_df=labeled_df)





# ==========================================================================
# Summary Table
# ==========================================================================

# --------------------------------------------------------------------------
# Row type classification
# --------------------------------------------------------------------------

class SummaryRowType(str, Enum):
    HEADER = "header"
    DATA = "data"
    CONTINUATION = "continuation"  # internal only -- never appears in output


_DOLLAR_RE = re.compile(r"^\$")
_PERCENT_RE = re.compile(r"%\s*$")


def _looks_like_dollar(v) -> bool:
    return not _is_blank(v) and bool(_DOLLAR_RE.match(str(v).strip()))


def _looks_like_percent(v) -> bool:
    return not _is_blank(v) and bool(_PERCENT_RE.search(str(v).strip()))


def classify_raw_row(row_values: list, require_both_signals: bool = True) -> SummaryRowType:
    """A row is DATA if column 1 (0-indexed) looks like a dollar amount
    and column 2 looks like a percentage. `require_both_signals=True`
    (the default) requires both on the same raw row -- the safer
    setting, since a row that only half-matches is more likely a wrap
    continuation than a genuine data row missing one OCR'd symbol. Loosen
    to False (either signal alone counts) if your data turns out to
    have wrap-continuation lines that happen to only carry one of the
    two symbols and you're missing real data-row starts because of it.

    Anything that isn't DATA is provisionally HEADER -- whether it
    actually starts the header block or is really a wrap-continuation
    of an already-open row (header OR data) is contextual and gets
    resolved in `build_classified_table`, not here.
    """
    dollar = _looks_like_dollar(row_values[1]) if len(row_values) > 1 else False
    percent = _looks_like_percent(row_values[2]) if len(row_values) > 2 else False
    is_data = (dollar and percent) if require_both_signals else (dollar or percent)
    return SummaryRowType.DATA if is_data else SummaryRowType.HEADER


# --------------------------------------------------------------------------
# Fold raw rows into type-labeled logical rows
# --------------------------------------------------------------------------

@dataclass
class SummaryTableResult:
    labeled_df: pd.DataFrame       # one row per logical entry, plus '_row_type',
                                     # '_raw_start_row', '_raw_end_row' columns
    type_transitions: list = field(default_factory=list)  # [(raw_row_index, RowType), ...]
                                                             # each time the type changes


def build_summary_table(
    df: pd.DataFrame,
    require_both_signals: bool = True,
    join_str: str = " ",
) -> SummaryTableResult:
    """Walk the raw img2table dataframe top to bottom, classify each
    row, fold wrap-continuation rows into the logical row above, and
    record where the row type changes.

    A row provisionally classified HEADER is only actually treated as
    HEADER when nothing is open yet (i.e. it's the very first logical
    row of the table). If a HEADER or DATA row is already open, that
    same provisional HEADER classification is downgraded to
    CONTINUATION and folded in instead -- this is what lets a wrapped
    header line (still no '$'/'%' shape) fold into the header, and a
    wrapped data line (col 1/2 blank or missing a symbol because only
    part of the value wrapped) fold into the data row above it, using
    one shared mechanism.
    """
    records = []
    current_values = None
    current_type = None
    current_start_row = None
    type_transitions = []

    columns = list(df.columns)

    for raw_idx, (_, row) in enumerate(df.iterrows()):
        values = [_clean_text(v) for v in row.tolist()]
        row_type = classify_raw_row(values, require_both_signals)

        if row_type == SummaryRowType.HEADER and current_type is not None:
            row_type = SummaryRowType.CONTINUATION

        if row_type == SummaryRowType.CONTINUATION and current_values is not None:
            for c, val in enumerate(values):
                if _is_blank(val):
                    continue
                existing = current_values[c]
                current_values[c] = val if _is_blank(existing) else f"{existing}{join_str}{val}"
            continue

        # a new logical row starts here (HEADER, the first time nothing's
        # open yet, or DATA -- DATA always starts a fresh row, closing
        # whatever was open before, whether that was HEADER or a prior
        # DATA row)
        if current_values is not None:
            records.append(
                dict(
                    zip(
                        columns + ["_row_type", "_raw_start_row", "_raw_end_row"],
                        current_values + [current_type.value, current_start_row, raw_idx - 1],
                    )
                )
            )

        current_values = list(values)
        current_type = row_type
        current_start_row = raw_idx

        if not type_transitions or type_transitions[-1][1] != row_type:
            type_transitions.append((raw_idx, row_type))

    if current_values is not None:
        records.append(
            dict(
                zip(
                    columns + ["_row_type", "_raw_start_row", "_raw_end_row"],
                    current_values + [current_type.value, current_start_row, len(df) - 1],
                )
            )
        )

    labeled_df = pd.DataFrame(records, columns=columns + ["_row_type", "_raw_start_row", "_raw_end_row"])

    return SummaryTableResult(labeled_df=labeled_df, type_transitions=type_transitions)


if __name__ == "__main__":
    # Example wiring against an img2table ExtractedTable:
    #
    # result = build_classified_table(extracted_table.df)
    # print("pivot column:", result.header_pivot_col)
    # print("type changes at:", result.type_transitions)
    # line_items = result.labeled_df[result.labeled_df["_row_type"] == LineItemTableRowType.LINE_ITEM.value]
    pass
