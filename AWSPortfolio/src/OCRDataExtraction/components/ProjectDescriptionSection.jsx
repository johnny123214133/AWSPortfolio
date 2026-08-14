import React from "react";

export default function ProjectDescriptionSection() {
  return (
    <section
      className="project-description-section"
      aria-labelledby="project-description-heading"
    >
      <h2 id="project-description-heading">About this tool</h2>
      <p>
        This page is a simple front end for a PDF data-extraction tool originally built
        for a client: upload a bid PDF and it uses Tesseract OCR to read the document,
        then parses the project metadata, bid summary, and line-item tables out into
        structured data.
      </p>
      <p>
        The documents this tool was built for are client-confidential, so an actual
        sample PDF can't be provided here. Instead, the spreadsheet available for
        download below is a spoofed stand-in built to match the same layout the tool
        expects -- since extraction depends heavily on the source PDF's formatting,
        export that spreadsheet to PDF yourself to get something the tool can actually
        process.
      </p>
      <p>
        Because of that formatting dependence, arbitrary PDFs outside this format likely
        won't extract cleanly. Nothing you upload is stored anywhere beyond the
        extraction request itself.
      </p>
    </section>
  );
}