import React from "react";

// Placeholder copy -- swap in your actual roadmap.
const PLANNED_IMPROVEMENTS = [
  "Parellelize data extraction to boost speed",
  "Refine OCR output to recover mismatched data",
  "Tighten down validation of the extracted tables",
  "Flag low-confidence extractions for manual review",
];

export default function RoadmapSection() {
  return (
    <section className="roadmap-section" aria-labelledby="roadmap-section-heading">
      <h2 id="roadmap-section-heading">Planned improvements</h2>
      <ul className="roadmap-section__list">
        {PLANNED_IMPROVEMENTS.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
