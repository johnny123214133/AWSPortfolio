"""
In-memory data structures for accumulating everything extracted from
one project's PDF pages/tables -- one metadata table, one summary
table, and one or more line item tables spread across pages -- into a
single object graph shaped to match your Postgres schema directly.

Changes from the earlier, more speculative 3NF version, now that a
real schema exists to align to:

- Project's metadata is no longer a flexible key/value dict -- it's the
  fixed columns your schema gives it (project_number, project_name,
  concept, county, pin, delivery_method, bid_open_datetime). The
  metadata table's key/value pairs get mapped onto these via
  case-insensitive alias matching (`map_metadata_to_project_fields`),
  since the metadata table's own key text ("Project No", "Bid Opening
  Date", ...) won't exactly match your column names. Any metadata key
  that doesn't match a known alias is silently dropped -- there's no
  catch-all table left to put it in. Worth spot-checking real output
  against your actual metadata tables' key text.

- LineItem is likewise now fixed columns (item_number,
  container_description, item_name, additive_number, quantity, unit)
  instead of a free-form details dict, mapped the same way from the
  subheader's labels. One real loss: your schema has no column for the
  line-item table's own "Line" / "Line No." sequence number -- I'm
  dropping it rather than guessing where it belongs. Flag if you want
  it kept somewhere.

- LineItemTable and LineItemTableRegion are gone entirely -- your
  schema has no table for "which line item table did this come from"
  at all. Line items link straight to the one Project
  (LineItemProject), and regions collapse to a project-wide set
  (Region + ProjectRegion), not one per line item table. If two line
  item tables in the same project ever report different regions,
  you'll get both in the set with no way to tell which table said
  which -- that granularity is simply gone from this schema.

- BidSummaryBreakdown -- each line item table's own non-subtotal
  SUMMARY row(s) -- has NO home in this schema either. There's no
  label/source column on BidSummary to distinguish "the project's real
  bid summary" from "this one table's subtotal," and no join table
  wired up for it. Dropped outright rather than silently mixed into
  `bid_summary` and losing that distinction. Say so if you want these
  captured some other way -- e.g. folded into bid_summary anyway
  (losing the label), or a new table added.

- Engineer's Estimate is split across two different places, which is
  worth being explicit about: the standalone summary table's
  Engineer's Estimate ROW is redirected to `Project.engineer_estimate`
  (a plain text field, matching your schema's type) instead of
  becoming a Company/BidSummary/BidSummaryCompany entry -- there's
  nowhere else in the schema for a single project-wide estimate value.
  But within each LINE ITEM TABLE, "Engineer's Estimate" is still
  treated as an ordinary Company for LineItemEstimate purposes, since
  that's the only mechanism your schema provides for storing a
  per-line-item number tied to an entity, and dropping it would lose
  real per-line-item data. So you'll see "Engineer's Estimate" as a
  Company row (for line item estimates) but NOT as a BidSummary row.

- Every table's `id` in your schema is a database-assigned surrogate
  key -- nothing here assigns one. Company was already like this
  (`name` is its natural key). The same now applies everywhere:
  BidSummary, LineItem, and LineItemEstimate rows get a `_temp_id` in
  the exported dicts purely so join-table rows in the SAME export can
  reference the right not-yet-inserted parent -- these are correlation
  keys for your load script, not literal primary keys. See
  `to_relational_tables`'s docstring for the intended load order.

Assumes, unless told otherwise, that metadata_table_extraction.py and
summary_table_extraction.py are merged into table_extraction.py
alongside the line-item logic, matching the uploaded files.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Set, Tuple

import pandas as pd

from .table_extraction import SummaryRowType, SummaryTableResult, MetadataTableResult
from .parse_line_item_table import ParsedLineItemTable


def _is_blank(v) -> bool:
    return v is None or (isinstance(v, float) and pd.isna(v)) or str(v).strip() == ""


def _clean_text(v) -> Optional[str]:
    return None if _is_blank(v) else str(v).strip()


_NUMERIC_CLEAN_RE = re.compile(r"[^0-9.\-]")


def _parse_number(v) -> Optional[float]:
    """Strips '$', ',', '%', and any other non-numeric characters, then
    parses what's left. Used for both dollar amounts and percentages --
    stripping is identical either way, only the source column differs."""
    if _is_blank(v):
        return None
    cleaned = _NUMERIC_CLEAN_RE.sub("", str(v))
    if cleaned in ("", "-", "."):
        return None
    try:
        return float(cleaned)
    except ValueError:
        return None


_SUBTOTAL_RE = re.compile(r"sub[\s-]?total", re.IGNORECASE)


def _is_subtotal_label(label) -> bool:
    return not _is_blank(label) and bool(_SUBTOTAL_RE.search(str(label)))


def _split_company_column(col_name: str) -> Optional[Tuple[str, str]]:
    """parse_line_item_table.py names trailing columns "<field> - <company>"
    (e.g. "Unit Price - KILGORE COMPANIES, LLC"). Returns (field, company)
    or None if this column isn't one of those (i.e. it's a leading detail
    column with no ' - ' in its name)."""
    if " - " not in col_name:
        return None
    field_label, _, company_name = col_name.partition(" - ")
    return field_label.strip(), company_name.strip()


def _group_company_columns(columns) -> Dict[str, Dict[str, str]]:
    """{company_name: {"unit_price": col_name, "amount": col_name}},
    grouping the renamed Unit Price / Amount columns by the company name
    embedded in each column's label."""
    grouped: Dict[str, Dict[str, str]] = {}
    for col in columns:
        split = _split_company_column(col)
        if split is None:
            continue
        field_label, company_name = split
        key = (
            "unit_price" if "unit price" in field_label.lower()
            else "amount" if "amount" in field_label.lower()
            else field_label.lower()
        )
        grouped.setdefault(company_name, {})[key] = col
    return grouped


# --------------------------------------------------------------------------
# Field-name mapping: extracted labels -> your schema's fixed columns
# --------------------------------------------------------------------------

_PROJECT_FIELD_ALIASES: Dict[str, List[str]] = {
    "project_number": ["project no", "project number", "project #"],
    "project_name": ["project name"],
    "concept": ["concept"],
    "county": ["county"],
    "pin": ["pin"],
    "delivery_method": ["delivery method"],
    "bid_open_datetime": ["bid opening date", "bid open date", "bid opening"],
}


def map_metadata_to_project_fields(metadata: Dict[str, Optional[str]]) -> Dict[str, Optional[str]]:
    """Case-insensitive substring match of each metadata key against
    the aliases above. First match wins; a metadata key matching no
    alias is dropped (there's no catch-all column left for it)."""
    result: Dict[str, Optional[str]] = {name: None for name in _PROJECT_FIELD_ALIASES}
    for key, value in metadata.items():
        if _is_blank(key):
            continue
        normalized_key = key.strip().lower()
        for field_name, aliases in _PROJECT_FIELD_ALIASES.items():
            if result[field_name] is not None:
                continue
            if any(alias in normalized_key for alias in aliases):
                result[field_name] = _clean_text(value)
                break
    return result


_LINE_ITEM_DETAIL_ALIASES: Dict[str, List[str]] = {
    "item_number": ["item no", "item number"],
    "container_description": ["container"],
    "item_name": ["item name"],
    "additive_number": ["additive"],
    "quantity": ["qty", "quantity"],
    "unit": ["unit"],
}


def _map_detail_column(label: str) -> Optional[str]:
    """Maps a subheader label (e.g. "Container Description") to the
    matching LineItem field name, or None if nothing matches (e.g.
    "Line No." -- there's no schema column for it, see module
    docstring)."""
    normalized = label.strip().lower()
    for field_name, aliases in _LINE_ITEM_DETAIL_ALIASES.items():
        if any(alias in normalized for alias in aliases):
            return field_name
    return None


# --------------------------------------------------------------------------
# Company registry
# --------------------------------------------------------------------------

def _normalize_company_name(name: str) -> str:
    return " ".join(name.strip().split()).upper()


@dataclass
class Company:
    name: str  # as first encountered; the natural key everything else references


class CompanyRegistry:
    """Dedupes company names -- including "Engineer's Estimate" -- across
    every line item table by normalized name. No id is assigned here;
    `Company.name` is the key every other entity references, and a
    database-assigned surrogate key is the database's job on insert."""

    def __init__(self):
        self._by_normalized_name: Dict[str, Company] = {}

    def get_or_create(self, name: str) -> Company:
        key = _normalize_company_name(name)
        existing = self._by_normalized_name.get(key)
        if existing is not None:
            return existing
        company = Company(name=name.strip())
        self._by_normalized_name[key] = company
        return company

    def all(self) -> List[Company]:
        return list(self._by_normalized_name.values())


# --------------------------------------------------------------------------
# Bid summary
# --------------------------------------------------------------------------

@dataclass
class BidSummaryEntry:
    """One row of the project's overall bid summary, from the standalone
    3-column summary table: a company's total amount and its percentage
    (e.g. relative to the engineer's estimate). Engineer's Estimate
    itself never becomes one of these -- see module docstring."""
    company_name: str
    amount: Optional[float]
    percentage: Optional[float]


# --------------------------------------------------------------------------
# Line items
# --------------------------------------------------------------------------

@dataclass
class LineItemEstimate:
    company_name: str
    unit_price: Optional[float]
    amount: Optional[float]


@dataclass
class LineItem:
    item_number: Optional[str] = None
    container_description: Optional[str] = None
    item_name: Optional[str] = None
    additive_number: Optional[str] = None
    quantity: Optional[str] = None
    unit: Optional[str] = None
    estimates: List[LineItemEstimate] = field(default_factory=list)


# --------------------------------------------------------------------------
# Project
# --------------------------------------------------------------------------

@dataclass
class Project:
    project_number: Optional[str] = None
    project_name: Optional[str] = None
    concept: Optional[str] = None
    county: Optional[str] = None
    pin: Optional[str] = None
    delivery_method: Optional[str] = None
    bid_open_datetime: Optional[str] = None
    engineer_estimate: Optional[str] = None
    regions: Set[str] = field(default_factory=set)
    companies: CompanyRegistry = field(default_factory=CompanyRegistry)
    bid_summary: List[BidSummaryEntry] = field(default_factory=list)
    line_items: List[LineItem] = field(default_factory=list)


# --------------------------------------------------------------------------
# Builder: accumulate a Project while looping through a file's pages/tables
# --------------------------------------------------------------------------

class ProjectBuilder:
    """Feed this one table result at a time as you loop through a file's
    pages -- metadata and summary tables are expected once (page 1),
    line item tables zero-or-more times per page thereafter (the first
    may also land on page 1 alongside the other two)."""

    def __init__(self):
        self.project = Project()

    def add_metadata_table(self, result: MetadataTableResult) -> None:
        mapped = map_metadata_to_project_fields(result.to_ordered_dict())
        self.project.project_number = mapped["project_number"]
        self.project.project_name = mapped["project_name"]
        self.project.concept = mapped["concept"]
        self.project.county = mapped["county"]
        self.project.pin = mapped["pin"]
        self.project.delivery_method = mapped["delivery_method"]
        self.project.bid_open_datetime = mapped["bid_open_datetime"]

    def add_summary_table(self, result: SummaryTableResult) -> None:
        labeled = result.labeled_df
        columns = [c for c in labeled.columns if not str(c).startswith("_")]
        if len(columns) < 3:
            raise ValueError("summary table's labeled_df needs at least 3 content columns")

        data_rows = labeled[labeled["_row_type"] == SummaryRowType.DATA.value]
        for _, row in data_rows.iterrows():
            company_name = row[columns[0]]
            if _is_blank(company_name):
                continue

            if "engineer" in str(company_name).lower():
                # Project-level field, not a Company/BidSummary row -- see
                # module docstring. Keep the first one seen if this ever
                # gets called more than once.
                if self.project.engineer_estimate is None:
                    self.project.engineer_estimate = _clean_text(row[columns[1]])
                continue

            company = self.project.companies.get_or_create(company_name)
            self.project.bid_summary.append(
                BidSummaryEntry(
                    company_name=company.name,
                    amount=_parse_number(row[columns[1]]),
                    percentage=_parse_number(row[columns[2]]),
                )
            )

    def add_line_item_table(self, parsed: ParsedLineItemTable) -> None:
        if not _is_blank(parsed.region):
            self.project.regions.add(parsed.region.strip())

        company_columns = _group_company_columns(parsed.line_items.columns)
        for company_name in company_columns:
            # Engineer's Estimate DOES become a Company here -- this is
            # the per-line-item path, distinct from the summary table's
            # project-level handling above. See module docstring.
            self.project.companies.get_or_create(company_name)

        detail_cols = [c for c in parsed.line_items.columns if _split_company_column(c) is None]
        field_by_col = {col: _map_detail_column(col) for col in detail_cols}

        for _, row in parsed.line_items.iterrows():
            fields: Dict[str, str] = {}
            for col, field_name in field_by_col.items():
                if field_name is None:
                    continue  # e.g. "Line No." -- no matching schema column
                value = _clean_text(row[col])
                if value is not None:
                    fields[field_name] = value

            line_item = LineItem(**fields)

            for company_name, cols in company_columns.items():
                unit_price = row.get(cols.get("unit_price"))
                amount = row.get(cols.get("amount"))
                if _is_blank(unit_price) and _is_blank(amount):
                    continue
                line_item.estimates.append(
                    LineItemEstimate(
                        company_name=company_name,
                        unit_price=_parse_number(unit_price),
                        amount=_parse_number(amount),
                    )
                )

            self.project.line_items.append(line_item)

        # This table's own non-subtotal SUMMARY rows are intentionally
        # not captured anywhere -- no table in your schema holds them.
        # See module docstring if you want that changed.


# --------------------------------------------------------------------------
# Relational export
# --------------------------------------------------------------------------

def to_relational_tables(project: Project) -> Dict[str, List[dict]]:
    """One list of dict rows per table/join-table in your schema.

    None of these have a real database id -- every `id` column in your
    schema is a surrogate key Postgres assigns on insert. The
    `_temp_id` fields below exist only so a join-table row in this SAME
    export can be correlated back to its not-yet-inserted parent row;
    they are not meant to be inserted as literal primary keys.

    Suggested load order, since several tables here have no direct
    foreign key of their own and rely on natural-key matching instead:
      1. Insert the single `project` row -> capture its real id.
      2. Insert `region` (deduped text) and `company` (deduped name) ->
         capture their real ids, keyed by the region text / company name.
      3. Insert `bid_summary`, `line_item`, `line_item_estimate`,
         remapping each row's `_temp_id` to its real inserted id as you go.
      4. Insert every join table last: `project_region` and
         `line_item_project` both implicitly reference the ONE project's
         real id from step 1 (nothing below names it explicitly, since
         this export is always for a single project); `bid_summary_company`,
         `line_item_line_item_estimate`, and `company_line_item_estimate`
         resolve their `_temp_id` / company-name references using the
         ids you captured in steps 2-3.
    """
    bid_summary_rows = []
    bid_summary_company_rows = []
    for i, entry in enumerate(project.bid_summary):
        bid_summary_rows.append({"_temp_id": i, "amount": entry.amount, "percentage": entry.percentage})
        bid_summary_company_rows.append({"bid_summary_temp_id": i, "company_name": entry.company_name})

    line_item_rows = []
    line_item_estimate_rows = []
    line_item_line_item_estimate_rows = []
    company_line_item_estimate_rows = []
    estimate_temp_id = 0
    for i, li in enumerate(project.line_items):
        line_item_rows.append({
            "_temp_id": i,
            "item_number": li.item_number,
            "container_description": li.container_description,
            "item_name": li.item_name,
            "additive_number": li.additive_number,
            "quantity": li.quantity,
            "unit": li.unit,
        })
        for est in li.estimates:
            line_item_estimate_rows.append({
                "_temp_id": estimate_temp_id,
                "unit_price": est.unit_price,
                "amount": est.amount,
            })
            line_item_line_item_estimate_rows.append({
                "line_item_temp_id": i,
                "line_item_estimate_temp_id": estimate_temp_id,
            })
            company_line_item_estimate_rows.append({
                "company_name": est.company_name,
                "line_item_estimate_temp_id": estimate_temp_id,
            })
            estimate_temp_id += 1

    return {
        "project": [{
            "project_number": project.project_number,
            "project_name": project.project_name,
            "concept": project.concept,
            "county": project.county,
            "pin": project.pin,
            "delivery_method": project.delivery_method,
            "bid_open_datetime": project.bid_open_datetime,
            "engineer_estimate": project.engineer_estimate,
        }],
        "region": [{"region": r} for r in sorted(project.regions)],
        "project_region": [{"region": r} for r in sorted(project.regions)],
        "company": [{"name": c.name} for c in project.companies.all()],
        "bid_summary": bid_summary_rows,
        "bid_summary_company": bid_summary_company_rows,
        "line_item": line_item_rows,
        "line_item_project": [{"line_item_temp_id": row["_temp_id"]} for row in line_item_rows],
        "line_item_estimate": line_item_estimate_rows,
        "line_item_line_item_estimate": line_item_line_item_estimate_rows,
        "company_line_item_estimate": company_line_item_estimate_rows,
    }


# --------------------------------------------------------------------------
# Flat dataframe views (for quick inspection / spreadsheets, not the DB load)
# --------------------------------------------------------------------------

@dataclass
class ProjectDataFrames:
    metadata_df: pd.DataFrame
    bid_summaries_df: pd.DataFrame
    line_items_df: pd.DataFrame


def _build_metadata_dataframe(project: Project) -> pd.DataFrame:
    region_value = " & ".join(sorted(project.regions)) if project.regions else None
    rows = [
        ("project_number", project.project_number),
        ("project_name", project.project_name),
        ("concept", project.concept),
        ("county", project.county),
        ("region", region_value),
        ("pin", project.pin),
        ("delivery_method", project.delivery_method),
        ("bid_open_datetime", project.bid_open_datetime),
        ("engineer_estimate", project.engineer_estimate),
    ]
    return pd.DataFrame(rows, columns=["field", "value"])


def _build_bid_summaries_dataframe(project: Project) -> pd.DataFrame:
    rows = [
        {
            "Company": e.company_name,
            "Amount": e.amount,
            "Percent of Engineer Estimate": e.percentage,
        }
        for e in project.bid_summary
    ]
    return pd.DataFrame(rows, columns=["Company", "Amount", "Percent of Engineer Estimate"])


def _build_line_items_dataframe(project: Project) -> pd.DataFrame:
    """Detail columns, left-joined against each company's (unit_price,
    amount) pair. Reuses the exact same _temp_id idea as
    `to_relational_tables` -- it's what lets the per-company columns be
    aligned back to the right line item without any real database id."""
    detail_columns = ["item_number", "container_description", "item_name", "additive_number", "quantity", "unit"]

    detail_rows = []
    estimate_rows = []
    for temp_id, li in enumerate(project.line_items):
        row = {"_temp_id": temp_id}
        for col in detail_columns:
            row[col] = getattr(li, col)
        detail_rows.append(row)
        for est in li.estimates:
            estimate_rows.append({
                "_temp_id": temp_id,
                "company_name": est.company_name,
                "unit_price": est.unit_price,
                "amount": est.amount,
            })

    details_df = pd.DataFrame(detail_rows, columns=["_temp_id"] + detail_columns).set_index("_temp_id")

    if not estimate_rows:
        return details_df.reset_index(drop=True)

    estimates_df = pd.DataFrame(estimate_rows)
    # stable column order: each company's pair appears in the order that
    # company was first encountered across the line items
    company_order = list(dict.fromkeys(estimates_df["company_name"]))

    result = details_df
    for company in company_order:
        company_estimates = estimates_df[estimates_df["company_name"] == company].set_index("_temp_id")
        # assigning a Series onto a DataFrame column aligns by index --
        # this IS the left join: every line item's _temp_id gets that
        # company's value where present, NaN where the company didn't
        # bid on it
        result[f"unit_price - {company}"] = company_estimates["unit_price"]
        result[f"amount - {company}"] = company_estimates["amount"]

    return result.reset_index(drop=True)


def build_project_dataframes(project: Project) -> ProjectDataFrames:
    return ProjectDataFrames(
        metadata_df=_build_metadata_dataframe(project),
        bid_summaries_df=_build_bid_summaries_dataframe(project),
        line_items_df=_build_line_items_dataframe(project),
    )


if __name__ == "__main__":
    # Example wiring while looping through a file's pages/tables:
    #
    # builder = ProjectBuilder()
    # builder.add_metadata_table(metadata_result)          # page 1
    # builder.add_summary_table(summary_result)            # page 1
    # for page_number, tables in extracted_tables_by_page.items():
    #     for extracted_table in tables:
    #         classified = build_classified_line_item_table(extracted_table.df)
    #         parsed = parse_line_item_table(classified)
    #         builder.add_line_item_table(parsed)
    #
    # project = builder.project
    # relational_tables = to_relational_tables(project)
    pass