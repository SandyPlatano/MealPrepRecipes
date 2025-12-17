import { jsPDF } from "jspdf";

/**
 * Export a rendered HTML element to PDF
 * Uses jsPDF's html() method with html2canvas (bundled)
 */
export async function exportRecipeToPdf(
  element: HTMLElement,
  filename: string
): Promise<void> {
  // Create PDF in portrait mode, A4 size
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const contentWidth = pageWidth - margin * 2;

  // Use html2canvas through jsPDF's html method
  await pdf.html(element, {
    callback: (doc) => {
      doc.save(sanitizeFilename(filename) + ".pdf");
    },
    x: margin,
    y: margin,
    width: contentWidth,
    windowWidth: element.scrollWidth,
    html2canvas: {
      scale: 2, // Higher resolution
      useCORS: true, // Enable cross-origin images
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
    },
    autoPaging: "text", // Handle multi-page content
  });
}

/**
 * Sanitize filename by removing special characters
 */
function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-z0-9\s-]/gi, "")
    .replace(/\s+/g, "-")
    .toLowerCase()
    .slice(0, 100);
}
