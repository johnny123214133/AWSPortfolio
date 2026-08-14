import React from "react";
import { useBidExtraction } from "../contexts/BidExtractionContext";

/**
 * Fixed, full-viewport overlay shown while extraction is in flight.
 * `backdrop-filter: blur(...)` on the overlay itself is what blurs the
 * page behind it -- no need to touch the rest of the dashboard's
 * markup or state for that. Position doesn't matter; render this
 * anywhere in the tree, it's `position: fixed`.
 */
export default function LoadingOverlay() {
  const { isLoading } = useBidExtraction();

  if (!isLoading) return null;

  return (
    <div className="loading-overlay" role="status" aria-live="polite">
      <div className="loading-overlay__panel">
        <div className="loading-overlay__spinner" aria-hidden="true" />
        <p className="loading-overlay__message">
          Extracting your PDF — this can take a minute…
        </p>
      </div>
    </div>
  );
}
