"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { INGREDIENT_CATEGORIES } from "@/types/shopping-list";
import { ShoppingCart, Cookie, Loader2 } from "lucide-react";

export interface ScannedProduct {
  barcode: string;
  name: string;
  brand?: string;
  category?: string;
}

interface ScanResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ScannedProduct | null;
  isLoading?: boolean;
  onAddToList: (name: string, category: string) => void;
  onAddToPantry: (name: string, category: string) => void;
}

export function ScanResultModal({
  isOpen,
  onClose,
  product,
  isLoading = false,
  onAddToList,
  onAddToPantry,
}: ScanResultModalProps) {
  const [name, setName] = useState(product?.name || "");
  const [category, setCategory] = useState(product?.category || "Other");
  const [isAdding, setIsAdding] = useState(false);

  // Update local state when product changes
  if (product && name !== product.name && !isAdding) {
    setName(product.name);
    setCategory(product.category || "Other");
  }

  const handleAddToList = async () => {
    if (!name.trim()) return;
    setIsAdding(true);
    await onAddToList(name.trim(), category);
    setIsAdding(false);
    setName("");
    setCategory("Other");
    onClose();
  };

  const handleAddToPantry = async () => {
    if (!name.trim()) return;
    setIsAdding(true);
    await onAddToPantry(name.trim(), category);
    setIsAdding(false);
    setName("");
    setCategory("Other");
    onClose();
  };

  const handleClose = () => {
    setName("");
    setCategory("Other");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isLoading ? "Looking up product..." : "Add Scanned Item"}
          </DialogTitle>
          {product?.brand && (
            <DialogDescription>
              {product.brand}
            </DialogDescription>
          )}
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="product-name">Product Name</Label>
              <Input
                id="product-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter product name"
                autoFocus
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {INGREDIENT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleAddToPantry}
            disabled={isLoading || isAdding || !name.trim()}
            className="flex-1 sm:flex-none"
          >
            <Cookie className="h-4 w-4 mr-2" />
            Add to Pantry
          </Button>
          <Button
            onClick={handleAddToList}
            disabled={isLoading || isAdding || !name.trim()}
            className="flex-1 sm:flex-none bg-[#1A1A1A] hover:bg-[#1A1A1A]/90"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to List
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
