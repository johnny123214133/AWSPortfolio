import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { extractBidsFromPdf } from "../api/index.js";

export const TABLE_KEYS = {
  METADATA: "metadata",
  BID_SUMMARIES: "bid_summaries",
  LINE_ITEMS: "line_items",
};

const BidExtractionContext = createContext(undefined);

/**
 * The data model for the Bid Data OCR Extraction feature: the uploaded
 * file, the extracted tables returned by extract_bids_json(), loading/
 * error state, and which table is currently on display -- plus the
 * actions that change any of it. Display components read from and act
 * on this via `useBidExtraction()` instead of managing state
 * themselves, so BidExtractionDashboard and its children stay purely
 * presentational (the "view" to this component's "model").
 *
 * Wrap this around whatever gets routed to. BidExtractionDashboard
 * arrives here as `props.children` -- an ordinary React children prop,
 * populated automatically by nesting it inside the provider in JSX:
 *
 *   <Route
 *     path="/ocr"
 *     element={
 *       <BidExtractionProvider>
 *         <BidExtractionDashboard />
 *       </BidExtractionProvider>
 *     }
 *   />
 */
export function BidExtractionProvider({ children }) {
  const [file, setFile] = useState(null);
  const [data, setData] = useState(null);
  const [activeTable, setActiveTable] = useState(TABLE_KEYS.METADATA);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const selectFile = useCallback((nextFile) => {
    setFile(nextFile);
    setError(null);
  }, []);

  const extract = useCallback(async () => {
    if (!file) {
      setError("Choose a PDF before extracting.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await extractBidsFromPdf(file);
      setData(result);
      setActiveTable(TABLE_KEYS.METADATA);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Something went wrong extracting that PDF."
      );
    } finally {
      setIsLoading(false);
    }
  }, [file]);

  const reset = useCallback(() => {
    setFile(null);
    setData(null);
    setError(null);
    setActiveTable(TABLE_KEYS.METADATA);
  }, []);

  const value = useMemo(
    () => ({
      file,
      data,
      activeTable,
      isLoading,
      error,
      selectFile,
      extract,
      reset,
      setActiveTable,
    }),
    [file, data, activeTable, isLoading, error, selectFile, extract, reset]
  );

  return (
    <BidExtractionContext.Provider value={value}>
      {children}
    </BidExtractionContext.Provider>
  );
}

export function useBidExtraction() {
  const context = useContext(BidExtractionContext);
  if (context === undefined) {
    throw new Error("useBidExtraction must be used within a BidExtractionProvider");
  }
  return context;
}
