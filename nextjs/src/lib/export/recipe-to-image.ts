export type ImageFormat = "png" | "jpeg";

/**
 * Export a rendered HTML element to image (PNG or JPEG)
 * Captures full height of element including scrollable content
 * Library is dynamically imported to reduce initial bundle size (~100KB saved)
 */
export async function exportRecipeToImage(
  element: HTMLElement,
  filename: string,
  format: ImageFormat = "png"
): Promise<void> {
  // Dynamic import - only load when function is called
  const { toPng, toJpeg } = await import("html-to-image");
  // Clone the element to avoid modifying the original
  const clone = element.cloneNode(true) as HTMLElement;

  // Create a temporary container that's visible but hidden from view
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

  const options = {
    cacheBust: true,
    backgroundColor: "#ffffff",
    pixelRatio: 2, // Higher resolution for better quality
    quality: 0.95, // JPEG quality (ignored for PNG)
    skipFonts: false, // Include fonts for text rendering
    width: 800,
    height: clone.scrollHeight,
  };

  try {
    let dataUrl: string;

    if (format === "jpeg") {
      dataUrl = await toJpeg(clone, options);
    } else {
      dataUrl = await toPng(clone, options);
    }

    // Trigger download
    downloadDataUrl(dataUrl, sanitizeFilename(filename), format);
  } catch (error) {
    console.error("Failed to export recipe to image:", error);
    throw new Error("Failed to generate image. Please try again.");
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
