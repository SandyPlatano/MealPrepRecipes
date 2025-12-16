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
import { Plus, Trash2, Cookie, PackageX, Camera, History, Sparkles, Barcode } from 'lucide-react';
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
import PantryScanner from './pantry-scanner';
import ScanReview from './scan-review';
import ScanHistory from './scan-history';
import BarcodeScanner from './barcode-scanner';
import BarcodeResultReview from './barcode-result-review';
import { PantryScan } from '@/app/actions/pantry-scan';
import { ScannedProduct } from '@/types/barcode';

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
  const [scanMode, setScanMode] = useState<'photo' | 'barcode'>('photo');
  const [barcodeProduct, setBarcodeProduct] = useState<ScannedProduct | null>(null);
  const [showBarcodeReview, setShowBarcodeReview] = useState(false);
  const [manualEntryBarcode, setManualEntryBarcode] = useState<string | null>(null);

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
    setScanData({ scanId, detectedItems, suggestedRecipes });
    setShowScanReview(true);
    setActiveTab('items'); // Switch back to items tab to show review
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
    setBarcodeProduct(product);
    setShowBarcodeReview(true);
    setManualEntryBarcode(null);
  };

  const handleBarcodeNotFound = (barcode: string) => {
    // Store barcode for manual entry prefill
    setManualEntryBarcode(barcode);
    setBarcodeProduct(null);
    setShowBarcodeReview(false);
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

  const getScannerBadge = () => {
    if (subscriptionTier === 'premium') {
      return (
        <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-pink-500">
          <Sparkles className="h-3 w-3 mr-1" />
          Premium
        </Badge>
      );
    } else if (subscriptionTier === 'pro') {
      return (
        <Badge variant="secondary">
          <Camera className="h-3 w-3 mr-1" />
          Pro
        </Badge>
      );
    }
    return null;
  };

  // Show barcode result review
  if (showBarcodeReview && barcodeProduct) {
    return (
      <div className="space-y-6">
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
      <div className="space-y-6">
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
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="items">
            <Cookie className="h-4 w-4 mr-2" />
            Pantry Items
          </TabsTrigger>
          <TabsTrigger value="scan" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Smart Scan
            {getScannerBadge()}
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-6">
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
                <div className="max-w-sm mx-auto space-y-4">
                  <div className="text-5xl">
                    <Cookie className="h-12 w-12 mx-auto text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-lg font-medium">Your pantry is empty</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Add items you always have on hand or use the Smart Scan feature to detect items from a photo.
                    </p>
                  </div>
                  {subscriptionTier !== 'free' && (
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab('scan')}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Try Smart Scan
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
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

        <TabsContent value="scan" className="space-y-6">
          {/* Scan Mode Toggle */}
          <div className="flex justify-center">
            <div className="inline-flex rounded-lg border p-1 bg-muted/50">
              <Button
                variant={scanMode === 'photo' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setScanMode('photo')}
                className="gap-2"
              >
                <Camera className="h-4 w-4" />
                Photo Scan
              </Button>
              <Button
                variant={scanMode === 'barcode' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setScanMode('barcode')}
                className="gap-2"
              >
                <Barcode className="h-4 w-4" />
                Barcode
              </Button>
            </div>
          </div>

          {/* Conditional Scanner Rendering */}
          {scanMode === 'photo' ? (
            <PantryScanner
              onScanComplete={handleScanComplete}
              subscriptionTier={subscriptionTier}
            />
          ) : (
            <BarcodeScanner
              onScanComplete={handleBarcodeScanComplete}
              onNotFound={handleBarcodeNotFound}
              subscriptionTier={subscriptionTier}
            />
          )}

          {/* Manual Entry Fallback for Not Found Barcodes */}
          {scanMode === 'barcode' && manualEntryBarcode && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Product Not Found</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Barcode <span className="font-mono">{manualEntryBarcode}</span> was not found in the database.
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
                  className="flex gap-2"
                >
                  <Input
                    name="name"
                    placeholder="Enter product name..."
                    className="flex-1"
                    autoFocus
                  />
                  <Select name="category" defaultValue="Other">
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
                  <Button type="submit">
                    <Plus className="h-4 w-4" />
                  </Button>
                </form>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setManualEntryBarcode(null)}
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Feature Cards */}
          {subscriptionTier !== 'free' && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{scanMode === 'photo' ? '🎯' : '📊'}</div>
                  <h3 className="font-semibold mt-2">
                    {scanMode === 'photo' ? 'Accurate Detection' : 'Nutrition Info'}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {scanMode === 'photo'
                      ? 'AI-powered recognition with 80%+ accuracy'
                      : 'View calories, protein, carbs & more'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">♻️</div>
                  <h3 className="font-semibold mt-2">Reduce Waste</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Never buy duplicates of what you already have
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{scanMode === 'photo' ? '🍳' : '⚡'}</div>
                  <h3 className="font-semibold mt-2">
                    {scanMode === 'photo' ? 'Recipe Suggestions' : 'Quick Add'}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {scanMode === 'photo'
                      ? 'Get recipes based on what\'s in your pantry'
                      : 'Scan barcodes to instantly add products'}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <ScanHistory onReuseScan={handleReuseScan} />
        </TabsContent>
      </Tabs>
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
        <ul className="space-y-2">
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