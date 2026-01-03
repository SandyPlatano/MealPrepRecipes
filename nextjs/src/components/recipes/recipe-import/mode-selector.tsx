import { Button } from "@/components/ui/button";
import { FileText, Sparkles, Link as LinkIcon } from "lucide-react";
import type { ImportMode } from "@/hooks/use-recipe-import";

interface ModeSelectorProps {
  mode: ImportMode;
  onModeChange: (mode: ImportMode) => void;
}

export function ModeSelector({ mode, onModeChange }: ModeSelectorProps) {
  return (
    <div className="flex gap-2">
      <Button
        variant={mode === "manual" ? "default" : "outline"}
        onClick={() => onModeChange("manual")}
        className="flex-1"
      >
        <FileText className="h-4 w-4 mr-2" />
        Manual Entry
      </Button>
      <Button
        variant={mode === "paste" ? "default" : "outline"}
        onClick={() => onModeChange("paste")}
        className="flex-1"
      >
        <Sparkles className="h-4 w-4 mr-2" />
        Paste Text
      </Button>
      <Button
        variant={mode === "url" ? "default" : "outline"}
        onClick={() => onModeChange("url")}
        className="flex-1"
      >
        <LinkIcon className="h-4 w-4 mr-2" />
        From URL
      </Button>
    </div>
  );
}
