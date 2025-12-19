'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { Plus, Trash2, Cookie, PackageX, Camera, History, Barcode } from 'lucide-react';
import { toast } from 'sonner';
import {
  addToPantry,
  removePantryItemById,
  clearPantry,
} from '@/app/actions/pantry';
import {
  type PantryItem,
  INGREDIENT_CATEGORIES,
  sortCategories,
} from '@/types/shopping-list';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Import our scanning components
import ScanReview from './scan-review';
import ScanHistory from './scan-history';
import BarcodeResultReview from './barcode-result-review';
import PantryScanner from './pantry-scanner';
import BarcodeScanner from './barcode-scanner';
import { PantryScan } from '@/app/actions/pantry-scan';
import { ScannedProduct } from '@/types/barcode';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';

interface DetectedItem {
  ingredient: string;
  quantity?: string;
  category: string;
  confidence: number;
  confirmed?: boolean;
  edited?: boolean;
}

interface SuggestedRecipe {
  id: string;
  title: string;
  prep_time?: number;
  cook_time?: number;
  image_url?: string;
  matching_ingredients: number;
  total_ingredients: number;
  missing_ingredients: number;
}

interface EnhancedPantryViewProps {
  initialItems: PantryItem[];
  subscriptionTier?: 'free' | 'pro' | 'premium';
}

export function EnhancedPantryView({
  initialItems,
  subscriptionTier = 'free'
}: EnhancedPantryViewProps) {
  const [newItem, setNewItem] = useState('');
  const [newCategory, setNewCategory] = useState<string>('Other');
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState('items');

  // Scanner states
  const [showScanReview, setShowScanReview] = useState(false);
  const [scanData, setScanData] = useState<{
    scanId: string;
    detectedItems: DetectedItem[];
    suggestedRecipes: SuggestedRecipe[];
  } | null>(null);

  // Barcode scanner states
  const [barcodeProduct, setBarcodeProduct] = useState<ScannedProduct | null>(null);
  const [showBarcodeReview, setShowBarcodeReview] = useState(false);
  const [manualEntryBarcode, setManualEntryBarcode] = useState<string | null>(null);

  // Scanner sheet state
  const [scanSheetOpen, setScanSheetOpen] = useState(false);
  const [scanMode, setScanMode] = useState<'photo' | 'barcode' | null>(null);

  // Group items by category for display
  const groupedItems = initialItems.reduce(
    (acc, item) => {
      const category = item.category || 'Other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    },
    {} as Record<string, PantryItem[]>
  );

  const sortedCategories = sortCategories(Object.keys(groupedItems));
  const totalCount = initialItems.length;

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    setIsAdding(true);
    const result = await addToPantry(newItem.trim(), newCategory);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Added "${newItem}" to pantry`);
      setNewItem('');
    }
    setIsAdding(false);
  };

  const handleRemoveItem = async (itemId: string, itemName: string) => {
    const result = await removePantryItemById(itemId);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Removed "${itemName}" from pantry`);
    }
  };

  const handleClearAll = async () => {
    const result = await clearPantry();

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Cleared all pantry items');
    }
  };

  const handleScanComplete = (scanId: string, detectedItems: DetectedItem[], suggestedRecipes: SuggestedRecipe[]) => {
    setScanSheetOpen(false);
    setScanMode(null);
    setScanData({ scanId, detectedItems, suggestedRecipes });
    setShowScanReview(true);
    setActiveTab('items');
  };

  const handleScanConfirm = () => {
    setShowScanReview(false);
    setScanData(null);
    // Refresh the page to show updated pantry items
    window.location.reload();
  };

  const handleReuseScan = (scan: PantryScan) => {
    const items = (scan.confirmed_items?.length > 0
      ? scan.confirmed_items
      : scan.detected_items || []) as DetectedItem[];

    setScanData({
      scanId: scan.id,
      detectedItems: items,
      suggestedRecipes: []
    });
    setShowScanReview(true);
    setActiveTab('items');
  };

  // Barcode handlers
  const handleBarcodeScanComplete = (product: ScannedProduct) => {
    setScanSheetOpen(false);
    setScanMode(null);
    setBarcodeProduct(product);
    setShowBarcodeReview(true);
    setManualEntryBarcode(null);
  };

  const handleBarcodeNotFound = (barcode: string) => {
    setScanSheetOpen(false);
    setScanMode(null);
    // Store barcode for manual entry prefill
    setManualEntryBarcode(barcode);
    setBarcodeProduct(null);
    setShowBarcodeReview(false);
  };

  const openScanner = (mode: 'photo' | 'barcode') => {
    setScanMode(mode);
    setScanSheetOpen(true);
  };

  const handleBarcodeConfirm = async (item: { ingredient: string; category: string }) => {
    const result = await addToPantry(item.ingredient, item.category, 'barcode');

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Added "${item.ingredient}" to pantry`);
      setShowBarcodeReview(false);
      setBarcodeProduct(null);
      // Refresh to show updated pantry
      window.location.reload();
    }
  };

  const handleBarcodeScanAnother = () => {
    setShowBarcodeReview(false);
    setBarcodeProduct(null);
    setManualEntryBarcode(null);
  };

  // Show barcode result review
  if (showBarcodeReview && barcodeProduct) {
    return (
      <div className="flex flex-col gap-6">
        <BarcodeResultReview
          product={barcodeProduct}
          onConfirm={handleBarcodeConfirm}
          onCancel={() => {
            setShowBarcodeReview(false);
            setBarcodeProduct(null);
          }}
          onScanAnother={handleBarcodeScanAnother}
        />
      </div>
    );
  }

  // Show photo scan review
  if (showScanReview && scanData) {
    return (
      <div className="flex flex-col gap-6">
        <ScanReview
          scanId={scanData.scanId}
          initialItems={scanData.detectedItems}
          suggestedRecipes={scanData.suggestedRecipes}
          onConfirm={handleScanConfirm}
          onCancel={() => {
            setShowScanReview(false);
            setScanData(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="items">
            <Cookie className="h-4 w-4 mr-2" />
            Pantry Items
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-2" />
            Scan History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="flex flex-col gap-6">
          {/* Add Item Form */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Add Pantry Item</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddItem} className="flex gap-2">
                <Input
                  placeholder="Add ingredient you always have..."
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  className="flex-1"
                />
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger className="w-[140px]">
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
                <Button type="submit" disabled={isAdding || !newItem.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </form>
              <p className="text-xs text-muted-foreground mt-2">
                Common pantry staples: salt, pepper, olive oil, butter, garlic, onions, etc.
              </p>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {/* Scan Buttons - Pro/Premium only */}
            {subscriptionTier !== 'free' && (
              <>
                <Button
                  variant="default"
                  onClick={() => openScanner('photo')}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Photo Scan
                </Button>
                <Button
                  variant="default"
                  onClick={() => openScanner('barcode')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Barcode className="h-4 w-4 mr-2" />
                  Barcode
                </Button>
              </>
            )}

            <Button variant="outline" asChild>
              <Link href="/app/shop">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Back to Shopping List
              </Link>
            </Button>

            {totalCount > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-destructive">
                    <PackageX className="h-4 w-4 mr-2" />
                    Clear Pantry
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear all pantry items?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove all {totalCount} items from your pantry.
                      This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearAll}>
                      Clear All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          {/* Stats */}
          {totalCount > 0 && (
            <div className="text-sm text-muted-foreground">
              {totalCount} item{totalCount !== 1 ? 's' : ''} in pantry
            </div>
          )}

          {/* Pantry Items by Category */}
          {totalCount === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="max-w-sm mx-auto flex flex-col gap-4">
                  <div className="text-5xl">
                    <Cookie className="h-12 w-12 mx-auto text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-lg font-medium">Your pantry is empty</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Add items above, or use the Photo Scan / Barcode buttons to quickly add items.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-4">
              {sortedCategories.map((category) => (
                <PantryCategorySection
                  key={category}
                  category={category}
                  items={groupedItems[category]}
                  onRemove={handleRemoveItem}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="flex flex-col gap-6">
          <ScanHistory onReuseScan={handleReuseScan} />
        </TabsContent>
      </Tabs>

      {/* Manual Entry Dialog for Not Found Barcodes */}
      {manualEntryBarcode && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setManualEntryBarcode(null)}
          />
          <Card className="relative z-50 w-full max-w-md mx-4 mb-4 sm:mb-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Product Not Found</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                Barcode <span className="font-mono bg-muted px-1.5 py-0.5 rounded">{manualEntryBarcode}</span> was not found.
                Add it manually:
              </p>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const name = formData.get('name') as string;
                  const category = formData.get('category') as string;
                  if (name?.trim()) {
                    const result = await addToPantry(name.trim(), category || 'Other', 'barcode');
                    if (result.error) {
                      toast.error(result.error);
                    } else {
                      toast.success(`Added "${name}" to pantry`);
                      setManualEntryBarcode(null);
                      window.location.reload();
                    }
                  }
                }}
                className="flex flex-col gap-3"
              >
                <Input
                  name="name"
                  placeholder="Enter product name..."
                  autoFocus
                />
                <Select name="category" defaultValue="Other">
                  <SelectTrigger>
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
                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setManualEntryBarcode(null)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Scanner Sheet */}
      <Sheet open={scanSheetOpen} onOpenChange={setScanSheetOpen}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-xl overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle className="flex items-center gap-2">
              {scanMode === 'photo' && (
                <>
                  <Camera className="h-5 w-5 text-blue-500" />
                  Photo Scan
                </>
              )}
              {scanMode === 'barcode' && (
                <>
                  <Barcode className="h-5 w-5 text-green-500" />
                  Barcode Scanner
                </>
              )}
            </SheetTitle>
            <SheetDescription>
              {scanMode === 'photo'
                ? 'Take a photo of your pantry or fridge to detect items'
                : 'Scan product barcodes to add items with nutrition info'
              }
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-4 pb-6">
            {scanMode === 'photo' && (
              <PantryScanner
                onScanComplete={handleScanComplete}
                subscriptionTier={subscriptionTier}
              />
            )}
            {scanMode === 'barcode' && (
              <BarcodeScanner
                onScanComplete={handleBarcodeScanComplete}
                onNotFound={handleBarcodeNotFound}
                subscriptionTier={subscriptionTier}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

interface PantryCategorySectionProps {
  category: string;
  items: PantryItem[];
  onRemove: (itemId: string, itemName: string) => void;
}

function PantryCategorySection({
  category,
  items,
  onRemove,
}: PantryCategorySectionProps) {
  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span>{category}</span>
          <span className="text-xs text-muted-foreground font-normal">
            {items.length} item{items.length !== 1 ? 's' : ''}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <PantryItemRow key={item.id} item={item} onRemove={onRemove} />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

interface PantryItemRowProps {
  item: PantryItem;
  onRemove: (itemId: string, itemName: string) => void;
}

function PantryItemRow({ item, onRemove }: PantryItemRowProps) {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = async () => {
    setIsRemoving(true);
    await onRemove(item.id, item.ingredient);
    setIsRemoving(false);
  };

  return (
    <li className="flex items-center gap-3 group">
      <Cookie className="h-4 w-4 text-muted-foreground" />
      <span className="flex-1 text-sm">{item.ingredient}</span>
      {item.source === 'scan' && (
        <Badge variant="outline" className="text-xs">
          <Camera className="h-3 w-3 mr-1" />
          Scanned
        </Badge>
      )}
      {item.source === 'barcode' && (
        <Badge variant="outline" className="text-xs">
          <Barcode className="h-3 w-3 mr-1" />
          Barcode
        </Badge>
      )}
      {item.last_restocked && (
        <span className="text-xs text-muted-foreground">
          Added {new Date(item.last_restocked).toLocaleDateString('en-US', { timeZone: 'UTC' })}
        </span>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handleRemove}
        disabled={isRemoving}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </li>
  );
}