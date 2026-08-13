"""
PDF pre-processing: sanitizing uploaded filenames and correcting page
rotation before OCR/table extraction runs on a document. Works
entirely in memory (bytes in, bytes out), so it runs the same whether
the PDF came from disk or straight out of an upload -- the caller
decides whether and where to persist the cleaned result.
"""

from __future__ import annotations

import logging
import re
from io import BytesIO

import pypdf
import pytesseract
from pdf2image import convert_from_bytes

logger = logging.getLogger(__name__)


def sanitize_filename(filename: str) -> str:
    """Collapses any run of characters that aren't alphanumeric or '.'
    into a single underscore, then trims leading/trailing underscores.

    Replaces the original character-by-character rewrite loop, which
    walked the string by index while mutating its length in place --
    fragile by construction (started at index 1 so it never revisited
    index 0, manually rewound the index after deletions, and could run
    past the end of the string once the string had shrunk). This
    produces the same kind of output -- spaces and dashes become
    underscores, doubled-up separators collapse to one -- without the
    manual bookkeeping.
    """
    sanitized = re.sub(r"[^A-Za-z0-9.]+", "_", filename)
    sanitized = re.sub(r"_+", "_", sanitized)
    return sanitized.strip("_")


def _detect_page_rotation(page_image) -> int:
    """Degrees of rotation pytesseract's orientation detection thinks
    this page needs, or 0 if there's too little text/features to tell."""
    try:
        osd_data = pytesseract.image_to_osd(page_image, output_type=pytesseract.Output.DICT)
        return osd_data.get("rotate", 0)
    except pytesseract.TesseractError:
        logger.info("Could not detect page orientation (insufficient text/features); keeping 0 degrees.")
        return 0


def clean_pdf_bytes(raw_bytes: bytes, dpi: int = 300) -> bytes:
    """Rotates every page right-side-up based on pytesseract's
    orientation detection, entirely in memory -- no temp files, no
    path arguments. Returns the cleaned PDF's bytes; write them to disk
    yourself if you want an archival copy, this function doesn't touch
    the filesystem."""
    pages_as_images = convert_from_bytes(raw_bytes, dpi=dpi)
    reader = pypdf.PdfReader(BytesIO(raw_bytes), strict=False)
    writer = pypdf.PdfWriter()

    for page_index, page_image in enumerate(pages_as_images):
        rotation_needed = _detect_page_rotation(page_image)
        page = reader.pages[page_index]
        page.rotate(rotation_needed)
        page.transfer_rotation_to_content()
        writer.add_page(page)

    output = BytesIO()
    writer.write(output)
    return output.getvalue()