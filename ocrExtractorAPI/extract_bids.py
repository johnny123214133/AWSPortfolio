"""
Terminal entry point for the bid-extraction pipeline: clean a PDF's
page rotation, then extract its Project data -- either for every PDF in
a directory (the original default behavior) or for a single named
file.

The cleaned PDF's bytes flow straight from `clean_pdf_bytes` into
`extract_project_from_pdf_bytes` without a disk round-trip; a cleaned
copy is still written to disk for archival purposes if
`clean_output_dir` is given. `process_pdf_bytes` below is the function
that does this -- it's also the one to reuse for an eventual API
endpoint that receives an uploaded PDF's bytes directly, since it has
no dependency on anything already being on disk (only the optional
archival write does, and that's skippable).

Usage:
    python extract_bids.py                       # process ./imported_files
    python extract_bids.py --file some/path.pdf   # process a single file
    python extract_bids.py --raw-dir X --clean-dir Y
"""

from __future__ import annotations

import argparse
import json
import logging
from pathlib import Path
from typing import Dict, List, Optional

from img2table.ocr import TesseractOCR

from utils.pdf_cleaning import clean_pdf_bytes, sanitize_filename
from utils.bid_extraction import extract_project_from_pdf_bytes, make_default_ocr
from utils.project_builder import Project, ProjectDataFrames, build_project_dataframes

logger = logging.getLogger(__name__)

DEFAULT_RAW_DIR = Path.cwd() / "imported_files"
DEFAULT_CLEAN_DIR = Path.cwd() / "cleaned_files"
DEFAULT_CSV_DIR = Path.cwd() / "csv_exports"


def process_pdf_bytes(
    raw_bytes: bytes,
    filename: str,
    ocr: Optional[TesseractOCR] = None,
    clean_output_dir: Optional[Path] = None,
) -> Project:
    """Bytes in, Project out -- call this from an API handler with an
    uploaded file's raw bytes. `clean_output_dir`, if given, is purely
    an archival side effect: the cleaned bytes are written there AND
    passed directly into extraction, never read back from disk.
    """
    ocr = ocr or make_default_ocr()

    cleaned_bytes = clean_pdf_bytes(raw_bytes)

    if clean_output_dir is not None:
        clean_output_dir.mkdir(parents=True, exist_ok=True)
        clean_path = clean_output_dir / sanitize_filename(filename)
        clean_path.write_bytes(cleaned_bytes)
        logger.info("Wrote cleaned PDF to %s", clean_path)

    return extract_project_from_pdf_bytes(cleaned_bytes, ocr=ocr)


def process_pdf_file(
    path: Path,
    ocr: Optional[TesseractOCR] = None,
    clean_output_dir: Optional[Path] = None,
) -> Project:
    return process_pdf_bytes(
        path.read_bytes(), filename=path.name, ocr=ocr, clean_output_dir=clean_output_dir
    )


def process_directory(
    raw_dir: Path,
    clean_dir: Path,
    ocr: Optional[TesseractOCR] = None,
) -> Dict[str, Project]:
    ocr = ocr or make_default_ocr()
    clean_dir.mkdir(parents=True, exist_ok=True)

    projects: Dict[str, Project] = {}
    for item in sorted(raw_dir.iterdir()):
        if item.suffix.lower() != ".pdf":
            continue
        project = process_pdf_file(item, ocr=ocr, clean_output_dir=clean_dir)
        projects[sanitize_filename(item.name)] = project
    return projects


def write_project_dataframes_to_csv(pdf_filename: str, project: Project, output_dir: Path) -> None:
    """Writes this project's three summary dataframes to their own CSVs
    in `output_dir`, named after the sanitized PDF filename (extension
    stripped) plus the dataframe's kind -- e.g. "project_1-b.pdf" ->
    "project_1_b_metadata.csv", "project_1_b_bid_summaries.csv",
    "project_1_b_line_items.csv"."""
    output_dir.mkdir(parents=True, exist_ok=True)
    base_name = Path(sanitize_filename(pdf_filename)).stem

    dataframes = build_project_dataframes(project)
    dataframes.metadata_df.to_csv(output_dir / f"{base_name}_metadata.csv", index=False)
    dataframes.bid_summaries_df.to_csv(output_dir / f"{base_name}_bid_summaries.csv", index=False)
    dataframes.line_items_df.to_csv(output_dir / f"{base_name}_line_items.csv", index=False)


def write_projects_to_csv(projects: Dict[str, Project], output_dir: Path) -> None:
    for filename, project in projects.items():
        write_project_dataframes_to_csv(filename, project, output_dir)
        logger.info("Wrote CSVs for %s to %s", filename, output_dir)


def extract_bids(
    raw_dir: Path = DEFAULT_RAW_DIR,
    clean_dir: Path = DEFAULT_CLEAN_DIR,
    export_csv: bool = False,
    csv_dir: Path = DEFAULT_CSV_DIR,
) -> Dict[str, Project]:
    """Original entry point, preserved: process every PDF in `raw_dir`.
    Delegates to `process_directory` now that the actual work is split
    out into independently-callable, testable functions. Pass
    `export_csv=True` to also write each project's metadata/bid-summary/
    line-item dataframes to CSV in `csv_dir` once the projects dict is
    built."""
    projects = process_directory(raw_dir, clean_dir)
    if export_csv:
        write_projects_to_csv(projects, csv_dir)
    return projects


# --------------------------------------------------------------------------
# API-facing: bytes in, JSON-serializable dict out
# --------------------------------------------------------------------------

def _dataframe_to_json_records(df) -> List[dict]:
    """Routes through pandas' own to_json rather than df.to_dict() +
    json.dumps(), so NaN/NaT become proper JSON null instead of the
    non-standard bare `NaN` literal Python's json module would
    otherwise emit."""
    return json.loads(df.to_json(orient="records"))


def project_dataframes_to_json(dataframes: ProjectDataFrames) -> Dict[str, List[dict]]:
    return {
        "metadata": _dataframe_to_json_records(dataframes.metadata_df),
        "bid_summaries": _dataframe_to_json_records(dataframes.bid_summaries_df),
        "line_items": _dataframe_to_json_records(dataframes.line_items_df),
    }


def extract_bids_json(
    raw_bytes: bytes,
    filename: str,
    ocr: Optional[TesseractOCR] = None,
    clean_output_dir: Optional[Path] = None,
) -> Dict[str, List[dict]]:
    """The function an API handler calls: uploaded PDF bytes in, a
    JSON-serializable dict out (`{"metadata": [...], "bid_summaries":
    [...], "line_items": [...]}`), with each list holding one dict per
    dataframe row. `clean_output_dir` stays fully optional here too --
    omit it and nothing touches disk at all.
    """
    project = process_pdf_bytes(raw_bytes, filename, ocr=ocr, clean_output_dir=clean_output_dir)
    dataframes = build_project_dataframes(project)
    return project_dataframes_to_json(dataframes)


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Extract bid data from PDF(s).")
    parser.add_argument(
        "--file", type=Path, default=None,
        help="Process a single PDF instead of everything in --raw-dir.",
    )
    parser.add_argument(
        "--raw-dir", type=Path, default=DEFAULT_RAW_DIR,
        help="Directory of PDFs to process (default: %(default)s).",
    )
    parser.add_argument(
        "--clean-dir", type=Path, default=DEFAULT_CLEAN_DIR,
        help="Where cleaned PDF copies are written (default: %(default)s).",
    )
    parser.add_argument(
        "--export-csv", action="store_true",
        help="Also write each project's metadata/bid-summary/line-item dataframes to CSV.",
    )
    parser.add_argument(
        "--csv-dir", type=Path, default=DEFAULT_CSV_DIR,
        help="Where exported CSVs are written when --export-csv is set (default: %(default)s).",
    )
    return parser.parse_args()


def main() -> Dict[str, Project]:
    logging.basicConfig(level=logging.INFO)
    args = _parse_args()

    if args.file is not None:
        args.clean_dir.mkdir(parents=True, exist_ok=True)
        project = process_pdf_file(args.file, clean_output_dir=args.clean_dir)
        projects = {sanitize_filename(args.file.name): project}
    else:
        projects = process_directory(args.raw_dir, args.clean_dir)

    write_projects_to_csv(projects, args.csv_dir)

    for filename, project in projects.items():
        print(
            f"{filename}: {len(project.line_items)} line item(s), "
            f"{len(project.bid_summary)} bid summary row(s)"
        )

    return projects


if __name__ == "__main__":
    main()