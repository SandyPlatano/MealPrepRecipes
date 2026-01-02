"use client";

import { ShoppingCart, Store, X, MoreVertical, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface QuickCartModalHeaderProps {
  itemCount: number;
  checkedCount: number;
  storeMode: boolean;
  onToggleStoreMode: () => void;
  onClearChecked: () => void;
  onClearAll: () => void;
  onClose: () => void;
}

export function QuickCartModalHeader({
  itemCount,
  checkedCount,
  storeMode,
  onToggleStoreMode,
  onClearChecked,
  onClearAll,
  onClose,
}: QuickCartModalHeaderProps) {
  return (
    <DialogHeader className="px-4 sm:px-6 py-4 border-b bg-[#D9F99D] rounded-t-lg flex-shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShoppingCart className="size-5 sm:size-6 text-[#1A1A1A]" />
          <div>
            <DialogTitle className="text-lg sm:text-xl font-bold text-[#1A1A1A]">
              Shopping Cart
            </DialogTitle>
            <p className="text-sm text-[#1A1A1A]/70">
              {itemCount} items ({checkedCount} checked)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Store Mode Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleStoreMode}
            className={cn(
              "h-9 px-3 gap-2 text-[#1A1A1A] hover:bg-black/10",
              storeMode && "bg-black/10"
            )}
          >
            <Store className="size-4" />
            <span className="hidden sm:inline">Store Mode</span>
          </Button>

          {/* More Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-9 text-[#1A1A1A] hover:bg-black/10"
              >
                <MoreVertical className="size-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={onClearChecked}
                disabled={checkedCount === 0}
              >
                <RefreshCw className="size-4 mr-2" />
                Clear checked items
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onClearAll}
                disabled={itemCount === 0}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="size-4 mr-2" />
                Clear all items
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="size-9 text-[#1A1A1A] hover:bg-black/10"
          >
            <X className="size-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
      </div>
    </DialogHeader>
  );
}
