import React, { useId } from "react";
import { useBidExtraction } from "../contexts/BidExtractionContext";

// Point this at wherever the template actually lives -- a static asset
// served by this app, or a backend route, depending on what you set up.
const TEMPLATE_URL = "/templates/sample_bid_summary.xlsx";

export default function UploadSection() {
  const { file, selectFile, extract, isLoading, error } = useBidExtraction();
  const fileInputId = useId();

  const handleFileChange = (event) => {
    selectFile(event.target.files?.[0] ?? null);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    extract();
  };

  return (
    <section className="upload-section" aria-labelledby="upload-section-heading">
      <h2 id="upload-section-heading">Upload a bid PDF</h2>

      <div className="upload-section__usage">
        <p>
          Choose a PDF below and click Extract Data to pull out its project metadata,
          bid summary, and line items. Extraction can take a minute or so once you
          submit -- the page will show a loading indicator while it works, so there's
          no need to reload.
        </p>
        <p>
          Using the sample spreadsheet below? Export it as a PDF first -- this tool
          only accepts PDF files.
        </p>
      </div>

      {/*
        The native <input type="file"> button ("Choose File"/"Browse")
        can't be restyled directly -- it's a browser-drawn control.
        The reliable cross-browser fix is to visually hide the real
        input and trigger it via a <label>, which we CAN style like any
        other button (see .btn / .upload-section__file-input below).
      */}
      <form onSubmit={handleSubmit} className="upload-section__form">
        <label htmlFor={fileInputId} className="btn">
          Choose File
        </label>
        <input
          id={fileInputId}
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="upload-section__file-input"
          aria-label="Choose a PDF to extract"
        />

        {file && <p className="upload-section__filename">Selected: {file.name}</p>}

        <button type="submit" className="btn" disabled={!file || isLoading}>
          {isLoading ? "Extracting…" : "Extract data"}
        </button>
      </form>

      {error && (
        <p role="alert" className="upload-section__error">
          {error}
        </p>
      )}

      <div className="upload-section__template">
        <p>Not sure how your data should be formatted?</p>
        <a href={TEMPLATE_URL} download>
          Download the sample template (.xlsx)
        </a>
      </div>
    </section>
  );
}