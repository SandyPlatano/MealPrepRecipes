/**
 * Core Markdown Generation Utilities
 *
 * Provides foundational functions for creating GitHub Flavored Markdown (GFM)
 * content for recipe, meal plan, and shopping list exports.
 */

/**
 * Escape special markdown characters to prevent formatting issues
 */
export function escapeMarkdown(text: string): string {
  // Escape characters that have special meaning in markdown
  // But preserve intentional formatting (like bullet points at line start)
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\|/g, "\\|")
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Create a markdown heading
 */
export function createMarkdownHeading(
  text: string,
  level: 1 | 2 | 3 | 4 = 2
): string {
  const prefix = "#".repeat(level);
  return `${prefix} ${text}`;
}

/**
 * Create an unordered list from items
 */
export function createMarkdownList(
  items: string[],
  ordered = false
): string {
  if (items.length === 0) return "";

  return items
    .map((item, index) => {
      const prefix = ordered ? `${index + 1}.` : "-";
      return `${prefix} ${item}`;
    })
    .join("\n");
}

/**
 * Create a checkbox list (GFM task list)
 */
export function createMarkdownCheckboxList(
  items: string[],
  checkedStates?: boolean[]
): string {
  if (items.length === 0) return "";

  return items
    .map((item, index) => {
      const checked = checkedStates?.[index] ?? false;
      const checkbox = checked ? "[x]" : "[ ]";
      return `- ${checkbox} ${item}`;
    })
    .join("\n");
}

/**
 * Table row type for markdown tables
 */
export type MarkdownTableRow = Record<string, string | number | null | undefined>;

/**
 * Create a GFM table from headers and row data
 */
export function createMarkdownTable(
  headers: string[],
  rows: MarkdownTableRow[],
  alignment?: ("left" | "center" | "right")[]
): string {
  if (headers.length === 0) return "";

  // Header row
  const headerRow = `| ${headers.join(" | ")} |`;

  // Separator row with optional alignment
  const separatorRow = `| ${headers
    .map((_, index) => {
      const align = alignment?.[index] ?? "left";
      switch (align) {
        case "center":
          return ":---:";
        case "right":
          return "---:";
        default:
          return "---";
      }
    })
    .join(" | ")} |`;

  // Data rows
  const dataRows = rows.map((row) => {
    const cells = headers.map((header) => {
      const value = row[header];
      if (value === null || value === undefined) return "";
      return String(value);
    });
    return `| ${cells.join(" | ")} |`;
  });

  return [headerRow, separatorRow, ...dataRows].join("\n");
}

/**
 * Create a horizontal rule
 */
export function createMarkdownHorizontalRule(): string {
  return "---";
}

/**
 * Create bold text
 */
export function bold(text: string): string {
  return `**${text}**`;
}

/**
 * Create italic text
 */
export function italic(text: string): string {
  return `*${text}*`;
}

/**
 * Join sections with proper spacing
 */
export function joinSections(...sections: (string | null | undefined)[]): string {
  return sections.filter(Boolean).join("\n\n");
}

/**
 * Download markdown content as a file
 */
export function downloadMarkdownFile(content: string, filename: string): void {
  // Ensure filename has .md extension
  const finalFilename = filename.endsWith(".md") ? filename : `${filename}.md`;

  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = finalFilename;
  document.body.appendChild(a);
  a.click();

  // Cleanup
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Format a date range for filenames (slug format)
 */
export function formatDateRangeForFilename(weekRange: string): string {
  // Convert "Dec 16 - 22, 2024" to "dec-16-22-2024"
  return weekRange
    .toLowerCase()
    .replace(/,/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-");
}
