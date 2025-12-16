'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Plus, Camera, Barcode, X, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import PantryScanner from './pantry-scanner';
import BarcodeScanner from './barcode-scanner';
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

interface ScanFabProps {
  subscriptionTier: 'free' | 'pro' | 'premium';
  onPhotoScanComplete: (scanId: string, detectedItems: DetectedItem[], suggestedRecipes: SuggestedRecipe[]) => void;
  onBarcodeScanComplete: (product: ScannedProduct) => void;
  onBarcodeNotFound: (barcode: string) => void;
}

type ScanMode = 'photo' | 'barcode' | null;

export function ScanFab({
  subscriptionTier,
  onPhotoScanComplete,
  onBarcodeScanComplete,
  onBarcodeNotFound,
}: ScanFabProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeScanMode, setActiveScanMode] = useState<ScanMode>(null);

  const isFreeUser = subscriptionTier === 'free';

  const handleFabClick = () => {
    if (isFreeUser) {
      // For free users, show upgrade prompt in sheet
      setActiveScanMode('photo');
      setSheetOpen(true);
      return;
    }
    setIsExpanded(!isExpanded);
  };

  const handleScanOptionClick = (mode: ScanMode) => {
    setActiveScanMode(mode);
    setSheetOpen(true);
    setIsExpanded(false);
  };

  const handleSheetClose = () => {
    setSheetOpen(false);
    // Delay clearing mode for animation
    setTimeout(() => setActiveScanMode(null), 300);
  };

  const handlePhotoScanComplete = (scanId: string, detectedItems: DetectedItem[], suggestedRecipes: SuggestedRecipe[]) => {
    setSheetOpen(false);
    setActiveScanMode(null);
    onPhotoScanComplete(scanId, detectedItems, suggestedRecipes);
  };

  const handleBarcodeScanComplete = (product: ScannedProduct) => {
    setSheetOpen(false);
    setActiveScanMode(null);
    onBarcodeScanComplete(product);
  };

  const handleBarcodeNotFound = (barcode: string) => {
    setSheetOpen(false);
    setActiveScanMode(null);
    onBarcodeNotFound(barcode);
  };

  return (
    <>
      {/* FAB Container - Fixed position */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col-reverse items-end gap-3">
        {/* Speed Dial Options - shown when expanded */}
        {isExpanded && !isFreeUser && (
          <>
            <div
              className="flex items-center gap-2 animate-in slide-in-from-bottom-2 fade-in duration-200"
              style={{ animationDelay: '0ms' }}
            >
              <span className="bg-background/95 backdrop-blur-sm text-sm font-medium px-3 py-1.5 rounded-full shadow-md border">
                Photo Scan
              </span>
              <Button
                size="lg"
                className="h-12 w-12 rounded-full shadow-lg bg-blue-500 hover:bg-blue-600"
                onClick={() => handleScanOptionClick('photo')}
              >
                <Camera className="h-5 w-5" />
              </Button>
            </div>
            <div
              className="flex items-center gap-2 animate-in slide-in-from-bottom-2 fade-in duration-200"
              style={{ animationDelay: '50ms' }}
            >
              <span className="bg-background/95 backdrop-blur-sm text-sm font-medium px-3 py-1.5 rounded-full shadow-md border">
                Barcode
              </span>
              <Button
                size="lg"
                className="h-12 w-12 rounded-full shadow-lg bg-green-500 hover:bg-green-600"
                onClick={() => handleScanOptionClick('barcode')}
              >
                <Barcode className="h-5 w-5" />
              </Button>
            </div>
          </>
        )}

        {/* Main FAB Button */}
        <Button
          size="lg"
          className={cn(
            "h-14 w-14 rounded-full shadow-xl transition-all duration-200",
            isExpanded
              ? "bg-muted hover:bg-muted/80 rotate-45"
              : "bg-primary hover:bg-primary/90"
          )}
          onClick={handleFabClick}
        >
          {isExpanded ? (
            <X className="h-6 w-6" />
          ) : (
            <Plus className="h-6 w-6" />
          )}
        </Button>

        {/* Premium indicator */}
        {subscriptionTier === 'premium' && !isExpanded && (
          <Badge
            className="absolute -top-1 -right-1 h-5 px-1.5 bg-gradient-to-r from-purple-500 to-pink-500 border-0"
          >
            <Sparkles className="h-3 w-3" />
          </Badge>
        )}
      </div>

      {/* Click-away overlay when expanded */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Scanner Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="bottom"
          className="h-[85vh] rounded-t-xl overflow-y-auto"
        >
          <SheetHeader className="mb-4">
            <SheetTitle className="flex items-center gap-2">
              {activeScanMode === 'photo' && (
                <>
                  <Camera className="h-5 w-5 text-blue-500" />
                  Photo Scan
                </>
              )}
              {activeScanMode === 'barcode' && (
                <>
                  <Barcode className="h-5 w-5 text-green-500" />
                  Barcode Scanner
                </>
              )}
            </SheetTitle>
            <SheetDescription>
              {activeScanMode === 'photo'
                ? 'Take a photo of your pantry or fridge to detect items'
                : 'Scan product barcodes to add items with nutrition info'
              }
            </SheetDescription>
          </SheetHeader>

          {/* Scanner Content */}
          <div className="space-y-4 pb-6">
            {activeScanMode === 'photo' && (
              <PantryScanner
                onScanComplete={handlePhotoScanComplete}
                subscriptionTier={subscriptionTier}
              />
            )}
            {activeScanMode === 'barcode' && (
              <BarcodeScanner
                onScanComplete={handleBarcodeScanComplete}
                onNotFound={handleBarcodeNotFound}
                subscriptionTier={subscriptionTier}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
