import React from "react";
import ProjectDescriptionSection from "./ProjectDescriptionSection";
import UploadSection from "./UploadSection";
import RoadmapSection from "./RoadmapSection";
import DataTablesSection from "./DataTablesSection";
import LoadingOverlay from "./LoadingOverlay";
import "./BidExtractionDashboard.css";

/**
 * Purely presentational -- all state and the extraction call itself
 * live in BidExtractionProvider (see ../context/BidExtractionContext).
 * This component and everything under it just read from
 * useBidExtraction() and render.
 *
 * Description, Upload, Roadmap, and DataTables are direct siblings
 * inside .bid-extraction-dashboard__layout (a CSS grid) rather than
 * nested in sub-wrappers -- that's what lets the CSS reposition
 * Roadmap (next to Upload on wide screens, below the tables on narrow
 * ones) independent of DOM order. See the grid-template-areas rules in
 * the CSS file.
 */
export default function BidExtractionDashboard() {
  return (
    <div className="bid-extraction-dashboard">
      <header className="bid-extraction-dashboard__header">
        <h1>Bid Data OCR Extraction</h1>
      </header>

      <div className="bid-extraction-dashboard__layout">
        <ProjectDescriptionSection />
        <UploadSection />
        <RoadmapSection />
        <DataTablesSection />
      </div>

      <LoadingOverlay />
    </div>
  );
}