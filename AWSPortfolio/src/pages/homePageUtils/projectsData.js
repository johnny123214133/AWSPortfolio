/**
 * Edit this list to add, remove, or reorder portfolio projects.
 *
 * `linkType` controls how the "View project" button behaves:
 *   - "internal": routed via react-router's <Link>; `link` should be a
 *     path within this app (e.g. "/projects/bid-ocr-extraction").
 *   - "external": a plain <a> that opens in a new tab; `link` should be
 *     a full URL (e.g. "https://github.com/you/repo").
 */
export const projects = [
  {
    id: "commute-dashboard",
    name: "Commute Dashboard",
    description:
      "My first foray into React to learn the library. This is a useful tool that relies on " + 
      "Google Maps API, Google Maps Directions API, and data analytics to help you plan your weekly commmute to and from work.",
    linkType: "internal",
    link: "/commuteDashboard",
    buttonText: "View Project",
    buttonDisabled: false,
  },
  {
    id: "bid-ocr-extraction",
    name: "Bid Data OCR Extraction",
    description:
      "A tool built for a client that extracts structured project metadata, bid " +
      "summaries, and line items out of text-based and scanned bid PDFs using Tesseract OCR. " + 
      "I provided a simple UI here to show off the main functionality of the tool.",
    linkType: "internal",
    link: "/OCRDataExtraction",
    buttonText: "View Project",
    buttonDisabled: false,
  },
  {
    id: "i-do-rentals-utah",
    name: "I Do Rentals Event Rental Website",
    description:
      "A custom ecommerce site for a client's event rental business, hosted on AWS with CloudFront for image delivery, " + 
      "Stripe for payments, Google Maps for standardized venue selection, and Resend for automated email.",
    linkType: "external",
    link: "https://idorentalsutah.com/",
    buttonText: "Visit site",
    buttonDisabled: false,
  },
  {
    id: "kumiko-cad",
    name: "Kumiko CAD",
    description:
      "A specialized CAD tool for designing kumiko panels on a triangular grid. Build parametric " +
      "patterns in the pattern editor, lay them out across a panel in the panel editor, and export " +
      "the parts list and even print a 1:1 scale mockup of the panel to help guide construction. This is the live tool, running entirely in your browser.",
    linkType: "internal",
    link: "/kumikoCAD",
    buttonText: "Open Kumiko CAD",
    buttonDisabled: false,
  },
  {
    id: "academic-paper-rag",
    name: "arXiv CS Paper RAG LLM (coming soon)",
    description:
      "A RAG-augmented LLM built on the few hundred most-cited Computer Science papers on arXiv. It will also serve as the foundation for a recommendation engine to help users explore trending and important topics in the field.",
    linkType: "internal",
    link: "/",
    buttonText: "View Project",
    buttonDisabled: true,
  },
  // {
  //   id: "example-external-project",
  //   name: "Example External Project",
  //   description:
  //     "Replace this entry with a real project -- point linkType/link at an external " +
  //     "site or repo, or switch linkType to \"internal\" for a page within this app.",
  //   linkType: "external",
  //   link: "https://example.com",
  //   buttonText: "Visit site",
  //   buttonDisabled: false,
  // },
];