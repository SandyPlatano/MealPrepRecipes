"use client";

import { Button } from "@/components/ui/button";
import { Loader2, FileDown, FileText, Braces, Image as ImageIcon } from "lucide-react";
import type { ExportFormat } from "@/types/export";

interface ExportFormatButtonsProps {
  onExport: (format: ExportFormat) => void;
  exportingFormat: ExportFormat | null;
  disabled?: boolean;
}

interface FormatButtonConfig {
  format: ExportFormat;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const FORMAT_BUTTONS: FormatButtonConfig[] = [
  {
    format: "png",
    label: "PNG",
    icon: <ImageIcon className="h-6 w-6" />,
    description: "High-quality",
  },
  {
    format: "jpeg",
    label: "JPEG",
    icon: <ImageIcon className="h-6 w-6" />,
    description: "Compressed",
  },
  {
    format: "markdown",
    label: "Markdown",
    icon: <FileText className="h-6 w-6" />,
    description: "Text format",
  },
  {
    format: "json",
    label: "JSON",
    icon: <Braces className="h-6 w-6" />,
    description: "Data backup",
  },
  {
    format: "pdf",
    label: "PDF",
    icon: <FileDown className="h-6 w-6" />,
    description: "Print-ready",
  },
];

export function ExportFormatButtons({
  onExport,
  exportingFormat,
  disabled = false,
}: ExportFormatButtonsProps) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
      {FORMAT_BUTTONS.map((config) => {
        const isExporting = exportingFormat === config.format;
        const isDisabled = disabled || exportingFormat !== null;

        return (
          <Button
            key={config.format}
            variant="outline"
            className="h-20 flex-col gap-1.5 relative"
            onClick={() => onExport(config.format)}
            disabled={isDisabled}
          >
            {isExporting ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              config.icon
            )}
            <span className="text-xs font-medium">{config.label}</span>
            <span className="text-[10px] text-muted-foreground">
              {config.description}
            </span>
          </Button>
        );
      })}
    </div>
  );
}

/**
 * Compact version for smaller spaces
 */
export function ExportFormatButtonsCompact({
  onExport,
  exportingFormat,
  disabled = false,
}: ExportFormatButtonsProps) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {FORMAT_BUTTONS.map((config) => {
        const isExporting = exportingFormat === config.format;
        const isDisabled = disabled || exportingFormat !== null;

        return (
          <Button
            key={config.format}
            variant="outline"
            size="sm"
            className="h-14 flex-col gap-1 px-2"
            onClick={() => onExport(config.format)}
            disabled={isDisabled}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span className="[&>svg]:h-4 [&>svg]:w-4">{config.icon}</span>
            )}
            <span className="text-[10px]">{config.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
