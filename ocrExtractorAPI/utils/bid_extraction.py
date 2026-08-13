"""
Runs img2table extraction over a (cleaned) PDF's bytes and assembles
the results into a Project via ProjectBuilder -- the piece that used to
be inline in extract_bids(). Takes bytes directly rather than a file
path, so it works the same whether the PDF came from disk or straight
out of an upload; nothing here touches the filesystem.
"""

from __future__ import annotations

from typing import Dict, List, Optional

from img2table.document import PDF
from img2table.ocr import TesseractOCR

from .table_extraction import build_classified_line_item_table, build_metadata_table, build_summary_table
from .parse_line_item_table import parse_line_item_table
from .project_builder import Project, ProjectBuilder


def make_default_ocr() -> TesseractOCR:
    return TesseractOCR(n_threads=1, lang="eng")


def extract_tables_by_page(
    pdf_bytes: bytes,
    ocr: TesseractOCR,
    implicit_rows: bool = True,
    borderless_tables: bool = True,
    min_confidence: int = 50,
) -> Dict[int, List]:
    doc = PDF(src=pdf_bytes)
    return doc.extract_tables(
        ocr=ocr,
        implicit_rows=implicit_rows,
        borderless_tables=borderless_tables,
        min_confidence=min_confidence,
    )


def _add_line_item_table(builder: ProjectBuilder, extracted_table) -> None:
    classified = build_classified_line_item_table(extracted_table.df)
    parsed = parse_line_item_table(classified)
    builder.add_line_item_table(parsed)


def _add_page_zero_tables(builder: ProjectBuilder, extracted_tables: List) -> None:
    """Page 1 (index 0) is assumed to lead with the metadata table,
    then the summary table, then zero or more line item tables --
    matched by each table's column count (metadata: 2 or 4 columns;
    summary: 3). This positional assumption carries over unchanged from
    the original extraction script; tighten it if a real document ever
    puts these tables in a different order, or a metadata/summary table
    ever legitimately shares a column count with something else.
    """
    num_tables = len(extracted_tables)

    if num_tables > 0 and len(extracted_tables[0].df.columns) in (2, 4):
        builder.add_metadata_table(build_metadata_table(extracted_tables[0].df))

    if num_tables > 1 and len(extracted_tables[1].df.columns) == 3:
        builder.add_summary_table(build_summary_table(extracted_tables[1].df))

    for extracted_table in extracted_tables[2:]:
        _add_line_item_table(builder, extracted_table)


def build_project_from_extracted_tables(extracted_tables_by_page: Dict[int, List]) -> Project:
    builder = ProjectBuilder()
    for page_num, extracted_tables in extracted_tables_by_page.items():
        if page_num == 0:
            _add_page_zero_tables(builder, extracted_tables)
        else:
            for extracted_table in extracted_tables:
                _add_line_item_table(builder, extracted_table)
    return builder.project


def extract_project_from_pdf_bytes(
    pdf_bytes: bytes,
    ocr: Optional[TesseractOCR] = None,
    **extract_tables_kwargs,
) -> Project:
    """The direct bytes-in, Project-out entry point -- what an API
    endpoint should call once it has an uploaded (and cleaned) PDF's
    bytes in hand, with no dependency on anything already being on
    disk."""
    ocr = ocr or make_default_ocr()
    extracted_tables_by_page = extract_tables_by_page(pdf_bytes, ocr, **extract_tables_kwargs)
    return build_project_from_extracted_tables(extracted_tables_by_page)