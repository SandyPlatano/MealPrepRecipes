import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

/**
 * Export a rendered HTML element to PDF
 * Uses html2canvas for rendering, then adds to jsPDF
 */
export async function exportRecipeToPdf(
  element: HTMLElement,
  filename: string
): Promise<void> {
  // Clone the element to avoid modifying the original
  const clone = element.cloneNode(true) as HTMLElement;

  // Create a temporary container that's visible to html2canvas
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "0";
  container.style.top = "0";
  container.style.width = "800px";
  container.style.zIndex = "-9999";
  container.style.backgroundColor = "#ffffff";
  container.style.opacity = "0"; // Invisible but rendered
  container.style.pointerEvents = "none";
  container.appendChild(clone);
  document.body.appendChild(container);

  // Wait for images to load
  await waitForImages(clone);

  // Small delay to ensure rendering is complete
  await new Promise((resolve) => setTimeout(resolve, 100));

  try {
    // Capture the element as canvas
    const canvas = await html2canvas(clone, {
      scale: 2, // Higher resolution for better quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      width: 800,
      height: clone.scrollHeight,
      windowWidth: 800,
      windowHeight: clone.scrollHeight,
    });

    // Calculate dimensions for A4 PDF
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const margin = 10;
    const contentWidth = imgWidth - margin * 2;

    // Calculate scaled height based on aspect ratio
    const imgHeight = (canvas.height * contentWidth) / canvas.width;

    // Create PDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Get canvas as data URL
    const imgData = canvas.toDataURL("image/jpeg", 0.95);

    // Handle multi-page content
    let heightLeft = imgHeight;
    let position = margin;
    let page = 0;

    // Add first page
    pdf.addImage(imgData, "JPEG", margin, position, contentWidth, imgHeight);
    heightLeft -= pageHeight - margin * 2;

    // Add additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight + margin;
      pdf.addPage();
      page++;
      pdf.addImage(imgData, "JPEG", margin, position, contentWidth, imgHeight);
      heightLeft -= pageHeight - margin * 2;
    }

    // Save the PDF
    pdf.save(sanitizeFilename(filename) + ".pdf");
  } finally {
    // Clean up the temporary container
    document.body.removeChild(container);
  }
}

/**
 * Wait for all images in an element to load
 */
async function waitForImages(element: HTMLElement): Promise<void> {
  const images = element.querySelectorAll("img");
  const promises: Promise<void>[] = [];

  images.forEach((img) => {
    if (!img.complete) {
      promises.push(
        new Promise((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve(); // Don't fail on broken images
        })
      );
    }
  });

  await Promise.all(promises);
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
