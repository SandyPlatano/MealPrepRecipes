import { toPng, toJpeg } from "html-to-image";

export type ImageFormat = "png" | "jpeg";

/**
 * Export a rendered HTML element to image (PNG or JPEG)
 * Captures full height of element including scrollable content
 */
export async function exportRecipeToImage(
  element: HTMLElement,
  filename: string,
  format: ImageFormat = "png"
): Promise<void> {
  const options = {
    cacheBust: true,
    backgroundColor: "#ffffff",
    pixelRatio: 2, // Higher resolution for better quality
    quality: 0.95, // JPEG quality (ignored for PNG)
    skipFonts: false, // Include fonts for text rendering
    style: {
      // Ensure element is fully visible for capture
      transform: "none",
      position: "relative",
      left: "0",
      top: "0",
    },
  };

  try {
    let dataUrl: string;

    if (format === "jpeg") {
      dataUrl = await toJpeg(element, options);
    } else {
      dataUrl = await toPng(element, options);
    }

    // Trigger download
    downloadDataUrl(dataUrl, sanitizeFilename(filename), format);
  } catch (error) {
    console.error("Failed to export recipe to image:", error);
    throw new Error("Failed to generate image. Please try again.");
  }
}

/**
 * Download a data URL as a file
 */
function downloadDataUrl(
  dataUrl: string,
  filename: string,
  format: ImageFormat
): void {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = `${filename}.${format}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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
