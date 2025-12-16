'use client';

import { useState } from 'react';
import { Check, X, Barcode, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ScannedProduct, BarcodeNutrition } from '@/types/barcode';
import { INGREDIENT_CATEGORIES } from '@/types/shopping-list';

interface BarcodeResultReviewProps {
  product: ScannedProduct;
  onConfirm: (item: { ingredient: string; category: string }) => void;
  onCancel: () => void;
  onScanAnother: () => void;
}

function NutritionRow({ label, value, unit }: { label: string; value?: number; unit: string }) {
  if (value === undefined || value === null) return null;

  return (
    <div className="flex justify-between py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">
        {value.toFixed(1)}{unit}
      </span>
    </div>
  );
}

function NutritionPanel({ nutrition }: { nutrition?: BarcodeNutrition }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!nutrition || !nutrition.calories) {
    return (
      <div className="text-sm text-muted-foreground py-2">
        Nutrition information not available
      </div>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="w-full justify-between p-0 h-auto">
          <span className="text-sm font-medium">Nutrition (per 100g)</span>
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2">
        <div className="text-sm border rounded-lg p-3 bg-muted/30">
          <NutritionRow label="Calories" value={nutrition.calories} unit=" kcal" />
          <NutritionRow label="Protein" value={nutrition.protein} unit="g" />
          <NutritionRow label="Carbs" value={nutrition.carbs} unit="g" />
          <NutritionRow label="Fat" value={nutrition.fat} unit="g" />
          <NutritionRow label="Fiber" value={nutrition.fiber} unit="g" />
          <NutritionRow label="Sugar" value={nutrition.sugar} unit="g" />
          <NutritionRow label="Sodium" value={nutrition.sodium} unit="mg" />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Data from Open Food Facts
        </p>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function BarcodeResultReview({
  product,
  onConfirm,
  onCancel,
  onScanAnother,
}: BarcodeResultReviewProps) {
  const [editedName, setEditedName] = useState(product.name);
  const [editedCategory, setEditedCategory] = useState(product.category);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!editedName.trim()) return;

    setIsSubmitting(true);
    try {
      await onConfirm({
        ingredient: editedName.trim(),
        category: editedCategory,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Barcode className="h-5 w-5 text-blue-500" />
          Scanned Product
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Product Image */}
        {product.imageUrl && (
          <div className="flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-32 w-32 object-contain rounded-lg bg-white"
            />
          </div>
        )}

        {/* Brand */}
        {product.brand && (
          <div className="text-center">
            <span className="text-sm text-muted-foreground">{product.brand}</span>
          </div>
        )}

        {/* Quantity/Size */}
        {product.quantity && (
          <div className="text-center">
            <span className="text-xs text-muted-foreground">Size: {product.quantity}</span>
          </div>
        )}

        {/* Barcode */}
        <div className="text-center">
          <span className="text-xs font-mono text-muted-foreground">{product.barcode}</span>
        </div>

        {/* Editable Name */}
        <div className="space-y-2">
          <Label htmlFor="product-name">Product Name</Label>
          <Input
            id="product-name"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            placeholder="Enter product name"
          />
        </div>

        {/* Editable Category */}
        <div className="space-y-2">
          <Label htmlFor="product-category">Category</Label>
          <Select value={editedCategory} onValueChange={setEditedCategory}>
            <SelectTrigger id="product-category">
              <SelectValue />
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

        {/* Nutrition Panel */}
        <NutritionPanel nutrition={product.nutrition} />
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        <div className="flex gap-2 w-full">
          <Button
            className="flex-1"
            onClick={handleConfirm}
            disabled={!editedName.trim() || isSubmitting}
          >
            <Check className="mr-2 h-4 w-4" />
            Add to Pantry
          </Button>
          <Button
            variant="outline"
            onClick={onScanAnother}
            disabled={isSubmitting}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Scan Another
          </Button>
        </div>
        <Button
          variant="ghost"
          className="w-full"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
      </CardFooter>
    </Card>
  );
}
