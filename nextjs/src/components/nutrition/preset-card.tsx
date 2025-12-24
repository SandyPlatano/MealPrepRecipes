"use client";

/**
 * PresetCard Component
 * Displays a macro preset with one-tap add functionality
 * Features:
 * - Main tap area for instant add
 * - Small customize button to adjust values before adding
 * - Pin indicator for pinned presets
 * - Context menu for pin/hide/edit/delete
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Pin,
  PinOff,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  Settings2,
  Loader2,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { MacroPreset } from "@/types/macro-preset";
import { formatMacroSummary, getPresetEmoji } from "@/types/macro-preset";

interface PresetCardProps {
  preset: MacroPreset;
  onQuickAdd: (presetId: string) => Promise<void>;
  onCustomize: (preset: MacroPreset) => void;
  onPin?: (presetId: string) => Promise<void>;
  onHide?: (presetId: string) => Promise<void>;
  onEdit?: (preset: MacroPreset) => void;
  onDelete?: (presetId: string) => Promise<void>;
  showActions?: boolean;
  isCompact?: boolean;
}

export function PresetCard({
  preset,
  onQuickAdd,
  onCustomize,
  onPin,
  onHide,
  onEdit,
  onDelete,
  showActions = true,
  isCompact = false,
}: PresetCardProps) {
  const [isAdding, setIsAdding] = useState(false);

  const handleQuickAdd = async () => {
    if (isAdding) return;
    setIsAdding(true);
    try {
      await onQuickAdd(preset.id);
    } finally {
      setIsAdding(false);
    }
  };

  const emoji = getPresetEmoji(preset);
  const summary = formatMacroSummary(preset);

  if (isCompact) {
    return (
      <button
        type="button"
        onClick={handleQuickAdd}
        disabled={isAdding}
        className={cn(
          "relative flex flex-col items-center justify-center",
          "p-3 rounded-xl border bg-card",
          "hover:bg-accent hover:border-primary/30 transition-all duration-200",
          "active:scale-95",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          preset.is_pinned && "ring-1 ring-primary/30"
        )}
      >
        {preset.is_pinned && (
          <Pin className="absolute top-1 right-1 h-3 w-3 text-primary" />
        )}
        {isAdding ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : (
          <span className="text-xl">{emoji}</span>
        )}
        <span className="text-xs font-medium mt-1 truncate max-w-full">
          {preset.name}
        </span>
        <span className="text-[10px] text-muted-foreground truncate max-w-full">
          {preset.calories ?? 0} cal
        </span>
      </button>
    );
  }

  return (
    <div
      className={cn(
        "relative group rounded-xl border bg-card overflow-hidden",
        "hover:border-primary/30 transition-all duration-200",
        preset.is_pinned && "ring-1 ring-primary/20",
        preset.is_hidden && "opacity-50"
      )}
    >
      {/* Pin indicator */}
      {preset.is_pinned && (
        <div className="absolute top-2 right-2 z-10">
          <Pin className="h-3.5 w-3.5 text-primary" />
        </div>
      )}

      {/* Main tap area */}
      <button
        type="button"
        onClick={handleQuickAdd}
        disabled={isAdding}
        className={cn(
          "w-full p-4 text-left",
          "hover:bg-accent/50 transition-colors",
          "active:bg-accent",
          "disabled:cursor-not-allowed"
        )}
      >
        <div className="flex items-start gap-3">
          {/* Emoji */}
          <div className="text-2xl shrink-0">
            {isAdding ? (
              <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
            ) : (
              emoji
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium truncate">{preset.name}</h3>
              {preset.is_system && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  Default
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{summary}</p>
          </div>
        </div>
      </button>

      {/* Action bar */}
      {showActions && (
        <div className="flex items-center justify-between px-4 py-2 border-t bg-muted/30">
          {/* Customize button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={() => onCustomize(preset)}
          >
            <Settings2 className="h-3 w-3" />
            Customize
          </Button>

          {/* More actions dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {onPin && (
                <DropdownMenuItem onClick={() => onPin(preset.id)}>
                  {preset.is_pinned ? (
                    <>
                      <PinOff className="mr-2 h-4 w-4" />
                      Unpin
                    </>
                  ) : (
                    <>
                      <Pin className="mr-2 h-4 w-4" />
                      Pin to Top
                    </>
                  )}
                </DropdownMenuItem>
              )}

              {onHide && (
                <DropdownMenuItem onClick={() => onHide(preset.id)}>
                  {preset.is_hidden ? (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      Show
                    </>
                  ) : (
                    <>
                      <EyeOff className="mr-2 h-4 w-4" />
                      Hide
                    </>
                  )}
                </DropdownMenuItem>
              )}

              {!preset.is_system && onEdit && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onEdit(preset)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                </>
              )}

              {!preset.is_system && onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(preset.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}

/**
 * Create New Preset Card
 * A special card that opens the preset creator
 */
interface CreatePresetCardProps {
  onClick: () => void;
  isCompact?: boolean;
}

export function CreatePresetCard({ onClick, isCompact = false }: CreatePresetCardProps) {
  if (isCompact) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "flex flex-col items-center justify-center",
          "p-3 rounded-xl border border-dashed border-primary/30",
          "hover:bg-primary/5 hover:border-primary/50 transition-all duration-200",
          "active:scale-95"
        )}
      >
        <Plus className="h-5 w-5 text-primary" />
        <span className="text-xs font-medium mt-1 text-primary">New</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full p-4 rounded-xl border border-dashed border-primary/30",
        "hover:bg-primary/5 hover:border-primary/50 transition-all duration-200",
        "flex flex-col items-center justify-center gap-2",
        "min-h-[100px]"
      )}
    >
      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
        <Plus className="h-5 w-5 text-primary" />
      </div>
      <span className="text-sm font-medium text-primary">Create Preset</span>
    </button>
  );
}
